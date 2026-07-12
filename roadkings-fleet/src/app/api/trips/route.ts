import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { successResponse, errorResponse, serverErrorResponse, parsePaginationParams } from "@/lib/api-response";
import { createTripSchema, parseValidation } from "@/lib/validators";

// GET /api/trips — List with pagination, search, filter, sort
export async function GET(request: NextRequest) {
  try {
    const { page, limit, search, sortBy, sortOrder, status } = parsePaginationParams(request.nextUrl.searchParams);

    const where: Record<string, unknown> = {};
    if (search) {
      where.OR = [
        { tripId: { contains: search, mode: "insensitive" } },
        { origin: { contains: search, mode: "insensitive" } },
        { destination: { contains: search, mode: "insensitive" } },
        { driver: { contains: search, mode: "insensitive" } },
        { vehicle: { contains: search, mode: "insensitive" } },
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
      prisma.trip.findMany({
        where,
        orderBy,
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.trip.count({ where }),
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

// POST /api/trips — Create a new trip
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validation = parseValidation(createTripSchema, body);
    if (!validation.success) {
      return errorResponse("Validation failed", validation.errors);
    }

    // Generate next human-readable ID
    const lastTrip = await prisma.trip.findFirst({ orderBy: { tripId: "desc" } });
    const lastNum = lastTrip ? parseInt(lastTrip.tripId.replace("TRP-", "")) || 0 : 0;
    const tripId = `TRP-${String(lastNum + 1).padStart(4, "0")}`;

    const trip = await prisma.trip.create({
      data: {
        tripId,
        ...validation.data,
      },
    });

    return successResponse(trip, "Trip created successfully", 201);
  } catch (error) {
    return serverErrorResponse(error);
  }
}
