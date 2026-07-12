import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api-client";

interface DashboardData {
  kpis: {
    totalVehicles: number;
    activeTrips: number;
    activeDrivers: number;
    dispatchesToday: number;
    activeDispatches: number;
    completedDispatches: number;
    scansToday: number;
    mtdFuelCost: string;
  };
  fleetStatus: Array<{ name: string; value: number; color: string }>;
  activeAlerts: Array<{
    id: string;
    notifId: string;
    title: string;
    message: string;
    timestamp: string;
    type: string;
    read: boolean;
  }>;
  recentTrips: Array<{
    id: string;
    tripId: string;
    origin: string;
    destination: string;
    driver: string;
    vehicle: string;
    status: string;
    eta: string;
  }>;
}

export function useDashboard() {
  return useQuery({
    queryKey: ["dashboard"],
    queryFn: () => api.get<DashboardData>("/api/dashboard"),
    refetchInterval: 30000, // Refresh every 30s
  });
}
