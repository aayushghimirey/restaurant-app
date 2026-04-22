import { ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface StatsCardProps {
  title: string;
  value: string | number;
  icon: ReactNode;
  description?: string;
  trend?: {
    value: string;
    isUp: boolean;
  };
  isLoading?: boolean;
  className?: string;
}

export function StatsCard({
  title,
  value,
  icon,
  description,
  trend,
  isLoading,
  className
}: StatsCardProps) {
  return (
    <div className={cn(
      "glass-card p-6 rounded-2xl relative overflow-hidden group transition-all duration-300 hover:scale-[1.02] hover:shadow-primary/5",
      className
    )}>
      {/* Background Glow */}
      <div className="absolute -right-4 -top-4 w-24 h-24 bg-primary/5 rounded-full blur-3xl group-hover:bg-primary/10 transition-colors" />
      
      <div className="flex items-start justify-between relative z-10">
        <div className="space-y-1">
          <p className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground">
            {title}
          </p>
          {isLoading ? (
            <div className="h-8 w-24 bg-white/5 animate-pulse rounded-lg" />
          ) : (
            <h3 className="text-2xl font-black tracking-tight text-white">
              {value}
            </h3>
          )}
          
          {(description || trend) && !isLoading && (
            <div className="flex items-center gap-2 mt-2">
              {trend && (
                <span className={cn(
                  "text-[10px] font-bold px-1.5 py-0.5 rounded-md",
                  trend.isUp ? "bg-emerald-500/10 text-emerald-400" : "bg-rose-500/10 text-rose-400"
                )}>
                  {trend.isUp ? '↑' : '↓'} {trend.value}
                </span>
              )}
              {description && (
                <span className="text-[10px] font-medium text-muted-foreground/60">
                  {description}
                </span>
              )}
            </div>
          )}
        </div>
        
        <div className="h-10 w-10 rounded-xl bg-white/5 flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-white transition-all duration-300">
          {icon}
        </div>
      </div>
      
      {isLoading && (
        <div className="absolute inset-0 shimmer animate-shimmer pointer-events-none" />
      )}
    </div>
  );
}
