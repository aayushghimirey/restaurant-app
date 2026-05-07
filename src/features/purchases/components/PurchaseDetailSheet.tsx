import {
  Sheet, SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription
} from '@/components/ui/Sheet';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import {
  Banknote,
  Building2,
  Calendar,
  CreditCard,
  FileText,
  Landmark,
  Package,
  Receipt,
  ShoppingBag,
  Smartphone,
  X
} from 'lucide-react';
import { useMemo } from 'react';
import { PurchaseResponse } from '../types';
import { useStocks } from '@/features/inventory/api';

interface PurchaseDetailSheetProps {
  purchase: PurchaseResponse | null;
  isOpen: boolean;
  onClose: () => void;
}

export function PurchaseDetailSheet({
  purchase,
  isOpen,
  onClose
}: PurchaseDetailSheetProps) {
  const { data: stocksResponse } = useStocks({ size: 100 });

  const allVariants = useMemo(() => {
    return stocksResponse?.data.flatMap(stock =>
      stock.variants
        .filter(v => !!v.id)
        .map(v => ({ ...v, id: v.id as string, stockName: stock.name, baseUnit: v.baseUnit }))
    ) || [];
  }, [stocksResponse]);

  if (!purchase) return null;

  const totalItems = purchase.items?.length ?? 0;

  const getTransactionIcon = (type: string) => {
    if (type === 'BANK') return <Landmark className="h-4 w-4" />;
    if (type === 'FONE_PAY') return <Smartphone className="h-4 w-4" />;
    return <Banknote className="h-4 w-4" />;
  };

  return (
    <Sheet open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <SheetContent className="flex flex-col h-full bg-background border-l border-border/50 p-0 sm:max-w-lg shadow-2xl">
        {/* Header */}
        <SheetHeader className="px-6 py-4 border-b border-border/50 shrink-0">
          <div className="flex items-center justify-between">
             <div className="flex items-center gap-3">
               <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary border border-primary/20 shrink-0">
                 <Receipt className="h-5 w-5" />
               </div>
               <div className="flex-1 min-w-0">
                 <SheetTitle className="text-base leading-tight font-black font-mono">
                   {purchase.invoiceNumber}
                 </SheetTitle>
                 <SheetDescription className="text-xs mt-0.5 truncate flex items-center gap-1.5 font-bold">
                   <Calendar className="h-3 w-3" />
                   {purchase.createdAt ? new Date(purchase.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' }) : "N/A"}
                 </SheetDescription>
               </div>
             </div>
             <Button variant="ghost" size="sm" onClick={onClose} className="h-8 w-8 p-0 rounded-full hover:bg-muted">
                <X className="h-4 w-4" />
             </Button>
          </div>
        </SheetHeader>

        {/* Scrollable body */}
        <div className="flex-1 overflow-y-auto min-h-0 px-6 py-6 space-y-8">
          
          {/* Vendor & Payment Info */}
          <section className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <div className="flex items-center gap-1.5 text-muted-foreground mb-1">
                <Building2 className="h-3.5 w-3.5" />
                <span className="text-[10px] font-black uppercase tracking-widest">Vendor</span>
              </div>
              <p className="text-sm font-black text-foreground">{purchase.vendorName}</p>
              <p className="text-[10px] text-muted-foreground font-bold truncate">ID: {purchase.vendorId}</p>
            </div>
            
            <div className="space-y-2">
              <div className="flex items-center gap-1.5 text-muted-foreground mb-1">
                <CreditCard className="h-3.5 w-3.5" />
                <span className="text-[10px] font-black uppercase tracking-widest">Payment</span>
              </div>
              <div className="flex flex-wrap gap-2 mt-1">
                <div className={cn("px-2 py-1 rounded-md text-[9px] font-black tracking-widest uppercase border flex items-center gap-1.5", 
                   purchase.billingType === 'VAT' ? "bg-emerald-50 text-emerald-600 border-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/20" : 
                   purchase.billingType === 'PAN' ? "bg-blue-50 text-blue-600 border-blue-200 dark:bg-blue-500/10 dark:text-blue-400 dark:border-blue-500/20" :
                   "bg-slate-50 text-slate-500 border-slate-200 dark:bg-slate-500/10 dark:text-slate-400 dark:border-slate-500/20"
                )}>
                  <FileText className="h-3 w-3" />
                  {purchase.billingType}
                </div>
                <div className={cn("px-2 py-1 rounded-md text-[9px] font-black tracking-widest uppercase border flex items-center gap-1.5", 
                   purchase.moneyTransaction === 'CASH' ? "bg-amber-50 text-amber-600 border-amber-200 dark:bg-amber-500/10 dark:text-amber-400 dark:border-amber-500/20" :
                   purchase.moneyTransaction === 'BANK' ? "bg-indigo-50 text-indigo-600 border-indigo-200 dark:bg-indigo-500/10 dark:text-indigo-400 dark:border-indigo-500/20" :
                   "bg-purple-50 text-purple-600 border-purple-200 dark:bg-purple-500/10 dark:text-purple-400 dark:border-purple-500/20"
                )}>
                  {getTransactionIcon(purchase.moneyTransaction)}
                  {purchase.moneyTransaction.replace('_', ' ')}
                </div>
              </div>
            </div>
          </section>

          <hr className="border-border/50" />

          {/* Items */}
          <section>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <ShoppingBag className="h-4 w-4 text-primary" />
                <span className="text-[11px] font-black uppercase tracking-[0.18em] text-foreground">
                  Purchase Items
                </span>
              </div>
              <span className="text-[10px] font-bold text-muted-foreground bg-muted/50 px-2 py-0.5 rounded-md">
                {totalItems} total
              </span>
            </div>

            <div className="space-y-2">
              {purchase.items?.map((item, idx) => {
                const variant = allVariants.find(v => v.id === item.variantId);
                const variantName = variant ? `${variant.stockName} - ${variant.name}` : `Item ID: ${item.variantId.substring(0, 8)}`;
                const unit = variant?.units?.find((u: any) => u.id === item.unitId);
                const unitName = unit ? unit.name : 'Unit';

                return (
                  <div
                    key={idx}
                    className="grid grid-cols-[1fr_auto] gap-x-4 p-3 rounded-xl border bg-muted/10 border-border/40"
                  >
                    <div className="min-w-0">
                      <p className="text-sm font-bold leading-tight text-foreground truncate">
                        {variantName}
                      </p>
                      <div className="flex items-center gap-2 mt-1 text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
                        <span>Rs {item.perUnitPrice.toLocaleString()} / {unitName}</span>
                        <span>•</span>
                        <span>Qty: {item.quantity}</span>
                        {item.discountAmount > 0 && (
                          <>
                            <span>•</span>
                            <span className="text-emerald-500">Disc: Rs {item.discountAmount}</span>
                          </>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center justify-end">
                      <span className="text-sm font-black text-foreground font-mono">
                        Rs {item.netTotal.toLocaleString()}
                      </span>
                    </div>
                  </div>
                );
              })}

              {totalItems === 0 && (
                <div className="py-8 border border-dashed border-border rounded-xl flex flex-col items-center gap-2 opacity-40">
                  <Package className="h-6 w-6" />
                  <p className="text-[10px] font-bold uppercase tracking-widest">No items found</p>
                </div>
              )}
            </div>
          </section>
        </div>

        {/* Footer with Totals */}
        <div className="px-6 py-5 bg-card border-t border-border/60 shrink-0 shadow-[0_-4px_20px_-10px_rgba(0,0,0,0.1)]">
          <div className="w-full space-y-2">
            <div className="flex justify-between items-center text-xs text-muted-foreground font-bold uppercase tracking-widest">
              <span>Subtotal</span>
              <span>Rs {purchase.subTotal.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
            </div>
            {purchase.vatAmount > 0 && (
              <div className="flex justify-between items-center text-xs font-bold uppercase tracking-widest text-primary">
                <span>VAT (13%)</span>
                <span>+ Rs {purchase.vatAmount.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
              </div>
            )}
            {purchase.discountAmount > 0 && (
              <div className="flex justify-between items-center text-xs font-bold uppercase tracking-widest text-emerald-600 dark:text-emerald-400">
                <span>Discount</span>
                <span>− Rs {purchase.discountAmount.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
              </div>
            )}
            <div className="flex justify-between items-end pt-3 mt-1 border-t border-border/50">
              <span className="text-xs font-black uppercase tracking-widest text-foreground">Gross Total</span>
              <span className="text-2xl font-black tracking-tight text-foreground font-mono">
                Rs {purchase.grossTotal.toLocaleString(undefined, { minimumFractionDigits: 2 })}
              </span>
            </div>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
