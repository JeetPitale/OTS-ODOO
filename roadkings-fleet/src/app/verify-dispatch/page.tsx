"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import {
  Crown,
  Truck,
  User,
  MapPin,
  Clock,
  CheckCircle,
  AlertTriangle,
  XCircle,
  ShieldCheck,
  Calendar,
} from "lucide-react";

function VerifyDispatchContent() {
  const searchParams = useSearchParams();
  const dispatchId = searchParams.get("id");

  const [record, setRecord] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function checkRoleAndLoad() {
      try {
        const userRes = await fetch("/api/auth/me");
        const userData = await userRes.json();
        if (!userData.authenticated) {
          window.location.href = "/login";
          return;
        }
        const role = userData.user?.role;
        if (role !== "ADMIN" && role !== "DISPATCH_OPERATOR" && role !== "DISPATCH_MANAGER") {
          window.location.href = "/unauthorized";
          return;
        }
        
        if (dispatchId) {
          const res = await fetch(`/api/dispatches?search=${dispatchId}`);
          if (res.ok) {
            const data = await res.json();
            const found = data.items.find((h: any) => h.tripId === dispatchId || h.id === dispatchId);
            if (found) {
              setRecord(found);
              // Notification logic should be handled server-side or ignored for this public/auth view
            }
          }
        }
        setLoading(false);
      } catch {
        window.location.href = "/unauthorized";
      }
    }
    checkRoleAndLoad();
  }, [dispatchId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center font-sans">
        <div className="text-center space-y-3">
          <div className="h-10 w-10 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-sm text-muted-foreground font-medium">Verifying Dispatch Authenticity...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-between py-10 px-4 font-sans antialiased">
      <div className="w-full max-w-lg mx-auto bg-white rounded-3xl border border-slate-200/60 shadow-xl overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-orange-500 to-amber-500 p-6 text-white text-center space-y-1">
          <div className="flex items-center justify-center gap-2 mb-1">
            <Crown className="h-6 w-6" />
            <h1 className="text-xl font-bold tracking-tight">RoadKing Verification</h1>
          </div>
          <p className="text-[10px] text-white/80 font-bold uppercase tracking-widest">Digital Challan Audit Portal</p>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {record ? (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-6"
            >
              {/* Status Badge Block */}
              <div className="text-center pb-4 border-b border-slate-100">
                <div className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-bold shadow-sm">
                  {record.tripStatus === "on-trip" && (
                    <div className="bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center gap-1.5 px-3 py-1 rounded-full">
                      <span className="h-2 w-2 rounded-full bg-emerald-500 animate-ping" />
                      Active Dispatch Run
                    </div>
                  )}
                  {record.tripStatus === "completed" && (
                    <div className="bg-blue-50 text-blue-700 border border-blue-200 flex items-center gap-1.5 px-3 py-1 rounded-full">
                      <CheckCircle className="h-4 w-4 text-blue-600" />
                      Trip Completed
                    </div>
                  )}
                  {record.tripStatus === "cancelled" && (
                    <div className="bg-red-50 text-red-700 border border-red-200 flex items-center gap-1.5 px-3 py-1 rounded-full">
                      <XCircle className="h-4 w-4 text-red-600" />
                      Dispatch Cancelled
                    </div>
                  )}
                </div>
                <p className="text-lg font-bold text-slate-800 mt-3">{record.tripId}</p>
                <p className="text-xs text-muted-foreground mt-0.5">Reference: {record.tripId}</p>
              </div>

              {/* Trip Routing */}
              <div className="space-y-3 bg-slate-50 p-4 rounded-2xl border border-slate-100">
                <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider">Route Details</h3>
                <div className="flex items-center justify-between text-sm font-semibold text-slate-800">
                  <div className="flex items-center gap-1.5">
                    <MapPin className="h-4 w-4 text-slate-500" />
                    <span>{record.source}</span>
                  </div>
                  <span className="text-xs text-muted-foreground px-2 py-0.5 bg-white border rounded">
                    {record.distance}
                  </span>
                  <div className="flex items-center gap-1.5">
                    <MapPin className="h-4 w-4 text-primary" />
                    <span>{record.destination}</span>
                  </div>
                </div>
              </div>

              {/* Cargo Details */}
              <div className="space-y-3">
                <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider">Cargo & Load</h3>
                <div className="grid grid-cols-2 gap-4 bg-slate-50/50 p-4 rounded-2xl border border-slate-100 text-xs">
                  <div>
                    <span className="block text-muted-foreground">Cargo Description</span>
                    <strong className="text-slate-800 mt-1 block font-bold">{record.cargoDescription}</strong>
                  </div>
                  <div>
                    <span className="block text-muted-foreground">Weight (Verified)</span>
                    <strong className="text-slate-800 mt-1 block font-bold">{record.cargoWeight} kg</strong>
                  </div>
                </div>
              </div>

              {/* Driver & Vehicle Details */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider">Driver Details</h3>
                  <div className="bg-slate-50/50 p-3 rounded-2xl border border-slate-100 text-xs flex items-center gap-2">
                    <User className="h-4 w-4 text-primary flex-shrink-0" />
                    <div className="min-w-0">
                      <strong className="text-slate-800 block truncate">{record.driverName}</strong>
                      <span className="text-muted-foreground block truncate">ID: {record.driverId}</span>
                    </div>
                  </div>
                </div>
                <div className="space-y-2">
                  <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider">Vehicle Details</h3>
                  <div className="bg-slate-50/50 p-3 rounded-2xl border border-slate-100 text-xs flex items-center gap-2">
                    <Truck className="h-4 w-4 text-primary flex-shrink-0" />
                    <div className="min-w-0">
                      <strong className="text-slate-800 block truncate">{record.vehicleRegistration}</strong>
                      <span className="text-muted-foreground block truncate">{record.vehicleName}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Dispatch Logs */}
              <div className="space-y-3 pt-2">
                <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider">Security Logs</h3>
                <div className="divide-y divide-slate-100 bg-white border border-slate-100 rounded-2xl overflow-hidden text-xs">
                  <div className="flex justify-between items-center p-3">
                    <span className="text-muted-foreground flex items-center gap-1">
                      <Calendar className="h-3.5 w-3.5" /> Dispatch Date
                    </span>
                    <span className="font-semibold text-slate-800">{new Date(record.createdAt).toLocaleDateString()}</span>
                  </div>
                  <div className="flex justify-between items-center p-3">
                    <span className="text-muted-foreground flex items-center gap-1">
                      <Clock className="h-3.5 w-3.5" /> Dispatch Time
                    </span>
                    <span className="font-semibold text-slate-800">{new Date(record.createdAt).toLocaleTimeString()}</span>
                  </div>
                  {record.arrivalTime && (
                    <div className="flex justify-between items-center p-3 bg-blue-50/30">
                      <span className="text-blue-600 font-medium flex items-center gap-1">
                        <Clock className="h-3.5 w-3.5" /> Arrival Time
                      </span>
                      <span className="font-bold text-blue-700">{record.arrivalTime}</span>
                    </div>
                  )}
                  <div className="flex justify-between items-center p-3">
                    <span className="text-muted-foreground flex items-center gap-1">
                      <ShieldCheck className="h-3.5 w-3.5" /> Authorized Dispatcher
                    </span>
                    <span className="font-semibold text-slate-800">{record.dispatcher}</span>
                  </div>
                </div>
              </div>
            </motion.div>
          ) : (
            <div className="text-center py-10 text-muted-foreground space-y-3">
              <AlertTriangle className="h-12 w-12 text-amber-500 mx-auto stroke-[1.5]" />
              <div className="space-y-1">
                <p className="font-bold text-slate-800 text-sm">Verification Failed</p>
                <p className="text-xs max-w-[240px] mx-auto leading-relaxed">
                  No dispatch records matched the provided digital signature or ID.
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Action button */}
        <div className="bg-slate-50 border-t border-slate-100 p-4 text-center">
          <Link href="/login">
            <Button className="rounded-xl text-xs bg-primary hover:bg-primary/90 text-white font-bold px-6 shadow-sm">
              Log in to RoadKing Panel
            </Button>
          </Link>
        </div>
      </div>

      {/* Footer */}
      <div className="text-center text-[10px] text-muted-foreground font-medium uppercase tracking-widest mt-6">
        RoadKing Transport challan security checks
      </div>
    </div>
  );
}

export default function VerifyDispatchPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-slate-50 flex items-center justify-center font-sans">
        <div className="text-center space-y-3">
          <div className="h-10 w-10 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-sm text-muted-foreground font-medium">Loading verify portal...</p>
        </div>
      </div>
    }>
      <VerifyDispatchContent />
    </Suspense>
  );
}
