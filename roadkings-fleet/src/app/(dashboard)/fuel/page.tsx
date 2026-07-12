"use client";

import { Header, KpiCard, DataTable, type ColumnDef } from "@/components/shared";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Fuel, IndianRupee, TrendingDown, Plus, Filter, Download, BarChart3 } from "lucide-react";
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

interface FuelRecord {
  id: string;
  vehicle: string;
  date: string;
  station: string;
  fuelType: string;
  quantity: string;
  rate: string;
  amount: string;
  odometer: string;
  driver: string;
}

const fuelRecords: FuelRecord[] = [
  { id: "FUL-2201", vehicle: "MH-04 AB 1234", date: "2025-01-08", station: "HP Petrol Pump, Thane", fuelType: "Diesel", quantity: "120 L", rate: "₹89.50", amount: "₹10,740", odometer: "45,230 km", driver: "Rajesh Kumar" },
  { id: "FUL-2200", vehicle: "DL-01 CD 5678", date: "2025-01-07", station: "Indian Oil, Gurgaon", fuelType: "Diesel", quantity: "95 L", rate: "₹88.90", amount: "₹8,446", odometer: "62,100 km", driver: "Amit Singh" },
  { id: "FUL-2199", vehicle: "KA-01 EF 9012", date: "2025-01-07", station: "BPCL, Whitefield", fuelType: "Diesel", quantity: "150 L", rate: "₹90.20", amount: "₹13,530", odometer: "31,400 km", driver: "Suresh Reddy" },
  { id: "FUL-2198", vehicle: "TS-09 GH 3456", date: "2025-01-06", station: "HP, Secunderabad", fuelType: "Diesel", quantity: "110 L", rate: "₹89.80", amount: "₹9,878", odometer: "78,920 km", driver: "Mohan Rao" },
  { id: "FUL-2197", vehicle: "WB-06 IJ 7890", date: "2025-01-06", station: "Indian Oil, Howrah", fuelType: "Diesel", quantity: "60 L", rate: "₹88.60", amount: "₹5,316", odometer: "18,750 km", driver: "Debashis Das" },
  { id: "FUL-2196", vehicle: "RJ-14 MN 3344", date: "2025-01-05", station: "BPCL, Jaipur", fuelType: "Diesel", quantity: "140 L", rate: "₹89.40", amount: "₹12,516", odometer: "52,800 km", driver: "Vikas Meena" },
];

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

const columns: ColumnDef<FuelRecord>[] = [
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
];

export default function FuelPage() {
  return (
    <>
      <Header title="Fuel & Expense Management" subtitle="Track fuel consumption and fleet expenses" />
      <div className="p-6 space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <KpiCard title="Fuel Cost (MTD)" value="₹12.4L" icon={Fuel} trend={{ value: "8% below budget", direction: "up" }} />
          <KpiCard title="Total Expenses (MTD)" value="₹16.9L" icon={IndianRupee} iconBgClass="bg-amber-50" trend={{ value: "5% above last month", direction: "down" }} />
          <KpiCard title="Avg Fuel Efficiency" value="4.1 km/L" icon={TrendingDown} iconBgClass="bg-blue-50" trend={{ value: "+0.3 vs last month", direction: "up" }} />
          <KpiCard title="Total Litres (MTD)" value="14,280 L" icon={Fuel} iconBgClass="bg-emerald-50" trend={{ value: "156 fill-ups", direction: "neutral" }} />
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
                  <YAxis tick={{ fontSize: 12 }} stroke="#94a3b8" tickFormatter={(v: unknown) => `${(Number(v) / 100000).toFixed(1)}L`} />
                  <Tooltip formatter={(value: unknown) => `₹${(Number(value) / 1000).toFixed(0)}K`} />
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
              <Button size="sm" className="h-8 rounded-lg text-xs gap-1 bg-primary hover:bg-primary/90 text-white">
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
    </>
  );
}
