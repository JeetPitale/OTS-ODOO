"use client";

import { Header, KpiCard } from "@/components/shared";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  BarChart3,
  TrendingUp,
  Fuel,
  Truck,
  Users,
  Download,
  Calendar,
} from "lucide-react";
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  Radar,
} from "recharts";

const revenueData = [
  { month: "Jul", revenue: 3800000, trips: 980 },
  { month: "Aug", revenue: 4100000, trips: 1050 },
  { month: "Sep", revenue: 4400000, trips: 1120 },
  { month: "Oct", revenue: 4200000, trips: 1080 },
  { month: "Nov", revenue: 4700000, trips: 1200 },
  { month: "Dec", revenue: 5100000, trips: 1320 },
];

const routePerformance = [
  { route: "Mumbai–Pune", trips: 180, revenue: 33, onTime: 97 },
  { route: "Delhi–Jaipur", trips: 145, revenue: 41, onTime: 95 },
  { route: "BLR–Chennai", trips: 120, revenue: 51, onTime: 98 },
  { route: "HYD–Vizag", trips: 98, revenue: 55, onTime: 92 },
  { route: "KOL–BBSR", trips: 85, revenue: 32, onTime: 96 },
];

const driverPerformance = [
  { metric: "On-Time", A: 98, B: 92, fullMark: 100 },
  { metric: "Safety", A: 94, B: 85, fullMark: 100 },
  { metric: "Fuel Eff.", A: 88, B: 78, fullMark: 100 },
  { metric: "Mileage", A: 92, B: 90, fullMark: 100 },
  { metric: "Incidents", A: 96, B: 72, fullMark: 100 },
];

const vehicleUtilization = [
  { name: "On Trip (>80%)", value: 42, color: "#3b82f6" },
  { name: "Moderate (50–80%)", value: 58, color: "#10b981" },
  { name: "Low (<50%)", value: 32, color: "#f97316" },
  { name: "Idle", value: 24, color: "#94a3b8" },
];

const costBreakdown = [
  { category: "Fuel", amount: 1240000 },
  { category: "Maintenance", amount: 310000 },
  { category: "Tolls", amount: 145000 },
  { category: "Insurance", amount: 98000 },
  { category: "Driver Pay", amount: 560000 },
  { category: "Misc", amount: 72000 },
];

