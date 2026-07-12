import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { successResponse, notFoundResponse, serverErrorResponse, errorResponse } from "@/lib/api-response";
import { updateTripSchema, parseValidation } from "@/lib/validators";

// GET /api/trips/[id] — Get a single trip by tripId
export async function GET(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const trip = await prisma.trip.findFirst({
      where: { OR: [{ tripId: id }, { id }] },
    });

    if (!trip) return notFoundResponse("Trip");
    return successResponse(trip);
  } catch (error) {
    return serverErrorResponse(error);
  }
}

// PUT /api/trips/[id] — Update a trip
export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const body = await request.json();
    const validation = parseValidation(updateTripSchema, body);
    if (!validation.success) {
      return errorResponse("Validation failed", validation.errors);
    }

    const existing = await prisma.trip.findFirst({ where: { OR: [{ tripId: id }, { id }] } });
    if (!existing) return notFoundResponse("Trip");

    // Map frontend status format to enum
    const data = { ...validation.data };
    if (data.status) {
      const statusMap: Record<string, string> = { "on-trip": "on_trip" };
      data.status = (statusMap[data.status] || data.status) as any;
    }

    const trip = await prisma.trip.update({
      where: { id: existing.id },
      data,
    });

    return successResponse(trip, "Trip updated successfully");
  } catch (error) {
    return serverErrorResponse(error);
  }
}

// DELETE /api/trips/[id] — Delete a trip
export async function DELETE(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const existing = await prisma.trip.findFirst({ where: { OR: [{ tripId: id }, { id }] } });
    if (!existing) return notFoundResponse("Trip");

    await prisma.trip.delete({ where: { id: existing.id } });

    return successResponse(null, "Trip deleted successfully");
  } catch (error) {
    return serverErrorResponse(error);
  }
}
