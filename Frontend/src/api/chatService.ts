import api from "./axios";
import type {
  CreateChatPayload,
  SendMessagePayload,
  RenameChatPayload,
  GetChatsResponse,
  CreateChatResponse,
  GetChatMessagesResponse,
  SendMessageResponse,
  RenameChatResponse,
} from "../types/chat";

// POST /chats
export async function createChat(
  payload: CreateChatPayload = {},
): Promise<CreateChatResponse> {
  const { data } = await api.post<CreateChatResponse>("/chats", payload);
  return data;
}

// GET /chats
export async function getChats(): Promise<GetChatsResponse> {
  const { data } = await api.get<GetChatsResponse>("/chats");
  return data;
}

// GET /chats/:chatId/messages
export async function getChatMessages(
  chatId: string,
): Promise<GetChatMessagesResponse> {
  const { data } = await api.get<GetChatMessagesResponse>(
    `/chats/${chatId}/messages`,
  );
  return data;
}

// POST /chats/:chatId/messages
export async function sendMessage(
  chatId: string,
  payload: SendMessagePayload,
): Promise<SendMessageResponse> {
  const { data } = await api.post<SendMessageResponse>(
    `/chats/${chatId}/messages`,
    payload,
  );
  return data;
}

// PATCH /chats/:chatId
export async function renameChat(
  chatId: string,
  payload: RenameChatPayload,
): Promise<RenameChatResponse> {
  const { data } = await api.patch<RenameChatResponse>(
    `/chats/${chatId}`,
    payload,
  );
  return data;
}

// DELETE /chats/:chatId
export async function deleteChat(chatId: string): Promise<{ message: string }> {
  const { data } = await api.delete<{ message: string }>(`/chats/${chatId}`);
  return data;
}
