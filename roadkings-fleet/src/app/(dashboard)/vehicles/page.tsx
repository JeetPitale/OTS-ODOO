"use client";

import { useEffect, useState } from "react";
import { Header, KpiCard, StatusBadge, DataTable, type ColumnDef } from "@/components/shared";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Truck, Plus, Filter, Download, CheckCircle, X } from "lucide-react";
import { useVehicles, useCreateVehicle, useUpdateVehicle, useDeleteVehicle } from "@/hooks/useVehicles";
import { useDrivers } from "@/hooks/useDrivers";

export default function VehiclesPage() {
  const { data: vehiclesData, isLoading } = useVehicles({ limit: 100 });
  const { data: driversData } = useDrivers({ limit: 100 });
  
  const createVehicle = useCreateVehicle();
  const updateVehicle = useUpdateVehicle();
  const deleteVehicle = useDeleteVehicle();

  const vehiclesList = vehiclesData?.items || [];
  const driversList = driversData?.items || [];

  const [isOpen, setIsOpen] = useState(false);
  const [editingVehicle, setEditingVehicle] = useState<any>(null);

  const [formData, setFormData] = useState({
    number: "",
    type: "",
    make: "",
    year: new Date().getFullYear(),
    status: "available" as any,
    driver: "Unassigned",
    lastService: new Date().toISOString().split("T")[0],
    nextService: new Date().toISOString().split("T")[0],
    mileage: "0 km",
    capacityKg: 16000,
  });

  const totals = {
    total: vehiclesList.length,
    onTrip: vehiclesList.filter((v) => (v.status as any) === "on_trip" || (v.status as any) === "on-trip").length,
    available: vehiclesList.filter((v) => (v.status as any) === "available").length,
    maintenance: vehiclesList.filter((v) => (v.status as any) === "in_maintenance" || (v.status as any) === "in-maintenance" || (v.status as any) === "in_shop" || (v.status as any) === "in-shop").length,
  };

  const handleOpenAdd = () => {
    setEditingVehicle(null);
    setFormData({
      number: "",
      type: "Truck – 16T",
      make: "",
      year: new Date().getFullYear(),
      status: "available",
      driver: "Unassigned",
      lastService: new Date().toISOString().split("T")[0],
      nextService: new Date().toISOString().split("T")[0],
      mileage: "0 km",
      capacityKg: 16000,
    });
    setIsOpen(true);
  };

  const handleOpenEdit = (v: any) => {
    setEditingVehicle(v);
    setFormData({
      number: v.number,
      type: v.type,
      make: v.make,
      year: v.year,
      status: v.status,
      driver: v.driver,
      lastService: v.lastService,
      nextService: v.nextService,
      mileage: v.mileage,
      capacityKg: v.capacityKg || 16000,
    });
    setIsOpen(true);
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (editingVehicle) {
      await updateVehicle.mutateAsync({
        id: editingVehicle.id,
        data: formData,
      });
    } else {
      await createVehicle.mutateAsync(formData);
    }
    setIsOpen(false);
  };

  const columns: ColumnDef<any>[] = [
    { header: "Vehicle No.", accessorKey: "number", sortable: true },
    { header: "Type", accessorKey: "type", sortable: true },
    { header: "Make / Model", accessorKey: "make" },
    { header: "Year", accessorKey: "year", sortable: true },
    {
      header: "Status",
      accessorKey: "status",
      cell: (row) => <StatusBadge variant={row.status.replace("_", "-") as any} />,
    },
    { header: "Assigned Driver", accessorKey: "driver" },
    { header: "Mileage", accessorKey: "mileage", sortable: true },
    { header: "Next Service", accessorKey: "nextService", sortable: true },
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
              if (confirm(`Are you sure you want to delete vehicle ${row.number}?`)) {
                await deleteVehicle.mutateAsync(row.id);
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
      <Header title="Vehicle Registry" subtitle="Manage your entire fleet" />
      <div className="p-6 space-y-6">
        {/* KPIs */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <KpiCard title="Total Vehicles" value={totals.total} icon={Truck} trend={{ value: "Active in system", direction: "neutral" }} />
          <KpiCard title="On Trip" value={totals.onTrip} icon={Truck} iconBgClass="bg-blue-50" trend={{ value: `${((totals.onTrip / (totals.total || 1)) * 100).toFixed(0)}% of fleet`, direction: "neutral" }} />
          <KpiCard title="Available" value={totals.available} icon={CheckCircle} iconBgClass="bg-emerald-50" trend={{ value: `${((totals.available / (totals.total || 1)) * 100).toFixed(0)}% ready`, direction: "up" }} />
          <KpiCard title="In Maintenance" value={totals.maintenance} icon={Truck} iconBgClass="bg-orange-50" trend={{ value: "Needs attention", direction: "down" }} />
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
              <Button onClick={handleOpenAdd} size="sm" className="h-8 rounded-lg text-xs gap-1 bg-primary hover:bg-primary/90 text-white">
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

      {/* Slide-over or Modal for CRUD */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="w-full max-w-lg bg-white rounded-2xl shadow-xl overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="bg-gradient-to-r from-orange-500 to-amber-500 p-6 text-white flex justify-between items-center">
              <div>
                <h3 className="text-lg font-bold">
                  {editingVehicle ? "Edit Vehicle" : "Add New Vehicle"}
                </h3>
                <p className="text-white/80 text-xs">
                  {editingVehicle ? "Update vehicle registration details" : "Register a new vehicle into the fleet"}
                </p>
              </div>
              <button onClick={() => setIsOpen(false)} className="text-white hover:text-orange-100 transition-colors">
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleFormSubmit} className="p-6 space-y-4 max-h-[75vh] overflow-y-auto">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label htmlFor="number" className="text-xs font-semibold text-slate-700">Vehicle Number</Label>
                  <Input
                    id="number"
                    value={formData.number}
                    onChange={(e) => setFormData({ ...formData, number: e.target.value })}
                    placeholder="MH-04 AB 1234"
                    required
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="type" className="text-xs font-semibold text-slate-700">Vehicle Type</Label>
                  <Input
                    id="type"
                    value={formData.type}
                    onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                    placeholder="Truck – 16T"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label htmlFor="make" className="text-xs font-semibold text-slate-700">Make / Model</Label>
                  <Input
                    id="make"
                    value={formData.make}
                    onChange={(e) => setFormData({ ...formData, make: e.target.value })}
                    placeholder="Tata Prima 4028.S"
                    required
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="year" className="text-xs font-semibold text-slate-700">Year</Label>
                  <Input
                    id="year"
                    type="number"
                    value={formData.year}
                    onChange={(e) => setFormData({ ...formData, year: parseInt(e.target.value) || new Date().getFullYear() })}
                    required
                  />
                </div>
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
                    <option value="available">Available</option>
                    <option value="on-trip">On Trip</option>
                    <option value="in-maintenance">In Maintenance</option>
                    <option value="in-shop">In Shop</option>
                    <option value="retired">Retired</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="driver" className="text-xs font-semibold text-slate-700">Assigned Driver</Label>
                  <select
                    id="driver"
                    value={formData.driver}
                    onChange={(e) => setFormData({ ...formData, driver: e.target.value })}
                    className="w-full h-9 px-3 rounded-lg border border-input bg-transparent text-sm outline-none focus:ring-1 focus:ring-ring"
                  >
                    <option value="Unassigned">Unassigned</option>
                    {driversList.map((d) => (
                      <option key={d.id} value={d.name}>{d.name} ({d.id})</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label htmlFor="mileage" className="text-xs font-semibold text-slate-700">Mileage</Label>
                  <Input
                    id="mileage"
                    value={formData.mileage}
                    onChange={(e) => setFormData({ ...formData, mileage: e.target.value })}
                    placeholder="45,230 km"
                    required
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="capacityKg" className="text-xs font-semibold text-slate-700">Capacity (kg)</Label>
                  <Input
                    id="capacityKg"
                    type="number"
                    value={formData.capacityKg}
                    onChange={(e) => setFormData({ ...formData, capacityKg: parseInt(e.target.value) || 0 })}
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label htmlFor="lastService" className="text-xs font-semibold text-slate-700">Last Service Date</Label>
                  <Input
                    id="lastService"
                    type="date"
                    value={formData.lastService}
                    onChange={(e) => setFormData({ ...formData, lastService: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="nextService" className="text-xs font-semibold text-slate-700">Next Service Date</Label>
                  <Input
                    id="nextService"
                    type="date"
                    value={formData.nextService}
                    onChange={(e) => setFormData({ ...formData, nextService: e.target.value })}
                    required
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-4 border-t border-slate-100">
                <Button type="button" variant="outline" onClick={() => setIsOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" className="bg-primary text-white hover:bg-primary/95">
                  {editingVehicle ? "Save Changes" : "Register Vehicle"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
