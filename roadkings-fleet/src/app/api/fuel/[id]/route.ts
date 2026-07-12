import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { successResponse, notFoundResponse, serverErrorResponse, errorResponse } from "@/lib/api-response";
import { updateFuelSchema, parseValidation } from "@/lib/validators";

export async function GET(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const fuelRecord = await prisma.fuelRecord.findFirst({
      where: { OR: [{ fuelId: id }, { id }] },
    });

    if (!fuelRecord) return notFoundResponse("Fuel Record");
    return successResponse(fuelRecord);
  } catch (error) {
    return serverErrorResponse(error);
  }
}

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const body = await request.json();
    const validation = parseValidation(updateFuelSchema, body);
    if (!validation.success) {
      return errorResponse("Validation failed", validation.errors);
    }

    const existing = await prisma.fuelRecord.findFirst({ where: { OR: [{ fuelId: id }, { id }] } });
    if (!existing) return notFoundResponse("Fuel Record");

    const fuelRecord = await prisma.fuelRecord.update({
      where: { id: existing.id },
      data: validation.data,
    });

    return successResponse(fuelRecord, "Fuel record updated successfully");
  } catch (error) {
    return serverErrorResponse(error);
  }
}

export async function DELETE(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const existing = await prisma.fuelRecord.findFirst({ where: { OR: [{ fuelId: id }, { id }] } });
    if (!existing) return notFoundResponse("Fuel Record");

    await prisma.fuelRecord.delete({ where: { id: existing.id } });

    return successResponse(null, "Fuel record deleted successfully");
  } catch (error) {
    return serverErrorResponse(error);
  }
}
