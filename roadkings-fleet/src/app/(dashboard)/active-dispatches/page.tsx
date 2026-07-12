"use client";

import { useEffect, useState } from "react";
import { Header, StatusBadge } from "@/components/shared";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Activity, Clock, ShieldAlert, CheckCircle, XCircle } from "lucide-react";
import { getDispatchHistory, completeTrip, cancelTrip } from "@/lib/storage";

export default function ActiveDispatchesPage() {
  const [activeDispatches, setActiveDispatches] = useState<any[]>([]);

  const loadActive = () => {
    const dispatches = getDispatchHistory();
    const active = dispatches.filter((d) => d.tripStatus === "on-trip");
    setActiveDispatches(active);
  };

  useEffect(() => {
    loadActive();
  }, []);

  const handleComplete = (dispatchId: string) => {
    // Prompt for simplified inputs or use standard completion values
    const odometer = prompt("Enter final odometer reading (km):", "46000");
    if (odometer === null) return;
    completeTrip(dispatchId, odometer, "60L", "Successfully completed trip.");
    loadActive();
  };

  const handleCancel = (dispatchId: string) => {
    if (confirm("Are you sure you want to cancel this dispatch?")) {
      cancelTrip(dispatchId);
      loadActive();
    }
  };

  return (
    <>
      <Header title="Active Dispatches" subtitle="Monitor and manage all live trips currently on the road" />
      <div className="p-6 space-y-6">
        <Card className="rounded-xl border border-border bg-white shadow-sm ring-0">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-bold flex items-center gap-2 text-foreground">
              <Activity className="h-4 w-4 text-orange-500 animate-pulse" />
              Live Trips on Road ({activeDispatches.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            {activeDispatches.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 text-center text-muted-foreground">
                <ShieldAlert className="h-10 w-10 mb-2 stroke-1 text-slate-400" />
                <p className="text-sm font-medium">No active dispatches right now</p>
                <p className="text-xs mt-1">Start a new dispatch from the Smart Dispatch panel.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
                {activeDispatches.map((disp) => (
                  <Card key={disp.dispatchId} className="rounded-xl border border-border bg-slate-50 shadow-none hover:border-slate-300 transition-colors">
                    <CardContent className="p-5 space-y-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <span className="text-xs font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                            {disp.dispatchId}
                          </span>
                          <span className="text-xs text-muted-foreground ml-2 font-medium">
                            Trip: {disp.tripId}
                          </span>
                        </div>
                        <StatusBadge variant="on-trip" />
                      </div>

                      <div className="space-y-2 border-y border-slate-200/60 py-3">
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground font-medium">Route:</span>
                          <span className="font-semibold text-foreground">{disp.source} &rarr; {disp.destination}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground font-medium">Driver:</span>
                          <span className="font-bold text-slate-800">{disp.driverName}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground font-medium">Vehicle:</span>
                          <span className="font-semibold text-slate-800">{disp.vehicleRegistration} ({disp.vehicleName})</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground font-medium">Cargo:</span>
                          <span className="text-slate-600">{disp.cargoDescription} ({disp.cargoWeight})</span>
                        </div>
                      </div>

                      <div className="flex items-center justify-between text-xs text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Clock className="h-3 w-3" /> Dispatched: {disp.dispatchDate} {disp.dispatchTime}
                        </span>
                        <span>ETA: {disp.expectedDelivery}</span>
                      </div>

                      <div className="flex gap-2 pt-2">
                        <Button
                          onClick={() => handleComplete(disp.dispatchId)}
                          size="sm"
                          className="flex-1 h-9 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold flex items-center justify-center gap-1 shadow-sm shadow-emerald-500/10"
                        >
                          <CheckCircle className="h-3.5 w-3.5" /> Complete Trip
                        </Button>
                        <Button
                          onClick={() => handleCancel(disp.dispatchId)}
                          variant="outline"
                          size="sm"
                          className="h-9 rounded-lg border-red-200 text-red-600 hover:bg-red-50 font-semibold"
                        >
                          <XCircle className="h-3.5 w-3.5" /> Cancel
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </>
  );
}
