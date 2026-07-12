"use client";

import { useEffect, useState } from "react";
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
  QrCode,
  CheckCircle,
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
import { getDrivers, getVehicles, getTrips, getScanLogs, getDispatchHistory } from "@/lib/storage";

const tripTrendData = [
  { month: "Jan", trips: 980, revenue: 420 },
  { month: "Feb", trips: 1100, revenue: 480 },
  { month: "Mar", trips: 1050, revenue: 460 },
  { month: "Apr", trips: 1240, revenue: 530 },
  { month: "May", trips: 1180, revenue: 510 },
  { month: "Jun", trips: 1320, revenue: 590 },
];

const fuelByWeek = [
  { week: "W1", diesel: 32000, petrol: 8000 },
  { week: "W2", diesel: 29000, petrol: 7200 },
  { week: "W3", diesel: 35000, petrol: 9100 },
  { week: "W4", diesel: 31000, petrol: 8500 },
];

const staticAlerts = [
  { message: "Vehicle MH-12 XY 4567 overdue for service (350 km past)", type: "critical" as const, time: "12 min ago" },
  { message: "Driver Pradeep Sharma exceeded speed limit on NH-48", type: "warning" as const, time: "35 min ago" },
  { message: "Fuel card declined for vehicle DL-08 QR 2345", type: "critical" as const, time: "1h ago" },
  { message: "Trip TRP-1019 delayed — flat tyre near Nashik", type: "warning" as const, time: "2h ago" },
];

