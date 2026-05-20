import { useState, useEffect } from 'react';
import { X, Save, Edit2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { inventoryService } from '../../services/inventoryService';
import { toast } from 'sonner';
import type { 
  StockItemResponse, 
  InventoryCategoryResponse,
  UpdateStockItemRequest 
} from '../../types/inventory';

interface Props {
  item: StockItemResponse;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export default function EditStockItemModal({ item, isOpen, onClose, onSuccess }: Props) {
  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState<InventoryCategoryResponse[]>([]);
  const [fetchingCategories, setFetchingCategories] = useState(true);
  
  const [showAddCategory, setShowAddCategory] = useState(false);
  const [newCatName, setNewCatName] = useState('');
  
  const [formData, setFormData] = useState<UpdateStockItemRequest>({
    name: item.name,
    categoryId: item.categoryId,
    baseUnitId: item.baseUnit.id,
    minimumStock: item.minimumStock,
  });

  useEffect(() => {
    if (isOpen) {
      fetchCategories();
      setFormData({
        name: item.name,
        categoryId: item.categoryId,
        baseUnitId: item.baseUnit.id,
        minimumStock: item.minimumStock,
      });
    }
  }, [isOpen, item]);

  const fetchCategories = async () => {
    setFetchingCategories(true);
    try {
      const res = await inventoryService.getAllCategories();
      setCategories(res.data?.content || []);
    } catch (err) {
      console.error('Failed to fetch categories', err);
    } finally {
      setFetchingCategories(false);
    }
  };

  const handleCreateCategory = async () => {
    if (!newCatName.trim()) return;
    try {
      const res = await inventoryService.createCategory({ name: newCatName });
      if (res.success && res.data) {
        setCategories(prev => [...prev, res.data]);
        setFormData(prev => ({ ...prev, categoryId: res.data.id }));
        setNewCatName('');
        setShowAddCategory(false);
        toast.success('Inventory category created successfully');
      }
    } catch (err) {
      toast.error('Failed to create category');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name) return toast.error('Name is required');
    if (!formData.categoryId) return toast.error('Category is required');

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
                  <div className="flex justify-between items-center">
                    <label className="text-sm font-semibold text-slate-400">Category</label>
                    <button
                      type="button"
                      onClick={() => setShowAddCategory(!showAddCategory)}
                      className="text-xs text-brand-400 hover:text-brand-300 flex items-center gap-0.5 transition-colors"
                    >
                      {showAddCategory ? 'Cancel' : '+ New'}
                    </button>
                  </div>
                  
                  <AnimatePresence>
                    {showAddCategory && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="overflow-hidden"
                      >
                        <div className="flex gap-1.5 p-1.5 bg-slate-800/30 rounded-xl border border-slate-700/50 mb-2">
                          <input
                            className="bg-slate-800/50 border border-white/10 rounded-lg px-2.5 py-1 text-xs text-white focus:outline-none focus:ring-2 focus:ring-brand-500/50 flex-1"
                            placeholder="Category name"
                            value={newCatName}
                            onChange={(e) => setNewCatName(e.target.value)}
                            onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleCreateCategory())}
                            autoFocus
                          />
                          <button
                            type="button"
                            onClick={handleCreateCategory}
                            disabled={!newCatName.trim()}
                            className="bg-brand-500 hover:bg-brand-400 text-white rounded-lg text-xs px-2.5 py-1 disabled:opacity-50 disabled:cursor-not-allowed font-medium transition-colors"
                          >
                            Create
                          </button>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  <select
                    className="w-full bg-slate-800/50 border border-white/10 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:ring-2 focus:ring-brand-500/50 cursor-pointer"
                    value={formData.categoryId}
                    onChange={(e) => setFormData(prev => ({ ...prev, categoryId: e.target.value }))}
                    disabled={fetchingCategories}
                  >
                    {fetchingCategories ? (
                      <option>Loading categories...</option>
                    ) : categories.length === 0 ? (
                      <option value="">No categories, create one!</option>
                    ) : (
                      categories.map(cat => (
                        <option key={cat.id} value={cat.id}>{cat.name}</option>
                      ))
                    )}
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
                  type="submit" disabled={loading || fetchingCategories}
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
