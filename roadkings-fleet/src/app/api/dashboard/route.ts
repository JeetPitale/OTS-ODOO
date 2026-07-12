import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { successResponse, serverErrorResponse } from "@/lib/api-response";

export async function GET(_request: NextRequest) {
  try {
    const todayStr = new Date().toLocaleDateString("en-US", { year: "numeric", month: "short", day: "2-digit" });
    const todayISOStr = new Date().toISOString().split("T")[0];

    const [
      totalVehicles,
      availableVehicles,
      inMaintenanceVehicles,
      activeTrips,
      activeDrivers,
      dispatchesToday,
      activeDispatches,
      completedDispatches,
      scansToday,
      fuelRecordsMTD,
      activeAlerts,
      recentTrips,
    ] = await Promise.all([
      prisma.vehicle.count(),
      prisma.vehicle.count({ where: { status: "available" } }),
      prisma.vehicle.count({ where: { status: "in_maintenance" } }),
      prisma.trip.count({ where: { status: "on_trip" } }),
      prisma.driver.count({ where: { status: "on_trip" } }),
      prisma.dispatch.count({ where: { dispatchDate: todayStr } }),
      prisma.dispatch.count({ where: { tripStatus: "on_trip" } }),
      prisma.dispatch.count({ where: { tripStatus: "completed" } }),
      prisma.qRScanLog.count({ 
        where: { timestamp: { gte: new Date(new Date().setHours(0, 0, 0, 0)) } } 
      }),
      prisma.fuelRecord.findMany({
        where: { date: { startsWith: todayISOStr.slice(0, 7) } } // Current YYYY-MM
      }),
      prisma.notification.findMany({
        where: { type: "warning", read: false },
        take: 5
      }),
      prisma.trip.findMany({
        orderBy: { createdAt: "desc" },
        take: 5,
      }),
    ]);

    const mtdFuelCost = fuelRecordsMTD.reduce((sum, record) => sum + parseFloat(record.amount || "0"), 0);

    // Compute fleet status pie data
    const fleetStatus = [
      { name: "Active", value: activeTrips, color: "#10b981" },
      { name: "Available", value: availableVehicles, color: "#3b82f6" },
      { name: "Maintenance", value: inMaintenanceVehicles, color: "#f59e0b" },
    ];

    return successResponse({
      kpis: {
        totalVehicles,
        activeTrips,
        activeDrivers,
        dispatchesToday,
        activeDispatches,
        completedDispatches,
        scansToday,
        mtdFuelCost: `₹${(mtdFuelCost / 100000).toFixed(1)}L`,
      },
      fleetStatus,
      activeAlerts,
      recentTrips,
    });
  } catch (error) {
    return serverErrorResponse(error);
  }
}