export default function DashboardPage() {
  const [stats, setStats] = useState({
    totalVehicles: 156,
    activeTrips: 42,
    activeDrivers: 89,
    fuelCostMtd: "₹12.4L",
    onTripVehicles: 42,
    availableVehicles: 68,
    inMaintenanceVehicles: 18,
    otherVehicles: 28,
  });

  const [qrStats, setQrStats] = useState({
    scansToday: 0,
    dispatchesToday: 0,
    activeDispatches: 0,
    completedDispatches: 0,
  });

  const [recentTripsList, setRecentTripsList] = useState<any[]>([]);

  useEffect(() => {
    // Read from storage
    const drivers = getDrivers();
    const vehicles = getVehicles();
    const trips = getTrips();
    const scanLogs = getScanLogs();
    const dispatches = getDispatchHistory();

    const activeTripsCount = trips.filter((t) => t.status === "on-trip").length;
    const activeDriversCount = drivers.filter((d) => d.status === "available" || d.status === "on-trip").length;

    // Vehicle status counts
    const onTripV = vehicles.filter((v) => v.status === "on-trip").length;
    const availableV = vehicles.filter((v) => v.status === "available").length;
    const maintV = vehicles.filter((v) => v.status === "in-maintenance" || v.status === "in-shop").length;
    const otherV = vehicles.filter((v) => v.status === "retired").length;

    setStats({
      totalVehicles: vehicles.length,
      activeTrips: activeTripsCount,
      activeDrivers: activeDriversCount,
      fuelCostMtd: "₹12.4L",
      onTripVehicles: onTripV,
      availableVehicles: availableV,
      inMaintenanceVehicles: maintV,
      otherVehicles: otherV,
    });

    // QR Statistics
    const todayStr = new Date().toDateString();
    const scansToday = scanLogs.filter((l) => new Date(l.timestamp).toDateString() === todayStr).length;
    const dispatchesToday = dispatches.filter((d) => new Date(d.dispatchDate).toDateString() === todayStr || d.dispatchDate === new Date().toLocaleDateString()).length;
    const activeDispatches = dispatches.filter((d) => d.tripStatus === "on-trip").length;
    const completedDispatches = dispatches.filter((d) => d.tripStatus === "completed").length;

    setQrStats({
      scansToday,
      dispatchesToday,
      activeDispatches,
      completedDispatches,
    });

    // Map recent trips
    const formattedTrips = trips.slice(0, 5).map((t) => ({
      id: t.id,
      route: `${t.origin} → ${t.destination}`,
      driver: t.driver,
      vehicle: t.vehicle,
      status: t.status,
      eta: t.eta,
    }));
    setRecentTripsList(formattedTrips);
  }, []);

  const kpis = [
    { title: "Total Vehicles", value: stats.totalVehicles, icon: Truck, trend: { value: "+4 this month", direction: "up" as const } },
    { title: "Active Trips", value: stats.activeTrips, icon: Route, trend: { value: "12% vs last week", direction: "up" as const } },
    { title: "Active Drivers", value: stats.activeDrivers, icon: Users, trend: { value: "3 on leave", direction: "neutral" as const } },
    { title: "Fuel Cost (MTD)", value: stats.fuelCostMtd, icon: Fuel, trend: { value: "8% below budget", direction: "down" as const } },
  ];

  const fleetStatusData = [
    { name: "On Trip", value: stats.onTripVehicles, color: "#3b82f6" },
    { name: "Available", value: stats.availableVehicles, color: "#10b981" },
    { name: "In Maintenance", value: stats.inMaintenanceVehicles, color: "#f97316" },
    { name: "Retired / Other", value: stats.otherVehicles, color: "#94a3b8" },
  ];

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

        {/* QR Scan Statistics Card (Smart Dispatch metrics) */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="rounded-xl border-y-0 border-r-0 border-l-4 border-l-primary ring-0 bg-gradient-to-br from-amber-500/10 to-orange-500/10 shadow-sm">
            <CardContent className="p-4 flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">QR Scans Today</p>
                <p className="text-2xl font-bold mt-1 text-foreground">{qrStats.scansToday}</p>
              </div>
              <div className="p-2.5 bg-primary/10 rounded-lg text-primary">
                <QrCode className="h-5 w-5" />
              </div>
            </CardContent>
          </Card>
          <Card className="rounded-xl border-y-0 border-r-0 border-l-4 border-l-primary ring-0 bg-gradient-to-br from-amber-500/10 to-orange-500/10 shadow-sm">
            <CardContent className="p-4 flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Dispatches Today</p>
                <p className="text-2xl font-bold mt-1 text-foreground">{qrStats.dispatchesToday}</p>
              </div>
              <div className="p-2.5 bg-primary/10 rounded-lg text-primary">
                <Truck className="h-5 w-5" />
              </div>
            </CardContent>
          </Card>
          <Card className="rounded-xl border-y-0 border-r-0 border-l-4 border-l-primary ring-0 bg-gradient-to-br from-amber-500/10 to-orange-500/10 shadow-sm">
            <CardContent className="p-4 flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Active Dispatches</p>
                <p className="text-2xl font-bold mt-1 text-foreground">{qrStats.activeDispatches}</p>
              </div>
              <div className="p-2.5 bg-primary/10 rounded-lg text-primary">
                <Route className="h-5 w-5" />
              </div>
            </CardContent>
          </Card>
          <Card className="rounded-xl border-y-0 border-r-0 border-l-4 border-l-primary ring-0 bg-gradient-to-br from-amber-500/10 to-orange-500/10 shadow-sm">
            <CardContent className="p-4 flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Completed Dispatches</p>
                <p className="text-2xl font-bold mt-1 text-foreground">{qrStats.completedDispatches}</p>
              </div>
              <div className="p-2.5 bg-primary/10 rounded-lg text-primary">
                <CheckCircle className="h-5 w-5" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Charts row */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* Trip trend area chart */}
          <Card className="lg:col-span-2 rounded-xl ambient-shadow border-0 ring-0">
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
          <Card className="rounded-xl ambient-shadow border-0 ring-0">
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
          <Card className="rounded-xl ambient-shadow border-0 ring-0">
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
          <Card className="lg:col-span-2 rounded-xl ambient-shadow border-0 ring-0">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-semibold flex items-center gap-2">
                <MapPin className="h-4 w-4 text-primary" />
                Recent Trips
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {recentTripsList.map((trip, idx) => (
                  <div
                    key={trip.id + idx}
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
        <Card className="rounded-xl ambient-shadow border-0 ring-0">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-primary" />
              Active Alerts
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {staticAlerts.map((alert, idx) => (
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
