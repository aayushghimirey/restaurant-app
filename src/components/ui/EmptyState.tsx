import { cn } from "@/lib/utils"
import { LucideIcon } from "lucide-react"

interface EmptyStateProps {
  icon: LucideIcon
  title: string
  description?: string
  className?: string
}

export function EmptyState({ icon: Icon, title, description, className }: EmptyStateProps) {
  return (
    <div className={cn(
      "flex flex-col items-center justify-center p-12 text-center glass-card premium-shadow rounded-2xl",
      className
    )}>
      <div className="p-4 rounded-2xl bg-primary/5 inline-flex mb-4">
        <Icon className="h-8 w-8 text-primary/40" />
      </div>
      <h3 className="text-xl font-bold text-white mb-2">{title}</h3>
      {description && <p className="text-muted-foreground max-w-xs">{description}</p>}
    </div>
  )
}
