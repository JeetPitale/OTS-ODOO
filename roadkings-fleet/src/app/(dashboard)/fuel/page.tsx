"use client";

import { useEffect, useState } from "react";
import { Header, KpiCard, DataTable, type ColumnDef } from "@/components/shared";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Fuel, IndianRupee, TrendingDown, Plus, Filter, Download, BarChart3, X } from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
} from "recharts";
import { useFuelRecords, useCreateFuel, useUpdateFuel, useDeleteFuel } from "@/hooks/useFuel";
import { useVehicles } from "@/hooks/useVehicles";
import { useDrivers } from "@/hooks/useDrivers";

const monthlyExpenses = [
  { month: "Aug", fuel: 980000, maintenance: 280000, tolls: 120000 },
  { month: "Sep", fuel: 1050000, maintenance: 320000, tolls: 135000 },
  { month: "Oct", fuel: 1120000, maintenance: 250000, tolls: 128000 },
  { month: "Nov", fuel: 1080000, maintenance: 380000, tolls: 142000 },
  { month: "Dec", fuel: 1200000, maintenance: 290000, tolls: 138000 },
  { month: "Jan", fuel: 1240000, maintenance: 310000, tolls: 145000 },
];

const fuelEfficiency = [
  { week: "W1", avgKmpl: 3.8 },
  { week: "W2", avgKmpl: 4.1 },
  { week: "W3", avgKmpl: 3.6 },
  { week: "W4", avgKmpl: 4.3 },
  { week: "W5", avgKmpl: 4.0 },
  { week: "W6", avgKmpl: 4.2 },
];

