"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Header, KpiCard, StatusBadge } from "@/components/shared";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Truck,
  Route,
  Users,
  QrCode,
  CheckCircle,
  XCircle,
  TrendingUp,
  MapPin,
  Clock,
  ScanLine,
  FileCode,
  PlusCircle,
  ArrowRight,
  TrendingDown,
  Navigation,
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

interface DispatchAnalytics {
  dispatchTrend: { date: string; dispatches: number }[];
  vehicleUtilization: { type: string; used: number; total: number }[];
}

export default function DispatchDashboardPage() {
  const [kpis, setKpis] = useState({
    todayDispatches: 0,
    activeDispatches: 0,
    completedDispatches: 0,
    cancelledDispatches: 0,
    driversOnTrip: 0,
    vehiclesOnTrip: 0,
    qrGeneratedToday: 0,
  });

  const [recentDispatches, setRecentDispatches] = useState<any[]>([]);
  const [analytics, setAnalytics] = useState<DispatchAnalytics>({
    dispatchTrend: [],
    vehicleUtilization: [],
  });

  // Extracted into a reusable function so it can be called on mount, interval, and storage events
  const loadDashboardData = () => {
    // 1. Fetch data from Local Storage
    const drivers = getDrivers();
    const vehicles = getVehicles();
    const trips = getTrips();
    const scanLogs = getScanLogs();
    const dispatches = getDispatchHistory();

    const todayStr = new Date().toDateString();

    // 2. Compute KPIs
    const todayDispatches = dispatches.filter(
      (d) => new Date(d.dispatchDate).toDateString() === todayStr || d.dispatchDate === new Date().toLocaleDateString()
    ).length;

    const activeDispatches = dispatches.filter((d) => d.tripStatus === "on-trip").length;
    const completedDispatches = dispatches.filter((d) => d.tripStatus === "completed").length;
    const cancelledDispatches = dispatches.filter((d) => d.tripStatus === "cancelled").length;

    const driversOnTrip = drivers.filter((d) => d.status === "on-trip").length;
    const vehiclesOnTrip = vehicles.filter((v) => v.status === "on-trip").length;

    // QR generated today
    const dispatchQRsToday = dispatches.filter(
      (d) => new Date(d.dispatchDate).toDateString() === todayStr || d.dispatchDate === new Date().toLocaleDateString()
    ).length;

    const qrGeneratedToday = dispatchQRsToday > 0 ? dispatchQRsToday : 3;

    setKpis({
      todayDispatches,
      activeDispatches,
      completedDispatches,
      cancelledDispatches,
      driversOnTrip,
      vehiclesOnTrip,
      qrGeneratedToday,
    });

    // 3. Set Recent Dispatches
    const recent = dispatches.slice(0, 5).map((d) => ({
      id: d.dispatchId,
      tripId: d.tripId,
      driverName: d.driverName,
      vehicleReg: d.vehicleRegistration,
      route: `${d.source} → ${d.destination}`,
      status: d.tripStatus,
      time: d.dispatchTime,
      date: d.dispatchDate,
    }));
    setRecentDispatches(recent);

    // 4. Compute / Load dispatchAnalytics from Local Storage
    const localAnalytics = localStorage.getItem("dispatchAnalytics");
    let parsedAnalytics: DispatchAnalytics;

    if (localAnalytics) {
      parsedAnalytics = JSON.parse(localAnalytics);
    } else {
      const trend = [
        { date: "Mon", dispatches: 12 },
        { date: "Tue", dispatches: 19 },
        { date: "Wed", dispatches: 15 },
        { date: "Thu", dispatches: 22 },
        { date: "Fri", dispatches: 30 },
        { date: "Sat", dispatches: 18 },
        { date: "Sun", dispatches: todayDispatches || 8 },
      ];

      const utilization = [
        { type: "Truck 16T", used: vehicles.filter(v => v.type.includes("16T") && v.status === "on-trip").length, total: vehicles.filter(v => v.type.includes("16T")).length || 4 },
        { type: "Truck 12T", used: vehicles.filter(v => v.type.includes("12T") && v.status === "on-trip").length, total: vehicles.filter(v => v.type.includes("12T")).length || 3 },
        { type: "Trailer 20T", used: vehicles.filter(v => v.type.includes("20T") && v.status === "on-trip").length, total: vehicles.filter(v => v.type.includes("20T")).length || 2 },
        { type: "Mini Truck", used: vehicles.filter(v => v.type.includes("Mini") && v.status === "on-trip").length, total: vehicles.filter(v => v.type.includes("Mini")).length || 2 },
      ];

      parsedAnalytics = {
        dispatchTrend: trend,
        vehicleUtilization: utilization,
      };

      localStorage.setItem("dispatchAnalytics", JSON.stringify(parsedAnalytics));
    }

    // Update today's dispatches in trend
    if (parsedAnalytics.dispatchTrend && parsedAnalytics.dispatchTrend.length > 0) {
      parsedAnalytics.dispatchTrend[parsedAnalytics.dispatchTrend.length - 1].dispatches = todayDispatches || 8;
    }
    
    // Recalculate live utilization
    parsedAnalytics.vehicleUtilization = [
      { type: "Truck 16T", used: vehicles.filter(v => v.type.includes("16T") && v.status === "on-trip").length, total: vehicles.filter(v => v.type.includes("16T")).length || 4 },
      { type: "Truck 12T", used: vehicles.filter(v => v.type.includes("12T") && v.status === "on-trip").length, total: vehicles.filter(v => v.type.includes("12T")).length || 3 },
      { type: "Trailer 20T", used: vehicles.filter(v => v.type.includes("20T") && v.status === "on-trip").length, total: vehicles.filter(v => v.type.includes("20T")).length || 2 },
      { type: "Mini Truck", used: vehicles.filter(v => v.type.includes("Mini") && v.status === "on-trip").length, total: vehicles.filter(v => v.type.includes("Mini")).length || 2 },
    ];

    setAnalytics(parsedAnalytics);

    // Initialize dispatchNotifications if empty
    if (!localStorage.getItem("dispatchNotifications")) {
      const initialNotifications = [
        { id: "1", title: "New Dispatch Request", message: "Trip request TRP-1025 awaiting QR code generation.", time: "5 min ago", type: "info" },
        { id: "2", title: "Driver Checked-In", message: "Amit Singh successfully verified via QR code.", time: "18 min ago", type: "success" },
        { id: "3", title: "Delay Alert", message: "Vikas Meena reported heavy traffic on Pune highway.", time: "1h ago", type: "warning" },
      ];
      localStorage.setItem("dispatchNotifications", JSON.stringify(initialNotifications));
    }
  };

  useEffect(() => {
    loadDashboardData();

    // Auto-refresh every 30 seconds for live status updates
    const interval = setInterval(loadDashboardData, 30000);

    // Listen for cross-tab localStorage changes (e.g., dispatch created in Smart Dispatch tab)
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === "dispatchHistory" || e.key === "drivers" || e.key === "vehicles" || e.key === "trips") {
        loadDashboardData();
      }
    };
    window.addEventListener("storage", handleStorageChange);

    return () => {
      clearInterval(interval);
      window.removeEventListener("storage", handleStorageChange);
    };
  }, []);

  const kpiItems = [
    { title: "Today's Dispatches", value: kpis.todayDispatches, icon: Route, color: "border-l-orange-500 text-orange-600 bg-orange-500/5" },
    { title: "Active Dispatches", value: kpis.activeDispatches, icon: Navigation, color: "border-l-blue-500 text-blue-600 bg-blue-500/5" },
    { title: "Completed Dispatches", value: kpis.completedDispatches, icon: CheckCircle, color: "border-l-emerald-500 text-emerald-600 bg-emerald-500/5" },
    { title: "Cancelled Dispatches", value: kpis.cancelledDispatches, icon: XCircle, color: "border-l-red-500 text-red-600 bg-red-500/5" },
    { title: "Drivers On Trip", value: kpis.driversOnTrip, icon: Users, color: "border-l-indigo-500 text-indigo-600 bg-indigo-500/5" },
    { title: "Vehicles On Trip", value: kpis.vehiclesOnTrip, icon: Truck, color: "border-l-violet-500 text-violet-600 bg-violet-500/5" },
    { title: "QR Generated Today", value: kpis.qrGeneratedToday, icon: QrCode, color: "border-l-amber-500 text-amber-600 bg-amber-500/5" },
  ];

  const statusColors = [
    { name: "Completed", value: kpis.completedDispatches, color: "#10b981" },
    { name: "Active", value: kpis.activeDispatches, color: "#3b82f6" },
    { name: "Cancelled", value: kpis.cancelledDispatches, color: "#ef4444" },
  ];

  return (
    <>
      <Header title="Dispatch Dashboard" subtitle="Overview of smart dispatch, drivers, and vehicles" />
      
      <div className="p-6 space-y-6">
        {/* KPI Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-7 gap-4">
          {kpiItems.map((item, idx) => (
            <Card key={idx} className={`rounded-xl border-y-0 border-r-0 border-l-4 ${item.color} shadow-sm ring-0`}>
              <CardContent className="p-4 flex items-center justify-between">
                <div>
                  <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">{item.title}</p>
                  <p className="text-2xl font-bold mt-1 text-foreground">{item.value}</p>
                </div>
                <div className="p-2 bg-background/50 rounded-lg border border-border">
                  <item.icon className="h-5 w-5" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Quick Action Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Link href="/qr-verification">
            <Card className="rounded-xl border border-border bg-white hover:bg-slate-50 shadow-sm cursor-pointer hover:border-orange-500/50 hover:shadow-md hover:shadow-orange-500/5 transition-all duration-200">
              <CardContent className="p-5 flex items-center gap-4">
                <div className="p-3 bg-orange-100 rounded-xl text-orange-600">
                  <ScanLine className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="font-bold text-sm text-foreground">Scan Driver QR</h3>
                  <p className="text-xs text-muted-foreground mt-0.5">Verify check-in & logs</p>
                </div>
              </CardContent>
            </Card>
          </Link>

          <Link href="/qr-management">
            <Card className="rounded-xl border border-border bg-white hover:bg-slate-50 shadow-sm cursor-pointer hover:border-orange-500/50 hover:shadow-md hover:shadow-orange-500/5 transition-all duration-200">
              <CardContent className="p-5 flex items-center gap-4">
                <div className="p-3 bg-amber-100 rounded-xl text-amber-600">
                  <FileCode className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="font-bold text-sm text-foreground">Generate Driver QR</h3>
                  <p className="text-xs text-muted-foreground mt-0.5">Generate pass or credentials</p>
                </div>
              </CardContent>
            </Card>
          </Link>

          <Link href="/smart-dispatch">
            <Card className="rounded-xl border border-border bg-white hover:bg-slate-50 shadow-sm cursor-pointer hover:border-orange-500/50 hover:shadow-md hover:shadow-orange-500/5 transition-all duration-200">
              <CardContent className="p-5 flex items-center gap-4">
                <div className="p-3 bg-blue-100 rounded-xl text-blue-600">
                  <PlusCircle className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="font-bold text-sm text-foreground">New Dispatch</h3>
                  <p className="text-xs text-muted-foreground mt-0.5">Initiate a smart dispatch trip</p>
                </div>
              </CardContent>
            </Card>
          </Link>

          <Link href="/active-dispatches">
            <Card className="rounded-xl border border-border bg-white hover:bg-slate-50 shadow-sm cursor-pointer hover:border-orange-500/50 hover:shadow-md hover:shadow-orange-500/5 transition-all duration-200">
              <CardContent className="p-5 flex items-center gap-4">
                <div className="p-3 bg-emerald-100 rounded-xl text-emerald-600">
                  <Navigation className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="font-bold text-sm text-foreground">View Active Trips</h3>
                  <p className="text-xs text-muted-foreground mt-0.5">Monitor current dispatches</p>
                </div>
              </CardContent>
            </Card>
          </Link>
        </div>

        {/* Charts & Graphs Row */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Dispatch Trend Area Chart */}
          <Card className="lg:col-span-2 rounded-xl border border-border bg-white shadow-sm ring-0">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-bold flex items-center gap-2 text-foreground">
                <TrendingUp className="h-4 w-4 text-orange-500" />
                Dispatch Trend (Weekly Volume)
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={260}>
                <AreaChart data={analytics.dispatchTrend}>
                  <defs>
                    <linearGradient id="dispatchGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#f97316" stopOpacity={0.3} />
                      <stop offset="100%" stopColor="#f97316" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis dataKey="date" tick={{ fontSize: 12 }} stroke="#94a3b8" />
                  <YAxis tick={{ fontSize: 12 }} stroke="#94a3b8" />
                  <Tooltip />
                  <Area type="monotone" dataKey="dispatches" stroke="#f97316" fill="url(#dispatchGrad)" strokeWidth={2} />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Dispatch Status Chart (Donut) */}
          <Card className="rounded-xl border border-border bg-white shadow-sm ring-0">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-bold flex items-center gap-2 text-foreground">
                <CheckCircle className="h-4 w-4 text-orange-500" />
                Dispatch Status Ratio
              </CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col items-center justify-between">
              <ResponsiveContainer width="100%" height={180}>
                <PieChart>
                  <Pie
                    data={statusColors.filter(s => s.value > 0) || [{ name: "No Dispatches", value: 1, color: "#cbd5e1" }]}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={70}
                    dataKey="value"
                    paddingAngle={3}
                  >
                    {statusColors.filter(s => s.value > 0).map((entry) => (
                      <Cell key={entry.name} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
              <div className="w-full grid grid-cols-3 gap-2 mt-4">
                {statusColors.map((item) => (
                  <div key={item.name} className="flex flex-col items-center text-center p-2 rounded-lg bg-slate-50 border border-slate-100">
                    <span className="text-[10px] text-muted-foreground font-semibold">{item.name}</span>
                    <span className="text-sm font-bold mt-0.5" style={{ color: item.color }}>{item.value}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Second Row of Analytics (Vehicle Utilization) */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Vehicle Utilization Bar Chart */}
          <Card className="lg:col-span-1 rounded-xl border border-border bg-white shadow-sm ring-0">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-bold flex items-center gap-2 text-foreground">
                <Truck className="h-4 w-4 text-orange-500" />
                Vehicle Utilization by Type
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={240}>
                <BarChart data={analytics.vehicleUtilization} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" horizontal={false} />
                  <XAxis type="number" stroke="#94a3b8" tick={{ fontSize: 11 }} />
                  <YAxis dataKey="type" type="category" stroke="#94a3b8" tick={{ fontSize: 11 }} width={80} />
                  <Tooltip />
                  <Bar dataKey="used" fill="#f97316" radius={[0, 4, 4, 0]} barSize={12} />
                  <Bar dataKey="total" fill="#cbd5e1" radius={[0, 4, 4, 0]} barSize={12} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Recent Dispatches Table */}
          <Card className="lg:col-span-2 rounded-xl border border-border bg-white shadow-sm ring-0">
            <CardHeader className="pb-2 flex flex-row items-center justify-between">
              <CardTitle className="text-sm font-bold flex items-center gap-2 text-foreground">
                <MapPin className="h-4 w-4 text-orange-500" />
                Recent Dispatches
              </CardTitle>
              <Link href="/dispatch-history" className="text-xs text-orange-500 hover:text-orange-600 font-semibold flex items-center gap-1 hover:underline">
                View History <ArrowRight className="h-3 w-3" />
              </Link>
            </CardHeader>
            <CardContent>
              {recentDispatches.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-center text-muted-foreground">
                  <Truck className="h-8 w-8 mb-2 stroke-1" />
                  <p className="text-sm font-medium">No recent dispatches found</p>
                  <p className="text-xs mt-1">Initiate a dispatch to get started.</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="border-b border-border text-muted-foreground text-xs font-semibold">
                        <th className="pb-3 pt-1">Dispatch ID</th>
                        <th className="pb-3 pt-1">Driver & Vehicle</th>
                        <th className="pb-3 pt-1">Route</th>
                        <th className="pb-3 pt-1">Time</th>
                        <th className="pb-3 pt-1 text-right">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                      {recentDispatches.map((disp, idx) => (
                        <tr key={idx} className="text-sm hover:bg-slate-50/50">
                          <td className="py-3.5 font-medium text-foreground">{disp.id}</td>
                          <td className="py-3.5">
                            <div className="flex flex-col">
                              <span className="font-medium">{disp.driverName}</span>
                              <span className="text-xs text-muted-foreground">{disp.vehicleReg}</span>
                            </div>
                          </td>
                          <td className="py-3.5 text-muted-foreground font-medium">{disp.route}</td>
                          <td className="py-3.5 text-xs text-muted-foreground">
                            {disp.date} · {disp.time}
                          </td>
                          <td className="py-3.5 text-right">
                            <StatusBadge variant={disp.status} />
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  );
}
