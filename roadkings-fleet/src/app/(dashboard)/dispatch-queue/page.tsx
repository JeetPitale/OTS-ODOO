"use client";

import { useEffect, useState } from "react";
import { Header, StatusBadge } from "@/components/shared";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ListTodo, Play, ArrowRight, Clock, AlertCircle } from "lucide-react";
import { getTrips } from "@/lib/storage";
import Link from "next/link";

export default function DispatchQueuePage() {
  const [queuedTrips, setQueuedTrips] = useState<any[]>([]);

  useEffect(() => {
    // Get trips from local storage that are scheduled or not yet active
    const trips = getTrips();
    const scheduled = trips.filter(
      (t) => t.status === "scheduled" || t.status === "pending" || t.status === "available"
    );
    setQueuedTrips(scheduled);
  }, []);

  return (
    <>
      <Header title="Dispatch Queue" subtitle="Manage pending and scheduled trips waiting for dispatch" />
      <div className="p-6 space-y-6">
        <Card className="rounded-xl border border-border bg-white shadow-sm ring-0">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-bold flex items-center gap-2 text-foreground">
              <ListTodo className="h-4 w-4 text-orange-500" />
              Queued / Scheduled Trips ({queuedTrips.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            {queuedTrips.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 text-center text-muted-foreground">
                <AlertCircle className="h-10 w-10 mb-2 stroke-1 text-slate-400" />
                <p className="text-sm font-medium">No trips in dispatch queue</p>
                <p className="text-xs mt-1">All scheduled trips are currently active or completed.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {queuedTrips.map((trip) => (
                  <div
                    key={trip.id}
                    className="flex flex-col md:flex-row md:items-center justify-between p-4 rounded-xl border border-border bg-slate-50 hover:bg-slate-100/50 transition-colors gap-4"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-orange-600 bg-orange-50 px-2 py-0.5 rounded border border-orange-200">
                          {trip.id}
                        </span>
                        <h4 className="font-bold text-sm text-foreground">
                          {trip.origin} → {trip.destination}
                        </h4>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        Driver: <span className="font-medium text-slate-700">{trip.driver || "Unassigned"}</span> &middot; 
                        Vehicle: <span className="font-medium text-slate-700">{trip.vehicle || "Unassigned"}</span> &middot; 
                        Distance: <span className="font-medium text-slate-700">{trip.distance || "—"}</span>
                      </p>
                      {trip.startDate && (
                        <p className="text-[11px] text-slate-400 flex items-center gap-1">
                          <Clock className="h-3 w-3" /> Scheduled Start: {trip.startDate}
                        </p>
                      )}
                    </div>
                    
                    <div className="flex items-center gap-3">
                      <StatusBadge variant={trip.status} />
                      <Link href={`/smart-dispatch?tripId=${trip.id}`}>
                        <Button size="sm" className="h-9 px-3 rounded-lg bg-orange-500 hover:bg-orange-600 text-white font-bold flex items-center gap-1">
                          <Play className="h-3.5 w-3.5 fill-current" /> Dispatch Now
                        </Button>
                      </Link>
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
