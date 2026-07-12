"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { QRCodeCanvas } from "qrcode.react";
import { Header, StatusBadge } from "@/components/shared";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  QrCode,
  Download,
  Printer,
  Search,
  CheckCircle,
  ShieldCheck,
  FileCode,
  Eye,
} from "lucide-react";
import {
  createDriverQRPayload,
  generateDriverQR,
  getDispatchHistory,
  getDriverQRs,
  getDrivers,
  type Driver,
} from "@/lib/storage";

export default function QrManagementPage() {
  const [activeTab, setActiveTab] = useState<"driver" | "dispatch">("driver");
  // Tab 1: Driver QR states
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [driverQRs, setDriverQRs] = useState<Record<string, string>>({});
  const [selectedDriver, setSelectedDriver] = useState<Driver | null>(null);
  const [driverSearch, setDriverSearch] = useState("");

  // Tab 2: Dispatch QR states
  const [dispatches, setDispatches] = useState<any[]>([]);
  const [selectedDispatch, setSelectedDispatch] = useState<any | null>(null);
  const [dispatchSearch, setDispatchSearch] = useState("");

  // Load initial data
  useEffect(() => {
    const driversList = getDrivers();
    const dispatchesList = getDispatchHistory();

    setDrivers(driversList);
    setDriverQRs(getDriverQRs());
    setDispatches(dispatchesList);
  }, []);

  const handleGenerateQR = (driver: Driver) => {
    generateDriverQR(driver);
    setDriverQRs(getDriverQRs());
    setSelectedDriver(driver);
  };

  const downloadDriverQR = (driver: Driver) => {
    const canvas = (document.getElementById(`driver-qr-download-${driver.id}`) || document.getElementById(`driver-qr-${driver.id}`)) as HTMLCanvasElement | null;
    if (!canvas) return;

    const link = document.createElement("a");
    link.download = `${driver.id}-permanent-qr.png`;
    link.href = canvas.toDataURL("image/png");
    link.click();
  };

  const printDriverQR = (driver: Driver) => {
    const canvas = (document.getElementById(`driver-qr-download-${driver.id}`) || document.getElementById(`driver-qr-${driver.id}`)) as HTMLCanvasElement | null;
    const printWindow = window.open("", "_blank", "width=500,height=650");
    if (!canvas || !printWindow) return;

    printWindow.document.write(`
      <html><head><title>${driver.id} Permanent QR</title></head>
      <body style="font-family:Arial,sans-serif;text-align:center;padding:40px">
        <h2>ROADKINGS Badge</h2><p>Permanent Driver Pass</p>
        <img src="${canvas.toDataURL("image/png")}" width="240" height="240" alt="Driver QR code" />
        <h3>${driver.name}</h3><p>${driver.id}</p>
      </body></html>
    `);
    printWindow.document.close();
    printWindow.focus();
    printWindow.print();
    printWindow.close();
  };

  const handlePrint = () => {
    window.print();
  };

  // Filter lists
  const filteredDrivers = drivers.filter(
    (d) =>
      d.name.toLowerCase().includes(driverSearch.toLowerCase()) ||
      d.id.toLowerCase().includes(driverSearch.toLowerCase()) ||
      d.license.toLowerCase().includes(driverSearch.toLowerCase())
  );

  const filteredDispatches = dispatches.filter(
    (d) =>
      d.dispatchId.toLowerCase().includes(dispatchSearch.toLowerCase()) ||
      d.driverName.toLowerCase().includes(dispatchSearch.toLowerCase()) ||
      d.vehicleRegistration.toLowerCase().includes(dispatchSearch.toLowerCase())
  );

  return (
    <>
      <Header title="QR Management" subtitle="Manage and issue secure driver permanent passes and dispatch trip QR challans" />
      
      <div className="p-6 space-y-6">
        
        {/* Navigation Tabs */}
        <div className="flex border-b border-border">
          <button
            onClick={() => setActiveTab("driver")}
            className={`px-6 py-3 text-sm font-bold border-b-2 transition-all duration-150 ${
              activeTab === "driver"
                ? "border-orange-500 text-orange-600 font-bold"
                : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
          >
            Driver QR (Permanent Pass)
          </button>
          <button
            onClick={() => setActiveTab("dispatch")}
            className={`px-6 py-3 text-sm font-bold border-b-2 transition-all duration-150 ${
              activeTab === "dispatch"
                ? "border-orange-500 text-orange-600 font-bold"
                : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
          >
            Dispatch QR (Trip Challan)
          </button>
        </div>

        {/* Tab 1: Driver QR */}
        {activeTab === "driver" && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* Drivers Table Panel */}
            <Card className="lg:col-span-2 rounded-xl border border-border bg-white shadow-sm ring-0">
              <CardHeader className="pb-3 space-y-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm font-bold flex items-center gap-2 text-foreground">
                    <QrCode className="h-4 w-4 text-orange-500" />
                    Driver Directory permanent passes
                  </CardTitle>
                </div>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <input
                    type="text"
                    placeholder="Search drivers by name, ID or license..."
                    value={driverSearch}
                    onChange={(e) => setDriverSearch(e.target.value)}
                    className="w-full h-9 pl-9 pr-4 rounded-lg border border-border bg-slate-50 text-sm focus:bg-white outline-none transition-colors focus:border-orange-500/80"
                  />
                </div>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="border-b border-border text-muted-foreground text-xs font-semibold">
                        <th className="pb-3 pt-1">Driver</th>
                        <th className="pb-3 pt-1">License</th>
                        <th className="pb-3 pt-1">QR Status</th>
                        <th className="pb-3 pt-1 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                      {filteredDrivers.map((drv) => {
                        const hasQR = !!driverQRs[drv.id];
                        return (
                          <tr key={drv.id} className="text-sm hover:bg-slate-50/50">
                            <td className="py-3.5">
                              <div className="flex items-center gap-3">
                                <div className="h-9 w-9 rounded-full bg-slate-100 flex-shrink-0 flex items-center justify-center border overflow-hidden">
                                  {drv.photoUrl ? (
                                    <Image
                                      src={drv.photoUrl}
                                      alt={drv.name}
                                      width={36}
                                      height={36}
                                      unoptimized
                                      className="h-full w-full object-cover"
                                    />
                                  ) : (
                                    <span className="font-bold text-xs text-slate-500">{drv.name.charAt(0)}</span>
                                  )}
                                </div>
                                <div className="flex flex-col">
                                  <span className="font-bold text-slate-800">{drv.name}</span>
                                  <span className="text-xs text-muted-foreground">ID: {drv.id}</span>
                                </div>
                                {hasQR && (
                                  <QRCodeCanvas
                                    id={`driver-qr-download-${drv.id}`}
                                    value={driverQRs[drv.id]}
                                    size={240}
                                    className="hidden"
                                  />
                                )}
                              </div>
                            </td>
                            <td className="py-3.5 text-muted-foreground font-medium">{drv.license}</td>
                            <td className="py-3.5">
                              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                                hasQR 
                                  ? "bg-emerald-50 text-emerald-600 border-emerald-200" 
                                  : "bg-red-50 text-red-600 border-red-200"
                              }`}>
                                {hasQR ? "Active" : "Missing"}
                              </span>
                            </td>
                            <td className="py-3.5 text-right space-x-1 whitespace-nowrap">
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => setSelectedDriver(drv)}
                                className="h-8 px-2 text-xs font-semibold"
                              >
                                <Eye className="h-3 w-3 mr-1" /> View
                              </Button>
                              {hasQR ? (
                                <>
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => downloadDriverQR(drv)}
                                    className="h-8 px-2 text-xs font-semibold"
                                  >
                                    <Download className="h-3 w-3 mr-1" /> Download
                                  </Button>
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => printDriverQR(drv)}
                                    className="h-8 px-2 text-xs font-semibold"
                                  >
                                    <Printer className="h-3 w-3 mr-1" /> Print
                                  </Button>
                                </>
                              ) : (
                                <Button
                                  size="sm"
                                  onClick={() => handleGenerateQR(drv)}
                                  className="h-8 px-2 text-xs font-semibold bg-slate-100 hover:bg-slate-200 text-slate-800"
                                >
                                  <QrCode className="h-3 w-3 mr-1" /> Generate QR
                                </Button>
                              )}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>

            {/* QR Card Preview */}
            <Card className="rounded-xl border border-border bg-white shadow-sm ring-0">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-bold text-foreground">Driver Pass Details</CardTitle>
              </CardHeader>
              <CardContent className="flex flex-col items-center justify-center py-6 text-center">
                {selectedDriver ? (
                  <div className="w-full flex flex-col items-center space-y-6">
                    {/* Premium ID Card styling */}
                    <div className="border border-slate-200 rounded-2xl p-5 bg-gradient-to-br from-slate-50 to-white shadow-md w-full max-w-[260px] flex flex-col items-center relative overflow-hidden">
                      <div className="absolute top-0 inset-x-0 h-1.5 bg-orange-500" />
                      
                      <h3 className="font-bold text-sm text-slate-800 tracking-tight">ROADKINGS Badge</h3>
                      <p className="text-[9px] text-orange-500 font-bold uppercase tracking-wider">Permanent Pass</p>

                      <div className="w-40 h-40 bg-white border border-slate-200 rounded-xl p-3 my-4 flex items-center justify-center relative">
                        <QRCodeCanvas
                          id={`driver-qr-${selectedDriver.id}`}
                          value={driverQRs[selectedDriver.id] || createDriverQRPayload(selectedDriver)}
                          size={136}
                          level="M"
                          includeMargin
                        />
                      </div>

                      <div className="space-y-0.5">
                        <h4 className="font-bold text-sm text-foreground">{selectedDriver.name}</h4>
                        <p className="text-xs text-muted-foreground">{selectedDriver.id}</p>
                        <p className="text-[10px] text-slate-400 mt-1">{selectedDriver.licenseCategory || "HMV License"}</p>
                      </div>
                    </div>

                    <div className="flex gap-2 w-full max-w-[260px]">
                      <Button onClick={() => printDriverQR(selectedDriver)} variant="outline" className="flex-1 text-xs font-semibold h-9 rounded-lg">
                        <Printer className="h-3.5 w-3.5 mr-1" /> Print
                      </Button>
                      <Button onClick={() => downloadDriverQR(selectedDriver)} className="flex-1 text-xs font-bold h-9 rounded-lg bg-orange-500 hover:bg-orange-600 text-white">
                        <Download className="h-3.5 w-3.5 mr-1" /> Download
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="py-20 text-muted-foreground flex flex-col items-center">
                    <ShieldCheck className="h-12 w-12 text-slate-300 stroke-1 mb-2" />
                    <p className="text-sm font-medium">Select a driver</p>
                    <p className="text-xs mt-1">Select to preview, print or download the permanent pass QR.</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        )}

        {/* Tab 2: Dispatch QR */}
        {activeTab === "dispatch" && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* Dispatches Table Panel */}
            <Card className="lg:col-span-2 rounded-xl border border-border bg-white shadow-sm ring-0">
              <CardHeader className="pb-3 space-y-3">
                <CardTitle className="text-sm font-bold flex items-center gap-2 text-foreground">
                  <FileCode className="h-4 w-4 text-orange-500" />
                  Generated Dispatch QR Challans
                </CardTitle>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <input
                    type="text"
                    placeholder="Search dispatches..."
                    value={dispatchSearch}
                    onChange={(e) => setDispatchSearch(e.target.value)}
                    className="w-full h-9 pl-9 pr-4 rounded-lg border border-border bg-slate-50 text-sm focus:bg-white outline-none transition-colors focus:border-orange-500/80"
                  />
                </div>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="border-b border-border text-muted-foreground text-xs font-semibold">
                        <th className="pb-3 pt-1">Dispatch ID</th>
                        <th className="pb-3 pt-1">Driver & Vehicle</th>
                        <th className="pb-3 pt-1">Route</th>
                        <th className="pb-3 pt-1">Created Time</th>
                        <th className="pb-3 pt-1">Status</th>
                        <th className="pb-3 pt-1 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                      {filteredDispatches.map((disp) => (
                        <tr key={disp.dispatchId} className="text-sm hover:bg-slate-50/50">
                          <td className="py-3.5 font-semibold text-slate-800">{disp.dispatchId}</td>
                          <td className="py-3.5">
                            <div className="flex flex-col">
                              <span className="font-medium text-slate-800">{disp.driverName}</span>
                              <span className="text-xs text-muted-foreground">{disp.vehicleRegistration}</span>
                            </div>
                          </td>
                          <td className="py-3.5 text-slate-600 font-medium">
                            {disp.source} &rarr; {disp.destination}
                          </td>
                          <td className="py-3.5 text-xs text-muted-foreground">
                            {disp.dispatchDate} <br /> {disp.dispatchTime}
                          </td>
                          <td className="py-3.5">
                            <StatusBadge variant={disp.tripStatus} />
                          </td>
                          <td className="py-3.5 text-right">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => setSelectedDispatch(disp)}
                              className="h-8 px-3 text-xs font-semibold"
                            >
                              <Eye className="h-3 w-3 mr-1" /> View
                            </Button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>

            {/* Dispatch QR Challan Preview Card */}
            <Card className="rounded-xl border border-border bg-white shadow-sm ring-0">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-bold text-foreground">Challan Card Preview</CardTitle>
              </CardHeader>
              <CardContent className="flex flex-col items-center justify-center py-6 text-center">
                {selectedDispatch ? (
                  <div className="w-full flex flex-col items-center space-y-6">
                    {/* Challan Card layout */}
                    <div className="border border-slate-200 rounded-2xl p-5 bg-gradient-to-br from-slate-50 to-white shadow-md w-full max-w-[260px] flex flex-col items-center relative overflow-hidden">
                      <div className="absolute top-0 inset-x-0 h-1.5 bg-orange-500" />
                      
                      <h3 className="font-bold text-sm text-slate-800 tracking-tight">ROADKINGS Challan</h3>
                      <p className="text-[9px] text-orange-500 font-bold uppercase tracking-wider">{selectedDispatch.dispatchId}</p>

                      <div className="w-40 h-40 bg-white border border-slate-200 rounded-xl p-3 my-4 flex items-center justify-center relative">
                        <div className="w-full h-full bg-[radial-gradient(#000_15%,transparent_15%)] [background-size:8px_8px] opacity-75" />
                        <div className="absolute inset-0 flex items-center justify-center">
                          <div className="bg-white p-2 rounded-lg shadow-md border border-slate-100">
                            <QrCode className="h-8 w-8 text-orange-500" />
                          </div>
                        </div>
                      </div>

                      <div className="space-y-1 text-left w-full text-xs">
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Driver:</span>
                          <span className="font-bold text-slate-800">{selectedDispatch.driverName}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Vehicle:</span>
                          <span className="font-semibold text-slate-800">{selectedDispatch.vehicleRegistration}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Route:</span>
                          <span className="font-medium text-slate-800 truncate max-w-[120px]">{selectedDispatch.source} &rarr; {selectedDispatch.destination}</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex gap-2 w-full max-w-[260px]">
                      <Button onClick={handlePrint} variant="outline" className="flex-1 text-xs font-semibold h-9 rounded-lg">
                        <Printer className="h-3.5 w-3.5 mr-1" /> Print
                      </Button>
                      <Button className="flex-1 text-xs font-bold h-9 rounded-lg bg-orange-500 hover:bg-orange-600 text-white">
                        <Download className="h-3.5 w-3.5 mr-1" /> Download
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="py-20 text-muted-foreground flex flex-col items-center">
                    <ShieldCheck className="h-12 w-12 text-slate-300 stroke-1 mb-2" />
                    <p className="text-sm font-medium">Select a dispatch challan</p>
                    <p className="text-xs mt-1">Select to preview, print or download the dispatch trip QR code.</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        )}

      </div>
    </>
  );
}
