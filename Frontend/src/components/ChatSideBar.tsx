import { useState } from "react";
import { FiPlus, FiEdit2, FiTrash2, FiLogOut } from "react-icons/fi";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import type { Chat } from "../types/chat";

interface ChatSidebarProps {
  chats: Chat[];
  activeChatId: string | null;
  loadingChats: boolean;
  onSelect: (chatId: string) => void;
  onNewChat: () => void;
  onRename: (chatId: string, title: string) => void;
  onDelete: (chatId: string) => void;
}

export default function ChatSidebar({
  chats,
  activeChatId,
  loadingChats,
  onSelect,
  onNewChat,
  onRename,
  onDelete,
}: ChatSidebarProps) {
  const { logout } = useAuth();
  const navigate = useNavigate();
  // Track which chat is being renamed, and the working title text
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState("");

  function startEditing(chat: Chat) {
    setEditingId(chat._id);
    setEditTitle(chat.title);
  }

  function commitRename(chatId: string) {
    const trimmed = editTitle.trim();
    if (trimmed) {
      onRename(chatId, trimmed);
    }
    setEditingId(null);
    setEditTitle("");
  }

  async function handleLogout() {
    try {
      await logout();
      navigate("/login");
    } catch {
      // logout failing is rare; even if it does, the context clears locally
      navigate("/login");
    }
  }

  return (
    <aside className="w-64 flex flex-col border-r border-border bg-surface">
      {/* App title */}

      <h1 className="text-2xl font-bold px-5 py-4">
        <span className="text-primary">Intelli</span>
        <span className="text-text">Chat</span>
      </h1>
      {/* New Chat button */}
      <div className="p-3 border-b border-border">
        <button
          onClick={onNewChat}
          className="w-full flex items-center justify-center gap-2 py-2 px-3 rounded-md bg-primary text-white text-sm font-medium hover:opacity-90 transition"
        >
          <FiPlus size={16} />
          New Chat
        </button>
      </div>

      {/* Chat list */}
      <div className="flex-1 overflow-y-auto">
        {loadingChats ? (
          <p className="p-4 text-sm text-text-muted">Loading chats…</p>
        ) : chats.length === 0 ? (
          <p className="p-4 text-sm text-text-muted">
            No chats yet. Create one!
          </p>
        ) : (
          chats.map((chat) => {
            const isActive = chat._id === activeChatId;
            const isEditing = chat._id === editingId;

            return (
              <div
                key={chat._id}
                onClick={() => !isEditing && onSelect(chat._id)}
                className={`group flex items-center gap-2 px-3 py-2 cursor-pointer border-b border-border/50 ${
                  isActive ? "bg-bg" : "hover:bg-bg/50"
                }`}
              >
                {isEditing ? (
                  <input
                    autoFocus
                    value={editTitle}
                    onChange={(e) => setEditTitle(e.target.value)}
                    onBlur={() => commitRename(chat._id)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") commitRename(chat._id);
                      if (e.key === "Escape") {
                        setEditingId(null);
                        setEditTitle("");
                      }
                    }}
                    onClick={(e) => e.stopPropagation()}
                    className="flex-1 bg-bg border border-border rounded px-2 py-1 text-sm text-text outline-none focus:border-primary"
                  />
                ) : (
                  <>
                    <span className="flex-1 truncate text-sm text-text">
                      {chat.title}
                    </span>

                    {/* Action buttons — appear on hover */}
                    <div className="hidden group-hover:flex items-center gap-1">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          startEditing(chat);
                        }}
                        className="text-text-muted hover:text-text p-1"
                        title="Rename"
                      >
                        <FiEdit2 size={14} />
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          if (confirm(`Delete "${chat.title}"?`)) {
                            onDelete(chat._id);
                          }
                        }}
                        className="text-text-muted hover:text-red-500 p-1"
                        title="Delete"
                      >
                        <FiTrash2 size={14} />
                      </button>
                    </div>
                  </>
                )}
              </div>
            );
          })
        )}
      </div>
      {/* Footer — logout */}
      <div className="p-3 border-t border-border">
        <button
          onClick={handleLogout}
          className="w-full flex items-center justify-center gap-2 py-2 px-3 rounded-md text-sm text-text-muted hover:text-text hover:bg-bg transition"
        >
          <FiLogOut size={16} />
          Log Out
        </button>
      </div>
    </aside>
  );
}
