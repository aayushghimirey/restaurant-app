import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { motion, AnimatePresence } from 'framer-motion';
import { Receipt, ArrowLeft, Loader2, Info, Plus, Minus, Trash2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { orderService } from '../services/orderService';
import { tableService } from '../services/tableService';
import { menuService } from '../services/menuService';
import type { CreateOrderRequest, MenuItemResponse } from '../types';
import { toast } from 'sonner';

interface CartItem {
  id: string; // unique id for the cart row (could just be menuItemId if we don't support multiple of the same item with different options)
  menuItemId: string;
  name: string;
  price: number;
  quantity: number;
  menuOptionIds: string[];
}

export default function CreateOrderPage() {
  const navigate = useNavigate();
  const qc = useQueryClient();

  const [cart, setCart] = useState<CartItem[]>([]);

  const { data: tablesData, isLoading: isLoadingTables } = useQuery({
    queryKey: ['tables-all'],
    queryFn: () => tableService.getTables(undefined, 'AVAILABLE', 0, 100),
  });

  const { data: menuData, isLoading: isLoadingMenu } = useQuery({
    queryKey: ['menu-all'],
    queryFn: () => menuService.getMenuItems(undefined, undefined, 0, 100),
  });

  const { register, handleSubmit, formState: { errors } } = useForm<{ tableId: string }>();

  const create = useMutation({
    mutationFn: (data: CreateOrderRequest) => orderService.create(data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['orders'] });
      toast.success('Order created');
      navigate('/orders');
    },
    onError: () => toast.error('Failed to create order'),
  });

  const tables = tablesData?.data?.content ?? [];
  const menuItems = menuData?.data?.content ?? [];

  const subtotal = cart.reduce((acc, item) => acc + item.price * item.quantity, 0);

  const addToCart = (menuItem: MenuItemResponse) => {
    setCart(prev => {
      const existing = prev.find(item => item.menuItemId === menuItem.id);
      if (existing) {
        return prev.map(item => 
          item.menuItemId === menuItem.id 
          ? { ...item, quantity: item.quantity + 1 } 
          : item
        );
      }
      return [...prev, {
        id: menuItem.id,
        menuItemId: menuItem.id,
        name: menuItem.name,
        price: menuItem.price,
        quantity: 1,
        menuOptionIds: []
      }];
    });
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
    
    create.mutate(request);
  };

  if (isLoadingTables || isLoadingMenu) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-slate-500">
        <Loader2 className="animate-spin mb-4" size={40} />
        <p>Loading menu and tables...</p>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      <motion.div initial={{ opacity: 0, y: -12 }} animate={{ opacity: 1, y: 0 }} className="flex items-center gap-4">
        <button 
          onClick={() => navigate('/orders')} 
          className="p-2 hover:bg-white/5 rounded-xl text-slate-400 hover:text-white transition-colors"
        >
          <ArrowLeft size={20} />
        </button>
        <div>
          <div className="flex items-center gap-2 mb-0.5">
            <Receipt size={24} className="text-brand-400" />
            <h1 className="text-2xl font-bold text-white">Create New Order</h1>
          </div>
          <p className="text-sm text-slate-500">Select items and assign a table to create an order.</p>
        </div>
      </motion.div>

      <form onSubmit={handleSubmit(onSubmit)} className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }} className="glass p-6">
            <h2 className="text-lg font-bold text-white mb-4 border-b border-white/5 pb-4">Table Selection</h2>
            {tables.length === 0 ? (
              <div className="flex items-center gap-2 text-amber-500 bg-amber-500/10 border border-amber-500/20 p-4 rounded-xl">
                <Info size={18} />
                <p className="text-sm font-semibold">No tables available. Please enable or free up a table first.</p>
              </div>
            ) : (
              <>
                <select 
                  {...register('tableId', { required: 'Please select a table' })} 
                  className="input-field appearance-none bg-surface-800"
                >
                  <option value="">-- Select a Table --</option>
                  {tables.map(t => (
                    <option key={t.id} value={t.id}>{t.name} - {t.location}</option>
                  ))}
                </select>
                {errors.tableId && <p className="text-xs text-red-400 mt-2">{errors.tableId.message}</p>}
              </>
            )}
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="glass p-6">
            <h2 className="text-lg font-bold text-white mb-4 border-b border-white/5 pb-4">Menu Items</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-[500px] overflow-y-auto pr-2 custom-scrollbar">
              {menuItems.map(item => {
                const inCart = cart.some(c => c.menuItemId === item.id);
                return (
                  <div 
                    key={item.id} 
                    onClick={() => addToCart(item)}
                    className={`flex flex-col p-4 rounded-xl border transition-all cursor-pointer ${
                      inCart
                      ? 'bg-brand-500/10 border-brand-500/50 shadow-[0_0_15px_rgba(99,102,241,0.15)]' 
                      : 'bg-white/5 border-white/5 hover:border-white/10'
                    }`}
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <div className={`w-5 h-5 rounded flex items-center justify-center border transition-all ${
                          inCart
                          ? 'bg-brand-500 border-brand-500 text-white'
                          : 'border-slate-600 bg-slate-800'
                        }`}>
                          {inCart && <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>}
                        </div>
                      </div>
                      <p className="text-lg font-bold text-emerald-400">NPR {item.price.toFixed(2)}</p>
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-white">{item.name}</p>
                      <p className="text-[10px] text-slate-400 mt-0.5 uppercase tracking-wider">{item.categoryName}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </motion.div>
        </div>

        <div className="lg:col-span-1">
          <motion.div initial={{ opacity: 0, x: 12 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.15 }} className="glass p-6 sticky top-24 flex flex-col max-h-[calc(100vh-120px)]">
            <h2 className="text-lg font-bold text-white mb-4 border-b border-white/5 pb-4 shrink-0">Order Summary</h2>
            
            <div className="space-y-3 mb-6 overflow-y-auto pr-2 custom-scrollbar flex-1">
              <AnimatePresence>
                {cart.length === 0 ? (
                  <p className="text-sm text-slate-500 italic text-center py-4">No items selected.</p>
                ) : (
                  cart.map(item => (
                    <motion.div 
                      key={item.id} 
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="bg-white/5 border border-white/5 rounded-xl p-3"
                    >
                      <div className="flex justify-between items-start mb-2">
                        <span className="text-white font-medium text-sm truncate pr-2">{item.name}</span>
                        <span className="text-emerald-400 font-bold text-sm shrink-0">NPR {(item.price * item.quantity).toFixed(2)}</span>
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2 bg-slate-800 rounded-lg p-1">
                          <button 
                            type="button" 
                            onClick={() => updateQuantity(item.id, -1)}
                            className="w-6 h-6 rounded flex items-center justify-center bg-slate-700 hover:bg-slate-600 text-slate-300 transition-colors"
                          >
                            <Minus size={12} />
                          </button>
                          <span className="text-xs font-bold w-4 text-center text-white">{item.quantity}</span>
                          <button 
                            type="button" 
                            onClick={() => updateQuantity(item.id, 1)}
                            className="w-6 h-6 rounded flex items-center justify-center bg-slate-700 hover:bg-slate-600 text-slate-300 transition-colors"
                          >
                            <Plus size={12} />
                          </button>
                        </div>
                        <button 
                          type="button" 
                          onClick={() => removeFromCart(item.id)}
                          className="p-1.5 text-red-400 hover:bg-red-400/10 rounded-lg transition-colors"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </motion.div>
                  ))
                )}
              </AnimatePresence>
            </div>

            <div className="pt-4 border-t border-white/5 shrink-0">
              <div className="flex justify-between items-center mb-6">
                <span className="text-white font-bold">Total</span>
                <span className="text-2xl font-bold text-emerald-400">NPR {subtotal.toFixed(2)}</span>
              </div>
              
              <button 
                type="submit" 
                className="btn-primary w-full py-3 text-lg" 
                disabled={create.isPending || cart.length === 0}
              >
                {create.isPending ? 'Processing…' : 'Place Order'}
              </button>
            </div>
          </motion.div>
        </div>
      </form>
    </div>
  );
}
