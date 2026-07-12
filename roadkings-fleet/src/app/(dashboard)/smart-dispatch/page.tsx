"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { useForm } from "react-hook-form";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { Header, StatusBadge } from "@/components/shared";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { StatusVariant } from "@/lib/status-colors";
import {
  QrCode,
  Upload,
  Camera,
  Search,
  CheckCircle,
  AlertCircle,
  Truck,
  User,
  MapPin,
  Printer,
  Download,
  FileText,
  Play,
  RotateCcw,
  ShieldCheck,
  TrendingUp,
  XCircle,
  Star,
} from "lucide-react";
import { QRCodeCanvas } from "qrcode.react";
import { Html5QrcodeScanner, Html5Qrcode } from "html5-qrcode";
import { useDrivers } from "@/hooks/useDrivers";
import { useVehicles } from "@/hooks/useVehicles";
import { useDispatches, useCreateDispatch, useCompleteDispatch, useCancelDispatch } from "@/hooks/useDispatches";
import { useLogQRScan } from "@/hooks/useQR";

interface DispatchFormData {
  tripId: string;
  vehicleId: string;
  source: string;
  destination: string;
  cargoDescription: string;
  cargoWeight: string;
  distance: string;
  expectedDelivery: string;
  estimatedRevenue: string;
  dispatcher: string;
  warehouse: string;
  remarks: string;
}

