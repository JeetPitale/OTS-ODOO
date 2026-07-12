import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { successResponse, errorResponse, serverErrorResponse } from "@/lib/api-response";
import { createNotificationSchema, parseValidation } from "@/lib/validators";

export async function GET() {
  try {
    const notifications = await prisma.notification.findMany({
      orderBy: { timestamp: "desc" },
      take: 50,
    });

    return successResponse(notifications);
  } catch (error) {
    return serverErrorResponse(error);
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validation = parseValidation(createNotificationSchema, body);
    if (!validation.success) {
      return errorResponse("Validation failed", validation.errors);
    }

    const notification = await prisma.notification.create({
      data: {
        notifId: `NOT-${Date.now()}`,
        ...validation.data,
      },
    });

    return successResponse(notification, "Notification created successfully", 201);
  } catch (error) {
    return serverErrorResponse(error);
  }
}

export async function DELETE() {
  try {
    await prisma.notification.deleteMany({});
    return successResponse(null, "All notifications cleared");
  } catch (error) {
    return serverErrorResponse(error);
  }
}
