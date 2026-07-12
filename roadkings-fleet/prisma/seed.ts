import { PrismaClient, Role } from "@prisma/client";
import * as bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("Seeding started...");

  // Clean existing users
  await prisma.user.deleteMany({});

  const passwordHash = bcrypt.hashSync("password123", 10);

  const usersToCreate = [
    {
      name: "John Manager",
      email: "manager@roadkings.com",
      passwordHash,
      role: Role.FLEET_MANAGER,
    },
    {
      name: "Rahul Dispatcher",
      email: "dispatcher@roadkings.com",
      passwordHash,
      role: Role.DISPATCHER,
    },
    {
      name: "Pradeep Safety",
      email: "safety@roadkings.com",
      passwordHash,
      role: Role.SAFETY_OFFICER,
    },
    {
      name: "Ananya Finance",
      email: "finance@roadkings.com",
      passwordHash,
      role: Role.FINANCIAL_ANALYST,
    },
    {
      name: "System Admin",
      email: "admin@roadkings.com",
      passwordHash,
      role: Role.ADMIN,
    },
    {
      name: "Dispatch Operator",
      email: "operator@roadkings.com",
      passwordHash,
      role: Role.DISPATCH_OPERATOR,
    },
    {
      name: "John Dispatch Manager",
      email: "dispatchmanager@roadkings.com",
      passwordHash,
      role: Role.DISPATCH_MANAGER,
    },
  ];

  for (const user of usersToCreate) {
    const created = await prisma.user.create({
      data: user,
    });
    console.log(`Created user: ${created.email} with role ${created.role}`);
  }

  console.log("Seeding complete for Users. Seeding remaining fleet data...");

  // Seed Vehicles
  const vehicles = [
    { vehicleId: "V-001", number: "MH-12-AB-1234", type: "Truck 16T", make: "Tata Motors", year: 2021, status: "available" as any, driver: "Amit Singh", lastService: "2024-01-10", nextService: "2024-06-10", mileage: "85,000", capacityKg: 16000 },
    { vehicleId: "V-002", number: "MH-12-CD-5678", type: "Trailer 20T", make: "Ashok Leyland", year: 2020, status: "on_trip" as any, driver: "Ravi Kumar", lastService: "2023-11-15", nextService: "2024-05-15", mileage: "120,000", capacityKg: 20000 },
    { vehicleId: "V-003", number: "MH-14-EF-9012", type: "Mini Truck", make: "Mahindra", year: 2022, status: "available" as any, driver: "Vikram Patil", lastService: "2024-02-05", nextService: "2024-08-05", mileage: "45,000", capacityKg: 5000 },
    { vehicleId: "V-004", number: "MH-12-GH-3456", type: "Truck 12T", make: "Eicher", year: 2019, status: "in_maintenance" as any, driver: "Unassigned", lastService: "2024-03-01", nextService: "2024-09-01", mileage: "150,000", capacityKg: 12000 },
    { vehicleId: "V-005", number: "MH-14-IJ-7890", type: "Truck 16T", make: "Tata Motors", year: 2023, status: "available" as any, driver: "Suresh Yadav", lastService: "2024-01-20", nextService: "2024-07-20", mileage: "25,000", capacityKg: 16000 },
  ];

  await prisma.vehicle.deleteMany({});
  for (const v of vehicles) {
    await prisma.vehicle.create({ data: v });
  }
  console.log("Vehicles seeded.");

  // Seed Drivers
  const drivers = [
    { driverId: "DRV-001", name: "Amit Singh", license: "MH12 20150001234", phone: "+91 98765 43210", status: "available" as any, safetyScore: 92, totalTrips: 154, incidents: 0, vehicle: "MH-12-AB-1234", licenseCategory: "HMV", licenseExpiry: "2028-10-15" },
    { driverId: "DRV-002", name: "Ravi Kumar", license: "MH14 20180005678", phone: "+91 87654 32109", status: "on_trip" as any, safetyScore: 88, totalTrips: 89, incidents: 1, vehicle: "MH-12-CD-5678", licenseCategory: "HMV", licenseExpiry: "2026-05-20" },
    { driverId: "DRV-003", name: "Vikram Patil", license: "MH12 20190009012", phone: "+91 76543 21098", status: "available" as any, safetyScore: 95, totalTrips: 42, incidents: 0, vehicle: "MH-14-EF-9012", licenseCategory: "LMV/HMV", licenseExpiry: "2027-12-10" },
    { driverId: "DRV-004", name: "Suresh Yadav", license: "MH14 20200003456", phone: "+91 65432 10987", status: "off_duty" as any, safetyScore: 82, totalTrips: 112, incidents: 2, vehicle: "MH-14-IJ-7890", licenseCategory: "HMV", licenseExpiry: "2025-08-30" },
    { driverId: "DRV-005", name: "Manoj Desai", license: "MH12 20170007890", phone: "+91 54321 09876", status: "suspended" as any, safetyScore: 65, totalTrips: 205, incidents: 5, vehicle: "Unassigned", licenseCategory: "HMV", licenseExpiry: "2024-11-05" },
  ];

  await prisma.driver.deleteMany({});
  for (const d of drivers) {
    await prisma.driver.create({ data: d });
  }
  console.log("Drivers seeded.");

  // Seed Trips
  const trips = [
    { tripId: "TRP-1001", origin: "Mumbai, MH", destination: "Pune, MH", driver: "Amit Singh", vehicle: "MH-12-AB-1234", status: "completed" as any, distance: "150 km", eta: "3h 30m", revenue: "₹8,500", startDate: "2024-03-10", cargoDescription: "Electronics", cargoWeight: "4500 kg" },
    { tripId: "TRP-1002", origin: "Pune, MH", destination: "Nashik, MH", driver: "Ravi Kumar", vehicle: "MH-12-CD-5678", status: "on_trip" as any, distance: "210 km", eta: "4h 45m", revenue: "₹12,000", startDate: "2024-03-15", cargoDescription: "Auto Parts", cargoWeight: "8000 kg" },
    { tripId: "TRP-1003", origin: "Nashik, MH", destination: "Surat, GJ", driver: "Vikram Patil", vehicle: "MH-14-EF-9012", status: "scheduled" as any, distance: "350 km", eta: "7h 15m", revenue: "₹18,500", startDate: "2024-03-20", cargoDescription: "Textiles", cargoWeight: "3000 kg" },
  ];

  await prisma.trip.deleteMany({});
  for (const t of trips) {
    await prisma.trip.create({ data: t });
  }
  console.log("Trips seeded.");

  // Seed Dispatches
  const dispatches = [
    { dispatchId: "RK-240315-0001", tripId: "TRP-1002", driverId: "DRV-002", driverName: "Ravi Kumar", vehicleId: "V-002", vehicleRegistration: "MH-12-CD-5678", vehicleName: "Trailer 20T", source: "Pune, MH", destination: "Nashik, MH", cargoDescription: "Auto Parts", cargoWeight: "8000 kg", dispatchDate: "2024-03-15", dispatchTime: "08:30 AM", dispatcher: "John Dispatcher", tripStatus: "on_trip" as any, expectedDelivery: "01:15 PM", distance: "210 km", estimatedRevenue: "₹12,000", remarks: "All good" },
  ];

  await prisma.dispatch.deleteMany({});
  for (const d of dispatches) {
    // Need to look up real driverId and vehicleId UUIDs if we want to relate them properly.
    // Wait, driverId and vehicleId in Dispatch are String references to driverId / vehicleId strings, not the UUIDs.
    await prisma.dispatch.create({ data: d });
  }
  console.log("Dispatches seeded.");

  // Seed Maintenance Records
  const maintenance = [
    { maintenanceId: "MNT-401", vehicleId: "V-004", vehicle: "MH-12-GH-3456", type: "Corrective" as any, description: "Engine overheating issue", status: "in_maintenance" as any, priority: "High" as any, scheduledDate: "2024-03-16", completedDate: "-", cost: "₹4500", technician: "Rajesh Auto" },
  ];

  await prisma.maintenanceRecord.deleteMany({});
  for (const m of maintenance) {
    await prisma.maintenanceRecord.create({ data: m });
  }
  console.log("Maintenance seeded.");

  // Seed Fuel Records
  const fuels = [
    { fuelId: "FUL-2201", vehicleId: "V-002", vehicle: "MH-12-CD-5678", date: "2024-03-15", station: "HP Highway Pump", fuelType: "Diesel" as any, quantity: "150", rate: "92.5", amount: "13875", odometer: "119850", driverId: "DRV-002", driver: "Ravi Kumar" }
  ];

  await prisma.fuelRecord.deleteMany({});
  for (const f of fuels) {
    await prisma.fuelRecord.create({ data: f });
  }
  console.log("Fuel records seeded.");

  console.log("Database Seeding Completed Successfully!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
