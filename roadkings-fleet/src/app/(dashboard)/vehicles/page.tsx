"use client";

import { Header, KpiCard, StatusBadge, DataTable, type ColumnDef } from "@/components/shared";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Truck, Plus, Filter, Download, CheckCircle } from "lucide-react";
import type { StatusVariant } from "@/lib/status-colors";

interface Vehicle {
  id: string;
  number: string;
  type: string;
  make: string;
  year: number;
  status: StatusVariant;
  driver: string;
  lastService: string;
  nextService: string;
  mileage: string;
}

const vehicles: Vehicle[] = [
  { id: "V-001", number: "MH-04 AB 1234", type: "Truck – 16T", make: "Tata Prima 4028.S", year: 2022, status: "on-trip", driver: "Rajesh Kumar", lastService: "2024-11-15", nextService: "2025-02-15", mileage: "45,230 km" },
  { id: "V-002", number: "DL-01 CD 5678", type: "Truck – 12T", make: "Ashok Leyland 1920", year: 2021, status: "available", driver: "Unassigned", lastService: "2024-12-01", nextService: "2025-03-01", mileage: "62,100 km" },
  { id: "V-003", number: "KA-01 EF 9012", type: "Trailer – 20T", make: "BharatBenz 1617R", year: 2023, status: "in-maintenance", driver: "Suresh Reddy", lastService: "2024-10-20", nextService: "2025-01-20", mileage: "31,400 km" },
  { id: "V-004", number: "TS-09 GH 3456", type: "Truck – 16T", make: "Tata Signa 4825.TK", year: 2020, status: "on-trip", driver: "Mohan Rao", lastService: "2024-11-28", nextService: "2025-02-28", mileage: "78,920 km" },
  { id: "V-005", number: "WB-06 IJ 7890", type: "Mini Truck – 5T", make: "Eicher Pro 3015", year: 2023, status: "available", driver: "Debashis Das", lastService: "2024-12-10", nextService: "2025-03-10", mileage: "18,750 km" },
  { id: "V-006", number: "GJ-05 KL 1122", type: "Truck – 16T", make: "Volvo FM 380", year: 2019, status: "retired", driver: "—", lastService: "2024-09-05", nextService: "—", mileage: "1,45,000 km" },
  { id: "V-007", number: "RJ-14 MN 3344", type: "Tanker – 10KL", make: "Ashok Leyland 2820", year: 2022, status: "on-trip", driver: "Vikas Meena", lastService: "2024-11-20", nextService: "2025-02-20", mileage: "52,800 km" },
  { id: "V-008", number: "MH-12 OP 5566", type: "Truck – 12T", make: "Tata LPT 1613", year: 2021, status: "in-shop", driver: "—", lastService: "2024-12-15", nextService: "2025-01-05", mileage: "67,300 km" },
];

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
  return (
    <>
      <Header title="Vehicle Registry" subtitle="Manage your entire fleet" />
      <div className="p-6 space-y-6">
        {/* KPIs */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <KpiCard title="Total Vehicles" value={156} icon={Truck} trend={{ value: "+4 this month", direction: "up" }} />
          <KpiCard title="On Trip" value={42} icon={Truck} iconBgClass="bg-blue-50" trend={{ value: "27% of fleet", direction: "neutral" }} />
          <KpiCard title="Available" value={68} icon={CheckCircle} iconBgClass="bg-emerald-50" trend={{ value: "44% ready", direction: "up" }} />
          <KpiCard title="In Maintenance" value={18} icon={Truck} iconBgClass="bg-orange-50" trend={{ value: "3 overdue", direction: "down" }} />
        </div>

        {/* Table */}
        <Card className="rounded-xl ambient-shadow border-0">
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
              data={vehicles}
              searchKey="number"
              searchPlaceholder="Search by vehicle number..."
            />
          </CardContent>
        </Card>
      </div>
    </>
  );
}
