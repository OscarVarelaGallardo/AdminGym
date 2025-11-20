// src/api/gym.ts
import { apiClient } from "./client";

export interface GymInfo {
  id: number;
  name: string;
  address: string;
  schedule: string;
  phone: string;
  logoUrl: string;
}

export interface UpdateGymInfoRequest {
  name: string;
  address: string;
  schedule: string;
  phone: string;
  logoUrl: string;
  gymId: number;
}
export interface CreateGymInfoRequest {
  name: string;
  address: string;
  schedule: string;
  phone: string;
  logoUrl: string;
  userId: number;
}

// GET /api/gym/info  (ajusta al endpoint que tengas)
export async function getGymInfo(userId: number): Promise<GymInfo | null> {
  const { data } = await apiClient.get<GymInfo[]>(`/gym/info`, {
    params: { userId },
  });

  // si quieres quedarte solo con el primero
  return data[0] ?? null;
}

//POST /api/gym/info  (ajusta al endpoint que tengas)
export async function createGymInfo(body: CreateGymInfoRequest): Promise<GymInfo> {
  const { data } = await apiClient.post("/gym/info", body);
  return data;
}

// PUT /api/gym/info
export async function updateGymInfo(

  body: UpdateGymInfoRequest
): Promise<GymInfo> {
  const { data } = await apiClient.put('/gym/info', body);
  return data;
}