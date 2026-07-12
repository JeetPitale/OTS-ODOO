"use client";

import { Header, StatusBadge, DataTable, type ColumnDef } from "@/components/shared";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Settings,
  Shield,
  Users,
  Bell,
  Plus,
  Filter,
  Edit,
  Trash2,
  Crown,
} from "lucide-react";
import type { StatusVariant } from "@/lib/status-colors";

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  status: StatusVariant;
  lastLogin: string;
  department: string;
}

const users: User[] = [
  { id: "USR-001", name: "John Doe", email: "john.doe@roadkings.com", role: "Super Admin", status: "active", lastLogin: "2025-01-08 09:30", department: "Management" },
  { id: "USR-002", name: "Priya Sharma", email: "priya.s@roadkings.com", role: "Fleet Manager", status: "active", lastLogin: "2025-01-08 08:45", department: "Operations" },
  { id: "USR-003", name: "Rahul Verma", email: "rahul.v@roadkings.com", role: "Dispatcher", status: "active", lastLogin: "2025-01-07 17:20", department: "Operations" },
  { id: "USR-004", name: "Ananya Patel", email: "ananya.p@roadkings.com", role: "Accounts", status: "active", lastLogin: "2025-01-08 10:05", department: "Finance" },
  { id: "USR-005", name: "Vikram Joshi", email: "vikram.j@roadkings.com", role: "Mechanic Lead", status: "off-duty", lastLogin: "2025-01-06 14:30", department: "Maintenance" },
  { id: "USR-006", name: "Sneha Kulkarni", email: "sneha.k@roadkings.com", role: "HR Manager", status: "active", lastLogin: "2025-01-08 09:00", department: "HR" },
  { id: "USR-007", name: "Old User", email: "old@roadkings.com", role: "Viewer", status: "suspended", lastLogin: "2024-10-15 11:00", department: "External" },
];

interface RoleConfig {
  name: string;
  description: string;
  users: number;
  permissions: string[];
}

const roles: RoleConfig[] = [
  {
    name: "Super Admin",
    description: "Full access to all modules and settings",
    users: 1,
    permissions: ["All Modules", "User Management", "RBAC", "Billing", "API Keys"],
  },
  {
    name: "Fleet Manager",
    description: "Manage vehicles, drivers, trips, and maintenance",
    users: 3,
    permissions: ["Vehicles", "Drivers", "Trips", "Maintenance", "Reports"],
  },
  {
    name: "Dispatcher",
    description: "Create and manage trip dispatches",
    users: 5,
    permissions: ["Trips (Full)", "Vehicles (Read)", "Drivers (Read)"],
  },
  {
    name: "Accounts",
    description: "Manage fuel, expenses, and financial reports",
    users: 2,
    permissions: ["Fuel & Expenses", "Reports", "Invoicing"],
  },
  {
    name: "Viewer",
    description: "Read-only access to dashboards and reports",
    users: 8,
    permissions: ["Dashboard (Read)", "Reports (Read)"],
  },
];

const userColumns: ColumnDef<User>[] = [
  { header: "Name", accessorKey: "name", sortable: true },
  { header: "Email", accessorKey: "email" },
  {
    header: "Role",
    accessorKey: "role",
    cell: (row) => (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-xs font-semibold bg-primary/10 text-primary">
        <Shield className="h-3 w-3" />
        {row.role}
      </span>
    ),
  },
  { header: "Department", accessorKey: "department" },
  {
    header: "Status",
    accessorKey: "status",
    cell: (row) => <StatusBadge variant={row.status} />,
  },
  { header: "Last Login", accessorKey: "lastLogin", sortable: true },
  {
    header: "Actions",
    accessorKey: "id",
    cell: () => (
      <div className="flex items-center gap-1">
        <Button variant="ghost" size="icon" className="h-7 w-7">
          <Edit className="h-3.5 w-3.5" />
        </Button>
        <Button variant="ghost" size="icon" className="h-7 w-7 text-red-500 hover:text-red-700">
          <Trash2 className="h-3.5 w-3.5" />
        </Button>
      </div>
    ),
  },
];

