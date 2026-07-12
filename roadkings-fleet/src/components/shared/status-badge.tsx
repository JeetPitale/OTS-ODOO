"use client";

import { statusColors, getStatusLabel, type StatusVariant } from "@/lib/status-colors";

interface StatusBadgeProps {
  variant: StatusVariant;
  label?: string;
}

export function StatusBadge({ variant, label }: StatusBadgeProps) {
  const colors = statusColors[variant];
  const displayLabel = label ?? getStatusLabel(variant);

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border ${colors.bg} ${colors.text} ${colors.border}`}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${colors.dot}`} />
      {displayLabel}
    </span>
  );
}