export default function FuelPage() {
  const { data: fuelData, isLoading } = useFuelRecords({ limit: 100 });
  const { data: vehiclesData } = useVehicles({ limit: 100 });
  const { data: driversData } = useDrivers({ limit: 100 });

  const createFuel = useCreateFuel();
  const updateFuel = useUpdateFuel();
  const deleteFuel = useDeleteFuel();

  const fuelRecords = fuelData?.items || [];
  const vehiclesList = vehiclesData?.items || [];
  const driversList = driversData?.items || [];
  const [isOpen, setIsOpen] = useState(false);
  const [editingRecord, setEditingRecord] = useState<any | null>(null);

  const [formData, setFormData] = useState({
    vehicle: "",
    date: new Date().toISOString().split("T")[0],
    station: "",
    fuelType: "Diesel",
    quantity: "100 L",
    rate: "90.00",
    amount: "9000",
    odometer: "0 km",
    driver: "",
  });

  const fillupsCount = fuelRecords.length;
  
  // Calculate total litres dynamically
  const ltrSum = fuelRecords
    .map((r) => parseFloat(r.quantity?.replace(/[^0-9.]/g, "") || "0") || 0)
    .reduce((a, b) => a + b, 0);

  // Calculate total cost dynamically
  const costSum = fuelRecords
    .map((r) => parseFloat(r.amount?.replace(/[^0-9.]/g, "") || "0") || 0)
    .reduce((a, b) => a + b, 0);

  const totals = {
    fuelCost: `₹${(costSum / 1000).toFixed(1)}K`,
    totalLitres: `${ltrSum.toLocaleString()} L`,
    avgEfficiency: "4.1 km/L",
    fillupsCount,
  };

  const handleOpenAdd = () => {
    setEditingRecord(null);
    setFormData({
      vehicle: vehiclesList[0]?.number || "",
      date: new Date().toISOString().split("T")[0],
      station: "",
      fuelType: "Diesel",
      quantity: "100 L",
      rate: "90.00",
      amount: "9000",
      odometer: "10000 km",
      driver: driversList[0]?.name || "",
    });
    setIsOpen(true);
  };

  const handleOpenEdit = (r: any) => {
    setEditingRecord(r);
    setFormData({
      vehicle: r.vehicle,
      date: r.date,
      station: r.station,
      fuelType: r.fuelType,
      quantity: r.quantity,
      rate: r.rate.replace("₹", ""),
      amount: r.amount.replace("₹", "").replace(",", ""),
      odometer: r.odometer,
      driver: r.driver,
    });
    setIsOpen(true);
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Auto-formatting rate/amount/quantity
    const qtyVal = formData.quantity.toLowerCase().includes("l") ? formData.quantity : `${formData.quantity} L`;
    const formattedRate = formData.rate.startsWith("₹") ? formData.rate : `₹${formData.rate}`;
    const formattedAmount = formData.amount.startsWith("₹") ? formData.amount : `₹${parseFloat(formData.amount).toLocaleString()}`;
    const formattedOdo = formData.odometer.toLowerCase().includes("km") ? formData.odometer : `${formData.odometer} km`;

    const finalRecord = {
      ...formData,
      quantity: qtyVal,
      rate: formattedRate,
      amount: formattedAmount,
      odometer: formattedOdo,
    };

    if (editingRecord) {
      await updateFuel.mutateAsync({
        id: editingRecord.id,
        data: finalRecord as any,
      });
    } else {
      await createFuel.mutateAsync(finalRecord as any);
    }
    setIsOpen(false);
  };

  const columns: ColumnDef<any>[] = [
    { header: "Txn ID", accessorKey: "id", sortable: true },
    { header: "Vehicle", accessorKey: "vehicle", sortable: true },
    { header: "Date", accessorKey: "date", sortable: true },
    { header: "Station", accessorKey: "station" },
    { header: "Type", accessorKey: "fuelType" },
    { header: "Qty", accessorKey: "quantity", sortable: true },
    { header: "Rate", accessorKey: "rate" },
    { header: "Amount", accessorKey: "amount", sortable: true },
    { header: "Odometer", accessorKey: "odometer" },
    { header: "Driver", accessorKey: "driver" },
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
              if (confirm(`Are you sure you want to delete fuel txn ${row.id}?`)) {
                await deleteFuel.mutateAsync(row.id);
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
      <Header title="Fuel & Expense Management" subtitle="Track fuel consumption and fleet expenses" />
      <div className="p-6 space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <KpiCard title="Fuel Cost" value={totals.fuelCost} icon={Fuel} trend={{ value: "Dynamic calculation", direction: "neutral" }} />
          <KpiCard title="Total Fill-ups" value={totals.fillupsCount} icon={IndianRupee} iconBgClass="bg-amber-50" trend={{ value: "Lifetime log entries", direction: "neutral" }} />
          <KpiCard title="Avg Fuel Efficiency" value={totals.avgEfficiency} icon={TrendingDown} iconBgClass="bg-blue-50" trend={{ value: "+0.3 vs last month", direction: "up" }} />
          <KpiCard title="Total Litres" value={totals.totalLitres} icon={Fuel} iconBgClass="bg-emerald-50" trend={{ value: "Dynamic calculation", direction: "neutral" }} />
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <Card className="rounded-xl ambient-shadow border-0 ring-0">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-semibold flex items-center gap-2">
                <BarChart3 className="h-4 w-4 text-primary" />
                Monthly Expense Breakdown (₹)
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={260}>
                <BarChart data={monthlyExpenses}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis dataKey="month" tick={{ fontSize: 12 }} stroke="#94a3b8" />
                  <YAxis tick={{ fontSize: 12 }} stroke="#94a3b8" tickFormatter={(v: any) => `${(Number(v) / 100000).toFixed(1)}L`} />
                  <Tooltip formatter={(value: any) => `₹${(Number(value) / 1000).toFixed(0)}K`} />
                  <Bar dataKey="fuel" fill="#FF6B1A" radius={[4, 4, 0, 0]} name="Fuel" />
                  <Bar dataKey="maintenance" fill="#0284c7" radius={[4, 4, 0, 0]} name="Maintenance" />
                  <Bar dataKey="tolls" fill="#10b981" radius={[4, 4, 0, 0]} name="Tolls" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card className="rounded-xl ambient-shadow border-0 ring-0">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-semibold flex items-center gap-2">
                <TrendingDown className="h-4 w-4 text-primary" />
                Fleet Fuel Efficiency (km/L)
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={260}>
                <LineChart data={fuelEfficiency}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis dataKey="week" tick={{ fontSize: 12 }} stroke="#94a3b8" />
                  <YAxis domain={[3, 5]} tick={{ fontSize: 12 }} stroke="#94a3b8" />
                  <Tooltip />
                  <Line type="monotone" dataKey="avgKmpl" stroke="#FF6B1A" strokeWidth={2.5} dot={{ r: 4, fill: "#FF6B1A" }} name="Avg km/L" />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        {/* Fuel transactions table */}
        <Card className="rounded-xl ambient-shadow border-0 ring-0">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-semibold">Fuel Transactions</CardTitle>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" className="h-8 rounded-lg text-xs gap-1">
                <Filter className="h-3.5 w-3.5" /> Filter
              </Button>
              <Button variant="outline" size="sm" className="h-8 rounded-lg text-xs gap-1">
                <Download className="h-3.5 w-3.5" /> Export
              </Button>
              <Button onClick={handleOpenAdd} size="sm" className="h-8 rounded-lg text-xs gap-1 bg-primary hover:bg-primary/90 text-white">
                <Plus className="h-3.5 w-3.5" /> Log Entry
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <DataTable
              columns={columns}
              data={fuelRecords}
              searchKey="vehicle"
              searchPlaceholder="Search by vehicle..."
            />
          </CardContent>
        </Card>
      </div>

      {/* CRUD dialog */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="w-full max-w-lg bg-white rounded-2xl shadow-xl overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="bg-gradient-to-r from-orange-500 to-amber-500 p-6 text-white flex justify-between items-center">
              <div>
                <h3 className="text-lg font-bold">
                  {editingRecord ? "Edit Fuel Log Entry" : "Log Fuel Transaction"}
                </h3>
                <p className="text-white/80 text-xs">
                  {editingRecord ? "Update transaction billing or mileage info" : "Log a new fuel refill receipt"}
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
                  <Label htmlFor="driver" className="text-xs font-semibold text-slate-700">Driver</Label>
                  <select
                    id="driver"
                    value={formData.driver}
                    onChange={(e) => setFormData({ ...formData, driver: e.target.value })}
                    className="w-full h-9 px-3 rounded-lg border border-input bg-transparent text-sm outline-none focus:ring-1 focus:ring-ring"
                    required
                  >
                    <option value="" disabled>Select driver</option>
                    {driversList.map((d) => (
                      <option key={d.id} value={d.name}>{d.name} ({d.id})</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label htmlFor="date" className="text-xs font-semibold text-slate-700">Transaction Date</Label>
                  <Input
                    id="date"
                    type="date"
                    value={formData.date}
                    onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="fuelType" className="text-xs font-semibold text-slate-700">Fuel Type</Label>
                  <select
                    id="fuelType"
                    value={formData.fuelType}
                    onChange={(e) => setFormData({ ...formData, fuelType: e.target.value })}
                    className="w-full h-9 px-3 rounded-lg border border-input bg-transparent text-sm outline-none focus:ring-1 focus:ring-ring"
                  >
                    <option value="Diesel">Diesel</option>
                    <option value="Petrol">Petrol</option>
                    <option value="CNG">CNG</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="station" className="text-xs font-semibold text-slate-700">Fuel Station / Location</Label>
                <Input
                  id="station"
                  value={formData.station}
                  onChange={(e) => setFormData({ ...formData, station: e.target.value })}
                  placeholder="HP Petrol Pump, Thane"
                  required
                />
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-1.5">
                  <Label htmlFor="quantity" className="text-xs font-semibold text-slate-700">Quantity (Litres)</Label>
                  <Input
                    id="quantity"
                    value={formData.quantity}
                    onChange={(e) => {
                      const qty = e.target.value;
                      const rateNum = parseFloat(formData.rate) || 0;
                      const qtyNum = parseFloat(qty) || 0;
                      setFormData({
                        ...formData,
                        quantity: qty,
                        amount: qtyNum > 0 && rateNum > 0 ? String(qtyNum * rateNum) : formData.amount
                      });
                    }}
                    placeholder="120"
                    required
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="rate" className="text-xs font-semibold text-slate-700">Rate / Litre (₹)</Label>
                  <Input
                    id="rate"
                    value={formData.rate}
                    onChange={(e) => {
                      const rate = e.target.value;
                      const rateNum = parseFloat(rate) || 0;
                      const qtyNum = parseFloat(formData.quantity) || 0;
                      setFormData({
                        ...formData,
                        rate: rate,
                        amount: qtyNum > 0 && rateNum > 0 ? String(qtyNum * rateNum) : formData.amount
                      });
                    }}
                    placeholder="89.50"
                    required
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="amount" className="text-xs font-semibold text-slate-700">Total Amount (₹)</Label>
                  <Input
                    id="amount"
                    value={formData.amount}
                    onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                    placeholder="10740"
                    required
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="odometer" className="text-xs font-semibold text-slate-700">Odometer Reading</Label>
                <Input
                  id="odometer"
                  value={formData.odometer}
                  onChange={(e) => setFormData({ ...formData, odometer: e.target.value })}
                  placeholder="45,230 km"
                  required
                />
              </div>

              <div className="flex justify-end gap-2 pt-4 border-t border-slate-100">
                <Button type="button" variant="outline" onClick={() => setIsOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" className="bg-primary text-white hover:bg-primary/95">
                  {editingRecord ? "Save Changes" : "Log Entry"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
