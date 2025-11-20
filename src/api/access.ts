// src/api/access.ts
import { apiClient } from "./client";

export type AccessType = "ENTRY" | "EXIT";

export interface AccessLog {
  id: number;
  accessTime: string; // ISO
  type: AccessType;
  source?: string;
}

export interface RegisterAccessRequest {
  userId: number;
  type: AccessType;
  source?: string;
}

export async function registerAccess(
  request: RegisterAccessRequest
): Promise<AccessLog> {
  const response = await apiClient.post<AccessLog>("/access", request);
  return response.data;
}

export async function getUserAccessLogs(userId: number): Promise<AccessLog[]> {
  const response = await apiClient.get<AccessLog[]>(`/access/user/${userId}`);
  return response.data;
}