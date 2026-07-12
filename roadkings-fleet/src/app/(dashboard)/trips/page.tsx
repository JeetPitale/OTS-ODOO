"use client";

import { useEffect, useState } from "react";
import { Header, KpiCard, StatusBadge, DataTable, type ColumnDef } from "@/components/shared";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Route, Clock, MapPin, Plus, Filter, Download, IndianRupee, X } from "lucide-react";
import { useTrips, useCreateTrip, useUpdateTrip, useDeleteTrip } from "@/hooks/useTrips";
import { useDrivers } from "@/hooks/useDrivers";
import { useVehicles } from "@/hooks/useVehicles";

export default function TripsPage() {
  const { data: tripsData, isLoading } = useTrips({ limit: 100 });
  const { data: driversData } = useDrivers({ limit: 100 });
  const { data: vehiclesData } = useVehicles({ limit: 100 });

  const createTrip = useCreateTrip();
  const updateTrip = useUpdateTrip();
  const deleteTrip = useDeleteTrip();

  const tripsList = tripsData?.items || [];
  const driversList = driversData?.items || [];
  const vehiclesList = vehiclesData?.items || [];

  const [isOpen, setIsOpen] = useState(false);
  const [editingTrip, setEditingTrip] = useState<any>(null);

  const [formData, setFormData] = useState({
    origin: "",
    destination: "",
    driver: "Unassigned",
    vehicle: "Unassigned",
    status: "scheduled" as any,
    distance: "100 km",
    eta: "2h 00m",
    revenue: "₹10,000",
    startDate: new Date().toISOString().replace("T", " ").substring(0, 16),
  });

  const distSum = tripsList
    .map((t) => parseInt(t.distance?.replace(/[^0-9]/g, "") || "0") || 0)
    .reduce((a, b) => a + b, 0);

  const revSum = tripsList
    .map((t) => parseInt(t.revenue?.replace(/[^0-9]/g, "") || "0") || 0)
    .reduce((a, b) => a + b, 0);

  const totals = {
    activeTrips: tripsList.filter((t) => t.status === "on_trip" || t.status === "on-trip").length,
    onTimeRate: "98.2%",
    totalDistance: `${distSum.toLocaleString()} km`,
    revenue: `₹${(revSum / 1000).toFixed(1)}K`,
  };

  const handleOpenAdd = () => {
    setEditingTrip(null);
    setFormData({
      origin: "",
      destination: "",
      driver: "Unassigned",
      vehicle: "Unassigned",
      status: "scheduled",
      distance: "150 km",
      eta: "3h 00m",
      revenue: "₹12,000",
      startDate: new Date().toISOString().replace("T", " ").substring(0, 16),
    });
    setIsOpen(true);
  };

  const handleOpenEdit = (t: any) => {
    setEditingTrip(t);
    setFormData({
      origin: t.origin,
      destination: t.destination,
      driver: t.driver,
      vehicle: t.vehicle,
      status: t.status,
      distance: t.distance,
      eta: t.eta,
      revenue: t.revenue,
      startDate: t.startDate,
    });
    setIsOpen(true);
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (editingTrip) {
      await updateTrip.mutateAsync({
        id: editingTrip.id,
        data: formData,
      });
    } else {
      await createTrip.mutateAsync(formData);
    }
    setIsOpen(false);
  };

  const columns: ColumnDef<any>[] = [
    { header: "Trip ID", accessorKey: "tripId", sortable: true },
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
      cell: (row) => <StatusBadge variant={row.status.replace("_", "-") as any} />,
    },
    { header: "Distance", accessorKey: "distance", sortable: true },
    { header: "ETA", accessorKey: "eta" },
    { header: "Revenue", accessorKey: "revenue", sortable: true },
    { header: "Start Date", accessorKey: "startDate", sortable: true },
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
              if (confirm(`Are you sure you want to delete trip ${row.tripId || row.id}?`)) {
                await deleteTrip.mutateAsync(row.id);
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
      <Header title="Trip Dispatch" subtitle="Schedule, track and manage trips" />
      <div className="p-6 space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <KpiCard title="Active Trips" value={totals.activeTrips} icon={Route} trend={{ value: "Currently on-trip", direction: "neutral" }} />
          <KpiCard title="On-Time Rate" value={totals.onTimeRate} icon={Clock} iconBgClass="bg-emerald-50" trend={{ value: "System target 98%", direction: "up" }} />
          <KpiCard title="Total Distance (MTD)" value={totals.totalDistance} icon={MapPin} iconBgClass="bg-blue-50" trend={{ value: "Dynamic calculation", direction: "up" }} />
          <KpiCard title="Revenue (MTD)" value={totals.revenue} icon={IndianRupee} iconBgClass="bg-amber-50" trend={{ value: "Dynamic calculation", direction: "up" }} />
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
              <Button onClick={handleOpenAdd} size="sm" className="h-8 rounded-lg text-xs gap-1 bg-primary hover:bg-primary/90 text-white">
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

      {/* Trip Form Modal */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="w-full max-w-lg bg-white rounded-2xl shadow-xl overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="bg-gradient-to-r from-orange-500 to-amber-500 p-6 text-white flex justify-between items-center">
              <div>
                <h3 className="text-lg font-bold">
                  {editingTrip ? "Edit Trip" : "Dispatch New Trip"}
                </h3>
                <p className="text-white/80 text-xs">
                  {editingTrip ? "Update trip schedule details" : "Schedule and dispatch a new vehicle route"}
                </p>
              </div>
              <button onClick={() => setIsOpen(false)} className="text-white hover:text-orange-100 transition-colors">
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleFormSubmit} className="p-6 space-y-4 max-h-[75vh] overflow-y-auto">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label htmlFor="origin" className="text-xs font-semibold text-slate-700">Origin City</Label>
                  <Input
                    id="origin"
                    value={formData.origin}
                    onChange={(e) => setFormData({ ...formData, origin: e.target.value })}
                    placeholder="Mumbai"
                    required
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="destination" className="text-xs font-semibold text-slate-700">Destination City</Label>
                  <Input
                    id="destination"
                    value={formData.destination}
                    onChange={(e) => setFormData({ ...formData, destination: e.target.value })}
                    placeholder="Pune"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label htmlFor="driver" className="text-xs font-semibold text-slate-700">Driver</Label>
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
                <div className="space-y-1.5">
                  <Label htmlFor="vehicle" className="text-xs font-semibold text-slate-700">Vehicle</Label>
                  <select
                    id="vehicle"
                    value={formData.vehicle}
                    onChange={(e) => setFormData({ ...formData, vehicle: e.target.value })}
                    className="w-full h-9 px-3 rounded-lg border border-input bg-transparent text-sm outline-none focus:ring-1 focus:ring-ring"
                  >
                    <option value="Unassigned">Unassigned</option>
                    {vehiclesList.map((v) => (
                      <option key={v.id} value={v.number}>{v.number} ({v.make})</option>
                    ))}
                  </select>
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
                    <option value="scheduled">Scheduled</option>
                    <option value="on-trip">On Trip</option>
                    <option value="completed">Completed</option>
                    <option value="cancelled">Cancelled</option>
                  </select>
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="startDate" className="text-xs font-semibold text-slate-700">Start Date & Time</Label>
                  <Input
                    id="startDate"
                    value={formData.startDate}
                    onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                    placeholder="2025-01-08 06:30"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-1.5">
                  <Label htmlFor="distance" className="text-xs font-semibold text-slate-700">Distance</Label>
                  <Input
                    id="distance"
                    value={formData.distance}
                    onChange={(e) => setFormData({ ...formData, distance: e.target.value })}
                    placeholder="148 km"
                    required
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="eta" className="text-xs font-semibold text-slate-700">ETA / Duration</Label>
                  <Input
                    id="eta"
                    value={formData.eta}
                    onChange={(e) => setFormData({ ...formData, eta: e.target.value })}
                    placeholder="2h 15m"
                    required
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="revenue" className="text-xs font-semibold text-slate-700">Revenue</Label>
                  <Input
                    id="revenue"
                    value={formData.revenue}
                    onChange={(e) => setFormData({ ...formData, revenue: e.target.value })}
                    placeholder="₹18,500"
                    required
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-4 border-t border-slate-100">
                <Button type="button" variant="outline" onClick={() => setIsOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" className="bg-primary text-white hover:bg-primary/95">
                  {editingTrip ? "Save Changes" : "Dispatch"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
