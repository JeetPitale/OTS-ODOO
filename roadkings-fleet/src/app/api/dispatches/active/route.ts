import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { successResponse, serverErrorResponse } from "@/lib/api-response";

// GET /api/dispatches/active — Get all currently active dispatches
export async function GET(_request: NextRequest) {
  try {
    const activeDispatches = await prisma.dispatch.findMany({
      where: { tripStatus: "on_trip" },
      orderBy: { createdAt: "desc" },
    });

    return successResponse(activeDispatches);
  } catch (error) {
    return serverErrorResponse(error);
  }
}
