"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Truck,
  Users,
  Route,
  Wrench,
  Fuel,
  BarChart3,
  Settings,
  Crown,
  LogOut,
  QrCode,
  ListTodo,
  FileSpreadsheet,
  Activity,
  History,
  CheckSquare,
  Bell,
  Clock,
  User,
} from "lucide-react";
import { signOut } from "next-auth/react";

const navItems = [
  { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { label: "Vehicle Registry", href: "/vehicles", icon: Truck },
  { label: "Drivers & Safety", href: "/drivers", icon: Users },
  { label: "Trip Dispatch", href: "/trips", icon: Route },
  { label: "Smart Dispatch", href: "/smart-dispatch", icon: QrCode },
  { label: "Maintenance", href: "/maintenance", icon: Wrench },
  { label: "Fuel & Expenses", href: "/fuel", icon: Fuel },
  { label: "Reports & Analytics", href: "/reports", icon: BarChart3 },
  { label: "Settings & RBAC", href: "/settings", icon: Settings },
];

const dispatchManagerNavItems = [
  { label: "Dashboard", href: "/dispatch-dashboard", icon: LayoutDashboard },
  { label: "Smart Dispatch", href: "/smart-dispatch", icon: QrCode },
  { label: "QR Management", href: "/qr-management", icon: FileSpreadsheet },
  { label: "Dispatch Queue", href: "/dispatch-queue", icon: ListTodo },
  { label: "Active Dispatches", href: "/active-dispatches", icon: Activity },
  { label: "Dispatch History", href: "/dispatch-history", icon: History },
  { label: "QR Verification", href: "/qr-verification", icon: CheckSquare },
  { label: "Notifications", href: "/notifications", icon: Bell },
  { label: "Shift Summary", href: "/shift-summary", icon: Clock },
  { label: "Profile", href: "/profile", icon: User },
];

interface SidebarProps {
  user?: {
    name?: string | null;
    email?: string | null;
    role?: string | null;
  };
}

const formatRole = (role?: string | null) => {
  if (!role) return "Fleet Manager";
  return role
    .split("_")
    .map((word) => word.charAt(0) + word.slice(1).toLowerCase())
    .join(" ");
};

export function Sidebar({ user }: SidebarProps) {
  const pathname = usePathname();

  const name = user?.name || "John Doe";
  const role = formatRole(user?.role);
  const initials = name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase() || "JD";

  // Check if role is DISPATCH_MANAGER
  const isDispatchManager = user?.role === "DISPATCH_MANAGER";
  const activeNavItems = isDispatchManager ? dispatchManagerNavItems : navItems;

  // RBAC filters for default sidebar links
  const filteredNavItems = activeNavItems.filter((item) => {
    if (isDispatchManager) return true; // Already filtered for Dispatch Manager
    
    // Only Admin and Dispatch Operator can access Smart Dispatch
    if (item.href === "/smart-dispatch") {
      return user?.role === "ADMIN" || user?.role === "DISPATCH_OPERATOR";
    }
    // Only Admin and Fleet Manager can see these administrative modules
    const adminOnlyModules = ["/dashboard", "/vehicles", "/drivers", "/trips", "/maintenance", "/fuel", "/reports", "/settings"];
    if (adminOnlyModules.includes(item.href)) {
      return user?.role === "ADMIN" || user?.role === "FLEET_MANAGER";
    }
    return true;
  });

  return (
    <aside className="w-[260px] h-screen bg-white border-r border-border flex flex-col fixed left-0 top-0 z-30">
      {/* Brand */}
      <div className="h-16 flex items-center gap-2.5 px-5 border-b border-border">
        <div className="h-9 w-9 rounded-xl bg-primary flex items-center justify-center">
          <Crown className="h-5 w-5 text-white" />
        </div>
        <div>
          <h1 className="text-base font-bold tracking-tight leading-none">
            Road<span className="text-primary">Kings</span>
          </h1>
          <p className="text-[10px] text-muted-foreground font-medium tracking-widest uppercase mt-1">
            {user?.role === "DISPATCH_MANAGER" 
              ? "Dispatch Manager" 
              : user?.role === "DISPATCH_OPERATOR" 
                ? "Dispatch Center" 
                : "Fleet Manager"}
          </p>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 py-4 px-3 space-y-0.5 overflow-y-auto">
        {filteredNavItems.map((item) => {
          const isActive =
            pathname === item.href || pathname.startsWith(item.href + "/");
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-150 ${
                isActive
                  ? "bg-primary text-white shadow-md shadow-primary/30"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
              }`}
            >
              <item.icon className="h-[18px] w-[18px] flex-shrink-0" />
              {item.label}
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="p-3 border-t border-border flex items-center justify-between">
        <div className="flex items-center gap-3 px-3 py-2 flex-1 min-w-0">
          <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-xs font-bold text-primary flex-shrink-0">
            {initials}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium truncate">{name}</p>
            <p className="text-xs text-muted-foreground truncate">{role}</p>
          </div>
        </div>
        <button
          onClick={() => signOut({ callbackUrl: "/login" })}
          className="p-2 text-muted-foreground hover:text-red-600 hover:bg-red-50 rounded-lg transition-all duration-150 flex-shrink-0"
          title="Sign Out"
        >
          <LogOut className="h-[18px] w-[18px]" />
        </button>
      </div>
    </aside>
  );
}
