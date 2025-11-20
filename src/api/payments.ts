// src/api/payments.ts
import { apiClient } from "./client";

export type PaymentMethod = "CASH" | "CARD" | "TRANSFER" | "OTHER";

export interface Payment {
  id: number;
  userId: number;
  userMembershipId?: number | null;
  amount: number;
  method: PaymentMethod;
  reference?: string | null;
  paymentDate: string; // ISO
  createdAt: string; // ISO
}

export interface CreatePaymentRequest {
  userId: number;
  userMembershipId?: number | null;
  amount: number;
  method: PaymentMethod;
  reference?: string;
}

export async function createPayment(
  payload: CreatePaymentRequest
): Promise<Payment> {
  const response = await apiClient.post<Payment>("/payments", payload);
  return response.data;
}

export async function getPaymentsByUser(userId: number): Promise<Payment[]> {
  const response = await apiClient.get<Payment[]>(`/payments/user/${userId}`);
  return response.data;
}