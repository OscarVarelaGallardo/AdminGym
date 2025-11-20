import { apiClient } from "./client";

export interface LoginRequest {
  email: string;
  password: string;
}

export interface AuthUser {
  id: number;
  name: string;
  email: string;
}

export async function login(request: LoginRequest): Promise<AuthUser> {
  const response = await apiClient.post<AuthUser>("/auth/login", request);
  return response.data;
}