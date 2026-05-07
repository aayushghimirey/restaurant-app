import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Plus, Receipt, ChevronLeft, ChevronRight, Calendar,
  Search, ArrowUpRight, X, Filter, Banknote, Building2, Landmark, Smartphone
} from 'lucide-react';
import { usePurchases } from '../api';
import { useVendors } from '@/features/vendors/api';
import { PurchaseResponse, BillingType, MoneyTransaction } from '../types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { VendorSelector } from './VendorSelector';
import { PurchaseDetailSheet } from './PurchaseDetailSheet';
import { cn } from "@/lib/utils";

export default function PurchasesPage() {
  const navigate = useNavigate();
  const [page, setPage] = useState(0);
  const [invoiceNumber, setInvoiceNumber] = useState("");
  const [vendorId, setVendorId] = useState("all");
  const [billingType, setBillingType] = useState<BillingType | "all">("all");
  const [moneyTransaction, setMoneyTransaction] = useState<MoneyTransaction | "all">("all");
  const [selectedPurchase, setSelectedPurchase] = useState<PurchaseResponse | null>(null);

  const queryParams = useMemo(() => ({
    page,
    size: 15,
    invoiceNumber: invoiceNumber || undefined,
    vendorId: vendorId === "all" ? undefined : vendorId,
    billingType: billingType === "all" ? undefined : billingType,
    moneyTransaction: moneyTransaction === "all" ? undefined : moneyTransaction,
  }), [page, invoiceNumber, vendorId, billingType, moneyTransaction]);

  const { data: purchasesData, isLoading } = usePurchases(queryParams);
  const { data: vendorsData } = useVendors();

  const handleReset = () => {
    setInvoiceNumber("");
    setVendorId("all");
    setBillingType("all");
    setMoneyTransaction("all");
    setPage(0);
  };

  const purchases = purchasesData?.data || [];
  const vendorOptions = useMemo(() => {
    return vendorsData?.data.map(v => ({ id: v.id, name: v.name, contactNumber: v.contactNumber, address: v.address })) || [];
  }, [vendorsData]);

  return (
    <div className="p-6 md:p-8 space-y-8 animate-in max-w-[1400px] mx-auto">
      {/* Header */}
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
        
        <Button 
          onClick={() => navigate('/purchases/new')} 
          className="h-10 rounded-xl font-bold uppercase tracking-widest text-xs"
        >
          <Plus className="mr-2 h-4 w-4" /> New Acquisition
        </Button>
      </div>

      {/* Filter Bar */}
      <div className="space-y-4 bg-muted/20 p-5 rounded-[2rem] border border-border/50 backdrop-blur-sm shadow-inner">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Invoice Number */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
            <Input 
              placeholder="Search Invoice #" 
              value={invoiceNumber}
              onChange={(e) => { setInvoiceNumber(e.target.value); setPage(0); }}
              className="pl-9 h-11 rounded-xl bg-card border-border font-bold text-xs"
            />
          </div>

          {/* Vendor Selector */}
          <VendorSelector 
            options={vendorOptions}
            value={vendorId}
            onChange={(id) => { setVendorId(id); setPage(0); }}
            placeholder="Select Vendor"
          />

          {/* Billing Type Toggle */}
          <div className="flex bg-card p-1 rounded-xl border border-border h-11 shrink-0">
            {(['all', 'VAT', 'PAN', 'NO_BILL'] as const).map((type) => (
              <button
                key={type}
                onClick={() => { setBillingType(type); setPage(0); }}
                className={cn(
                  "flex-1 text-[10px] font-black uppercase tracking-widest rounded-lg transition-all",
                  billingType === type ? "bg-primary text-primary-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
                )}
              >
                {type === 'all' ? 'Any Bill' : type}
              </button>
            ))}
          </div>

          {/* Money Transaction Toggle */}
          <div className="flex bg-card p-1 rounded-xl border border-border h-11 shrink-0">
             {(['all', 'CASH', 'BANK', 'FONE_PAY'] as const).map((type) => (
                <button
                  key={type}
                  onClick={() => { setMoneyTransaction(type); setPage(0); }}
                  className={cn(
                    "flex-1 text-[9px] font-black uppercase tracking-tighter rounded-lg transition-all px-1",
                    moneyTransaction === type ? "bg-primary text-primary-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
                  )}
                >
                  {type === 'all' ? 'Any Pay' : type === 'FONE_PAY' ? 'QR' : type}
                </button>
              ))}
          </div>
        </div>

        <div className="flex items-center justify-between pt-2 border-t border-border/50">
           <div className="flex items-center gap-4">
              <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary/5 border border-primary/10 text-[9px] font-black text-primary uppercase tracking-widest">
                 <Filter className="h-3 w-3" /> Filters Active
              </div>
              {purchasesData && (
                <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
                  Showing {purchases.length} of {purchasesData.totalElements} records
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
                  <th className="px-6 py-5 text-[10px] uppercase tracking-[0.2em] font-black text-muted-foreground">Invoice Detail</th>
                  <th className="px-6 py-5 text-[10px] uppercase tracking-[0.2em] font-black text-muted-foreground">Vendor Entity</th>
                  <th className="px-6 py-5 text-[10px] uppercase tracking-[0.2em] font-black text-muted-foreground">Payment & Bill</th>
                  <th className="px-6 py-5 text-[10px] uppercase tracking-[0.2em] font-black text-muted-foreground text-right">Total Value</th>
                  <th className="px-6 py-5 text-[10px] uppercase tracking-[0.2em] font-black text-muted-foreground text-center">Detail</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/50">
                {purchases.map((purchase) => (
                  <tr key={purchase.id} className="hover:bg-muted/10 transition-all duration-300 group">
                    <td className="px-6 py-5">
                      <div className="flex items-center gap-4">
                        <div className="h-10 w-10 rounded-xl bg-primary/5 flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-all duration-500 shadow-sm border border-primary/10">
                          <Receipt className="h-5 w-5" />
                        </div>
                        <div>
                          <p className="text-sm font-black text-foreground font-mono tracking-tight">{purchase.invoiceNumber}</p>
                          <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground font-bold mt-1 uppercase tracking-wider">
                            <Calendar className="h-3 w-3" />
                            {purchase.createdAt ? new Date(purchase.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : "N/A"}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-5">
                      <div className="flex items-center gap-3">
                        <div className="h-8 w-8 rounded-lg bg-muted flex items-center justify-center border border-border">
                           <Building2 className="h-4 w-4 text-muted-foreground" />
                        </div>
                        <div>
                          <p className="text-xs font-black text-foreground uppercase tracking-tight">{purchase.vendorName || "Unknown"}</p>
                          <p className="text-[10px] text-muted-foreground font-bold">ID: {purchase.vendorId?.substring(0, 8)}...</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-5">
                        <div className="flex flex-col gap-1.5">
                          <div className="flex items-center gap-2">
                             <div className={cn("px-2 py-0.5 rounded text-[9px] font-black tracking-widest uppercase border", 
                               purchase.billingType === 'VAT' ? "bg-emerald-50 text-emerald-600 border-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/20" : 
                               purchase.billingType === 'PAN' ? "bg-blue-50 text-blue-600 border-blue-200 dark:bg-blue-500/10 dark:text-blue-400 dark:border-blue-500/20" :
                               "bg-slate-50 text-slate-500 border-slate-200 dark:bg-slate-500/10 dark:text-slate-400 dark:border-slate-500/20"
                             )}>
                               {purchase.billingType}
                             </div>
                             <div className={cn("px-2 py-0.5 rounded text-[9px] font-black tracking-widest uppercase border flex items-center gap-1", 
                               purchase.moneyTransaction === 'CASH' ? "bg-amber-50 text-amber-600 border-amber-200" :
                               purchase.moneyTransaction === 'BANK' ? "bg-indigo-50 text-indigo-600 border-indigo-200" :
                               "bg-purple-50 text-purple-600 border-purple-200"
                             )}>
                               {purchase.moneyTransaction === 'BANK' ? <Landmark className="h-2.5 w-2.5" /> : 
                                purchase.moneyTransaction === 'FONE_PAY' ? <Smartphone className="h-2.5 w-2.5" /> : 
                                <Banknote className="h-2.5 w-2.5" />}
                               {purchase.moneyTransaction.replace('_', ' ')}
                             </div>
                          </div>
                        </div>
                    </td>
                    <td className="px-6 py-5 text-right">
                      <div className="flex flex-col items-end">
                        <p className="text-sm font-black text-foreground">Rs {purchase.grossTotal.toLocaleString(undefined, { minimumFractionDigits: 2 })}</p>
                        <p className="text-[9px] text-muted-foreground font-bold uppercase tracking-widest mt-0.5">NET: Rs {purchase.subTotal.toLocaleString()}</p>
                      </div>
                    </td>
                    <td className="px-6 py-5 text-center">
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={() => setSelectedPurchase(purchase)}
                        className="h-9 w-9 p-0 rounded-xl border-border hover:border-primary hover:text-primary transition-all mx-auto shadow-sm"
                      >
                        <ArrowUpRight className="h-4 w-4" />
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {purchases.length === 0 && (
            <div className="p-20 text-center text-muted-foreground text-sm font-bold uppercase tracking-[0.3em] flex flex-col items-center gap-4">
              <div className="h-16 w-16 rounded-full bg-muted/50 flex items-center justify-center mb-2">
                 <Receipt className="h-8 w-8 opacity-20" />
              </div>
              No purchase records matching filters.
            </div>
          )}

          {/* Pagination Footer */}
          {purchasesData && purchasesData.totalPages > 1 && (
            <div className="border-t border-border px-8 py-5 flex flex-col sm:flex-row items-center justify-between gap-6 bg-muted/5">
              <span className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em]">
                Page {page + 1} of {purchasesData.totalPages} 
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
                  disabled={page >= purchasesData.totalPages - 1}
                  className="h-10 px-4 rounded-xl font-bold text-xs border-border"
                >
                  Next Page <ChevronRight className="h-4 w-4 ml-1.5" />
                </Button>
              </div>
            </div>
          )}
        </div>
      )}

      <PurchaseDetailSheet 
        purchase={selectedPurchase}
        isOpen={!!selectedPurchase}
        onClose={() => setSelectedPurchase(null)}
      />
    </div>
  );
}
