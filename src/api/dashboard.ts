// src/api/dashboard.ts
import { apiClient } from "./client";

export interface DashboardSummary {
  // Hoy
  entriesToday: number;
  paymentsTodayAmount: number;
  newClientsToday: number;

  // Generales
  activeClients: number;
  expiringMembershipsNext7Days: number;

  // Mes
  paymentsThisMonthAmount: number;
}

export async function getDashboardSummary(): Promise<DashboardSummary> {
  const response = await apiClient.get<DashboardSummary>("/dashboard/summary");
  return response.data;
}