import { Button } from '@/components/ui/button';
import { EmptyState } from "@/components/ui/EmptyState";
import { SkeletonCard } from "@/components/ui/SkeletonCard";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { useTables } from '@/features/orders/api';
import { cn } from "@/lib/utils";
import { Clock, Receipt, Wifi, WifiOff } from "lucide-react";
import { Link } from "react-router-dom";
import { useCompleteInvoice, useInvoiceWebSocket, usePendingInvoices } from '../api';

export default function InvoicesPage() {
  const { data: pending, isLoading: loadingPending } = usePendingInvoices();
  const { data: tables } = useTables();
  const { status: wsStatus } = useInvoiceWebSocket();
  const mutation = useCompleteInvoice();

  const handleComplete = (id: string) => {
    mutation.mutate(id);
  };

  return (
    <div className="p-6 md:p-8 space-y-10 animate-in max-w-[1400px] mx-auto">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-border pb-6">
        <div className="space-y-2">
          <div className="flex items-center gap-3">
            <h2 className="text-3xl font-black tracking-tight text-foreground">Invoices</h2>
            <div className="h-6 w-[1px] bg-border hidden md:block" />

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
            <Clock className="h-4 w-4" /> Manage pending payments.
          </p>
        </div>
        <Button asChild variant="default" className="h-10 rounded-xl font-bold uppercase tracking-widest text-xs">
          <Link to="/invoices/history">View History</Link>
        </Button>
      </div>

      <section className="space-y-4">
        <div className="flex items-center justify-between px-2">
          <div className="flex items-center gap-2">
            <div className="h-2 w-2 rounded-full bg-primary animate-pulse" />
            <h3 className="text-base font-bold text-foreground tracking-widest uppercase">Awaiting Settlement</h3>
          </div>
        </div>

        {loadingPending ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {[1, 2, 3].map(i => <SkeletonCard key={i} />)}
          </div>
        ) : pending && pending.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {pending.map(inv => {
              const table = tables?.find(t => t.id === inv.tableId);
              return (
                <div key={inv.id} className="bg-card border border-border shadow-sm rounded-2xl overflow-hidden group hover:shadow-xl hover:border-primary/40 transition-all duration-300">
                  <div className="p-6 space-y-5">
                    <div className="flex justify-between items-start">
                      <div className="space-y-1">
                        <h4 className="font-extrabold text-foreground text-lg leading-tight">
                          {table ? table.name : "Unknown Table"}
                        </h4>
                        <p className="text-muted-foreground text-[10px] uppercase tracking-wider font-bold">
                          {inv.billNumber || inv.id.substring(0, 8)}
                        </p>
                      </div>
                      <StatusBadge status="PENDING" variant="warning" />
                    </div>

                    <div className="py-2">
                      <div className="text-3xl font-black text-foreground tracking-tight">
                        <span className="text-muted-foreground text-sm font-bold mr-1.5 uppercase">Rs</span>
                        {inv.grossTotal?.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                      </div>
                    </div>

                    <Button
                      className="w-full h-12 shadow-md shadow-primary/20 rounded-xl font-bold uppercase tracking-widest text-xs transition-all hover:-translate-y-0.5"
                      onClick={() => handleComplete(inv.id)}
                      disabled={mutation.isPending}
                    >
                      {mutation.isPending ? 'Processing...' : 'Settle Invoice'}
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <EmptyState
            icon={Receipt}
            title="All Clear"
            description="No pending invoices to settle at the moment."
          />
        )}
      </section>

    </div>
  );
}
