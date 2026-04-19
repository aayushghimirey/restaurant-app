import * as React from "react"
import { cn } from "@/lib/utils"

export interface GlassCardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode
  noPadding?: boolean
}

export function GlassCard({ className, children, noPadding = false, ...props }: GlassCardProps) {
  return (
    <div
      className={cn(
        "bg-card/10 backdrop-blur-md rounded-[2.5rem] border border-white/5 shadow-2xl relative overflow-hidden isolate",
        !noPadding && "p-6",
        className
      )}
      {...props}
    >
      <div className="absolute inset-0 bg-gradient-to-b from-white/[0.02] to-transparent pointer-events-none" />
      <div className="relative z-10 w-full">
        {children}
      </div>
    </div>
  )
}
