import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { successResponse, notFoundResponse, serverErrorResponse, errorResponse } from "@/lib/api-response";
import { updateDriverSchema, parseValidation } from "@/lib/validators";

// GET /api/drivers/[id] — Get a single driver by driverId
export async function GET(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const driver = await prisma.driver.findFirst({
      where: { OR: [{ driverId: id }, { id }] },
      include: { driverQR: true },
    });

    if (!driver) return notFoundResponse("Driver");
    return successResponse(driver);
  } catch (error) {
    return serverErrorResponse(error);
  }
}

// PUT /api/drivers/[id] — Update a driver
export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const body = await request.json();
    const validation = parseValidation(updateDriverSchema, body);
    if (!validation.success) {
      return errorResponse("Validation failed", validation.errors);
    }

    const existing = await prisma.driver.findFirst({ where: { OR: [{ driverId: id }, { id }] } });
    if (!existing) return notFoundResponse("Driver");

    // Map frontend status format to enum
    const data = { ...validation.data };
    if (data.status) {
      const statusMap: Record<string, string> = { "on-trip": "on_trip", "off-duty": "off_duty" };
      data.status = (statusMap[data.status] || data.status) as any;
    }

    const driver = await prisma.driver.update({
      where: { id: existing.id },
      data,
    });

    return successResponse(driver, "Driver updated successfully");
  } catch (error) {
    return serverErrorResponse(error);
  }
}

// DELETE /api/drivers/[id] — Delete a driver
export async function DELETE(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const existing = await prisma.driver.findFirst({ where: { OR: [{ driverId: id }, { id }] } });
    if (!existing) return notFoundResponse("Driver");

    // Delete associated QR first
    await prisma.driverQR.deleteMany({ where: { driverId: existing.driverId } });
    await prisma.driver.delete({ where: { id: existing.id } });

    return successResponse(null, "Driver deleted successfully");
  } catch (error) {
    return serverErrorResponse(error);
  }
}
