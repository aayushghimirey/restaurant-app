import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { EmptyState } from "@/components/ui/EmptyState";
import { SkeletonCard } from "@/components/ui/SkeletonCard";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { useTables } from '@/features/orders/api';
import { cn } from "@/lib/utils";
import { Clock, Receipt, Wifi, WifiOff, Printer, Loader2 } from "lucide-react";
import { Link } from "react-router-dom";
import { toast } from "react-hot-toast";
import { useCompleteInvoice, useInvoiceWebSocket, usePendingInvoices, getPrintInvoiceHtml } from '../api';
import { SettleInvoiceSheet } from './SettleInvoiceSheet';
import { CreateInvoiceCommand, Invoice } from '../types';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogClose } from '@/components/ui/Dialog';

export default function InvoicesPage() {
  const { data: pending, isLoading: loadingPending } = usePendingInvoices();
  const { data: tables } = useTables();
  const { status: wsStatus } = useInvoiceWebSocket();
  const mutation = useCompleteInvoice();

  const [settleInvoice, setSettleInvoice] = useState<Invoice | null>(null);
  const [printPromptInvoice, setPrintPromptInvoice] = useState<Invoice | null>(null);
  const [isPrinting, setIsPrinting] = useState(false);

  const handleSettle = (command: CreateInvoiceCommand) => {
    if (!settleInvoice) return;
    mutation.mutate({
      invoiceId: settleInvoice.id,
      command
    }, {
      onSuccess: () => {
        setPrintPromptInvoice(settleInvoice);
        setSettleInvoice(null);
      }
    });
  };

  const handlePrintConfirm = async () => {
    if (!printPromptInvoice) return;
    setIsPrinting(true);
    try {
      const htmlContent = await getPrintInvoiceHtml(printPromptInvoice.id);
      
      const printWindow = window.open('', '_blank');
      if (printWindow) {
        printWindow.document.write(htmlContent);
        printWindow.document.close();
        printWindow.focus();
        
        setTimeout(() => {
          printWindow.print();
          printWindow.close();
        }, 500);
      } else {
        toast.error("Please allow popups to print invoices");
      }
      setPrintPromptInvoice(null);
    } catch (error: any) {
      toast.error(error?.response?.data?.message || "Failed to load printable invoice.");
    } finally {
      setIsPrinting(false);
    }
  };

  return (
    <div className="p-6 md:p-8 space-y-10 animate-in max-w-[1400px] mx-auto">
      {/* ... existing header code ... */}
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
                      onClick={() => setSettleInvoice(inv)}
                      disabled={mutation.isPending && settleInvoice?.id === inv.id}
                    >
                      {mutation.isPending && settleInvoice?.id === inv.id ? 'Processing...' : 'Settle Invoice'}
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

      {/* Settlement Dialog */}
      <SettleInvoiceSheet
        invoice={settleInvoice}
        isOpen={!!settleInvoice}
        onClose={() => setSettleInvoice(null)}
        onSettle={handleSettle}
        isPending={mutation.isPending}
      />

      {/* Print Confirmation Dialog */}
      <Dialog open={!!printPromptInvoice} onOpenChange={(open) => !open && setPrintPromptInvoice(null)}>
        <DialogContent className="max-w-sm text-center">
           <DialogHeader className="flex flex-col items-center">
              <div className="mx-auto h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center mb-2 shadow-sm">
                 <Printer className="h-6 w-6 text-primary" />
              </div>
              <DialogTitle className="text-xl">Print Invoice?</DialogTitle>
              <DialogDescription>
                 Settlement was successful. Would you like to print the receipt for <strong>{printPromptInvoice?.billNumber || 'this transaction'}</strong>?
              </DialogDescription>
           </DialogHeader>
           <DialogFooter className="flex gap-3 justify-center sm:justify-center mt-4">
              <DialogClose asChild>
                 <Button variant="outline" disabled={isPrinting} className="flex-1 rounded-xl h-12 font-bold uppercase tracking-widest text-[10px]">No, Skip</Button>
              </DialogClose>
              <Button onClick={handlePrintConfirm} disabled={isPrinting} className="flex-1 rounded-xl h-12 shadow-lg shadow-primary/20 font-black uppercase tracking-[0.2em] text-[10px]">
                 {isPrinting ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Fetching...</> : 'Yes, Print'}
              </Button>
           </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
