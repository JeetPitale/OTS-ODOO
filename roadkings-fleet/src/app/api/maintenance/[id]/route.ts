import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { successResponse, notFoundResponse, serverErrorResponse, errorResponse } from "@/lib/api-response";
import { updateMaintenanceSchema, parseValidation } from "@/lib/validators";

export async function GET(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const maintenance = await prisma.maintenanceRecord.findFirst({
      where: { OR: [{ maintenanceId: id }, { id }] },
    });

    if (!maintenance) return notFoundResponse("Maintenance Record");
    return successResponse(maintenance);
  } catch (error) {
    return serverErrorResponse(error);
  }
}

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const body = await request.json();
    const validation = parseValidation(updateMaintenanceSchema, body);
    if (!validation.success) {
      return errorResponse("Validation failed", validation.errors);
    }

    const existing = await prisma.maintenanceRecord.findFirst({ where: { OR: [{ maintenanceId: id }, { id }] } });
    if (!existing) return notFoundResponse("Maintenance Record");

    const maintenance = await prisma.maintenanceRecord.update({
      where: { id: existing.id },
      data: validation.data,
    });

    return successResponse(maintenance, "Maintenance record updated successfully");
  } catch (error) {
    return serverErrorResponse(error);
  }
}

export async function DELETE(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const existing = await prisma.maintenanceRecord.findFirst({ where: { OR: [{ maintenanceId: id }, { id }] } });
    if (!existing) return notFoundResponse("Maintenance Record");

    await prisma.maintenanceRecord.delete({ where: { id: existing.id } });

    return successResponse(null, "Maintenance record deleted successfully");
  } catch (error) {
    return serverErrorResponse(error);
  }
}
