"use client";

import { type LucideIcon } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

interface KpiCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: LucideIcon;
  trend?: {
    value: string;
    direction: "up" | "down" | "neutral";
  };
  iconBgClass?: string;
}

export function KpiCard({
  title,
  value,
  subtitle,
  icon: Icon,
  trend,
  iconBgClass = "bg-primary/10",
}: KpiCardProps) {
  return (
    <Card className="rounded-xl ambient-shadow border-0">
      <CardContent className="p-5">
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <p className="text-sm font-medium text-muted-foreground">{title}</p>
            <p className="text-2xl font-bold tracking-tight">{value}</p>
            {subtitle && (
              <p className="text-xs text-muted-foreground">{subtitle}</p>
            )}
            {trend && (
              <p
                className={`text-xs font-medium ${
                  trend.direction === "up"
                    ? "text-emerald-600"
                    : trend.direction === "down"
                    ? "text-red-600"
                    : "text-muted-foreground"
                }`}
              >
                {trend.direction === "up"
                  ? "↑"
                  : trend.direction === "down"
                  ? "↓"
                  : "→"}{" "}
                {trend.value}
              </p>
            )}
          </div>
          <div
            className={`p-2.5 rounded-xl ${iconBgClass}`}
          >
            <Icon className="h-5 w-5 text-primary" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
