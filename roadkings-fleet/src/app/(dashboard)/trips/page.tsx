"use client";

import { useEffect, useState } from "react";
import { Header, KpiCard, StatusBadge, DataTable, type ColumnDef } from "@/components/shared";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Route, Clock, MapPin, Plus, Filter, Download, IndianRupee } from "lucide-react";
import { getTrips, type Trip } from "@/lib/storage";

const columns: ColumnDef<Trip>[] = [
  { header: "Trip ID", accessorKey: "id", sortable: true },
  {
    header: "Route",
    accessorKey: "origin",
    cell: (row) => (
      <div className="flex items-center gap-1 text-sm font-medium">
        <MapPin className="h-3.5 w-3.5 text-primary flex-shrink-0" />
        {row.origin} → {row.destination}
      </div>
    ),
  },
  { header: "Driver", accessorKey: "driver", sortable: true },
  { header: "Vehicle", accessorKey: "vehicle" },
  {
    header: "Status",
    accessorKey: "status",
    cell: (row) => <StatusBadge variant={row.status} />,
  },
  { header: "Distance", accessorKey: "distance", sortable: true },
  { header: "ETA", accessorKey: "eta" },
  { header: "Revenue", accessorKey: "revenue", sortable: true },
  { header: "Start Date", accessorKey: "startDate", sortable: true },
];

export default function TripsPage() {
  const [tripsList, setTripsList] = useState<Trip[]>([]);
  const [totals, setTotals] = useState({
    activeTrips: 0,
    onTimeRate: "98.2%",
    totalDistance: "28,430 km",
    revenue: "₹48.6L",
  });

  useEffect(() => {
    const list = getTrips();
    setTripsList(list);

    const activeTrips = list.filter((t) => t.status === "on-trip").length;
    // Keep other KPIs aligned or semi-mocked using active count
    setTotals({
      activeTrips,
      onTimeRate: "98.2%",
      totalDistance: "28,430 km",
      revenue: "₹48.6L",
    });
  }, []);

  return (
    <>
      <Header title="Trip Dispatch" subtitle="Schedule, track and manage trips" />
      <div className="p-6 space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <KpiCard title="Active Trips" value={totals.activeTrips} icon={Route} trend={{ value: "+5 today", direction: "up" }} />
          <KpiCard title="On-Time Rate" value={totals.onTimeRate} icon={Clock} iconBgClass="bg-emerald-50" trend={{ value: "+0.3% vs last week", direction: "up" }} />
          <KpiCard title="Total Distance (MTD)" value={totals.totalDistance} icon={MapPin} iconBgClass="bg-blue-50" trend={{ value: "12% more", direction: "up" }} />
          <KpiCard title="Revenue (MTD)" value={totals.revenue} icon={IndianRupee} iconBgClass="bg-amber-50" trend={{ value: "+15% vs target", direction: "up" }} />
        </div>

        <Card className="rounded-xl ambient-shadow border-0 ring-0">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-semibold">All Trips</CardTitle>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" className="h-8 rounded-lg text-xs gap-1">
                <Filter className="h-3.5 w-3.5" /> Filter
              </Button>
              <Button variant="outline" size="sm" className="h-8 rounded-lg text-xs gap-1">
                <Download className="h-3.5 w-3.5" /> Export
              </Button>
              <Button size="sm" className="h-8 rounded-lg text-xs gap-1 bg-primary hover:bg-primary/90 text-white">
                <Plus className="h-3.5 w-3.5" /> Dispatch Trip
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <DataTable
              columns={columns}
              data={tripsList}
              searchKey="id"
              searchPlaceholder="Search by trip ID..."
            />
          </CardContent>
        </Card>
      </div>
    </>
  );
}
