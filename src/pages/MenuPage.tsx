import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import {
  ChevronRight,
  Edit2,
  Layers,
  LayoutGrid,
  List,
  Package,
  Plus,
  PlusCircle,
  Search,
  Trash2,
  Utensils,
  X
} from 'lucide-react';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useSearchParams } from 'react-router-dom';
import { toast } from 'sonner';
import CreateMenuItemModal from '../components/menu/CreateMenuItemModal';
import MenuOptionsModal from '../components/menu/MenuOptionsModal';
import RecipeEditorModal from '../components/menu/RecipeEditorModal';
import ConfirmModal from '../components/ui/ConfirmModal';
import { ErrorBanner, Spinner } from '../components/ui/Feedback';
import Modal from '../components/ui/Modal';
import Pagination from '../components/ui/Pagination';
import { useAuth } from '../contexts/AuthContext';
import { DEFAULT_MENU_IMAGE } from '../lib/utils';
import { menuService } from '../services/menuService';
import type {
  CreateMenuCategoryRequest,
  CreateMenuItemRequest,
  MenuItemResponse,
} from '../types';

/* ─────────────────────────── helpers ─────────────────────────── */

const inputCls = 'w-full bg-slate-950 border border-white/[0.06] rounded-xl px-4 py-3 text-sm text-white placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-brand-500/40 transition-all';
const btnBase = 'inline-flex items-center justify-center gap-2 font-bold transition-all active:scale-95';

/* ═══════════════════════════════════════════════════════════════ */