export default function SmartDispatchPage() {
  const [activeTab, setActiveTab] = useState("smart-dispatch");
  const { data: driversData } = useDrivers({ limit: 100 });
  const { data: vehiclesData } = useVehicles({ limit: 100 });
  const { data: dispatchesData } = useDispatches({ limit: 100 });

  const createDispatch = useCreateDispatch();
  const completeDispatch = useCompleteDispatch();
  const cancelDispatch = useCancelDispatch();
  const logScan = useLogQRScan();

  const drivers = driversData?.items || [];
  const vehicles = vehiclesData?.items || [];
  const dispatchHistory = dispatchesData?.items || [];

  // Scanning State
  const [scannedDriver, setScannedDriver] = useState<any | null>(null);
  const [scanError, setScanError] = useState<string | null>(null);
  const [scanSuccess, setScanSuccess] = useState(false);
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [scannerMsg, setScannerMsg] = useState("");
  const [driverConfirmed, setDriverConfirmed] = useState(false);

  // Dispatch Mode
  const [warehouseMode, setWarehouseMode] = useState(false);

  // Modals
  const [showPassModal, setShowPassModal] = useState(false);
  const [currentPass, setCurrentPass] = useState<any | null>(null);
  const [showCompleteModal, setShowCompleteModal] = useState(false);
  const [completeDispatchId, setCompleteDispatchId] = useState<string | null>(null);

  // Summary Confirmation Dialog
  const [showSummaryModal, setShowSummaryModal] = useState(false);
  const [pendingDispatchData, setPendingDispatchData] = useState<DispatchFormData | null>(null);

  // History filtering & search
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  // Form
  const {
    register,
    handleSubmit,
    setValue,
    reset,
    watch,
    formState: { errors },
  } = useForm<DispatchFormData>();

  const selectedVehicleId = watch("vehicleId");
  const cargoWeight = watch("cargoWeight");

  const [validationErrors, setValidationErrors] = useState<string[]>([]);
  const handleQRDecodedRef = useRef<(decodedText: string) => void>(() => undefined);

  // Sound effect synthesizer (Offline-capable Web Audio API)
  const playBeep = (freq = 880, duration = 0.15) => {
    try {
      const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "sine";
      osc.frequency.setValueAtTime(freq, ctx.currentTime);
      osc.connect(gain);
      gain.connect(ctx.destination);
      gain.gain.setValueAtTime(0.08, ctx.currentTime);
      osc.start();
      osc.stop(ctx.currentTime + duration);
    } catch (e) {
      console.warn("AudioContext block", e);
    }
  };

  const [checkingAuth, setCheckingAuth] = useState(true);

  // Removed legacy loadData

  useEffect(() => {
    async function checkRole() {
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
        // loadData is handled by hooks
        setCheckingAuth(false);
      } catch {
        window.location.href = "/unauthorized";
      }
    }
    checkRole();
  }, []);

  // HTML5 QR Scanner Effect
  useEffect(() => {
    let scanner: Html5QrcodeScanner | null = null;
    if (!checkingAuth && isCameraActive) {
      scanner = new Html5QrcodeScanner(
        "camera-reader",
        { fps: 10, qrbox: { width: 200, height: 200 } },
        false
      );
      scanner.render(
        (text) => {
          handleQRDecodedRef.current(text);
          setIsCameraActive(false);
          try {
            scanner?.clear();
          } catch (e) {
            console.warn(e);
          }
        },
        () => {
          // Silent callback
        }
      );
    }
    return () => {
      if (scanner) {
        try {
          scanner.clear();
        } catch (e) {
          console.warn(e);
        }
      }
    };
  }, [checkingAuth, isCameraActive]);

  if (checkingAuth) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center font-sans">
        <div className="text-center space-y-3">
          <div className="h-10 w-10 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-sm text-muted-foreground font-medium">Authenticating & Verifying Role...</p>
        </div>
      </div>
    );
  }

  // Main QR Code Process
  const handleQRDecoded = (decodedText: string) => {
    try {
      const payload = JSON.parse(decodedText);
      const dId = payload.driverId;
      if (dId) {
        processDriverVerification(dId);
      } else {
        throw new Error("Invalid payload: missing driverId");
      }
    } catch {
      // Fallback: try raw ID
      processDriverVerification(decodedText.trim());
    }
  };

  handleQRDecodedRef.current = handleQRDecoded;

  // Driver verification logic
  const processDriverVerification = (id: string) => {
    setScanError(null);
    setScanSuccess(false);
    setScannedDriver(null);
    setValidationErrors([]);

    const found = drivers.find((d) => d.id === id || d.name.toLowerCase() === id.toLowerCase());
    if (!found) {
      playBeep(330, 0.3); // Low buzzer error sound
      setScanError("Driver ID not recognized in database.");
      logScan.mutate({ driverId: id, driverName: "Unknown", success: false, message: "Driver ID not recognized" });
      return;
    }

    // Play high pitch success beep
    playBeep(880, 0.15);
    setScannedDriver(found);
    setScanSuccess(true);
    logScan.mutate({ driverId: found.id, driverName: found.name, success: true, message: "Driver verified successfully" });

    // Automatically check verification constraints
    const errorsList: string[] = [];

    // Rule 1: License expiry
    if (found.licenseExpiry) {
      const expiry = new Date(found.licenseExpiry);
      if (expiry < new Date()) {
        errorsList.push(`Driver's license expired on ${found.licenseExpiry}.`);
      }
    }

    // Rule 2: Suspended status
    if (found.status === "suspended") {
      errorsList.push("Driver is currently suspended due to safety rating/incidents.");
    }

    // Rule 3: Already on trip
    if (found.status === "on_trip") {
      errorsList.push("Driver is already dispatched on another active trip.");
    }

    setValidationErrors(errorsList);

    // Auto fill form with sensible defaults
    setValue("tripId", `TRP-${1025 + dispatchHistory.length}`);
    setValue("dispatcher", "Fleet Manager");
    setValue("warehouse", "Mumbai Central Warehouse");
    
    if (warehouseMode) {
      // Prefills in Warehouse mode for fast 30s dispatches
      setValue("source", "Mumbai Central Whse");
      setValue("destination", "Pune logistics depot");
      setValue("cargoDescription", "General Cargo");
      setValue("cargoWeight", "5000");
      setValue("distance", "148 km");
      setValue("expectedDelivery", "3 hours");
      setValue("estimatedRevenue", "₹18,500");
      setValue("remarks", "Warehouse Dispatch");
    } else {
      reset({
        tripId: `TRP-${1025 + dispatchHistory.length}`,
        dispatcher: "Fleet Manager",
        warehouse: "Mumbai Central Warehouse",
        source: "",
        destination: "",
        cargoDescription: "",
        cargoWeight: "",
        distance: "",
        expectedDelivery: "",
        estimatedRevenue: "",
        remarks: "",
      });
    }
  };

  // Image upload scan fallback
  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setScannerMsg("Scanning image file...");
    const html5QrCode = new Html5Qrcode("upload-temp-reader");
    try {
      const decodedText = await html5QrCode.scanFile(file, true);
      handleQRDecoded(decodedText);
      setScannerMsg("Successfully scanned QR code.");
    } catch {
      playBeep(330, 0.3);
      setScanError("Failed to decode QR code from the image file.");
    } finally {
      try {
        html5QrCode.clear();
      } catch (e) {
        console.warn(e);
      }
    }
  };

  // Form Submit (opens Summary Dialog first)
  const onSubmitDispatch = (data: DispatchFormData) => {
    if (!scannedDriver) return;

    // Additional validations
    const finalErrors = [...validationErrors];
    const selectedVehicle = vehicles.find((v) => v.id === data.vehicleId);

    if (!selectedVehicle || selectedVehicle.status !== "available") {
      finalErrors.push("Please select a valid assigned vehicle.");
    } else {
      // Check weight capacity
      const weight = parseFloat(data.cargoWeight);
      const capacity = selectedVehicle.capacityKg || 12000;
      if (!Number.isFinite(weight) || weight <= 0) {
        finalErrors.push("Cargo weight must be greater than zero.");
      }
      if (weight > capacity) {
        finalErrors.push(`Cargo weight (${weight} kg) exceeds vehicle load capacity (${capacity} kg).`);
      }
    }

    if (finalErrors.length > 0) {
      setValidationErrors(finalErrors);
      playBeep(330, 0.3);
      return;
    }

    if (!selectedVehicle) return;

    // Show Summary Confirmation Dialog instead of dispatching immediately
    setPendingDispatchData(data);
    setShowSummaryModal(true);
  };

  // Confirm dispatch from Summary Dialog
  const handleConfirmDispatch = async () => {
    if (!scannedDriver || !pendingDispatchData) return;
    const data = pendingDispatchData;
    const selectedVehicle = vehicles.find((v) => v.id === data.vehicleId);
    if (!selectedVehicle) return;

    try {
      const fullRecord = await createDispatch.mutateAsync({
        tripId: data.tripId,
        driverId: scannedDriver.id,
        driverName: scannedDriver.name,
        vehicleId: selectedVehicle.id,
        vehicleRegistration: selectedVehicle.number,
        vehicleName: selectedVehicle.make,
        source: data.source,
        destination: data.destination,
        cargoDescription: data.cargoDescription,
        cargoWeight: data.cargoWeight,
        dispatcher: data.dispatcher,
        expectedDelivery: data.expectedDelivery,
        distance: data.distance,
        estimatedRevenue: data.estimatedRevenue,
        remarks: data.remarks,
      });
      
      playBeep(1200, 0.25);
      setShowSummaryModal(false);
      setPendingDispatchData(null);
      setCurrentPass(fullRecord as any);
      setShowPassModal(true);
  
      // Reset Scanner & Form
      setScannedDriver(null);
      setScanSuccess(false);
      setDriverConfirmed(false);
    } catch (error: any) {
      setValidationErrors([error.message || "Unable to create dispatch."]);
      setShowSummaryModal(false);
      setPendingDispatchData(null);
      playBeep(330, 0.3);
      return;
    }
  };

  // Complete Trip process
  const handleOpenComplete = (dispatchId: string) => {
    setCompleteDispatchId(dispatchId);
    setShowCompleteModal(true);
  };

  const handleConfirmComplete = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!completeDispatchId) return;

    const data = new FormData(e.currentTarget);
    const odometer = data.get("odometer") as string;
    const fuel = data.get("fuel") as string;
    const notes = data.get("notes") as string;

    await completeDispatch.mutateAsync({
      id: completeDispatchId,
      data: {
        odometer,
        fuel,
        notes,
      },
    });
    playBeep(880, 0.15);
    setShowCompleteModal(false);
  };

  const handleCancelTrip = async (dispatchId: string) => {
    if (confirm("Are you sure you want to cancel this trip dispatch?")) {
      await cancelDispatch.mutateAsync(dispatchId);
      playBeep(440, 0.2);
    }
  };

  // Print Pass
  const handlePrintPass = (record: any) => {
    const qrCanvas = document.getElementById(`pass-qr-${record.dispatchId}`) as HTMLCanvasElement;
    const qrUrl = qrCanvas?.toDataURL("image/png") || "";

    const printWindow = window.open("", "_blank");
    if (!printWindow) return;

    printWindow.document.write(`
      <html>
        <head>
          <title>Logistics Dispatch Challan - ${record.dispatchId}</title>
          <style>
            body { font-family: 'Inter Tight', sans-serif; padding: 40px; color: #1e293b; }
            .challan { border: 2px solid #cbd5e1; border-radius: 12px; padding: 30px; max-width: 650px; margin: auto; }
            .hdr { display: flex; justify-content: space-between; align-items: center; border-bottom: 2px solid #e2e8f0; padding-bottom: 20px; margin-bottom: 20px; }
            .logo { font-size: 24px; font-weight: bold; color: #ff6b1a; }
            .title { font-size: 14px; text-transform: uppercase; color: #64748b; text-align: right; }
            .grid { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 25px; }
            .field { margin-bottom: 12px; }
            .label { font-size: 11px; text-transform: uppercase; color: #64748b; font-weight: 600; }
            .value { font-size: 14px; font-weight: bold; margin-top: 2px; }
            .qr-sec { text-align: center; border-top: 1px dashed #cbd5e1; padding-top: 20px; margin-top: 20px; display: flex; justify-content: space-between; align-items: center; }
            .qr-img { width: 140px; height: 140px; }
            .footer { text-align: center; font-size: 10px; color: #94a3b8; margin-top: 30px; }
          </style>
        </head>
        <body onload="window.print(); window.close();">
          <div class="challan">
            <div class="hdr">
              <div class="logo">RoadKing</div>
              <div class="title">Official Transport Challan Pass<br/><span style="font-size:16px; font-weight:bold; color:#1e293b;">${record.dispatchId}</span></div>
            </div>
            <div class="grid">
              <div>
                <div class="field">
                  <div class="label">Assigned Driver</div>
                  <div class="value">${record.driverName} (${record.driverId})</div>
                </div>
                <div class="field">
                  <div class="label">Assigned Vehicle</div>
                  <div class="value">${record.vehicleName} [${record.vehicleRegistration}]</div>
                </div>
                <div class="field">
                  <div class="label">Source</div>
                  <div class="value">${record.source}</div>
                </div>
                <div class="field">
                  <div class="label">Destination</div>
                  <div class="value">${record.destination}</div>
                </div>
              </div>
              <div>
                <div class="field">
                  <div class="label">Cargo Description</div>
                  <div class="value">${record.cargoDescription}</div>
                </div>
                <div class="field">
                  <div class="label">Cargo Weight</div>
                  <div class="value">${record.cargoWeight} kg</div>
                </div>
                <div class="field">
                  <div class="label">Dispatch Date & Time</div>
                  <div class="value">${record.dispatchDate} ${record.dispatchTime}</div>
                </div>
                <div class="field">
                  <div class="label">Dispatcher</div>
                  <div class="value">${record.dispatcher}</div>
                </div>
              </div>
            </div>
            <div class="qr-sec">
              <div style="text-align: left;">
                <div class="label">Security Verification</div>
                <p style="font-size:12px; max-width:350px; color:#475569; margin: 4px 0 0 0;">Scan this Dispatch Pass QR code at security checkposts or destination terminal to verify trip integrity and status.</p>
              </div>
              <img class="qr-img" src="${qrUrl}" />
            </div>
            <div class="footer">
              RoadKing Logistics Fleet Management System · Automated QR Dispatch Slip
            </div>
          </div>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  // Download QR
  const downloadDispatchQR = (record: any) => {
    const canvas = document.getElementById(`pass-qr-${record.dispatchId}`) as HTMLCanvasElement;
    if (!canvas) return;
    const url = canvas.toDataURL("image/png");
    const link = document.createElement("a");
    link.download = `dispatch-${record.dispatchId}-qr.png`;
    link.href = url;
    link.click();
  };

  // Filters
  const filteredHistory = dispatchHistory.filter((item) => {
    const matchesSearch =
      item.dispatchId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.driverName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.vehicleRegistration.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "all" || item.tripStatus === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <>
      <Header title="Smart Dispatch Center" subtitle="Automated QR Code Dispatch & Verification Slip Creator" />
      <div className="p-6">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid grid-cols-2 max-w-sm rounded-xl p-1 bg-muted/60">
            <TabsTrigger value="smart-dispatch" className="rounded-lg text-sm font-semibold">
              Smart Dispatch
            </TabsTrigger>
            <TabsTrigger value="history" className="rounded-lg text-sm font-semibold">
              Dispatch History
            </TabsTrigger>
          </TabsList>

          {/* TAB 1: SMART DISPATCH SCANNER & FORM */}
          <TabsContent value="smart-dispatch" className="space-y-6 outline-none">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Button
                  onClick={() => setWarehouseMode(!warehouseMode)}
                  variant={warehouseMode ? "default" : "outline"}
                  size="sm"
                  className={`rounded-xl text-xs gap-1.5 h-9 transition-all duration-300 ${
                    warehouseMode ? "bg-orange-500 hover:bg-orange-500/90 text-white shadow-md shadow-orange-500/20 border-0" : "bg-white"
                  }`}
                >
                  <TrendingUp className="h-4 w-4" />
                  Quick Warehouse Mode: {warehouseMode ? "Active" : "Inactive"}
                </Button>
                <span className="text-xs text-muted-foreground">
                  {warehouseMode ? "Auto-fills standard routes for dispatch under 30 seconds." : "Allows custom routing & dispatch details."}
                </span>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Left Column: QR Scanner */}
              <Card className="rounded-xl border-0 ring-0 ambient-shadow overflow-hidden flex flex-col justify-between">
                <CardHeader className="border-b border-border/50 pb-4">
                  <CardTitle className="text-sm font-bold flex items-center gap-2">
                    <QrCode className="h-4.5 w-4.5 text-primary" />
                    1. Scan Driver QR Code
                  </CardTitle>
                  <CardDescription className="text-xs">
                    Authorize drivers using webcam, image, or ID.
                  </CardDescription>
                </CardHeader>
                <CardContent className="p-6 space-y-4 flex-1 flex flex-col justify-between">
                  {/* Camera view container */}
                  {isCameraActive ? (
                    <div className="relative border-2 border-primary/30 rounded-2xl overflow-hidden aspect-square bg-black shadow-inner flex flex-col justify-center">
                      <div id="camera-reader" className="w-full h-full" />
                      {/* Scanning Line overlay */}
                      <div className="absolute left-0 right-0 h-1 bg-primary/80 top-0 shadow-md shadow-primary animate-[scan-line_3s_linear_infinite]" />
                      <Button
                        onClick={() => setIsCameraActive(false)}
                        variant="destructive"
                        size="sm"
                        className="absolute bottom-4 left-1/2 -translate-x-1/2 rounded-lg text-xs"
                      >
                        Cancel Camera
                      </Button>
                    </div>
                  ) : (
                    <div className="border-2 border-dashed border-border rounded-2xl p-6 flex flex-col items-center justify-center text-center aspect-square bg-slate-50 relative group transition-all hover:bg-slate-100/50">
                      {scanSuccess ? (
                        <motion.div
                          initial={{ scale: 0.5, opacity: 0 }}
                          animate={{ scale: 1, opacity: 1 }}
                          className="flex flex-col items-center space-y-2"
                        >
                          <div className="h-16 w-16 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600 shadow-md">
                            <CheckCircle className="h-10 w-10" />
                          </div>
                          <p className="font-bold text-emerald-800 text-sm">Scan Successful!</p>
                          <p className="text-xs text-muted-foreground">{scannedDriver?.name}</p>
                          <Button
                            onClick={() => {
                              setScanSuccess(false);
                              setScannedDriver(null);
                              setDriverConfirmed(false);
                            }}
                            variant="outline"
                            size="sm"
                            className="mt-2 text-xs rounded-lg gap-1 border-emerald-200 hover:bg-emerald-50 text-emerald-800"
                          >
                            <RotateCcw className="h-3.5 w-3.5" /> Scan Again
                          </Button>
                        </motion.div>
                      ) : (
                        <div className="space-y-4">
                          <div className="h-14 w-14 rounded-full bg-primary/10 flex items-center justify-center text-primary mx-auto group-hover:scale-110 transition-all">
                            <Camera className="h-7 w-7" />
                          </div>
                          <div>
                            <p className="text-sm font-semibold">Start Scanning</p>
                            <p className="text-xs text-muted-foreground mt-1 max-w-[200px]">
                              Point your camera at a driver&apos;s permanent QR card.
                            </p>
                          </div>
                          <Button
                            onClick={() => {
                              setScanError(null);
                              setIsCameraActive(true);
                            }}
                            className="rounded-xl text-xs gap-1.5 bg-primary hover:bg-primary/90 text-white"
                            size="sm"
                          >
                            <Play className="h-3.5 w-3.5" /> Start Camera Scan
                          </Button>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Upload and Manual Entry Options */}
                  <div className="space-y-3 pt-4 border-t border-border/50">
                    <div className="grid grid-cols-2 gap-2">
                      {/* Upload button wrapper */}
                      <Label
                        htmlFor="qr-file"
                        className="flex items-center justify-center gap-1.5 h-9 rounded-lg border border-border bg-white hover:bg-slate-50 cursor-pointer text-xs font-semibold text-muted-foreground hover:text-foreground shadow-sm transition-all"
                      >
                        <Upload className="h-3.5 w-3.5" /> Upload File
                      </Label>
                      <input
                        id="qr-file"
                        type="file"
                        accept="image/*"
                        onChange={handleImageUpload}
                        className="hidden"
                      />
                      <div id="upload-temp-reader" className="hidden" />

                      <Button
                        onClick={() => {
                          const inputVal = prompt("Enter Driver ID manually (e.g. DRV-001):");
                          if (inputVal) {
                            processDriverVerification(inputVal.trim());
                          }
                        }}
                        variant="outline"
                        className="gap-1.5 h-9 text-xs rounded-lg"
                      >
                        <User className="h-3.5 w-3.5" /> Enter ID
                      </Button>
                    </div>

                    {scanError && (
                      <div className="bg-red-50 border border-red-200 text-red-800 rounded-xl px-3.5 py-2 text-xs flex items-start gap-2 animate-fadeIn">
                        <AlertCircle className="h-4 w-4 text-red-600 flex-shrink-0 mt-0.5" />
                        <span>{scanError}</span>
                      </div>
                    )}
                    {scannerMsg && !scanError && (
                      <p className="text-[10px] text-muted-foreground text-center">{scannerMsg}</p>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Right Column: Driver Verification details */}
              <Card className="lg:col-span-2 rounded-xl border-0 ring-0 ambient-shadow overflow-hidden flex flex-col justify-between bg-white">
                <CardHeader className="border-b border-border/50 pb-4">
                  <CardTitle className="text-sm font-bold flex items-center gap-2">
                    <ShieldCheck className="h-4.5 w-4.5 text-primary" />
                    2. Driver Dispatch Eligibility Check
                  </CardTitle>
                  <CardDescription className="text-xs">
                    Review safety details and route validation.
                  </CardDescription>
                </CardHeader>
                <CardContent className="p-6 flex-1 flex flex-col justify-between">
                  {scannedDriver ? (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="space-y-5"
                    >
                      <div className="flex items-center gap-4 bg-slate-50 p-4 border border-slate-100 rounded-2xl">
                        <Image
                          src={scannedDriver.photoUrl || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200"}
                          alt={scannedDriver.name}
                          width={56}
                          height={56}
                          unoptimized
                          className="w-14 h-14 rounded-full object-cover border-2 border-white shadow flex-shrink-0"
                        />
                        <div className="space-y-0.5">
                          <div className="flex items-center gap-2">
                            <h3 className="font-bold text-sm text-foreground">{scannedDriver.name}</h3>
                            <StatusBadge variant={scannedDriver.status.replace("_", "-") as any} />
                          </div>
                          <p className="text-xs text-muted-foreground">ID: {scannedDriver.id} · Phone: {scannedDriver.phone}</p>
                          <div className="flex items-center gap-3 mt-1.5">
                            <span className="text-[10px] bg-amber-50 text-amber-600 font-bold px-1.5 py-0.5 rounded flex items-center gap-0.5">
                              <Star className="h-2.5 w-2.5 fill-amber-500 text-amber-500" />
                              Safety: {scannedDriver.safetyScore}
                            </span>
                            <span className="text-[10px] text-muted-foreground">
                              License Expiry: <strong className="text-slate-700">{scannedDriver.licenseExpiry}</strong>
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Validation constraint warnings */}
                      <AnimatePresence>
                        {validationErrors.length > 0 ? (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: "auto", opacity: 1 }}
                            className="bg-red-50 border border-red-200 text-red-800 rounded-2xl p-4 text-xs space-y-2.5"
                          >
                            <div className="flex items-center gap-1.5 font-bold text-red-700 text-xs">
                              <XCircle className="h-4.5 w-4.5 text-red-600" />
                              DISPATCH DENIED (Failed Verification Rules)
                            </div>
                            <ul className="list-disc pl-5 space-y-1 text-[11px] font-medium">
                              {validationErrors.map((err, i) => (
                                <li key={i}>{err}</li>
                              ))}
                            </ul>
                          </motion.div>
                        ) : (
                          <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-2xl p-4 text-xs flex items-center gap-3"
                          >
                            <CheckCircle className="h-5 w-5 text-emerald-600 flex-shrink-0" />
                            <div>
                              <p className="font-bold text-emerald-800 text-xs">VERIFICATION COMPLETE</p>
                              <p className="text-[11px] text-emerald-700 mt-0.5 font-medium">
                                Driver passes all safety and license checks. You can proceed with vehicle assignment below.
                              </p>
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>

                      {/* Confirm / Scan Again / Cancel Buttons */}
                      {!driverConfirmed && (
                        <div className="flex items-center gap-2 pt-3 border-t border-border/50">
                          <Button
                            onClick={() => setDriverConfirmed(true)}
                            disabled={validationErrors.length > 0}
                            className="rounded-xl text-xs h-9 bg-emerald-600 hover:bg-emerald-700 text-white font-bold gap-1.5 shadow-md shadow-emerald-600/20 flex-1"
                          >
                            <CheckCircle className="h-3.5 w-3.5" /> Confirm Driver
                          </Button>
                          <Button
                            onClick={() => {
                              setScannedDriver(null);
                              setScanSuccess(false);
                              setDriverConfirmed(false);
                              setValidationErrors([]);
                            }}
                            variant="outline"
                            className="rounded-xl text-xs h-9 gap-1.5"
                          >
                            <RotateCcw className="h-3.5 w-3.5" /> Scan Again
                          </Button>
                          <Button
                            onClick={() => {
                              setScannedDriver(null);
                              setScanSuccess(false);
                              setDriverConfirmed(false);
                              setValidationErrors([]);
                              setScanError(null);
                            }}
                            variant="ghost"
                            className="rounded-xl text-xs h-9 text-red-600 hover:bg-red-50 hover:text-red-700"
                          >
                            <XCircle className="h-3.5 w-3.5" /> Cancel
                          </Button>
                        </div>
                      )}

                      {driverConfirmed && (
                        <div className="bg-primary/5 border border-primary/20 rounded-xl p-3 text-xs flex items-center gap-2 text-primary font-semibold">
                          <CheckCircle className="h-4 w-4" />
                          Driver confirmed — fill the dispatch form below.
                        </div>
                      )}
                    </motion.div>
                  ) : (
                    <div className="flex flex-col items-center justify-center text-center py-10 text-muted-foreground flex-grow">
                      <ShieldCheck className="h-10 w-10 text-slate-300 stroke-[1.5] mb-2" />
                      <p className="text-sm font-semibold">Verification Queue Empty</p>
                      <p className="text-xs text-muted-foreground mt-1 max-w-[240px]">
                        Scan a driver&apos;s QR code or enter their ID to check eligibility and load the dispatch form.
                      </p>
                    </div>
                  )}

                  {/* Scan statistics footer */}
                  <div className="grid grid-cols-3 gap-2 border-t border-border/50 pt-4 mt-6 text-center text-xs text-muted-foreground bg-slate-50/50 p-2 rounded-xl">
                    <div>
                      <span className="block font-bold text-foreground text-sm">{vehicles.filter(v => v.status === "available").length}</span>
                      Avail. Vehicles
                    </div>
                    <div className="border-x border-border/50">
                      <span className="block font-bold text-foreground text-sm">{drivers.filter(d => d.status === "available").length}</span>
                      Avail. Drivers
                    </div>
                    <div>
                      <span className="block font-bold text-foreground text-sm">{dispatchHistory.length}</span>
                      Total Trips Mapped
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Bottom Form: Dispatch Cargo & Vehicle — only after driver is confirmed */}
            {scannedDriver && driverConfirmed && (
              <motion.div
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-6"
              >
                <Card className="rounded-xl border-0 ring-0 ambient-shadow overflow-hidden">
                  <CardHeader className="border-b border-border/50 pb-4 bg-slate-50/50">
                    <CardTitle className="text-sm font-bold flex items-center gap-2">
                      <Truck className="h-4.5 w-4.5 text-primary" />
                      3. Dispatch Form - Route & Cargo details
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-6">
                    <form onSubmit={handleSubmit(onSubmitDispatch)} className="space-y-6">
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                        <div className="space-y-1.5">
                          <Label className="text-xs font-bold text-slate-700">Trip ID Reference</Label>
                          <Input
                            {...register("tripId", { required: "Trip ID is required" })}
                            placeholder="e.g. TRP-1025"
                            className="h-10 rounded-xl text-xs"
                          />
                        </div>

                        <div className="space-y-1.5">
                          <Label className="text-xs font-bold text-slate-700">Assigned Vehicle (Available Only)</Label>
                          <select
                            {...register("vehicleId", { required: "Vehicle selection is required" })}
                            className="w-full border border-input bg-white rounded-xl h-10 px-3 pr-8 text-xs outline-none focus:ring-1 focus:ring-primary appearance-none bg-[url('data:image/svg+xml;charset=utf-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20viewBox%3D%220%200%2020%2020%22%20fill%3D%22none%22%3E%3Cpath%20d%3D%22M7%209l3%203%203-3%22%20stroke%3D%22%236b7280%22%20stroke-width%3D%221.5%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%2F%3E%3C%2Fsvg%3E')] bg-[position:right_10px_center] bg-[size:16px_16px] bg-no-repeat"
                          >
                            <option value="">-- Select Available Truck --</option>
                            {vehicles
                              .filter((v) => v.status === "available")
                              .map((v) => (
                                <option key={v.id} value={v.id}>
                                  {v.number} - {v.make} (Max: {v.capacityKg || 12000} kg)
                                </option>
                              ))}
                          </select>
                          {errors.vehicleId && (
                            <p className="text-[10px] text-red-500 font-bold">{errors.vehicleId.message}</p>
                          )}
                        </div>

                        <div className="space-y-1.5">
                          <Label className="text-xs font-bold text-slate-700">Cargo Description</Label>
                          <Input
                            {...register("cargoDescription", { required: "Cargo description is required" })}
                            placeholder="e.g. Electronics, Steel coils, Cement"
                            className="h-10 rounded-xl text-xs"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                        <div className="space-y-1.5">
                          <Label className="text-xs font-bold text-slate-700">Source Terminal</Label>
                          <Input
                            {...register("source", { required: "Source location is required" })}
                            placeholder="e.g. Mumbai Whse, Delhi Hub"
                            className="h-10 rounded-xl text-xs"
                          />
                        </div>

                        <div className="space-y-1.5">
                          <Label className="text-xs font-bold text-slate-700">Destination Terminal</Label>
                          <Input
                            {...register("destination", { required: "Destination is required" })}
                            placeholder="e.g. Pune Depot, Jaipur Yard"
                            className="h-10 rounded-xl text-xs"
                          />
                        </div>

                        <div className="space-y-1.5">
                          <Label className="text-xs font-bold text-slate-700">Cargo Weight (kg)</Label>
                          <Input
                            type="number"
                            {...register("cargoWeight", { required: "Cargo weight is required" })}
                            placeholder="Weight in kg"
                            className="h-10 rounded-xl text-xs"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-4 gap-5">
                        <div className="space-y-1.5">
                          <Label className="text-xs font-bold text-slate-700">Estimated Distance</Label>
                          <Input
                            {...register("distance", { required: "Distance is required" })}
                            placeholder="e.g. 148 km"
                            className="h-10 rounded-xl text-xs"
                          />
                        </div>

                        <div className="space-y-1.5">
                          <Label className="text-xs font-bold text-slate-700">Expected Delivery Time</Label>
                          <Input
                            {...register("expectedDelivery", { required: "Delivery time is required" })}
                            placeholder="e.g. 3 hours, 2 days"
                            className="h-10 rounded-xl text-xs"
                          />
                        </div>

                        <div className="space-y-1.5">
                          <Label className="text-xs font-bold text-slate-700">Estimated Revenue</Label>
                          <Input
                            {...register("estimatedRevenue", { required: "Revenue is required" })}
                            placeholder="e.g. ₹18,500"
                            className="h-10 rounded-xl text-xs"
                          />
                        </div>

                        <div className="space-y-1.5">
                          <Label className="text-xs font-bold text-slate-700">Dispatcher Name</Label>
                          <Input
                            {...register("dispatcher", { required: "Dispatcher is required" })}
                            placeholder="Dispatcher name"
                            className="h-10 rounded-xl text-xs"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                        <div className="space-y-1.5">
                          <Label className="text-xs font-bold text-slate-700">Warehouse Origin</Label>
                          <Input
                            {...register("warehouse", { required: "Warehouse origin is required" })}
                            placeholder="Warehouse name"
                            className="h-10 rounded-xl text-xs"
                          />
                        </div>

                        <div className="space-y-1.5">
                          <Label className="text-xs font-bold text-slate-700">Remarks / Cargo Notes</Label>
                          <Input
                            {...register("remarks")}
                            placeholder="Any special handling or client remarks"
                            className="h-10 rounded-xl text-xs"
                          />
                        </div>
                      </div>

                      {/* Display active capacity alert */}
                      {selectedVehicleId && cargoWeight && (
                        (() => {
                          const v = vehicles.find((v) => v.id === selectedVehicleId);
                          const w = parseFloat(cargoWeight) || 0;
                          const cap = v?.capacityKg || 12000;
                          if (w > cap) {
                            return (
                              <div className="bg-red-50 border border-red-200 text-red-800 rounded-xl p-3 text-xs flex items-center gap-2">
                                <AlertCircle className="h-4.5 w-4.5 text-red-600 flex-shrink-0" />
                                <span className="font-bold">Overweight Warning: Cargo weight exceeds this truck&apos;s capacity limit of {cap.toLocaleString()} kg!</span>
                              </div>
                            );
                          }
                          return null;
                        })()
                      )}

                      <div className="flex gap-3 justify-end pt-4 border-t border-border/50">
                        <Button
                          type="button"
                          onClick={() => {
                            setScannedDriver(null);
                            setScanSuccess(false);
                            setDriverConfirmed(false);
                          }}
                          variant="ghost"
                          className="rounded-xl text-xs h-10 px-4"
                        >
                          Reset / Cancel
                        </Button>
                        <Button
                          type="submit"
                          disabled={validationErrors.length > 0 || !driverConfirmed}
                          className="rounded-xl text-xs h-10 px-6 bg-primary hover:bg-primary/90 text-white font-bold shadow-md shadow-primary/20"
                        >
                          🚀 Confirm & Dispatch Truck
                        </Button>
                      </div>
                    </form>
                  </CardContent>
                </Card>
              </motion.div>
            )}
          </TabsContent>

          {/* TAB 2: DISPATCH HISTORY & MANAGEMENT */}
          <TabsContent value="history" className="outline-none">
            <Card className="rounded-xl border-0 ring-0 ambient-shadow overflow-hidden">
              <CardHeader className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-border/50">
                <div>
                  <CardTitle className="text-sm font-bold">Smart Dispatch Logs</CardTitle>
                  <CardDescription className="text-xs">
                    Track dispatches, complete active runs, and access digital challan passes.
                  </CardDescription>
                </div>
                {/* Search & Filter tools */}
                <div className="flex flex-col sm:flex-row items-center gap-3">
                  <div className="relative w-full sm:w-60">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search ID, driver, vehicle..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-9 rounded-lg h-9 text-xs"
                    />
                  </div>
                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="border border-input rounded-lg h-9 px-3 pr-8 text-xs outline-none bg-white min-w-[120px] appearance-none bg-[url('data:image/svg+xml;charset=utf-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20viewBox%3D%220%200%2020%2020%22%20fill%3D%22none%22%3E%3Cpath%20d%3D%22M7%209l3%203%203-3%22%20stroke%3D%22%236b7280%22%20stroke-width%3D%221.5%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%2F%3E%3C%2Fsvg%3E')] bg-[position:right_8px_center] bg-[size:14px_14px] bg-no-repeat"
                  >
                    <option value="all">All Statuses</option>
                    <option value="on_trip">Active Runs</option>
                    <option value="completed">Completed</option>
                    <option value="cancelled">Cancelled</option>
                  </select>
                </div>
              </CardHeader>
              <CardContent className="p-0 overflow-x-auto">
                {filteredHistory.length > 0 ? (
                  <table className="w-full text-left border-collapse text-xs">
                    <thead>
                      <tr className="bg-muted/50 border-b border-border/60">
                        <th className="px-4 py-3 text-[10px] tracking-wider uppercase font-bold text-slate-500 text-left border-b border-border/60">Dispatch ID</th>
                        <th className="px-4 py-3 text-[10px] tracking-wider uppercase font-bold text-slate-500 text-left border-b border-border/60">Driver</th>
                        <th className="px-4 py-3 text-[10px] tracking-wider uppercase font-bold text-slate-500 text-left border-b border-border/60">Vehicle</th>
                        <th className="px-4 py-3 text-[10px] tracking-wider uppercase font-bold text-slate-500 text-left border-b border-border/60">Route</th>
                        <th className="px-4 py-3 text-[10px] tracking-wider uppercase font-bold text-slate-500 text-left border-b border-border/60">Dispatch Time</th>
                        <th className="px-4 py-3 text-[10px] tracking-wider uppercase font-bold text-slate-500 text-left border-b border-border/60">Status</th>
                        <th className="px-4 py-3 text-[10px] tracking-wider uppercase font-bold text-slate-500 text-right border-b border-border/60">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border/50">
                      {filteredHistory.map((item) => (
                        <tr key={item.dispatchId} className="hover:bg-muted/40 transition-colors">
                          <td className="px-4 py-3 font-bold text-foreground">{item.dispatchId}</td>
                          <td className="px-4 py-3 font-medium">{item.driverName}</td>
                          <td className="px-4 py-3">{item.vehicleRegistration}</td>
                          <td className="px-4 py-3 font-medium text-slate-700">{item.source} → {item.destination}</td>
                          <td className="px-4 py-3 text-muted-foreground">{item.dispatchDate} {item.dispatchTime}</td>
                          <td className="px-4 py-3">
                            <StatusBadge variant={item.tripStatus.replace("_", "-") as any} />
                          </td>
                          <td className="px-4 py-3 text-right space-x-1.5 whitespace-nowrap">
                            <Button
                              onClick={() => {
                                setCurrentPass(item);
                                setShowPassModal(true);
                              }}
                              variant="outline"
                              size="sm"
                              className="h-7 text-[10px] rounded-md gap-0.5"
                            >
                              <FileText className="h-3 w-3" /> Challan
                            </Button>
                            {item.tripStatus === "on_trip" && (
                              <>
                                <Button
                                  onClick={() => handleOpenComplete(item.dispatchId)}
                                  size="sm"
                                  className="h-7 text-[10px] rounded-md bg-emerald-600 hover:bg-emerald-700 text-white font-semibold border-0"
                                >
                                  Complete
                                </Button>
                                <Button
                                  onClick={() => handleCancelTrip(item.dispatchId)}
                                  variant="ghost"
                                  size="sm"
                                  className="h-7 text-[10px] rounded-md text-red-600 hover:bg-red-50 hover:text-red-700"
                                >
                                  Cancel
                                </Button>
                              </>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                ) : (
                  <div className="text-center py-12 text-muted-foreground">
                    <Truck className="h-10 w-10 text-slate-300 stroke-[1.5] mx-auto mb-2" />
                    <p className="text-sm font-semibold">No dispatches found</p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      Verify filter settings or dispatch your first truck.
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      {/* MODAL 1: DISPATCH PASS (CHALLAN PASS) */}
      <AnimatePresence>
        {showPassModal && currentPass && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-2xl w-full max-w-lg overflow-hidden border border-border shadow-2xl flex flex-col"
            >
              {/* Receipt Header */}
              <div className="bg-gradient-to-r from-orange-500 to-amber-500 p-5 text-white flex items-center justify-between">
                <div>
                  <h3 className="font-bold text-base leading-none">RoadKing Logistics</h3>
                  <p className="text-[10px] text-white/80 font-medium uppercase tracking-wider mt-1">Official Transport Challan Pass</p>
                </div>
                <div className="bg-white/20 px-2.5 py-1 rounded-md text-xs font-bold tracking-tight">
                  {currentPass.dispatchId}
                </div>
              </div>

              {/* Receipt Body */}
              <div className="p-6 space-y-6 flex-1 overflow-y-auto">
                <div className="grid grid-cols-2 gap-4 text-xs">
                  <div>
                    <label className="text-[10px] text-muted-foreground uppercase font-bold">Driver Name</label>
                    <p className="font-semibold text-slate-800 mt-0.5">{currentPass.driverName}</p>
                    <p className="text-[10px] text-muted-foreground">ID: {currentPass.driverId}</p>
                  </div>
                  <div>
                    <label className="text-[10px] text-muted-foreground uppercase font-bold">Vehicle Registration</label>
                    <p className="font-semibold text-slate-800 mt-0.5">{currentPass.vehicleRegistration}</p>
                    <p className="text-[10px] text-muted-foreground">{currentPass.vehicleName}</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 text-xs border-t border-slate-100 pt-4">
                  <div>
                    <label className="text-[10px] text-muted-foreground uppercase font-bold">Source Terminal</label>
                    <p className="font-semibold text-slate-800 mt-0.5 flex items-center gap-1">
                      <MapPin className="h-3 w-3 text-slate-500" />
                      {currentPass.source}
                    </p>
                  </div>
                  <div>
                    <label className="text-[10px] text-muted-foreground uppercase font-bold">Destination Terminal</label>
                    <p className="font-semibold text-slate-800 mt-0.5 flex items-center gap-1">
                      <MapPin className="h-3 w-3 text-primary" />
                      {currentPass.destination}
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-2 text-xs border-t border-slate-100 pt-4">
                  <div>
                    <label className="text-[10px] text-muted-foreground uppercase font-bold">Cargo</label>
                    <p className="font-semibold text-slate-800 mt-0.5 truncate">{currentPass.cargoDescription}</p>
                  </div>
                  <div>
                    <label className="text-[10px] text-muted-foreground uppercase font-bold">Weight</label>
                    <p className="font-semibold text-slate-800 mt-0.5">{currentPass.cargoWeight} kg</p>
                  </div>
                  <div>
                    <label className="text-[10px] text-muted-foreground uppercase font-bold">Dispatch Time</label>
                    <p className="font-semibold text-slate-800 mt-0.5">{currentPass.dispatchTime}</p>
                  </div>
                </div>

                {/* Dispatch QR Code area */}
                <div className="border-t border-dashed border-slate-200 pt-6 flex flex-col sm:flex-row items-center justify-between gap-4">
                  <div className="text-center sm:text-left space-y-1 max-w-[220px]">
                    <h4 className="text-xs font-bold text-slate-800">Transport Security QR Code</h4>
                    <p className="text-[10px] text-muted-foreground leading-normal">
                      Scan this digital challan at checkposts or terminal gate to verify trip metadata and status.
                    </p>
                    <Link
                      href={`/verify-dispatch?id=${currentPass.dispatchId}`}
                      target="_blank"
                      className="inline-block text-[10px] text-primary hover:underline font-bold mt-1.5"
                    >
                      Open Verification Portal →
                    </Link>
                  </div>

                  <div className="bg-slate-50 p-2.5 border border-slate-200/50 rounded-xl relative shadow-inner">
                    <div className="bg-white p-2 rounded-xl">
                      <QRCodeCanvas
                        id={`pass-qr-${currentPass.dispatchId}`}
                        value={JSON.stringify({
                          dispatchId: currentPass.dispatchId,
                          driverId: currentPass.driverId,
                          vehicleReg: currentPass.vehicleRegistration,
                          timestamp: new Date().toISOString(),
                        })}
                        size={140}
                        bgColor={"#ffffff"}
                        fgColor={"#000000"}
                        level={"Q"}
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Receipt Footer Actions */}
              <div className="bg-slate-50 border-t border-border p-4 flex gap-2 justify-end">
                <Button
                  onClick={() => downloadDispatchQR(currentPass)}
                  variant="outline"
                  size="sm"
                  className="rounded-lg text-xs gap-1 h-9 bg-white"
                >
                  <Download className="h-3.5 w-3.5" /> Download QR
                </Button>
                <Button
                  onClick={() => handlePrintPass(currentPass)}
                  variant="outline"
                  size="sm"
                  className="rounded-lg text-xs gap-1 h-9 bg-white"
                >
                  <Printer className="h-3.5 w-3.5" /> Print Pass
                </Button>
                <Button
                  onClick={() => {
                    const canvas = document.getElementById(`pass-qr-${currentPass.dispatchId}`) as HTMLCanvasElement;
                    const url = canvas?.toDataURL("image/png") || "";
                    const link = document.createElement("a");
                    link.download = `challan-${currentPass.dispatchId}.png`;
                    link.href = url;
                    link.click();
                  }}
                  variant="outline"
                  size="sm"
                  className="rounded-lg text-xs gap-1 h-9 bg-white"
                >
                  <Download className="h-3.5 w-3.5" /> Download PDF
                </Button>
                <Button
                  onClick={() => setShowPassModal(false)}
                  className="rounded-lg text-xs h-9 bg-primary hover:bg-primary/90 text-white font-bold"
                  size="sm"
                >
                  Close
                </Button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* MODAL 2: TRIP COMPLETION FORM */}
      <AnimatePresence>
        {showCompleteModal && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-2xl w-full max-w-md overflow-hidden border border-border shadow-2xl"
            >
              <div className="bg-slate-50 border-b border-border p-4">
                <h3 className="font-bold text-sm text-foreground flex items-center gap-1.5">
                  <CheckCircle className="h-4.5 w-4.5 text-emerald-600" />
                  Complete Trip Dispatch
                </h3>
              </div>
              <form onSubmit={handleConfirmComplete} className="p-5 space-y-4">
                <div className="space-y-1.5">
                  <Label className="text-xs font-bold text-slate-700">Final Odometer Reading (km)</Label>
                  <Input
                    name="odometer"
                    type="number"
                    required
                    placeholder="e.g. 45820"
                    className="h-10 rounded-lg text-xs"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs font-bold text-slate-700">Fuel Used (Litres)</Label>
                  <Input
                    name="fuel"
                    type="number"
                    required
                    placeholder="e.g. 85"
                    className="h-10 rounded-lg text-xs"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs font-bold text-slate-700">Trip Completion Remarks</Label>
                  <Input
                    name="notes"
                    placeholder="Safe arrival, client signed challan, etc."
                    className="h-10 rounded-lg text-xs"
                  />
                </div>
                <div className="flex gap-2 justify-end pt-4 border-t border-border/50">
                  <Button
                    type="button"
                    onClick={() => setShowCompleteModal(false)}
                    variant="ghost"
                    className="rounded-lg text-xs h-9"
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    className="rounded-lg text-xs h-9 bg-emerald-600 hover:bg-emerald-700 text-white font-bold"
                  >
                    Confirm Completion
                  </Button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* MODAL 3: SUMMARY CONFIRMATION DIALOG */}
      <AnimatePresence>
        {showSummaryModal && pendingDispatchData && scannedDriver && (() => {
          const sv = vehicles.find((v) => v.id === pendingDispatchData.vehicleId);
          return (
            <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
              <motion.div
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.95, opacity: 0 }}
                className="bg-white rounded-2xl w-full max-w-lg overflow-hidden border border-border shadow-2xl"
              >
                <div className="bg-gradient-to-r from-orange-500 to-amber-500 p-5 text-white">
                  <h3 className="font-bold text-base leading-none">Dispatch Summary</h3>
                  <p className="text-[10px] text-white/80 font-medium uppercase tracking-wider mt-1">Review all details before confirming dispatch</p>
                </div>

                <div className="p-6 space-y-5 max-h-[60vh] overflow-y-auto">
                  {/* Driver */}
                  <div className="flex items-center gap-3 bg-slate-50 p-3 rounded-xl border border-slate-100">
                    <Image
                      src={scannedDriver.photoUrl || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200"}
                      alt={scannedDriver.name}
                      width={40}
                      height={40}
                      unoptimized
                      className="w-10 h-10 rounded-full object-cover border-2 border-white shadow flex-shrink-0"
                    />
                    <div>
                      <p className="font-bold text-sm text-slate-800">{scannedDriver.name}</p>
                      <p className="text-[10px] text-muted-foreground">ID: {scannedDriver.id} · Safety: {scannedDriver.safetyScore}%</p>
                    </div>
                  </div>

                  {/* Vehicle */}
                  {sv && (
                    <div className="bg-slate-50 p-3 rounded-xl border border-slate-100 text-xs space-y-1">
                      <label className="text-[10px] text-muted-foreground uppercase font-bold">Assigned Vehicle</label>
                      <p className="font-bold text-sm text-slate-800">{sv.number} — {sv.make}</p>
                      <p className="text-[10px] text-muted-foreground">Type: {sv.type} · Max Capacity: {(sv.capacityKg || 12000).toLocaleString()} kg</p>
                    </div>
                  )}

                  {/* Route & Cargo */}
                  <div className="grid grid-cols-2 gap-4 text-xs">
                    <div>
                      <label className="text-[10px] text-muted-foreground uppercase font-bold">Source</label>
                      <p className="font-semibold text-slate-800 mt-0.5">{pendingDispatchData.source}</p>
                    </div>
                    <div>
                      <label className="text-[10px] text-muted-foreground uppercase font-bold">Destination</label>
                      <p className="font-semibold text-slate-800 mt-0.5">{pendingDispatchData.destination}</p>
                    </div>
                    <div>
                      <label className="text-[10px] text-muted-foreground uppercase font-bold">Cargo</label>
                      <p className="font-semibold text-slate-800 mt-0.5">{pendingDispatchData.cargoDescription}</p>
                    </div>
                    <div>
                      <label className="text-[10px] text-muted-foreground uppercase font-bold">Cargo Weight</label>
                      <p className="font-semibold text-slate-800 mt-0.5">{pendingDispatchData.cargoWeight} kg</p>
                    </div>
                    <div>
                      <label className="text-[10px] text-muted-foreground uppercase font-bold">Distance</label>
                      <p className="font-semibold text-slate-800 mt-0.5">{pendingDispatchData.distance}</p>
                    </div>
                    <div>
                      <label className="text-[10px] text-muted-foreground uppercase font-bold">Expected Delivery</label>
                      <p className="font-semibold text-slate-800 mt-0.5">{pendingDispatchData.expectedDelivery}</p>
                    </div>
                    <div>
                      <label className="text-[10px] text-muted-foreground uppercase font-bold">Dispatcher</label>
                      <p className="font-semibold text-slate-800 mt-0.5">{pendingDispatchData.dispatcher}</p>
                    </div>
                    <div>
                      <label className="text-[10px] text-muted-foreground uppercase font-bold">Warehouse</label>
                      <p className="font-semibold text-slate-800 mt-0.5">{pendingDispatchData.warehouse}</p>
                    </div>
                  </div>

                  {pendingDispatchData.remarks && (
                    <div className="text-xs border-t border-slate-100 pt-3">
                      <label className="text-[10px] text-muted-foreground uppercase font-bold">Remarks</label>
                      <p className="font-medium text-slate-700 mt-0.5">{pendingDispatchData.remarks}</p>
                    </div>
                  )}

                  <div className="bg-amber-50 border border-amber-200 text-amber-800 rounded-xl p-3 text-[11px] font-medium">
                    ⚠️ This will mark the driver as <strong>On Trip</strong>, assign the vehicle, generate a <strong>Dispatch QR Challan</strong>, and create a trip record.
                  </div>
                </div>

                <div className="bg-slate-50 border-t border-border p-4 flex gap-2 justify-end">
                  <Button
                    onClick={() => { setShowSummaryModal(false); setPendingDispatchData(null); }}
                    variant="ghost"
                    className="rounded-lg text-xs h-9"
                  >
                    Go Back & Edit
                  </Button>
                  <Button
                    onClick={handleConfirmDispatch}
                    className="rounded-lg text-xs h-9 bg-primary hover:bg-primary/90 text-white font-bold shadow-md shadow-primary/20 px-5"
                  >
                    🚀 Confirm & Dispatch
                  </Button>
                </div>
              </motion.div>
            </div>
          );
        })()}
      </AnimatePresence>
    </>
  );
}
