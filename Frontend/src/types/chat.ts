// A single chat (conversation)
export interface Chat {
  _id: string;
  title: string;
  createdAt: string;
  updatedAt: string;
}

// A single message within a chat
export interface Message {
  _id: string;
  chatId: string;
  role: "user" | "model";
  content: string;
  createdAt: string;
}

// --- Request payloads ---

export interface CreateChatPayload {
  title?: string; // optional; backend defaults to "New Chat"
}

export interface SendMessagePayload {
  content: string;
}

export interface RenameChatPayload {
  title: string;
}

// --- Response shapes  ---

export interface GetChatsResponse {
  chats: Chat[];
}

export interface CreateChatResponse {
  chat: Chat;
}

export interface GetChatMessagesResponse {
  messages: Message[];
}

export interface SendMessageResponse {
  userMessage: Message;
  modelMessage: Message;
}

export interface RenameChatResponse {
  chat: Chat;
}
