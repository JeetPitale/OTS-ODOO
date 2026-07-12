import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api-client";
import { CreateTripInput, UpdateTripInput } from "@/lib/validators";
import { PaginatedResponse } from "@/lib/api-response";

interface Trip {
  id: string;
  tripId: string;
  origin: string;
  destination: string;
  driver: string;
  vehicle: string;
  status: "scheduled" | "on_trip" | "completed" | "cancelled";
  distance: string;
  eta: string;
  revenue: string;
  startDate: string;
  cargoDescription?: string;
  cargoWeight?: string;
  dispatcher?: string;
  remarks?: string;
  dispatchId?: string;
  dispatchTime?: string;
}

export function useTrips(params?: { page?: number; limit?: number; search?: string; status?: string }) {
  return useQuery({
    queryKey: ["trips", params],
    queryFn: () => api.get<PaginatedResponse<Trip>>("/api/trips", params as Record<string, string | number>),
  });
}

export function useTrip(id: string) {
  return useQuery({
    queryKey: ["trip", id],
    queryFn: () => api.get<Trip>(`/api/trips/${id}`),
    enabled: !!id,
  });
}

export function useCreateTrip() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateTripInput) => api.post<Trip>("/api/trips", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["trips"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard"] });
    },
  });
}

export function useUpdateTrip() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateTripInput }) => 
      api.put<Trip>(`/api/trips/${id}`, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["trips"] });
      queryClient.invalidateQueries({ queryKey: ["trip", variables.id] });
    },
  });
}

export function useDeleteTrip() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.delete(`/api/trips/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["trips"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard"] });
    },
  });
}
