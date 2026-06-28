import express from "express";
import * as chatController from "../controllers/chatController.js";
import { authMiddleware } from "../middleware/authMiddleware.js";

const chatRouter = express.Router();

// All chat routes require authentication
chatRouter.use(authMiddleware);

//Create a new chat
// POST /api/chats
chatRouter.post("/", chatController.createChatController);

// Get all chats for the authenticated user
// GET /api/chats
chatRouter.get("/", chatController.getChatsController);

// Get all messages for a specific chat (oldest first)
// GET /api/chats/:chatId/messages
chatRouter.get("/:chatId/messages", chatController.getChatMessagesController);

// Send a new message in a specific chat
// POST /api/chats/:chatId/messages
chatRouter.post("/:chatId/messages", chatController.sendMessageController);

// Rename a specific chat
// PATCH /api/chats/:chatId
chatRouter.patch("/:chatId", chatController.renameChatController);

// Delete a specific chat
// DELETE /api/chats/:chatId
chatRouter.delete("/:chatId", chatController.deleteChatController);

export default chatRouter;
