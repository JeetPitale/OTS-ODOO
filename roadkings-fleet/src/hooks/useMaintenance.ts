import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api-client";
import { CreateMaintenanceInput, UpdateMaintenanceInput } from "@/lib/validators";
import { PaginatedResponse } from "@/lib/api-response";

interface MaintenanceRecord {
  id: string;
  maintenanceId: string;
  vehicleId: string;
  vehicle: string;
  type: "Preventive" | "Corrective";
  description: string;
  status: "scheduled" | "in_maintenance" | "completed";
  priority: "Critical" | "High" | "Medium" | "Low";
  scheduledDate: string;
  completedDate: string;
  cost: string;
  technician: string;
}

export function useMaintenanceRecords(params?: { page?: number; limit?: number; search?: string; sortBy?: string; sortOrder?: string }) {
  return useQuery({
    queryKey: ["maintenance", params],
    queryFn: () => api.get<PaginatedResponse<MaintenanceRecord>>("/api/maintenance", params as Record<string, string | number>),
  });
}

export function useMaintenanceRecord(id: string) {
  return useQuery({
    queryKey: ["maintenance", id],
    queryFn: () => api.get<MaintenanceRecord>(`/api/maintenance/${id}`),
    enabled: !!id,
  });
}

export function useCreateMaintenance() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateMaintenanceInput) => api.post<MaintenanceRecord>("/api/maintenance", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["maintenance"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard"] });
    },
  });
}

export function useUpdateMaintenance() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateMaintenanceInput }) => 
      api.put<MaintenanceRecord>(`/api/maintenance/${id}`, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["maintenance"] });
      queryClient.invalidateQueries({ queryKey: ["maintenance", variables.id] });
    },
  });
}

export function useDeleteMaintenance() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.delete(`/api/maintenance/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["maintenance"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard"] });
    },
  });
}
