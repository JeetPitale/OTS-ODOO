"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Header, KpiCard, StatusBadge, DataTable, type ColumnDef } from "@/components/shared";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Users, ShieldCheck, AlertTriangle, Plus, Filter, Download, Star, X } from "lucide-react";
import { getDrivers, addDriver, updateDriver, deleteDriver, getVehicles, type Driver, type Vehicle } from "@/lib/storage";

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

export default function DriversPage() {
  const [driversList, setDriversList] = useState<Driver[]>([]);
  const [vehiclesList, setVehiclesList] = useState<Vehicle[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [editingDriver, setEditingDriver] = useState<Driver | null>(null);

  const [formData, setFormData] = useState({
    name: "",
    license: "",
    phone: "",
    status: "available" as any,
    safetyScore: 90,
    totalTrips: 0,
    incidents: 0,
    vehicle: "Unassigned",
    licenseCategory: "Heavy Motor Vehicle (HMV)",
    licenseExpiry: new Date().toISOString().split("T")[0],
    photoUrl: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200",
  });

  const [totals, setTotals] = useState({
    total: 0,
    avgSafety: "0.0",
    incidents: 0,
    onTrip: 0,
  });

  const refreshList = () => {
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
  };

  useEffect(() => {
    refreshList();
    setVehiclesList(getVehicles());
  }, []);

  const handleOpenAdd = () => {
    setEditingDriver(null);
    setFormData({
      name: "",
      license: "",
      phone: "",
      status: "available",
      safetyScore: 95,
      totalTrips: 0,
      incidents: 0,
      vehicle: "Unassigned",
      licenseCategory: "Heavy Motor Vehicle (HMV)",
      licenseExpiry: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000 * 3).toISOString().split("T")[0], // 3 years from now
      photoUrl: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200",
    });
    setIsOpen(true);
  };

  const handleOpenEdit = (d: Driver) => {
    setEditingDriver(d);
    setFormData({
      name: d.name,
      license: d.license,
      phone: d.phone,
      status: d.status,
      safetyScore: d.safetyScore,
      totalTrips: d.totalTrips,
      incidents: d.incidents,
      vehicle: d.vehicle,
      licenseCategory: d.licenseCategory || "Heavy Motor Vehicle (HMV)",
      licenseExpiry: d.licenseExpiry || new Date().toISOString().split("T")[0],
      photoUrl: d.photoUrl || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200",
    });
    setIsOpen(true);
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingDriver) {
      updateDriver({
        ...editingDriver,
        ...formData,
      });
    } else {
      addDriver(formData);
    }
    setIsOpen(false);
    refreshList();
  };

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
        <div className="flex gap-1 items-center">
          <Link href={`/drivers/${row.id}`}>
            <Button variant="outline" size="sm" className="h-7 text-[10px] rounded-lg border-primary/20 hover:border-primary text-primary px-1.5">
              View
            </Button>
          </Link>
          <Button
            variant="outline"
            size="sm"
            className="h-7 text-[10px] rounded-lg border-primary/20 hover:border-primary text-primary px-1.5"
            onClick={() => handleOpenEdit(row)}
          >
            Edit
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="h-7 text-[10px] rounded-lg text-red-500 hover:text-red-700 hover:bg-red-50 px-1.5"
            onClick={() => {
              if (confirm(`Are you sure you want to delete driver ${row.name}?`)) {
                deleteDriver(row.id);
                refreshList();
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
      <Header title="Drivers & Safety Profiles" subtitle="Monitor driver performance and safety" />
      <div className="p-6 space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <KpiCard title="Total Drivers" value={totals.total} icon={Users} trend={{ value: "Registered in system", direction: "neutral" }} />
          <KpiCard title="Avg Safety Score" value={totals.avgSafety} icon={ShieldCheck} iconBgClass="bg-emerald-50" trend={{ value: "System average", direction: "neutral" }} />
          <KpiCard title="Active Incidents" value={totals.incidents} icon={AlertTriangle} iconBgClass="bg-red-50" trend={{ value: "Requires review", direction: "down" }} />
          <KpiCard title="On Trip Now" value={totals.onTrip} icon={Users} iconBgClass="bg-blue-50" trend={{ value: `${((totals.onTrip / (totals.total || 1)) * 100).toFixed(0)}% of drivers`, direction: "neutral" }} />
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
              <Button onClick={handleOpenAdd} size="sm" className="h-8 rounded-lg text-xs gap-1 bg-primary hover:bg-primary/90 text-white">
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

      {/* Slide-over or Modal for CRUD */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="w-full max-w-lg bg-white rounded-2xl shadow-xl overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="bg-gradient-to-r from-orange-500 to-amber-500 p-6 text-white flex justify-between items-center">
              <div>
                <h3 className="text-lg font-bold">
                  {editingDriver ? "Edit Driver" : "Add New Driver"}
                </h3>
                <p className="text-white/80 text-xs">
                  {editingDriver ? "Update driver licensing and profile info" : "Register a new driver profile"}
                </p>
              </div>
              <button onClick={() => setIsOpen(false)} className="text-white hover:text-orange-100 transition-colors">
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleFormSubmit} className="p-6 space-y-4 max-h-[75vh] overflow-y-auto">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label htmlFor="name" className="text-xs font-semibold text-slate-700">Driver Name</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="Rajesh Kumar"
                    required
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="phone" className="text-xs font-semibold text-slate-700">Phone Number</Label>
                  <Input
                    id="phone"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    placeholder="+91 98765 43210"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label htmlFor="license" className="text-xs font-semibold text-slate-700">License Number</Label>
                  <Input
                    id="license"
                    value={formData.license}
                    onChange={(e) => setFormData({ ...formData, license: e.target.value })}
                    placeholder="MH-0420210045678"
                    required
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="licenseCategory" className="text-xs font-semibold text-slate-700">License Category</Label>
                  <Input
                    id="licenseCategory"
                    value={formData.licenseCategory}
                    onChange={(e) => setFormData({ ...formData, licenseCategory: e.target.value })}
                    placeholder="Heavy Motor Vehicle (HMV)"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label htmlFor="licenseExpiry" className="text-xs font-semibold text-slate-700">License Expiration</Label>
                  <Input
                    id="licenseExpiry"
                    type="date"
                    value={formData.licenseExpiry}
                    onChange={(e) => setFormData({ ...formData, licenseExpiry: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="safetyScore" className="text-xs font-semibold text-slate-700">Safety Score</Label>
                  <Input
                    id="safetyScore"
                    type="number"
                    min="0"
                    max="100"
                    value={formData.safetyScore}
                    onChange={(e) => setFormData({ ...formData, safetyScore: parseInt(e.target.value) || 0 })}
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
                    <option value="off-duty">Off Duty</option>
                    <option value="suspended">Suspended</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="vehicle" className="text-xs font-semibold text-slate-700">Assigned Vehicle</Label>
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
                  <Label htmlFor="totalTrips" className="text-xs font-semibold text-slate-700">Total Trips</Label>
                  <Input
                    id="totalTrips"
                    type="number"
                    value={formData.totalTrips}
                    onChange={(e) => setFormData({ ...formData, totalTrips: parseInt(e.target.value) || 0 })}
                    required
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="incidents" className="text-xs font-semibold text-slate-700">Incidents Count</Label>
                  <Input
                    id="incidents"
                    type="number"
                    value={formData.incidents}
                    onChange={(e) => setFormData({ ...formData, incidents: parseInt(e.target.value) || 0 })}
                    required
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="photoUrl" className="text-xs font-semibold text-slate-700">Profile Photo URL</Label>
                <Input
                  id="photoUrl"
                  value={formData.photoUrl}
                  onChange={(e) => setFormData({ ...formData, photoUrl: e.target.value })}
                  placeholder="https://images.unsplash.com/..."
                />
              </div>

              <div className="flex justify-end gap-2 pt-4 border-t border-slate-100">
                <Button type="button" variant="outline" onClick={() => setIsOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" className="bg-primary text-white hover:bg-primary/95">
                  {editingDriver ? "Save Changes" : "Register Driver"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
