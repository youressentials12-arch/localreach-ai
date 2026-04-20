import { cn } from "@/lib/utils";
import type { LucideIcon } from "lucide-react";

interface StatsCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon?: LucideIcon;
  trend?: { value: number; label: string };
  className?: string;
}

export default function StatsCard({
  title,
  value,
  subtitle,
  icon: Icon,
  trend,
  className,
}: StatsCardProps) {
  return (
    <div
      className={cn(
        "bg-[#16161d] border border-[#2a2a3d] rounded-xl p-4",
        className
      )}
    >
      <div className="flex items-start justify-between">
        <div className="flex-1 min-w-0">
          <p className="text-xs text-[#6b7280] font-medium uppercase tracking-wide truncate">
            {title}
          </p>
          <p className="text-2xl font-bold text-[#e2e2f0] mt-1">{value}</p>
          {subtitle && (
            <p className="text-xs text-[#6b7280] mt-0.5">{subtitle}</p>
          )}
          {trend && (
            <p
              className={cn(
                "text-xs mt-1 font-medium",
                trend.value >= 0 ? "text-green-400" : "text-red-400"
              )}
            >
              {trend.value >= 0 ? "+" : ""}
              {trend.value}% {trend.label}
            </p>
          )}
        </div>
        {Icon && (
          <div className="w-9 h-9 bg-[#1c1c26] rounded-lg flex items-center justify-center shrink-0 ml-3">
            <Icon size={18} className="text-[#6366f1]" />
          </div>
        )}
      </div>
    </div>
  );
}
