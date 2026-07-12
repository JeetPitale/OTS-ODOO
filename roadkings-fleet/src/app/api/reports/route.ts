import { NextRequest } from "next/server";
import { successResponse, serverErrorResponse } from "@/lib/api-response";

export async function GET(_request: NextRequest) {
  try {
    // For now, keeping the static data for reports to match existing UI
    // In a fully mature system, this would aggregate from the Trips and Fuel tables.
    const revenueData = [
      { month: "Jul", revenue: 3800000, trips: 980 },
      { month: "Aug", revenue: 4100000, trips: 1050 },
      { month: "Sep", revenue: 4400000, trips: 1120 },
      { month: "Oct", revenue: 4200000, trips: 1080 },
      { month: "Nov", revenue: 4700000, trips: 1200 },
      { month: "Dec", revenue: 5100000, trips: 1320 },
    ];

    const routePerformance = [
      { route: "Mumbai–Pune", trips: 180, revenue: 33, onTime: 97 },
      { route: "Delhi–Jaipur", trips: 145, revenue: 41, onTime: 95 },
      { route: "BLR–Chennai", trips: 120, revenue: 51, onTime: 98 },
      { route: "HYD–Vizag", trips: 98, revenue: 55, onTime: 92 },
      { route: "KOL–BBSR", trips: 85, revenue: 32, onTime: 96 },
    ];

    const incidentData = [
      { subject: "Speeding", A: 120, fullMark: 150 },
      { subject: "Hard Braking", A: 98, fullMark: 150 },
      { subject: "Late Arrival", A: 86, fullMark: 150 },
      { subject: "Route Dev", A: 45, fullMark: 150 },
      { subject: "Idle Time", A: 110, fullMark: 150 },
    ];

    return successResponse({
      revenueData,
      routePerformance,
      incidentData,
    });
  } catch (error) {
    return serverErrorResponse(error);
  }
}
