
import { apiClient } from "./client";

export interface GymUser {
  id: number;
  name: string;
  email: string;
  phone?: string;
}
export interface CreateClientRequest {
  name: string;
  email: string | null;
  phone: string | null;
  password: string | null;
}

export async function createClient(body: CreateClientRequest) {
  const { data } = await apiClient.post("/auth/register", body);
  return data;
}

export async function getUsers(): Promise<GymUser[]> {
  const response = await apiClient.get<GymUser[]>("/users");
  return response.data;
}