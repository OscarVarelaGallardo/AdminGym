// src/api/memberships.ts
import { apiClient } from "./client";

export interface Membership {
  id: number;
  name: string;
  description?: string;
  durationDays: number;
  price: number;
}

export interface CreateMembershipRequest {
  name: string;
  description?: string;
  durationDays: number;
  price: number;
}

export async function getMemberships(): Promise<Membership[]> {
  const response = await apiClient.get<Membership[]>("/memberships");
  return response.data;
}

export async function createMembership(
  payload: CreateMembershipRequest
): Promise<Membership> {
  const response = await apiClient.post<Membership>("/memberships", payload);
  return response.data;
}