// src/api/subscriptions.ts
import { apiClient } from "./client";
import { Membership } from "./memberships";

export type SubscriptionStatus = "ACTIVE" | "EXPIRED" | "CANCELLED";

export interface UserMembership {
  id: number;
  user: {
    id: number;
    name: string;
    email: string;
  };
  membership: Membership;
  startDate: string; // ISO date
  endDate: string;   // ISO date
  autoRenew: boolean;
  status: SubscriptionStatus;
}

export interface AssignMembershipRequest {
  userId: number;
  membershipId: number;
  autoRenew?: boolean;
}

export async function assignMembership(
  payload: AssignMembershipRequest
): Promise<UserMembership> {
  const response = await apiClient.post<UserMembership>("/subscriptions", payload);
  return response.data;
}

export async function getCurrentMembershipForUser(
  userId: number
): Promise<UserMembership> {
  const response = await apiClient.get<UserMembership>(
    `/subscriptions/user/${userId}/current`
  );
  return response.data;
}