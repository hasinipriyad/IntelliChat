import { useState } from "react";
import { FiSend } from "react-icons/fi";

interface MessageInputProps {
  onSend: (content: string) => void;
  disabled: boolean; // true while a reply is in flight
}

export default function MessageInput({ onSend, disabled }: MessageInputProps) {
  const [text, setText] = useState("");

  function handleSubmit() {
    const trimmed = text.trim();
    if (!trimmed || disabled) return;
    onSend(trimmed);
    setText(""); // clear immediately
  }

  return (
    <div className="border-t border-border p-3">
      <div className="max-w-3xl mx-auto">
        <div className="flex items-end gap-2">
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={(e) => {
              // Enter sends; Shift+Enter makes a newline
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                handleSubmit();
              }
            }}
            placeholder="Type a message…"
            rows={1}
            className="flex-1 resize-none bg-bg border border-border rounded-lg px-3 py-2 text-sm text-text outline-none focus:border-primary max-h-32"
          />
          <button
            onClick={handleSubmit}
            disabled={disabled || !text.trim()}
            className="p-2 rounded-lg bg-primary text-white hover:opacity-90 transition disabled:opacity-40 disabled:cursor-not-allowed"
            title="Send"
          >
            <FiSend size={18} />
          </button>
        </div>
      </div>
    </div>
  );
}
