import api from "./axios";
import { getRefreshToken } from "./axios";
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
  const { data } = await api.post<AuthResponse>("/auth/register", payload);
  return data;
}

// POST /auth/login
export async function loginUser(payload: LoginPayload): Promise<AuthResponse> {
  const { data } = await api.post<AuthResponse>("/auth/login", payload);
  return data;
}

// POST /auth/refresh-token
export async function refreshToken(
  token?: string,
): Promise<{ accessToken: string }> {
  const storedToken = token ?? getRefreshToken();
  const { data } = await api.post<{ accessToken: string }>("/auth/refresh-token", {
    refreshToken: storedToken,
  });
  return data;
}

// POST /auth/logout — sends refresh token in body for mobile compatibility
export async function logoutUser(): Promise<{ message: string }> {
  const storedRefreshToken = getRefreshToken();
  const { data } = await api.post<{ message: string }>("/auth/logout", {
    refreshToken: storedRefreshToken,
  });
  return data;
}

// GET /auth/get-me
export async function getMe(): Promise<GetMeResponse> {
  const { data } = await api.get<GetMeResponse>("/auth/get-me");
  return data;
}
