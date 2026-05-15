import { useState, useEffect } from 'react';
import {
  X, Plus, Trash2, Package, Search, Save,
  AlertCircle, ChevronRight, Utensils, Link2,
  ArrowLeft, BoxSelect,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { menuService } from '../../services/menuService';
import { inventoryService } from '../../services/inventoryService';
import type {
  MenuItemResponse,
  MenuRecipeResponse,
  CreateMenuRecipeRequest,
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

/* ─── tiny helpers ─────────────────────────────────────────────── */
const inputCls =
  'w-full bg-slate-900 border border-white/[0.07] rounded-xl px-4 py-3 text-sm text-white placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-brand-500/40 transition-all';

/* ═══════════════════════════════════════════════════════════════ */
export default function RecipeEditorModal({ isOpen, onClose, item }: Props) {
  const [recipe, setRecipe]       = useState<MenuRecipeResponse[]>([]);
  const [inventory, setInventory] = useState<StockItemResponse[]>([]);
  const [loading, setLoading]     = useState(true);
  const [search, setSearch]       = useState('');
  const [searching, setSearching] = useState(false);
  const [panel, setPanel]         = useState<'idle' | 'link'>('idle');
  const [formData, setFormData]   = useState<CreateMenuRecipeRequest>({
    stockItemId: '',
    quantity: 0,
  });

  const [confirmConfig, setConfirmConfig] = useState<{
    open: boolean; title: string; message: string;
    onConfirm: () => void; isLoading: boolean;
  }>({ open: false, title: '', message: '', onConfirm: () => {}, isLoading: false });

  /* ── data ── */
  useEffect(() => {
    if (isOpen) fetchData();
  }, [isOpen, item.id]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const res    = await menuService.getRecipe(item.id);
      setRecipe(res.data || []);
      const invRes = await inventoryService.getAllStockItems('', undefined, 0, 50);
      setInventory(invRes.data.content || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  /* debounced inventory search */
  useEffect(() => {
    if (!isOpen) return;
    const t = setTimeout(async () => {
      setSearching(true);
      try {
        const invRes = await inventoryService.getAllStockItems(search, undefined, 0, 50);
        setInventory(invRes.data.content || []);
      } catch (err) {
        console.error('Search failed', err);
      } finally {
        setSearching(false);
      }
    }, 400);
    return () => clearTimeout(t);
  }, [search, isOpen]);

  /* ── handlers ── */
  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.stockItemId || formData.quantity <= 0) return;
    try {
      const res = await menuService.addRecipeIngredient(item.id, formData);
      if (res.success) {
        toast.success('Ingredient added to recipe');
        setFormData({ stockItemId: '', quantity: 0 });
        setPanel('idle');
        fetchData();
      }
    } catch {
      toast.error('Failed to link stock item');
    }
  };

  const handleRemove = (recipeId: string) => {
    setConfirmConfig({
      open: true,
      title: 'Unlink Stock Item',
      message: 'Remove this stock item from the recipe? Stock will no longer be deducted for this ingredient.',
      isLoading: false,
      onConfirm: async () => {
        setConfirmConfig(prev => ({ ...prev, isLoading: true }));
        try {
          await menuService.removeRecipeIngredient(recipeId);
          toast.success('Stock item unlinked');
          fetchData();
        } catch {
          toast.error('Failed to unlink stock item');
        } finally {
          setConfirmConfig(prev => ({ ...prev, open: false, isLoading: false }));
        }
      },
    });
  };

  /* ── derived ── */
  const filteredInventory  = inventory.filter(i => !recipe.some(r => r.stockItemId === i.id));
  const selectedStockItem  = inventory.find(i => i.id === formData.stockItemId);


  /* ══════════════════════ render ══════════════════════════════ */
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

          {/* modal shell */}
          <motion.div
            initial={{ opacity: 0, y: 40, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 40, scale: 0.97 }}
            transition={{ type: 'spring', stiffness: 380, damping: 32 }}
            className="relative w-full sm:max-w-5xl bg-slate-950 border border-white/[0.08] rounded-t-3xl sm:rounded-3xl shadow-2xl shadow-black/60 flex flex-col md:flex-row overflow-hidden"
            style={{ maxHeight: '90vh' }}
          >

            {/* ══ LEFT — Linked Stock Panel ══════════════════════════ */}
            <div className="flex flex-col w-full md:w-[340px] shrink-0 border-b md:border-b-0 md:border-r border-white/[0.06] bg-slate-950">

              {/* header */}
              <div className="p-5 border-b border-white/[0.06]">
                <div className="flex items-center gap-3 mb-1">
                  <div className="w-8 h-8 rounded-xl bg-brand-500/10 border border-brand-500/20 flex items-center justify-center text-brand-400 shrink-0">
                    <Utensils size={15} />
                  </div>
                  <div className="min-w-0">
                    <h2 className="font-black text-white text-sm truncate leading-none">{item.name}</h2>
                    <p className="text-[9px] text-slate-500 uppercase font-bold tracking-[0.18em] mt-0.5">Stock Recipe</p>
                  </div>
                </div>
              </div>

              {/* linked items list */}
              <div className="flex-1 overflow-y-auto p-4 space-y-2 custom-scrollbar min-h-0">
                <div className="flex items-center justify-between mb-3 px-1">
                  <span className="text-[9px] font-black text-slate-600 uppercase tracking-[0.18em]">Linked Stock</span>
                  <span className={`text-[9px] font-black px-2 py-0.5 rounded-full border ${
                    recipe.length > 0
                      ? 'bg-brand-500/10 text-brand-400 border-brand-500/20'
                      : 'bg-white/5 text-slate-600 border-white/5'
                  }`}>
                    {recipe.length} item{recipe.length !== 1 ? 's' : ''}
                  </span>
                </div>

                {loading ? (
                  <div className="flex flex-col items-center justify-center py-16 gap-3">
                    <Spinner />
                    <p className="text-[10px] text-slate-600 font-bold uppercase tracking-widest animate-pulse">Loading…</p>
                  </div>
                ) : recipe.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-14 rounded-2xl border border-dashed border-white/[0.06] text-center px-4">
                    <div className="w-12 h-12 rounded-2xl bg-slate-900 border border-white/5 flex items-center justify-center text-slate-700 mb-3">
                      <Link2 size={20} strokeWidth={1.5} />
                    </div>
                    <p className="text-xs font-bold text-slate-500">No stock linked yet</p>
                    <p className="text-[10px] text-slate-600 mt-1">Pick items from the right panel to link stock.</p>
                  </div>
                ) : (
                  <AnimatePresence initial={false}>
                    {recipe.map(ing => (
                      <motion.div
                        key={ing.id}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -10 }}
                        className="group flex items-center gap-3 p-3 rounded-xl border border-white/[0.05] bg-white/[0.02] hover:bg-white/[0.04] hover:border-brand-500/20 transition-all"
                      >
                        <div className="w-8 h-8 rounded-lg bg-slate-800 border border-white/5 flex items-center justify-center text-slate-500 shrink-0">
                          <Package size={14} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-bold text-white truncate">{ing.stockItemName}</p>
                          <p className="text-[10px] text-brand-400 font-black mt-0.5">
                            {ing.quantity}
                            <span className="text-slate-600 font-bold ml-1">{ing.baseUnitSymbol}</span>
                          </p>
                        </div>
                        <button
                          onClick={() => handleRemove(ing.id)}
                          className="p-1.5 rounded-lg text-slate-700 hover:text-rose-400 hover:bg-rose-500/10 transition-all opacity-0 group-hover:opacity-100 shrink-0"
                          title="Unlink"
                        >
                          <Trash2 size={13} />
                        </button>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                )}
              </div>

              {/* add button */}
              <div className="p-4 border-t border-white/[0.06]">
                <button
                  onClick={() => { setPanel('link'); setFormData({ stockItemId: '', quantity: 0 }); }}
                  className="w-full h-11 bg-brand-500 text-white rounded-xl text-xs font-black uppercase tracking-widest shadow-lg shadow-brand-500/20 hover:bg-brand-400 transition-all active:scale-95 flex items-center justify-center gap-2"
                >
                  <Plus size={16} />
                  Add Ingredient
                </button>
              </div>

              {/* footer notice */}
              <div className="p-4 bg-slate-900/50 border-t border-white/[0.06]">
                <div className="flex items-start gap-2.5 p-3 rounded-xl bg-amber-500/[0.06] border border-amber-500/[0.12]">
                  <AlertCircle size={13} className="text-amber-500 shrink-0 mt-0.5" />
                  <p className="text-[10px] text-amber-500/70 leading-relaxed">
                    Stock is auto-deducted when an order containing this item is settled.
                  </p>
                </div>
              </div>
            </div>

            {/* ══ RIGHT — Inventory Browser / Add Form ═══════════════ */}
            <div className="flex-1 flex flex-col min-h-0 min-w-0 bg-slate-950">

              {/* right header */}
              <div className="flex items-center gap-3 px-5 py-4 border-b border-white/[0.06] shrink-0">
                {panel !== 'idle' ? (
                  <button
                    onClick={() => setPanel('idle')}
                    className="flex items-center gap-1.5 text-slate-400 hover:text-white transition-colors text-xs font-bold"
                  >
                    <ArrowLeft size={14} />
                    Back
                  </button>
                ) : (
                  <span className="text-xs font-black text-slate-600 uppercase tracking-widest">
                    {recipe.length === 0 ? 'Get started' : 'Recipe details'}
                  </span>
                )}
                <button
                  onClick={onClose}
                  className="p-2 rounded-xl text-slate-500 hover:text-white hover:bg-white/5 transition-all ml-auto shrink-0"
                  title="Close"
                >
                  <X size={18} />
                </button>
              </div>

              {/* right body */}
              <div className="flex-1 overflow-y-auto custom-scrollbar min-h-0">
                <AnimatePresence mode="wait">

                  {/* ── Link Stock View ── */}
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
                            Add ingredient to <span className="text-emerald-400">{item.name}</span>
                          </p>
                          <p className="text-[10px] text-slate-500 mt-0.5">Pick a stock item and set quantity per serving.</p>
                        </div>
                      </div>

                      {/* search */}
                      <div className="relative group">
                        <div className="absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none">
                          {searching
                            ? <div className="w-3.5 h-3.5 border-2 border-brand-500 border-t-transparent rounded-full animate-spin" />
                            : <Search size={13} className="text-slate-600 group-focus-within:text-brand-400 transition-colors" />
                          }
                        </div>
                        <input
                          type="text"
                          placeholder="Search inventory…"
                          value={search}
                          onChange={e => setSearch(e.target.value)}
                          className="w-full bg-slate-900 border border-white/[0.07] rounded-xl pl-9 pr-4 py-2.5 text-xs text-white placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-brand-500/40 transition-all"
                        />
                      </div>

                      {/* inventory picker */}
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 max-h-52 overflow-y-auto custom-scrollbar p-0.5">
                        {filteredInventory.length === 0 ? (
                          <div className="col-span-full py-8 text-center text-slate-600">
                            <div className="w-10 h-10 rounded-xl bg-slate-900 border border-white/5 flex items-center justify-center text-slate-700 mx-auto mb-2">
                              <BoxSelect size={18} strokeWidth={1.5} />
                            </div>
                            <p className="text-xs font-bold">No items match</p>
                          </div>
                        ) : filteredInventory.map(i => {
                          const selected = formData.stockItemId === i.id;
                          return (
                            <button
                              key={i.id}
                              onClick={() => setFormData(prev => ({ ...prev, stockItemId: i.id }))}
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

                      {/* quantity input & context */}
                      <AnimatePresence>
                        {formData.stockItemId && (
                          <motion.div
                            initial={{ opacity: 0, y: 8 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: 8 }}
                            className="space-y-4"
                          >
                            <div className="space-y-1.5">
                              <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">
                                Quantity per serving
                              </label>
                              <div className="relative">
                                <input
                                  type="number"
                                  step="any"
                                  autoFocus
                                  placeholder="0.00"
                                  value={formData.quantity || ''}
                                  onChange={e => setFormData(prev => ({ ...prev, quantity: Number(e.target.value) }))}
                                  className="w-full bg-slate-900 border border-white/[0.07] rounded-xl px-4 py-3 text-lg font-black text-white placeholder-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-500/40 transition-all pr-20"
                                />
                                <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[9px] font-black text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-1 rounded-lg uppercase tracking-wider">
                                  {selectedStockItem?.baseUnit.symbol}
                                </span>
                              </div>
                            </div>


                          </motion.div>
                        )}
                      </AnimatePresence>

                      <form onSubmit={handleAdd}>
                        <div className="flex gap-2.5 pt-1">
                          <button
                            type="button"
                            onClick={() => setPanel('idle')}
                            className="px-5 py-3 rounded-xl bg-white/5 text-slate-400 text-sm font-bold hover:bg-white/10 hover:text-white transition-all"
                          >
                            Cancel
                          </button>
                          <button
                            type="submit"
                            disabled={!formData.stockItemId || formData.quantity <= 0}
                            className="flex-1 py-3 rounded-xl bg-emerald-600 text-white text-sm font-black hover:bg-emerald-500 transition-all shadow-lg shadow-emerald-500/20 disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                          >
                            <Plus size={15} />
                            Add Ingredient
                          </button>
                        </div>
                      </form>
                    </motion.div>
                  )}

                  {/* ── Idle State ── */}
                  {panel === 'idle' && (
                    <motion.div
                      key="idle"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="h-full flex flex-col items-center justify-center text-center p-8 gap-5 min-h-[300px]"
                    >
                      <div className="w-16 h-16 rounded-2xl bg-slate-900 border border-white/[0.06] flex items-center justify-center text-slate-700">
                        <Utensils size={28} strokeWidth={1.5} />
                      </div>
                      <div className="space-y-1.5 max-w-xs">
                        <h3 className="text-sm font-black text-slate-400">Recipe Engineering</h3>
                        <p className="text-xs text-slate-600 leading-relaxed">
                          Define exactly which raw materials are consumed when this item is sold.
                        </p>
                      </div>
                      <button
                        onClick={() => setPanel('link')}
                        className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-brand-500/10 border border-brand-500/20 text-brand-400 text-xs font-bold hover:bg-brand-500/20 transition-all"
                      >
                        <Plus size={13} />
                        Link your first ingredient
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