"use client";

import { LucideIcon } from "lucide-react";
import { TrendingUp, TrendingDown } from "lucide-react";
import { cn } from "@/lib/utils";

interface StatCardProps {
  title: string;
  value: string | number;
  trend?: {
    value: string;
    isPositive: boolean;
  };
  icon?: LucideIcon;
  iconColor?: string;
  loading?: boolean;
}

export function StatCard({
  title,
  value,
  trend,
  icon: Icon,
  iconColor = "text-blue-500",
  loading = false,
}: StatCardProps) {
  if (loading) {
    return (
      <div className="stat-card">
        <div className="space-y-3">
          <div className="h-4 w-24 skeleton rounded" />
          <div className="h-10 w-32 skeleton rounded" />
          <div className="h-4 w-20 skeleton rounded" />
        </div>
      </div>
    );
  }

  return (
    <div className="stat-card group cursor-pointer">
      {/* Header: Title + Icon */}
      <div className="flex items-center justify-between mb-3">
        <p className="text-[13px] font-medium text-gray-500 uppercase tracking-wide">
          {title}
        </p>
        {Icon && (
          <div className={cn("transition-transform group-hover:scale-110", iconColor)}>
            <Icon className="h-5 w-5" />
          </div>
        )}
      </div>

      {/* Value - Large & Bold */}
      <div className="mb-2">
        <h3 className="text-[32px] font-semibold text-gray-900 leading-none tracking-tight">
          {value}
        </h3>
      </div>

      {/* Trend Indicator */}
      {trend && (
        <div className="flex items-center gap-1.5">
          {trend.isPositive ? (
            <TrendingUp className="h-4 w-4 text-green-500" />
          ) : (
            <TrendingDown className="h-4 w-4 text-red-500" />
          )}
          <span
            className={cn(
              "text-[13px] font-medium",
              trend.isPositive ? "text-green-600" : "text-red-600"
            )}
          >
            {trend.value}
          </span>
        </div>
      )}
    </div>
  );
}
