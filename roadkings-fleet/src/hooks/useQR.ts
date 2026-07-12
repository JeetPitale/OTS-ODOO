import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api-client";

export function useDriverQRs() {
  return useQuery({
    queryKey: ["qr", "drivers"],
    queryFn: () => api.get<Record<string, string>>("/api/qr/drivers"),
  });
}

export function useGenerateDriverQR() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: { driverId: string; driverName: string }) => api.post("/api/qr/drivers", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["qr", "drivers"] });
    },
  });
}

export function useDispatchQRs() {
  return useQuery({
    queryKey: ["qr", "dispatches"],
    queryFn: () => api.get<Record<string, string>>("/api/qr/dispatches"),
  });
}

export function useQRScanLogs() {
  return useQuery({
    queryKey: ["qr", "scan-logs"],
    queryFn: () => api.get<any[]>("/api/qr/scan-logs"),
  });
}

export function useLogQRScan() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: { driverId: string; driverName: string; success: boolean; message: string }) => 
      api.post("/api/qr/scan-logs", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["qr", "scan-logs"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard"] });
    },
  });
}
