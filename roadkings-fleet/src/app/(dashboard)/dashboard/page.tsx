"use client";

import { Header, KpiCard, StatusBadge } from "@/components/shared";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Truck,
  Route,
  Users,
  Fuel,
  AlertTriangle,
  TrendingUp,
  MapPin,
  Clock,
} from "lucide-react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
} from "recharts";
import type { StatusVariant } from "@/lib/status-colors";

const kpis = [
  { title: "Total Vehicles", value: 156, icon: Truck, trend: { value: "+4 this month", direction: "up" as const } },
  { title: "Active Trips", value: 42, icon: Route, trend: { value: "12% vs last week", direction: "up" as const } },
  { title: "Active Drivers", value: 89, icon: Users, trend: { value: "3 on leave", direction: "neutral" as const } },
  { title: "Fuel Cost (MTD)", value: "₹12.4L", icon: Fuel, trend: { value: "8% below budget", direction: "down" as const } },
];

const tripTrendData = [
  { month: "Jan", trips: 980, revenue: 420 },
  { month: "Feb", trips: 1100, revenue: 480 },
  { month: "Mar", trips: 1050, revenue: 460 },
  { month: "Apr", trips: 1240, revenue: 530 },
  { month: "May", trips: 1180, revenue: 510 },
  { month: "Jun", trips: 1320, revenue: 590 },
];

const fleetStatusData = [
  { name: "On Trip", value: 42, color: "#3b82f6" },
  { name: "Available", value: 68, color: "#10b981" },
  { name: "In Maintenance", value: 18, color: "#f97316" },
  { name: "Off Duty", value: 28, color: "#94a3b8" },
];

const fuelByWeek = [
  { week: "W1", diesel: 32000, petrol: 8000 },
  { week: "W2", diesel: 29000, petrol: 7200 },
  { week: "W3", diesel: 35000, petrol: 9100 },
  { week: "W4", diesel: 31000, petrol: 8500 },
];

const recentTrips: { id: string; route: string; driver: string; vehicle: string; status: StatusVariant; eta: string }[] = [
  { id: "TRP-1024", route: "Mumbai → Pune", driver: "Rajesh Kumar", vehicle: "MH-04 AB 1234", status: "on-trip", eta: "2h 15m" },
  { id: "TRP-1023", route: "Delhi → Jaipur", driver: "Amit Singh", vehicle: "DL-01 CD 5678", status: "completed", eta: "—" },
  { id: "TRP-1022", route: "Bangalore → Chennai", driver: "Suresh Reddy", vehicle: "KA-01 EF 9012", status: "on-trip", eta: "4h 30m" },
  { id: "TRP-1021", route: "Hyderabad → Vizag", driver: "Mohan Rao", vehicle: "TS-09 GH 3456", status: "scheduled", eta: "—" },
  { id: "TRP-1020", route: "Kolkata → Bhubaneswar", driver: "Debashis Das", vehicle: "WB-06 IJ 7890", status: "completed", eta: "—" },
];

const alerts: { message: string; type: StatusVariant; time: string }[] = [
  { message: "Vehicle MH-12 XY 4567 overdue for service (350 km past)", type: "critical", time: "12 min ago" },
  { message: "Driver Pradeep Sharma exceeded speed limit on NH-48", type: "warning", time: "35 min ago" },
  { message: "Fuel card declined for vehicle DL-08 QR 2345", type: "critical", time: "1h ago" },
  { message: "Trip TRP-1019 delayed — flat tyre near Nashik", type: "warning", time: "2h ago" },
];

export default function DashboardPage() {
  return (
    <>
      <Header title="Dashboard" subtitle="Fleet operations overview" />
      <div className="p-6 space-y-6">
        {/* KPIs */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {kpis.map((kpi) => (
            <KpiCard key={kpi.title} {...kpi} />
          ))}
        </div>

        {/* Charts row */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* Trip trend area chart */}
          <Card className="lg:col-span-2 rounded-xl ambient-shadow border-0">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-semibold flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-primary" />
                Trip Volume & Revenue Trend
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={260}>
                <AreaChart data={tripTrendData}>
                  <defs>
                    <linearGradient id="tripGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#FF6B1A" stopOpacity={0.3} />
                      <stop offset="100%" stopColor="#FF6B1A" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="revGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#0284c7" stopOpacity={0.2} />
                      <stop offset="100%" stopColor="#0284c7" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis dataKey="month" tick={{ fontSize: 12 }} stroke="#94a3b8" />
                  <YAxis tick={{ fontSize: 12 }} stroke="#94a3b8" />
                  <Tooltip />
                  <Area type="monotone" dataKey="trips" stroke="#FF6B1A" fill="url(#tripGrad)" strokeWidth={2} />
                  <Area type="monotone" dataKey="revenue" stroke="#0284c7" fill="url(#revGrad)" strokeWidth={2} />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Fleet status pie */}
          <Card className="rounded-xl ambient-shadow border-0">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-semibold flex items-center gap-2">
                <Truck className="h-4 w-4 text-primary" />
                Fleet Status
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={200}>
                <PieChart>
                  <Pie
                    data={fleetStatusData}
                    cx="50%"
                    cy="50%"
                    innerRadius={55}
                    outerRadius={80}
                    dataKey="value"
                    paddingAngle={3}
                  >
                    {fleetStatusData.map((entry) => (
                      <Cell key={entry.name} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
              <div className="grid grid-cols-2 gap-2 mt-2">
                {fleetStatusData.map((item) => (
                  <div key={item.name} className="flex items-center gap-2 text-xs">
                    <span
                      className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                      style={{ backgroundColor: item.color }}
                    />
                    <span className="text-muted-foreground">{item.name}</span>
                    <span className="font-semibold ml-auto">{item.value}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Second charts row */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* Fuel bar chart */}
          <Card className="rounded-xl ambient-shadow border-0">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-semibold flex items-center gap-2">
                <Fuel className="h-4 w-4 text-primary" />
                Weekly Fuel Costs (₹)
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={fuelByWeek}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis dataKey="week" tick={{ fontSize: 12 }} stroke="#94a3b8" />
                  <YAxis tick={{ fontSize: 12 }} stroke="#94a3b8" />
                  <Tooltip />
                  <Bar dataKey="diesel" fill="#FF6B1A" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="petrol" fill="#fbbf24" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Recent trips */}
          <Card className="lg:col-span-2 rounded-xl ambient-shadow border-0">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-semibold flex items-center gap-2">
                <MapPin className="h-4 w-4 text-primary" />
                Recent Trips
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {recentTrips.map((trip) => (
                  <div
                    key={trip.id}
                    className="flex items-center justify-between py-2 border-b border-border last:border-0"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div>
                        <p className="text-sm font-medium">{trip.route}</p>
                        <p className="text-xs text-muted-foreground">
                          {trip.id} · {trip.driver} · {trip.vehicle}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      {trip.eta !== "—" && (
                        <span className="text-xs text-muted-foreground flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {trip.eta}
                        </span>
                      )}
                      <StatusBadge variant={trip.status} />
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Alerts */}
        <Card className="rounded-xl ambient-shadow border-0">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-primary" />
              Active Alerts
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {alerts.map((alert, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between py-2 border-b border-border last:border-0"
                >
                  <div className="flex items-center gap-3">
                    <StatusBadge variant={alert.type} />
                    <p className="text-sm">{alert.message}</p>
                  </div>
                  <span className="text-xs text-muted-foreground whitespace-nowrap">
                    {alert.time}
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </>
  );
}
