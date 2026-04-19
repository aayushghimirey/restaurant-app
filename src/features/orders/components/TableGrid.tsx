import { TableResponse } from "../types";
import { cn } from "@/lib/utils";
import { Lock, Unlock, XCircle, LayoutGrid } from "lucide-react";

const STATUS_CONFIG: Record<string, { label: string; color: string; bgColor: string; icon: React.ElementType; selectable: boolean }> = {
  OPEN: { label: "Open", color: "text-emerald-500", bgColor: "bg-emerald-500/10", icon: Unlock, selectable: true },
  RESERVED: { label: "Reserved", color: "text-amber-500", bgColor: "bg-amber-500/10", icon: Lock, selectable: false },
  CLOSE: { label: "Closed", color: "text-red-500", bgColor: "bg-red-500/10", icon: XCircle, selectable: false },
};

interface TableGridProps {
  tables: TableResponse[] | undefined;
  activeTableId: string | null;
  onTableSelect: (id: string) => void;
}

export function TableGrid({ tables, activeTableId, onTableSelect }: TableGridProps) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-5">
      {tables?.map((table) => {
        const isActive = activeTableId === table.id;
        const config = STATUS_CONFIG[table.status] || STATUS_CONFIG.OPEN;
        const canSelect = config.selectable;

        return (
          <button
            key={table.id}
            onClick={() => canSelect && onTableSelect(table.id)}
            disabled={!canSelect}
            className={cn(
              "p-6 rounded-[1.5rem] border transition-all duration-300 text-left relative overflow-hidden group outline-none",
              !canSelect && "opacity-50 cursor-not-allowed grayscale-[30%]",
              isActive 
                ? "bg-card shadow-xl border-primary ring-1 ring-primary/20 scale-[1.02]" 
                : canSelect
                  ? "bg-card border-border shadow-sm hover:shadow-xl hover:border-primary/30 hover:-translate-y-1"
                  : "bg-muted/30 border-border"
            )}
          >
            <div className="flex justify-between items-start mb-5 relative z-10">
               <div className={cn(
                 "h-12 w-12 rounded-full flex items-center justify-center transition-all duration-300 shadow-sm border border-transparent", 
                 isActive 
                   ? "bg-primary text-primary-foreground shadow-primary/20" 
                   : "bg-muted text-muted-foreground group-hover:text-primary group-hover:bg-primary/10 group-hover:border-primary/20"
               )}>
                  <LayoutGrid className="h-5 w-5" />
               </div>
               <div className={cn("px-3 py-1.5 text-[10px] font-bold uppercase tracking-widest rounded-full border", config.bgColor, config.color, "border-current/20")}>
                  {config.label}
               </div>
            </div>
            
            <div className="relative z-10 space-y-1.5">
               <h3 className={cn(
                 "text-xl font-bold tracking-tight transition-colors", 
                 isActive ? "text-primary" : "text-foreground group-hover:text-primary"
               )}>
                 {table.name}
               </h3>
               <div className="flex items-center gap-2 text-xs font-semibold text-muted-foreground">
                  <span className={cn(isActive && "text-primary")}>{table.capacity} Seats</span>
                  <span className="opacity-30">•</span>
                  <span>{table.location}</span>
               </div>
            </div>
            
            {isActive && (
              <>
                <div className="absolute -top-10 -right-10 w-32 h-32 bg-primary/10 rounded-full blur-3xl pointer-events-none" />
                <div className="absolute top-0 right-0 p-4">
                   <div className="h-2 w-2 rounded-full bg-primary animate-pulse" />
                </div>
              </>
            )}
            {canSelect && !isActive && (
              <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
            )}
          </button>
        )
      })}
    </div>
  )
}
