import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { successResponse, errorResponse, serverErrorResponse, parsePaginationParams } from "@/lib/api-response";
import { createVehicleSchema, parseValidation } from "@/lib/validators";

// GET /api/vehicles — List with pagination, search, filter, sort
export async function GET(request: NextRequest) {
  try {
    const { page, limit, search, sortBy, sortOrder, status } = parsePaginationParams(request.nextUrl.searchParams);

    const where: Record<string, unknown> = {};
    if (search) {
      where.OR = [
        { number: { contains: search, mode: "insensitive" } },
        { vehicleId: { contains: search, mode: "insensitive" } },
        { make: { contains: search, mode: "insensitive" } },
        { driver: { contains: search, mode: "insensitive" } },
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
      prisma.vehicle.findMany({
        where,
        orderBy,
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.vehicle.count({ where }),
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

// POST /api/vehicles — Create a new vehicle
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validation = parseValidation(createVehicleSchema, body);
    if (!validation.success) {
      return errorResponse("Validation failed", validation.errors);
    }

    // Generate next human-readable ID
    const lastVehicle = await prisma.vehicle.findFirst({ orderBy: { vehicleId: "desc" } });
    const lastNum = lastVehicle ? parseInt(lastVehicle.vehicleId.replace("V-", "")) || 0 : 0;
    const vehicleId = `V-${String(lastNum + 1).padStart(3, "0")}`;

    const vehicle = await prisma.vehicle.create({
      data: {
        vehicleId,
        ...validation.data,
      },
    });

    return successResponse(vehicle, "Vehicle created successfully", 201);
  } catch (error) {
    return serverErrorResponse(error);
  }
}
