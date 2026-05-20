import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ShoppingBag, Search, Plus, Minus, Trash2, Loader2, Info, LayoutGrid, ChevronRight, Check, Utensils, Users, MapPin
} from 'lucide-react';
import { orderService } from '../services/orderService';
import { tableService } from '../services/tableService';
import { menuService } from '../services/menuService';
import type { CreateOrderRequest, MenuItemResponse, MenuOptionResponse } from '../types';
import { toast } from 'sonner';
import { DEFAULT_MENU_IMAGE } from '../lib/utils';
import Modal from '../components/ui/Modal';

interface CartItem {
  id: string;
  menuItemId: string;
  name: string;
  price: number;
  quantity: number;
  menuOptionIds: string[];
}

import { useSearchParams } from 'react-router-dom';

export default function TakeOrderPage() {
  const qc = useQueryClient();
  const [searchParams, setSearchParams] = useSearchParams();
  const search = searchParams.get('q') || '';
  const editOrderId = searchParams.get('edit');
  
  const [cart, setCart] = useState<CartItem[]>([]);
  const [categoryFilter, setCategoryFilter] = useState('ALL');
  const [isTableModalOpen, setIsTableModalOpen] = useState(false);
  const [tableSearch, setTableSearch] = useState('');

  // Menu Option Selector State
  const [isOptionsModalOpen, setIsOptionsModalOpen] = useState(false);
  const [optionsItem, setOptionsItem] = useState<MenuItemResponse | null>(null);
  const [availableOptions, setAvailableOptions] = useState<MenuOptionResponse[]>([]);
  const [selectedOptionIds, setSelectedOptionIds] = useState<string[]>([]);
  const [loadingItemId, setLoadingItemId] = useState<string | null>(null);

  const { data: tablesData, isLoading: isLoadingTables } = useQuery({
    queryKey: ['tables-all'],
    queryFn: () => tableService.getTables(undefined, 'AVAILABLE', 0, 100),
  });

  const { data: catRes, isLoading: catLoading } = useQuery({
    queryKey: ['menu-categories'],
    queryFn: menuService.getCategories,
  });

  const { data: menuRes, isLoading: menuLoading } = useQuery({
    queryKey: ['menu-items', search, categoryFilter],
    queryFn: () => menuService.getMenuItems(search, categoryFilter, 0, 200),
  });

  const { data: editOrderData } = useQuery({
    queryKey: ['order', editOrderId],
    queryFn: () => orderService.getById(editOrderId!),
    enabled: !!editOrderId,
  });

  const { register, handleSubmit, reset, watch, setValue, formState: { errors } } = useForm<{ tableId: string }>();
  const watchTableId = watch('tableId');

  // Pre-fill logic for edit mode
  useEffect(() => {
    if (editOrderData?.data) {
      const order = editOrderData.data;
      if (order.tableId) setValue('tableId', order.tableId);
      setCart(order.items.map(item => ({
        id: item.menuItemId, 
        menuItemId: item.menuItemId,
        name: item.name,
        price: item.price,
        quantity: item.quantity,
        menuOptionIds: item.options?.map(o => o.id) || []
      })));
    }
  }, [editOrderData, setValue]);

  const mutation = useMutation({
    mutationFn: (data: CreateOrderRequest) => 
      editOrderId 
        ? orderService.update(editOrderId, data) 
        : orderService.create(data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['orders'] });
      qc.invalidateQueries({ queryKey: ['tables-all'] });
      toast.success(editOrderId ? 'Order updated successfully!' : 'Order placed successfully!');
      setCart([]);
      reset();
      if (editOrderId) {
        searchParams.delete('edit');
        setSearchParams(searchParams);
      }
    },
    onError: () => toast.error(editOrderId ? 'Failed to update order' : 'Failed to create order'),
  });

  const tables = tablesData?.data?.content ?? [];
  const filteredTables = tables.filter(t => 
    t.name.toLowerCase().includes(tableSearch.toLowerCase()) || 
    t.location.toLowerCase().includes(tableSearch.toLowerCase())
  );
  const categories = catRes?.data ?? [];
  const menuItems = menuRes?.data?.content ?? [];

  const subtotal = cart.reduce((acc, item) => acc + item.price * item.quantity, 0);

  const addCartItemDirectly = (menuItem: MenuItemResponse, optionIds: string[], selectedOptionsList: MenuOptionResponse[] = []) => {
    // Generate unique ID for this cart row
    const sortedIds = [...optionIds].sort();
    const cartRowId = menuItem.id + (sortedIds.length > 0 ? '_' + sortedIds.join('_') : '');

    // Calculate item base price + option adjustments
    const optionsPriceAdj = selectedOptionsList.reduce((acc, opt) => acc + opt.priceAdjustment, 0);
    const finalPrice = menuItem.price + optionsPriceAdj;

    setCart(prev => {
      const existing = prev.find(item => item.id === cartRowId);
      if (existing) {
        return prev.map(item =>
          item.id === cartRowId
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }

      // Generate printable/viewable name with options listed, e.g. "Veg Burger (Extra Cheese, Spicy)"
      const optionsNames = selectedOptionsList.map(opt => opt.name).join(', ');
      const displayName = menuItem.name + (optionsNames ? ` (${optionsNames})` : '');

      return [...prev, {
        id: cartRowId,
        menuItemId: menuItem.id,
        name: displayName,
        price: finalPrice,
        quantity: 1,
        menuOptionIds: sortedIds
      }];
    });
  };

  const handleItemClick = async (menuItem: MenuItemResponse) => {
    setLoadingItemId(menuItem.id);
    try {
      const res = await menuService.getOptions(menuItem.id);
      if (res.success && res.data && res.data.length > 0) {
        // Item has options! Open selector modal
        setOptionsItem(menuItem);
        setAvailableOptions(res.data.filter(opt => opt.isAvailable));
        setSelectedOptionIds([]);
        setIsOptionsModalOpen(true);
      } else {
        // Directly add without options
        addCartItemDirectly(menuItem, []);
      }
    } catch (err) {
      console.error(err);
      // Fallback: directly add
      addCartItemDirectly(menuItem, []);
    } finally {
      setLoadingItemId(null);
    }
  };

  const handleConfirmOptions = () => {
    if (!optionsItem) return;
    const selectedOptionsList = availableOptions.filter(opt => selectedOptionIds.includes(opt.id));
    addCartItemDirectly(optionsItem, selectedOptionIds, selectedOptionsList);
    setIsOptionsModalOpen(false);
    setOptionsItem(null);
    setAvailableOptions([]);
    setSelectedOptionIds([]);
  };

  const updateQuantity = (id: string, delta: number) => {
    setCart(prev => prev.map(item => {
      if (item.id === id) {
        const newQuantity = item.quantity + delta;
        return { ...item, quantity: newQuantity > 0 ? newQuantity : 1 };
      }
      return item;
    }));
  };

  const removeFromCart = (id: string) => {
    setCart(prev => prev.filter(item => item.id !== id));
  };

  const onSubmit = (data: { tableId: string }) => {
    if (cart.length === 0) {
      toast.error('Please add at least one item to the order');
      return;
    }

    const request: CreateOrderRequest = {
      tableId: data.tableId,
      items: cart.map(item => ({
        menuItemId: item.menuItemId,
        quantity: item.quantity,
        menuOptionIds: item.menuOptionIds
      }))
    };

    mutation.mutate(request);
  };

  return (
    <div className="flex flex-col h-[calc(100vh-10rem)]">
      
      {/* ── Top Bar ── */}
      <div className="flex items-center justify-between mb-6 shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-brand-500/10 border border-brand-500/20 flex items-center justify-center text-brand-400">
            <ShoppingBag size={20} />
          </div>
          <div>
            <h1 className="text-xl font-bold text-white">{editOrderId ? 'Update Order' : 'Point of Sale'}</h1>
            <p className="text-xs text-slate-500 mt-1 uppercase font-bold tracking-widest">
              {editOrderId ? `Editing Order #${editOrderId.split('-')[0]}` : 'Active Session'}
            </p>
          </div>
        </div>
        {editOrderId && (
          <button 
            onClick={() => {
              searchParams.delete('edit');
              setSearchParams(searchParams);
              setCart([]);
              reset();
            }}
            className="px-4 py-2 bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white rounded-xl text-xs font-bold transition-all border border-white/5"
          >
            Cancel Edit
          </button>
        )}
      </div>

      {/* ── Body ── */}
      <div className="flex flex-1 overflow-hidden">

        {/* ── Sidebar (Categories) ── */}
        <aside className="hidden lg:flex flex-col w-56 shrink-0 border-r border-white/[0.05] bg-slate-950 overflow-y-auto py-5 px-3 custom-scrollbar">
          <button
            onClick={() => setCategoryFilter('ALL')}
            className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-xs font-bold transition-all mb-1 ${categoryFilter === 'ALL'
                ? 'bg-brand-500 text-white shadow-lg shadow-brand-500/20'
                : 'text-slate-400 hover:text-white hover:bg-white/5'
              }`}
          >
            <LayoutGrid size={14} />
            <span>All Items</span>
          </button>

          <div className="mt-4 mb-2 px-3">
            <span className="text-[9px] font-black text-slate-600 uppercase tracking-[0.18em]">Categories</span>
          </div>

          <div className="space-y-0.5 flex-1">
            {catLoading ? (
              Array(5).fill(0).map((_, i) => <div key={i} className="h-9 rounded-xl bg-white/5 animate-pulse" />)
            ) : (
              categories.map(c => (
                <button
                  key={c.id}
                  onClick={() => setCategoryFilter(c.id)}
                  className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-xs font-bold transition-all ${categoryFilter === c.id
                      ? 'bg-brand-500/10 text-brand-400 border border-brand-500/20'
                      : 'text-slate-500 hover:text-white hover:bg-white/5 border border-transparent'
                    }`}
                >
                  <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${categoryFilter === c.id ? 'bg-brand-400' : 'bg-slate-700'}`} />
                  <span className="truncate">{c.name}</span>
                  <ChevronRight size={10} className={`ml-auto shrink-0 ${categoryFilter === c.id ? 'text-brand-500' : 'text-slate-700'}`} />
                </button>
              ))
            )}
          </div>
        </aside>

        {/* ── Main (Menu Items) ── */}
        <main className="flex-1 min-w-0 p-6 space-y-5 overflow-y-auto custom-scrollbar bg-slate-950/50">
          {/* Search already in Global Header */}

          {menuLoading ? (
            <div className="flex flex-col items-center justify-center py-20 text-slate-500">
              <Loader2 className="animate-spin mb-4" size={40} />
              <p className="text-sm">Loading menu...</p>
            </div>
          ) : menuItems.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-slate-500 border border-dashed border-white/5 rounded-2xl">
              <Utensils size={32} className="mb-3 opacity-50" />
              <p className="text-sm font-semibold">No items found</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4 pb-6">
              {menuItems.map(item => {
                const quantityInCart = cart.find(c => c.menuItemId === item.id)?.quantity || 0;
                return (
                  <div
                    key={item.id}
                    onClick={() => handleItemClick(item)}
                    className="group relative flex flex-col bg-slate-900 border border-white/[0.06] rounded-2xl overflow-hidden cursor-pointer hover:border-brand-500/50 hover:shadow-[0_0_20px_rgba(99,102,241,0.15)] transition-all"
                  >
                    <div className="relative aspect-[4/3] w-full overflow-hidden bg-slate-800">
                      <img
                        src={item.imageUrl || DEFAULT_MENU_IMAGE}
                        alt={item.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        onError={(e) => { (e.target as HTMLImageElement).src = DEFAULT_MENU_IMAGE; }}
                      />
                       {loadingItemId === item.id && (
                        <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-[2px] flex items-center justify-center">
                          <Loader2 className="animate-spin text-brand-400" size={24} />
                        </div>
                      )}
                      {quantityInCart > 0 && (
                        <div className="absolute inset-0 bg-brand-500/20 backdrop-blur-[2px] flex items-center justify-center transition-all">
                          <div className="w-10 h-10 rounded-full bg-brand-500 text-white flex items-center justify-center shadow-xl">
                            <span className="font-bold text-sm">x{quantityInCart}</span>
                          </div>
                        </div>
                      )}
                      {!quantityInCart && (
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                          <div className="w-8 h-8 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center text-white">
                            <Plus size={16} />
                          </div>
                        </div>
                      )}
                    </div>
                    <div className="p-4 flex flex-col flex-1">
                      <div className="flex items-start justify-between gap-2 mb-1">
                        <h3 className="text-sm font-bold text-white leading-tight line-clamp-2">{item.name}</h3>
                      </div>
                      <p className="text-[10px] text-slate-400 uppercase tracking-wider mb-3">{item.categoryName}</p>
                      <div className="mt-auto flex items-center justify-between">
                        <span className="text-sm font-black text-emerald-400">NPR {item.price.toFixed(2)}</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </main>

        {/* ── Right Sidebar (Cart) ── */}
        <aside className="w-full md:w-[340px] shrink-0 border-l border-white/[0.05] bg-slate-950 flex flex-col z-10">
          <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col h-full">
            <div className="p-5 border-b border-white/[0.05]">
              <h2 className="text-sm font-bold text-white flex items-center gap-2 mb-3">
                <LayoutGrid size={16} className="text-brand-400" />
                Table & Details
              </h2>
              {isLoadingTables ? (
                <div className="h-10 bg-white/5 rounded-xl animate-pulse" />
              ) : tables.length === 0 ? (
                <div className="flex items-start gap-2 p-3 bg-amber-500/10 border border-amber-500/20 rounded-xl text-amber-500">
                  <Info size={14} className="shrink-0 mt-0.5" />
                  <p className="text-[10px] font-semibold leading-relaxed">No tables available. Please free up a table.</p>
                </div>
              ) : (
                <>
                  <input type="hidden" {...register('tableId', { required: 'Please select a table' })} />
                  <button
                    type="button"
                    onClick={() => setIsTableModalOpen(true)}
                    className={`w-full h-12 rounded-xl border flex items-center justify-between px-4 transition-all ${
                      watchTableId
                        ? 'bg-brand-500/10 border-brand-500/30 text-white shadow-[0_0_15px_rgba(99,102,241,0.1)]'
                        : 'bg-slate-900 border-white/[0.06] text-slate-400 hover:bg-slate-800'
                    }`}
                  >
                    {watchTableId ? (
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-brand-400 shrink-0" />
                        <span className="font-bold">{tables.find(t => t.id === watchTableId)?.name}</span>
                        <span className="text-[10px] text-slate-500 ml-1">
                          ({tables.find(t => t.id === watchTableId)?.location})
                        </span>
                      </div>
                    ) : (
                      <span className="text-sm font-semibold">Tap to select table...</span>
                    )}
                    <ChevronRight size={16} className={watchTableId ? 'text-brand-400' : 'text-slate-500'} />
                  </button>
                  {errors.tableId && <p className="text-[10px] text-red-400 mt-1.5 ml-1">{errors.tableId.message}</p>}
                </>
              )}
            </div>

            <div className="flex-1 overflow-y-auto custom-scrollbar p-5 space-y-3">
              {cart.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-slate-600 space-y-3">
                  <ShoppingBag size={32} strokeWidth={1} />
                  <p className="text-xs font-medium uppercase tracking-widest">Cart is empty</p>
                </div>
              ) : (
                <AnimatePresence>
                  {cart.map(item => (
                    <motion.div
                      key={item.id}
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20, scale: 0.95 }}
                      className="bg-slate-900 border border-white/[0.06] rounded-xl p-3 flex flex-col gap-2"
                    >
                      <div className="flex justify-between items-start">
                        <span className="text-xs font-bold text-white pr-2 leading-tight">{item.name}</span>
                        <span className="text-xs font-black text-emerald-400 shrink-0">NPR {(item.price * item.quantity).toFixed(2)}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1 bg-slate-950 border border-white/[0.05] rounded-lg p-0.5">
                          <button
                            type="button"
                            onClick={() => updateQuantity(item.id, -1)}
                            className="w-6 h-6 rounded-md flex items-center justify-center text-slate-400 hover:bg-slate-800 hover:text-white transition-colors"
                          >
                            <Minus size={12} />
                          </button>
                          <span className="text-[10px] font-black w-5 text-center text-white">{item.quantity}</span>
                          <button
                            type="button"
                            onClick={() => updateQuantity(item.id, 1)}
                            className="w-6 h-6 rounded-md flex items-center justify-center text-slate-400 hover:bg-slate-800 hover:text-white transition-colors"
                          >
                            <Plus size={12} />
                          </button>
                        </div>
                        <button
                          type="button"
                          onClick={() => removeFromCart(item.id)}
                          className="p-1.5 text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition-colors"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
              )}
            </div>

            <div className="p-5 border-t border-white/[0.05] bg-slate-950 shrink-0">
              <div className="flex items-center justify-between mb-4">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Subtotal</span>
                <span className="text-xl font-black text-white">NPR {subtotal.toFixed(2)}</span>
              </div>
              <button
                type="submit"
                disabled={mutation.isPending || cart.length === 0}
                className={`w-full py-3.5 rounded-xl text-sm font-bold flex items-center justify-center gap-2 transition-all ${
                  mutation.isPending || cart.length === 0
                  ? 'bg-slate-900 text-slate-500 border border-white/[0.05] cursor-not-allowed'
                  : 'bg-brand-500 text-white shadow-lg shadow-brand-500/25 hover:bg-brand-400 hover:shadow-brand-500/40'
                }`}
              >
                {mutation.isPending ? (
                  <>
                    <Loader2 size={18} className="animate-spin" />
                    Processing...
                  </>
                ) : (
                  <>
                    <Check size={18} />
                    {editOrderId ? 'Update Order' : 'Place Order'}
                  </>
                )}
              </button>
            </div>
          </form>
        </aside>

      </div>
      {/* ── Table Selection Modal ── */}
      <Modal 
        open={isTableModalOpen} 
        onClose={() => {
          setIsTableModalOpen(false);
          setTableSearch('');
        }} 
        title="Select Table for Order" 
        width="max-w-4xl"
      >
        <div className="p-2 space-y-4">
          <div className="relative group">
            <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-brand-400 transition-colors" />
            <input
              type="text"
              placeholder="Search by table name or location..."
              value={tableSearch}
              onChange={(e) => setTableSearch(e.target.value)}
              className="w-full bg-slate-900 border border-white/[0.08] rounded-xl pl-11 pr-4 py-2.5 text-sm text-white focus:outline-none focus:border-brand-500/50 focus:bg-slate-800 transition-all placeholder:text-slate-600"
              autoFocus
            />
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 max-h-[60vh] overflow-y-auto custom-scrollbar pr-1">
            {filteredTables.length === 0 ? (
              <div className="col-span-full py-12 flex flex-col items-center justify-center text-slate-500 border border-dashed border-white/5 rounded-2xl">
                <MapPin size={32} className="mb-2 opacity-20" />
                <p className="text-sm font-medium">No tables match your search</p>
              </div>
            ) : (
              filteredTables.map(table => (
                <button
                  key={table.id}
                  type="button"
                  onClick={() => {
                    setValue('tableId', table.id, { shouldValidate: true });
                    setIsTableModalOpen(false);
                    setTableSearch('');
                  }}
                  className={`flex flex-col items-start p-4 rounded-2xl border transition-all hover:scale-[1.02] text-left ${
                    watchTableId === table.id
                      ? 'bg-brand-500/10 border-brand-500 shadow-[0_0_20px_rgba(99,102,241,0.2)]'
                      : 'bg-slate-900 border-white/[0.06] hover:border-white/20'
                  }`}
                >
                  <div className="flex items-center justify-between w-full mb-3">
                    <span className={`text-base font-black truncate ${watchTableId === table.id ? 'text-brand-400' : 'text-white'}`}>
                      {table.name}
                    </span>
                    {watchTableId === table.id && <Check size={16} className="text-brand-400 shrink-0" />}
                  </div>
                  <div className="flex items-center gap-1.5 text-[10px] text-slate-400 mb-4 uppercase font-bold tracking-wider">
                    <MapPin size={10} className={watchTableId === table.id ? 'text-brand-400' : 'text-slate-500'} />
                    {table.location}
                  </div>
                  <div className="mt-auto pt-3 border-t border-white/5 w-full flex items-center justify-between">
                    <span className="text-[9px] font-black text-slate-600 uppercase tracking-widest">Capacity</span>
                    <div className="flex items-center gap-1 text-[10px] font-black text-white bg-white/5 px-1.5 py-0.5 rounded-md">
                      <Users size={10} className="text-slate-500" />
                      {table.capacity}
                    </div>
                  </div>
                </button>
              ))
            )}
          </div>
        </div>
      </Modal>

      {/* ── Menu Options Selector Modal ── */}
      <Modal
        open={isOptionsModalOpen}
        onClose={() => {
          setIsOptionsModalOpen(false);
          setOptionsItem(null);
          setAvailableOptions([]);
          setSelectedOptionIds([]);
        }}
        title={`Customize ${optionsItem?.name}`}
        width="max-w-md"
      >
        <div className="p-4 space-y-6">
          <div className="flex items-center justify-between border-b border-white/5 pb-4">
            <div>
              <p className="text-[10px] text-slate-500 uppercase tracking-widest font-black">Base Price</p>
              <p className="text-sm font-black text-white">Rs. {optionsItem?.price.toFixed(2)}</p>
            </div>
            <div className="text-right">
              <p className="text-[10px] text-slate-500 uppercase tracking-widest font-black">Calculated Price</p>
              <p className="text-sm font-black text-brand-400">
                Rs. {(
                  (optionsItem?.price || 0) + 
                  availableOptions
                    .filter(opt => selectedOptionIds.includes(opt.id))
                    .reduce((acc, opt) => acc + opt.priceAdjustment, 0)
                ).toFixed(2)}
              </p>
            </div>
          </div>

          <div className="space-y-3">
            <p className="text-[10px] text-slate-400 uppercase tracking-wider font-black mb-2">Available Modifiers</p>
            <div className="space-y-2 max-h-[40vh] overflow-y-auto pr-1 custom-scrollbar">
              {availableOptions.map(opt => {
                const isSelected = selectedOptionIds.includes(opt.id);
                return (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => {
                      setSelectedOptionIds(prev =>
                        prev.includes(opt.id)
                          ? prev.filter(id => id !== opt.id)
                          : [...prev, opt.id]
                      );
                    }}
                    className={`w-full flex items-center justify-between p-3.5 rounded-xl border text-left transition-all ${
                      isSelected
                        ? 'bg-brand-500/10 border-brand-500 text-white shadow-[0_0_15px_rgba(99,102,241,0.1)]'
                        : 'bg-slate-900 border-white/5 text-slate-400 hover:border-white/10 hover:bg-slate-900/60'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-4 h-4 rounded border flex items-center justify-center transition-all ${
                        isSelected ? 'bg-brand-500 border-brand-500 text-white' : 'border-white/20'
                      }`}>
                        {isSelected && <Check size={10} strokeWidth={3} />}
                      </div>
                      <span className="text-xs font-bold uppercase">{opt.name}</span>
                    </div>
                    <span className={`text-xs font-black ${isSelected ? 'text-brand-400' : 'text-slate-500'}`}>
                      +Rs. {opt.priceAdjustment.toFixed(2)}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="flex gap-3 pt-4 border-t border-white/5">
            <button
              type="button"
              onClick={() => {
                setIsOptionsModalOpen(false);
                setOptionsItem(null);
                setAvailableOptions([]);
                setSelectedOptionIds([]);
              }}
              className="flex-1 py-3 bg-slate-900 border border-white/5 text-slate-400 hover:text-white rounded-xl text-xs font-bold uppercase transition-all"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleConfirmOptions}
              className="flex-[2] py-3 bg-brand-500 hover:bg-brand-400 text-white rounded-xl text-xs font-black uppercase transition-all flex items-center justify-center gap-1.5 shadow-lg shadow-brand-500/20"
            >
              <Plus size={14} />
              Confirm Add
            </button>
          </div>
        </div>
      </Modal>

    </div>
  );
}
