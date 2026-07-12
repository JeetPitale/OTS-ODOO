import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api-client";
import { CreateFuelInput, UpdateFuelInput } from "@/lib/validators";
import { PaginatedResponse } from "@/lib/api-response";

interface FuelRecord {
  id: string;
  fuelId: string;
  vehicleId: string;
  vehicle: string;
  date: string;
  station: string;
  fuelType: "Diesel" | "Petrol" | "CNG" | "Electric";
  quantity: string;
  rate: string;
  amount: string;
  odometer: string;
  driverId?: string;
  driver: string;
}

export function useFuelRecords(params?: { page?: number; limit?: number; search?: string; sortBy?: string; sortOrder?: string }) {
  return useQuery({
    queryKey: ["fuel", params],
    queryFn: () => api.get<PaginatedResponse<FuelRecord>>("/api/fuel", params as Record<string, string | number>),
  });
}

export function useFuelRecord(id: string) {
  return useQuery({
    queryKey: ["fuel", id],
    queryFn: () => api.get<FuelRecord>(`/api/fuel/${id}`),
    enabled: !!id,
  });
}

export function useCreateFuel() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateFuelInput) => api.post<FuelRecord>("/api/fuel", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["fuel"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard"] });
    },
  });
}

export function useUpdateFuel() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateFuelInput }) => 
      api.put<FuelRecord>(`/api/fuel/${id}`, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["fuel"] });
      queryClient.invalidateQueries({ queryKey: ["fuel", variables.id] });
    },
  });
}

export function useDeleteFuel() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.delete(`/api/fuel/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["fuel"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard"] });
    },
  });
}
