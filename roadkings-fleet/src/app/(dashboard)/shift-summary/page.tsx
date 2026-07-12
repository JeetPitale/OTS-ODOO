"use client";

import { useEffect, useState } from "react";
import { Header, StatusBadge } from "@/components/shared";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Clock, Calendar, CheckSquare, ShieldCheck, MapPin } from "lucide-react";
import { useDispatches } from "@/hooks/useDispatches";

export default function ShiftSummaryPage() {
  const { data: dispatchesData, isLoading } = useDispatches({ limit: 100 });

  
  const [summary, setSummary] = useState({
    shiftDate: "",
    shiftTime: "08:00 AM - 04:00 PM (General Shift)",
    totalDispatches: 0,
    completed: 0,
    active: 0,
    cancelled: 0,
  });

  const [shiftDispatches, setShiftDispatches] = useState<any[]>([]);

  useEffect(() => {
    if (isLoading) return;

    const todayStr = new Date().toDateString();
    const todayDispatches = (dispatchesData?.items || []).filter(
      (d: any) => new Date(d.createdAt).toDateString() === todayStr
    );

    const completed = todayDispatches.filter((d: any) => d.tripStatus === "completed").length;
    const active = todayDispatches.filter((d: any) => d.tripStatus === "on-trip").length;
    const cancelled = todayDispatches.filter((d: any) => d.tripStatus === "cancelled").length;

    setSummary({
      shiftDate: new Date().toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }),
      shiftTime: "08:00 AM - 04:00 PM (General Shift)",
      totalDispatches: todayDispatches.length,
      completed,
      active,
      cancelled,
    });

    setShiftDispatches(todayDispatches);
  }, [dispatchesData?.items, isLoading]);

  return (
    <>
      <Header title="Shift Summary" subtitle="Daily shift report, stats, and audit logs for your active duty session" />
      <div className="p-6 space-y-6">
        
        {/* Shift Details Card */}
        <Card className="rounded-xl border border-border bg-white shadow-sm ring-0">
          <CardContent className="p-6 flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="space-y-1.5">
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-orange-500" />
                <span className="font-bold text-sm text-slate-500 uppercase tracking-wider">Current Shift Session</span>
              </div>
              <h3 className="font-bold text-lg text-foreground">{summary.shiftDate}</h3>
              <p className="text-xs text-muted-foreground flex items-center gap-1">
                <Clock className="h-3.5 w-3.5" /> {summary.shiftTime}
              </p>
            </div>
            
            <div className="flex flex-wrap gap-4 border-t md:border-t-0 md:border-l border-slate-200/80 pt-4 md:pt-0 md:pl-6">
              <div className="px-4 py-2 bg-slate-50 rounded-lg border border-slate-100 text-center">
                <p className="text-[10px] text-muted-foreground font-bold uppercase">Total Dispatches</p>
                <p className="text-xl font-bold text-foreground mt-0.5">{summary.totalDispatches}</p>
              </div>
              <div className="px-4 py-2 bg-emerald-50 rounded-lg border border-emerald-100 text-center">
                <p className="text-[10px] text-emerald-600 font-bold uppercase">Completed</p>
                <p className="text-xl font-bold text-emerald-700 mt-0.5">{summary.completed}</p>
              </div>
              <div className="px-4 py-2 bg-blue-50 rounded-lg border border-blue-100 text-center">
                <p className="text-[10px] text-blue-600 font-bold uppercase">Active</p>
                <p className="text-xl font-bold text-blue-700 mt-0.5">{summary.active}</p>
              </div>
              <div className="px-4 py-2 bg-red-50 rounded-lg border border-red-100 text-center">
                <p className="text-[10px] text-red-600 font-bold uppercase">Cancelled</p>
                <p className="text-xl font-bold text-red-700 mt-0.5">{summary.cancelled}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Shift Activities Log */}
        <Card className="rounded-xl border border-border bg-white shadow-sm ring-0">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-bold flex items-center gap-2 text-foreground">
              <CheckSquare className="h-4 w-4 text-orange-500" />
              Shift Dispatch Activity Logs
            </CardTitle>
          </CardHeader>
          <CardContent>
            {shiftDispatches.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 text-center text-muted-foreground">
                <ShieldCheck className="h-10 w-10 mb-2 stroke-1 text-slate-300" />
                <p className="text-sm font-medium">No activity in this shift session</p>
                <p className="text-xs mt-1">Dispatches you trigger today will be listed in this session log.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {shiftDispatches.map((disp, idx) => (
                  <div key={idx} className="p-3.5 rounded-xl border border-border bg-slate-50 flex flex-col md:flex-row md:items-center justify-between gap-3 text-sm">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-orange-600 bg-orange-50 px-2 py-0.5 rounded border border-orange-200">
                          {disp.tripId}
                        </span>
                        <StatusBadge variant={disp.tripStatus.replace("_", "-") as any} />
                        <h4 className="font-semibold text-slate-800 flex items-center gap-1">
                          <MapPin className="h-3.5 w-3.5 text-muted-foreground" /> {disp.source} &rarr; {disp.destination}
                        </h4>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        Driver: <strong>{disp.driverName}</strong> &middot; Vehicle: <strong>{disp.vehicleRegistration}</strong>
                      </p>
                    </div>
                    <div className="text-right text-xs text-muted-foreground flex md:flex-col items-center md:items-end justify-between md:justify-center gap-2">
                      <span className="font-bold text-slate-700">{new Date(disp.createdAt).toLocaleTimeString()}</span>
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        disp.tripStatus === "completed" ? "bg-emerald-50 text-emerald-600 border border-emerald-200" :
                        disp.tripStatus === "on-trip" ? "bg-blue-50 text-blue-600 border border-blue-200" :
                        "bg-red-50 text-red-600 border border-red-200"
                      }`}>
                        {disp.tripStatus.toUpperCase()}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

      </div>
    </>
  );
}
