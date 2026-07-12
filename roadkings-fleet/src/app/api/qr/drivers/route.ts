import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { successResponse, serverErrorResponse, errorResponse } from "@/lib/api-response";

export async function GET(_request: NextRequest) {
  try {
    const qrs = await prisma.driverQR.findMany({
      include: { driver: true },
      orderBy: { createdAt: "desc" },
    });

    const qrMap = qrs.reduce((acc, qr) => {
      acc[qr.driverId] = qr.payload;
      return acc;
    }, {} as Record<string, string>);

    return successResponse(qrMap);
  } catch (error) {
    return serverErrorResponse(error);
  }
}

export async function POST(request: NextRequest) {
  try {
    const { driverId, driverName } = await request.json();
    
    if (!driverId || !driverName) {
      return errorResponse("driverId and driverName are required");
    }

    const payload = JSON.stringify({ driverId, driverName });

    const qr = await prisma.driverQR.upsert({
      where: { driverId },
      update: { payload },
      create: { driverId, payload },
    });

    return successResponse(qr, "QR generated successfully", 201);
  } catch (error) {
    return serverErrorResponse(error);
  }
}
