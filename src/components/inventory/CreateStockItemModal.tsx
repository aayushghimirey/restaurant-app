import { useState, useEffect } from 'react';
import { X, Save, Package, Info } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { inventoryService } from '../../services/inventoryService';
import { toast } from 'sonner';
import type { 
  UnitResponse, 
  InventoryCategoryResponse,
  CreateStockItemRequest 
} from '../../types/inventory';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export default function CreateStockItemModal({ isOpen, onClose, onSuccess }: Props) {
  const [loading, setLoading] = useState(false);
  const [units, setUnits] = useState<UnitResponse[]>([]);
  const [categories, setCategories] = useState<InventoryCategoryResponse[]>([]);
  const [fetchingUnits, setFetchingUnits] = useState(true);
  const [fetchingCategories, setFetchingCategories] = useState(true);
  
  const [showAddCategory, setShowAddCategory] = useState(false);
  const [newCatName, setNewCatName] = useState('');

  const [formData, setFormData] = useState<CreateStockItemRequest>({
    name: '',
    categoryId: '',
    baseUnitId: '',
    minimumStock: 0,
  });

  useEffect(() => {
    if (isOpen) {
      fetchInitialData();
    }
  }, [isOpen]);

  const fetchInitialData = async () => {
    setFetchingUnits(true);
    setFetchingCategories(true);
    try {
      const [sysRes, custRes, catRes] = await Promise.all([
        inventoryService.getSystemUnits(),
        inventoryService.getCustomUnits(),
        inventoryService.getAllCategories()
      ]);
      
      const allUnits = [...(sysRes.data?.content || []), ...(custRes.data?.content || [])];
      setUnits(allUnits);
      
      const allCats = catRes.data?.content || [];
      setCategories(allCats);
      
      setFormData({
        name: '',
        baseUnitId: allUnits[0]?.id || '',
        categoryId: allCats[0]?.id || '',
        minimumStock: 0,
      });
    } catch (err) {
      console.error('Failed to fetch initial data', err);
      toast.error('Failed to load categories or units');
    } finally {
      setFetchingUnits(false);
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
    if (!formData.baseUnitId) return toast.error('Base unit is required');

    setLoading(true);
    try {
      const res = await inventoryService.createStockItem(formData);
      if (res.success) {
        toast.success('Stock item created successfully');
        onSuccess();
        onClose();
      }
    } catch (err) {
      toast.error('Failed to create stock item');
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
                  <Package size={20} />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-white">New Stock Item</h2>
                  <p className="text-sm text-slate-400">Add a new item to your inventory registry.</p>
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
                  type="text"
                  required
                  className="w-full bg-slate-800/50 border border-white/10 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:ring-2 focus:ring-brand-500/50"
                  placeholder="e.g. Chicken Breast, Olive Oil..."
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

                <div className="space-y-2">
                  <label className="text-sm font-semibold text-slate-400">Base Unit</label>
                  <select
                    className="w-full bg-slate-800/50 border border-white/10 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:ring-2 focus:ring-brand-500/50 cursor-pointer"
                    value={formData.baseUnitId}
                    onChange={(e) => setFormData(prev => ({ ...prev, baseUnitId: e.target.value }))}
                    disabled={fetchingUnits}
                  >
                    {fetchingUnits ? (
                      <option>Loading units...</option>
                    ) : (
                      units.map(u => (
                        <option key={u.id} value={u.id}>{u.name} ({u.symbol})</option>
                      ))
                    )}
                  </select>
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <label className="text-sm font-semibold text-slate-400">Minimum Stock Level</label>
                  <span className="text-[10px] text-slate-500 font-medium bg-white/5 px-2 py-0.5 rounded-full">
                    Alerts when below this
                  </span>
                </div>
                <input
                  type="number"
                  step="any"
                  className="w-full bg-slate-800/50 border border-white/10 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:ring-2 focus:ring-brand-500/50"
                  placeholder="0.00"
                  value={formData.minimumStock || ''}
                  onChange={(e) => setFormData(prev => ({ ...prev, minimumStock: Number(e.target.value) }))}
                />
              </div>

              <div className="bg-brand-500/5 border border-brand-500/10 rounded-xl p-4 flex gap-3 text-slate-400 text-xs leading-relaxed">
                <Info className="shrink-0 text-brand-400" size={18} />
                <p>
                  Setting an accurate **Base Unit** is critical. All future transactions and packaging units will be calculated relative to this unit.
                </p>
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="flex-1 btn-ghost py-3"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading || fetchingUnits || fetchingCategories}
                  className="flex-[2] btn-primary py-3 flex items-center justify-center gap-2"
                >
                  {loading ? 'Creating...' : (
                    <>
                      <Save size={18} />
                      Create Stock Item
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
