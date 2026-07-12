import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { successResponse, errorResponse, serverErrorResponse, parsePaginationParams } from "@/lib/api-response";
import { createDriverSchema, parseValidation } from "@/lib/validators";

// GET /api/drivers — List with pagination, search, filter, sort
export async function GET(request: NextRequest) {
  try {
    const { page, limit, search, sortBy, sortOrder, status } = parsePaginationParams(request.nextUrl.searchParams);

    const where: Record<string, unknown> = {};
    if (search) {
      where.OR = [
        { name: { contains: search, mode: "insensitive" } },
        { driverId: { contains: search, mode: "insensitive" } },
        { license: { contains: search, mode: "insensitive" } },
        { phone: { contains: search, mode: "insensitive" } },
      ];
    }
    if (status && status !== "all") {
      where.status = status;
    }

    const orderBy: Record<string, string> = {};
    if (sortBy) {
      orderBy[sortBy] = sortOrder;
    } else {
      orderBy.createdAt = "desc";
    }

    const [items, total] = await Promise.all([
      prisma.driver.findMany({
        where,
        orderBy,
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.driver.count({ where }),
    ]);

    return successResponse({
      items,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    });
  } catch (error) {
    return serverErrorResponse(error);
  }
}

// POST /api/drivers — Create a new driver
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validation = parseValidation(createDriverSchema, body);
    if (!validation.success) {
      return errorResponse("Validation failed", validation.errors);
    }

    // Generate next human-readable ID
    const lastDriver = await prisma.driver.findFirst({ orderBy: { driverId: "desc" } });
    const lastNum = lastDriver ? parseInt(lastDriver.driverId.replace("DRV-", "")) || 0 : 0;
    const driverId = `DRV-${String(lastNum + 1).padStart(3, "0")}`;

    // Map frontend status format to enum
    const statusMap: Record<string, string> = { "on-trip": "on_trip", "off-duty": "off_duty" };
    const dbStatus = statusMap[validation.data.status] || validation.data.status;

    const driver = await prisma.driver.create({
      data: {
        driverId,
        ...validation.data,
        status: dbStatus as any,
      },
    });

    // Auto-create driver QR
    const qrPayload = JSON.stringify({ driverId: driver.driverId, driverName: driver.name });
    await prisma.driverQR.create({
      data: { driverId: driver.driverId, payload: qrPayload },
    });

    return successResponse(driver, "Driver created successfully", 201);
  } catch (error) {
    return serverErrorResponse(error);
  }
}