export default function SettingsPage() {
  return (
    <>
      <Header title="Settings & RBAC" subtitle="System configuration and access control" />
      <div className="p-6 space-y-6">
        <Tabs defaultValue="general" className="space-y-4">
          <TabsList className="rounded-lg">
            <TabsTrigger value="general" className="text-xs gap-1">
              <Settings className="h-3.5 w-3.5" /> General
            </TabsTrigger>
            <TabsTrigger value="users" className="text-xs gap-1">
              <Users className="h-3.5 w-3.5" /> Users
            </TabsTrigger>
            <TabsTrigger value="roles" className="text-xs gap-1">
              <Shield className="h-3.5 w-3.5" /> Roles & Permissions
            </TabsTrigger>
            <TabsTrigger value="notifications" className="text-xs gap-1">
              <Bell className="h-3.5 w-3.5" /> Notifications
            </TabsTrigger>
          </TabsList>

          {/* General */}
          <TabsContent value="general" className="space-y-4">
            <Card className="rounded-xl ambient-shadow border-0">
              <CardHeader className="pb-4">
                <CardTitle className="text-sm font-semibold">Organization Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Organization Name</Label>
                    <Input defaultValue="RoadKings Logistics Pvt Ltd" className="rounded-lg" />
                  </div>
                  <div className="space-y-2">
                    <Label>Primary Contact</Label>
                    <Input defaultValue="+91 22 2456 7890" className="rounded-lg" />
                  </div>
                  <div className="space-y-2">
                    <Label>GST Number</Label>
                    <Input defaultValue="27AABCR1234F1Z5" className="rounded-lg" />
                  </div>
                  <div className="space-y-2">
                    <Label>Timezone</Label>
                    <Input defaultValue="Asia/Kolkata (IST)" className="rounded-lg" />
                  </div>
                </div>
                <Separator />
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium">Dark Mode</p>
                    <p className="text-xs text-muted-foreground">Toggle dark mode across the application</p>
                  </div>
                  <Switch />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium">Auto-assign Drivers</p>
                    <p className="text-xs text-muted-foreground">Automatically assign nearest available driver to new trips</p>
                  </div>
                  <Switch defaultChecked />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium">Maintenance Reminders</p>
                    <p className="text-xs text-muted-foreground">Send SMS and email alerts for upcoming service dates</p>
                  </div>
                  <Switch defaultChecked />
                </div>
                <Button className="bg-primary hover:bg-primary/90 text-white rounded-lg">
                  Save Changes
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Users */}
          <TabsContent value="users" className="space-y-4">
            <Card className="rounded-xl ambient-shadow border-0">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-semibold">User Management</CardTitle>
                <div className="flex items-center gap-2">
                  <Button variant="outline" size="sm" className="h-8 rounded-lg text-xs gap-1">
                    <Filter className="h-3.5 w-3.5" /> Filter
                  </Button>
                  <Button size="sm" className="h-8 rounded-lg text-xs gap-1 bg-primary hover:bg-primary/90 text-white">
                    <Plus className="h-3.5 w-3.5" /> Invite User
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <DataTable
                  columns={userColumns}
                  data={users}
                  searchKey="name"
                  searchPlaceholder="Search users..."
                />
              </CardContent>
            </Card>
          </TabsContent>

          {/* Roles & Permissions */}
          <TabsContent value="roles" className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-semibold">Roles & Permissions</h3>
                <p className="text-xs text-muted-foreground">Configure access levels for different user roles</p>
              </div>
              <Button size="sm" className="h-8 rounded-lg text-xs gap-1 bg-primary hover:bg-primary/90 text-white">
                <Plus className="h-3.5 w-3.5" /> Create Role
              </Button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {roles.map((role) => (
                <Card key={role.name} className="rounded-xl ambient-shadow border-0">
                  <CardContent className="p-5">
                    <div className="flex items-center gap-2 mb-3">
                      <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center">
                        <Crown className="h-4 w-4 text-primary" />
                      </div>
                      <div>
                        <h4 className="text-sm font-semibold">{role.name}</h4>
                        <p className="text-xs text-muted-foreground">
                          {role.users} user{role.users > 1 ? "s" : ""}
                        </p>
                      </div>
                    </div>
                    <p className="text-xs text-muted-foreground mb-3">
                      {role.description}
                    </p>
                    <div className="flex flex-wrap gap-1.5">
                      {role.permissions.map((perm) => (
                        <span
                          key={perm}
                          className="text-[10px] px-2 py-0.5 rounded-full bg-muted text-muted-foreground font-medium"
                        >
                          {perm}
                        </span>
                      ))}
                    </div>
                    <div className="flex items-center gap-2 mt-4">
                      <Button variant="outline" size="sm" className="h-7 text-xs rounded-md flex-1 gap-1">
                        <Edit className="h-3 w-3" /> Edit
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Notifications */}
          <TabsContent value="notifications" className="space-y-4">
            <Card className="rounded-xl ambient-shadow border-0">
              <CardHeader className="pb-4">
                <CardTitle className="text-sm font-semibold">Notification Preferences</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {[
                  { title: "Trip Alerts", desc: "Get notified when a trip is delayed, completed, or cancelled", email: true, sms: true, push: true },
                  { title: "Maintenance Reminders", desc: "Alerts for upcoming and overdue service dates", email: true, sms: false, push: true },
                  { title: "Driver Safety Alerts", desc: "Speed violations, harsh braking, and incident reports", email: true, sms: true, push: true },
                  { title: "Fuel Anomalies", desc: "Unusual fuel consumption or declined fuel cards", email: true, sms: false, push: false },
                  { title: "System Updates", desc: "New features, maintenance windows, and announcements", email: true, sms: false, push: false },
                ].map((pref) => (
                  <div key={pref.title} className="flex items-center justify-between py-3 border-b border-border last:border-0">
                    <div>
                      <p className="text-sm font-medium">{pref.title}</p>
                      <p className="text-xs text-muted-foreground">{pref.desc}</p>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-1.5">
                        <span className="text-[10px] text-muted-foreground">Email</span>
                        <Switch defaultChecked={pref.email} />
                      </div>
                      <div className="flex items-center gap-1.5">
                        <span className="text-[10px] text-muted-foreground">SMS</span>
                        <Switch defaultChecked={pref.sms} />
                      </div>
                      <div className="flex items-center gap-1.5">
                        <span className="text-[10px] text-muted-foreground">Push</span>
                        <Switch defaultChecked={pref.push} />
                      </div>
                    </div>
                  </div>
                ))}
                <Button className="bg-primary hover:bg-primary/90 text-white rounded-lg">
                  Save Preferences
                </Button>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </>
  );
}
