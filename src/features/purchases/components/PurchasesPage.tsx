import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Receipt, Loader2, ChevronLeft, ChevronRight, Calendar, User, CreditCard, Search, ArrowUpRight } from 'lucide-react';
import { usePurchases } from '../api';
import { useVendors } from '@/features/vendors/api';
import { PurchaseResponse } from '../types';
import { Button } from '@/components/ui/button';
import { cn } from "@/lib/utils";

export default function PurchasesPage() {
  const navigate = useNavigate();
  const [page, setPage] = useState(0);

  const { data: purchases, isLoading } = usePurchases({ page, size: 10 });
  const { data: vendors } = useVendors();

  // Map vendor names
  const vendorMap = vendors?.data.reduce((acc, v) => ({ ...acc, [v.id]: v.name }), {} as Record<string, string>) || {};

  return (
    <div className="p-6 md:p-8 space-y-10 animate-in max-w-[1400px] mx-auto">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-border pb-6">
        <div className="space-y-2">
          <div className="flex items-center gap-3">
            <h2 className="text-3xl font-black tracking-tight text-foreground">Purchases</h2>
            <div className="h-6 w-[1px] bg-border hidden md:block" />
          </div>
          <p className="text-muted-foreground text-sm font-medium flex items-center gap-2">
            <Receipt className="h-4 w-4" /> Manage inventory acquisitions and vendor billing.
          </p>
        </div>
        
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <div className="relative flex-1 sm:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input 
              placeholder="Search invoices..." 
              className="w-full bg-card border border-border rounded-xl h-10 pl-10 pr-4 text-sm font-semibold text-foreground outline-none focus:ring-2 focus:ring-primary/20 transition-all shadow-sm"
            />
          </div>
          <Button 
            onClick={() => navigate('/purchases/new')} 
            className="h-10 rounded-xl font-bold uppercase tracking-widest text-xs"
          >
            <Plus className="mr-2 h-4 w-4" /> New Acquisition
          </Button>
        </div>
      </div>

      {isLoading ? (
        <div className="space-y-3">
          {[1, 2, 3].map(i => <div key={i} className="h-16 bg-muted/50 rounded-xl animate-pulse" />)}
        </div>
      ) : (
        <div className="bg-card shadow-sm rounded-2xl overflow-hidden border border-border">
          <div className="overflow-x-auto custom-scrollbar">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-muted/30 border-b border-border">
                  <th className="px-6 py-4 text-[10px] uppercase tracking-[0.2em] font-black text-muted-foreground">Invoice</th>
                  <th className="px-6 py-4 text-[10px] uppercase tracking-[0.2em] font-black text-muted-foreground">Vendor</th>
                  <th className="px-6 py-4 text-[10px] uppercase tracking-[0.2em] font-black text-muted-foreground">Type</th>
                  <th className="px-6 py-4 text-[10px] uppercase tracking-[0.2em] font-black text-muted-foreground text-right">Total</th>
                  <th className="px-6 py-4 text-[10px] uppercase tracking-[0.2em] font-black text-muted-foreground text-center">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {purchases?.data.map((purchase: PurchaseResponse) => (
                  <tr key={purchase.id} className="hover:bg-muted/20 transition-colors group">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-4">
                        <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center text-[10px] font-bold text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-all">
                          <Receipt className="h-4 w-4" />
                        </div>
                        <div>
                          <p className="text-xs font-bold text-foreground font-mono">{purchase.invoiceNumber}</p>
                          <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground font-bold mt-1">
                            <Calendar className="h-3 w-3" />
                            {new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-foreground">
                          {(purchase.vendorId && vendorMap[purchase.vendorId]) || "Unknown Vendor"}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <span className={cn("px-2 py-0.5 rounded-md text-[9px] font-black tracking-[0.2em] uppercase border", 
                            purchase.billingType === 'VAT' ? "bg-emerald-50 text-emerald-600 border-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/20" : 
                            "bg-amber-50 text-amber-600 border-amber-200 dark:bg-amber-500/10 dark:text-amber-400 dark:border-amber-500/20"
                          )}>
                            {purchase.billingType}
                          </span>
                        </div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex flex-col items-end">
                        <p className="text-[13px] font-black text-foreground">Rs {purchase.grossTotal.toLocaleString()}</p>
                        <p className="text-[9px] text-muted-foreground font-bold uppercase tracking-widest mt-0.5">VAT: Rs {purchase.vatAmount.toLocaleString()}</p>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="h-8 w-8 p-0 rounded-lg text-muted-foreground hover:text-primary hover:bg-primary/10 transition-all mx-auto"
                      >
                        <ArrowUpRight className="h-4 w-4" />
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {(!purchases || purchases.data.length === 0) && (
            <div className="p-12 text-center text-muted-foreground text-sm font-bold uppercase tracking-widest flex flex-col items-center gap-3">
              <Receipt className="h-8 w-8 opacity-20" />
              No records found.
            </div>
          )}

          {/* Pagination Footer */}
          {purchases && purchases.totalPages > 1 && (
            <div className="border-t border-border px-6 py-4 flex flex-col sm:flex-row items-center justify-between gap-4 bg-muted/5">
              <span className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.1em]">
                Page {page + 1} of {purchases.totalPages} 
              </span>
              <div className="flex gap-2">
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => setPage(p => Math.max(0, p - 1))}
                  disabled={page === 0}
                  className="h-8 rounded-lg font-bold text-xs"
                >
                  <ChevronLeft className="h-4 w-4 mr-1" /> Prev
                </Button>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => setPage(p => p + 1)}
                  disabled={page >= purchases.totalPages - 1}
                  className="h-8 rounded-lg font-bold text-xs"
                >
                  Next <ChevronRight className="h-4 w-4 ml-1" />
                </Button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
