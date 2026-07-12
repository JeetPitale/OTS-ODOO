"use client";

import { Header, KpiCard, StatusBadge, DataTable, type ColumnDef } from "@/components/shared";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Route, Clock, MapPin, Plus, Filter, Download, IndianRupee } from "lucide-react";
import type { StatusVariant } from "@/lib/status-colors";

interface Trip {
  id: string;
  origin: string;
  destination: string;
  driver: string;
  vehicle: string;
  status: StatusVariant;
  distance: string;
  eta: string;
  revenue: string;
  startDate: string;
}

const trips: Trip[] = [
  { id: "TRP-1024", origin: "Mumbai", destination: "Pune", driver: "Rajesh Kumar", vehicle: "MH-04 AB 1234", status: "on-trip", distance: "148 km", eta: "2h 15m", revenue: "₹18,500", startDate: "2025-01-08 06:30" },
  { id: "TRP-1023", origin: "Delhi", destination: "Jaipur", driver: "Amit Singh", vehicle: "DL-01 CD 5678", status: "completed", distance: "280 km", eta: "—", revenue: "₹34,200", startDate: "2025-01-07 04:00" },
  { id: "TRP-1022", origin: "Bangalore", destination: "Chennai", driver: "Suresh Reddy", vehicle: "KA-01 EF 9012", status: "on-trip", distance: "346 km", eta: "4h 30m", revenue: "₹42,800", startDate: "2025-01-08 02:00" },
  { id: "TRP-1021", origin: "Hyderabad", destination: "Vizag", driver: "Mohan Rao", vehicle: "TS-09 GH 3456", status: "scheduled", distance: "625 km", eta: "—", revenue: "₹56,000", startDate: "2025-01-09 05:00" },
  { id: "TRP-1020", origin: "Kolkata", destination: "Bhubaneswar", driver: "Debashis Das", vehicle: "WB-06 IJ 7890", status: "completed", distance: "440 km", eta: "—", revenue: "₹38,400", startDate: "2025-01-06 03:30" },
  { id: "TRP-1019", origin: "Mumbai", destination: "Nashik", driver: "Vikas Meena", vehicle: "RJ-14 MN 3344", status: "on-trip", distance: "167 km", eta: "1h 45m", revenue: "₹15,200", startDate: "2025-01-08 08:00" },
  { id: "TRP-1018", origin: "Ahmedabad", destination: "Surat", driver: "Arjun Patel", vehicle: "GJ-05 KL 1122", status: "completed", distance: "265 km", eta: "—", revenue: "₹29,100", startDate: "2025-01-05 06:00" },
  { id: "TRP-1017", origin: "Chennai", destination: "Coimbatore", driver: "Suresh Reddy", vehicle: "KA-01 EF 9012", status: "cancelled", distance: "505 km", eta: "—", revenue: "₹0", startDate: "2025-01-04 05:00" },
];

const columns: ColumnDef<Trip>[] = [
  { header: "Trip ID", accessorKey: "id", sortable: true },
  {
    header: "Route",
    accessorKey: "origin",
    cell: (row) => (
      <div className="flex items-center gap-1 text-sm">
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
  return (
    <>
      <Header title="Trip Dispatch" subtitle="Schedule, track and manage trips" />
      <div className="p-6 space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <KpiCard title="Active Trips" value={42} icon={Route} trend={{ value: "+5 today", direction: "up" }} />
          <KpiCard title="On-Time Rate" value="98.2%" icon={Clock} iconBgClass="bg-emerald-50" trend={{ value: "+0.3% vs last week", direction: "up" }} />
          <KpiCard title="Total Distance (MTD)" value="28,430 km" icon={MapPin} iconBgClass="bg-blue-50" trend={{ value: "12% more", direction: "up" }} />
          <KpiCard title="Revenue (MTD)" value="₹48.6L" icon={IndianRupee} iconBgClass="bg-amber-50" trend={{ value: "+15% vs target", direction: "up" }} />
        </div>

        <Card className="rounded-xl ambient-shadow border-0">
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
              data={trips}
              searchKey="id"
              searchPlaceholder="Search by trip ID..."
            />
          </CardContent>
        </Card>
      </div>
    </>
  );
}
