import { useState, useEffect } from 'react';
import { X, Save, ArrowUpRight, ArrowDownLeft, Box, Calculator, TrendingUp, TrendingDown } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { inventoryService } from '../../services/inventoryService';
import { 
  type StockItemResponse, 
  TransactionType, 
  UnitSource,
  type PackagingUnitResponse 
} from '../../types/inventory';
import { toast } from 'sonner';

interface Props {
  item: StockItemResponse;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export default function StockAdjustModal({ item, isOpen, onClose, onSuccess }: Props) {
  const [loading, setLoading] = useState(false);
  const [type, setType] = useState<TransactionType>(TransactionType.ADJUSTMENT_IN);
  const [quantity, setQuantity] = useState<number>(0);
  const [remark, setRemark] = useState('');
  
  // Unit Selection
  const [usePackaging, setUsePackaging] = useState(false);
  const [packagingUnits, setPackagingUnits] = useState<PackagingUnitResponse[]>([]);
  const [selectedPackageId, setSelectedPackageId] = useState<string>('');

  useEffect(() => {
    if (isOpen) {
      fetchPackaging();
    }
  }, [isOpen, item]);

  const fetchPackaging = async () => {
    try {
      const res = await inventoryService.getPackagingUnits(item.id);
      if (res.success && res.data) {
        setPackagingUnits(res.data.content);
        if (res.data.content.length > 0) {
          setSelectedPackageId(res.data.content[0].id);
        }
      }
    } catch (err) {
      console.error(err);
    }
  };

  const selectedPackage = packagingUnits.find(p => p.id === selectedPackageId);
  const multiplier = usePackaging && selectedPackage ? selectedPackage.quantityInBaseUnit : 1;
  const totalBaseQty = quantity * multiplier;
  const newBalance = type === TransactionType.ADJUSTMENT_IN 
    ? item.currentStock + totalBaseQty 
    : item.currentStock - totalBaseQty;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (quantity <= 0) return toast.error('Quantity must be positive');

    setLoading(true);
    try {
      const res = await inventoryService.adjustStock({
        stockItemId: item.id,
        quantity,
        type,
        remark,
        packagingUnitId: usePackaging ? selectedPackageId : undefined,
        unitId: !usePackaging ? item.baseUnit.id : undefined,
        unitSource: !usePackaging ? UnitSource.SYSTEM : undefined
      });

      if (res.success) {
        toast.success('Stock adjusted successfully');
        onSuccess();
        onClose();
      }
    } catch (err) {
      toast.error('Failed to adjust stock');
    } finally {
      setLoading(false);
    }
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
            className="relative w-full max-w-lg glass-card border-white/10 shadow-2xl p-6"
          >
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center transition-colors ${
                  type === TransactionType.ADJUSTMENT_IN ? 'bg-emerald-500/10 text-emerald-400' : 'bg-rose-500/10 text-rose-400'
                }`}>
                  {type === TransactionType.ADJUSTMENT_IN ? <TrendingUp size={20} /> : <TrendingDown size={20} />}
                </div>
                <div>
                  <h2 className="text-xl font-bold text-white">Stock Adjustment</h2>
                  <p className="text-sm text-slate-400">{item.name}</p>
                </div>
              </div>
              <button onClick={onClose} className="p-2 hover:bg-white/5 rounded-lg text-slate-400 transition-colors">
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Type Switcher */}
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setType(TransactionType.ADJUSTMENT_IN)}
                  className={`flex flex-col items-center gap-2 p-4 rounded-2xl border transition-all duration-300 ${
                    type === TransactionType.ADJUSTMENT_IN 
                    ? 'bg-emerald-500/10 border-emerald-500 text-emerald-500 shadow-[0_0_20px_rgba(16,185,129,0.1)]' 
                    : 'bg-white/5 border-white/5 text-slate-500 hover:bg-white/10'
                  }`}
                >
                  <ArrowUpRight size={20} />
                  <span className="text-xs font-bold uppercase tracking-wider">Stock In</span>
                </button>
                <button
                  type="button"
                  onClick={() => setType(TransactionType.ADJUSTMENT_OUT)}
                  className={`flex flex-col items-center gap-2 p-4 rounded-2xl border transition-all duration-300 ${
                    type === TransactionType.ADJUSTMENT_OUT 
                    ? 'bg-rose-500/10 border-rose-500 text-rose-500 shadow-[0_0_20px_rgba(239,68,68,0.1)]' 
                    : 'bg-white/5 border-white/5 text-slate-500 hover:bg-white/10'
                  }`}
                >
                  <ArrowDownLeft size={20} />
                  <span className="text-xs font-bold uppercase tracking-wider">Stock Out</span>
                </button>
              </div>

              {/* Impact Card */}
              <div className="bg-slate-900/50 rounded-2xl p-5 border border-white/5 relative overflow-hidden group">
                <div className="flex justify-between items-center relative z-10">
                  <div className="text-center flex-1">
                    <p className="text-[10px] text-slate-500 uppercase font-bold mb-1">Current</p>
                    <p className="text-xl font-bold text-white">{item.currentStock} <span className="text-xs font-normal text-slate-500">{item.baseUnit.symbol}</span></p>
                  </div>
                  <div className="px-4">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                      type === TransactionType.ADJUSTMENT_IN ? 'bg-emerald-500/20 text-emerald-500' : 'bg-rose-500/20 text-rose-500'
                    }`}>
                      {type === TransactionType.ADJUSTMENT_IN ? '+' : '-'}
                    </div>
                  </div>
                  <div className="text-center flex-1">
                    <p className="text-[10px] text-slate-500 uppercase font-bold mb-1">Adjustment</p>
                    <p className={`text-xl font-bold ${type === TransactionType.ADJUSTMENT_IN ? 'text-emerald-400' : 'text-rose-400'}`}>
                      {totalBaseQty} <span className="text-xs font-normal opacity-70">{item.baseUnit.symbol}</span>
                    </p>
                  </div>
                  <div className="px-4 text-slate-700">
                    <Calculator size={16} />
                  </div>
                  <div className="text-center flex-1">
                    <p className="text-[10px] text-slate-500 uppercase font-bold mb-1">Result</p>
                    <p className="text-xl font-bold text-brand-400">{newBalance} <span className="text-xs font-normal text-slate-500">{item.baseUnit.symbol}</span></p>
                  </div>
                </div>
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-brand-500/5 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
              </div>

