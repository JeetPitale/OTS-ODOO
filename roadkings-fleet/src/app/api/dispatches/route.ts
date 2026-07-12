import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { successResponse, errorResponse, serverErrorResponse, parsePaginationParams } from "@/lib/api-response";
import { createDispatchSchema, parseValidation } from "@/lib/validators";

// GET /api/dispatches — List with pagination, search, filter
export async function GET(request: NextRequest) {
  try {
    const { page, limit, search, status } = parsePaginationParams(request.nextUrl.searchParams);

    const where: Record<string, unknown> = {};
    if (search) {
      where.OR = [
        { dispatchId: { contains: search, mode: "insensitive" } },
        { driverName: { contains: search, mode: "insensitive" } },
        { vehicleRegistration: { contains: search, mode: "insensitive" } },
        { source: { contains: search, mode: "insensitive" } },
        { destination: { contains: search, mode: "insensitive" } },
      ];
    }
    
    if (status && status !== "all") {
      const statusMap: Record<string, string> = { "on-trip": "on_trip" };
      where.tripStatus = statusMap[status] || status;
    }

    const [items, total] = await Promise.all([
      prisma.dispatch.findMany({
        where,
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.dispatch.count({ where }),
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

// POST /api/dispatches — Create a new dispatch (Smart Dispatch logic)
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validation = parseValidation(createDispatchSchema, body);
    if (!validation.success) {
      return errorResponse("Validation failed", validation.errors);
    }

    const data = validation.data;

    // Verify driver is available
    const driver = await prisma.driver.findFirst({ where: { driverId: data.driverId } });
    if (!driver || driver.status !== "available") {
      return errorResponse("Driver is not available for dispatch", []);
    }

    // Verify vehicle is available
    const vehicle = await prisma.vehicle.findFirst({ where: { vehicleId: data.vehicleId } });
    if (!vehicle || vehicle.status !== "available") {
      return errorResponse("Vehicle is not available for dispatch", []);
    }

    // Generate Dispatch ID
    const today = new Date();
    const dateStr = today.toISOString().split("T")[0].replace(/-/g, "").slice(2);
    const lastDispatch = await prisma.dispatch.findFirst({
      where: { dispatchId: { startsWith: `RK-${dateStr}` } },
      orderBy: { createdAt: "desc" },
    });
    const lastSeq = lastDispatch ? parseInt(lastDispatch.dispatchId.split("-").pop() || "0") : 0;
    const dispatchId = `RK-${dateStr}-${String(lastSeq + 1).padStart(4, "0")}`;

    const dispatchDate = today.toLocaleDateString("en-US", { year: "numeric", month: "short", day: "2-digit" });
    const dispatchTime = today.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" });

    // Use transaction to ensure data integrity
    const result = await prisma.$transaction(async (tx) => {
      // 1. Create dispatch record
      const dispatch = await tx.dispatch.create({
        data: {
          dispatchId,
          ...data,
          dispatchDate,
          dispatchTime,
          tripStatus: "on_trip",
        },
      });

      // 2. Create Trip record to mirror dispatch (legacy behavior)
      await tx.trip.create({
        data: {
          tripId: data.tripId,
          origin: data.source,
          destination: data.destination,
          driver: data.driverName,
          vehicle: data.vehicleRegistration,
          status: "on_trip",
          distance: data.distance,
          eta: data.expectedDelivery,
          revenue: data.estimatedRevenue,
          startDate: dispatchDate,
          cargoDescription: data.cargoDescription,
          cargoWeight: data.cargoWeight,
          dispatcher: data.dispatcher,
          remarks: data.remarks,
          dispatchId: dispatch.dispatchId,
          dispatchTime: dispatch.dispatchTime,
        },
      });

      // 3. Generate and store Dispatch QR
      const qrPayload = JSON.stringify({
        dispatchId: dispatch.dispatchId,
        driverId: dispatch.driverId,
        vehicleReg: dispatch.vehicleRegistration,
        timestamp: new Date().toISOString(),
      });

      await tx.dispatchQR.create({
        data: {
          dispatchId: dispatch.dispatchId,
          payload: qrPayload,
        },
      });

      // 4. Update Driver status
      await tx.driver.update({
        where: { id: driver.id },
        data: { status: "on_trip", vehicle: vehicle.number },
      });

      // 5. Update Vehicle status
      await tx.vehicle.update({
        where: { id: vehicle.id },
        data: { status: "on_trip", driver: driver.name },
      });

      // 6. Create Notification
      await tx.notification.create({
        data: {
          notifId: `NOT-${Date.now()}`,
          title: "New Dispatch Generated",
          message: `Dispatch ${dispatch.dispatchId} generated for Driver ${driver.name} (Vehicle: ${vehicle.number}).`,
          type: "success",
        }
      });

      return dispatch;
    });

    return successResponse(result, "Dispatch created successfully", 201);
  } catch (error) {
    return serverErrorResponse(error);
  }
}
