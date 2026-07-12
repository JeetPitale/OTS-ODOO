"use client";

import { useEffect, useState } from "react";
import { Header } from "@/components/shared";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { User, Mail, Shield, ShieldCheck, Clock, MapPin } from "lucide-react";
import { auth } from "@/lib/auth";

export default function ProfilePage() {
  const [profile, setProfile] = useState({
    name: "John Dispatch Manager",
    email: "dispatchmanager@roadkings.com",
    role: "DISPATCH_MANAGER",
    roleLabel: "Dispatch Manager",
    shift: "Morning Session (08:00 AM - 04:00 PM)",
    station: "Mumbai Central Dispatch Terminal A",
  });

  useEffect(() => {
    // Attempt to load current user details
    fetch("/api/auth/me")
      .then((res) => res.json())
      .then((data) => {
        if (data?.user) {
          const label = data.user.role === "DISPATCH_MANAGER" ? "Dispatch Manager" : data.user.role;
          setProfile((prev) => ({
            ...prev,
            name: data.user.name || prev.name,
            email: data.user.email || prev.email,
            role: data.user.role || prev.role,
            roleLabel: label,
          }));
        }
      })
      .catch(() => {});
  }, []);

  return (
    <>
      <Header title="My Profile" subtitle="Manage your dispatch workstation and operator credentials" />
      <div className="p-6 space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Workstation Profile Card */}
          <Card className="rounded-xl border border-border bg-white shadow-sm ring-0 lg:col-span-1">
            <CardContent className="p-6 flex flex-col items-center text-center">
              <div className="h-20 w-20 rounded-full bg-orange-100 text-orange-600 flex items-center justify-center font-bold text-2xl border border-orange-200">
                JD
              </div>
              <h3 className="font-bold text-lg text-foreground mt-4">{profile.name}</h3>
              <p className="text-xs text-orange-600 font-bold uppercase tracking-wider mt-1 bg-orange-50 border border-orange-200 px-2.5 py-0.5 rounded-full">
                {profile.roleLabel}
              </p>
              
              <div className="w-full space-y-3 mt-6 border-t border-slate-100 pt-6 text-left">
                <div className="flex items-center gap-3 text-sm text-slate-600">
                  <Mail className="h-4 w-4 text-slate-400" />
                  <span className="truncate">{profile.email}</span>
                </div>
                <div className="flex items-center gap-3 text-sm text-slate-600">
                  <Shield className="h-4 w-4 text-slate-400" />
                  <span>Station: {profile.station}</span>
                </div>
                <div className="flex items-center gap-3 text-sm text-slate-600">
                  <Clock className="h-4 w-4 text-slate-400" />
                  <span>Shift: {profile.shift}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Settings & Permissions Overview */}
          <Card className="rounded-xl border border-border bg-white shadow-sm ring-0 lg:col-span-2">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-bold flex items-center gap-2 text-foreground">
                <ShieldCheck className="h-4 w-4 text-orange-500" />
                Workstation Permissions & Role Scope
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="p-4 rounded-xl border border-slate-100 bg-slate-50 space-y-2">
                <h4 className="font-bold text-sm text-slate-800">Authorized Module Access</h4>
                <p className="text-xs text-slate-500">
                  Your Dispatch Manager profile grants you exclusive control over the smart dispatch operations stack.
                </p>
                <div className="grid grid-cols-2 gap-2 text-xs font-semibold text-slate-700 mt-2">
                  <div className="flex items-center gap-1.5"><span className="h-1.5 w-1.5 rounded-full bg-emerald-500" /> Smart Dispatch Engine</div>
                  <div className="flex items-center gap-1.5"><span className="h-1.5 w-1.5 rounded-full bg-emerald-500" /> Permanent QR Management</div>
                  <div className="flex items-center gap-1.5"><span className="h-1.5 w-1.5 rounded-full bg-emerald-500" /> Dispatch Queue Scheduler</div>
                  <div className="flex items-center gap-1.5"><span className="h-1.5 w-1.5 rounded-full bg-emerald-500" /> QR Verification Terminal</div>
                  <div className="flex items-center gap-1.5"><span className="h-1.5 w-1.5 rounded-full bg-emerald-500" /> Live Dispatches Audit</div>
                  <div className="flex items-center gap-1.5"><span className="h-1.5 w-1.5 rounded-full bg-emerald-500" /> Shift Performance Summaries</div>
                </div>
              </div>

              <div className="p-4 rounded-xl border border-red-100 bg-red-50/50 space-y-2">
                <h4 className="font-bold text-sm text-red-800">Restricted Modules (No Access)</h4>
                <p className="text-xs text-slate-500">
                  The following components are protected administrative areas. Contact the system administrator if access is needed.
                </p>
                <div className="grid grid-cols-2 gap-2 text-xs font-semibold text-red-700 mt-2">
                  <div className="flex items-center gap-1.5"><span className="h-1.5 w-1.5 rounded-full bg-red-500" /> Vehicle Management</div>
                  <div className="flex items-center gap-1.5"><span className="h-1.5 w-1.5 rounded-full bg-red-500" /> Driver Management</div>
                  <div className="flex items-center gap-1.5"><span className="h-1.5 w-1.5 rounded-full bg-red-500" /> Maintenance Logs</div>
                  <div className="flex items-center gap-1.5"><span className="h-1.5 w-1.5 rounded-full bg-red-500" /> Fuel & Expenses</div>
                  <div className="flex items-center gap-1.5"><span className="h-1.5 w-1.5 rounded-full bg-red-500" /> Analytical Reports</div>
                  <div className="flex items-center gap-1.5"><span className="h-1.5 w-1.5 rounded-full bg-red-500" /> User Settings & RBAC</div>
                </div>
              </div>
            </CardContent>
          </Card>

        </div>
      </div>
    </>
  );
}
