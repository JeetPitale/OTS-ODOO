# RoadKings Fleet & Dispatch Management System

A comprehensive, modern fleet management and dispatch coordination platform designed for logistics operations. The project is built using a modern React/Next.js stack, styled with Tailwind CSS, and uses Prisma with SQLite for persistent data storage.

---

## 🚀 Features

The application provides a feature-rich, interactive dashboard tailored for different organizational roles:

### 1. Dashboards & Analytics
* **Main Dashboard**: High-level KPI overview (Total Vehicles, Active Trips, Active Drivers, Fuel Cost MTD), real-time alerts, weekly fuel cost trends, and active trip maps.
* **Dispatch Dashboard**: Custom control center optimized for dispatch operations.
* **Smart Dispatch**: Advanced dispatching flow with automated route planning and coordination.

### 2. Dispatch & Trip Coordination
* **Active Dispatches**: Monitoring live dispatches currently on the road.
* **Dispatch Queue**: Queue of pending orders awaiting assignment.
* **Dispatch History**: Complete log of all past trips, routes, and outcomes.
* **Trip Monitoring**: Real-time tracking of trip progress and ETA updates.

### 3. QR Dispatch Management
* **QR Verification**: Dispatch verification system utilizing QR code scans to confirm dispatches.
* **QR Management**: Generate and manage QR codes linked to dispatches and vehicles.

### 4. Fleet & Asset Management
* **Vehicles**: Comprehensive vehicle listing, maintenance logs, and usage statuses.
* **Drivers**: Driver profiles, duty logs, and availability statuses.
* **Fuel Tracking**: Diesel and petrol consumption logs, fuel card monitoring, and expense trends.
* **Maintenance**: Fleet maintenance scheduling, service records, and service overdue alerts.

### 5. Shift & Financial Management
* **Shift Summary**: Daily shift logs, handover details, and operation metrics.
* **Reports & Analytics**: Visual charts for volume, revenue trends, and operational efficiency.

---

## 🛠️ Tech Stack

* **Framework**: [Next.js](https://nextjs.org/) (v14.2.35) using App Router
* **Database & ORM**: [Prisma ORM](https://www.prisma.io/) with a [SQLite](https://www.sqlite.org/) local database
* **Authentication**: [NextAuth.js](https://next-auth.js.org/) (v5 Beta)
* **Styling & UI**: [Tailwind CSS](https://tailwindcss.com/), [Lucide React](https://lucide.dev/) (Icons), [Framer Motion](https://www.framer.com/motion/) (Animations), and [Shadcn UI](https://ui.shadcn.com/)
* **Charts**: [Recharts](https://recharts.org/)
* **QR Processing**: `html5-qrcode` & `qrcode.react`

---

## 📁 Repository Structure

```
d:/OTS-ODOO/
├── roadkings-fleet/          # Main Next.js application
│   ├── src/
│   │   ├── app/              # Next.js App Router (Layouts, API routes, Pages)
│   │   │   ├── (dashboard)/  # Authenticated workspace directories & layouts
│   │   │   ├── api/          # NextAuth API handlers and endpoints
│   │   │   ├── login/        # User authentication UI
│   │   │   └── verify-dispatch/
│   │   ├── components/       # Custom React components (UI components, shared layouts)
│   │   ├── lib/              # Auth configuration, database utilities, and local storage access
│   │   ├── types/            # TypeScript interface definitions
│   │   └── middleware.ts     # NextAuth route protection and role-based guards
│   ├── prisma/
│   │   ├── schema.prisma     # SQLite schema definitions
│   │   ├── seed.ts           # Seed script with mock user roles
│   │   └── dev.db            # SQLite local database
│   ├── package.json          # Node dependencies and build scripts
│   └── tailwind.config.ts    # Custom Tailwind styling configuration
└── README.md                 # Project README documentation (this file)
```

---

## ⚙️ Getting Started

Follow these steps to run the application locally:

### Prerequisites

* [Node.js](https://nodejs.org/) (v18 or higher recommended)
* npm (comes with Node.js)

### Installation & Setup

1. **Navigate to the application folder**:
   ```powershell
   cd roadkings-fleet
   ```

2. **Install dependencies**:
   ```powershell
   npm install
   ```

3. **Configure Environment Variables**:
   Create a `.env` file in the root of the `roadkings-fleet/` directory (or use the preconfigured one):
   ```env
   AUTH_SECRET="roadkings_super_secret_key_1234567890_abcdef"
   ```

4. **Initialize and Seed the Database**:
   Generate the Prisma Client and seed the SQLite database with mock users:
   ```powershell
   npx prisma generate
   npx prisma migrate dev --name init
   npx prisma db seed
   ```

5. **Run the Development Server**:
   ```powershell
   npm run dev
   ```
   Open [http://localhost:3000](http://localhost:3000) in your browser to view the application.

---

## 🔑 Mock User Accounts & Roles

The seed script creates the following user accounts. You can use these to log in and test different interface views and permissions:

| Name | Email | Password | Role |
| :--- | :--- | :--- | :--- |
| **System Admin** | `admin@roadkings.com` | `password123` | `ADMIN` |
| **John Manager** | `manager@roadkings.com` | `password123` | `FLEET_MANAGER` |
| **Rahul Dispatcher** | `dispatcher@roadkings.com` | `password123` | `DISPATCHER` |
| **Pradeep Safety** | `safety@roadkings.com` | `password123` | `SAFETY_OFFICER` |
| **Ananya Finance** | `finance@roadkings.com` | `password123` | `FINANCIAL_ANALYST` |
| **Dispatch Operator** | `operator@roadkings.com` | `password123` | `DISPATCH_OPERATOR` |
| **John Dispatch Manager** | `dispatchmanager@roadkings.com` | `password123` | `DISPATCH_MANAGER` |

---

## 🔒 Route Guards & Access Control

The app implements role-based access control inside [middleware.ts](file:///d:/OTS-ODOO/roadkings-fleet/src/middleware.ts):
* **Unauthenticated Access**: All pages (except `/login` and auth APIs) redirect to the login screen.
* **Dispatch Managers**: Restricted access to dispatch-oriented workflows (e.g. `/dispatch-dashboard`, `/smart-dispatch`, `/qr-management`, `/dispatch-queue`, `/active-dispatches`, `/dispatch-history`, `/qr-verification`, `/notifications`, `/shift-summary`, `/profile`). Attempting to visit other pages redirects back to the Dispatch Dashboard.
* **Settings Access**: Only users with roles `FLEET_MANAGER` or `FINANCIAL_ANALYST` are permitted to view the settings.