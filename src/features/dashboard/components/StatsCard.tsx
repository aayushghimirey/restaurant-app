import { ReactNode } from 'react';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';

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
    <motion.div 
      variants={{
        hidden: { opacity: 0, y: 20 },
        show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 24 } }
      }}
      whileHover={{ scale: 1.02, transition: { type: "spring", stiffness: 400, damping: 10 } }}
      className={cn(
        "glass-card p-6 rounded-3xl relative overflow-hidden group border border-white/10 bg-white/[0.02] backdrop-blur-3xl shadow-xl",
        className
      )}
    >
      {/* Background Glow */}
      <div className="absolute -right-10 -top-10 w-40 h-40 bg-primary/10 rounded-full blur-[50px] group-hover:bg-primary/20 group-hover:scale-150 transition-all duration-700 ease-out" />
      <div className="absolute -left-10 -bottom-10 w-40 h-40 bg-blue-500/5 rounded-full blur-[50px] group-hover:bg-blue-500/10 transition-all duration-700" />
      
      <div className="flex items-start justify-between relative z-10">
        <div className="space-y-2">
          <p className="text-[11px] font-black uppercase tracking-[0.2em] text-muted-foreground/80 drop-shadow-sm">
            {title}
          </p>
          {isLoading ? (
            <div className="h-10 w-28 bg-white/5 animate-pulse rounded-xl" />
          ) : (
            <motion.h3 
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              className="text-3xl font-black tracking-tight text-white drop-shadow-md"
            >
              {value}
            </motion.h3>
          )}
          
          {(description || trend) && !isLoading && (
            <div className="flex items-center gap-2 pt-1">
              {trend && (
                <span className={cn(
                  "text-[10px] font-bold px-2 py-1 rounded-lg backdrop-blur-md border",
                  trend.isUp 
                    ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" 
                    : "bg-rose-500/10 text-rose-400 border-rose-500/20"
                )}>
                  {trend.isUp ? '↑' : '↓'} {trend.value}
                </span>
              )}
              {description && (
                <span className="text-[11px] font-medium text-muted-foreground/70">
                  {description}
                </span>
              )}
            </div>
          )}
        </div>
        
        <motion.div 
          whileHover={{ rotate: 10, scale: 1.1 }}
          className="h-12 w-12 rounded-2xl bg-gradient-to-br from-white/10 to-white/5 border border-white/10 flex items-center justify-center text-primary shadow-lg shadow-black/20 group-hover:from-primary group-hover:to-primary/80 group-hover:text-white transition-all duration-500"
        >
          {icon}
        </motion.div>
      </div>
      
      {isLoading && (
        <div className="absolute inset-0 shimmer animate-shimmer pointer-events-none" />
      )}
    </motion.div>
  );
}
