import type { StatusVariant } from "./status-colors";

export interface Driver {
  id: string;
  name: string;
  license: string;
  phone: string;
  status: StatusVariant;
  safetyScore: number;
  totalTrips: number;
  incidents: number;
  vehicle: string;
  licenseCategory?: string;
  licenseExpiry?: string;
  photoUrl?: string;
}

export interface Vehicle {
  id: string;
  number: string;
  type: string;
  make: string;
  year: number;
  status: StatusVariant;
  driver: string;
  lastService: string;
  nextService: string;
  mileage: string;
  capacityKg?: number; // Added capacity for weight validation
}

export interface Trip {
  id: string;
  origin: string;
  destination: string;
  driver: string;
  vehicle: string;
  status: StatusVariant;
  distance: string;
  eta: string;
  revenue: string;
  startDate: string;
  cargoDescription?: string;
  cargoWeight?: string;
  dispatcher?: string;
  remarks?: string;
  dispatchId?: string;
  dispatchTime?: string;
}

export interface DispatchRecord {
  dispatchId: string;
  tripId: string;
  driverId: string;
  driverName: string;
  vehicleId: string;
  vehicleRegistration: string;
  vehicleName: string;
  source: string;
  destination: string;
  cargoDescription: string;
  cargoWeight: string;
  dispatchDate: string;
  dispatchTime: string;
  dispatcher: string;
  tripStatus: string;
  expectedDelivery: string;
  distance: string;
  estimatedRevenue: string;
  remarks?: string;
  arrivalTime?: string;
}

export interface ScanLog {
  id: string;
  timestamp: string;
  driverId: string;
  driverName: string;
  success: boolean;
  message: string;
}

export interface AppNotification {
  id: string;
  title: string;
  message: string;
  timestamp: string;
  type: "info" | "warning" | "success" | "critical";
  read: boolean;
}