              {/* Inputs */}
              <div className="space-y-4">
                {packagingUnits.length > 0 && (
                  <div className="flex p-1 bg-white/5 rounded-xl border border-white/5">
                    <button
                      type="button"
                      onClick={() => setUsePackaging(false)}
                      className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${!usePackaging ? 'bg-brand-500 text-white shadow-lg' : 'text-slate-500 hover:text-slate-300'}`}
                    >
                      Base Unit ({item.baseUnit.symbol})
                    </button>
                    <button
                      type="button"
                      onClick={() => setUsePackaging(true)}
                      className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${usePackaging ? 'bg-brand-500 text-white shadow-lg' : 'text-slate-500 hover:text-slate-300'}`}
                    >
                      Use Packaging
                    </button>
                  </div>
                )}

                <div className="space-y-2">
                  <label className="text-sm font-semibold text-slate-400 flex items-center gap-2">
                    Quantity to {type === TransactionType.ADJUSTMENT_IN ? 'Add' : 'Remove'}
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="number" step="any" required
                      className="flex-1 bg-slate-800/50 border border-white/10 rounded-xl px-4 py-3 text-white text-lg focus:outline-none focus:ring-2 focus:ring-brand-500/50"
                      placeholder="0.00"
                      value={quantity || ''}
                      onChange={(e) => setQuantity(Number(e.target.value))}
                    />
                    {usePackaging ? (
                      <select 
                        className="bg-slate-800/50 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-brand-500/50 grow max-w-[140px]"
                        value={selectedPackageId}
                        onChange={(e) => setSelectedPackageId(e.target.value)}
                      >
                        {packagingUnits.map(p => (
                          <option key={p.id} value={p.id}>{p.name}</option>
                        ))}
                      </select>
                    ) : (
                      <div className="bg-slate-900 border border-white/5 rounded-xl px-4 py-3 text-slate-500 flex items-center justify-center min-w-[80px] font-bold">
                        {item.baseUnit.symbol}
                      </div>
                    )}
                  </div>
                  {usePackaging && selectedPackage && (
                     <div className="flex items-center gap-2 text-[11px] text-brand-400 bg-brand-500/5 px-3 py-1.5 rounded-lg border border-brand-500/10">
                       <Box size={12} />
                       <span>1 {selectedPackage.name} = {selectedPackage.quantityInBaseUnit} {item.baseUnit.symbol}</span>
                     </div>
                  )}
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-semibold text-slate-400">Remark / Reason</label>
                  <textarea
                    className="w-full bg-slate-800/50 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-brand-500/50 h-24 resize-none"
                    placeholder="e.g. Weekly Restock, Spillage, Order fulfillment..."
                    value={remark}
                    onChange={(e) => setRemark(e.target.value)}
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className={`w-full py-4 rounded-2xl flex items-center justify-center gap-3 font-bold transition-all ${
                  type === TransactionType.ADJUSTMENT_IN 
                  ? 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-[0_10px_30px_rgba(16,185,129,0.3)]' 
                  : 'bg-rose-600 hover:bg-rose-500 text-white shadow-[0_10px_30px_rgba(239,68,68,0.3)]'
                }`}
              >
                {loading ? 'Processing...' : (
                  <>
                    <Save size={20} />
                    Confirm {type === TransactionType.ADJUSTMENT_IN ? 'Stock In' : 'Stock Out'}
                  </>
                )}
              </button>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
