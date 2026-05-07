import {
  Sheet, SheetContent,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetDescription
} from '@/components/ui/Sheet';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import {
  ArrowRight,
  Banknote,
  CheckCircle2,
  ChevronRight,
  CreditCard,
  Info,
  Landmark,
  Receipt,
  ShoppingBag,
  Smartphone,
  Tag,
  FileText,
  Hash,
  Ban,
  EyeOff,
} from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { CreateInvoiceCommand, Invoice, InvoiceItemResponse as InvoiceItem, MoneyTransaction, BillingType } from '../types';

interface SettleInvoiceSheetProps {
  invoice: Invoice | null;
  isOpen: boolean;
  onClose: () => void;
  onSettle: (command: CreateInvoiceCommand) => void;
  isPending: boolean;
}

export function SettleInvoiceSheet({
  invoice,
  isOpen,
  onClose,
  onSettle,
  isPending
}: SettleInvoiceSheetProps) {
  const [moneyTransaction, setMoneyTransaction] = useState<MoneyTransaction>('CASH');
  const [invoiceType, setInvoiceType] = useState<BillingType>('NO_BILL');
  const [discount, setDiscount] = useState<string>('0');
  const [hiddenItemIds, setHiddenItemIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (isOpen) {
      setHiddenItemIds(new Set());
      setDiscount('0');
      setMoneyTransaction('CASH');
      setInvoiceType('NO_BILL');
    }
  }, [isOpen]);

  const toggleItemVisibility = (itemId: string | undefined) => {
    // Guard: if item has no id, we cannot track it — skip silently
    if (!itemId) return;
    setHiddenItemIds(prev => {
      const next = new Set(prev);
      if (next.has(itemId)) {
        next.delete(itemId);
      } else {
        next.add(itemId);
      }
      return next;
    });
  };

  // Resolve the stable ID for an item — checks both 'id' and 'itemId' in case
  // the API response uses a different field name than the TypeScript type declares.
  const resolveItemId = (item: InvoiceItem): string | undefined => {
    return (item as any).id ?? (item as any).itemId ?? undefined;
  };

  const discountValue = parseFloat(discount) || 0;
  const hiddenCount = hiddenItemIds.size;

  const vatAmount = useMemo(() => {
    if (!invoice) return 0;
    const baseTotal = Math.max(0, invoice.grossTotal - discountValue);
    return invoiceType === 'VAT' ? baseTotal * 0.13 : 0;
  }, [invoice, discountValue, invoiceType]);

  const finalTotal = useMemo(() => {
    if (!invoice) return 0;
    const baseTotal = Math.max(0, invoice.grossTotal - discountValue);
    return baseTotal + vatAmount;
  }, [invoice, discountValue, vatAmount]);

  if (!invoice) return null;

  const paymentMethods: { id: MoneyTransaction; label: string; icon: any; desc: string }[] = [
    { id: 'CASH', label: 'Cash', icon: Banknote, desc: 'Physical currency' },
    { id: 'BANK', label: 'Bank Transfer', icon: Landmark, desc: 'Direct bank transfer' },
    { id: 'FONE_PAY', label: 'FonePay / QR', icon: Smartphone, desc: 'Mobile QR payment' },
  ];

  const billingTypes: { id: BillingType; label: string; icon: any; desc: string }[] = [
    { id: 'VAT', label: 'VAT', icon: FileText, desc: '13% VAT' },
    { id: 'PAN', label: 'PAN', icon: Hash, desc: 'PAN bill' },
    { id: 'NO_BILL', label: 'No Bill', icon: Ban, desc: 'No record' },
  ];

  const handleSubmit = () => {
    onSettle({
      invoiceType,
      moneyTransaction,
      discount: discountValue,
      hiddenItemIds: Array.from(hiddenItemIds),
    });
  };

  const totalItems = invoice.items?.length ?? 0;
  const visibleItems = totalItems - hiddenCount;

  return (
    <Sheet open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <SheetContent className="flex flex-col h-full bg-background border-l border-border/50 p-0 sm:max-w-lg shadow-2xl">

        {/* ── Header ── */}
        <SheetHeader className="px-6 py-4 border-b border-border/50 shrink-0">
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-xl bg-primary/10 flex items-center justify-center text-primary border border-primary/20 shrink-0">
              <Receipt className="h-4 w-4" />
            </div>
            <div className="flex-1 min-w-0">
              <SheetTitle className="text-base leading-tight">Checkout Settlement</SheetTitle>
              <SheetDescription className="text-xs mt-0.5 truncate">
                {invoice.billNumber || invoice.id?.substring(0, 8)}
              </SheetDescription>
            </div>
            {hiddenCount > 0 && (
              <div className="shrink-0 flex items-center gap-1.5 text-[10px] font-bold px-2.5 py-1.5 rounded-lg bg-amber-50 text-amber-700 border border-amber-200 dark:bg-amber-500/10 dark:text-amber-400 dark:border-amber-500/20">
                <EyeOff className="h-3 w-3" />
                {hiddenCount} hidden
              </div>
            )}
          </div>
        </SheetHeader>

        {/* ── Scrollable body ── */}
        {/* min-h-0 is essential: flex children don't shrink by default,
            so without it overflow-y-auto has no effect and the sheet overflows */}
        <div className="flex-1 overflow-y-auto min-h-0 px-6 py-5 space-y-7">

          {/* ── 1. Items ── */}
          <section>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <ShoppingBag className="h-3.5 w-3.5 text-primary" />
                <span className="text-[10px] font-black uppercase tracking-[0.18em] text-foreground">
                  Order Items
                </span>
              </div>
              <div className="flex items-center gap-2 text-[10px] font-bold">
                {hiddenCount > 0 && (
                  <span className="text-destructive">{visibleItems} on bill ·</span>
                )}
                <span className="text-muted-foreground">{totalItems} total</span>
              </div>
            </div>

            {/* Column labels */}
            {totalItems > 0 && (
              <div className="grid grid-cols-[32px_1fr_36px_72px] gap-x-2 px-2 mb-1.5">
                <span className="text-[9px] font-black uppercase tracking-widest text-muted-foreground text-center">Bill</span>
                <span className="text-[9px] font-black uppercase tracking-widest text-muted-foreground">Item</span>
                <span className="text-[9px] font-black uppercase tracking-widest text-muted-foreground text-right">Qty</span>
                <span className="text-[9px] font-black uppercase tracking-widest text-muted-foreground text-right">Amount</span>
              </div>
            )}

            <div className="space-y-1">
              {invoice.items?.map((item, idx) => {
                const itemId = resolveItemId(item);
                // Only treat as hidden if we have a valid id AND it's in the set
                const isHidden = !!itemId && hiddenItemIds.has(itemId);

                return (
                  <div
                    key={itemId ?? idx}
                    className={cn(
                      'grid grid-cols-[32px_1fr_36px_72px] gap-x-2 px-2 py-2 rounded-lg border items-center transition-colors',
                      isHidden
                        ? 'bg-destructive/5 border-destructive/25'
                        : 'bg-muted/20 border-border/30 hover:border-border/60'
                    )}
                  >
                    {/* Visibility toggle */}
                    <button
                      onClick={() => toggleItemVisibility(itemId)}
                      disabled={!itemId}
                      title={
                        !itemId
                          ? 'Cannot toggle — item has no ID'
                          : isHidden
                            ? 'Include in bill'
                            : 'Exclude from bill'
                      }
                      className={cn(
                        'w-8 h-8 rounded-md border-2 flex items-center justify-center transition-all shrink-0',
                        !itemId
                          ? 'opacity-30 cursor-not-allowed border-border bg-muted'
                          : isHidden
                            ? 'bg-destructive border-destructive text-white'
                            : 'bg-background border-border hover:border-emerald-500 hover:bg-emerald-50 dark:hover:bg-emerald-500/10'
                      )}
                    >
                      {isHidden ? (
                        <EyeOff className="h-3.5 w-3.5" />
                      ) : (
                        <span className="w-2.5 h-2.5 rounded-sm bg-emerald-500 block" />
                      )}
                    </button>

                    {/* Name + unit price */}
                    <div className="min-w-0">
                      <p className={cn(
                        'text-xs font-bold leading-tight truncate',
                        isHidden ? 'text-muted-foreground line-through' : 'text-foreground'
                      )}>
                        {item.name}
                      </p>
                      <p className="text-[10px] text-muted-foreground mt-0.5">
                        Rs {item.price.toLocaleString()}
                      </p>
                    </div>

                    {/* Quantity */}
                    <span className={cn(
                      'text-xs font-bold text-right',
                      isHidden ? 'text-muted-foreground' : 'text-foreground'
                    )}>
                      ×{item.quantity}
                    </span>

                    {/* Line total */}
                    <span className={cn(
                      'text-xs font-black text-right',
                      isHidden ? 'text-muted-foreground line-through' : 'text-foreground'
                    )}>
                      Rs {(item.price * item.quantity).toLocaleString()}
                    </span>
                  </div>
                );
              })}

              {totalItems === 0 && (
                <div className="py-8 border border-dashed border-border rounded-xl flex flex-col items-center gap-2 opacity-40">
                  <Info className="h-4 w-4" />
                  <p className="text-[10px] font-bold uppercase tracking-widest">No items</p>
                </div>
              )}
            </div>

            {hiddenCount > 0 && (
              <div className="mt-2 px-3 py-2 rounded-lg bg-destructive/5 border border-destructive/20 flex items-center gap-2">
                <EyeOff className="h-3.5 w-3.5 text-destructive shrink-0" />
                <p className="text-[10px] font-bold text-destructive">
                  {hiddenCount} item{hiddenCount > 1 ? 's' : ''} excluded — will appear as "Unknown" on the printed receipt
                </p>
              </div>
            )}
          </section>

          {/* ── 2. Billing Type ── */}
          <section>
            <div className="flex items-center gap-2 mb-3">
              <Receipt className="h-3.5 w-3.5 text-primary" />
              <span className="text-[10px] font-black uppercase tracking-[0.18em] text-foreground">Billing Type</span>
            </div>
            <div className="grid grid-cols-3 gap-2">
              {billingTypes.map((type) => {
                const Icon = type.icon;
                const isSelected = invoiceType === type.id;
                return (
                  <button
                    key={type.id}
                    onClick={() => setInvoiceType(type.id)}
                    className={cn(
                      'flex flex-col items-center gap-2 p-3 rounded-xl border transition-all',
                      isSelected
                        ? 'bg-primary/5 border-primary ring-1 ring-primary/20'
                        : 'bg-card border-border/50 hover:border-primary/40 hover:bg-muted/20'
                    )}
                  >
                    <div className={cn(
                      'h-8 w-8 rounded-lg flex items-center justify-center transition-all',
                      isSelected ? 'bg-primary text-primary-foreground' : 'bg-muted/50 border border-border text-muted-foreground'
                    )}>
                      <Icon className="h-4 w-4" />
                    </div>
                    <div className="text-center">
                      <p className={cn('text-[11px] font-black uppercase tracking-tight leading-tight', isSelected ? 'text-primary' : 'text-foreground')}>
                        {type.label}
                      </p>
                      <p className="text-[9px] text-muted-foreground mt-0.5 leading-tight">{type.desc}</p>
                    </div>
                    {isSelected && <CheckCircle2 className="h-3.5 w-3.5 text-primary" />}
                  </button>
                );
              })}
            </div>
          </section>

          {/* ── 3. Payment Method ── */}
          <section>
            <div className="flex items-center gap-2 mb-3">
              <CreditCard className="h-3.5 w-3.5 text-primary" />
              <span className="text-[10px] font-black uppercase tracking-[0.18em] text-foreground">Payment Method</span>
            </div>
            <div className="space-y-2">
              {paymentMethods.map((method) => {
                const Icon = method.icon;
                const isSelected = moneyTransaction === method.id;
                return (
                  <button
                    key={method.id}
                    onClick={() => setMoneyTransaction(method.id)}
                    className={cn(
                      'w-full flex items-center justify-between px-4 py-3 rounded-xl border transition-all',
                      isSelected
                        ? 'bg-primary/5 border-primary ring-1 ring-primary/20'
                        : 'bg-card border-border/50 hover:border-primary/40 hover:bg-muted/20'
                    )}
                  >
                    <div className="flex items-center gap-3">
                      <div className={cn(
                        'h-9 w-9 rounded-lg flex items-center justify-center transition-all shrink-0',
                        isSelected ? 'bg-primary text-primary-foreground' : 'bg-muted/50 border border-border text-muted-foreground'
                      )}>
                        <Icon className="h-4 w-4" />
                      </div>
                      <div className="text-left">
                        <p className={cn('text-sm font-black uppercase tracking-tight', isSelected ? 'text-primary' : 'text-foreground')}>
                          {method.label}
                        </p>
                        <p className="text-[10px] text-muted-foreground">{method.desc}</p>
                      </div>
                    </div>
                    {isSelected
                      ? <CheckCircle2 className="h-4 w-4 text-primary shrink-0" />
                      : <ChevronRight className="h-4 w-4 text-muted-foreground/30 shrink-0" />
                    }
                  </button>
                );
              })}
            </div>
          </section>

          {/* ── 4. Discount ── */}
          <section>
            <div className="flex items-center gap-2 mb-3">
              <Tag className="h-3.5 w-3.5 text-primary" />
              <span className="text-[10px] font-black uppercase tracking-[0.18em] text-foreground">Discount</span>
            </div>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-sm font-black text-muted-foreground pointer-events-none select-none">Rs</span>
              <Input
                type="number"
                value={discount}
                onChange={(e) => setDiscount(e.target.value)}
                className="h-12 pl-10 rounded-xl border-border/60 bg-muted/20 font-bold text-base focus:border-primary/60"
                placeholder="0.00"
                min="0"
              />
            </div>
          </section>
        </div>

        {/* ── Footer ── */}
        <SheetFooter className="px-6 py-4 bg-card border-t border-border/60 shrink-0">
          <div className="w-full space-y-4">
            <div className="space-y-1.5">
              <div className="flex justify-between items-center text-xs text-muted-foreground font-bold uppercase tracking-widest">
                <span>Base Amount</span>
                <span>Rs {invoice.grossTotal.toLocaleString()}</span>
              </div>
              {discountValue > 0 && (
                <div className="flex justify-between items-center text-xs font-bold uppercase tracking-widest text-emerald-600 dark:text-emerald-400">
                  <span>Discount</span>
                  <span>− Rs {discountValue.toLocaleString()}</span>
                </div>
              )}
              {invoiceType === 'VAT' && (
                <div className="flex justify-between items-center text-xs font-bold uppercase tracking-widest text-primary">
                  <span>VAT (13%)</span>
                  <span>+ Rs {vatAmount.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                </div>
              )}
              {hiddenCount > 0 && (
                <div className="flex justify-between items-center text-xs font-bold uppercase tracking-widest text-destructive">
                  <span>Hidden from bill</span>
                  <span>{hiddenCount} item{hiddenCount > 1 ? 's' : ''}</span>
                </div>
              )}
              <div className="flex justify-between items-center pt-2 border-t border-border/50">
                <span className="text-xs font-black uppercase tracking-widest">Payable Total</span>
                <span className="text-2xl font-black tracking-tight text-foreground">
                  Rs {finalTotal.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                </span>
              </div>
            </div>

            <div className="flex gap-3">
              <Button
                variant="outline"
                onClick={onClose}
                className="flex-1 h-12 rounded-xl text-xs font-black uppercase tracking-widest hover:bg-destructive/10 hover:border-destructive/30 hover:text-destructive transition-all"
              >
                Cancel
              </Button>
              <Button
                onClick={handleSubmit}
                disabled={isPending}
                className="flex-[2] h-12 rounded-xl font-black uppercase tracking-[0.25em] text-[11px] gap-3 transition-all active:scale-[0.98]"
              >
                {isPending ? (
                  <div className="h-4 w-4 border-2 border-current/30 border-t-current rounded-full animate-spin" />
                ) : (
                  <>Finalize <ArrowRight className="h-4 w-4" /></>
                )}
              </Button>
            </div>
          </div>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}