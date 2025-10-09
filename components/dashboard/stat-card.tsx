"use client";

import { LucideIcon } from "lucide-react";
import { TrendingUp, TrendingDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { useCounterAnimation } from "@/hooks/use-counter-animation";
import { useEffect, useState } from "react";

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
  index?: number;
}

export function StatCard({
  title,
  value,
  trend,
  icon: Icon,
  iconColor = "text-blue-500",
  loading = false,
  index = 0,
}: StatCardProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Check if value is a number (for animation)
  const numericValue = typeof value === 'number' ? value : 
    (typeof value === 'string' && !isNaN(parseFloat(value.replace(/[^0-9.-]/g, ''))) 
      ? parseFloat(value.replace(/[^0-9.-]/g, '')) 
      : null);

  const animatedValue = useCounterAnimation(
    mounted && numericValue !== null ? numericValue : 0, 
    1200 + (index * 200)
  );

  // Format the animated value back to string if original was formatted
  const displayValue = numericValue !== null && typeof value === 'string'
    ? value.replace(/[\d,\.]+/, animatedValue.toString())
    : (numericValue !== null ? animatedValue : value);
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
    <div 
      className="stat-card hover-lift group cursor-pointer opacity-0 animate-fade-in-up min-w-0"
      style={{ 
        animationDelay: `${index * 100}ms`,
        animationFillMode: 'forwards'
      }}
    >
      {/* Content */}
      <div className="flex items-center justify-between w-full">
        <div className="space-y-1 flex-1 min-w-0">
          <p className="text-sm font-medium text-gray-600 whitespace-nowrap">
            {title}
          </p>
          <h3 className="text-3xl font-semibold tracking-tight text-gray-900 whitespace-nowrap">
            {displayValue}
          </h3>
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
                  "text-xs font-medium",
                  trend.isPositive ? "text-green-600" : "text-red-600"
                )}
              >
                {trend.value}
              </span>
            </div>
          )}
        </div>
        {Icon && (
          <div className={cn(
            "flex-shrink-0 w-[52px] h-[52px] flex items-center justify-center rounded-xl bg-blue-50 transition-transform group-hover:scale-110",
            iconColor
          )}>
            <Icon className="h-6 w-6" />
          </div>
        )}
      </div>
    </div>
  );
}
