import { useState, useEffect } from 'react';
import { X, Save, Edit2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { inventoryService } from '../../services/inventoryService';
import { toast } from 'sonner';
import { 
  type StockItemResponse, 
  InventoryCategory, 
  type UpdateStockItemRequest 
} from '../../types/inventory';

interface Props {
  item: StockItemResponse;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export default function EditStockItemModal({ item, isOpen, onClose, onSuccess }: Props) {
  const [loading, setLoading] = useState(false);
  
  const [formData, setFormData] = useState<UpdateStockItemRequest>({
    name: item.name,
    category: item.category,
    baseUnitId: item.baseUnit.id,
    minimumStock: item.minimumStock,
  });

  useEffect(() => {
    if (isOpen) {
      setFormData({
        name: item.name,
        category: item.category,
        baseUnitId: item.baseUnit.id,
        minimumStock: item.minimumStock,
      });
    }
  }, [isOpen, item]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await inventoryService.updateStockItem(item.id, formData);
      if (res.success) {
        toast.success('Item updated successfully');
        onSuccess();
        onClose();
      }
    } catch (err) {
      toast.error('Failed to update item');
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
            className="relative w-full max-w-lg glass-card border-white/10 shadow-2xl p-6 bg-slate-900"
          >
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-brand-500/10 flex items-center justify-center text-brand-400">
                  <Edit2 size={20} />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-white">Edit Stock Item</h2>
                  <p className="text-sm text-slate-400">Update registry details for {item.name}</p>
                </div>
              </div>
              <button onClick={onClose} className="p-2 hover:bg-white/5 rounded-lg text-slate-400 transition-colors">
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-400">Item Name</label>
                <input
                  type="text" required
                  className="w-full bg-slate-800/50 border border-white/10 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:ring-2 focus:ring-brand-500/50"
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-slate-400">Category</label>
                  <select
                    className="w-full bg-slate-800/50 border border-white/10 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:ring-2 focus:ring-brand-500/50 cursor-pointer"
                    value={formData.category}
                    onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value as InventoryCategory }))}
                  >
                    {Object.values(InventoryCategory).map(cat => (
                      <option key={cat} value={cat}>{cat.replace(/_/g, ' ')}</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-2 opacity-50 cursor-not-allowed">
                  <label className="text-sm font-semibold text-slate-400">Base Unit (Locked)</label>
                  <div className="w-full bg-slate-900 border border-white/5 rounded-xl px-4 py-2.5 text-slate-500">
                    {item.baseUnit.name} ({item.baseUnit.symbol})
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-400">Minimum Stock Level</label>
                <input
                  type="number" step="any"
                  className="w-full bg-slate-800/50 border border-white/10 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:ring-2 focus:ring-brand-500/50"
                  value={formData.minimumStock}
                  onChange={(e) => setFormData(prev => ({ ...prev, minimumStock: Number(e.target.value) }))}
                />
              </div>

              <div className="flex gap-3 pt-2">
                <button type="button" onClick={onClose} className="flex-1 btn-ghost py-3">Cancel</button>
                <button
                  type="submit" disabled={loading}
                  className="flex-[2] btn-primary py-3 flex items-center justify-center gap-2"
                >
                  {loading ? 'Saving...' : (
                    <>
                      <Save size={18} />
                      Save Changes
                    </>
                  )}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
