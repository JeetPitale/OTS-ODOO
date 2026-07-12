"use client";

import { useEffect, useState } from "react";
import { Header, KpiCard, StatusBadge, DataTable, type ColumnDef } from "@/components/shared";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Wrench, AlertTriangle, Clock, Plus, Filter, Download, IndianRupee, X } from "lucide-react";
import { useMaintenanceRecords, useCreateMaintenance, useUpdateMaintenance, useDeleteMaintenance } from "@/hooks/useMaintenance";
import { useVehicles } from "@/hooks/useVehicles";

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

export default function MaintenancePage() {
  const { data: recordsData, isLoading } = useMaintenanceRecords({ limit: 100 });
  const { data: vehiclesData } = useVehicles({ limit: 100 });

  const createMaintenance = useCreateMaintenance();
  const updateMaintenance = useUpdateMaintenance();
  const deleteMaintenance = useDeleteMaintenance();

  const recordsList = recordsData?.items || [];
  const vehiclesList = vehiclesData?.items || [];
  
  const [isOpen, setIsOpen] = useState(false);
  const [editingRecord, setEditingRecord] = useState<any | null>(null);

  const [formData, setFormData] = useState({
    vehicle: "",
    type: "Preventive",
    description: "",
    status: "scheduled" as any,
    priority: "Medium",
    scheduledDate: new Date().toISOString().split("T")[0],
    completedDate: "—",
    cost: "₹0",
    technician: "",
  });

  const pendingJobs = recordsList.filter((r) => r.status === "scheduled").length;
  const inProgress = recordsList.filter((r) => r.status === "in_progress" || (r.status as any) === "in_maintenance" || (r.status as any) === "in-maintenance" || (r.status as any) === "in-shop").length;
  const completed = recordsList.filter((r) => r.status === "completed").length;

  // Calculate total cost dynamically
  const costSum = recordsList
    .map((r) => parseInt(r.cost?.replace(/[^0-9]/g, "") || "0") || 0)
    .reduce((a, b) => a + b, 0);

  const totals = {
    pendingJobs,
    inProgress,
    completed,
    totalCost: `₹${(costSum / 1000).toFixed(1)}K`,
  };

  const handleOpenAdd = () => {
    setEditingRecord(null);
    setFormData({
      vehicle: vehiclesList[0]?.number || "",
      type: "Preventive",
      description: "",
      status: "scheduled",
      priority: "Medium",
      scheduledDate: new Date().toISOString().split("T")[0],
      completedDate: "—",
      cost: "₹1,500",
      technician: "",
    });
    setIsOpen(true);
  };

  const handleOpenEdit = (r: any) => {
    setEditingRecord(r);
    setFormData({
      vehicle: r.vehicle,
      type: r.type,
      description: r.description,
      status: r.status,
      priority: r.priority,
      scheduledDate: r.scheduledDate,
      completedDate: r.completedDate,
      cost: r.cost,
      technician: r.technician,
    });
    setIsOpen(true);
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (editingRecord) {
      await updateMaintenance.mutateAsync({
        id: editingRecord.id,
        data: formData as any,
      });
    } else {
      await createMaintenance.mutateAsync(formData as any);
    }
    setIsOpen(false);
  };

  const columns: ColumnDef<any>[] = [
    { header: "ID", accessorKey: "id", sortable: true },
    { header: "Vehicle", accessorKey: "vehicle", sortable: true },
    { header: "Type", accessorKey: "type", sortable: true },
    { header: "Description", accessorKey: "description" },
    {
      header: "Status",
      accessorKey: "status",
      cell: (row) => <StatusBadge variant={row.status.replace("_", "-") as any} />,
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
    {
      header: "Actions",
      accessorKey: "id",
      cell: (row) => (
        <div className="flex gap-1">
          <Button
            variant="outline"
            size="sm"
            className="h-7 text-xs rounded-lg border-primary/20 hover:border-primary text-primary px-2"
            onClick={() => handleOpenEdit(row)}
          >
            Edit
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="h-7 text-xs rounded-lg text-red-500 hover:text-red-700 hover:bg-red-50 px-2"
            onClick={async () => {
              if (confirm(`Are you sure you want to delete record ${row.id}?`)) {
                await deleteMaintenance.mutateAsync(row.id);
              }
            }}
          >
            Delete
          </Button>
        </div>
      ),
    },
  ];

  return (
    <>
      <Header title="Maintenance" subtitle="Schedule and track vehicle maintenance" />
      <div className="p-6 space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <KpiCard title="Pending Jobs" value={totals.pendingJobs} icon={Wrench} trend={{ value: "Jobs scheduled", direction: "neutral" }} />
          <KpiCard title="In Progress" value={totals.inProgress} icon={Clock} iconBgClass="bg-orange-50" trend={{ value: "Currently in shop", direction: "neutral" }} />
          <KpiCard title="Completed" value={totals.completed} icon={Wrench} iconBgClass="bg-emerald-50" trend={{ value: "Lifetime completed", direction: "up" }} />
          <KpiCard title="Total Cost" value={totals.totalCost} icon={IndianRupee} iconBgClass="bg-amber-50" trend={{ value: "Dynamic calculation", direction: "up" }} />
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
              <Button onClick={handleOpenAdd} size="sm" className="h-8 rounded-lg text-xs gap-1 bg-primary hover:bg-primary/90 text-white">
                <Plus className="h-3.5 w-3.5" /> Schedule Job
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <DataTable
              columns={columns}
              data={recordsList}
              searchKey="vehicle"
              searchPlaceholder="Search by vehicle number..."
            />
          </CardContent>
        </Card>
      </div>

      {/* Modal CRUD dialog */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="w-full max-w-lg bg-white rounded-2xl shadow-xl overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="bg-gradient-to-r from-orange-500 to-amber-500 p-6 text-white flex justify-between items-center">
              <div>
                <h3 className="text-lg font-bold">
                  {editingRecord ? "Edit Maintenance Job" : "Schedule Maintenance Job"}
                </h3>
                <p className="text-white/80 text-xs">
                  {editingRecord ? "Modify job assignment or details" : "Schedule preventive or corrective service"}
                </p>
              </div>
              <button onClick={() => setIsOpen(false)} className="text-white hover:text-orange-100 transition-colors">
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleFormSubmit} className="p-6 space-y-4 max-h-[75vh] overflow-y-auto">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label htmlFor="vehicle" className="text-xs font-semibold text-slate-700">Vehicle No.</Label>
                  <select
                    id="vehicle"
                    value={formData.vehicle}
                    onChange={(e) => setFormData({ ...formData, vehicle: e.target.value })}
                    className="w-full h-9 px-3 rounded-lg border border-input bg-transparent text-sm outline-none focus:ring-1 focus:ring-ring"
                    required
                  >
                    <option value="" disabled>Select vehicle</option>
                    {vehiclesList.map((v) => (
                      <option key={v.id} value={v.number}>{v.number} ({v.make})</option>
                    ))}
                  </select>
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="type" className="text-xs font-semibold text-slate-700">Service Type</Label>
                  <select
                    id="type"
                    value={formData.type}
                    onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                    className="w-full h-9 px-3 rounded-lg border border-input bg-transparent text-sm outline-none focus:ring-1 focus:ring-ring"
                  >
                    <option value="Preventive">Preventive</option>
                    <option value="Corrective">Corrective</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="description" className="text-xs font-semibold text-slate-700">Description</Label>
                <Input
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Engine oil change & filter replacement"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label htmlFor="status" className="text-xs font-semibold text-slate-700">Status</Label>
                  <select
                    id="status"
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
                    className="w-full h-9 px-3 rounded-lg border border-input bg-transparent text-sm outline-none focus:ring-1 focus:ring-ring"
                  >
                    <option value="scheduled">Scheduled</option>
                    <option value="in-maintenance">In Maintenance</option>
                    <option value="completed">Completed</option>
                  </select>
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="priority" className="text-xs font-semibold text-slate-700">Priority</Label>
                  <select
                    id="priority"
                    value={formData.priority}
                    onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                    className="w-full h-9 px-3 rounded-lg border border-input bg-transparent text-sm outline-none focus:ring-1 focus:ring-ring"
                  >
                    <option value="Low">Low</option>
                    <option value="Medium">Medium</option>
                    <option value="High">High</option>
                    <option value="Critical">Critical</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label htmlFor="scheduledDate" className="text-xs font-semibold text-slate-700">Scheduled Date</Label>
                  <Input
                    id="scheduledDate"
                    type="date"
                    value={formData.scheduledDate}
                    onChange={(e) => setFormData({ ...formData, scheduledDate: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="completedDate" className="text-xs font-semibold text-slate-700">Completed Date</Label>
                  <Input
                    id="completedDate"
                    value={formData.completedDate}
                    onChange={(e) => setFormData({ ...formData, completedDate: e.target.value })}
                    placeholder="2025-01-05 or —"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label htmlFor="cost" className="text-xs font-semibold text-slate-700">Estimated/Actual Cost</Label>
                  <Input
                    id="cost"
                    value={formData.cost}
                    onChange={(e) => setFormData({ ...formData, cost: e.target.value })}
                    placeholder="₹4,200"
                    required
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="technician" className="text-xs font-semibold text-slate-700">Technician / Garage</Label>
                  <Input
                    id="technician"
                    value={formData.technician}
                    onChange={(e) => setFormData({ ...formData, technician: e.target.value })}
                    placeholder="Ram Auto Works"
                    required
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-4 border-t border-slate-100">
                <Button type="button" variant="outline" onClick={() => setIsOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" className="bg-primary text-white hover:bg-primary/95">
                  {editingRecord ? "Save Changes" : "Schedule Job"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
