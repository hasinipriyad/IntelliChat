import { useState, useEffect } from "react";
import toast from "react-hot-toast";
import axios from "axios";
import type { Chat, Message } from "../types/chat";
import ChatSidebar from "../components/ChatSideBar";
import MessageView from "../components/MessageView";
import MessageInput from "../components/MessageInput";
import ThemeToggle from "../components/ThemeToggle";
import {
  getChats,
  getChatMessages,
  createChat,
  sendMessage,
  renameChat,
  deleteChat,
} from "../api/chatService";

export default function ChatPage() {
  // --- Chat State ---
  const [chats, setChats] = useState<Chat[]>([]);
  const [activeChatId, setActiveChatId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);

  const [loadingChats, setLoadingChats] = useState(true);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [sending, setSending] = useState(false); // "thinking…" flag

  // --- Load all chats on mount ---
  useEffect(() => {
    async function loadChats() {
      try {
        const { chats } = await getChats();
        setChats(chats);
      } catch (error) {
        toast.error("Failed to load chats.");
      } finally {
        setLoadingChats(false);
      }
    }
    loadChats();
  }, []);

  // --- Select a chat and load its messages ---
  async function selectChat(chatId: string) {
    if (chatId === activeChatId) return; // already open
    setActiveChatId(chatId);
    setLoadingMessages(true);
    setMessages([]); // clear old messages while loading
    try {
      const { messages } = await getChatMessages(chatId);
      setMessages(messages);
    } catch (error) {
      toast.error("Failed to load messages.");
    } finally {
      setLoadingMessages(false);
    }
  }

  // --- Create a new chat ---
  async function handleNewChat() {
    try {
      const { chat } = await createChat();
      setChats((prev) => [chat, ...prev]); // prepend (newest first)
      setActiveChatId(chat._id);
      setMessages([]); // brand new chat, no messages
    } catch (error) {
      toast.error("Failed to create chat.");
    }
  }

  // --- Send a message in the active chat ---
  async function handleSend(content: string) {
    if (!activeChatId || !content.trim()) return;
    setSending(true);
    try {
      const { userMessage, modelMessage } = await sendMessage(activeChatId, {
        content,
      });
      // Append both the user's message and the model's reply
      setMessages((prev) => [...prev, userMessage, modelMessage]);
      // Bump this chat to the top of the sidebar (its updatedAt changed)
      setChats((prev) => {
        const target = prev.find((c) => c._id === activeChatId);
        if (!target) return prev;
        const rest = prev.filter((c) => c._id !== activeChatId);
        return [target, ...rest];
      });
    } catch (error) {
      if (axios.isAxiosError(error)) {
        toast.error(error.response?.data?.message ?? "Failed to send message.");
      } else {
        toast.error("Something went wrong.");
      }
    } finally {
      setSending(false);
    }
  }

  // --- Rename a chat ---
  async function handleRename(chatId: string, title: string) {
    try {
      const { chat } = await renameChat(chatId, { title });
      setChats((prev) => prev.map((c) => (c._id === chatId ? chat : c)));
    } catch (error) {
      toast.error("Failed to rename chat.");
    }
  }

  // --- Delete a chat ---
  async function handleDelete(chatId: string) {
    try {
      await deleteChat(chatId);
      setChats((prev) => prev.filter((c) => c._id !== chatId));
      // If we deleted the open chat, clear the view
      if (chatId === activeChatId) {
        setActiveChatId(null);
        setMessages([]);
      }
    } catch (error) {
      toast.error("Failed to delete chat.");
    }
  }

  // --- Layout shell (real components slot in next steps) ---
  return (
    <div className="flex h-screen bg-bg text-text">
      {/* Sidebar goes here (Step 4) */}
      <ChatSidebar
        chats={chats}
        activeChatId={activeChatId}
        loadingChats={loadingChats}
        onSelect={selectChat}
        onNewChat={handleNewChat}
        onRename={handleRename}
        onDelete={handleDelete}
      />

      <main className="flex-1 flex flex-col">
        {/* Header bar with theme toggle */}
        <div className="flex items-center justify-end border-b border-border px-4 py-2">
          <ThemeToggle />
        </div>

        <MessageView
          messages={messages}
          activeChatId={activeChatId}
          loadingMessages={loadingMessages}
          sending={sending}
        />

        {/* Only show the input when a chat is open */}
        {activeChatId && (
          <MessageInput onSend={handleSend} disabled={sending} />
        )}
      </main>
    </div>
  );
}
