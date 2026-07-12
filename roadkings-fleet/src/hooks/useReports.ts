import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api-client";

interface ReportsData {
  revenueData: Array<{ month: string; revenue: number; trips: number }>;
  routePerformance: Array<{ route: string; trips: number; revenue: number; onTime: number }>;
  incidentData: Array<{ subject: string; A: number; fullMark: number }>;
}

export function useReports() {
  return useQuery({
    queryKey: ["reports"],
    queryFn: () => api.get<ReportsData>("/api/reports"),
  });
}
