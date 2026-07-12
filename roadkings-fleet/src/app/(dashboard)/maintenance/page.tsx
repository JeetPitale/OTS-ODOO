"use client";

import { Header, KpiCard, StatusBadge, DataTable, type ColumnDef } from "@/components/shared";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Wrench, AlertTriangle, Clock, Plus, Filter, Download, IndianRupee } from "lucide-react";
import type { StatusVariant } from "@/lib/status-colors";

interface MaintenanceRecord {
  id: string;
  vehicle: string;
  type: string;
  description: string;
  status: StatusVariant;
  priority: string;
  scheduledDate: string;
  completedDate: string;
  cost: string;
  technician: string;
}

const maintenanceRecords: MaintenanceRecord[] = [
  { id: "MNT-401", vehicle: "MH-04 AB 1234", type: "Preventive", description: "Engine oil change & filter replacement", status: "scheduled", priority: "Medium", scheduledDate: "2025-01-15", completedDate: "—", cost: "₹4,200", technician: "Ram Auto Works" },
  { id: "MNT-400", vehicle: "KA-01 EF 9012", type: "Corrective", description: "Brake pad replacement – front axle", status: "in-maintenance", priority: "High", scheduledDate: "2025-01-08", completedDate: "—", cost: "₹12,500", technician: "Fleet Service Hub" },
  { id: "MNT-399", vehicle: "DL-01 CD 5678", type: "Preventive", description: "Tyre rotation and alignment check", status: "completed", priority: "Low", scheduledDate: "2025-01-05", completedDate: "2025-01-05", cost: "₹3,800", technician: "Tyre King Services" },
  { id: "MNT-398", vehicle: "TS-09 GH 3456", type: "Corrective", description: "AC compressor repair", status: "completed", priority: "Medium", scheduledDate: "2025-01-03", completedDate: "2025-01-04", cost: "₹8,900", technician: "CoolTech Motors" },
  { id: "MNT-397", vehicle: "MH-12 OP 5566", type: "Corrective", description: "Transmission overhaul – gearbox leak", status: "in-maintenance", priority: "Critical", scheduledDate: "2025-01-06", completedDate: "—", cost: "₹45,000", technician: "Precision Gears Pvt Ltd" },
  { id: "MNT-396", vehicle: "WB-06 IJ 7890", type: "Preventive", description: "Annual fitness inspection (RTO)", status: "scheduled", priority: "High", scheduledDate: "2025-01-20", completedDate: "—", cost: "₹2,500", technician: "RTO Authorized Center" },
  { id: "MNT-395", vehicle: "GJ-05 KL 1122", type: "Corrective", description: "Exhaust system welding & patch", status: "completed", priority: "Low", scheduledDate: "2024-12-28", completedDate: "2024-12-29", cost: "₹6,200", technician: "Shree Fabricators" },
];

function PriorityBadge({ priority }: { priority: string }) {
  const colors: Record<string, string> = {
    Critical: "bg-red-100 text-red-700 border-red-200",
    High: "bg-orange-100 text-orange-700 border-orange-200",
    Medium: "bg-yellow-100 text-yellow-700 border-yellow-200",
    Low: "bg-slate-100 text-slate-600 border-slate-200",
  };
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-xs font-semibold border ${colors[priority] ?? colors["Low"]}`}>
      {priority}
    </span>
  );
}

const columns: ColumnDef<MaintenanceRecord>[] = [
  { header: "ID", accessorKey: "id", sortable: true },
  { header: "Vehicle", accessorKey: "vehicle", sortable: true },
  { header: "Type", accessorKey: "type", sortable: true },
  { header: "Description", accessorKey: "description" },
  {
    header: "Status",
    accessorKey: "status",
    cell: (row) => <StatusBadge variant={row.status} />,
  },
  {
    header: "Priority",
    accessorKey: "priority",
    sortable: true,
    cell: (row) => <PriorityBadge priority={row.priority} />,
  },
  { header: "Scheduled", accessorKey: "scheduledDate", sortable: true },
  { header: "Cost", accessorKey: "cost", sortable: true },
  { header: "Technician", accessorKey: "technician" },
];

export default function MaintenancePage() {
  return (
    <>
      <Header title="Maintenance" subtitle="Schedule and track vehicle maintenance" />
      <div className="p-6 space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <KpiCard title="Pending Jobs" value={8} icon={Wrench} trend={{ value: "3 overdue", direction: "down" }} />
          <KpiCard title="In Progress" value={4} icon={Clock} iconBgClass="bg-orange-50" trend={{ value: "2 critical", direction: "down" }} />
          <KpiCard title="Completed (MTD)" value={23} icon={Wrench} iconBgClass="bg-emerald-50" trend={{ value: "+8 vs last month", direction: "up" }} />
          <KpiCard title="Total Cost (MTD)" value="₹2.8L" icon={IndianRupee} iconBgClass="bg-amber-50" trend={{ value: "12% under budget", direction: "up" }} />
        </div>

        <Card className="rounded-xl ambient-shadow border-0 ring-0">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-semibold flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-primary" />
              Maintenance Records
            </CardTitle>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" className="h-8 rounded-lg text-xs gap-1">
                <Filter className="h-3.5 w-3.5" /> Filter
              </Button>
              <Button variant="outline" size="sm" className="h-8 rounded-lg text-xs gap-1">
                <Download className="h-3.5 w-3.5" /> Export
              </Button>
              <Button size="sm" className="h-8 rounded-lg text-xs gap-1 bg-primary hover:bg-primary/90 text-white">
                <Plus className="h-3.5 w-3.5" /> Schedule Job
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <DataTable
              columns={columns}
              data={maintenanceRecords}
              searchKey="vehicle"
              searchPlaceholder="Search by vehicle number..."
            />
          </CardContent>
        </Card>
      </div>
    </>
  );
}
