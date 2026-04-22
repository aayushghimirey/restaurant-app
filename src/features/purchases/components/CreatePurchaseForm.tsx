import { useState, useMemo, useEffect } from 'react';
import { Plus, Trash2, Loader2, Save, X, Calculator, PackageCheck, Info, ChevronDown } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useCreatePurchase } from '../api';
import { useVendors } from '@/features/vendors/api';
import { useStocks } from '@/features/inventory/api';
import { CreatePurchaseCommand, PurchaseItemCommand, BillingType, MoneyTransaction } from '../types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { VariantSelector } from '@/features/inventory/components/VariantSelector';
import { VendorSelector } from '@/features/vendors/components/VendorSelector';

interface Props {
  onSuccess: () => void;
  onCancel: () => void;
}

export default function CreatePurchaseForm({ onSuccess, onCancel }: Props) {
  const mutation = useCreatePurchase();
  const { data: vendors, isLoading: vendorsLoading } = useVendors();
  const { data: stocksResponse, isLoading: stocksLoading } = useStocks({ size: 100 });

  const [formData, setFormData] = useState<CreatePurchaseCommand>(() => {
    const saved = localStorage.getItem('draft-purchase');
    if (saved) {
      try { return JSON.parse(saved); } catch { /* ignore */ }
    }
    return {
      invoiceNumber: '',
      billingType: 'VAT',
      vendorId: '',
      moneyTransaction: 'CASH',
      discountAmount: 0,
      items: [
        { variantId: '', unitId: '', quantity: 1, perUnitPrice: 0, discountAmount: 0 }
      ]
    };
  });

  // Persist draft to local storage whenever it changes
  useEffect(() => {
    localStorage.setItem('draft-purchase', JSON.stringify(formData));
  }, [formData]);

  // Derived data
  const allVariants = useMemo(() => {
    return stocksResponse?.data.flatMap(stock =>
      stock.variants
        .filter(v => !!v.id)
        .map(v => ({ ...v, id: v.id as string, stockName: stock.name, baseUnit: v.baseUnit }))
    ) || [];
  }, [stocksResponse]);

  const subTotal = useMemo(() => {
    return formData.items.reduce((acc, item) => {
      return acc + (item.quantity * item.perUnitPrice) - item.discountAmount;
    }, 0);
  }, [formData.items]);

  const vatAmount = useMemo(() => {
    return formData.billingType === 'VAT' ? subTotal * 0.13 : 0;
  }, [subTotal, formData.billingType]);

  const grossTotal = useMemo(() => {
    return subTotal + vatAmount - formData.discountAmount;
  }, [subTotal, vatAmount, formData.discountAmount]);

  // Handlers
  const addItem = () => {
    setFormData(prev => ({
      ...prev,
      items: [...prev.items, { variantId: '', unitId: '', quantity: 1, perUnitPrice: 0, discountAmount: 0 }]
    }));
  };

  const removeItem = (idx: number) => {
    if (formData.items.length === 1) return;
    setFormData(prev => ({
      ...prev,
      items: prev.items.filter((_, i) => i !== idx)
    }));
  };

  const updateItem = (idx: number, field: keyof PurchaseItemCommand, value: any) => {
    const newItems = [...formData.items];
    newItems[idx] = { ...newItems[idx], [field]: value };

    // Auto-select first purchasable unit if variant changes
    if (field === 'variantId') {
      const variant = allVariants.find(v => v.id === value);
      if (variant) {
        const purchasableUnits = variant.units.filter((u: any) => u.unitType === 'PURCHASE' || u.unitType === 'BOTH');
        if (purchasableUnits.length > 0) {
          newItems[idx].unitId = purchasableUnits[0].id || '';
        } else {
          newItems[idx].unitId = '';
        }
      }
    }

    setFormData(prev => ({ ...prev, items: newItems }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.vendorId) return;
    if (formData.items.some(i => !i.variantId || !i.unitId)) return;

    mutation.mutate(formData, {
      onSuccess: () => {
        localStorage.removeItem('draft-purchase');
        onSuccess()
      }
    });
  };

  if (vendorsLoading || stocksLoading) {
    return (
      <div className="py-20 flex flex-col items-center justify-center space-y-4">
        <Loader2 className="h-10 w-10 text-primary animate-spin" />
        <span className="text-muted-foreground font-black uppercase tracking-widest text-[10px]">Configuring Environment...</span>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-12">
      {/* 1. Header Information */}
      <section className="space-y-8">
        <div className="flex items-center gap-4 border-b border-border pb-4">
          <div className="h-10 w-10 rounded-2xl bg-muted/50 border border-border flex items-center justify-center text-xs font-black text-foreground shadow-sm">
            01
          </div>
          <div>
            <h3 className="text-sm font-black text-foreground uppercase tracking-widest leading-none">Primary Details</h3>
            <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-wider mt-1">Invoice identifiers and vendor logic</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="space-y-3">
            <Label className="text-[9px] font-black uppercase tracking-[0.2em] text-muted-foreground ml-1">Invoice Number</Label>
            <div className="relative group">
              <Input
                placeholder="PRO-INV-001"
                value={formData.invoiceNumber}
                onChange={e => setFormData({ ...formData, invoiceNumber: e.target.value })}
                required
                className="h-12 bg-card border-border rounded-xl font-bold text-foreground placeholder:text-muted-foreground/50 focus:ring-primary/20 transition-all text-xs shadow-sm"
              />
            </div>
          </div>

          <div className="space-y-3">
            <Label className="text-[9px] font-black uppercase tracking-[0.2em] text-muted-foreground ml-1">Vendor Authority</Label>
            <div className="relative">
              <VendorSelector
                value={formData.vendorId}
                onChange={val => setFormData({ ...formData, vendorId: val })}
                className="h-12 w-full appearance-none rounded-xl border border-border bg-card px-4 text-xs font-bold text-foreground focus:ring-2 focus:ring-primary/20 outline-none transition-all shadow-sm"
              />
            </div>
          </div>

          <div className="space-y-3">
            <Label className="text-[9px] font-black uppercase tracking-[0.2em] text-muted-foreground ml-1">Tax Rules</Label>
            <div className="relative">
              <select
                value={formData.billingType}
                onChange={e => setFormData({ ...formData, billingType: e.target.value as BillingType })}
                className="h-12 w-full appearance-none rounded-xl border border-border bg-card px-4 text-xs font-black tracking-widest text-foreground focus:ring-2 focus:ring-primary/20 outline-none transition-all pr-10 shadow-sm"
              >
                <option value="VAT">VAT (13.0%)</option>
                <option value="PAN">PAN (0.00%)</option>
                <option value="NO_BILL">NO BILL (0.0%)</option>
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
            </div>
          </div>

          <div className="space-y-3">
            <Label className="text-[9px] font-black uppercase tracking-[0.2em] text-muted-foreground ml-1">Settlement Method</Label>
            <div className="relative">
              <select
                value={formData.moneyTransaction}
                onChange={e => setFormData({ ...formData, moneyTransaction: e.target.value as MoneyTransaction })}
                className="h-12 w-full appearance-none rounded-xl border border-border bg-card px-4 text-xs font-black tracking-widest text-foreground focus:ring-2 focus:ring-primary/20 outline-none transition-all pr-10 shadow-sm"
              >
                <option value="CASH">LIQUID CASH</option>
                <option value="BANK">BANK TRANSFER</option>
                <option value="FONE_PAY">FONE PAY / QR</option>
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
            </div>
          </div>
        </div>
      </section>

      {/* 2. Line Items */}
      <section className="space-y-6">
        <div className="flex items-center justify-between border-b border-border pb-4">
          <div className="flex items-center gap-4">
            <div className="h-10 w-10 rounded-2xl bg-muted/50 border border-border flex items-center justify-center text-xs font-black text-foreground shadow-sm">
              02
            </div>
            <div>
              <h3 className="text-sm font-black text-foreground uppercase tracking-widest leading-none">Inventory Items</h3>
            </div>
          </div>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={addItem}
            className="h-10 font-black uppercase tracking-widest text-[9px] px-6 rounded-xl transition-all shadow-sm"
          >
            <Plus className="mr-2 h-3.5 w-3.5" /> Append Item
          </Button>
        </div>

        <div className="space-y-4">
          <AnimatePresence>
            {formData.items.map((item, idx) => {
              const selectedVariant = allVariants.find(v => v.id === item.variantId);
              return (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  transition={{ duration: 0.3 }}
                  className="bg-card shadow-sm p-4 md:p-6 rounded-3xl border border-border flex flex-col gap-6 relative group"
                >
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-4 items-end">
                    <div className="lg:col-span-4 space-y-3">
                      <Label className="text-[9px] font-black uppercase tracking-[0.2em] text-muted-foreground ml-1">Asset Identity</Label>
                      <VariantSelector
                        options={allVariants}
                        value={item.variantId}
                        onChange={val => updateItem(idx, 'variantId', val)}
                        placeholder="Locate variant..."
                        className="h-11 bg-muted/20 border-border rounded-xl px-4 text-xs font-black uppercase tracking-widest text-foreground focus:ring-primary/20 shadow-sm transition-all"
                      />
                    </div>

                    <div className="lg:col-span-2 space-y-3">
                      <Label className="text-[9px] font-black uppercase tracking-[0.2em] text-muted-foreground ml-1">Unit</Label>
                      <div className="relative">
                        <select
                          value={item.unitId}
                          disabled={!selectedVariant}
                          onChange={e => updateItem(idx, 'unitId', e.target.value)}
                          className="h-11 w-full appearance-none bg-muted/20 border border-border rounded-xl px-4 text-xs font-black text-foreground outline-none shadow-sm disabled:opacity-50 transition-all pr-10 focus:border-primary/40 focus:ring-2 focus:ring-primary/10"
                          required
                        >
                          <option value="">UNIT...</option>
                          {selectedVariant?.units
                            .filter((u: any) => u.unitType === 'PURCHASE' || u.unitType === 'BOTH')
                            .map((u: any) => (
                              <option key={u.id} value={u.id}>{u.name.toUpperCase()}</option>
                            ))}
                        </select>
                        <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
                      </div>
                    </div>

                    <div className="lg:col-span-1 space-y-3">
                      <Label className="text-[9px] font-black uppercase tracking-[0.2em] text-muted-foreground ml-1 text-center block">Qty</Label>
                      <Input
                        type="number"
                        step="any"
                        value={item.quantity}
                        onChange={e => updateItem(idx, 'quantity', Number(e.target.value))}
                        className="h-11 bg-muted/20 border-border text-center font-black text-xs text-foreground"
                        required
                      />
                    </div>

                    <div className="lg:col-span-2 space-y-3">
                      <Label className="text-[9px] font-black uppercase tracking-[0.2em] text-muted-foreground ml-1 text-right block">Cost / Unit</Label>
                      <Input
                        type="number"
                        step="any"
                        value={item.perUnitPrice}
                        onChange={e => updateItem(idx, 'perUnitPrice', Number(e.target.value))}
                        className="h-11 bg-muted/20 border-border text-right font-black text-xs text-foreground"
                        required
                      />
                    </div>

                    <div className="lg:col-span-1 space-y-3">
                      <Label className="text-[9px] font-black uppercase tracking-[0.2em] text-muted-foreground ml-1 text-right block">Off</Label>
                      <Input
                        type="number"
                        step="any"
                        value={item.discountAmount}
                        onChange={e => updateItem(idx, 'discountAmount', Number(e.target.value))}
                        className="h-11 bg-muted/20 border-border text-right text-emerald-600 font-black text-xs"
                      />
                    </div>

                    <div className="lg:col-span-1.5 space-y-3 flex-grow">
                      <Label className="text-[9px] font-black uppercase tracking-[0.2em] text-muted-foreground ml-1 text-right block">Net</Label>
                      <div className="h-11 flex items-center justify-end px-3 font-mono text-xs font-black text-foreground bg-muted border border-border rounded-xl shadow-inner">
                        Rs {((item.quantity * item.perUnitPrice) - item.discountAmount).toLocaleString()}
                      </div>
                    </div>

                    <div className="lg:col-span-0.5 flex justify-end">
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => removeItem(idx)}
                        disabled={formData.items.length === 1}
                        className="h-11 w-11 text-muted-foreground hover:text-red-500 hover:bg-red-500/10 rounded-xl transition-all disabled:opacity-30"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      </section>

      {/* 3. Totals Section */}
      <section className="bg-card rounded-[2rem] p-8 md:p-10 text-foreground shadow-sm border border-border isolate">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center relative z-10">
          <div className="space-y-6">
            <div className="flex items-center gap-3 text-primary font-black uppercase tracking-[0.2em] text-[10px] bg-primary/5 w-fit px-4 py-2 rounded-full border border-primary/20">
              <PackageCheck className="h-4 w-4" />
              <span>Checkout Engine</span>
            </div>
            <p className="text-muted-foreground text-xs max-w-sm font-semibold">
              Verify your totals before submitting. The backend will finalize the precise tax evaluation.
            </p>
            <div className="w-full md:w-72 space-y-3">
              <div className="flex items-center gap-2">
                <Label className="text-[9px] font-black uppercase tracking-[0.2em] text-muted-foreground ml-1">Apply Total Discount</Label>
              </div>
              <div className="relative group">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground font-black text-xs">RS.</span>
                <Input
                  type="number"
                  value={formData.discountAmount}
                  onChange={e => setFormData({ ...formData, discountAmount: Number(e.target.value) })}
                  className="pl-12 h-14 bg-muted/40 border-border text-foreground font-black text-xl rounded-2xl focus:ring-primary/20 shadow-inner group-hover:border-primary/40 transition-all"
                />
              </div>
            </div>
          </div>

          <div className="space-y-4 lg:pl-10 lg:border-l border-border py-2">
            <div className="flex justify-between items-center py-1">
              <span className="text-muted-foreground font-bold uppercase tracking-widest text-[10px]">Gross Total</span>
              <span className="font-mono text-base font-black text-foreground">Rs {subTotal.toLocaleString()}</span>
            </div>
            <div className="flex justify-between items-center py-1">
              <span className="text-primary font-bold uppercase tracking-widest text-[10px]">Tax Estimate ({formData.billingType === 'VAT' ? '13%' : '0%'})</span>
              <span className="font-mono text-base font-black text-primary">+ Rs {vatAmount.toLocaleString()}</span>
            </div>
            <div className="flex justify-between items-center py-1">
              <span className="text-emerald-500 font-bold uppercase tracking-widest text-[10px]">Total Discount</span>
              <span className="font-mono text-base font-black text-emerald-500">- Rs {formData.discountAmount.toLocaleString()}</span>
            </div>

            <div className="pt-6 mt-2 border-t border-border">
              <div className="flex flex-col mb-8">
                <span className="text-muted-foreground font-black uppercase tracking-[0.2em] text-[10px] mb-1">Final Amount</span>
                <span className="text-4xl font-black text-foreground tracking-tighter">RS {grossTotal.toLocaleString()}</span>
              </div>

              <div className="flex flex-col sm:flex-row gap-3">
                <Button
                  type="button"
                  onClick={onCancel}
                  variant="outline"
                  className="flex-1 h-12 rounded-xl text-muted-foreground font-bold uppercase tracking-widest text-[10px] transition-all order-2 sm:order-1"
                >
                   Abort Process
                </Button>
                <Button
                  type="submit"
                  disabled={mutation.isPending}
                  className="flex-[2] h-12 shadow-md shadow-primary/20 hover:-translate-y-0.5 rounded-xl font-bold uppercase tracking-widest text-[10px] transition-all order-1 sm:order-2"
                >
                  {mutation.isPending ? (
                    <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Transfer...</>
                  ) : (
                    <><Save className="mr-2 h-4 w-4" /> Save Purchase</>
                  )}
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>
    </form>
  );
}