export default function MenuPage() {
  const { isTenant } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  const search = searchParams.get('q') || '';
  const [categoryFilter, setCategoryFilter] = useState('ALL');
  const [viewMode, setViewMode] = useState<'GRID' | 'LIST'>('GRID');
  const page = parseInt(searchParams.get('page') || '0', 10);
  const setPage = (p: number) => {
    searchParams.set('page', p.toString());
    setSearchParams(searchParams);
  };
  const [selectedItem, setSelectedItem] = useState<MenuItemResponse | null>(null);

  const [isItemModalOpen, setIsItemModalOpen] = useState(false);
  const [isCatModalOpen, setIsCatModalOpen] = useState(false);
  const [isRecipeModalOpen, setIsRecipeModalOpen] = useState(false);
  const [isOptionsModalOpen, setIsOptionsModalOpen] = useState(false);
  const [editingCat, setEditingCat] = useState<any | null>(null);
  const [confirmConfig, setConfirmConfig] = useState<{
    open: boolean; title: string; message: string;
    onConfirm: () => void; isLoading: boolean;
  }>({ open: false, title: '', message: '', onConfirm: () => { }, isLoading: false });

  const qc = useQueryClient();

  /* ── queries ── */
  const { data: menuRes, isLoading: menuLoading, isError: menuError } = useQuery({
    queryKey: ['menu-items', search, categoryFilter, page],
    queryFn: () => menuService.getMenuItems(search, categoryFilter, page, 20),
  });

  const { data: catRes, isLoading: catLoading } = useQuery({
    queryKey: ['menu-categories'],
    queryFn: menuService.getCategories,
  });

  const catForm = useForm<CreateMenuCategoryRequest>();

  /* ── mutations ── */
  const createItem = useMutation({
    mutationFn: menuService.createMenuItem,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['menu-items'] });
      setIsItemModalOpen(false);
      toast.success('Menu item created');
    },
    onError: () => toast.error('Failed to create menu item'),
  });

  const updateItem = useMutation({
    mutationFn: ({ id, data }: { id: string; data: CreateMenuItemRequest }) =>
      menuService.updateMenuItem(id, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['menu-items'] });
      setIsItemModalOpen(false);
      setSelectedItem(null);
      toast.success('Menu item updated');
    },
    onError: () => toast.error('Failed to update menu item'),
  });

  const createCat = useMutation({
    mutationFn: menuService.createCategory,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['menu-categories'] });
      setIsCatModalOpen(false);
      catForm.reset();
      toast.success('Category created');
    },
    onError: () => toast.error('Failed to create category'),
  });

  const updateCat = useMutation({
    mutationFn: ({ id, data }: { id: string; data: CreateMenuCategoryRequest }) =>
      menuService.updateCategory(id, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['menu-categories'] });
      setEditingCat(null);
      catForm.reset();
      toast.success('Category updated');
    },
    onError: () => toast.error('Failed to update category'),
  });

  const deleteCat = useMutation({
    mutationFn: menuService.deleteCategory,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['menu-categories'] });
      toast.success('Category deleted');
    },
    onError: () => toast.error('Failed to delete category'),
  });

  const items = menuRes?.data?.content ?? [];
  const categories = catRes?.data ?? [];

  return (
    <div className="flex flex-col h-[calc(100vh-10rem)]">
      {/* ── Top Bar ── */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-bold text-white flex items-center gap-2">
            <Utensils size={20} className="text-brand-400" />
            Menu Management
          </h1>
          <p className="text-xs text-slate-500 mt-1">Design and manage your digital catalog.</p>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center bg-white/[0.03] border border-white/10 rounded-xl p-1">
            <button
              onClick={() => setViewMode('GRID')}
              className={`p-1.5 rounded-lg transition-all ${viewMode === 'GRID' ? 'bg-brand-500 text-white shadow-lg' : 'text-slate-500 hover:text-slate-300'}`}
            >
              <LayoutGrid size={14} />
            </button>
            <button
              onClick={() => setViewMode('LIST')}
              className={`p-1.5 rounded-lg transition-all ${viewMode === 'LIST' ? 'bg-brand-500 text-white shadow-lg' : 'text-slate-500 hover:text-slate-300'}`}
            >
              <List size={14} />
            </button>
          </div>

          <button
            onClick={() => setIsCatModalOpen(true)}
            className="flex items-center gap-2 px-3 py-2 rounded-xl bg-white/[0.03] border border-white/10 text-slate-300 text-xs hover:border-white/20 transition-all"
          >
            <Layers size={14} className="text-brand-400" />
            Categories
          </button>

          <button
            onClick={() => { setSelectedItem(null); setIsItemModalOpen(true); }}
            className="btn-primary h-10 px-4"
          >
            <Plus size={16} />
            Add Item
          </button>
        </div>
      </div>

      {/* ── Body ── */}
      <div className="flex flex-1 overflow-hidden">

        {/* ── Sidebar ── */}
        <aside className="hidden lg:flex flex-col w-56 shrink-0 border-r border-white/[0.05] bg-slate-950 overflow-y-auto py-5 px-3 custom-scrollbar">

          <button
            onClick={() => { setCategoryFilter('ALL'); setPage(0); }}
            className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-xs font-bold transition-all mb-1 ${categoryFilter === 'ALL'
                ? 'bg-brand-500 text-white shadow-lg shadow-brand-500/20'
                : 'text-slate-400 hover:text-white hover:bg-white/5'
              }`}
          >
            <LayoutGrid size={14} />
            <span>All Items</span>
            {menuRes?.data && (
              <span className={`ml-auto text-[9px] font-black px-1.5 py-0.5 rounded-md ${categoryFilter === 'ALL' ? 'bg-white/20' : 'bg-white/5 text-slate-500'}`}>
                {menuRes.data.totalElements ?? items.length}
              </span>
            )}
          </button>

          <div className="mt-4 mb-2 px-3">
            <span className="text-[9px] font-black text-slate-600 uppercase tracking-[0.18em]">Categories</span>
          </div>

          <div className="space-y-0.5 flex-1">
            {catLoading
              ? Array(5).fill(0).map((_, i) => (
                <div key={i} className="h-9 rounded-xl bg-white/5 animate-pulse" />
              ))
              : categories.map(c => (
                <button
                  key={c.id}
                  onClick={() => { setCategoryFilter(c.id); setPage(0); }}
                  className={`w-full flex items-center gap-2 px-2.5 py-2.5 rounded-xl text-[11px] font-bold transition-all ${categoryFilter === c.id
                      ? 'bg-brand-500/10 text-brand-400 border border-brand-500/20'
                      : 'text-slate-500 hover:text-white hover:bg-white/5 border border-transparent'
                    }`}
                >
                  <span className={`w-1 h-1 rounded-full shrink-0 ${categoryFilter === c.id ? 'bg-brand-400' : 'bg-slate-700'}`} />
                  <span className="truncate">{c.name}</span>
                  <ChevronRight size={10} className={`ml-auto shrink-0 ${categoryFilter === c.id ? 'text-brand-500' : 'text-slate-700'}`} />
                </button>
              ))}
          </div>
        </aside>

        {/* ── Main ── */}
        <main className="flex-1 min-w-0 p-6 space-y-5 overflow-y-auto custom-scrollbar">

          {/* active filter chip + results count */}
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-2 flex-wrap">
              {categoryFilter !== 'ALL' && (
                <span className="inline-flex items-center gap-1.5 bg-brand-500/10 border border-brand-500/20 text-brand-400 text-[10px] font-black uppercase tracking-wider px-3 py-1.5 rounded-full">
                  <Layers size={10} />
                  {categories.find(c => c.id === categoryFilter)?.name ?? 'Category'}
                  <button
                    onClick={() => setCategoryFilter('ALL')}
                    className="ml-0.5 hover:text-white transition-colors"
                  >
                    <X size={10} />
                  </button>
                </span>
              )}
              {search && (
                <span className="inline-flex items-center gap-1.5 bg-slate-800 border border-white/5 text-slate-400 text-[10px] font-black uppercase tracking-wider px-3 py-1.5 rounded-full">
                  <Search size={10} />
                  "{search}"
                  <button 
                    onClick={() => {
                      searchParams.delete('q');
                      searchParams.set('page', '0');
                      setSearchParams(searchParams);
                    }} 
                    className="ml-0.5 hover:text-white transition-colors"
                  >
                    <X size={10} />
                  </button>
                </span>
              )}
            </div>
            {!menuLoading && items.length > 0 && (
              <p className="text-[10px] text-slate-600 font-bold uppercase tracking-widest shrink-0">
                {items.length} item{items.length !== 1 ? 's' : ''}
              </p>
            )}
          </div>

          {/* ── Catalog ── */}
          {menuLoading ? (
            <div className="flex flex-col items-center justify-center py-40 gap-4">
              <Spinner />
              <p className="text-xs text-slate-500 font-semibold animate-pulse tracking-wider uppercase">Loading catalog…</p>
            </div>
          ) : menuError ? (
            <ErrorBanner message="Failed to load menu items. Please try again." />
          ) : items.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-32 rounded-3xl border border-dashed border-white/[0.06] bg-slate-900/30">
              <div className="w-16 h-16 rounded-2xl bg-slate-900 border border-white/5 flex items-center justify-center text-slate-700 mb-5">
                <Utensils size={28} strokeWidth={1.5} />
              </div>
              <h3 className="text-sm font-bold text-slate-400">No items found</h3>
              <p className="text-xs text-slate-600 mt-1 mb-5">
                {search || categoryFilter !== 'ALL' ? 'Try adjusting your filters.' : 'Start by adding your first menu item.'}
              </p>
              {!search && categoryFilter === 'ALL' && (
                <button
                  onClick={() => { setSelectedItem(null); setIsItemModalOpen(true); }}
                  className={`${btnBase} h-9 px-5 rounded-xl bg-brand-500 text-xs text-white shadow-lg shadow-brand-500/25 hover:bg-brand-400`}
                >
                  <Plus size={14} />
                  Add First Item
                </button>
              )}
            </div>
          ) : viewMode === 'GRID' ? (

            /* ── GRID VIEW ── */
            <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-4">
              {items.map(item => {
                return (
                  <motion.div
                    layout
                    key={item.id}
                    className="group relative rounded-2xl border border-white/[0.06] overflow-hidden flex flex-col bg-slate-900 transition-all duration-200 hover:border-brand-500/30 hover:shadow-xl hover:shadow-brand-500/5"
                  >
                    {/* image */}
                    <div className="aspect-[4/3] relative bg-slate-950 overflow-hidden shrink-0">
                      <img
                        src={item.imageUrl || DEFAULT_MENU_IMAGE}
                        alt={item.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                      {/* category badge */}
                      {item.categoryName && (
                        <span className="absolute bottom-2 left-2 text-[8px] font-black uppercase tracking-wider px-2 py-0.5 rounded-md bg-black/60 backdrop-blur-sm text-slate-300 border border-white/10">
                          {item.categoryName}
                        </span>
                      )}
                    </div>
                    {/* info */}
                    <div className="p-3 flex flex-col gap-2 flex-1">
                      <div className="min-w-0">
                        <h3 className="font-bold text-white text-xs truncate leading-snug group-hover:text-brand-300 transition-colors">
                          {item.name}
                        </h3>
                        <p className="text-brand-400 font-black text-xs mt-0.5">
                          Rs.{item.price.toLocaleString()}
                        </p>
                      </div>

                      {/* actions row */}
                      <div className="flex items-center gap-1 pt-2 border-t border-white/[0.06]">
                        <button
                          title="Edit"
                          onClick={() => { setSelectedItem(item); setIsItemModalOpen(true); }}
                          className="p-1.5 rounded-lg text-slate-500 hover:text-brand-400 hover:bg-brand-500/10 transition-all"
                        >
                          <Edit2 size={12} />
                        </button>
                        <button
                          title="Link Stock"
                          onClick={() => { setSelectedItem(item); setIsRecipeModalOpen(true); }}
                          className="p-1.5 rounded-lg text-slate-500 hover:text-emerald-400 hover:bg-emerald-500/10 transition-all"
                        >
                          <Package size={12} />
                        </button>
                        <button
                          title="Options / Variations"
                          onClick={() => { setSelectedItem(item); setIsOptionsModalOpen(true); }}
                          className="flex-1 py-1.5 rounded-lg bg-white/5 text-[9px] font-extrabold uppercase tracking-widest text-slate-400 hover:bg-white/10 hover:text-white transition-all"
                        >
                          Options
                        </button>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>

          ) : (

            /* ── LIST VIEW ── */
            <div className="space-y-1.5">
              {/* list header */}
              <div className="grid grid-cols-[auto_1fr_auto_auto] gap-4 px-4 pb-2">
                <span className="w-11" />
                <span className="text-[9px] font-black text-slate-600 uppercase tracking-widest">Item</span>
                <span className="text-[9px] font-black text-slate-600 uppercase tracking-widest text-right">Price</span>
                <span className="text-[9px] font-black text-slate-600 uppercase tracking-widest">Actions</span>
              </div>

              {items.map(item => {
                return (
                  <div
                    key={item.id}
                    className="flex items-center gap-4 px-4 py-3 rounded-2xl border bg-slate-900/60 border-white/[0.05] hover:border-white/10 hover:bg-slate-900 transition-all duration-200 group"
                  >
                    {/* thumbnail */}
                    <div className="w-11 h-11 rounded-xl bg-slate-800 overflow-hidden shrink-0 border border-white/5">
                      <img
                        src={item.imageUrl || DEFAULT_MENU_IMAGE}
                        alt={item.name}
                        className="w-full h-full object-cover"
                      />
                    </div>

                    {/* name + meta */}
                    <div className="flex-1 min-w-0">
                      <p className="font-bold text-white text-xs truncate group-hover:text-brand-300 transition-colors">
                        {item.name}
                      </p>
                      {item.categoryName && (
                        <p className="text-[9px] text-slate-500 font-bold mt-0.5 uppercase tracking-wider truncate">
                          {item.categoryName}
                        </p>
                      )}
                    </div>

                    {/* price */}
                    <p className="text-brand-400 font-black text-xs shrink-0">
                      Rs.{item.price.toLocaleString()}
                    </p>

                    {/* actions */}
                    <div className="flex items-center gap-1 shrink-0">
                      <button
                        title="Edit"
                        onClick={() => { setSelectedItem(item); setIsItemModalOpen(true); }}
                        className="p-2 rounded-xl text-slate-500 hover:text-brand-400 hover:bg-brand-500/10 transition-all"
                      >
                        <Edit2 size={14} />
                      </button>
                      <button
                        title="Link Stock"
                        onClick={() => { setSelectedItem(item); setIsRecipeModalOpen(true); }}
                        className="p-2 rounded-xl text-slate-500 hover:text-emerald-400 hover:bg-emerald-500/10 transition-all"
                      >
                        <Package size={14} />
                      </button>
                      <button
                        title="Variations"
                        onClick={() => { setSelectedItem(item); setIsOptionsModalOpen(true); }}
                        className="px-3 py-1.5 rounded-xl bg-white/5 text-[9px] font-black uppercase tracking-widest text-slate-500 hover:bg-white/10 hover:text-white transition-all"
                      >
                        Options
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* ── Pagination ── */}
          {menuRes?.data && menuRes.data.totalElements > 0 && (
            <div className="pt-4 border-t border-white/[0.05]">
              <Pagination page={page} totalPages={menuRes.data.totalPages} totalElements={menuRes.data.totalElements} pageSize={12} onPageChange={setPage} />
            </div>
          )}
        </main>
      </div>

      {/* ══════════ Modals ══════════ */}

      {/* Create / Edit Item */}
      <CreateMenuItemModal
        isOpen={isItemModalOpen}
        onClose={() => { setIsItemModalOpen(false); setSelectedItem(null); }}
        onSuccess={() => qc.invalidateQueries({ queryKey: ['menu-items'] })}
        categories={categories}
        editingItem={selectedItem}
        onSubmit={async data => {
          if (selectedItem) {
            await updateItem.mutateAsync({ id: selectedItem.id, data });
          } else {
            await createItem.mutateAsync(data);
          }
        }}
      />

      {/* Category Studio */}
      <Modal
        open={isCatModalOpen}
        onClose={() => { setIsCatModalOpen(false); setEditingCat(null); catForm.reset(); }}
        title="Category Studio"
        width="max-w-2xl"

      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-1">

          {/* left: form */}
          <div className={`p-5 rounded-2xl border transition-all duration-300 space-y-4 ${editingCat ? 'bg-brand-500/5 border-brand-500/20' : 'bg-slate-900 border-white/[0.06]'
            }`}>
            <div className="flex items-center justify-between">
              <div className={`flex items-center gap-2 text-xs font-black uppercase tracking-widest ${editingCat ? 'text-brand-400' : 'text-slate-400'}`}>
                {editingCat ? <Edit2 size={14} /> : <PlusCircle size={14} />}
                {editingCat ? 'Edit Category' : 'New Category'}
              </div>
              {editingCat && (
                <button
                  onClick={() => { setEditingCat(null); catForm.reset(); }}
                  className="text-[10px] font-bold text-slate-500 hover:text-white transition-colors flex items-center gap-1"
                >
                  <X size={11} />
                  Cancel
                </button>
              )}
            </div>

            <form
              onSubmit={catForm.handleSubmit(d => {
                if (editingCat) {
                  updateCat.mutate({ id: editingCat.id, data: d });
                } else {
                  createCat.mutate(d);
                }
              })}
              className="space-y-3"
            >
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Name *</label>
                <input
                  {...catForm.register('name', { required: true })}
                  className={inputCls}
                  placeholder="e.g. Signature Mains"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Description</label>
                <textarea
                  {...catForm.register('description')}
                  className={`${inputCls} h-20 resize-none`}
                  placeholder="Brief description…"
                />
              </div>
              <button
                type="submit"
                disabled={createCat.isPending || updateCat.isPending}
                className={`${btnBase} w-full py-3 rounded-xl text-sm ${editingCat
                    ? 'bg-brand-500 text-white shadow-lg shadow-brand-500/20 hover:bg-brand-400'
                    : 'bg-white/5 text-white hover:bg-white/10'
                  } disabled:opacity-50`}
              >
                {createCat.isPending || updateCat.isPending
                  ? 'Saving…'
                  : editingCat ? 'Save Changes' : 'Create Category'}
              </button>
            </form>
          </div>

          {/* right: list */}
          <div className="space-y-3">
            <div className="flex items-center justify-between px-1">
              <span className="text-[9px] font-black text-slate-600 uppercase tracking-[0.18em]">All Categories</span>
              <span className="text-[10px] font-bold text-slate-500 bg-white/5 px-2 py-0.5 rounded-md">{categories.length}</span>
            </div>

            <div className="space-y-1.5 max-h-[380px] overflow-y-auto pr-1 custom-scrollbar">
              {catLoading
                ? Array(4).fill(0).map((_, i) => (
                  <div key={i} className="h-14 rounded-xl bg-white/5 animate-pulse" />
                ))
                : categories.length === 0
                  ? (
                    <div className="flex flex-col items-center justify-center py-16 rounded-2xl border border-dashed border-white/5 text-slate-600">
                      <Layers size={28} strokeWidth={1.5} className="mb-2" />
                      <p className="text-[11px] font-bold uppercase tracking-tighter">No categories yet</p>
                    </div>
                  )
                  : categories.map(cat => (
                    <div
                      key={cat.id}
                      className={`group flex items-center gap-3 p-3.5 rounded-xl border transition-all ${editingCat?.id === cat.id
                          ? 'bg-brand-500/10 border-brand-500/25'
                          : 'bg-white/[0.02] border-white/[0.04] hover:bg-white/[0.04] hover:border-white/10'
                        }`}
                    >
                      <div className={`w-1 h-8 rounded-full shrink-0 ${editingCat?.id === cat.id ? 'bg-brand-500' : 'bg-slate-800'}`} />
                      <div className="flex-1 min-w-0">
                        <p className={`font-bold text-sm truncate transition-colors ${editingCat?.id === cat.id ? 'text-brand-300' : 'text-white'}`}>
                          {cat.name}
                        </p>
                        <p className="text-[10px] text-slate-500 truncate mt-0.5">
                          {cat.description || 'No description'}
                        </p>
                      </div>
                      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                        <button
                          onClick={() => { setEditingCat(cat); catForm.reset(cat); }}
                          className="p-1.5 rounded-lg text-slate-500 hover:text-brand-400 hover:bg-brand-500/10 transition-all"
                        >
                          <Edit2 size={13} />
                        </button>
                        <button
                          onClick={() =>
                            setConfirmConfig({
                              open: true,
                              title: 'Delete Category',
                              message: `Delete "${cat.name}"? Items in this category may be affected.`,
                              isLoading: false,
                              onConfirm: async () => {
                                setConfirmConfig(prev => ({ ...prev, isLoading: true }));
                                try {
                                  await deleteCat.mutateAsync(cat.id);
                                } finally {
                                  setConfirmConfig(prev => ({ ...prev, open: false, isLoading: false }));
                                }
                              },
                            })
                          }
                          className="p-1.5 rounded-lg text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 transition-all"
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>
                    </div>
                  ))}
            </div>
          </div>
        </div>
      </Modal>

      {/* Recipe Editor */}
      {selectedItem && (
        <RecipeEditorModal
          isOpen={isRecipeModalOpen}
          onClose={() => setIsRecipeModalOpen(false)}
          item={selectedItem}
        />
      )}

      {/* Options / Variations */}
      {selectedItem && (
        <MenuOptionsModal
          isOpen={isOptionsModalOpen}
          onClose={() => setIsOptionsModalOpen(false)}
          item={selectedItem}
        />
      )}

      {/* Confirm */}
      <ConfirmModal
        isOpen={confirmConfig.open}
        onClose={() => setConfirmConfig(prev => ({ ...prev, open: false }))}
        onConfirm={confirmConfig.onConfirm}
        title={confirmConfig.title}
        message={confirmConfig.message}
        isLoading={confirmConfig.isLoading}
      />
    </div>
  );
}