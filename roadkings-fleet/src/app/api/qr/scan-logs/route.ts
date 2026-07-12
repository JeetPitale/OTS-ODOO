import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { successResponse, serverErrorResponse, errorResponse } from "@/lib/api-response";

export async function GET(_request: NextRequest) {
  try {
    const logs = await prisma.qRScanLog.findMany({
      orderBy: { timestamp: "desc" },
      take: 50,
    });

    return successResponse(logs);
  } catch (error) {
    return serverErrorResponse(error);
  }
}

export async function POST(request: NextRequest) {
  try {
    const { driverId, driverName, success, message } = await request.json();

    if (!driverId || !driverName || success === undefined || !message) {
      return errorResponse("Missing required fields for scan log");
    }

    const scanId = `SCN-${Date.now()}`;

    const log = await prisma.qRScanLog.create({
      data: {
        scanId,
        driverId,
        driverName,
        success,
        message,
      },
    });

    return successResponse(log, "Scan log created successfully", 201);
  } catch (error) {
    return serverErrorResponse(error);
  }
}
