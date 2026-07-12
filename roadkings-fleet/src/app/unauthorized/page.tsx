"use client";

import { ShieldAlert } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function UnauthorizedPage() {
  return (
    <div className="relative min-h-screen w-full flex items-center justify-center bg-slate-50 overflow-hidden font-sans">
      <div className="absolute inset-0 bg-slate-50 pointer-events-none">
        <div className="absolute inset-0 bg-gradient-to-b from-red-100/30 via-slate-50/20 to-white" />
      </div>

      <div className="relative z-30 max-w-md w-full px-6 py-12">
        <div className="backdrop-blur-xl bg-white/75 border border-white/60 rounded-3xl p-8 md:p-10 shadow-[0_30px_60px_rgba(239,68,68,0.06)] text-center space-y-6">
          <div className="mx-auto h-12 w-12 rounded-2xl bg-gradient-to-br from-red-500 to-rose-600 flex items-center justify-center shadow-lg shadow-red-500/20">
            <ShieldAlert className="h-6 w-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900">Access Denied</h1>
            <p className="text-red-500 text-[10px] font-bold tracking-widest uppercase mt-1">
              Unauthorized Route Attempt
            </p>
          </div>

          <p className="text-slate-600 text-sm leading-relaxed">
            Your account does not have the required permissions to view this resource. If you believe this is in error, please contact your Fleet Administrator.
          </p>

          <div className="pt-4 border-t border-slate-200/50">
            <Link href="/login">
              <Button className="w-full h-11 rounded-xl bg-gradient-to-r from-slate-800 to-slate-900 hover:from-slate-900 hover:to-black text-white font-bold text-sm shadow-md transition-all duration-300">
                Return to Login
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
