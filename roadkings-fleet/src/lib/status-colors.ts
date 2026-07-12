export type StatusVariant =
  | "on-trip"
  | "active"
  | "available"
  | "completed"
  | "in-shop"
  | "in-maintenance"
  | "warning"
  | "scheduled"
  | "draft"
  | "off-duty"
  | "retired"
  | "suspended"
  | "cancelled"
  | "critical"
  | "pending";

export interface StatusColorConfig {
  bg: string;
  text: string;
  dot: string;
  border: string;
}

export const statusColors: Record<StatusVariant, StatusColorConfig> = {
  "on-trip": {
    bg: "bg-blue-50",
    text: "text-blue-700",
    dot: "bg-blue-500",
    border: "border-blue-200",
  },
  active: {
    bg: "bg-blue-50",
    text: "text-blue-700",
    dot: "bg-blue-500",
    border: "border-blue-200",
  },
  available: {
    bg: "bg-emerald-50",
    text: "text-emerald-700",
    dot: "bg-emerald-500",
    border: "border-emerald-200",
  },
  completed: {
    bg: "bg-emerald-50",
    text: "text-emerald-700",
    dot: "bg-emerald-500",
    border: "border-emerald-200",
  },
  "in-shop": {
    bg: "bg-orange-50",
    text: "text-orange-700",
    dot: "bg-orange-500",
    border: "border-orange-200",
  },
  "in-maintenance": {
    bg: "bg-orange-50",
    text: "text-orange-700",
    dot: "bg-orange-500",
    border: "border-orange-200",
  },
  warning: {
    bg: "bg-yellow-50",
    text: "text-yellow-700",
    dot: "bg-yellow-500",
    border: "border-yellow-200",
  },
  scheduled: {
    bg: "bg-slate-100",
    text: "text-slate-600",
    dot: "bg-slate-400",
    border: "border-slate-200",
  },
  draft: {
    bg: "bg-gray-100",
    text: "text-gray-600",
    dot: "bg-gray-400",
    border: "border-gray-200",
  },
  "off-duty": {
    bg: "bg-gray-100",
    text: "text-gray-600",
    dot: "bg-gray-400",
    border: "border-gray-200",
  },
  retired: {
    bg: "bg-gray-100",
    text: "text-gray-600",
    dot: "bg-gray-400",
    border: "border-gray-200",
  },
  suspended: {
    bg: "bg-red-50",
    text: "text-red-700",
    dot: "bg-red-500",
    border: "border-red-200",
  },
  cancelled: {
    bg: "bg-red-50",
    text: "text-red-700",
    dot: "bg-red-500",
    border: "border-red-200",
  },
  critical: {
    bg: "bg-red-50",
    text: "text-red-700",
    dot: "bg-red-500",
    border: "border-red-200",
  },
  pending: {
    bg: "bg-amber-50",
    text: "text-amber-700",
    dot: "bg-amber-500",
    border: "border-amber-200",
  },
};

export function getStatusLabel(variant: StatusVariant): string {
  const labels: Record<StatusVariant, string> = {
    "on-trip": "On Trip",
    active: "Active",
    available: "Available",
    completed: "Completed",
    "in-shop": "In Shop",
    "in-maintenance": "In Maintenance",
    warning: "Warning",
    scheduled: "Scheduled",
    draft: "Draft",
    "off-duty": "Off Duty",
    retired: "Retired",
    suspended: "Suspended",
    cancelled: "Cancelled",
    critical: "Critical",
    pending: "Pending",
  };
  return labels[variant];
}
