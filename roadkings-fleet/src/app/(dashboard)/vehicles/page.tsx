"use client";

import { useEffect, useState } from "react";
import { Header, KpiCard, StatusBadge, DataTable, type ColumnDef } from "@/components/shared";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Truck, Plus, Filter, Download, CheckCircle } from "lucide-react";
import { getVehicles, type Vehicle } from "@/lib/storage";

const columns: ColumnDef<Vehicle>[] = [
  { header: "Vehicle No.", accessorKey: "number", sortable: true },
  { header: "Type", accessorKey: "type", sortable: true },
  { header: "Make / Model", accessorKey: "make" },
  { header: "Year", accessorKey: "year", sortable: true },
  {
    header: "Status",
    accessorKey: "status",
    cell: (row) => <StatusBadge variant={row.status} />,
  },
  { header: "Assigned Driver", accessorKey: "driver" },
  { header: "Mileage", accessorKey: "mileage", sortable: true },
  { header: "Next Service", accessorKey: "nextService", sortable: true },
];

export default function VehiclesPage() {
  const [vehiclesList, setVehiclesList] = useState<Vehicle[]>([]);
  const [totals, setTotals] = useState({
    total: 0,
    onTrip: 0,
    available: 0,
    maintenance: 0,
  });

  useEffect(() => {
    const list = getVehicles();
    setVehiclesList(list);

    const total = list.length;
    const onTrip = list.filter((v) => v.status === "on-trip").length;
    const available = list.filter((v) => v.status === "available").length;
    const maintenance = list.filter((v) => v.status === "in-maintenance" || v.status === "in-shop").length;

    setTotals({
      total,
      onTrip,
      available,
      maintenance,
    });
  }, []);

  return (
    <>
      <Header title="Vehicle Registry" subtitle="Manage your entire fleet" />
      <div className="p-6 space-y-6">
        {/* KPIs */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <KpiCard title="Total Vehicles" value={totals.total} icon={Truck} trend={{ value: "+4 this month", direction: "up" }} />
          <KpiCard title="On Trip" value={totals.onTrip} icon={Truck} iconBgClass="bg-blue-50" trend={{ value: "27% of fleet", direction: "neutral" }} />
          <KpiCard title="Available" value={totals.available} icon={CheckCircle} iconBgClass="bg-emerald-50" trend={{ value: "44% ready", direction: "up" }} />
          <KpiCard title="In Maintenance" value={totals.maintenance} icon={Truck} iconBgClass="bg-orange-50" trend={{ value: "3 overdue", direction: "down" }} />
        </div>

        {/* Table */}
        <Card className="rounded-xl ambient-shadow border-0 ring-0">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-semibold">All Vehicles</CardTitle>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" className="h-8 rounded-lg text-xs gap-1">
                <Filter className="h-3.5 w-3.5" /> Filter
              </Button>
              <Button variant="outline" size="sm" className="h-8 rounded-lg text-xs gap-1">
                <Download className="h-3.5 w-3.5" /> Export
              </Button>
              <Button size="sm" className="h-8 rounded-lg text-xs gap-1 bg-primary hover:bg-primary/90 text-white">
                <Plus className="h-3.5 w-3.5" /> Add Vehicle
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <DataTable
              columns={columns}
              data={vehiclesList}
              searchKey="number"
              searchPlaceholder="Search by vehicle number..."
            />
          </CardContent>
        </Card>
      </div>
    </>
  );
}
