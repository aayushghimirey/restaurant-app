import { useState, useEffect } from 'react';
import { cn } from "@/lib/utils";
import { Trash2, Plus, Minus, ShoppingBag, Send, Search, Filter, ChefHat, Coffee, Utensils } from 'lucide-react';
import { useMenus } from '@/features/menus/api';
import { useCreateReservation } from '../api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import type { MenuCategory } from '@/features/menus/types';

interface OrderBuilderProps {
  tableId: string;
  tableName: string;
  onComplete: () => void;
}

interface OrderItem {
  menuId: string;
  name: string;
  price: number;
  quantity: number;
}

const CATEGORY_ICONS: Record<string, React.ElementType> = {
  APPETIZER: Utensils,
  MAIN_COURSE: ChefHat,
  DESSERT: Coffee,
  BEVERAGE: Coffee,
  OTHER: Utensils,
};

export function OrderBuilder({ tableId, tableName, onComplete }: OrderBuilderProps) {
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [activeCategory, setActiveCategory] = useState<MenuCategory | 'ALL'>('ALL');
  const [orderItems, setOrderItems] = useState<OrderItem[]>([]);

  const reserveMutation = useCreateReservation();

  // Debounce search input for server-side filtering
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(search);
    }, 400);
    return () => clearTimeout(handler);
  }, [search]);

  // Server-side fetching using updated query parameters
  const { data: menusData, isLoading } = useMenus({
    size: 500, // Handle up to 500 items for POS
    category: activeCategory === 'ALL' ? undefined : activeCategory,
    menuName: debouncedSearch || undefined
  });
  const menus = menusData?.data || [];

  const addToOrder = (menuId: string, name: string, price: number) => {
    setOrderItems(prev => {
      const existing = prev.find(i => i.menuId === menuId);
      if (existing) {
        return prev.map(i => i.menuId === menuId ? { ...i, quantity: i.quantity + 1 } : i);
      }
      return [...prev, { menuId, name, price, quantity: 1 }];
    });
  };

  const removeFromOrder = (menuId: string) => {
    setOrderItems(prev => prev.filter(i => i.menuId !== menuId));
  };

  const updateQty = (menuId: string, delta: number) => {
    setOrderItems(prev => prev.map(i => {
      if (i.menuId === menuId) {
        const newQ = i.quantity + delta;
        return newQ > 0 ? { ...i, quantity: newQ } : i;
      }
      return i;
    }));
  };

  const handleCreateOrder = () => {
    if (orderItems.length === 0) return;
    reserveMutation.mutate({ tableId, items: orderItems }, {
      onSuccess: () => {
        onComplete();
      }
    });
  };

  const total = orderItems.reduce((acc, item) => acc + (item.price * item.quantity), 0);

  return (
    <div className="flex flex-col lg:flex-row gap-8 h-full min-h-[600px] animate-in flex-1 bg-background relative z-10">
      {/* Menu Selection */}
      <div className="flex-1 flex flex-col h-[700px] overflow-hidden gap-6 p-6 md:p-8 pt-6">

        {/* Filters */}
        <div className="flex gap-4">
          <div className="relative flex-1 group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground group-focus-within:text-primary transition-colors" />
            <Input
              placeholder="Search entire menu..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="pl-12 h-14 bg-muted/30 border-border hover:border-primary/40 focus-visible:border-primary focus-visible:ring-primary/20 text-base font-medium rounded-2xl transition-all shadow-sm"
            />
          </div>
          <div className="w-[180px] relative">
            <select
              value={activeCategory}
              onChange={(e) => setActiveCategory(e.target.value as any)}
              className="h-14 w-full pl-4 pr-10 bg-muted/30 border border-border hover:border-primary/40 rounded-2xl text-sm font-bold outline-none focus:ring-4 focus:ring-primary/20 transition-all cursor-pointer appearance-none shadow-sm"
            >
              <option value="ALL">All Categories</option>
              <option value="APPETIZER">Appetizer</option>
              <option value="MAIN_COURSE">Main Course</option>
              <option value="DESSERT">Dessert</option>
              <option value="BEVERAGE">Beverage</option>
              <option value="OTHER">Other</option>
            </select>
            <Filter className="absolute right-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
          </div>
        </div>

        {/* Menu Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 content-start overflow-y-auto custom-scrollbar flex-1 pb-8 pr-2">
          {menus.map(m => {
            const Icon = CATEGORY_ICONS[m.category] || Utensils;
            const itemInCart = orderItems.find(i => i.menuId === m.id);
            const qty = itemInCart ? itemInCart.quantity : 0;

            return (
              <button
                key={m.id}
                onClick={() => addToOrder(m.id, m.name, m.price)}
                className={cn(
                  "group flex flex-col p-3 text-left bg-card border rounded-2xl transition-all duration-200 relative overflow-hidden",
                   qty > 0 
                     ? "border-primary/60 shadow-sm bg-primary/5 scale-[0.98]" 
                     : "border-border hover:border-primary/40 shadow-sm hover:-translate-y-0.5"
                )}
              >
                <div className="flex items-start justify-between w-full mb-2.5 gap-2">
                  <div className={cn(
                    "h-8 w-8 shrink-0 rounded-xl flex items-center justify-center transition-colors shadow-sm",
                    qty > 0 ? "bg-primary text-primary-foreground" : "bg-primary/10 text-primary group-hover:bg-primary/20"
                  )}>
                    <Icon className="h-4 w-4" />
                  </div>
                  {qty > 0 && (
                    <div className="bg-primary text-primary-foreground text-[10px] font-black px-1.5 py-0.5 rounded-md animate-in zoom-in shadow-sm uppercase tracking-wider">
                      {qty} In Cart
                    </div>
                  )}
                </div>
                
                <div className="w-full flex-1 flex flex-col justify-between">
                  <span className="text-[13px] font-bold leading-tight line-clamp-2 mb-2">{m.name}</span>
                  <div className="flex items-center justify-between w-full mt-auto">
                    <span className="text-muted-foreground text-[9px] font-bold uppercase tracking-widest truncate">
                      {m.category.replace('_', ' ')}
                    </span>
                    <span className="font-bold text-xs text-foreground bg-muted/80 px-2 py-0.5 rounded-md shrink-0">
                      Rs {m.price}
                    </span>
                  </div>
                </div>
              </button>
            )
          })}
          {!isLoading && menus.length === 0 && (
            <div className="col-span-full h-full flex flex-col items-center justify-center text-center p-8 text-muted-foreground">
              <MenuGridEmptyState />
            </div>
          )}
          {isLoading && (
            <div className="col-span-full h-full flex flex-col items-center justify-center p-8">
              <div className="h-8 w-8 border-4 border-primary/30 border-t-primary rounded-full animate-spin mb-4" />
            </div>
          )}
        </div>
      </div>

      {/* Current Order (Cart) */}
      <div className="w-full lg:w-[420px] flex flex-col bg-muted/30 border-l border-border h-[700px] shrink-0 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-3xl pointer-events-none translate-x-1/3 -translate-y-1/2" />

        <div className="p-8 pb-4 border-b border-border/50 bg-background/50 backdrop-blur-xl relative z-10">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="h-12 w-12 rounded-full bg-primary/10 text-primary flex items-center justify-center shadow-sm">
                <ShoppingBag className="h-5 w-5" />
              </div>
              <div>
                <h4 className="text-base font-bold">Active Cart</h4>
                <p className="text-xs text-muted-foreground font-semibold mt-0.5 tracking-wider uppercase">{tableName}</p>
              </div>
            </div>
            <div className="h-8 w-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xs font-bold shadow-md shadow-primary/20">
              {orderItems.reduce((a, b) => a + b.quantity, 0)}
            </div>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto custom-scrollbar p-6 space-y-4 relative z-10">
          {orderItems.map(item => {
            return (
              <div key={item.menuId} className="flex flex-col gap-4 bg-background border border-border p-5 rounded-2xl shadow-sm hover:shadow-md transition-all animate-in slide-in-from-right-4">
                <div className="flex justify-between items-start gap-4">
                  <div className="space-y-1 flex-1">
                    <div className="font-bold text-base leading-tight text-foreground">{item.name}</div>
                    <div className="text-xs font-medium text-muted-foreground bg-muted inline-block px-2 py-0.5 rounded-md">
                      Rs {item.price} / ea
                    </div>
                  </div>
                  <div className="text-lg font-black text-primary">
                    Rs {item.price * item.quantity}
                  </div>
                </div>

                <div className="flex items-center justify-between pt-4 border-t border-border border-dashed">
                  <div className="flex items-center gap-1 bg-muted/50 p-1 rounded-xl border border-border">
                    <button className="h-8 w-8 flex items-center justify-center bg-background hover:bg-muted text-foreground rounded-lg shadow-sm transition-colors" onClick={() => updateQty(item.menuId, -1)}>
                      <Minus className="h-4 w-4" />
                    </button>
                    <span className="w-10 text-center text-sm font-bold">{item.quantity}</span>
                    <button className="h-8 w-8 flex items-center justify-center bg-background hover:bg-muted text-foreground rounded-lg shadow-sm transition-colors" onClick={() => updateQty(item.menuId, 1)}>
                      <Plus className="h-4 w-4" />
                    </button>
                  </div>
                  <button onClick={() => removeFromOrder(item.menuId)} className="h-10 w-10 flex items-center justify-center text-destructive/70 hover:text-destructive bg-destructive/5 hover:bg-destructive/10 rounded-xl transition-colors">
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            )
          })}
          {orderItems.length === 0 && (
            <div className="h-full flex flex-col items-center justify-center text-center p-8 opacity-60">
              <div className="h-20 w-20 rounded-full bg-muted flex items-center justify-center mb-4">
                <ShoppingBag className="h-8 w-8 text-muted-foreground" />
              </div>
              <h3 className="text-sm font-bold text-foreground">Your cart is empty</h3>
              <p className="text-xs font-semibold text-muted-foreground mt-1 max-w-[200px]">Add items from the menu to start building the order.</p>
            </div>
          )}
        </div>

        <div className="p-6 md:p-8 bg-background border-t border-border mt-auto shrink-0 space-y-6 shadow-[0_-10px_40px_-15px_rgba(0,0,0,0.1)] relative z-20">
          <div className="flex justify-between items-end">
            <span className="text-sm font-bold uppercase tracking-wider text-muted-foreground">Total Value</span>
            <div className="text-3xl font-black tracking-tight flex items-baseline gap-1">
              <span className="text-primary text-base font-bold">Rs</span>
              {total.toLocaleString(undefined, { minimumFractionDigits: 2 })}
            </div>
          </div>

          <Button
            className="w-full h-14 rounded-2xl text-sm font-bold uppercase tracking-widest gap-2 shadow-xl shadow-primary/20 transition-all hover:translate-y-[-2px] hover:shadow-primary/30"
            disabled={orderItems.length === 0 || reserveMutation.isPending}
            onClick={handleCreateOrder}
          >
            <Send className="h-4 w-4" />
            {reserveMutation.isPending ? 'PROCESSING...' : 'DISPATCH ORDER'}
          </Button>
        </div>
      </div>
    </div>
  )
}

function MenuGridEmptyState() {
  return (
    <>
      <div className="h-16 w-16 rounded-full bg-muted flex items-center justify-center mb-4">
        <ChefHat className="h-8 w-8 text-muted-foreground" />
      </div>
      <h3 className="text-sm font-bold text-foreground">No menu items found</h3>
      <p className="text-xs font-semibold text-muted-foreground mt-1">Try adjusting your filters or search query.</p>
    </>
  )
}
