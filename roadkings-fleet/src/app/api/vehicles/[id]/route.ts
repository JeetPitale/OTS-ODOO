import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { successResponse, notFoundResponse, serverErrorResponse, errorResponse } from "@/lib/api-response";
import { updateVehicleSchema, parseValidation } from "@/lib/validators";

// GET /api/vehicles/[id] — Get a single vehicle by vehicleId
export async function GET(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const vehicle = await prisma.vehicle.findFirst({
      where: { OR: [{ vehicleId: id }, { id }] },
    });

    if (!vehicle) return notFoundResponse("Vehicle");
    return successResponse(vehicle);
  } catch (error) {
    return serverErrorResponse(error);
  }
}

// PUT /api/vehicles/[id] — Update a vehicle
export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const body = await request.json();
    const validation = parseValidation(updateVehicleSchema, body);
    if (!validation.success) {
      return errorResponse("Validation failed", validation.errors);
    }

    const existing = await prisma.vehicle.findFirst({ where: { OR: [{ vehicleId: id }, { id }] } });
    if (!existing) return notFoundResponse("Vehicle");

    const vehicle = await prisma.vehicle.update({
      where: { id: existing.id },
      data: validation.data,
    });

    return successResponse(vehicle, "Vehicle updated successfully");
  } catch (error) {
    return serverErrorResponse(error);
  }
}

// DELETE /api/vehicles/[id] — Delete a vehicle
export async function DELETE(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const existing = await prisma.vehicle.findFirst({ where: { OR: [{ vehicleId: id }, { id }] } });
    if (!existing) return notFoundResponse("Vehicle");

    await prisma.vehicle.delete({ where: { id: existing.id } });

    return successResponse(null, "Vehicle deleted successfully");
  } catch (error) {
    return serverErrorResponse(error);
  }
}
