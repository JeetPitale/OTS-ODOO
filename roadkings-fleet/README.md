# 🚛 RoadKings Fleet & Dispatch Management System - Web Client

A state-of-the-art Next.js web application built with TypeScript, React, and Tailwind CSS. This project serves as the primary control center and operational frontend for the **RoadKings Logistics & Fleet operations**, enabling real-time dispatch management, fleet tracking, driver check-in/check-out, maintenance scheduling, and comprehensive reporting.

---

## 📖 Table of Contents
1. [Key Features](#-key-features)
2. [Tech Stack & Architecture](#-tech-stack--architecture)
3. [Folder Structure](#-folder-structure)
4. [Component Architecture](#-component-architecture)
5. [Getting Started & Local Setup](#-getting-started--local-setup)
6. [Authentication & Role-Based Access Control (RBAC)](#-authentication--role-based-access-control-rbac)
7. [Database & Persistence Schema](#-database--persistence-schema)
8. [Available Scripts](#-available-scripts)
9. [Screenshots & Interactive Demos](#-screenshots--interactive-demos)

---

## 🌟 Key Features

The frontend application provides a modular, interactive system tailored to logistics managers, dispatchers, drivers, and safety officers:

### 1. Unified Control Panels
* **Main Dashboard**: High-level KPIs including active trips, fuel metrics (MTD), and active maintenance vehicles.
* **Dispatch Dashboard**: Specialized cockpit for dispatchers to see live driver queues, vehicle allocation, and dispatch throughput.
* **Smart Dispatch Flow**: Multi-step wizard to create dispatches with automatic validation of driver/vehicle compatibility and cargo weight constraints.

### 2. Dispatch Tracking & Queueing
* **Active Dispatches**: Map and grid list monitoring current status, destination coordinates, and estimated arrival times (ETA).
* **Dispatch Queue**: Manage pending customer orders waiting for assignable trucks/drivers.
* **Dispatch History**: Immutable list of completed and cancelled dispatches with detailed audit logs (distance travelled, odometer tracking, and fuel consumed).

### 3. Smart QR Verification
* **QR Dispatch Passes**: Generates secure, unique QR codes encoded with trip, vehicle, and cargo details.
* **QR Verification Scanner**: Utilizes `html5-qrcode` to scan digital/printed passes at security checkpoints to verify cargo legitimacy.
* **QR Manager**: Centralized interface to download QR payloads as PNGs or print dispatch passes directly.

### 4. Fleet & Asset Management
* **Drivers Catalog**: Detail views showing safety ratings, licenses, and availability statuses.
* **Vehicles Inventory**: Track vehicle health metrics, odometer readings, and current statuses.
* **Fuel Logging**: Record diesel consumption and log fuel cards for cost estimation.
* **Maintenance Scheduler**: Oversee preventive maintenance tasks and record scheduled repairs.

---

## 🛠️ Tech Stack & Architecture

The application is structured to deliver peak performance, scalability, and type safety:

* **Framework**: [Next.js v14.2](https://nextjs.org/) utilizing the modern **App Router** pattern for optimized page rendering, layout persistence, and API route handling.
* **Styling**: [Tailwind CSS](https://tailwindcss.com/) for fluid responsive designs coupled with [Lucide React](https://lucide.dev/) for icon typography.
* **Components**: Structured on top of **Shadcn UI** library primitives (built on Radix UI).
* **Database Access**: [Prisma ORM](https://www.prisma.io/) acting as a type-safe layer over a local [SQLite](https://sqlite.org/) database.
* **Authentication**: [NextAuth.js v5 (Beta)](https://next-auth.js.org/) for session authentication and middleware-based role guards.
* **State & Local Storage**: Custom local storage hooks (`lib/storage.ts`) supporting synchronization across multi-tabs for real-time local operation capability.

---

## 📁 Folder Structure

Below is an overview of the key folders and files inside `roadkings-fleet/`:

```
roadkings-fleet/
├── prisma/
│   ├── schema.prisma           # SQLite Database models
│   ├── seed.ts                 # Database seed script for mock users, vehicles & drivers
│   └── dev.db                  # Local SQLite Database
├── src/
│   ├── app/                    # Next.js App Router root
│   │   ├── (dashboard)/        # Authenticated pages group (dashboard, smart-dispatch, etc.)
│   │   │   ├── active-dispatches/
│   │   │   ├── dispatch-dashboard/
│   │   │   ├── dispatch-history/
│   │   │   ├── drivers/
│   │   │   ├── smart-dispatch/
│   │   │   └── ...
│   │   ├── api/                # NextAuth session verification APIs
│   │   ├── login/              # Login screen page router
│   │   └── verify-dispatch/    # Scanner verification page router
│   ├── components/             # Reusable UI component library
│   │   ├── ui/                 # Shadcn base elements (buttons, inputs, cards)
│   │   └── shared/             # Project-wide wrappers (Headers, Navigation bar, StatusBadges)
│   ├── lib/                    # Storage controllers, auth keys, and constants
│   ├── types/                  # Shared TypeScript interface definitions
│   └── middleware.ts           # Route guards, role-based protection
├── package.json                # Project configurations & dependency tree
├── tailwind.config.ts          # Custom color palettes & Tailwind configuration
└── tsconfig.json               # TypeScript configuration parameters
```

---

## 🧩 Component Architecture

Key components located in `src/components/` designed to keep the application modular and maintainable:

* **`StatusBadge`** (`src/components/shared/status-badge.tsx`): Map status codes (e.g. `on-trip`, `available`, `in-shop`, `completed`, `cancelled`) to appropriate Tailwind styling and custom indicator colors using the `StatusVariant` mapping type.
* **`Header`** (`src/components/shared/header.tsx`): Contextual page header containing the page title, subtitle, and actions (e.g., creating a new dispatch, printing records).
* **`Sidebar`** (`src/components/shared/sidebar.tsx`): Persistent left navigation panel, which adjusts items dynamically depending on the authenticated user's role permissions.

---

## 🚀 Getting Started & Local Setup

### Prerequisites
* **Node.js**: `v18.x` or higher
* **npm**: `v9.x` or higher

### Installation

1. **Clone the repository and enter the folder**:
   ```bash
   cd roadkings-fleet
   ```

2. **Install project dependencies**:
   ```bash
   npm install
   ```

3. **Configure Environment Variables**:
   Create a `.env` file in the root of the `roadkings-fleet/` folder:
   ```env
   AUTH_SECRET="roadkings_super_secret_key_1234567890_abcdef"
   ```

4. **Prepare Database schemas**:
   ```bash
   npx prisma generate
   npx prisma migrate dev --name init
   npx prisma db seed
   ```

5. **Start Development Server**:
   ```bash
   npm run dev
   ```
   Open your browser to [http://localhost:3000](http://localhost:3000).

---

## 🔑 Authentication & Role-Based Access Control (RBAC)

NextAuth is combined with Next.js Middleware in [middleware.ts](file:///d:/OTS-ODOO/roadkings-fleet/src/middleware.ts) to protect all pages:

* **Protected Paths**: All routes under `(dashboard)/` require a valid session.
* **Role Redirection**: Based on user roles, navigation is filtered dynamically:
  * **System Admin / Managers**: Full read/write capabilities across all modules.
  * **Dispatch Managers / Operators**: Access restricted to dispatching, QR generation, queues, notifications, and shift summaries. Trying to access fleet configurations, billing, or general system settings will redirect them automatically to their respective Dashboard.
* **Mock Accounts**:
  * **Admin**: `admin@roadkings.com` (password: `password123`)
  * **Manager**: `manager@roadkings.com` (password: `password123`)
  * **Dispatcher**: `dispatcher@roadkings.com` (password: `password123`)
  * **Finance**: `finance@roadkings.com` (password: `password123`)

---

## 💾 Database & Persistence Schema

Prisma models represent logistics assets and operational entities:

* **Driver**: Tracks license category, license expiration, safety score, availability status (`StatusVariant`), and total trips.
* **Vehicle**: Tracks registration number, manufacturer details, vehicle type, current status, mileage, and scheduled service dates.
* **Trip**: Live trip statuses, routing coordinates, ETA forecasts, and financial metadata.
* **DispatchRecord**: Detailed audit record mapping drivers to vehicles, containing cargo logs, QR signatures, odometer captures, and fuel utilization statistics.

---

## ⚙️ Available Scripts

Run these scripts from the `roadkings-fleet` root directory:

* `npm run dev`: Boot up Next.js dev server with hot-reload support.
* `npm run build`: Compile and build optimized production bundle.
* `npm run start`: Launch production Next.js server.
* `npm run lint`: Run ESLint analysis.
* `npx tsc --noEmit`: Execute comprehensive TypeScript compilation and type checks.

---

## 📸 Screenshots & Interactive Demos

### 🔐 Secure Login Portal
Here is a capture of the main authentication interface designed for the logistics team:

![Secure Login Interface](/C:/Users/Admin/.gemini/antigravity-ide/brain/20049c3d-76ab-4662-8a01-ab5781cee221/login_page_1783854669512.png)

### 📊 Operations Dashboard
The main operational cockpit displaying high-level KPIs, vehicle status, and live alerts:

![Operations Dashboard](/C:/Users/Admin/.gemini/antigravity-ide/brain/20049c3d-76ab-4662-8a01-ab5781cee221/dashboard_page_1783854747061.png)

### 🎥 Interactive Login & Navigation Demo
Watch the full sequence showing the login process and navigation to the operations dashboard:

![Interactive Login Flow Demo](/C:/Users/Admin/.gemini/antigravity-ide/brain/20049c3d-76ab-4662-8a01-ab5781cee221/login_flow_demo_1783854577335.webp)
