import { useState } from "react";
import { CalendarDays, Clock, Eye, Table as TableIcon, Utensils, Wifi, WifiOff } from "lucide-react";
import { useReservations, useOrderWebSocket, useTables, useCancelReservation, useUpdateReservation } from "../api";
import { ReservationStatus } from "@/types/reservations";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { SkeletonCard } from "@/components/ui/SkeletonCard";
import { EmptyState } from "@/components/ui/EmptyState";
import { cn } from "@/lib/utils";
import { useMenus } from "@/features/menus/api";
import { OrderBuilder } from "./OrderBuilder";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/Dialog";

const STATUS_TABS = [
  { label: "Pending", value: ReservationStatus.PENDING },
  { label: "Updated", value: ReservationStatus.UPDATED },
  { label: "Completed", value: ReservationStatus.COMPLETED },
  { label: "Cancelled", value: ReservationStatus.CANCELLED },
];

export default function ReservationsPage() {
  const [activeTab, setActiveTab] = useState<ReservationStatus>(ReservationStatus.PENDING);
  const { data: reservationsData, isLoading } = useReservations(activeTab);
  const reservations = reservationsData?.data || [];
  const totalElements = reservationsData?.totalElements || 0;
  
  const { data: tables } = useTables();
  const { data: menusData } = useMenus({ size: 200 });
  const menus = menusData?.data || [];
  const { status: wsStatus } = useOrderWebSocket();
  const cancelMutation = useCancelReservation();
  
  const [editingSession, setEditingSession] = useState<string | null>(null);

  const handleCancelReservation = (sessionId: string) => {
    if (window.confirm("Are you sure you want to cancel this order?")) {
      cancelMutation.mutate(sessionId);
    }
  };

  const activeRes = reservations.find(r => r.sessionId === editingSession);
  const activeTable = tables?.find(t => t.id === activeRes?.tableId);

  return (
    <div className="p-6 md:p-8 space-y-8 animate-in max-w-[1400px] mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div className="space-y-2">
          <div className="flex items-center gap-3">
            <h2 className="text-3xl font-black tracking-tight text-foreground">Active Orders</h2>
            <div className="h-6 w-[1px] bg-border hidden md:block" />
            <div className="flex items-center gap-2 text-[10px] uppercase tracking-widest font-black text-muted-foreground bg-muted/50 px-3 py-1.5 rounded-lg border border-border">
              <CalendarDays className="h-3 w-3 text-primary" />
              {totalElements} Records
            </div>
            {/* WebSocket Status Indicator */}
            <div className={cn(
              "flex items-center gap-1.5 text-[9px] uppercase tracking-widest font-black px-2.5 py-1 rounded-lg border",
              wsStatus === 'OPEN' 
                ? "text-emerald-600 bg-emerald-50 border-emerald-200 dark:text-emerald-400 dark:bg-emerald-500/10 dark:border-emerald-500/20" 
                : "text-amber-600 bg-amber-50 border-amber-200 dark:text-amber-400 dark:bg-amber-500/10 dark:border-amber-500/20"
            )}>
              {wsStatus === 'OPEN' ? <Wifi className="h-3 w-3" /> : <WifiOff className="h-3 w-3" />}
              {wsStatus === 'OPEN' ? 'Live Stream' : 'Connecting'}
            </div>
          </div>
          <p className="text-muted-foreground text-sm font-medium flex items-center gap-2">
            <Eye className="h-4 w-4" /> Real-time order stream with live kitchen tracking.
          </p>
        </div>
      </div>

      {/* Status Tabs */}
      <div className="flex bg-muted/40 p-1.5 rounded-2xl border border-border w-fit shadow-sm">
        {STATUS_TABS.map((tab) => (
          <button
            key={tab.label}
            onClick={() => setActiveTab(tab.value)}
            className={cn(
              "px-6 py-2.5 text-[10px] font-black uppercase tracking-widest rounded-xl transition-all duration-300",
              activeTab === tab.value
                ? "bg-background text-foreground shadow-md border border-border"
                : "text-muted-foreground hover:text-foreground hover:bg-muted/50 border border-transparent"
            )}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Content */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map(i => <SkeletonCard key={i} />)}
        </div>
      ) : reservations.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {reservations.map((res, parentIdx) => {
            const table = tables?.find(t => t.id === res.tableId);
            return (
              <div key={res.sessionId || `res-${parentIdx}`} className="bg-card shadow-sm hover:shadow-xl rounded-[1.5rem] overflow-hidden flex flex-col border border-border hover:border-primary/40 transition-all duration-500 group">
                <div className="p-6 space-y-6">
                  <div className="flex justify-between items-start">
                    <div className="flex gap-4">
                      <div className="h-12 w-12 rounded-2xl bg-muted/50 flex items-center justify-center border border-border group-hover:border-primary/30 group-hover:bg-primary/5 transition-colors">
                        <TableIcon className="h-5 w-5 text-primary/70" />
                      </div>
                      <div>
                        <h4 className="text-lg font-black text-foreground leading-none mb-1">
                          {table?.name || "Unassigned"}
                        </h4>
                        <p className="text-[10px] text-muted-foreground font-black uppercase tracking-widest">
                          {table?.location || "Main Hall"}
                        </p>
                      </div>
                    </div>
                    <StatusBadge 
                      status={res.status} 
                      variant={
                        res.status === ReservationStatus.COMPLETED ? "success" : 
                        res.status === ReservationStatus.CANCELLED ? "destructive" : 
                        res.status === ReservationStatus.PENDING ? "warning" : "info"
                      } 
                    />
                  </div>

                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.15em] text-muted-foreground">
                        <Utensils className="h-3 w-3" />
                        Order Breakdown
                      </div>
                      <div className="text-[10px] font-black uppercase tracking-widest px-2 py-0.5 rounded bg-muted/50 text-foreground">
                        Total Rs {res.billAmount}
                      </div>
                    </div>
                    
                    <div className="space-y-2 max-h-[140px] overflow-y-auto custom-scrollbar pr-2 bg-muted/10 p-3 rounded-xl border border-border/50">
                       {res.items.map((item, idx) => {
                         const menu = menus.find(m => m.id === item.menuItemId);
                         return (
                           <div key={`${item.menuItemId}-${idx}`} className="flex justify-between items-center text-xs pb-2 border-b border-border/50 last:border-0 last:pb-0">
                             <div className="flex items-center gap-3">
                               <span className="text-foreground bg-muted font-black px-1.5 py-0.5 rounded text-[10px]">
                                 {item.quantity}×
                               </span>
                               <span className="text-foreground font-semibold line-clamp-1">{menu?.name || "Unknown Item"}</span>
                             </div>
                             <span className="text-muted-foreground font-bold shrink-0">
                               Rs {item.price * item.quantity}
                             </span>
                           </div>
                         )
                       })}
                    </div>
                  </div>

                  {res.status !== ReservationStatus.CANCELLED && res.status !== ReservationStatus.COMPLETED && (
                    <button
                      onClick={() => setEditingSession(res.sessionId)}
                      className="w-full py-2.5 rounded-xl border border-primary/20 bg-primary/5 text-primary text-[10px] font-black uppercase tracking-widest hover:bg-primary/10 transition-all flex items-center justify-center gap-2"
                    >
                      <Utensils className="h-3 w-3" />
                      Add / Edit Items
                    </button>
                  )}
                </div>

                <div className="mt-auto p-5 bg-muted/20 border-t border-border flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Clock className="h-3.5 w-3.5 text-muted-foreground" />
                    <span className="text-[10px] font-black text-foreground tracking-wider uppercase">
                      {new Date(res.reservationTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
                    {res.status !== ReservationStatus.CANCELLED && res.status !== ReservationStatus.COMPLETED && (
                      <button
                        onClick={() => handleCancelReservation(res.sessionId)}
                        disabled={cancelMutation.isPending}
                        className="text-[10px] font-black uppercase tracking-widest text-destructive hover:text-destructive/80 transition-colors px-3 py-1.5 rounded-lg hover:bg-destructive/5 disabled:opacity-50"
                      >
                        Cancel Order
                      </button>
                    )}
                    <div className="h-8 w-8 rounded-full border border-border bg-background flex items-center justify-center text-[10px] font-black text-foreground shadow-sm">
                      {res.items.reduce((acc, i) => acc + i.quantity, 0)}
                    </div>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      ) : (
        <EmptyState 
          icon={CalendarDays} 
          title="No Active Orders" 
          description={`There are no ${activeTab.toLowerCase()} orders at the moment. Try matching your filters.`}
        />
      )}

      {/* Edit Order Dialog */}
      <Dialog open={!!editingSession} onOpenChange={(open) => !open && setEditingSession(null)}>
        <DialogContent className="max-w-[1200px] p-0 overflow-hidden bg-background border-border shadow-2xl rounded-[2rem]">
          <div className="p-0 flex flex-col h-[80vh]">
            <div className="p-6 border-b border-border bg-muted/20 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="h-10 w-10 rounded-full bg-primary text-primary-foreground flex items-center justify-center">
                  <Utensils className="h-5 w-5" />
                </div>
                <div>
                  <DialogTitle className="text-xl font-bold tracking-tight">Edit Order Items</DialogTitle>
                  <p className="text-muted-foreground text-xs font-semibold">
                    Updating Table <span className="text-primary">{activeTable?.name}</span>
                  </p>
                </div>
              </div>
            </div>
            <div className="flex-1 overflow-hidden flex flex-col">
              {activeRes && (
                <OrderBuilder
                  tableId={activeRes.tableId}
                  tableName={activeTable?.name || ""}
                  sessionId={activeRes.sessionId}
                  initialItems={activeRes.items.map(item => {
                    const menu = menus.find(m => m.id === item.menuItemId);
                    return {
                      menuId: item.menuItemId,
                      name: menu?.name || "Unknown Item",
                      price: item.price,
                      quantity: item.quantity
                    };
                  })}
                  onComplete={() => setEditingSession(null)}
                />
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
