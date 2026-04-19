import { cn } from "@/lib/utils"

export type ConnectionStatus = "CONNECTING" | "OPEN" | "CLOSED" | "CLOSING" | "UNINSTANTIATED";

interface WsStatusDotProps {
  status: ConnectionStatus
  className?: string
}

export function WsStatusDot({ status, className }: WsStatusDotProps) {
  const statusColors = {
    UNINSTANTIATED: "text-muted-foreground",
    CONNECTING: "text-warning",
    OPEN: "text-success",
    CLOSING: "text-destructive",
    CLOSED: "text-destructive",
  } as const;

  return (
    <div className={cn("flex items-center gap-2", className)}>
      <div className={cn(
        "h-2 w-2 rounded-full",
        status === 'OPEN' && "pulse-dot",
        statusColors[status] || "text-muted-foreground"
      )} style={{ backgroundColor: 'currentColor' }} />
      <span className="text-[10px] uppercase tracking-widest font-bold text-muted-foreground">
        {status}
      </span>
    </div>
  )
}
