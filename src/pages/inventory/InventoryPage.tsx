import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Package, Plus, Search, Filter, AlertTriangle,
  ArrowUpRight, Edit2, Sliders, Trash2
} from 'lucide-react';
import { inventoryService } from '../../services/inventoryService';
import { 
  type StockItemResponse, 
  type InventorySummaryResponse, 
  type InventoryCategoryResponse 
} from '../../types/inventory';
import StockAdjustModal from '../../components/inventory/StockAdjustModal';
import CreateStockItemModal from '../../components/inventory/CreateStockItemModal';
import EditStockItemModal from '../../components/inventory/EditStockItemModal';
import PackagingUnitsModal from '../../components/inventory/PackagingUnitsModal';
import Pagination from '../../components/ui/Pagination';

import { useSearchParams } from 'react-router-dom';

export default function InventoryPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const search = searchParams.get('q') || '';
  const categoryFilter = searchParams.get('category') || 'ALL';
  
  const [items, setItems] = useState<StockItemResponse[]>([]);
  const [categories, setCategories] = useState<InventoryCategoryResponse[]>([]);
  const [summary, setSummary] = useState<InventorySummaryResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const page = parseInt(searchParams.get('page') || '0', 10);
  const setPage = (p: number) => {
    searchParams.set('page', p.toString());
    setSearchParams(searchParams);
  };
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);

  // Modals State
  const [selectedItem, setSelectedItem] = useState<StockItemResponse | null>(null);
  const [isAdjustModalOpen, setIsAdjustModalOpen] = useState(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isPackageModalOpen, setIsPackageModalOpen] = useState(false);

  useEffect(() => {
    fetchCategories();
  }, []);

  useEffect(() => {
    fetchItems();
  }, [search, categoryFilter, page]);

  const fetchCategories = async () => {
    try {
      const res = await inventoryService.getAllCategories();
      if (res.success && res.data) {
        setCategories(res.data.content);
      }
    } catch (err) {
      console.error('Failed to fetch categories', err);
    }
  };

  const fetchItems = async () => {
    try {
      const [itemsRes, summaryRes] = await Promise.all([
        inventoryService.getAllStockItems(search, categoryFilter, page),
        inventoryService.getInventorySummary()
      ]);
      if (itemsRes.success && itemsRes.data) {
        setItems(itemsRes.data.content);
        setTotalPages(itemsRes.data.totalPages);
        setTotalElements(itemsRes.data.totalElements);
      }
      if (summaryRes.success) setSummary(summaryRes.data);
    } catch (err) {
      console.error('Failed to fetch inventory', err);
    } finally {
      setLoading(false);
    }
  };

  const filteredItems = items;

  return (
    <div className="space-y-6">
      {/* Header Row - Simplified to just Actions */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-white flex items-center gap-2">
            <Package size={20} className="text-brand-400" />
            Inventory Catalog
          </h1>
          <p className="text-slate-500 text-xs mt-1">Manage and track stock levels.</p>
        </div>
        <button 
          className="btn-primary"
          onClick={() => setIsCreateModalOpen(true)}
        >
          <Plus size={16} />
          Add Item
        </button>
      </div>

      {/* Stats Quick View */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="glass-card p-4 flex items-center gap-4">
          <div className="w-10 h-10 rounded-xl bg-brand-500/10 flex items-center justify-center text-brand-400">
            <Package size={20} />
          </div>
          <div>
            <p className="text-[10px] text-slate-500 uppercase font-bold tracking-wider">Total Items</p>
            <p className="text-xl font-bold text-white">{summary?.totalItems ?? items.length}</p>
          </div>
        </div>
        <div className="glass-card p-4 flex items-center gap-4 border-amber-500/10">
          <div className="w-10 h-10 rounded-xl bg-amber-500/10 flex items-center justify-center text-amber-500">
            <AlertTriangle size={20} />
          </div>
          <div>
            <p className="text-[10px] text-slate-500 uppercase font-bold tracking-wider">Low Stock</p>
            <p className="text-xl font-bold text-amber-500">{summary?.lowStockItems ?? items.filter(i => i.lowStock).length}</p>
          </div>
        </div>
        <div className="glass-card p-4 flex items-center gap-4 border-rose-500/10">
          <div className="w-10 h-10 rounded-xl bg-rose-500/10 flex items-center justify-center text-rose-500">
            <Trash2 size={20} />
          </div>
          <div>
            <p className="text-[10px] text-slate-500 uppercase font-bold tracking-wider">Out of Stock</p>
            <p className="text-xl font-bold text-rose-500">{summary?.outOfStockItems ?? 0}</p>
          </div>
        </div>
        <div className="glass-card p-4 flex items-center gap-4 border-emerald-500/10">
          <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-500">
            <ArrowUpRight size={20} />
          </div>
          <div>
            <p className="text-[10px] text-slate-500 uppercase font-bold tracking-wider">Healthy Stock</p>
            <p className="text-xl font-bold text-emerald-500">{summary?.healthyStockItems ?? items.filter(i => !i.lowStock).length}</p>
          </div>
        </div>
      </div>

      {/* Search & Filter Controls */}
      <div className="flex flex-col sm:flex-row gap-4 items-center justify-between bg-white/[0.02] border border-white/5 rounded-2xl p-4">
        {/* Search Input */}
        <div className="relative w-full sm:w-72">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={16} />
          <input
            type="text"
            placeholder="Search stock items..."
            value={search}
            onChange={(e) => {
              const val = e.target.value;
              if (val) {
                searchParams.set('q', val);
              } else {
                searchParams.delete('q');
              }
              searchParams.delete('page');
              setSearchParams(searchParams);
            }}
            className="w-full bg-slate-800/50 border border-white/10 rounded-xl pl-9 pr-4 py-2 text-xs text-white focus:outline-none focus:ring-2 focus:ring-brand-500/50 placeholder:text-slate-500 transition-all"
          />
        </div>

        {/* Category Select Dropdown */}
        <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
          <Filter size={14} className="text-slate-500" />
          <select
            value={categoryFilter}
            onChange={(e) => {
              const val = e.target.value;
              if (val === 'ALL') {
                searchParams.delete('category');
              } else {
                searchParams.set('category', val);
              }
              searchParams.delete('page');
              setSearchParams(searchParams);
            }}
            className="bg-slate-800/50 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:ring-2 focus:ring-brand-500/50 cursor-pointer min-w-[150px] transition-all"
          >
            <option value="ALL">All Categories</option>
            {categories.map((cat) => (
              <option key={cat.id} value={cat.id}>
                {cat.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Items Table */}
      <div className="glass-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-white/5 bg-white/[0.02]">
                <th className="px-6 py-3 text-[10px] font-bold text-slate-400 uppercase tracking-wider">Item Name</th>
                <th className="px-6 py-3 text-[10px] font-bold text-slate-400 uppercase tracking-wider">Category</th>
                <th className="px-6 py-3 text-[10px] font-bold text-slate-400 uppercase tracking-wider">Current Stock</th>
                <th className="px-6 py-3 text-[10px] font-bold text-slate-400 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-[10px] font-bold text-slate-400 uppercase tracking-wider text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {loading ? (
                Array(5).fill(0).map((_, i) => (
                  <tr key={i} className="animate-pulse">
                    <td colSpan={5} className="px-6 py-4"><div className="h-10 bg-white/5 rounded-lg" /></td>
                  </tr>
                ))
              ) : filteredItems.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-slate-500">
                    No items found matching your criteria.
                  </td>
                </tr>
              ) : filteredItems.map((item) => (
                <motion.tr
                  key={item.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="hover:bg-white/[0.02] transition-colors group"
                >
                  <td className="px-6 py-2.5">
                    <div className="text-xs font-semibold text-white">{item.name}</div>
                    <div className="text-[9px] text-slate-500">Base Unit: {item.baseUnit.name} ({item.baseUnit.symbol})</div>
                  </td>
                  <td className="px-6 py-2.5">
                    <span className="px-2 py-0.5 rounded-md bg-white/5 text-[9px] font-bold text-slate-400 uppercase tracking-tight border border-white/5">
                      {item.categoryName}
                    </span>
                  </td>
                  <td className="px-6 py-2.5">
                    <div className="flex items-center gap-2">
                      <span className={`text-base font-bold ${item.lowStock ? 'text-amber-500' : 'text-emerald-400'}`}>
                        {item.currentStock}
                      </span>
                      <span className="text-[10px] text-slate-500">{item.baseUnit.symbol}</span>
                    </div>
                    <div className="text-[9px] text-slate-600">Min: {item.minimumStock} {item.baseUnit.symbol}</div>
                  </td>
                  <td className="px-6 py-2.5">
                    {item.lowStock ? (
                      <span className="flex items-center gap-1.5 text-amber-500 text-[10px] font-bold">
                        <AlertTriangle size={12} />
                        Low Stock
                      </span>
                    ) : (
                      <span className="flex items-center gap-1.5 text-emerald-500 text-[10px] font-bold">
                        <Package size={12} />
                        In Stock
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-2.5 text-right">
                    <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          className="p-2 hover:bg-brand-500/10 text-brand-400 rounded-lg transition-colors"
                          title="Adjust Stock"
                          onClick={() => {
                            setSelectedItem(item);
                            setIsAdjustModalOpen(true);
                          }}
                        >
                          <Sliders size={16} />
                        </button>
                        <button
                          className="p-2 hover:bg-brand-500/10 text-brand-400 rounded-lg transition-colors"
                          title="Manage Packaging"
                          onClick={() => {
                            setSelectedItem(item);
                            setIsPackageModalOpen(true);
                          }}
                        >
                          <Package size={16} />
                        </button>
                        <button 
                          className="p-2 hover:bg-white/10 text-slate-400 rounded-lg transition-colors"
                          title="Registry Settings"
                          onClick={() => {
                            setSelectedItem(item);
                            setIsEditModalOpen(true);
                          }}
                        >
                          <Edit2 size={16} />
                        </button>
                     </div>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
        {/* Pagination Footer */}
        {totalElements > 0 && (
          <div className="px-6 py-4 border-t border-white/5 bg-white/[0.01]">
            <Pagination page={page} totalPages={totalPages} totalElements={totalElements} pageSize={20} onPageChange={setPage} />
          </div>
        )}
      </div>

      {/* Modals */}
      {selectedItem && (
        <StockAdjustModal
          item={selectedItem}
          isOpen={isAdjustModalOpen}
          onClose={() => setIsAdjustModalOpen(false)}
          onSuccess={fetchItems}
        />
      )}

      <CreateStockItemModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSuccess={fetchItems}
      />

      {selectedItem && (
        <>
          <EditStockItemModal
            item={selectedItem}
            isOpen={isEditModalOpen}
            onClose={() => setIsEditModalOpen(false)}
            onSuccess={fetchItems}
          />
          <PackagingUnitsModal
            item={selectedItem}
            isOpen={isPackageModalOpen}
            onClose={() => setIsPackageModalOpen(false)}
          />
        </>
      )}
    </div>
  );
}
