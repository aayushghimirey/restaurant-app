import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Layers, Plus, Save, Trash2, Edit3, FolderOpen, RefreshCw, UtensilsCrossed } from 'lucide-react';
import { inventoryService } from '../../services/inventoryService';
import { menuService } from '../../services/menuService';
import { toast } from 'sonner';
import type { InventoryCategoryResponse } from '../../types/inventory';
import type { MenuCategoryResponse } from '../../types';

type CategoryTab = 'INVENTORY' | 'MENU';

export default function InventoryCategoriesPage() {
  const [activeTab, setActiveTab] = useState<CategoryTab>('INVENTORY');
  
  // Inventory Category states
  const [invCategories, setInvCategories] = useState<InventoryCategoryResponse[]>([]);
  // Menu Category states
  const [menuCategories, setMenuCategories] = useState<MenuCategoryResponse[]>([]);
  
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  // Form State
  const [editingId, setEditingId] = useState<string | null>(null);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');

  useEffect(() => {
    fetchData();
    handleCancelEdit();
  }, [activeTab]);

  const fetchData = async () => {
    setLoading(true);
    try {
      if (activeTab === 'INVENTORY') {
        const res = await inventoryService.getAllCategories();
        if (res.success && res.data) {
          setInvCategories(res.data.content);
        }
      } else {
        const res = await menuService.getCategories();
        if (res.success && res.data) {
          setMenuCategories(res.data);
        }
      }
    } catch (err) {
      console.error(err);
      toast.error(`Failed to load ${activeTab === 'INVENTORY' ? 'inventory' : 'menu'} categories`);
    } finally {
      setLoading(false);
    }
  };

  const handleEditInit = (cat: InventoryCategoryResponse | MenuCategoryResponse) => {
    setEditingId(cat.id);
    setName(cat.name);
    setDescription(cat.description || '');
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setName('');
    setDescription('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return toast.error('Category name is required');

    setSubmitting(true);
    try {
      if (activeTab === 'INVENTORY') {
        if (editingId) {
          const res = await inventoryService.updateCategory(editingId, { name, description });
          if (res.success) {
            toast.success('Inventory category updated successfully');
            handleCancelEdit();
            fetchData();
          }
        } else {
          const res = await inventoryService.createCategory({ name, description });
          if (res.success) {
            toast.success('Inventory category created successfully');
            setName('');
            setDescription('');
            fetchData();
          }
        }
      } else {
        if (editingId) {
          const res = await menuService.updateCategory(editingId, { name, description });
          if (res.success) {
            toast.success('Menu category updated successfully');
            handleCancelEdit();
            fetchData();
          }
        } else {
          const res = await menuService.createCategory({ name, description });
          if (res.success) {
            toast.success('Menu category created successfully');
            setName('');
            setDescription('');
            fetchData();
          }
        }
      }
    } catch (err) {
      toast.error('Failed to save category');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm(`Are you sure you want to delete this ${activeTab === 'INVENTORY' ? 'inventory' : 'menu'} category?`)) return;
    try {
      if (activeTab === 'INVENTORY') {
        const res = await inventoryService.deleteCategory(id);
        if (res.success) {
          toast.success('Inventory category deleted successfully');
          if (editingId === id) handleCancelEdit();
          fetchData();
        }
      } else {
        const res = await menuService.deleteCategory(id);
        if (res.success) {
          toast.success('Menu category deleted successfully');
          if (editingId === id) handleCancelEdit();
          fetchData();
        }
      }
    } catch (err) {
      toast.error('Failed to delete category');
    }
  };

  const currentCategories = activeTab === 'INVENTORY' ? invCategories : menuCategories;

  return (
    <div className="space-y-6">
      {/* Header Panel */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-white flex items-center gap-2.5">
            <Layers size={20} className="text-brand-400" />
            Categories Studio
          </h1>
          <p className="text-slate-500 text-xs mt-1">Configure and isolate category registers for both Inventory and Menus.</p>
        </div>

        {/* Tab Selector */}
        <div className="flex items-center gap-2 bg-white/[0.02] border border-white/5 p-1 rounded-xl shadow-inner self-start">
          <button
            onClick={() => setActiveTab('INVENTORY')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-black uppercase tracking-wider transition-all duration-300 ${
              activeTab === 'INVENTORY'
                ? 'bg-brand-500 text-white shadow-lg shadow-brand-500/20'
                : 'text-slate-500 hover:text-slate-300'
            }`}
          >
            <Layers size={14} />
            Inventory Stock
          </button>
          <button
            onClick={() => setActiveTab('MENU')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-black uppercase tracking-wider transition-all duration-300 ${
              activeTab === 'MENU'
                ? 'bg-brand-500 text-white shadow-lg shadow-brand-500/20'
                : 'text-slate-500 hover:text-slate-300'
            }`}
          >
            <UtensilsCrossed size={14} />
            Menu Catalog
          </button>
        </div>
      </div>

      {/* Main Studio Split Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        {/* Left Side: Category list */}
        <div className="lg:col-span-2 space-y-4">
          <div className="glass-card p-5 border-white/5">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-sm font-bold text-white flex items-center gap-2">
                <FolderOpen size={16} className="text-brand-400" />
                {activeTab === 'INVENTORY' ? 'Inventory Stock Registry' : 'Menu Catalog Registry'} ({currentCategories.length})
              </h2>
              <button
                onClick={fetchData}
                disabled={loading}
                className="p-1.5 hover:bg-white/5 rounded-lg border border-white/5 text-slate-400 hover:text-white transition-all disabled:opacity-50"
              >
                <RefreshCw size={13} className={loading ? 'animate-spin' : ''} />
              </button>
            </div>

            {loading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {Array(4).fill(0).map((_, i) => (
                  <div key={i} className="animate-pulse bg-white/5 h-24 rounded-2xl border border-white/5" />
                ))}
              </div>
            ) : currentCategories.length === 0 ? (
              <div className="text-center py-12 bg-white/[0.01] rounded-2xl border border-dashed border-white/5 text-slate-500 text-xs">
                No {activeTab === 'INVENTORY' ? 'inventory' : 'menu'} categories created yet. Fill the form on the right to add one!
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <AnimatePresence mode="wait">
                  {currentCategories.map((cat) => (
                    <motion.div
                      key={cat.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      className={`group p-4 rounded-2xl border transition-all duration-300 relative overflow-hidden bg-slate-900/40 hover:bg-slate-900/70 hover:shadow-lg ${
                        editingId === cat.id
                          ? 'border-brand-500/50 shadow-[0_0_20px_rgba(99,102,241,0.1)] bg-brand-500/[0.03]'
                          : 'border-white/5 hover:border-white/10'
                      }`}
                    >
                      <div className="relative z-10 flex flex-col justify-between h-full min-h-[80px]">
                        <div>
                          <h3 className="text-xs font-black text-white uppercase tracking-wider mb-1.5">{cat.name}</h3>
                          <p className="text-[11px] text-slate-400 line-clamp-2 leading-relaxed">
                            {cat.description || 'No description provided.'}
                          </p>
                        </div>

                        {/* Actions Row */}
                        <div className="flex items-center justify-end gap-2 mt-4 opacity-0 group-hover:opacity-100 focus-within:opacity-100 transition-opacity">
                          <button
                            onClick={() => handleEditInit(cat)}
                            className="p-1.5 hover:bg-brand-500/10 text-brand-400 rounded-lg transition-colors"
                            title="Edit Category"
                          >
                            <Edit3 size={13} />
                          </button>
                          <button
                            onClick={() => handleDelete(cat.id)}
                            className="p-1.5 hover:bg-rose-500/10 text-rose-400 rounded-lg transition-colors"
                            title="Delete Category"
                          >
                            <Trash2 size={13} />
                          </button>
                        </div>
                      </div>
                      <div className="absolute inset-0 bg-gradient-to-br from-brand-500/[0.01] to-transparent pointer-events-none" />
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            )}
          </div>
        </div>

        {/* Right Side: Form Panel */}
        <div>
          <div className="glass-card p-5 border-white/5 bg-slate-900/60 sticky top-24">
            <h2 className="text-sm font-bold text-white mb-4 flex items-center gap-2">
              {editingId ? (
                <>
                  <Edit3 size={16} className="text-brand-400 animate-pulse" />
                  Edit {activeTab === 'INVENTORY' ? 'Inventory' : 'Menu'} Category
                </>
              ) : (
                <>
                  <Plus size={16} className="text-brand-400" />
                  Create {activeTab === 'INVENTORY' ? 'Inventory' : 'Menu'} Category
                </>
              )}
            </h2>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Category Name</label>
                <input
                  type="text"
                  required
                  placeholder={
                    activeTab === 'INVENTORY'
                      ? 'e.g. Raw Poultry, Vegetables, Spices...'
                      : 'e.g. Appetizers, Main Course, Desserts...'
                  }
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-slate-800/40 border border-white/10 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:ring-2 focus:ring-brand-500/50 transition-all"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Description</label>
                <textarea
                  placeholder="Provide an overview of items belonging to this category..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full bg-slate-800/40 border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:ring-2 focus:ring-brand-500/50 h-24 resize-none transition-all"
                />
              </div>

              <div className="flex gap-2.5 pt-2">
                {editingId && (
                  <button
                    type="button"
                    onClick={handleCancelEdit}
                    className="flex-1 btn-ghost py-2.5 text-xs font-semibold"
                  >
                    Cancel
                  </button>
                )}
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex-[2] btn-primary py-2.5 text-xs font-bold flex items-center justify-center gap-1.5"
                >
                  {submitting ? (
                    'Saving...'
                  ) : (
                    <>
                      <Save size={14} />
                      {editingId ? 'Save Changes' : 'Create Category'}
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
