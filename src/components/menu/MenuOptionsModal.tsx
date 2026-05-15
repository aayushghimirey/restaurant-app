import { useState, useEffect } from 'react';
import {
  X, Plus, Trash2, ListTree, Package,
  Search, Link2, Link2Off, ArrowLeft,
  SlidersHorizontal, ChevronRight,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { menuService } from '../../services/menuService';
import { inventoryService } from '../../services/inventoryService';
import type {
  MenuItemResponse,
  MenuOptionResponse,
  CreateMenuOptionRequest,
  MenuRecipeResponse,
} from '../../types';
import { type StockItemResponse } from '../../types/inventory';
import { Spinner } from '../ui/Feedback';
import { toast } from 'sonner';
import ConfirmModal from '../ui/ConfirmModal';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  item: MenuItemResponse;
}

/* ─── helpers ───────────────────────────────────────────────────── */
const inputCls =
  'w-full bg-slate-900 border border-white/[0.07] rounded-xl px-4 py-3 text-sm text-white placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-brand-500/40 transition-all';

type RightPanel = 'idle' | 'add' | 'link';

/* ═══════════════════════════════════════════════════════════════ */
export default function MenuOptionsModal({ isOpen, onClose, item }: Props) {
  const [options, setOptions]         = useState<MenuOptionResponse[]>([]);
  const [inventory, setInventory]     = useState<StockItemResponse[]>([]);
  const [optionStocks, setOptionStocks] = useState<Record<string, MenuRecipeResponse[]>>({});
  const [loading, setLoading]         = useState(true);

  const [panel, setPanel]             = useState<RightPanel>('idle');
  const [formData, setFormData]       = useState<CreateMenuOptionRequest>({ name: '', priceAdjustment: 0 });

  const [linkingOptionId, setLinkingOptionId] = useState<string | null>(null);
  const [stockSearch, setStockSearch]         = useState('');
  const [stockFormData, setStockFormData]     = useState({ stockItemId: '', quantity: 0 });

  const [confirmConfig, setConfirmConfig] = useState<{
    open: boolean; title: string; message: string;
    onConfirm: () => void; isLoading: boolean;
  }>({ open: false, title: '', message: '', onConfirm: () => {}, isLoading: false });

  /* ── data ── */
  useEffect(() => { if (isOpen) fetchData(); }, [isOpen, item.id]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [optRes, invRes] = await Promise.all([
        menuService.getOptions(item.id),
        inventoryService.getAllStockItems(),
      ]);
      if (optRes.success && optRes.data) {
        setOptions(optRes.data);
        const linkedOptions = optRes.data.filter(o => o.isStockLinked);
        const stocks: Record<string, MenuRecipeResponse[]> = {};
        await Promise.all(
          linkedOptions.map(async opt => {
            try {
              const sRes = await menuService.getOptionStock(opt.id);
              if (sRes.success && sRes.data) stocks[opt.id] = sRes.data;
            } catch (e) {
              console.error(`Failed to fetch stock for option ${opt.id}`, e);
            }
          }),
        );
        setOptionStocks(stocks);
      }
      if (invRes.success) setInventory(invRes.data.content);
    } catch {
      toast.error('Failed to load options');
    } finally {
      setLoading(false);
    }
  };

  /* ── handlers ── */
  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name) return;
    try {
      const res = await menuService.addOption(item.id, formData);
      if (res.success) {
        toast.success('Variation created');
        setFormData({ name: '', priceAdjustment: 0 });
        setPanel('idle');
        fetchData();
      }
    } catch {
      toast.error('Failed to add variation');
    }
  };

  const handleLinkStock = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!linkingOptionId || !stockFormData.stockItemId) return;
    try {
      const res = await menuService.addOptionStock(linkingOptionId, stockFormData);
      if (res.success) {
        toast.success('Stock linked');
        setLinkingOptionId(null);
        setStockFormData({ stockItemId: '', quantity: 0 });
        setPanel('idle');
        fetchData();
      }
    } catch {
      toast.error('Failed to link stock');
    }
  };

  const handleRemoveStock = (optionId: string) => {
    setConfirmConfig({
      open: true,
      title: 'Unlink Stock',
      message: 'Remove the inventory link for this variation? Stock will no longer be tracked for it.',
      isLoading: false,
      onConfirm: async () => {
        setConfirmConfig(prev => ({ ...prev, isLoading: true }));
        try {
          const res = await menuService.removeOptionStock(optionId);
          if (res.success) { toast.success('Stock unlinked'); fetchData(); }
        } catch {
          toast.error('Failed to unlink stock');
        } finally {
          setConfirmConfig(prev => ({ ...prev, open: false, isLoading: false }));
        }
      },
    });
  };

  const handleDeleteOption = (optionId: string) => {
    setConfirmConfig({
      open: true,
      title: 'Delete Variation',
      message: 'Permanently remove this variation? This cannot be undone.',
      isLoading: false,
      onConfirm: async () => {
        setConfirmConfig(prev => ({ ...prev, isLoading: true }));
        try {
          const res = await menuService.deleteOption(optionId);
          if (res.success) { toast.success('Variation deleted'); fetchData(); }
        } catch {
          toast.error('Failed to delete variation');
        } finally {
          setConfirmConfig(prev => ({ ...prev, open: false, isLoading: false }));
        }
      },
    });
  };

  const openLink = (optId: string) => {
    setLinkingOptionId(optId);
    setStockFormData({ stockItemId: '', quantity: 0 });
    setStockSearch('');
    setPanel('link');
  };

  const selectedStock = inventory.find(i => i.id === stockFormData.stockItemId);
  const filteredInventory = inventory.filter(i =>
    i.name.toLowerCase().includes(stockSearch.toLowerCase()),
  );

  /* ══════════════════════ render ═══════════════════════════════ */
  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center p-0 sm:p-4">
          {/* backdrop */}
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/75 backdrop-blur-sm"
            onClick={onClose}
          />

          {/* shell */}
          <motion.div
            initial={{ opacity: 0, y: 40, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 40, scale: 0.97 }}
            transition={{ type: 'spring', stiffness: 380, damping: 32 }}
            className="relative w-full sm:max-w-5xl bg-slate-950 border border-white/[0.08] rounded-t-3xl sm:rounded-3xl shadow-2xl shadow-black/60 flex flex-col md:flex-row overflow-hidden"
            style={{ maxHeight: '90vh' }}
          >

            {/* ══ LEFT — Variations list ════════════════════════════ */}
            <div className="flex flex-col w-full md:w-[340px] shrink-0 border-b md:border-b-0 md:border-r border-white/[0.06]">

              {/* header */}
              <div className="p-5 border-b border-white/[0.06]">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-xl bg-brand-500/10 border border-brand-500/20 flex items-center justify-center text-brand-400 shrink-0">
                    <SlidersHorizontal size={15} />
                  </div>
                  <div className="min-w-0">
                    <h2 className="font-black text-white text-sm truncate leading-none">{item.name}</h2>
                    <p className="text-[9px] text-slate-500 uppercase font-bold tracking-[0.18em] mt-0.5">Variations</p>
                  </div>
                </div>
              </div>

              {/* list */}
              <div className="flex-1 overflow-y-auto p-4 space-y-2 custom-scrollbar min-h-0">
                <div className="flex items-center justify-between mb-3 px-1">
                  <span className="text-[9px] font-black text-slate-600 uppercase tracking-[0.18em]">All options</span>
                  <span className={`text-[9px] font-black px-2 py-0.5 rounded-full border ${
                    options.length > 0
                      ? 'bg-brand-500/10 text-brand-400 border-brand-500/20'
                      : 'bg-white/5 text-slate-600 border-white/5'
                  }`}>
                    {options.length} option{options.length !== 1 ? 's' : ''}
                  </span>
                </div>

                {loading ? (
                  <div className="flex flex-col items-center justify-center py-16 gap-3">
                    <Spinner />
                    <p className="text-[10px] text-slate-600 font-bold uppercase tracking-widest animate-pulse">Loading…</p>
                  </div>
                ) : options.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-14 rounded-2xl border border-dashed border-white/[0.06] text-center px-4">
                    <div className="w-12 h-12 rounded-2xl bg-slate-900 border border-white/5 flex items-center justify-center text-slate-700 mb-3">
                      <ListTree size={20} strokeWidth={1.5} />
                    </div>
                    <p className="text-xs font-bold text-slate-500">No variations yet</p>
                    <p className="text-[10px] text-slate-600 mt-1">Add options like size, extras or add-ons.</p>
                  </div>
                ) : (
                  <AnimatePresence initial={false}>
                    {options.map(opt => (
                      <motion.div
                        key={opt.id}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -10 }}
                        className={`group rounded-xl border transition-all ${
                          linkingOptionId === opt.id && panel === 'link'
                            ? 'bg-emerald-500/5 border-emerald-500/25'
                            : 'bg-white/[0.025] border-white/[0.05] hover:border-white/10'
                        }`}
                      >
                        {/* main row */}
                        <div className="flex items-center gap-3 p-3">
                          <div className="flex-1 min-w-0">
                            <p className="text-xs font-bold text-white truncate">{opt.name}</p>
                            <div className="flex items-center gap-2 mt-0.5">
                              <span className="text-[10px] font-black text-brand-400">
                                {opt.priceAdjustment > 0 ? `+ Rs. ${opt.priceAdjustment.toLocaleString()}` : 'Base price'}
                              </span>
                              {opt.isStockLinked && (
                                <span className="inline-flex items-center gap-1 text-[9px] font-black text-emerald-500 bg-emerald-500/10 border border-emerald-500/15 px-1.5 py-0.5 rounded-md uppercase tracking-wide">
                                  <Package size={8} />
                                  Linked
                                </span>
                              )}
                            </div>
                          </div>

                          {/* action buttons */}
                          <div className="flex items-center gap-1 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button
                              onClick={() => opt.isStockLinked ? handleRemoveStock(opt.id) : openLink(opt.id)}
                              title={opt.isStockLinked ? 'Unlink stock' : 'Link stock'}
                              className={`p-1.5 rounded-lg transition-all ${
                                opt.isStockLinked
                                  ? 'text-rose-500 hover:bg-rose-500/10'
                                  : 'text-emerald-500 hover:bg-emerald-500/10'
                              }`}
                            >
                              {opt.isStockLinked ? <Link2Off size={13} /> : <Link2 size={13} />}
                            </button>
                            <button
                              onClick={() => handleDeleteOption(opt.id)}
                              title="Delete variation"
                              className="p-1.5 rounded-lg text-slate-600 hover:text-rose-400 hover:bg-rose-500/10 transition-all"
                            >
                              <Trash2 size={13} />
                            </button>
                          </div>
                        </div>

                        {/* stock detail row (if linked) */}
                        {opt.isStockLinked && optionStocks[opt.id]?.[0] && (
                          <div className="mx-3 mb-3 px-3 py-2 rounded-lg bg-emerald-500/[0.06] border border-emerald-500/[0.12] flex items-center justify-between">
                            <span className="text-[9px] font-black text-slate-600 uppercase tracking-wider">Deducts</span>
                            <span className="text-[10px] font-black text-emerald-400">
                              {optionStocks[opt.id][0].quantity}
                              <span className="text-slate-500 font-bold ml-1">{optionStocks[opt.id][0].baseUnitSymbol}</span>
                              <span className="text-slate-500 font-semibold ml-1">— {optionStocks[opt.id][0].stockItemName}</span>
                            </span>
                          </div>
                        )}
                      </motion.div>
                    ))}
                  </AnimatePresence>
                )}
              </div>

              {/* add button */}
              <div className="p-4 border-t border-white/[0.06]">
                <button
                  onClick={() => { setPanel('add'); setLinkingOptionId(null); }}
                  className="w-full h-11 bg-brand-500 text-white rounded-xl text-xs font-black uppercase tracking-widest shadow-lg shadow-brand-500/20 hover:bg-brand-400 transition-all active:scale-95 flex items-center justify-center gap-2"
                >
                  <Plus size={16} />
                  New Variation
                </button>
              </div>
            </div>

            {/* ══ RIGHT — dynamic panel ════════════════════════════ */}
            <div className="flex-1 flex flex-col min-h-0 min-w-0">

              {/* right header */}
              <div className="flex items-center gap-3 px-5 py-4 border-b border-white/[0.06] shrink-0">
                {panel !== 'idle' ? (
                  <button
                    onClick={() => { setPanel('idle'); setLinkingOptionId(null); }}
                    className="flex items-center gap-1.5 text-slate-400 hover:text-white transition-colors text-xs font-bold"
                  >
                    <ArrowLeft size={14} />
                    Back
                  </button>
                ) : (
                  <span className="text-xs font-black text-slate-600 uppercase tracking-widest">
                    {options.length === 0 ? 'Get started' : 'Select an option'}
                  </span>
                )}
                <button
                  onClick={onClose}
                  className="p-2 rounded-xl text-slate-500 hover:text-white hover:bg-white/5 transition-all ml-auto shrink-0"
                >
                  <X size={18} />
                </button>
              </div>

              {/* right body */}
              <div className="flex-1 overflow-y-auto custom-scrollbar min-h-0">
                <AnimatePresence mode="wait">

                  {/* ── Add Variation Form ── */}
                  {panel === 'add' && (
                    <motion.div
                      key="add"
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 20 }}
                      transition={{ duration: 0.18 }}
                      className="p-6 space-y-6"
                    >
                      {/* context banner */}
                      <div className="flex items-center gap-3 p-4 rounded-2xl bg-brand-500/[0.05] border border-brand-500/[0.14]">
                        <div className="w-9 h-9 rounded-xl bg-brand-500/10 border border-brand-500/20 flex items-center justify-center text-brand-400 shrink-0">
                          <SlidersHorizontal size={16} />
                        </div>
                        <div>
                          <p className="text-xs font-black text-white">New variation for <span className="text-brand-400">{item.name}</span></p>
                          <p className="text-[10px] text-slate-500 mt-0.5">Add a named option with an optional price adjustment.</p>
                        </div>
                      </div>

                      <form onSubmit={handleAdd} className="space-y-4">
                        <div className="space-y-1.5">
                          <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Variation name *</label>
                          <input
                            type="text"
                            required
                            autoFocus
                            placeholder="e.g. Extra Cheese, Large Size…"
                            value={formData.name}
                            onChange={e => setFormData(prev => ({ ...prev, name: e.target.value }))}
                            className={inputCls}
                          />
                        </div>

                        <div className="space-y-1.5">
                          <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Price adjustment (Rs.)</label>
                          <div className="relative">
                            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[10px] font-black text-slate-500">Rs.</span>
                            <input
                              type="number"
                              step="any"
                              placeholder="0.00"
                              value={formData.priceAdjustment || ''}
                              onChange={e => setFormData(prev => ({ ...prev, priceAdjustment: Number(e.target.value) }))}
                              className={`${inputCls} pl-10`}
                            />
                          </div>
                          <p className="text-[10px] text-slate-600 px-1">Leave 0 to keep the base item price.</p>
                        </div>

                        <div className="flex gap-2.5 pt-2">
                          <button
                            type="button"
                            onClick={() => setPanel('idle')}
                            className="px-5 py-3 rounded-xl bg-white/5 text-slate-400 text-sm font-bold hover:bg-white/10 hover:text-white transition-all"
                          >
                            Cancel
                          </button>
                          <button
                            type="submit"
                            disabled={!formData.name}
                            className="flex-1 py-3 rounded-xl bg-brand-500 text-white text-sm font-black hover:bg-brand-400 transition-all shadow-lg shadow-brand-500/20 disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                          >
                            <Plus size={15} />
                            Create Variation
                          </button>
                        </div>
                      </form>
                    </motion.div>
                  )}

                  {/* ── Link Stock Form ── */}
                  {panel === 'link' && (
                    <motion.div
                      key="link"
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 20 }}
                      transition={{ duration: 0.18 }}
                      className="p-6 space-y-5"
                    >
                      {/* context banner */}
                      <div className="flex items-center gap-3 p-4 rounded-2xl bg-emerald-500/[0.05] border border-emerald-500/[0.14]">
                        <div className="w-9 h-9 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 shrink-0">
                          <Link2 size={16} />
                        </div>
                        <div className="min-w-0">
                          <p className="text-xs font-black text-white truncate">
                            Linking stock to <span className="text-emerald-400">{options.find(o => o.id === linkingOptionId)?.name ?? 'variation'}</span>
                          </p>
                          <p className="text-[10px] text-slate-500 mt-0.5">Pick a stock item and set quantity to deduct per sale.</p>
                        </div>
                      </div>

                      {/* search */}
                      <div className="relative group">
                        <Search size={13} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-600 group-focus-within:text-brand-400 transition-colors pointer-events-none" />
                        <input
                          type="text"
                          placeholder="Search inventory…"
                          value={stockSearch}
                          onChange={e => setStockSearch(e.target.value)}
                          className="w-full bg-slate-900 border border-white/[0.07] rounded-xl pl-9 pr-4 py-2.5 text-xs text-white placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-brand-500/40 transition-all"
                        />
                      </div>

                      {/* inventory picker */}
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 max-h-52 overflow-y-auto custom-scrollbar p-0.5">
                        {filteredInventory.length === 0 ? (
                          <div className="col-span-full py-8 text-center text-slate-600">
                            <p className="text-xs font-bold">No items match</p>
                          </div>
                        ) : filteredInventory.map(i => {
                          const selected = stockFormData.stockItemId === i.id;
                          return (
                            <button
                              key={i.id}
                              onClick={() => setStockFormData(prev => ({ ...prev, stockItemId: i.id }))}
                              className={`p-3 rounded-xl border text-left transition-all flex flex-col gap-1.5 ${
                                selected
                                  ? 'bg-emerald-500/10 border-emerald-500/30 text-white'
                                  : 'bg-white/[0.025] border-white/[0.05] text-slate-400 hover:text-white hover:border-white/15'
                              }`}
                            >
                              <span className="text-[11px] font-bold truncate block">{i.name}</span>
                              <div className="flex items-center gap-1.5">
                                <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${i.lowStock ? 'bg-rose-500' : 'bg-emerald-500'}`} />
                                <span className={`text-[9px] font-bold ${i.lowStock ? 'text-rose-400' : 'text-slate-600'}`}>
                                  {i.currentStock} {i.baseUnit.symbol}
                                </span>
                              </div>
                            </button>
                          );
                        })}
                      </div>

                      {/* quantity input — only shown after picking */}
                      <AnimatePresence>
                        {stockFormData.stockItemId && (
                          <motion.div
                            initial={{ opacity: 0, y: 8 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: 8 }}
                            className="space-y-1.5"
                          >
                            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">
                              Quantity to deduct
                            </label>
                            <div className="relative">
                              <input
                                type="number"
                                step="any"
                                autoFocus
                                placeholder="0.00"
                                value={stockFormData.quantity || ''}
                                onChange={e => setStockFormData(prev => ({ ...prev, quantity: Number(e.target.value) }))}
                                className="w-full bg-slate-900 border border-white/[0.07] rounded-xl px-4 py-3 text-lg font-black text-white placeholder-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-500/40 transition-all pr-20"
                              />
                              <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[9px] font-black text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-1 rounded-lg uppercase tracking-wider">
                                {selectedStock?.baseUnit.symbol}
                              </span>
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>

                      <form onSubmit={handleLinkStock}>
                        <div className="flex gap-2.5 pt-1">
                          <button
                            type="button"
                            onClick={() => { setPanel('idle'); setLinkingOptionId(null); }}
                            className="px-5 py-3 rounded-xl bg-white/5 text-slate-400 text-sm font-bold hover:bg-white/10 hover:text-white transition-all"
                          >
                            Cancel
                          </button>
                          <button
                            type="submit"
                            disabled={!stockFormData.stockItemId || stockFormData.quantity <= 0}
                            className="flex-1 py-3 rounded-xl bg-emerald-600 text-white text-sm font-black hover:bg-emerald-500 transition-all shadow-lg shadow-emerald-500/20 disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                          >
                            <Link2 size={15} />
                            Confirm Link
                          </button>
                        </div>
                      </form>
                    </motion.div>
                  )}

                  {/* ── Idle state ── */}
                  {panel === 'idle' && (
                    <motion.div
                      key="idle"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="h-full flex flex-col items-center justify-center text-center p-8 gap-5 min-h-[300px]"
                    >
                      <div className="w-16 h-16 rounded-2xl bg-slate-900 border border-white/[0.06] flex items-center justify-center text-slate-700">
                        <SlidersHorizontal size={28} strokeWidth={1.5} />
                      </div>
                      <div className="space-y-1.5 max-w-xs">
                        <h3 className="text-sm font-black text-slate-400">Variation Control</h3>
                        <p className="text-xs text-slate-600 leading-relaxed">
                          Create size or extras options for this item, then optionally link each to a stock item for automatic deduction on sale.
                        </p>
                      </div>
                      <button
                        onClick={() => setPanel('add')}
                        className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-brand-500/10 border border-brand-500/20 text-brand-400 text-xs font-bold hover:bg-brand-500/20 transition-all"
                      >
                        <Plus size={13} />
                        Add your first variation
                      </button>
                    </motion.div>
                  )}

                </AnimatePresence>
              </div>
            </div>
          </motion.div>
        </div>
      )}

      <ConfirmModal
        isOpen={confirmConfig.open}
        onClose={() => setConfirmConfig(prev => ({ ...prev, open: false }))}
        onConfirm={confirmConfig.onConfirm}
        title={confirmConfig.title}
        message={confirmConfig.message}
        isLoading={confirmConfig.isLoading}
      />
    </AnimatePresence>
  );
}