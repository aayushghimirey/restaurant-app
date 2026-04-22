import {
  Dialog,
  DialogContent,
  DialogTitle
} from "@/components/ui/Dialog";
import { EmptyState } from "@/components/ui/EmptyState";
import { SkeletonCard } from "@/components/ui/SkeletonCard";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { Button } from "@/components/ui/button";
import { useMenus } from "@/features/menus/api";
import { cn } from "@/lib/utils";
import { useWebSocket } from "@/providers/WebSocketProvider";
import { ReservationStatus } from "@/types/reservations";
import { AlertTriangle, CalendarDays, Clock, Eye, Loader2, Receipt, Table as TableIcon, Utensils, Wifi, WifiOff } from "lucide-react";
import { useState } from "react";
import { Link } from "react-router-dom";
import { useCancelReservation, useReservations, useTables } from "../api";
import { OrderBuilder } from "./OrderBuilder";

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
  const { orderStatus: wsStatus } = useWebSocket();
  const cancelMutation = useCancelReservation();
  
  const [editingSession, setEditingSession] = useState<string | null>(null);
  const [cancellingSessionId, setCancellingSessionId] = useState<string | null>(null);

  const handleConfirmCancel = () => {
    if (cancellingSessionId) {
      cancelMutation.mutate(cancellingSessionId, {
        onSuccess: () => setCancellingSessionId(null),
      });
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
              <div key={res.sessionId || `res-${parentIdx}`} className="bg-card shadow-sm hover:shadow-2xl rounded-[1.8rem] overflow-hidden flex flex-col border border-border hover:border-primary/30 transition-all duration-500 group">
                <div className="p-6 space-y-6">
                  <div className="flex justify-between items-start">
                    <div className="flex gap-4">
                      <div className="h-12 w-12 rounded-2xl bg-muted/50 flex items-center justify-center border border-border group-hover:border-primary/40 group-hover:bg-primary/10 transition-all duration-500 shadow-sm">
                        <TableIcon className="h-6 w-6 text-primary/80" />
                      </div>
                      <div>
                        <h4 className="text-lg font-black text-foreground leading-none mb-1">
                          {table?.name || "Unassigned"}
                        </h4>
                        <p className="text-[10px] text-muted-foreground font-black uppercase tracking-[0.2em]">
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

                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 text-[9px] font-black uppercase tracking-[0.2em] text-muted-foreground bg-muted/30 px-2.5 py-1 rounded-lg">
                        <Utensils className="h-3 w-3" />
                        Order Breakdown
                      </div>
                      <div className="text-[11px] font-black text-foreground">
                        Rs {res.billAmount.toLocaleString()}
                      </div>
                    </div>
                    
                    <div className="space-y-2 max-h-[160px] overflow-y-auto custom-scrollbar pr-2 bg-muted/5 p-3.5 rounded-2xl border border-border/40 group-hover:bg-muted/10 transition-colors">
                       {res.items.map((item, idx) => {
                         const menu = menus.find(m => m.id === item.menuItemId);
                         return (
                           <div key={`${item.menuItemId}-${idx}`} className="flex justify-between items-center text-xs pb-2.5 border-b border-border/30 last:border-0 last:pb-0">
                             <div className="flex items-center gap-3">
                               <span className="text-foreground bg-muted-foreground/10 font-bold px-1.5 py-0.5 rounded text-[9px]">
                                 {item.quantity}×
                               </span>
                               <span className="text-foreground font-bold line-clamp-1 text-[11px]">{menu?.name || "Unknown Item"}</span>
                             </div>
                             <span className="text-muted-foreground font-bold text-[10px] shrink-0">
                               Rs {(item.price * item.quantity).toLocaleString()}
                             </span>
                           </div>
                         )
                       })}
                    </div>
                  </div>

                  <div className="space-y-2.5 pt-2">
                    {res.status !== ReservationStatus.CANCELLED && res.status !== ReservationStatus.COMPLETED && (
                      <Button
                        variant="outline"
                        onClick={() => setEditingSession(res.sessionId)}
                        className="w-full h-11 rounded-xl border-primary/20 bg-primary/5 text-primary text-[10px] font-black uppercase tracking-[0.2em] hover:bg-primary hover:text-primary-foreground hover:border-primary transition-all duration-300 gap-2 shadow-sm"
                      >
                        <Utensils className="h-3.5 w-3.5" />
                        Add / Edit Items
                      </Button>
                    )}

                    {res.status === ReservationStatus.COMPLETED && (
                      <Button
                        asChild
                        variant="outline"
                        className="w-full h-11 rounded-xl border-emerald-200 bg-emerald-50 text-emerald-600 text-[10px] font-black uppercase tracking-[0.2em] hover:bg-emerald-600 hover:text-white hover:border-emerald-600 transition-all duration-300 gap-2 shadow-sm"
                      >
                        <Link to={`/invoices/history?sessionId=${res.sessionId}`}>
                          <Receipt className="h-3.5 w-3.5" />
                          View Detailed Invoice
                        </Link>
                      </Button>
                    )}
                  </div>
                </div>

                <div className="mt-auto p-5 bg-muted/10 border-t border-border/60 flex items-center justify-between group-hover:bg-muted/20 transition-colors">
                  <div className="flex items-center gap-2">
                    <div className="h-7 w-7 rounded-full bg-background border border-border flex items-center justify-center shadow-sm">
                      <Clock className="h-3.5 w-3.5 text-muted-foreground" />
                    </div>
                    <span className="text-[11px] font-black text-foreground tracking-wider">
                      {new Date(res.reservationTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
                    {res.status !== ReservationStatus.CANCELLED && res.status !== ReservationStatus.COMPLETED && (
                      <button
                        onClick={() => setCancellingSessionId(res.sessionId)}
                        className="text-[9px] font-black uppercase tracking-[0.2em] text-muted-foreground hover:text-destructive hover:bg-destructive/5 px-3 py-1.5 rounded-lg transition-all"
                      >
                        Cancel
                      </button>
                    )}
                    <div className="h-8 w-8 rounded-xl border border-border bg-background flex items-center justify-center text-[11px] font-black text-foreground shadow-sm group-hover:border-primary/20 transition-colors">
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

      {/* Confirm Cancellation Dialog */}
      <Dialog open={!!cancellingSessionId} onOpenChange={(open) => !open && setCancellingSessionId(null)}>
        <DialogContent className="max-w-[400px] p-0 overflow-hidden bg-background border-border shadow-2xl rounded-[2rem]">
          <div className="p-8 text-center space-y-6">
             <div className="mx-auto h-16 w-16 rounded-full bg-destructive/10 border border-destructive/20 flex items-center justify-center">
                <AlertTriangle className="h-8 w-8 text-destructive animate-pulse" />
             </div>
             <div className="space-y-2">
                <DialogTitle className="text-2xl font-black tracking-tight text-foreground">Cancel Order?</DialogTitle>
                <p className="text-sm text-muted-foreground font-medium px-4">
                  Are you sure you want to cancel this reservation? This action will void the current items and free up the table.
                </p>
             </div>
             <div className="grid grid-cols-2 gap-3 pt-2">
                <Button 
                  variant="outline" 
                  onClick={() => setCancellingSessionId(null)}
                  className="h-12 rounded-xl font-bold uppercase tracking-widest text-[10px]"
                  disabled={cancelMutation.isPending}
                >
                  Keep Order
                </Button>
                <Button 
                  variant="destructive" 
                  onClick={handleConfirmCancel}
                  className="h-12 rounded-xl font-bold uppercase tracking-widest text-[10px] gap-2"
                  disabled={cancelMutation.isPending}
                >
                  {cancelMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : "Yes, Cancel"}
                </Button>
             </div>
          </div>
        </DialogContent>
      </Dialog>

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
