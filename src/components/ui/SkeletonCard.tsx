import { cn } from "@/lib/utils"

interface SkeletonCardProps {
  className?: string
}

export function SkeletonCard({ className }: SkeletonCardProps) {
  return (
    <div className={cn("rounded-xl glass-card premium-shadow overflow-hidden", className)}>
      <div className="h-24 shimmer bg-white/5" />
      <div className="p-5 space-y-3">
        <div className="h-4 w-1/3 shimmer bg-white/5 rounded" />
        <div className="h-8 w-2/3 shimmer bg-white/5 rounded" />
        <div className="h-10 w-full shimmer bg-white/10 rounded-lg" />
      </div>
    </div>
  )
}
