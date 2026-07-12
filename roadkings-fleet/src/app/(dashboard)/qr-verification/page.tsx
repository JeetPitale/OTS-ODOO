"use client";

import { useEffect, useState } from "react";
import { Header } from "@/components/shared";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ScanLine, CheckCircle2, AlertTriangle, RefreshCw, QrCode } from "lucide-react";
import { useDrivers } from "@/hooks/useDrivers";
import { useQRScanLogs, useLogQRScan } from "@/hooks/useQR";

export default function QrVerificationPage() {
  const { data: driversData } = useDrivers({ limit: 100 });
  const { data: logsData } = useQRScanLogs();
  const logScan = useLogQRScan();

  const drivers = driversData?.items || [];
  const logs = (logsData || []).slice(0, 10);
  
  const [scannedResult, setScannedResult] = useState<any | null>(null);
  const [scanError, setScanError] = useState<string | null>(null);

  const simulateScan = async () => {
    setScanError(null);
    setScannedResult(null);

    // Pick a random driver
    if (drivers.length === 0) return;
    const randomDriver = drivers[Math.floor(Math.random() * drivers.length)];
    
    // 80% success scan rate simulation
    const isSuccess = Math.random() > 0.2;

    if (isSuccess) {
      if (randomDriver.status === "suspended") {
        setScanError(`Driver ${randomDriver.name} is currently Suspended! Cannot dispatch.`);
        await logScan.mutateAsync({ driverId: randomDriver.id, driverName: randomDriver.name, success: false, message: "Scan failed: Driver status is suspended." });
      } else {
        setScannedResult(randomDriver);
        await logScan.mutateAsync({ driverId: randomDriver.id, driverName: randomDriver.name, success: true, message: "Scan verified successfully." });
      }
    } else {
      setScanError("Failed to decode QR code. Please position the code correctly and retry.");
    }
  };

  return (
    <>
      <Header title="QR Verification" subtitle="Verify and check-in drivers using QR code scanner" />
      <div className="p-6 space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Scanner Simulation Block */}
          <Card className="rounded-xl border border-border bg-white shadow-sm ring-0 lg:col-span-2">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-bold flex items-center gap-2 text-foreground">
                <ScanLine className="h-4 w-4 text-orange-500" />
                Live Camera Scanner Simulation
              </CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col items-center justify-center py-10 text-center">
              <div className="w-full max-w-[320px] aspect-video border-2 border-dashed border-orange-400 rounded-2xl relative bg-slate-900 flex flex-col items-center justify-center overflow-hidden shadow-inner mb-6">
                
                {/* Horizontal scanner beam animation */}
                <div className="absolute top-0 inset-x-0 h-0.5 bg-orange-500 opacity-70 animate-bounce" style={{ animationDuration: "2.5s" }} />

                <QrCode className="h-16 w-16 text-slate-700 stroke-1" />
                <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider mt-3">Camera Viewfinder Active</p>
              </div>

              <div className="flex gap-3">
                <Button onClick={simulateScan} className="h-10 rounded-xl bg-orange-500 hover:bg-orange-600 text-white font-bold px-6 shadow-md shadow-orange-500/10">
                  <RefreshCw className="h-4 w-4 mr-2" /> Simulate Driver QR Scan
                </Button>
              </div>

              {/* Scanned Result Alerts */}
              {scannedResult && (
                <div className="w-full max-w-[420px] mt-6 p-4 rounded-xl border border-emerald-200 bg-emerald-50/50 flex gap-3 text-left">
                  <CheckCircle2 className="h-5 w-5 text-emerald-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <h4 className="font-bold text-sm text-emerald-800">Driver Verified</h4>
                    <p className="text-xs text-emerald-700 mt-1">
                      <strong>Name:</strong> {scannedResult.name} ({scannedResult.id}) <br />
                      <strong>License:</strong> {scannedResult.license} <br />
                      <strong>Safety Score:</strong> {scannedResult.safetyScore}%
                    </p>
                  </div>
                </div>
              )}

              {scanError && (
                <div className="w-full max-w-[420px] mt-6 p-4 rounded-xl border border-red-200 bg-red-50/50 flex gap-3 text-left">
                  <AlertTriangle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <h4 className="font-bold text-sm text-red-800">Verification Error</h4>
                    <p className="text-xs text-red-700 mt-1">{scanError}</p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Scan Logs Sidebar */}
          <Card className="rounded-xl border border-border bg-white shadow-sm ring-0">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-bold text-foreground">Recent Scan Logs</CardTitle>
            </CardHeader>
            <CardContent>
              {logs.length === 0 ? (
                <p className="text-xs text-muted-foreground py-8 text-center">No scans recorded today.</p>
              ) : (
                <div className="space-y-3 max-h-[400px] overflow-y-auto pr-1">
                  {logs.map((log: any) => (
                    <div key={log.id} className="p-2.5 rounded-lg border border-slate-100 bg-slate-50 flex flex-col gap-1">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-xs text-slate-700 truncate">{log.driverName}</span>
                        <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded ${
                          log.success ? "bg-emerald-50 text-emerald-600 border border-emerald-200" : "bg-red-50 text-red-600 border border-red-200"
                        }`}>
                          {log.success ? "Success" : "Failed"}
                        </span>
                      </div>
                      <p className="text-[11px] text-muted-foreground">{log.message}</p>
                      <span className="text-[9px] text-slate-400 mt-0.5">
                        {new Date(log.timestamp).toLocaleTimeString()}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

        </div>
      </div>
    </>
  );
}
