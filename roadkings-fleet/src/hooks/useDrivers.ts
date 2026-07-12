import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api-client";
import { CreateDriverInput, UpdateDriverInput } from "@/lib/validators";
import { PaginatedResponse } from "@/lib/api-response";

interface Driver {
  id: string;
  driverId: string;
  name: string;
  license: string;
  phone: string;
  status: "available" | "on_trip" | "off_duty" | "suspended";
  safetyScore: number;
  totalTrips: number;
  incidents: number;
  vehicle: string;
  licenseCategory?: string;
  licenseExpiry?: string;
  photoUrl?: string;
}

export function useDrivers(params?: { page?: number; limit?: number; search?: string; status?: string }) {
  return useQuery({
    queryKey: ["drivers", params],
    queryFn: () => api.get<PaginatedResponse<Driver>>("/api/drivers", params as Record<string, string | number>),
  });
}

export function useDriver(id: string) {
  return useQuery({
    queryKey: ["driver", id],
    queryFn: () => api.get<Driver>(`/api/drivers/${id}`),
    enabled: !!id,
  });
}

export function useCreateDriver() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateDriverInput) => api.post<Driver>("/api/drivers", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["drivers"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard"] });
    },
  });
}

export function useUpdateDriver() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateDriverInput }) => 
      api.put<Driver>(`/api/drivers/${id}`, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["drivers"] });
      queryClient.invalidateQueries({ queryKey: ["driver", variables.id] });
    },
  });
}

export function useDeleteDriver() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.delete(`/api/drivers/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["drivers"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard"] });
    },
  });
}
