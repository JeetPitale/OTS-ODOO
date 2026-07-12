"use client";

import { Header, KpiCard, StatusBadge, DataTable, type ColumnDef } from "@/components/shared";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Users, ShieldCheck, AlertTriangle, Plus, Filter, Download, Star } from "lucide-react";
import type { StatusVariant } from "@/lib/status-colors";

interface Driver {
  id: string;
  name: string;
  license: string;
  phone: string;
  status: StatusVariant;
  safetyScore: number;
  totalTrips: number;
  incidents: number;
  vehicle: string;
}

const drivers: Driver[] = [
  { id: "DRV-001", name: "Rajesh Kumar", license: "MH-0420210045678", phone: "+91 98765 43210", status: "on-trip", safetyScore: 94, totalTrips: 312, incidents: 1, vehicle: "MH-04 AB 1234" },
  { id: "DRV-002", name: "Amit Singh", license: "DL-0120200012345", phone: "+91 98765 43211", status: "available", safetyScore: 88, totalTrips: 276, incidents: 3, vehicle: "DL-01 CD 5678" },
  { id: "DRV-003", name: "Suresh Reddy", license: "KA-0120220098765", phone: "+91 98765 43212", status: "on-trip", safetyScore: 96, totalTrips: 198, incidents: 0, vehicle: "KA-01 EF 9012" },
  { id: "DRV-004", name: "Mohan Rao", license: "TS-0920190054321", phone: "+91 98765 43213", status: "on-trip", safetyScore: 72, totalTrips: 421, incidents: 7, vehicle: "TS-09 GH 3456" },
  { id: "DRV-005", name: "Debashis Das", license: "WB-0620210076543", phone: "+91 98765 43214", status: "off-duty", safetyScore: 91, totalTrips: 156, incidents: 2, vehicle: "WB-06 IJ 7890" },
  { id: "DRV-006", name: "Vikas Meena", license: "RJ-1420200034567", phone: "+91 98765 43215", status: "on-trip", safetyScore: 85, totalTrips: 245, incidents: 4, vehicle: "RJ-14 MN 3344" },
  { id: "DRV-007", name: "Pradeep Sharma", license: "MH-1220180023456", phone: "+91 98765 43216", status: "suspended", safetyScore: 58, totalTrips: 389, incidents: 12, vehicle: "—" },
  { id: "DRV-008", name: "Arjun Patel", license: "GJ-0520210087654", phone: "+91 98765 43217", status: "available", safetyScore: 93, totalTrips: 178, incidents: 1, vehicle: "Unassigned" },
];

function SafetyScoreCell({ score }: { score: number }) {
  const color =
    score >= 90 ? "text-emerald-600 bg-emerald-50" :
    score >= 75 ? "text-blue-600 bg-blue-50" :
    score >= 60 ? "text-amber-600 bg-amber-50" :
    "text-red-600 bg-red-50";
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-xs font-bold ${color}`}>
      <Star className="h-3 w-3" />
      {score}
    </span>
  );
}

const columns: ColumnDef<Driver>[] = [
  { header: "Driver ID", accessorKey: "id", sortable: true },
  { header: "Name", accessorKey: "name", sortable: true },
  { header: "License No.", accessorKey: "license" },
  { header: "Phone", accessorKey: "phone" },
  {
    header: "Status",
    accessorKey: "status",
    cell: (row) => <StatusBadge variant={row.status} />,
  },
  {
    header: "Safety Score",
    accessorKey: "safetyScore",
    sortable: true,
    cell: (row) => <SafetyScoreCell score={row.safetyScore} />,
  },
  { header: "Total Trips", accessorKey: "totalTrips", sortable: true },
  { header: "Incidents", accessorKey: "incidents", sortable: true },
  { header: "Assigned Vehicle", accessorKey: "vehicle" },
];

export default function DriversPage() {
  return (
    <>
      <Header title="Drivers & Safety Profiles" subtitle="Monitor driver performance and safety" />
      <div className="p-6 space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <KpiCard title="Total Drivers" value={89} icon={Users} trend={{ value: "+2 this month", direction: "up" }} />
          <KpiCard title="Avg Safety Score" value="87.2" icon={ShieldCheck} iconBgClass="bg-emerald-50" trend={{ value: "+1.4 vs last month", direction: "up" }} />
          <KpiCard title="Active Incidents" value={4} icon={AlertTriangle} iconBgClass="bg-red-50" trend={{ value: "2 pending review", direction: "down" }} />
          <KpiCard title="On Trip Now" value={38} icon={Users} iconBgClass="bg-blue-50" trend={{ value: "43% of drivers", direction: "neutral" }} />
        </div>

        <Card className="rounded-xl ambient-shadow border-0">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-semibold">All Drivers</CardTitle>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" className="h-8 rounded-lg text-xs gap-1">
                <Filter className="h-3.5 w-3.5" /> Filter
              </Button>
              <Button variant="outline" size="sm" className="h-8 rounded-lg text-xs gap-1">
                <Download className="h-3.5 w-3.5" /> Export
              </Button>
              <Button size="sm" className="h-8 rounded-lg text-xs gap-1 bg-primary hover:bg-primary/90 text-white">
                <Plus className="h-3.5 w-3.5" /> Add Driver
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <DataTable
              columns={columns}
              data={drivers}
              searchKey="name"
              searchPlaceholder="Search by driver name..."
            />
          </CardContent>
        </Card>
      </div>
    </>
  );
}
