import { useState, useEffect } from 'react';
import { X, Plus, Trash2, Box, Info, Scale, ArrowRight, Hash } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { inventoryService } from '../../services/inventoryService';
import { 
  type StockItemResponse, 
  type PackagingUnitResponse,
  type CreatePackagingUnitRequest
} from '../../types/inventory';
import { toast } from 'sonner';
import ConfirmModal from '../ui/ConfirmModal';

interface Props {
  item: StockItemResponse;
  isOpen: boolean;
  onClose: () => void;
}

export default function PackagingUnitsModal({ item, isOpen, onClose }: Props) {
  const [units, setUnits] = useState<PackagingUnitResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [adding, setAdding] = useState(false);
  
  const [formData, setFormData] = useState<CreatePackagingUnitRequest>({
    name: '',
    quantityInBaseUnit: 1,
  });
  const [confirmConfig, setConfirmConfig] = useState<{
    open: boolean;
    title: string;
    message: string;
    onConfirm: () => void;
    isLoading: boolean;
  }>({
    open: false,
    title: '',
    message: '',
    onConfirm: () => {},
    isLoading: false
  });

  useEffect(() => {
    if (isOpen) {
      fetchUnits();
    }
  }, [isOpen, item]);

  const fetchUnits = async () => {
    setLoading(true);
    try {
      const res = await inventoryService.getPackagingUnits(item.id);
      if (res.success && res.data) setUnits(res.data.content);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await inventoryService.createPackagingUnit(item.id, formData);
      if (res.success) {
        toast.success('Packaging unit added');
        setFormData({ name: '', quantityInBaseUnit: 1 });
        setAdding(false);
        fetchUnits();
      }
    } catch (err) {
      toast.error('Failed to add packaging unit');
    }
  };

  const handleDelete = async (unitId: string) => {
    setConfirmConfig({
      open: true,
      title: 'Delete Packaging Unit',
      message: 'Are you sure you want to remove this packaging unit definition?',
      isLoading: false,
      onConfirm: async () => {
        setConfirmConfig(prev => ({ ...prev, isLoading: true }));
        try {
          const res = await inventoryService.deletePackagingUnit(unitId);
          if (res.success) {
            toast.success('Packaging unit deleted');
            fetchUnits();
          }
        } catch (err) {
          toast.error('Failed to delete packaging unit');
        } finally {
          setConfirmConfig(prev => ({ ...prev, open: false, isLoading: false }));
        }
      }
    });
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/80 backdrop-blur-md"
            onClick={onClose}
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="relative w-full max-w-lg glass-card border-white/10 shadow-2xl overflow-hidden"
          >
            {/* Header with Background Glow */}
            <div className="relative p-6 border-b border-white/5 bg-slate-900">
              <div className="absolute top-0 right-0 w-32 h-32 bg-brand-500/10 blur-3xl -mr-16 -mt-16 rounded-full" />
              <div className="flex items-center justify-between relative z-10">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-brand-500/10 flex items-center justify-center text-brand-400 border border-brand-500/20">
                    <Box size={24} />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-white">Packaging Units</h2>
                    <p className="text-sm text-slate-400">Define bulk measures for **{item.name}**</p>
                  </div>
                </div>
                <button onClick={onClose} className="p-2 hover:bg-white/5 rounded-xl text-slate-400 transition-colors">
                  <X size={20} />
                </button>
              </div>
            </div>

            <div className="p-6 space-y-6 max-h-[70vh] overflow-y-auto custom-scrollbar">
              {/* Add New Unit Form */}
              <AnimatePresence mode="wait">
                {adding ? (
                  <motion.form 
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    onSubmit={handleAdd} 
                    className="p-5 bg-brand-500/5 rounded-2xl border border-brand-500/20 space-y-4"
                  >
                    <div className="flex items-center gap-2 mb-2 text-brand-400">
                      <Plus size={16} />
                      <span className="text-xs font-bold uppercase tracking-wider">New Packaging Definition</span>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <label className="text-[11px] font-bold text-slate-500 uppercase px-1">Package Name</label>
                        <input 
                          type="text" required placeholder="e.g. Large Crate"
                          className="w-full bg-slate-900/50 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:ring-2 focus:ring-brand-500/50"
                          value={formData.name}
                          onChange={e => setFormData(prev => ({ ...prev, name: e.target.value }))}
                        />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-[11px] font-bold text-slate-500 uppercase px-1">Quantity in {item.baseUnit.symbol}</label>
                        <div className="relative">
                          <input 
                            type="number" required step="any"
                            className="w-full bg-slate-900/50 border border-white/10 rounded-xl pl-4 pr-12 py-2.5 text-sm text-white focus:outline-none focus:ring-2 focus:ring-brand-500/50"
                            value={formData.quantityInBaseUnit}
                            onChange={e => setFormData(prev => ({ ...prev, quantityInBaseUnit: Number(e.target.value) }))}
                          />
                          <span className="absolute right-4 top-1/2 -translate-y-1/2 text-[10px] font-bold text-slate-600 uppercase tracking-tighter">
                            {item.baseUnit.symbol}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="flex gap-3 pt-2">
                      <button type="submit" className="flex-1 btn-primary py-3">Create Packaging</button>
                      <button type="button" onClick={() => setAdding(false)} className="px-6 btn-ghost py-3">Cancel</button>
                    </div>
                  </motion.form>
                ) : (
                  <button 
                    onClick={() => setAdding(true)}
                    className="w-full py-4 border-2 border-dashed border-white/10 rounded-2xl text-slate-500 hover:text-brand-400 hover:border-brand-500/50 hover:bg-brand-500/5 transition-all flex items-center justify-center gap-3 text-sm font-bold group"
                  >
                    <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center group-hover:bg-brand-500/20 group-hover:scale-110 transition-all">
                      <Plus size={18} />
                    </div>
                    Define New Packaging Unit
                  </button>
                )}
              </AnimatePresence>

              {/* Units Grid */}
              <div className="grid grid-cols-1 gap-3">
                {loading ? (
                  Array(3).fill(0).map((_, i) => (
                    <div key={i} className="h-20 bg-white/5 rounded-2xl animate-pulse" />
                  ))
                ) : units.length === 0 ? (
                  <div className="text-center py-12 px-6 rounded-3xl bg-white/[0.02] border border-dashed border-white/10">
                    <Scale className="mx-auto text-slate-700 mb-4" size={48} />
                    <p className="text-slate-400 font-medium">No packaging units defined for this item.</p>
                    <p className="text-xs text-slate-600 mt-1">Add units like boxes, crates, or bags to simplify stocking.</p>
                  </div>
                ) : units.map(unit => (
                  <motion.div 
                    layout
                    key={unit.id} 
                    className="group relative p-4 rounded-2xl bg-white/[0.03] border border-white/5 hover:border-brand-500/30 hover:bg-brand-500/[0.02] transition-all flex items-center justify-between overflow-hidden"
                  >
                    <div className="flex items-center gap-4 relative z-10">
                      <div className="w-12 h-12 rounded-xl bg-slate-800 flex flex-col items-center justify-center border border-white/5 group-hover:bg-brand-500/10 group-hover:border-brand-500/20 transition-all">
                        <Hash size={14} className="text-slate-600 group-hover:text-brand-400" />
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter mt-0.5">PKG</span>
                      </div>
                      <div>
                        <p className="text-base font-bold text-white group-hover:text-brand-300 transition-colors">{unit.name}</p>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-xs font-medium text-slate-500">Contains</span>
                          <div className="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 text-[11px] font-bold flex items-center gap-1">
                            {unit.quantityInBaseUnit}
                            <ArrowRight size={10} />
                            {item.baseUnit.symbol}
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2 relative z-10">
                      <div className="text-right mr-4 hidden md:block">
                        <p className="text-[10px] text-slate-500 uppercase font-bold tracking-wider">Yield</p>
                        <p className="text-sm font-bold text-white">{(item.currentStock / unit.quantityInBaseUnit).toFixed(1)} {unit.name}s</p>
                      </div>
                      <button 
                        onClick={() => handleDelete(unit.id)}
                        className="p-2.5 text-slate-600 hover:text-rose-500 hover:bg-rose-500/10 rounded-xl transition-all opacity-0 group-hover:opacity-100"
                        title="Delete Packaging"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                    {/* Subtle Background Icon */}
                    <Box size={80} className="absolute -right-4 -bottom-4 text-white/[0.02] -rotate-12 group-hover:text-brand-500/[0.03] transition-colors" />
                  </motion.div>
                ))}
              </div>

              {/* Help Tip */}
              <div className="bg-brand-500/5 border border-brand-500/10 rounded-2xl p-5 flex gap-4">
                <div className="w-10 h-10 rounded-xl bg-brand-500/10 flex items-center justify-center text-brand-400 shrink-0">
                  <Info size={20} />
                </div>
                <div className="space-y-1">
                  <h4 className="text-xs font-bold text-white uppercase tracking-wider">Why use packaging?</h4>
                  <p className="text-[11px] text-slate-400 leading-relaxed">
                    Packaging units streamline stock-taking and procurement. Instead of counting individual grams or milliliters, staff can record inventory in standard commercial sizes.
                  </p>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      )}
      {/* Confirm Modal */}
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
