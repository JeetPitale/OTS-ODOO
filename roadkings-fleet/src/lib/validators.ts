import { z } from "zod";

// ─── Driver Validators ─────────────────────────────────────────────────────────

export const driverStatusEnum = z.enum(["available", "on_trip", "off_duty", "suspended"]);

export const createDriverSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  license: z.string().min(5, "License number is required"),
  phone: z.string().min(10, "Phone number must be at least 10 characters"),
  status: driverStatusEnum.default("available"),
  safetyScore: z.number().int().min(0).max(100).default(90),
  totalTrips: z.number().int().min(0).default(0),
  incidents: z.number().int().min(0).default(0),
  vehicle: z.string().default("Unassigned"),
  licenseCategory: z.string().optional(),
  licenseExpiry: z.string().optional(),
  photoUrl: z.string().url().optional().or(z.literal("")),
});

export const updateDriverSchema = createDriverSchema.partial();

export type CreateDriverInput = z.infer<typeof createDriverSchema>;
export type UpdateDriverInput = z.infer<typeof updateDriverSchema>;

// ─── Vehicle Validators ─────────────────────────────────────────────────────────

export const vehicleStatusEnum = z.enum(["available", "on_trip", "in_maintenance", "in_shop", "retired"]);

export const createVehicleSchema = z.object({
  number: z.string().min(3, "Vehicle registration number is required"),
  type: z.string().min(2, "Vehicle type is required"),
  make: z.string().min(2, "Make/model is required"),
  year: z.number().int().min(1990).max(new Date().getFullYear() + 1),
  status: vehicleStatusEnum.default("available"),
  driver: z.string().default("Unassigned"),
  lastService: z.string(),
  nextService: z.string(),
  mileage: z.string(),
  capacityKg: z.number().int().positive().optional(),
});

export const updateVehicleSchema = createVehicleSchema.partial();

export type CreateVehicleInput = z.infer<typeof createVehicleSchema>;
export type UpdateVehicleInput = z.infer<typeof updateVehicleSchema>;

// ─── Trip Validators ────────────────────────────────────────────────────────────

export const tripStatusEnum = z.enum(["scheduled", "on_trip", "completed", "cancelled"]);

export const createTripSchema = z.object({
  origin: z.string().min(2, "Origin is required"),
  destination: z.string().min(2, "Destination is required"),
  driver: z.string().min(2, "Driver name is required"),
  vehicle: z.string().min(2, "Vehicle is required"),
  status: tripStatusEnum.default("scheduled"),
  distance: z.string(),
  eta: z.string(),
  revenue: z.string(),
  startDate: z.string(),
  cargoDescription: z.string().optional(),
  cargoWeight: z.string().optional(),
  dispatcher: z.string().optional(),
  remarks: z.string().optional(),
  dispatchId: z.string().optional(),
  dispatchTime: z.string().optional(),
});

export const updateTripSchema = createTripSchema.partial();

export type CreateTripInput = z.infer<typeof createTripSchema>;
export type UpdateTripInput = z.infer<typeof updateTripSchema>;

// ─── Dispatch Validators ────────────────────────────────────────────────────────

export const dispatchStatusEnum = z.enum(["on_trip", "completed", "cancelled"]);

export const createDispatchSchema = z.object({
  tripId: z.string().min(1, "Trip ID is required"),
  driverId: z.string().min(1, "Driver ID is required"),
  driverName: z.string().min(1, "Driver name is required"),
  vehicleId: z.string().min(1, "Vehicle ID is required"),
  vehicleRegistration: z.string().min(1, "Vehicle registration is required"),
  vehicleName: z.string().min(1, "Vehicle name is required"),
  source: z.string().min(1, "Source is required"),
  destination: z.string().min(1, "Destination is required"),
  cargoDescription: z.string().min(1, "Cargo description is required"),
  cargoWeight: z.string().min(1, "Cargo weight is required"),
  dispatcher: z.string().min(1, "Dispatcher is required"),
  expectedDelivery: z.string().min(1, "Expected delivery is required"),
  distance: z.string().min(1, "Distance is required"),
  estimatedRevenue: z.string().min(1, "Revenue is required"),
  remarks: z.string().optional(),
});

export const completeTripSchema = z.object({
  odometer: z.string().min(1, "Odometer reading is required"),
  fuel: z.string().min(1, "Fuel used is required"),
  notes: z.string().optional(),
});

export type CreateDispatchInput = z.infer<typeof createDispatchSchema>;
export type CompleteTripInput = z.infer<typeof completeTripSchema>;

// ─── Maintenance Validators ─────────────────────────────────────────────────────

export const maintenanceTypeEnum = z.enum(["Preventive", "Corrective"]);
export const maintenancePriorityEnum = z.enum(["Critical", "High", "Medium", "Low"]);
export const maintenanceStatusEnum = z.enum(["scheduled", "in_maintenance", "completed"]);

export const createMaintenanceSchema = z.object({
  vehicleId: z.string().min(1, "Vehicle is required"),
  vehicle: z.string().min(1, "Vehicle display name is required"),
  type: maintenanceTypeEnum,
  description: z.string().min(5, "Description must be at least 5 characters"),
  status: maintenanceStatusEnum.default("scheduled"),
  priority: maintenancePriorityEnum.default("Medium"),
  scheduledDate: z.string().min(1, "Scheduled date is required"),
  completedDate: z.string().default("—"),
  cost: z.string().min(1, "Cost is required"),
  technician: z.string().min(2, "Technician name is required"),
});

export const updateMaintenanceSchema = createMaintenanceSchema.partial();

export type CreateMaintenanceInput = z.infer<typeof createMaintenanceSchema>;
export type UpdateMaintenanceInput = z.infer<typeof updateMaintenanceSchema>;

// ─── Fuel Validators ────────────────────────────────────────────────────────────

export const fuelTypeEnum = z.enum(["Diesel", "Petrol", "CNG", "Electric"]);

export const createFuelSchema = z.object({
  vehicleId: z.string().min(1, "Vehicle is required"),
  vehicle: z.string().min(1, "Vehicle display name is required"),
  date: z.string().min(1, "Date is required"),
  station: z.string().min(2, "Station is required"),
  fuelType: fuelTypeEnum.default("Diesel"),
  quantity: z.string().min(1, "Quantity is required"),
  rate: z.string().min(1, "Rate is required"),
  amount: z.string().min(1, "Amount is required"),
  odometer: z.string().min(1, "Odometer reading is required"),
  driverId: z.string().optional(),
  driver: z.string().min(1, "Driver name is required"),
});

export const updateFuelSchema = createFuelSchema.partial();

export type CreateFuelInput = z.infer<typeof createFuelSchema>;
export type UpdateFuelInput = z.infer<typeof updateFuelSchema>;

// ─── Notification Validators ────────────────────────────────────────────────────

export const notificationTypeEnum = z.enum(["info", "warning", "success", "critical"]);

export const createNotificationSchema = z.object({
  title: z.string().min(1, "Title is required"),
  message: z.string().min(1, "Message is required"),
  type: notificationTypeEnum.default("info"),
});

export type CreateNotificationInput = z.infer<typeof createNotificationSchema>;

// ─── Utility ────────────────────────────────────────────────────────────────────

export function parseValidation<T>(schema: z.ZodSchema<T>, data: unknown): { success: true; data: T } | { success: false; errors: string[] } {
  const result = schema.safeParse(data);
  if (result.success) {
    return { success: true, data: result.data };
  }
  const errors = result.error.issues.map((issue) => `${issue.path.join(".")}: ${issue.message}`);
  return { success: false, errors };
}
