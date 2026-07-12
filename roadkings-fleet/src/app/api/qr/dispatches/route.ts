import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { successResponse, serverErrorResponse } from "@/lib/api-response";

export async function GET(_request: NextRequest) {
  try {
    const qrs = await prisma.dispatchQR.findMany({
      where: { archived: false },
      include: { dispatch: true },
      orderBy: { createdAt: "desc" },
    });

    const qrMap = qrs.reduce((acc, qr) => {
      acc[qr.dispatchId] = qr.payload;
      return acc;
    }, {} as Record<string, string>);

    return successResponse(qrMap);
  } catch (error) {
    return serverErrorResponse(error);
  }
}
