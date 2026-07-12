"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Header, KpiCard, StatusBadge, DataTable, type ColumnDef } from "@/components/shared";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Users, ShieldCheck, AlertTriangle, Plus, Filter, Download, Star } from "lucide-react";
import { getDrivers, type Driver } from "@/lib/storage";

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
  {
    header: "Driver ID",
    accessorKey: "id",
    sortable: true,
    cell: (row) => (
      <Link href={`/drivers/${row.id}`} className="text-primary font-semibold hover:underline">
        {row.id}
      </Link>
    ),
  },
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
  {
    header: "Actions",
    accessorKey: "id",
    cell: (row) => (
      <Link href={`/drivers/${row.id}`}>
        <Button variant="outline" size="sm" className="h-7 text-xs rounded-lg border-primary/30 hover:border-primary text-primary hover:bg-primary/5">
          View Profile
        </Button>
      </Link>
    ),
  },
];

export default function DriversPage() {
  const [driversList, setDriversList] = useState<Driver[]>([]);
  const [totals, setTotals] = useState({
    total: 0,
    avgSafety: "0.0",
    incidents: 0,
    onTrip: 0,
  });

  useEffect(() => {
    const list = getDrivers();
    setDriversList(list);

    const total = list.length;
    const avgSafety = (list.reduce((acc, d) => acc + d.safetyScore, 0) / (total || 1)).toFixed(1);
    const incidents = list.reduce((acc, d) => acc + d.incidents, 0);
    const onTrip = list.filter((d) => d.status === "on-trip").length;

    setTotals({
      total,
      avgSafety,
      incidents,
      onTrip,
    });
  }, []);

  return (
    <>
      <Header title="Drivers & Safety Profiles" subtitle="Monitor driver performance and safety" />
      <div className="p-6 space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <KpiCard title="Total Drivers" value={totals.total} icon={Users} trend={{ value: "+2 this month", direction: "up" }} />
          <KpiCard title="Avg Safety Score" value={totals.avgSafety} icon={ShieldCheck} iconBgClass="bg-emerald-50" trend={{ value: "+1.4 vs last month", direction: "up" }} />
          <KpiCard title="Active Incidents" value={totals.incidents} icon={AlertTriangle} iconBgClass="bg-red-50" trend={{ value: "2 pending review", direction: "down" }} />
          <KpiCard title="On Trip Now" value={totals.onTrip} icon={Users} iconBgClass="bg-blue-50" trend={{ value: "43% of drivers", direction: "neutral" }} />
        </div>

        <Card className="rounded-xl ambient-shadow border-0 ring-0">
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
              data={driversList}
              searchKey="name"
              searchPlaceholder="Search by driver name..."
            />
          </CardContent>
        </Card>
      </div>
    </>
  );
}
