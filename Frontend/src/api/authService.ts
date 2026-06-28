import api from "./axios";
import type {
  RegisterPayload,
  LoginPayload,
  AuthResponse,
  GetMeResponse,
} from "../types/auth";

// POST /auth/register
export async function registerUser(
  payload: RegisterPayload,
): Promise<AuthResponse> {
  const data = await api.post<AuthResponse>("/auth/register", payload);
  return data.data;
}

// POST /auth/login
export async function loginUser(payload: LoginPayload): Promise<AuthResponse> {
  const { data } = await api.post<AuthResponse>("/auth/login", payload);
  return data;
}

// POST /auth/logout
export async function logoutUser(): Promise<{ message: string }> {
  const { data } = await api.post<{ message: string }>("/auth/logout");
  return data;
}

// GET /auth/get-me
export async function getMe(): Promise<GetMeResponse> {
  const { data } = await api.get<GetMeResponse>("/auth/get-me");
  return data;
}
