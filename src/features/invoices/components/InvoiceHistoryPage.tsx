import { Receipt, CheckCircle2 } from "lucide-react";
import { useInvoices } from '../api';
import { useTables } from '@/features/orders/api';
import { StatusBadge } from "@/components/ui/StatusBadge";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

export default function InvoiceHistoryPage() {
  const { data: allInvoices, isLoading: loadingAll } = useInvoices();
  const { data: tables } = useTables();

  return (
    <div className="p-6 md:p-8 space-y-10 animate-in max-w-[1400px] mx-auto">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-border pb-6">
        <div className="space-y-2">
          <div className="flex items-center gap-3">
            <h2 className="text-3xl font-black tracking-tight text-foreground">Billing History</h2>
            <div className="h-6 w-[1px] bg-border hidden md:block" />
          </div>
          <p className="text-muted-foreground text-sm font-medium flex items-center gap-2">
            <Receipt className="h-4 w-4" /> View archived and settled transactions.
          </p>
        </div>
        <Button asChild variant="outline" className="h-10 rounded-xl font-bold uppercase tracking-widest text-xs">
          <Link to="/invoices">Back to Pending</Link>
        </Button>
      </div>

      <section className="space-y-4">
        <div className="flex items-center gap-2 px-2">
          <CheckCircle2 className="h-5 w-5 text-muted-foreground" />
          <h3 className="text-base font-bold text-foreground tracking-widest uppercase">Archived Invoices</h3>
        </div>

        {loadingAll ? (
          <div className="space-y-3">
            {[1, 2, 3].map(i => <div key={i} className="h-16 bg-muted/50 rounded-xl animate-pulse" />)}
          </div>
        ) : (
          <div className="bg-card shadow-sm rounded-2xl overflow-hidden border border-border">
            <div className="overflow-x-auto custom-scrollbar">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-muted/30 border-b border-border">
                    <th className="px-6 py-4 text-[10px] uppercase tracking-[0.2em] font-black text-muted-foreground">Bill No.</th>
                    <th className="px-6 py-4 text-[10px] uppercase tracking-[0.2em] font-black text-muted-foreground">Location</th>
                    <th className="px-6 py-4 text-[10px] uppercase tracking-[0.2em] font-black text-muted-foreground">Total</th>
                    <th className="px-6 py-4 text-[10px] uppercase tracking-[0.2em] font-black text-muted-foreground">Status</th>
                    <th className="px-6 py-4 text-[10px] uppercase tracking-[0.2em] font-black text-muted-foreground text-right">Settled Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {allInvoices?.map((inv) => (
                    <tr key={inv.id} className="hover:bg-muted/20 transition-colors group">
                      <td className="px-6 py-4">
                        <span className="font-mono text-[11px] font-bold text-muted-foreground group-hover:text-primary transition-colors">
                          {inv.billNumber || `#${inv.id.substring(0, 8)}`}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <div className="h-7 w-7 rounded-lg bg-primary/10 flex items-center justify-center text-[10px] font-bold text-primary">
                            T
                          </div>
                          <span className="text-xs font-bold text-foreground">
                            {tables?.find(t => t.id === inv.tableId)?.name || "N/A"}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-[13px] font-black text-foreground">
                          Rs {inv.grossTotal?.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <StatusBadge 
                          status={inv.status} 
                          variant={(inv.status === 'COMPLETED' || inv.status === 'PAID') ? 'success' : 'warning'} 
                        />
                      </td>
                      <td className="px-6 py-4 text-right">
                        <span className="text-xs font-bold text-muted-foreground">
                          {new Date(inv.reservationTime).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' })}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {(!allInvoices || allInvoices.length === 0) && (
              <div className="p-12 text-center text-muted-foreground text-sm font-bold uppercase tracking-widest flex flex-col items-center gap-3">
                <Receipt className="h-8 w-8 opacity-20" />
                No archived invoices found.
              </div>
            )}
          </div>
        )}
      </section>
    </div>
  );
}
