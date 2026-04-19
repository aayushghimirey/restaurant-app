import { cn } from "@/lib/utils"

interface StatusBadgeProps {
  status: string
  className?: string
  variant?: 'default' | 'success' | 'warning' | 'destructive' | 'info'
}

export function StatusBadge({ status, className, variant = 'default' }: StatusBadgeProps) {
  const variants = {
    default: "bg-secondary text-secondary-foreground",
    success: "bg-success/20 text-success border-success/20",
    warning: "bg-warning/20 text-warning border-warning/20",
    destructive: "bg-destructive/20 text-destructive border-destructive/20",
    info: "bg-primary/20 text-primary border-primary/20",
  }

  return (
    <span className={cn(
      "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border",
      variants[variant],
      className
    )}>
      {status}
    </span>
  )
}
