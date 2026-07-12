import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { successResponse, notFoundResponse, serverErrorResponse, errorResponse } from "@/lib/api-response";
import { completeTripSchema, parseValidation } from "@/lib/validators";

// GET /api/dispatches/[id] — Get a single dispatch by dispatchId
export async function GET(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const dispatch = await prisma.dispatch.findFirst({
      where: { OR: [{ dispatchId: id }, { id }] },
      include: { dispatchQR: true },
    });

    if (!dispatch) return notFoundResponse("Dispatch");
    return successResponse(dispatch);
  } catch (error) {
    return serverErrorResponse(error);
  }
}

// PATCH /api/dispatches/[id] — Update dispatch status (Complete/Cancel)
export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const { action, ...body } = await request.json();

    const dispatch = await prisma.dispatch.findFirst({
      where: { OR: [{ dispatchId: id }, { id }] },
    });

    if (!dispatch) return notFoundResponse("Dispatch");

    if (action === "complete") {
      const validation = parseValidation(completeTripSchema, body);
      if (!validation.success) {
        return errorResponse("Validation failed", validation.errors);
      }

      const { odometer, fuel, notes } = validation.data;
      const arrivalTime = new Date().toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" });

      const result = await prisma.$transaction(async (tx) => {
        // 1. Update dispatch
        const updated = await tx.dispatch.update({
          where: { id: dispatch.id },
          data: {
            tripStatus: "completed",
            arrivalTime,
            finalOdometer: odometer,
            fuelUsed: fuel,
            completionNotes: notes,
          },
        });

        // 2. Update linked trip
        await tx.trip.updateMany({
          where: { dispatchId: dispatch.dispatchId },
          data: { status: "completed" },
        });

        // 3. Free driver
        await tx.driver.updateMany({
          where: { driverId: dispatch.driverId },
          data: { status: "available", vehicle: "Unassigned", totalTrips: { increment: 1 } },
        });

        // 4. Free vehicle
        await tx.vehicle.updateMany({
          where: { vehicleId: dispatch.vehicleId },
          data: { status: "available", driver: "Unassigned", mileage: odometer },
        });

        // 5. Create fuel record
        await tx.fuelRecord.create({
          data: {
            fuelId: `FUL-${Date.now()}`,
            vehicleId: dispatch.vehicleId,
            vehicle: dispatch.vehicleRegistration,
            date: new Date().toISOString().split("T")[0],
            station: "Trip Completion Auto-log",
            fuelType: "Diesel",
            quantity: fuel,
            rate: "90",
            amount: (parseFloat(fuel) * 90).toString(),
            odometer: odometer,
            driverId: dispatch.driverId,
            driver: dispatch.driverName,
          }
        });

        // 6. Notification
        await tx.notification.create({
          data: {
            notifId: `NOT-${Date.now()}`,
            title: "Dispatch Completed",
            message: `Dispatch ${dispatch.dispatchId} completed by ${dispatch.driverName}.`,
            type: "info",
          }
        });

        return updated;
      });

      return successResponse(result, "Dispatch completed successfully");
    }

    if (action === "cancel") {
      const result = await prisma.$transaction(async (tx) => {
        const updated = await tx.dispatch.update({
          where: { id: dispatch.id },
          data: { tripStatus: "cancelled" },
        });

        await tx.trip.updateMany({
          where: { dispatchId: dispatch.dispatchId },
          data: { status: "cancelled" },
        });

        await tx.driver.updateMany({
          where: { driverId: dispatch.driverId },
          data: { status: "available", vehicle: "Unassigned" },
        });

        await tx.vehicle.updateMany({
          where: { vehicleId: dispatch.vehicleId },
          data: { status: "available", driver: "Unassigned" },
        });

        await tx.dispatchQR.updateMany({
          where: { dispatchId: dispatch.dispatchId },
          data: { archived: true, archivedAt: new Date() },
        });

        await tx.notification.create({
          data: {
            notifId: `NOT-${Date.now()}`,
            title: "Dispatch Cancelled",
            message: `Dispatch ${dispatch.dispatchId} was cancelled.`,
            type: "warning",
          }
        });

        return updated;
      });

      return successResponse(result, "Dispatch cancelled successfully");
    }

    return errorResponse("Invalid action. Must be 'complete' or 'cancel'");
  } catch (error) {
    return serverErrorResponse(error);
  }
}
