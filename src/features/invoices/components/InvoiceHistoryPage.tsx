import { useState, useMemo, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  History, Search, Calendar, MapPin, Receipt,
  ChevronLeft, ChevronRight, X, Filter, Table as TableIcon,
  FileText, Clock, ArrowRight, TrendingUp, Info, Loader2
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import { useInvoices, getPrintInvoiceHtml } from '../api';
import { useTables } from '@/features/orders/api';
import { Invoice } from '../types';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { TableSelector } from '@/features/orders/components/TableSelector';
import { cn } from "@/lib/utils";
import {
  Dialog,
  DialogContent,
  DialogTitle,
} from "@/components/ui/Dialog";

export default function InvoiceHistoryPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialSessionId = searchParams.get('sessionId') || "";

  const [page, setPage] = useState(0);
  const [billNumber, setBillNumber] = useState("");
  const [tableId, setTableId] = useState("all");
  const [sessionId, setSessionId] = useState(initialSessionId);
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);
  const [isPrinting, setIsPrinting] = useState(false);

  const handlePrint = async () => {
    if (!selectedInvoice) return;
    setIsPrinting(true);
    try {
      const htmlContent = await getPrintInvoiceHtml(selectedInvoice.id);
      
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
    } catch (error: any) {
      toast.error(error?.response?.data?.message || "Failed to load printable invoice.");
    } finally {
      setIsPrinting(false);
    }
  };

  // Sync session ID from URL if it changes
  useEffect(() => {
    if (initialSessionId) {
      setSessionId(initialSessionId);
      setPage(0);
    }
  }, [initialSessionId]);

  const queryParams = useMemo(() => ({
    page,
    size: 10,
    billNumber: billNumber || undefined,
    tableId: tableId === "all" ? undefined : tableId,
    sessionId: sessionId || undefined
  }), [page, billNumber, tableId, sessionId]);

  const { data: invoicesData, isLoading } = useInvoices(queryParams);
  const { data: tablesData } = useTables();

  const handleReset = () => {
    setBillNumber("");
    setTableId("all");
    setSessionId("");
    setPage(0);
    setSearchParams({});
  };

  const invoices = invoicesData?.data || [];
  const tables = tablesData || [];
  const tableOptions = tables.map(t => ({ id: t.id, name: t.name, location: t.location }));

  return (
    <div className="p-6 md:p-8 space-y-8 animate-in max-w-[1400px] mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-border pb-6">
        <div className="space-y-2">
          <div className="flex items-center gap-3">
            <h2 className="text-3xl font-black tracking-tight text-foreground">Billing History</h2>
            <div className="h-6 w-[1px] bg-border hidden md:block" />
            <History className="h-6 w-6 text-primary/60" />
          </div>
          <p className="text-muted-foreground text-sm font-medium flex items-center gap-2">
            <Receipt className="h-4 w-4" /> Review past transactions, invoices, and table history.
          </p>
        </div>

        {sessionId && (
          <div className="flex items-center gap-3 px-4 py-2 bg-primary/5 rounded-xl border border-primary/10">
            <div className="h-2 w-2 rounded-full bg-primary animate-pulse" />
            <span className="text-[10px] font-black text-primary uppercase tracking-widest truncate max-w-[200px]">Filtered by Session: {sessionId.substring(0, 8)}...</span>
            <button onClick={() => { setSessionId(""); setSearchParams({}); }} className="hover:text-primary transition-colors">
              <X className="h-3.5 w-3.5" />
            </button>
          </div>
        )}
      </div>

      {/* Filter Bar */}
      <div className="space-y-4 bg-muted/20 p-5 rounded-[2rem] border border-border/50 backdrop-blur-sm shadow-inner">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
            <Input
              placeholder="Search Bill #"
              value={billNumber}
              onChange={(e) => { setBillNumber(e.target.value); setPage(0); }}
              className="pl-9 h-11 rounded-xl bg-card border-border font-bold text-xs"
            />
          </div>

          <TableSelector
            options={tableOptions}
            value={tableId}
            onChange={(id) => { setTableId(id); setPage(0); }}
          />

          <div className="relative">
            <Filter className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
            <Input
              placeholder="Session ID Filter"
              value={sessionId}
              onChange={(e) => { setSessionId(e.target.value); setPage(0); }}
              className="pl-9 h-11 rounded-xl bg-card border-border font-bold text-xs"
            />
          </div>
        </div>

        <div className="flex items-center justify-between pt-2 border-t border-border/50">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary/5 border border-primary/10 text-[9px] font-black text-primary uppercase tracking-widest">
              <Filter className="h-3 w-3" /> Filters Active
            </div>
            {invoicesData && (
              <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
                Showing {invoices.length} of {invoicesData.totalElements} records
              </span>
            )}
          </div>

          <Button
            variant="ghost"
            onClick={handleReset}
            className="h-8 rounded-lg text-[9px] font-black uppercase tracking-[0.2em] gap-2 hover:bg-destructive/10 hover:text-destructive transition-all"
          >
            <X className="h-3.5 w-3.5" /> Clear All
          </Button>
        </div>
      </div>

      {/* Main Content */}
      <section className="space-y-4">
        {isLoading ? (
          <div className="space-y-4">
            {[1, 2, 3].map(i => <div key={i} className="h-20 bg-muted/30 rounded-2xl animate-pulse" />)}
          </div>
        ) : (
          <div className="bg-card shadow-sm rounded-[2rem] overflow-hidden border border-border/60">
            <div className="overflow-x-auto custom-scrollbar">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-muted/10 border-b border-border">
                    <th className="px-6 py-5 text-[10px] uppercase tracking-[0.2em] font-black text-muted-foreground">Bill Detail</th>
                    <th className="px-6 py-5 text-[10px] uppercase tracking-[0.2em] font-black text-muted-foreground">Table & Zone</th>
                    <th className="px-6 py-5 text-[10px] uppercase tracking-[0.2em] font-black text-muted-foreground">Settlement</th>
                    <th className="px-6 py-5 text-[10px] uppercase tracking-[0.2em] font-black text-muted-foreground text-right">Amount</th>
                    <th className="px-6 py-5 text-[10px] uppercase tracking-[0.2em] font-black text-muted-foreground text-center">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/50">
                  {invoices.map((inv) => {
                    const table = tables.find(t => t.id === inv.tableId);
                    return (
                      <tr key={inv.id} className="hover:bg-muted/10 transition-all duration-300 group">
                        <td className="px-6 py-5">
                          <div className="flex items-center gap-4">
                            <div className="h-10 w-10 rounded-xl bg-primary/5 flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-all duration-500 shadow-sm border border-primary/10">
                              <Receipt className="h-5 w-5" />
                            </div>
                            <div>
                              <p className="text-sm font-black text-foreground font-mono tracking-tight">{inv.billNumber || "PRV-INV"}</p>
                              <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground font-bold mt-1 uppercase tracking-wider">
                                <Calendar className="h-3 w-3" />
                                {new Date(inv.reservationTime).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-5">
                          <div>
                            <div className="flex items-center gap-2">
                              <TableIcon className="h-3.5 w-3.5 text-primary/60" />
                              <p className="text-[11px] font-black text-foreground uppercase tracking-tight">{table?.name || "Deleted Table"}</p>
                            </div>
                            <div className="flex items-center gap-2 mt-1">
                              <MapPin className="h-3 w-3 text-muted-foreground" />
                              <p className="text-[10px] text-muted-foreground font-bold uppercase">{table?.location || "N/A"}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-5">
                          <StatusBadge
                            status={inv.status}
                            variant={(inv.status === 'COMPLETED' || inv.status === 'PAID') ? 'success' : 'warning'}
                          />
                        </td>
                        <td className="px-6 py-5 text-right">
                          <div className="flex flex-col items-end">
                            <p className="text-sm font-black text-foreground">Rs {inv.grossTotal?.toLocaleString() || "0"}</p>
                            <p className="text-[9px] text-muted-foreground font-bold uppercase tracking-widest mt-0.5">Subtotal: Rs {inv.subTotal?.toLocaleString() || "0"}</p>
                          </div>
                        </td>
                        <td className="px-6 py-5 text-center">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setSelectedInvoice(inv)}
                            className="h-9 px-4 rounded-xl border-border hover:border-primary hover:text-primary transition-all font-black text-[10px] uppercase tracking-widest gap-2 shadow-sm"
                          >
                            <FileText className="h-3.5 w-3.5" />
                            Breakdown
                          </Button>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>

            {invoices.length === 0 && (
              <div className="p-20 text-center text-muted-foreground text-sm font-bold uppercase tracking-[0.3em] flex flex-col items-center gap-4">
                <div className="h-16 w-16 rounded-full bg-muted/50 flex items-center justify-center mb-2">
                  <Receipt className="h-8 w-8 opacity-20" />
                </div>
                No records found matching filters.
              </div>
            )}

            {/* Pagination Items */}
            {invoicesData && invoicesData.totalPages && invoicesData.totalPages > 1 && (
              <div className="border-t border-border px-8 py-5 flex flex-col sm:flex-row items-center justify-between gap-6 bg-muted/5">
                <span className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em]">
                  Page {page + 1} of {invoicesData.totalPages}
                </span>
                <div className="flex gap-3">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setPage(p => Math.max(0, p - 1))}
                    disabled={page === 0}
                    className="h-10 px-4 rounded-xl font-bold text-xs border-border"
                  >
                    <ChevronLeft className="h-4 w-4 mr-1.5" /> Previous
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setPage(p => p + 1)}
                    disabled={page >= invoicesData.totalPages - 1}
                    className="h-10 px-4 rounded-xl font-bold text-xs border-border"
                  >
                    Next Page <ChevronRight className="h-4 w-4 ml-1.5" />
                  </Button>
                </div>
              </div>
            )}
          </div>
        )}
      </section>

      {/* Invoice Details Breakdown Modal */}
      <Dialog open={!!selectedInvoice} onOpenChange={(open) => !open && setSelectedInvoice(null)}>
        <DialogContent className="max-w-[550px] p-0 overflow-hidden bg-background border-border shadow-2xl rounded-[2.5rem]">
          <DialogTitle className="sr-only">Invoice Detail Breakdown</DialogTitle>
          {selectedInvoice && (
            <div className="flex flex-col h-[85vh] max-h-[800px]">
              {/* Modal Header */}
              <div className="p-8 pb-6 bg-muted/20 border-b border-border/50 relative">
                <div className="flex justify-between items-start mb-6">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary border border-primary/20">
                        <Receipt className="h-4 w-4" />
                      </div>
                      <h3 className="text-2xl font-black tracking-tight text-foreground">{selectedInvoice.billNumber || "PREVIEW BILL"}</h3>
                    </div>
                    <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest pl-10">Invoice Summary & Settlement Detail</p>
                  </div>
                  <StatusBadge
                    status={selectedInvoice.status}
                    variant={(selectedInvoice.status === 'COMPLETED' || selectedInvoice.status === 'PAID') ? 'success' : 'warning'}
                  />
                </div>

                <div className="grid grid-cols-2 gap-6 pl-10">
                  <div className="space-y-1">
                    <span className="text-[9px] font-black text-muted-foreground uppercase tracking-widest">Order Session ID</span>
                    <p className="text-[11px] font-bold text-foreground font-mono truncate">{selectedInvoice.sessionId}</p>
                  </div>
                  <div className="space-y-1">
                    <span className="text-[9px] font-black text-muted-foreground uppercase tracking-widest">Table Assignment</span>
                    <p className="text-[11px] font-bold text-foreground uppercase tracking-tight">
                      {tables.find(t => t.id === selectedInvoice.tableId)?.name || "Unknown Table"}
                    </p>
                  </div>
                </div>
              </div>

              {/* Items List */}
              <div className="flex-1 overflow-y-auto custom-scrollbar p-8 space-y-6">
                <div className="space-y-4">
                  <div className="flex items-center gap-3 mb-2">
                    <TrendingUp className="h-4 w-4 text-primary" />
                    <h4 className="text-[11px] font-black text-foreground uppercase tracking-[0.2em]">Order Itemized Breakdown</h4>
                  </div>

                  <div className="space-y-3">
                    {selectedInvoice.items && selectedInvoice.items.length > 0 ? (
                      selectedInvoice.items.map((item, idx) => (
                        <div key={idx} className="flex items-center justify-between p-4 rounded-2xl bg-muted/10 border border-border/30 hover:border-primary/20 transition-colors group">
                          <div className="flex items-center gap-4">
                            <div className="h-10 w-10 rounded-xl bg-card border border-border flex items-center justify-center text-[10px] font-black text-foreground group-hover:border-primary/20 transition-colors shadow-sm">
                              {item.quantity}×
                            </div>
                            <div>
                              <p className="text-xs font-black text-foreground uppercase tracking-tight">{item.name}</p>
                              <p className="text-[10px] text-muted-foreground font-bold mt-0.5">Rate: Rs {item.price?.toLocaleString() || "0"}</p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="text-xs font-black text-foreground">Rs {(item.price * item.quantity).toLocaleString()}</p>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="p-12 rounded-2xl border border-dashed border-border flex flex-col items-center justify-center gap-3 bg-muted/5">
                        <Info className="h-6 w-6 text-muted-foreground/30" />
                        <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">No individual item data available</p>
                      </div>
                    )}
                  </div>
                </div>

                <div className="pt-4 space-y-4">
                  <div className="flex items-center gap-3 mb-2">
                    <Clock className="h-4 w-4 text-primary" />
                    <h4 className="text-[11px] font-black text-foreground uppercase tracking-[0.2em]">Service Timeline</h4>
                  </div>
                  <div className="flex items-center gap-4 bg-primary/5 p-4 rounded-2xl border border-primary/10">
                    <div className="flex-1 space-y-1">
                      <span className="text-[9px] font-black text-muted-foreground uppercase tracking-widest">Reservation Start</span>
                      <p className="text-xs font-bold text-foreground">
                        {selectedInvoice.reservationTime ? new Date(selectedInvoice.reservationTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }) : "N/A"}
                      </p>
                    </div>
                    <ArrowRight className="h-4 w-4 text-primary/30" />
                    <div className="flex-1 space-y-1 text-right">
                      <span className="text-[9px] font-black text-muted-foreground uppercase tracking-widest">Checkout Time</span>
                      <p className="text-xs font-bold text-foreground">
                        {selectedInvoice.reservationEndTime ? new Date(selectedInvoice.reservationEndTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }) : "ACTIVE"}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Summary Footer */}
              <div className="p-8 bg-card border-t border-border shadow-[0_-10px_40px_rgba(0,0,0,0.05)] text-foreground">
                <div className="space-y-2 mb-6">
                  <div className="flex justify-between items-center text-xs font-bold text-muted-foreground uppercase tracking-widest">
                    <span>Sub Total (Net)</span>
                    <span>Rs {selectedInvoice.subTotal?.toLocaleString() || "0"}</span>
                  </div>
                  <div className="flex justify-between items-center text-xs font-bold text-muted-foreground uppercase tracking-widest">
                    <span>Discount</span>
                    <span>Rs {(selectedInvoice.grossTotal - selectedInvoice.subTotal)?.toLocaleString() || "0"}</span>
                  </div>
                </div>
                <div className="p-5 rounded-2xl bg-foreground text-background flex justify-between items-center shadow-xl">
                  <div className="space-y-0.5">
                    <span className="text-[10px] font-black uppercase tracking-[0.2em] opacity-60">Total Bill Amount</span>
                    <p className="text-2xl font-black tracking-tighter">Rs {selectedInvoice.grossTotal?.toLocaleString(undefined, { minimumFractionDigits: 2 }) || "0.00"}</p>
                  </div>
                  <div className="h-10 w-[1px] bg-background/20" />
                  <button 
                    onClick={handlePrint} 
                    disabled={isPrinting} 
                    className="text-[10px] font-black uppercase tracking-[0.3em] bg-background/10 hover:bg-background/20 px-5 h-10 rounded-xl transition-all border border-background/10 flex items-center justify-center min-w-[120px] disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isPrinting ? <Loader2 className="h-4 w-4 animate-spin" /> : "Print Bill"}
                  </button>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
