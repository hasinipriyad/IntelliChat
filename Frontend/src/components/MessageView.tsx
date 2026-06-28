import { useEffect, useRef } from "react";
import type { Message } from "../types/chat";
import ReactMarkdown from "react-markdown";
import { FaCircle } from "react-icons/fa";

interface MessageViewProps {
  messages: Message[];
  activeChatId: string | null;
  loadingMessages: boolean;
  sending: boolean;
}

export default function MessageView({
  messages,
  activeChatId,
  loadingMessages,
  sending,
}: MessageViewProps) {
  const bottomRef = useRef<HTMLDivElement>(null);

  // Scroll to bottom whenever messages change or a reply is in flight
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, sending]);

  // No chat selected yet
  if (!activeChatId) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <p className="text-text-muted">
          Select a chat or create a new one to start.
        </p>
      </div>
    );
  }

  // Loading this chat's messages
  if (loadingMessages) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <p className="text-text-muted">Loading messages…</p>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto">
      <div className="max-w-3xl mx-auto px-4 py-4 space-y-4">
        {/* Empty chat */}
        {messages.length === 0 && !sending && (
          <div className="flex h-full items-center justify-center">
            <p className="text-text-muted">No messages yet. Say hello!</p>
          </div>
        )}

        {/* The conversation */}
        {messages.map((msg) => {
          const isUser = msg.role === "user";
          return (
            <div
              key={msg._id}
              className={`flex ${isUser ? "justify-end" : "justify-start"}`}
            >
              <div
                className={`max-w-[75%] rounded-2xl px-4 py-2 text-sm wrap-break-word ${
                  isUser
                    ? "bg-primary text-white rounded-br-sm whitespace-pre-wrap"
                    : "bg-surface text-text border border-border rounded-bl-sm"
                }`}
              >
                {isUser ? (
                  msg.content
                ) : (
                  <div className="markdown-body">
                    <ReactMarkdown>{msg.content}</ReactMarkdown>
                  </div>
                )}
              </div>
            </div>
          );
        })}

        {/* "Thinking…" bubble while waiting for Gemini */}
        {sending && (
          <div className="flex justify-start">
            <div className="max-w-[75%] rounded-2xl px-4 py-2 bg-surface text-text-muted border border-border rounded-bl-sm">
              <span className="inline-flex items-center gap-1">
                <FaCircle size={6} className="animate-bounce" />
                <FaCircle
                  size={6}
                  className="animate-bounce [animation-delay:0.15s]"
                />
                <FaCircle
                  size={6}
                  className="animate-bounce [animation-delay:0.3s]"
                />
              </span>
            </div>
          </div>
        )}

        {/* Scroll anchor */}
        <div ref={bottomRef} />
      </div>
    </div>
  );
}