export default function ReportsPage() {
  return (
    <>
      <Header title="Reports & Analytics" subtitle="Fleet performance insights" />
      <div className="p-6 space-y-6">
        {/* KPIs */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <KpiCard title="Revenue (MTD)" value="₹51.2L" icon={TrendingUp} trend={{ value: "+15% MoM", direction: "up" }} />
          <KpiCard title="Fleet Utilization" value="78.4%" icon={Truck} iconBgClass="bg-blue-50" trend={{ value: "+3.2%", direction: "up" }} />
          <KpiCard title="Cost per km" value="₹18.40" icon={Fuel} iconBgClass="bg-amber-50" trend={{ value: "-₹0.80", direction: "up" }} />
          <KpiCard title="Driver Efficiency" value="92.1" icon={Users} iconBgClass="bg-emerald-50" trend={{ value: "+1.2 pts", direction: "up" }} />
        </div>

        {/* Tabs */}
        <Tabs defaultValue="revenue" className="space-y-4">
          <div className="flex items-center justify-between">
            <TabsList className="rounded-lg">
              <TabsTrigger value="revenue" className="text-xs">Revenue</TabsTrigger>
              <TabsTrigger value="fleet" className="text-xs">Fleet</TabsTrigger>
              <TabsTrigger value="drivers" className="text-xs">Drivers</TabsTrigger>
              <TabsTrigger value="costs" className="text-xs">Costs</TabsTrigger>
            </TabsList>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" className="h-8 rounded-lg text-xs gap-1">
                <Calendar className="h-3.5 w-3.5" /> Last 6 Months
              </Button>
              <Button variant="outline" size="sm" className="h-8 rounded-lg text-xs gap-1">
                <Download className="h-3.5 w-3.5" /> Export PDF
              </Button>
            </div>
          </div>

          {/* Revenue Tab */}
          <TabsContent value="revenue" className="space-y-4">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <Card className="rounded-xl ambient-shadow border-0 ring-0">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-semibold flex items-center gap-2">
                    <BarChart3 className="h-4 w-4 text-primary" />
                    Monthly Revenue (₹) & Trip Volume
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={280}>
                    <BarChart data={revenueData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                      <XAxis dataKey="month" tick={{ fontSize: 12 }} stroke="#94a3b8" />
                      <YAxis tick={{ fontSize: 12 }} stroke="#94a3b8" tickFormatter={(v: unknown) => `${(Number(v) / 100000).toFixed(0)}L`} />
                      <Tooltip formatter={(value: unknown) => `₹${(Number(value) / 100000).toFixed(1)}L`} />
                      <Bar dataKey="revenue" fill="#FF6B1A" radius={[6, 6, 0, 0]} name="Revenue" />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              <Card className="rounded-xl ambient-shadow border-0 ring-0">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-semibold">Top Routes by Revenue</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {routePerformance.map((route) => (
                      <div key={route.route} className="space-y-1.5">
                        <div className="flex items-center justify-between text-sm">
                          <span className="font-medium">{route.route}</span>
                          <span className="text-muted-foreground">₹{route.revenue}L · {route.trips} trips · {route.onTime}% on-time</span>
                        </div>
                        <div className="h-2 bg-muted rounded-full overflow-hidden">
                          <div
                            className="h-full bg-gradient-to-r from-primary to-amber-400 rounded-full transition-all"
                            style={{ width: `${(route.revenue / 55) * 100}%` }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Fleet Tab */}
          <TabsContent value="fleet" className="space-y-4">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <Card className="rounded-xl ambient-shadow border-0 ring-0">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-semibold">Vehicle Utilization Breakdown</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={260}>
                    <PieChart>
                      <Pie
                        data={vehicleUtilization}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={90}
                        dataKey="value"
                        paddingAngle={3}
                      >
                        {vehicleUtilization.map((entry) => (
                          <Cell key={entry.name} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                  <div className="grid grid-cols-2 gap-2 mt-2">
                    {vehicleUtilization.map((item) => (
                      <div key={item.name} className="flex items-center gap-2 text-xs">
                        <span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: item.color }} />
                        <span className="text-muted-foreground">{item.name}</span>
                        <span className="font-semibold ml-auto">{item.value}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card className="rounded-xl ambient-shadow border-0 ring-0">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-semibold">Trip Volume Trend</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={280}>
                    <AreaChart data={revenueData}>
                      <defs>
                        <linearGradient id="tripAreaGrad" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="#FF6B1A" stopOpacity={0.3} />
                          <stop offset="100%" stopColor="#FF6B1A" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                      <XAxis dataKey="month" tick={{ fontSize: 12 }} stroke="#94a3b8" />
                      <YAxis tick={{ fontSize: 12 }} stroke="#94a3b8" />
                      <Tooltip />
                      <Area type="monotone" dataKey="trips" stroke="#FF6B1A" fill="url(#tripAreaGrad)" strokeWidth={2} />
                    </AreaChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Drivers Tab */}
          <TabsContent value="drivers" className="space-y-4">
            <Card className="rounded-xl ambient-shadow border-0 ring-0">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-semibold">Driver Performance Comparison (Radar)</CardTitle>
              </CardHeader>
              <CardContent className="flex justify-center">
                <ResponsiveContainer width="100%" height={350}>
                  <RadarChart data={driverPerformance}>
                    <PolarGrid stroke="#e2e8f0" />
                    <PolarAngleAxis dataKey="metric" tick={{ fontSize: 12 }} />
                    <Radar name="Top Performer" dataKey="A" stroke="#FF6B1A" fill="#FF6B1A" fillOpacity={0.25} strokeWidth={2} />
                    <Radar name="Fleet Average" dataKey="B" stroke="#94a3b8" fill="#94a3b8" fillOpacity={0.15} strokeWidth={2} />
                    <Tooltip />
                  </RadarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Costs Tab */}
          <TabsContent value="costs" className="space-y-4">
            <Card className="rounded-xl ambient-shadow border-0 ring-0">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-semibold">Cost Breakdown (MTD)</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={costBreakdown} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                    <XAxis type="number" tick={{ fontSize: 12 }} stroke="#94a3b8" tickFormatter={(v: unknown) => `₹${(Number(v) / 1000).toFixed(0)}K`} />
                    <YAxis type="category" dataKey="category" tick={{ fontSize: 12 }} stroke="#94a3b8" width={90} />
                    <Tooltip formatter={(value: unknown) => `₹${(Number(value) / 1000).toFixed(0)}K`} />
                    <Bar dataKey="amount" fill="#FF6B1A" radius={[0, 6, 6, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </>
  );
}
