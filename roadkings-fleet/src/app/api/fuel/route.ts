import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { successResponse, errorResponse, serverErrorResponse, parsePaginationParams } from "@/lib/api-response";
import { createFuelSchema, parseValidation } from "@/lib/validators";

export async function GET(request: NextRequest) {
  try {
    const { page, limit, search, sortBy, sortOrder } = parsePaginationParams(request.nextUrl.searchParams);

    const where: Record<string, unknown> = {};
    if (search) {
      where.OR = [
        { fuelId: { contains: search, mode: "insensitive" } },
        { vehicle: { contains: search, mode: "insensitive" } },
        { station: { contains: search, mode: "insensitive" } },
        { driver: { contains: search, mode: "insensitive" } },
      ];
    }

    const orderBy: Record<string, string> = {};
    if (sortBy) {
      orderBy[sortBy] = sortOrder;
    } else {
      orderBy.createdAt = "desc";
    }

    const [items, total] = await Promise.all([
      prisma.fuelRecord.findMany({
        where,
        orderBy,
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.fuelRecord.count({ where }),
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
    const validation = parseValidation(createFuelSchema, body);
    if (!validation.success) {
      return errorResponse("Validation failed", validation.errors);
    }

    const lastFuel = await prisma.fuelRecord.findFirst({ orderBy: { fuelId: "desc" } });
    const lastNum = lastFuel ? parseInt(lastFuel.fuelId.replace("FUL-", "")) || 0 : 0;
    const fuelId = `FUL-${String(lastNum + 1).padStart(4, "0")}`;

    const fuelRecord = await prisma.fuelRecord.create({
      data: {
        fuelId,
        ...validation.data,
      },
    });

    return successResponse(fuelRecord, "Fuel record created successfully", 201);
  } catch (error) {
    return serverErrorResponse(error);
  }
}
