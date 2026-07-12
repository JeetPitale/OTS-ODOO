"use client";

import { useEffect, useState, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { Header, StatusBadge } from "@/components/shared";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  ArrowLeft,
  Download,
  Printer,
  Copy,
  RefreshCw,
  Star,
  Phone,
  FileText,
  Clock,
  ShieldCheck,
  AlertTriangle,
  CheckCircle2,
} from "lucide-react";
import { QRCodeCanvas } from "qrcode.react";
import { getDrivers, getDriverQRs, updateDriverQR, type Driver } from "@/lib/storage";

export default function DriverDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const driverId = params.id as string;

  const [driver, setDriver] = useState<Driver | null>(null);
  const [qrValue, setQrValue] = useState<string>("");
  const [copied, setCopied] = useState(false);
  const [regenerating, setRegenerating] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);
  const qrRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const list = getDrivers();
    const found = list.find((d) => d.id === driverId);
    if (found) {
      setDriver(found);
      const qrs = getDriverQRs();
      setQrValue(qrs[found.id] || JSON.stringify({ driverId: found.id, driverName: found.name }));
    }
  }, [driverId]);

  if (!driver) {
    return (
      <div className="p-8 text-center">
        <p className="text-muted-foreground">Driver not found.</p>
        <Link href="/drivers">
          <Button className="mt-4 gap-1">
            <ArrowLeft className="h-4 w-4" /> Back to Drivers
          </Button>
        </Link>
      </div>
    );
  }

  const handleCopyId = () => {
    navigator.clipboard.writeText(driver.id);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadQR = () => {
    const canvas = qrRef.current;
    if (!canvas) return;
    const url = canvas.toDataURL("image/png");
    const link = document.createElement("a");
    link.download = `driver-${driver.id}-qr.png`;
    link.href = url;
    link.click();
    showFeedback("QR Code Downloaded successfully!");
  };

  const handlePrintQR = () => {
    const canvas = qrRef.current;
    if (!canvas) return;
    const url = canvas.toDataURL("image/png");

    const printWindow = window.open("", "_blank");
    if (!printWindow) return;

    printWindow.document.write(`
      <html>
        <head>
          <title>Print QR Code - ${driver.name}</title>
          <style>
            body {
              font-family: 'Inter Tight', sans-serif;
              display: flex;
              flex-direction: column;
              align-items: center;
              justify-content: center;
              height: 90vh;
              margin: 0;
            }
            .card {
              border: 2px solid #e2e8f0;
              border-radius: 16px;
              padding: 24px;
              text-align: center;
              box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
              max-width: 320px;
            }
            .logo {
              font-weight: bold;
              font-size: 20px;
              color: #ff6b1a;
              margin-bottom: 4px;
            }
            .sub {
              font-size: 10px;
              color: #64748b;
              text-transform: uppercase;
              letter-spacing: 0.1em;
              margin-bottom: 20px;
            }
            img {
              width: 200px;
              height: 200px;
              margin-bottom: 20px;
            }
            .name {
              font-size: 18px;
              font-weight: bold;
              margin: 4px 0;
            }
            .id {
              font-size: 12px;
              color: #64748b;
            }
          </style>
        </head>
        <body onload="window.print(); window.close();">
          <div class="card">
            <div class="logo">RoadKings</div>
            <div class="sub">Permanent Driver ID Pass</div>
            <img src="${url}" />
            <div class="name">${driver.name}</div>
            <div class="id">Driver ID: ${driver.id}</div>
          </div>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  const handleRegenerateQR = () => {
    setRegenerating(true);
    setTimeout(() => {
      // Create a fresh payload (simulating token refresh or signature updates)
      const freshPayload = JSON.stringify({
        driverId: driver.id,
        driverName: driver.name,
        timestamp: Date.now(),
      });
      updateDriverQR(driver.id, freshPayload);
      setQrValue(freshPayload);
      setRegenerating(false);
      showFeedback("Driver QR regenerated successfully!");
    }, 800);
  };

  const showFeedback = (msg: string) => {
    setFeedback(msg);
    setTimeout(() => setFeedback(null), 3000);
  };

  return (
    <>
      <div className="flex items-center gap-4 px-6 pt-6">
        <Link href="/drivers">
          <Button variant="outline" size="sm" className="h-8 rounded-lg text-xs gap-1 border-border bg-white shadow-sm">
            <ArrowLeft className="h-3.5 w-3.5" /> Back to Drivers
          </Button>
        </Link>
      </div>

      <Header title={`${driver.name}`} subtitle={`Driver Profile & Smart Credentials`} />

      <div className="p-6 space-y-6">
        {feedback && (
          <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl px-4 py-3 text-sm flex items-center gap-2.5 animate-fadeIn">
            <CheckCircle2 className="h-4 w-4 text-emerald-600 flex-shrink-0" />
            <span className="font-medium">{feedback}</span>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Info Card */}
          <Card className="lg:col-span-2 rounded-xl border-0 ambient-shadow overflow-hidden">
            <CardHeader className="bg-gradient-to-r from-orange-500/10 to-amber-500/5 pb-6 border-b border-border/50">
              <div className="flex flex-col sm:flex-row items-center gap-5">
                <img
                  src={driver.photoUrl || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200"}
                  alt={driver.name}
                  className="w-20 h-20 rounded-full object-cover border-4 border-white shadow-md flex-shrink-0"
                />
                <div className="text-center sm:text-left space-y-1">
                  <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                    <h2 className="text-xl font-bold text-foreground">{driver.name}</h2>
                    <div className="inline-flex justify-center">
                      <StatusBadge variant={driver.status} />
                    </div>
                  </div>
                  <p className="text-sm text-muted-foreground font-medium">Driver ID: {driver.id}</p>
                  <div className="flex items-center justify-center sm:justify-start gap-1 text-xs text-amber-600 bg-amber-50 w-fit px-2 py-0.5 rounded-md font-bold mt-1.5">
                    <Star className="h-3 w-3 fill-amber-500 text-amber-500" />
                    Safety Score: {driver.safetyScore}
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <label className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">License Number</label>
                  <p className="text-sm font-semibold mt-0.5">{driver.license}</p>
                </div>
                <div>
                  <label className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">License Category</label>
                  <p className="text-sm font-medium mt-0.5">{driver.licenseCategory || "Heavy Motor Vehicle (HMV)"}</p>
                </div>
                <div>
                  <label className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">License Expiry</label>
                  <p className="text-sm font-medium mt-0.5 flex items-center gap-1.5">
                    <Clock className="h-4 w-4 text-muted-foreground" />
                    {driver.licenseExpiry || "2028-10-15"}
                  </p>
                </div>
              </div>
              <div className="space-y-4">
                <div>
                  <label className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">Contact Number</label>
                  <p className="text-sm font-medium mt-0.5 flex items-center gap-1.5">
                    <Phone className="h-4 w-4 text-muted-foreground" />
                    {driver.phone}
                  </p>
                </div>
                <div>
                  <label className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">Assigned Vehicle</label>
                  <p className="text-sm font-semibold mt-0.5 text-primary">{driver.vehicle || "Unassigned"}</p>
                </div>
                <div className="grid grid-cols-2 gap-4 pt-1">
                  <div>
                    <label className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">Total Trips</label>
                    <p className="text-lg font-bold mt-0.5">{driver.totalTrips}</p>
                  </div>
                  <div>
                    <label className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">Incidents</label>
                    <p className="text-lg font-bold mt-0.5 text-red-600">{driver.incidents}</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* QR Credentials Card */}
          <Card className="rounded-xl border-0 ambient-shadow overflow-hidden flex flex-col">
            <CardHeader className="border-b border-border/50 pb-4">
              <CardTitle className="text-sm font-semibold flex items-center gap-2">
                <RefreshCw className="h-4 w-4 text-primary" />
                Driver QR Credentials
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6 flex-1 flex flex-col items-center justify-between space-y-6">
              <div className="p-3 bg-slate-50 border border-slate-200/50 rounded-2xl shadow-inner flex items-center justify-center relative">
                <QRCodeCanvas
                  id="driver-qr-canvas"
                  ref={qrRef}
                  value={qrValue}
                  size={190}
                  level="H"
                  includeMargin={true}
                />
              </div>

              <div className="w-full space-y-2">
                <div className="flex gap-2">
                  <Button onClick={handleDownloadQR} className="flex-1 gap-1 text-xs h-9 rounded-lg" variant="outline">
                    <Download className="h-3.5 w-3.5" /> Download QR
                  </Button>
                  <Button onClick={handlePrintQR} className="flex-1 gap-1 text-xs h-9 rounded-lg" variant="outline">
                    <Printer className="h-3.5 w-3.5" /> Print QR
                  </Button>
                </div>

                <Button
                  onClick={handleRegenerateQR}
                  disabled={regenerating}
                  className="w-full gap-1 text-xs h-9 rounded-lg border-primary/20 hover:border-primary text-primary hover:bg-primary/5"
                  variant="outline"
                >
                  <RefreshCw className={`h-3.5 w-3.5 ${regenerating ? "animate-spin" : ""}`} />
                  Regenerate QR (Admin Only)
                </Button>

                <Button
                  onClick={handleCopyId}
                  className="w-full gap-1 text-xs h-9 rounded-lg text-muted-foreground hover:text-foreground"
                  variant="ghost"
                >
                  <Copy className="h-3.5 w-3.5" />
                  {copied ? "Copied!" : "Copy Driver ID"}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  );
}
