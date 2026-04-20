import { TableResponse } from "../types";
import { cn } from "@/lib/utils";
import { Lock, Unlock, XCircle, LayoutGrid, Plus } from "lucide-react";
import { motion } from "framer-motion";

const STATUS_CONFIG: Record<string, { label: string; color: string; bgColor: string; icon: React.ElementType; selectable: boolean }> = {
  OPEN: { label: "Open", color: "text-emerald-500", bgColor: "bg-emerald-500/10", icon: Unlock, selectable: true },
  RESERVED: { label: "Reserved", color: "text-amber-500", bgColor: "bg-amber-500/10", icon: Lock, selectable: true }, // Changed to true
  CLOSE: { label: "Closed", color: "text-red-500", bgColor: "bg-red-500/10", icon: XCircle, selectable: false },
};

interface TableGridProps {
  tables: TableResponse[] | undefined;
  activeTableId: string | null;
  onTableSelect: (id: string) => void;
}

export function TableGrid({ tables, activeTableId, onTableSelect }: TableGridProps) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
      {tables?.map((table, idx) => {
        const isActive = activeTableId === table.id;
        const config = STATUS_CONFIG[table.status] || STATUS_CONFIG.OPEN;
        const canSelect = config.selectable;

        return (
          <motion.button
            key={table.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.05, duration: 0.4, ease: "easeOut" }}
            whileHover={canSelect ? { y: -5, scale: 1.02 } : {}}
            whileTap={canSelect ? { scale: 0.98 } : {}}
            onClick={() => canSelect && onTableSelect(table.id)}
            disabled={!canSelect}
            className={cn(
              "p-6 rounded-[2rem] border transition-all duration-300 text-left relative overflow-hidden group outline-none",
              !canSelect && "opacity-50 cursor-not-allowed grayscale-[30%]",
              isActive 
                ? "bg-card shadow-2xl border-primary ring-2 ring-primary/20" 
                : canSelect
                  ? "bg-card border-border shadow-sm hover:shadow-2xl hover:border-primary/40"
                  : "bg-muted/30 border-border"
            )}
          >
            {/* Glossy background effect for reserved tables */}
            {table.status === 'RESERVED' && (
              <div className="absolute inset-0 bg-gradient-to-br from-amber-500/5 to-transparent pointer-events-none" />
            )}

            <div className="flex justify-between items-start mb-6 relative z-10">
               <div className={cn(
                 "h-12 w-12 rounded-2xl flex items-center justify-center transition-all duration-300 shadow-sm border border-transparent", 
                 isActive 
                   ? "bg-primary text-primary-foreground shadow-primary/20" 
                   : table.status === 'RESERVED'
                     ? "bg-amber-500/10 text-amber-500 border-amber-500/20"
                     : "bg-muted text-muted-foreground group-hover:text-primary group-hover:bg-primary/10 group-hover:border-primary/20"
               )}>
                  <LayoutGrid className="h-5 w-5" />
               </div>
               <div className={cn(
                 "px-3 py-1.5 text-[9px] font-black uppercase tracking-[0.1em] rounded-lg border flex items-center gap-1.5 shadow-sm backdrop-blur-md", 
                 config.bgColor, 
                 config.color, 
                 "border-current/10"
               )}>
                  <config.icon className="h-3 w-3" />
                  {config.label}
               </div>
            </div>
            
            <div className="relative z-10 space-y-2">
               <h3 className={cn(
                 "text-xl font-black tracking-tight transition-colors", 
                 isActive ? "text-primary" : "text-foreground group-hover:text-primary"
               )}>
                 {table.name}
               </h3>
               <div className="flex items-center gap-2.5 text-[10px] font-black uppercase tracking-widest text-muted-foreground/80">
                  <span className={cn(isActive && "text-primary")}>{table.capacity} Seats</span>
                  <span className="h-1 w-1 rounded-full bg-muted-foreground/30" />
                  <span>{table.location}</span>
               </div>
            </div>
            
            {isActive && (
              <>
                <div className="absolute -top-10 -right-10 w-32 h-32 bg-primary/20 rounded-full blur-3xl pointer-events-none" />
                <div className="absolute top-2 right-2">
                   <div className="h-2 w-2 rounded-full bg-primary animate-ping" />
                </div>
              </>
            )}
            
            {/* Interaction indicator for hover */}
            {canSelect && !isActive && (
              <div className="absolute bottom-4 right-4 translate-y-4 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300">
                <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                  <Plus className="h-4 w-4" />
                </div>
              </div>
            )}
          </motion.button>
        )
      })}
    </div>
  )
}