const DEFAULT_DRIVERS: Driver[] = [
  { id: "DRV-001", name: "Rajesh Kumar", license: "MH-0420210045678", phone: "+91 98765 43210", status: "on-trip", safetyScore: 94, totalTrips: 312, incidents: 1, vehicle: "MH-04 AB 1234", licenseCategory: "Heavy Motor Vehicle (HMV)", licenseExpiry: "2028-10-15", photoUrl: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200" },
  { id: "DRV-002", name: "Amit Singh", license: "DL-0120200012345", phone: "+91 98765 43211", status: "available", safetyScore: 88, totalTrips: 276, incidents: 3, vehicle: "DL-01 CD 5678", licenseCategory: "Heavy Motor Vehicle (HMV)", licenseExpiry: "2027-04-20", photoUrl: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=200" },
  { id: "DRV-003", name: "Suresh Reddy", license: "KA-0120220098765", phone: "+91 98765 43212", status: "on-trip", safetyScore: 96, totalTrips: 198, incidents: 0, vehicle: "KA-01 EF 9012", licenseCategory: "Multi-Axle Trailer", licenseExpiry: "2029-08-30", photoUrl: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=200" },
  { id: "DRV-004", name: "Mohan Rao", license: "TS-0920190054321", phone: "+91 98765 43213", status: "on-trip", safetyScore: 72, totalTrips: 421, incidents: 7, vehicle: "TS-09 GH 3456", licenseCategory: "Heavy Motor Vehicle (HMV)", licenseExpiry: "2024-03-12", photoUrl: "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&q=80&w=200" }, // Expired license
  { id: "DRV-005", name: "Debashis Das", license: "WB-0620210076543", phone: "+91 98765 43214", status: "off-duty", safetyScore: 91, totalTrips: 156, incidents: 2, vehicle: "WB-06 IJ 7890", licenseCategory: "Medium Commercial Vehicle", licenseExpiry: "2028-11-05", photoUrl: "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&q=80&w=200" },
  { id: "DRV-006", name: "Vikas Meena", license: "RJ-1420200034567", phone: "+91 98765 43215", status: "on-trip", safetyScore: 85, totalTrips: 245, incidents: 4, vehicle: "RJ-14 MN 3344", licenseCategory: "Heavy Motor Vehicle (HMV)", licenseExpiry: "2026-12-18", photoUrl: "https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?auto=format&fit=crop&q=80&w=200" },
  { id: "DRV-007", name: "Pradeep Sharma", license: "MH-1220180023456", phone: "+91 98765 43216", status: "suspended", safetyScore: 58, totalTrips: 389, incidents: 12, vehicle: "—", licenseCategory: "Heavy Motor Vehicle (HMV)", licenseExpiry: "2025-09-01", photoUrl: "https://images.unsplash.com/photo-1489980508314-941910ded1f4?auto=format&fit=crop&q=80&w=200" },
  { id: "DRV-008", name: "Arjun Patel", license: "GJ-0520210087654", phone: "+91 98765 43217", status: "available", safetyScore: 93, totalTrips: 178, incidents: 1, vehicle: "Unassigned", licenseCategory: "Heavy Motor Vehicle (HMV)", licenseExpiry: "2028-05-14", photoUrl: "https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?auto=format&fit=crop&q=80&w=200" },
];

const DEFAULT_VEHICLES: Vehicle[] = [
  { id: "V-001", number: "MH-04 AB 1234", type: "Truck – 16T", make: "Tata Prima 4028.S", year: 2022, status: "on-trip", driver: "Rajesh Kumar", lastService: "2024-11-15", nextService: "2025-02-15", mileage: "45,230 km", capacityKg: 16000 },
  { id: "V-002", number: "DL-01 CD 5678", type: "Truck – 12T", make: "Ashok Leyland 1920", year: 2021, status: "available", driver: "Unassigned", lastService: "2024-12-01", nextService: "2025-03-01", mileage: "62,100 km", capacityKg: 12000 },
  { id: "V-003", number: "KA-01 EF 9012", type: "Trailer – 20T", make: "BharatBenz 1617R", year: 2023, status: "in-maintenance", driver: "Suresh Reddy", lastService: "2024-10-20", nextService: "2025-01-20", mileage: "31,400 km", capacityKg: 20000 },
  { id: "V-004", number: "TS-09 GH 3456", type: "Truck – 16T", make: "Tata Signa 4825.TK", year: 2020, status: "on-trip", driver: "Mohan Rao", lastService: "2024-11-28", nextService: "2025-02-28", mileage: "78,920 km", capacityKg: 16000 },
  { id: "V-005", number: "WB-06 IJ 7890", type: "Mini Truck – 5T", make: "Eicher Pro 3015", year: 2023, status: "available", driver: "Debashis Das", lastService: "2024-12-10", nextService: "2025-03-10", mileage: "18,750 km", capacityKg: 5000 },
  { id: "V-006", number: "GJ-05 KL 1122", type: "Truck – 16T", make: "Volvo FM 380", year: 2019, status: "retired", driver: "—", lastService: "2024-09-05", nextService: "—", mileage: "1,45,000 km", capacityKg: 16000 },
  { id: "V-007", number: "RJ-14 MN 3344", type: "Tanker – 10KL", make: "Ashok Leyland 2820", year: 2022, status: "on-trip", driver: "Vikas Meena", lastService: "2024-11-20", nextService: "2025-02-20", mileage: "52,800 km", capacityKg: 10000 },
  { id: "V-008", number: "MH-12 OP 5566", type: "Truck – 12T", make: "Tata LPT 1613", year: 2021, status: "in-shop", driver: "—", lastService: "2024-12-15", nextService: "2025-01-05", mileage: "67,300 km", capacityKg: 12000 },
];

const DEFAULT_TRIPS: Trip[] = [
  { id: "TRP-1024", origin: "Mumbai", destination: "Pune", driver: "Rajesh Kumar", vehicle: "MH-04 AB 1234", status: "on-trip", distance: "148 km", eta: "2h 15m", revenue: "₹18,500", startDate: "2025-01-08 06:30" },
  { id: "TRP-1023", origin: "Delhi", destination: "Jaipur", driver: "Amit Singh", vehicle: "DL-01 CD 5678", status: "completed", distance: "280 km", eta: "—", revenue: "₹34,200", startDate: "2025-01-07 04:00" },
  { id: "TRP-1022", origin: "Bangalore", destination: "Chennai", driver: "Suresh Reddy", vehicle: "KA-01 EF 9012", status: "on-trip", distance: "346 km", eta: "4h 30m", revenue: "₹42,800", startDate: "2025-01-08 02:00" },
  { id: "TRP-1021", origin: "Hyderabad", destination: "Vizag", driver: "Mohan Rao", vehicle: "TS-09 GH 3456", status: "scheduled", distance: "625 km", eta: "—", revenue: "₹56,000", startDate: "2025-01-09 05:00" },
  { id: "TRP-1020", origin: "Kolkata", destination: "Bhubaneswar", driver: "Debashis Das", vehicle: "WB-06 IJ 7890", status: "completed", distance: "440 km", eta: "—", revenue: "₹38,400", startDate: "2025-01-06 03:30" },
  { id: "TRP-1019", origin: "Mumbai", destination: "Nashik", driver: "Vikas Meena", vehicle: "RJ-14 MN 3344", status: "on-trip", distance: "167 km", eta: "1h 45m", revenue: "₹15,200", startDate: "2025-01-08 08:00" },
  { id: "TRP-1018", origin: "Ahmedabad", destination: "Surat", driver: "Arjun Patel", vehicle: "GJ-05 KL 1122", status: "completed", distance: "265 km", eta: "—", revenue: "₹29,100", startDate: "2025-01-05 06:00" },
  { id: "TRP-1017", origin: "Chennai", destination: "Coimbatore", driver: "Suresh Reddy", vehicle: "KA-01 EF 9012", status: "cancelled", distance: "505 km", eta: "—", revenue: "₹0", startDate: "2025-01-04 05:00" },
];

export function initializeStorage() {
  if (typeof window === "undefined") return;

  if (!localStorage.getItem("drivers")) {
    localStorage.setItem("drivers", JSON.stringify(DEFAULT_DRIVERS));
  }

  if (!localStorage.getItem("vehicles")) {
    localStorage.setItem("vehicles", JSON.stringify(DEFAULT_VEHICLES));
  }

  if (!localStorage.getItem("trips")) {
    localStorage.setItem("trips", JSON.stringify(DEFAULT_TRIPS));
  }

  // Pre-generate Permanent Driver QRs
  if (!localStorage.getItem("driverQRs")) {
    const driversList = JSON.parse(localStorage.getItem("drivers") || "[]") as Driver[];
    const qrs: Record<string, string> = {};
    driversList.forEach((drv) => {
      qrs[drv.id] = JSON.stringify({
        driverId: drv.id,
        driverName: drv.name,
      });
    });
    localStorage.setItem("driverQRs", JSON.stringify(qrs));
  }

  if (!localStorage.getItem("dispatchQRs")) {
    localStorage.setItem("dispatchQRs", JSON.stringify({}));
  }

  if (!localStorage.getItem("dispatchHistory")) {
    localStorage.setItem("dispatchHistory", JSON.stringify([]));
  }

  if (!localStorage.getItem("dispatchPasses")) {
    localStorage.setItem("dispatchPasses", JSON.stringify({}));
  }

  if (!localStorage.getItem("qrScanLogs")) {
    localStorage.setItem("qrScanLogs", JSON.stringify([]));
  }

  if (!localStorage.getItem("notifications")) {
    localStorage.setItem("notifications", JSON.stringify([]));
  }
}

export function getDrivers(): Driver[] {
  initializeStorage();
  if (typeof window === "undefined") return DEFAULT_DRIVERS;
  return JSON.parse(localStorage.getItem("drivers") || "[]");
}

export function getVehicles(): Vehicle[] {
  initializeStorage();
  if (typeof window === "undefined") return DEFAULT_VEHICLES;
  return JSON.parse(localStorage.getItem("vehicles") || "[]");
}

export function getTrips(): Trip[] {
  initializeStorage();
  if (typeof window === "undefined") return DEFAULT_TRIPS;
  return JSON.parse(localStorage.getItem("trips") || "[]");
}

export function getDriverQRs(): Record<string, string> {
  initializeStorage();
  if (typeof window === "undefined") return {};
  return JSON.parse(localStorage.getItem("driverQRs") || "{}");
}

export function getDispatchHistory(): DispatchRecord[] {
  initializeStorage();
  if (typeof window === "undefined") return [];
  return JSON.parse(localStorage.getItem("dispatchHistory") || "[]");
}

export function getScanLogs(): ScanLog[] {
  initializeStorage();
  if (typeof window === "undefined") return [];
  return JSON.parse(localStorage.getItem("qrScanLogs") || "[]");
}

export function getNotifications(): AppNotification[] {
  initializeStorage();
  if (typeof window === "undefined") return [];
  return JSON.parse(localStorage.getItem("notifications") || "[]");
}

export function addNotification(title: string, message: string, type: AppNotification["type"] = "info") {
  const notifs = getNotifications();
  const newNotif: AppNotification = {
    id: `NOT-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
    title,
    message,
    timestamp: new Date().toISOString(),
    type,
    read: false,
  };
  notifs.unshift(newNotif);
  localStorage.setItem("notifications", JSON.stringify(notifs.slice(0, 100)));
}

export function addScanLog(driverId: string, driverName: string, success: boolean, message: string) {
  const logs = getScanLogs();
  const newLog: ScanLog = {
    id: `SCN-${Date.now()}`,
    timestamp: new Date().toISOString(),
    driverId,
    driverName,
    success,
    message,
  };
  logs.unshift(newLog);
  localStorage.setItem("qrScanLogs", JSON.stringify(logs.slice(0, 100)));
}

export function updateDriverStatus(driverId: string, status: StatusVariant, vehicleName: string = "—") {
  const drivers = getDrivers();
  const index = drivers.findIndex((d) => d.id === driverId);
  if (index !== -1) {
    drivers[index].status = status;
    drivers[index].vehicle = vehicleName;
    localStorage.setItem("drivers", JSON.stringify(drivers));
  }
}

export function updateVehicleStatus(vehicleId: string, status: StatusVariant, driverName: string = "—") {
  const vehicles = getVehicles();
  const index = vehicles.findIndex((v) => v.id === vehicleId || v.number === vehicleId);
  if (index !== -1) {
    vehicles[index].status = status;
    vehicles[index].driver = driverName;
    localStorage.setItem("vehicles", JSON.stringify(vehicles));
  }
}

export function createDispatch(record: Omit<DispatchRecord, "dispatchId" | "dispatchDate" | "dispatchTime" | "tripStatus">): DispatchRecord {
  const history = getDispatchHistory();
  const trips = getTrips();

  // Generate Dispatch ID e.g. RK-2026-000145
  const dispatchNum = String(history.length + 145).padStart(6, "0");
  const dispatchId = `RK-2026-${dispatchNum}`;
  const now = new Date();
  
  const fullRecord: DispatchRecord = {
    ...record,
    dispatchId,
    dispatchDate: now.toLocaleDateString(),
    dispatchTime: now.toLocaleTimeString(),
    tripStatus: "on-trip",
  };

  history.unshift(fullRecord);
  localStorage.setItem("dispatchHistory", JSON.stringify(history));

  // Store Dispatch QR Code payload
  const dispatchQRs = JSON.parse(localStorage.getItem("dispatchQRs") || "{}");
  dispatchQRs[dispatchId] = JSON.stringify(fullRecord);
  localStorage.setItem("dispatchQRs", JSON.stringify(dispatchQRs));

  // Update statuses
  updateDriverStatus(record.driverId, "on-trip", record.vehicleRegistration);
  updateVehicleStatus(record.vehicleId, "on-trip", record.driverName);

  // Update or Create Trip
  const tripIndex = trips.findIndex((t) => t.id === record.tripId);
  if (tripIndex !== -1) {
    trips[tripIndex].status = "on-trip";
    trips[tripIndex].driver = record.driverName;
    trips[tripIndex].vehicle = record.vehicleRegistration;
    trips[tripIndex].startDate = `${fullRecord.dispatchDate} ${fullRecord.dispatchTime}`;
  } else {
    // Insert new trip
    trips.unshift({
      id: record.tripId,
      origin: record.source,
      destination: record.destination,
      driver: record.driverName,
      vehicle: record.vehicleRegistration,
      status: "on-trip",
      distance: record.distance,
      eta: record.expectedDelivery,
      revenue: record.estimatedRevenue,
      startDate: `${fullRecord.dispatchDate} ${fullRecord.dispatchTime}`,
      cargoDescription: record.cargoDescription,
      cargoWeight: record.cargoWeight,
      dispatcher: record.dispatcher,
      remarks: record.remarks,
      dispatchId,
      dispatchTime: fullRecord.dispatchTime,
    });
  }
  localStorage.setItem("trips", JSON.stringify(trips));

  // Notifications
  addNotification("Driver Dispatched", `${record.driverName} has been dispatched with vehicle ${record.vehicleRegistration} to ${record.destination}`, "success");
  addNotification("Vehicle Assigned", `Vehicle ${record.vehicleRegistration} is assigned to trip ${record.tripId}`, "info");

  return fullRecord;
}

export function completeTrip(dispatchId: string, odometer: string, fuel: string, notes: string) {
  const history = getDispatchHistory();
  const trips = getTrips();
  
  const recordIndex = history.findIndex((h) => h.dispatchId === dispatchId);
  if (recordIndex !== -1) {
    const record = history[recordIndex];
    history[recordIndex].tripStatus = "completed";
    history[recordIndex].arrivalTime = new Date().toLocaleTimeString();
    localStorage.setItem("dispatchHistory", JSON.stringify(history));

    // Update driver & vehicle statuses back to available
    updateDriverStatus(record.driverId, "available", "Unassigned");
    updateVehicleStatus(record.vehicleId, "available", "Unassigned");

    // Update corresponding trip
    const tripIndex = trips.findIndex((t) => t.id === record.tripId || t.dispatchId === dispatchId);
    if (tripIndex !== -1) {
      trips[tripIndex].status = "completed";
      trips[tripIndex].eta = "—";
    }
    localStorage.setItem("trips", JSON.stringify(trips));

    // Update vehicle mileage
    const vehicles = getVehicles();
    const vIndex = vehicles.findIndex((v) => v.id === record.vehicleId);
    if (vIndex !== -1) {
      const currentMil = parseInt(vehicles[vIndex].mileage.replace(/[^0-9]/g, "")) || 0;
      const targetMil = parseInt(odometer) || currentMil;
      vehicles[vIndex].mileage = `${targetMil.toLocaleString()} km`;
      localStorage.setItem("vehicles", JSON.stringify(vehicles));
    }

    addNotification("Dispatch Completed", `Trip ${record.tripId} successfully completed by ${record.driverName}. Odometer: ${odometer} km.`, "success");
  }
}

export function cancelTrip(dispatchId: string) {
  const history = getDispatchHistory();
  const trips = getTrips();

  const recordIndex = history.findIndex((h) => h.dispatchId === dispatchId);
  if (recordIndex !== -1) {
    const record = history[recordIndex];
    history[recordIndex].tripStatus = "cancelled";
    localStorage.setItem("dispatchHistory", JSON.stringify(history));

    // Restore driver and vehicle to available
    updateDriverStatus(record.driverId, "available", "Unassigned");
    updateVehicleStatus(record.vehicleId, "available", "Unassigned");

    // Update corresponding trip
    const tripIndex = trips.findIndex((t) => t.id === record.tripId || t.dispatchId === dispatchId);
    if (tripIndex !== -1) {
      trips[tripIndex].status = "cancelled";
      trips[tripIndex].eta = "—";
    }
    localStorage.setItem("trips", JSON.stringify(trips));

    addNotification("Trip Cancelled", `Dispatch ${dispatchId} (Trip ${record.tripId}) was cancelled.`, "warning");
  }
}

export function getDispatchQR(dispatchId: string): string | null {
  if (typeof window === "undefined") return null;
  const dispatchQRs = JSON.parse(localStorage.getItem("dispatchQRs") || "{}");
  return dispatchQRs[dispatchId] || null;
}

export function updateDriverQR(driverId: string, payload: string) {
  const qrs = getDriverQRs();
  qrs[driverId] = payload;
  localStorage.setItem("driverQRs", JSON.stringify(qrs));
}
