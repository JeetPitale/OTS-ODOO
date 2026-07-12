import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { successResponse, errorResponse, serverErrorResponse, parsePaginationParams } from "@/lib/api-response";
import { createMaintenanceSchema, parseValidation } from "@/lib/validators";

export async function GET(request: NextRequest) {
  try {
    const { page, limit, search, sortBy, sortOrder } = parsePaginationParams(request.nextUrl.searchParams);

    const where: Record<string, unknown> = {};
    if (search) {
      where.OR = [
        { maintenanceId: { contains: search, mode: "insensitive" } },
        { vehicle: { contains: search, mode: "insensitive" } },
        { description: { contains: search, mode: "insensitive" } },
        { technician: { contains: search, mode: "insensitive" } },
      ];
    }

    const orderBy: Record<string, string> = {};
    if (sortBy) {
      orderBy[sortBy] = sortOrder;
    } else {
      orderBy.createdAt = "desc";
    }

    const [items, total] = await Promise.all([
      prisma.maintenanceRecord.findMany({
        where,
        orderBy,
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.maintenanceRecord.count({ where }),
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

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validation = parseValidation(createMaintenanceSchema, body);
    if (!validation.success) {
      return errorResponse("Validation failed", validation.errors);
    }

    const lastMnt = await prisma.maintenanceRecord.findFirst({ orderBy: { maintenanceId: "desc" } });
    const lastNum = lastMnt ? parseInt(lastMnt.maintenanceId.replace("MNT-", "")) || 0 : 0;
    const maintenanceId = `MNT-${String(lastNum + 1).padStart(3, "0")}`;

    const maintenance = await prisma.maintenanceRecord.create({
      data: {
        maintenanceId,
        ...validation.data,
      },
    });

    return successResponse(maintenance, "Maintenance record created successfully", 201);
  } catch (error) {
    return serverErrorResponse(error);
  }
}
