import { Request, Response } from "express";
import { GoogleGenAI } from "@google/genai";
import Chat from "../models/chatModel.js";
import Message from "../models/messageModel.js";

interface AuthRequest extends Request {
  userId?: string;
}

if (!process.env.GEMINI_API_KEY) {
  throw new Error("GEMINI_API_KEY is not defined in the environment variables");
}

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

/**
 * @name CreateChat
 * @desc Creates a new chat for the authenticated user.
 * @access Private
 */
export async function createChatController(req: AuthRequest, res: Response) {
  try {
    const userId = req.userId;
    const { title } = req.body;

    const newChat = await Chat.create({
      user: userId,
      title: title || "New Chat",
    });

    return res.status(201).json({ chat: newChat });
  } catch (error) {
    console.error("CreateChat error:", error);
    return res.status(500).json({ message: "Server error" });
  }
}

/**
 * @name GetChats
 * @desc Retrieves all chats for the authenticated user.
 * @access Private
 */
export async function getChatsController(req: AuthRequest, res: Response) {
  try {
    const userId = req.userId;

    const chats = await Chat.find({ user: userId }).sort({ updatedAt: -1 });

    return res.status(200).json({ chats });
  } catch (error) {
    console.error("GetChats error:", error);
    return res.status(500).json({ message: "Server error" });
  }
}

/**
 * @name GetChatMessages
 * @desc Retrieves all messages for a specific chat (oldest first).
 * @access Private
 */
export async function getChatMessagesController(
  req: AuthRequest,
  res: Response,
) {
  try {
    const userId = req.userId;
    const { chatId } = req.params as { chatId: string };

    // Verify the chat belongs to the user
    const chat = await Chat.findOne({ _id: chatId, user: userId });
    if (!chat) {
      return res.status(404).json({ message: "Chat not found." });
    }

    const messages = await Message.find({ chatId }).sort({ createdAt: 1 });

    return res.status(200).json({ messages });
  } catch (error) {
    console.error("GetChatMessages error:", error);
    return res.status(500).json({ message: "Server error" });
  }
}

/**
 * @name SendMessage
 * @desc Saves a user message, generates a Gemini reply, saves and returns it.
 * @access Private
 */
export async function sendMessageController(req: AuthRequest, res: Response) {
  try {
    const userId = req.userId;
    const { chatId } = req.params as { chatId: string };
    const { content } = req.body;

    if (!content || !content.trim()) {
      return res.status(400).json({ message: "Message content is required." });
    }

    // Verify the chat belongs to the user
    const chat = await Chat.findOne({ _id: chatId, user: userId });
    if (!chat) {
      return res.status(404).json({ message: "Chat not found." });
    }

    // Save the user's message
    const userMessage = await Message.create({
      chatId,
      role: "user",
      content: content.trim(),
    });

    // Load conversation history (oldest first) for context
    const history = await Message.find({ chatId }).sort({ createdAt: 1 });

    const geminiHistory = history.map((msg) => ({
      role: msg.role === "user" ? "user" : "model",
      parts: [{ text: msg.content }],
    }));

    // Generate the model reply
    const result = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: geminiHistory,
    });

    const replyText = result.text;

    if (!replyText) {
      return res.status(502).json({ message: "Model returned no response." });
    }

    // Save the model's reply
    const modelMessage = await Message.create({
      chatId,
      role: "model",
      content: replyText,
    });

    // Bump the chat's updatedAt so it sorts to the top of the list
    await Chat.updateOne({ _id: chatId }, { $set: { updatedAt: new Date() } });

    return res.status(201).json({
      userMessage,
      modelMessage,
    });
  } catch (error) {
    console.error("SendMessage error:", error);
    return res.status(500).json({ message: "Server error" });
  }
}

/**
 * @name RenameChat
 * @desc Updates a chat's title.
 * @access Private
 */
export async function renameChatController(req: AuthRequest, res: Response) {
  try {
    const userId = req.userId;
    const { chatId } = req.params as { chatId: string };
    const { title } = req.body;

    if (!title || !title.trim()) {
      return res.status(400).json({ message: "Title is required." });
    }

    const chat = await Chat.findOneAndUpdate(
      { _id: chatId, user: userId },
      { title: title.trim() },
      { new: true },
    );

    if (!chat) {
      return res.status(404).json({ message: "Chat not found." });
    }

    return res.status(200).json({ chat });
  } catch (error) {
    console.error("RenameChat error:", error);
    return res.status(500).json({ message: "Server error" });
  }
}

/**
 * @name DeleteChat
 * @desc Deletes a chat and all of its messages.
 * @access Private
 */
export async function deleteChatController(req: AuthRequest, res: Response) {
  try {
    const userId = req.userId;
    const { chatId } = req.params as { chatId: string };

    const chat = await Chat.findOneAndDelete({ _id: chatId, user: userId });

    if (!chat) {
      return res.status(404).json({ message: "Chat not found." });
    }

    // Clean up orphaned messages
    await Message.deleteMany({ chatId });

    return res.status(200).json({ message: "Chat deleted." });
  } catch (error) {
    console.error("DeleteChat error:", error);
    return res.status(500).json({ message: "Server error" });
  }
}
