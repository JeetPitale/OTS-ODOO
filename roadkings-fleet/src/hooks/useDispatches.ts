import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api-client";
import { CreateDispatchInput, CompleteTripInput } from "@/lib/validators";
import { PaginatedResponse } from "@/lib/api-response";

interface Dispatch {
  id: string;
  dispatchId: string;
  tripId: string;
  driverId: string;
  driverName: string;
  vehicleId: string;
  vehicleRegistration: string;
  vehicleName: string;
  source: string;
  destination: string;
  cargoDescription: string;
  cargoWeight: string;
  dispatchDate: string;
  dispatchTime: string;
  dispatcher: string;
  tripStatus: "on_trip" | "completed" | "cancelled";
  expectedDelivery: string;
  distance: string;
  estimatedRevenue: string;
  remarks?: string;
  arrivalTime?: string;
  finalOdometer?: string;
  fuelUsed?: string;
  completionNotes?: string;
}

export function useDispatches(params?: { page?: number; limit?: number; search?: string; status?: string }) {
  return useQuery({
    queryKey: ["dispatches", params],
    queryFn: () => api.get<PaginatedResponse<Dispatch>>("/api/dispatches", params as Record<string, string | number>),
  });
}

export function useActiveDispatches() {
  return useQuery({
    queryKey: ["dispatches", "active"],
    queryFn: () => api.get<Dispatch[]>("/api/dispatches/active"),
  });
}

export function useDispatch(id: string) {
  return useQuery({
    queryKey: ["dispatch", id],
    queryFn: () => api.get<Dispatch & { dispatchQR?: { payload: string } }>(`/api/dispatches/${id}`),
    enabled: !!id,
  });
}

export function useCreateDispatch() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateDispatchInput) => api.post<Dispatch>("/api/dispatches", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["dispatches"] });
      queryClient.invalidateQueries({ queryKey: ["drivers"] });
      queryClient.invalidateQueries({ queryKey: ["vehicles"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard"] });
    },
  });
}

export function useCompleteDispatch() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: CompleteTripInput }) => 
      api.patch<Dispatch>(`/api/dispatches/${id}`, { action: "complete", ...data }),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["dispatches"] });
      queryClient.invalidateQueries({ queryKey: ["dispatch", variables.id] });
      queryClient.invalidateQueries({ queryKey: ["drivers"] });
      queryClient.invalidateQueries({ queryKey: ["vehicles"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard"] });
    },
  });
}

export function useCancelDispatch() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.patch<Dispatch>(`/api/dispatches/${id}`, { action: "cancel" }),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: ["dispatches"] });
      queryClient.invalidateQueries({ queryKey: ["dispatch", id] });
      queryClient.invalidateQueries({ queryKey: ["drivers"] });
      queryClient.invalidateQueries({ queryKey: ["vehicles"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard"] });
    },
  });
}
