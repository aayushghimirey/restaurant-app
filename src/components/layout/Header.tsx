import { useAuth } from '../../contexts/AuthContext';
import { Search, Bell, User, LogOut, Settings, ChevronDown, Filter, Menu as MenuIcon } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { inventoryService } from '../../services/inventoryService';
import type { InventoryCategoryResponse } from '../../types/inventory';

export default function Header() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const location = useLocation();
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [categories, setCategories] = useState<InventoryCategoryResponse[]>([]);
  
  const search = searchParams.get('q') || '';
  const category = searchParams.get('category') || 'ALL';

  const isInventory = location.pathname.includes('/inventory') && !location.pathname.includes('/transactions') && !location.pathname.includes('/units');

  useEffect(() => {
    if (isInventory) {
      fetchCategories();
    }
  }, [isInventory]);

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

  const handleSearch = (val: string) => {
    if (val) searchParams.set('q', val);
    else searchParams.delete('q');
    searchParams.set('page', '0');
    setSearchParams(searchParams);
  };

  const handleCategory = (val: string) => {
    if (val && val !== 'ALL') searchParams.set('category', val);
    else searchParams.delete('category');
    searchParams.set('page', '0');
    setSearchParams(searchParams);
  };

  // Close profile on location change
  useEffect(() => {
    setIsProfileOpen(false);
  }, [location]);
  const isTables = location.pathname.includes('/tables');
  const isOrders = location.pathname.includes('/orders');
  const isMenu = location.pathname.includes('/menu');
  const isVendors = location.pathname.includes('/vendors');
  const isStaff = location.pathname.includes('/staff');
  const isPOS = location.pathname.includes('/take-order');

  const showSearch = isInventory || isTables || isOrders || isMenu || isVendors || isStaff || isPOS;

  const status = searchParams.get('status') || 'AVAILABLE';
  const activeOrderStatuses = searchParams.getAll('orderStatuses');

  const handleStatus = (val: string) => {
    if (val && val !== 'ALL') searchParams.set('status', val);
    else searchParams.delete('status');
    searchParams.set('page', '0');
    setSearchParams(searchParams);
  };

  const handleOrderStatus = (mode: 'ACTIVE' | 'ALL') => {
    searchParams.delete('orderStatuses');
    searchParams.delete('page');
    if (mode === 'ALL') {
      searchParams.append('orderStatuses', 'ALL');
    } else {
      searchParams.append('orderStatuses', 'PENDING');
      searchParams.append('orderStatuses', 'SERVED');
    }
    setSearchParams(searchParams);
  };

  const currentOrderMode = (activeOrderStatuses.length === 1 && activeOrderStatuses[0] === 'ALL') ? 'ALL' : 'ACTIVE';

  const toggleSidebar = () => {
    window.dispatchEvent(new CustomEvent('toggle-sidebar'));
  };

  return (
    <header className="h-16 border-b border-white/[0.06] bg-surface-900/60 backdrop-blur-xl sticky top-0 z-40 px-4 md:px-6 flex items-center justify-between gap-4 md:gap-6">
      {/* Mobile Menu Toggle */}
      <button 
        onClick={toggleSidebar}
        className="lg:hidden p-2.5 text-slate-400 hover:text-white hover:bg-white/5 rounded-xl transition-all active:scale-95"
      >
        <MenuIcon size={18} />
      </button>

      {/* Search & Global Controls */}
      <div className="flex items-center gap-4 flex-1 max-w-3xl">
        <AnimatePresence mode="wait">
          {showSearch ? (
            <motion.div 
              key="search"
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -10 }}
              className="relative flex-1 group"
            >
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                <Search size={16} className="text-slate-500 group-focus-within:text-brand-400 transition-colors" />
              </div>
              <input
                type="text"
                placeholder={`Search in ${location.pathname.split('/')[1]}...`}
                value={search}
                onChange={(e) => handleSearch(e.target.value)}
                className="w-full bg-white/[0.02] border border-white/[0.06] rounded-xl pl-11 pr-4 py-2.5 text-xs text-white focus:outline-none focus:border-brand-500/40 focus:bg-white/[0.04] focus:ring-4 focus:ring-brand-500/5 transition-all placeholder:text-slate-600 font-medium"
              />
            </motion.div>
          ) : (
            <motion.div 
              key="no-search"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex-1"
            />
          )}
        </AnimatePresence>

        {/* Dynamic Filters Area */}
        <div className="hidden md:flex items-center gap-2">
          {isInventory && (
            <motion.div 
              key="inventory" initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 10 }}
              className="flex items-center gap-2 px-3 py-2 bg-white/[0.02] border border-white/[0.06] rounded-xl group hover:border-white/20 transition-all cursor-pointer"
            >
              <Filter size={14} className="text-brand-500/60 group-hover:text-brand-400" />
              <select
                value={category}
                onChange={(e) => handleCategory(e.target.value)}
                className="bg-transparent text-[10px] font-black uppercase tracking-widest text-slate-400 focus:outline-none cursor-pointer pr-1 appearance-none group-hover:text-slate-200 transition-colors"
              >
                <option value="ALL" className="bg-surface-900 text-white">All Categories</option>
                {categories.map(cat => (
                  <option key={cat.id} value={cat.id} className="bg-surface-900 text-white">{cat.name}</option>
                ))}
              </select>
              <ChevronDown size={10} className="text-slate-600 group-hover:text-slate-400 transition-colors" />
            </motion.div>
          )}

          {isTables && (
            <motion.div 
              key="tables" initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 10 }}
              className="flex items-center gap-2 px-3 py-2 bg-white/[0.02] border border-white/[0.06] rounded-xl group hover:border-white/20 transition-all cursor-pointer"
            >
              <Filter size={14} className="text-brand-500/60 group-hover:text-brand-400" />
              <select
                value={status}
                onChange={(e) => handleStatus(e.target.value)}
                className="bg-transparent text-[10px] font-black uppercase tracking-widest text-slate-400 focus:outline-none cursor-pointer pr-1 appearance-none group-hover:text-slate-200 transition-colors"
              >
                <option value="ALL" className="bg-surface-900 text-white">All Statuses</option>
                <option value="AVAILABLE" className="bg-surface-900 text-white">Available</option>
                <option value="RESERVED" className="bg-surface-900 text-white">Reserved</option>
                <option value="DISABLED" className="bg-surface-900 text-white">Disabled</option>
              </select>
              <ChevronDown size={10} className="text-slate-600 group-hover:text-slate-400 transition-colors" />
            </motion.div>
          )}

          {isOrders && (
            <motion.div 
              key="orders" initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 10 }}
              className="flex items-center gap-2"
            >
              <div className="flex items-center bg-white/[0.02] border border-white/[0.06] rounded-xl p-1 shadow-inner">
                <button
                  onClick={() => handleOrderStatus('ACTIVE')}
                  className={`px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-wider transition-all ${currentOrderMode === 'ACTIVE' ? 'bg-brand-500 text-white shadow-lg shadow-brand-500/20' : 'text-slate-500 hover:text-slate-300 hover:bg-white/5'}`}
                >
                  Active
                </button>
                <button
                  onClick={() => handleOrderStatus('ALL')}
                  className={`px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-wider transition-all ${currentOrderMode === 'ALL' ? 'bg-brand-500 text-white shadow-lg shadow-brand-500/20' : 'text-slate-500 hover:text-slate-300 hover:bg-white/5'}`}
                >
                  History
                </button>
              </div>

              <div className="flex items-center gap-2 px-3 py-2 bg-white/[0.02] border border-white/[0.06] rounded-xl group hover:border-white/20 transition-all cursor-pointer relative">
                <Filter size={14} className="text-brand-500/60 group-hover:text-brand-400 transition-colors" />
                <select
                  value={activeOrderStatuses.length === 1 ? activeOrderStatuses[0] : ''}
                  onChange={(e) => {
                    if (e.target.value) {
                      searchParams.delete('orderStatuses');
                      searchParams.append('orderStatuses', e.target.value);
                      searchParams.set('page', '0');
                      setSearchParams(searchParams);
                    } else {
                      handleOrderStatus('ACTIVE');
                    }
                  }}
                  className="bg-transparent text-[10px] font-black uppercase tracking-widest text-slate-400 focus:outline-none cursor-pointer pr-1 appearance-none group-hover:text-slate-200 transition-colors"
                >
                  <option value="" className="bg-surface-900 text-white">By Status</option>
                  <option value="PENDING" className="bg-surface-900 text-white">Pending</option>
                  <option value="SERVED" className="bg-surface-900 text-white">Served</option>
                  <option value="COMPLETED" className="bg-surface-900 text-white">Completed</option>
                  <option value="CANCELLED" className="bg-surface-900 text-white">Cancelled</option>
                </select>
                <ChevronDown size={10} className="text-slate-600 group-hover:text-slate-400 transition-colors" />
              </div>
            </motion.div>
          )}
        </div>
      </div>

      {/* User & Global Actions */}
      <div className="flex items-center gap-3">
   
        
        <div className="h-6 w-px bg-white/10 mx-1"></div>

        <div className="relative">
          <button 
            onClick={() => setIsProfileOpen(!isProfileOpen)}
            className="flex items-center gap-2.5 p-1.5 rounded-xl hover:bg-white/5 transition-all group border border-transparent hover:border-white/10 active:scale-[0.98]"
          >
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-brand-500 to-brand-700 flex items-center justify-center text-xs font-black text-white shadow-[0_4px_12px_rgba(var(--brand-500-rgb),0.3)]">
              {user?.email?.[0]?.toUpperCase() ?? 'U'}
            </div>
            <div className="hidden lg:block text-left">
              <p className="text-xs font-bold text-white leading-tight">{user?.email?.split('@')[0]}</p>
              <div className="flex items-center gap-1.5 mt-0.5">
                <div className="w-1 h-1 rounded-full bg-emerald-500"></div>
                <p className="text-[9px] text-slate-500 font-black uppercase tracking-widest">{user?.branchName || 'HQ'}</p>
              </div>
            </div>
            <ChevronDown size={14} className={`text-slate-600 group-hover:text-slate-400 transition-transform duration-300 ${isProfileOpen ? 'rotate-180' : ''}`} />
          </button>

          <AnimatePresence>
            {isProfileOpen && (
              <>
                <div className="fixed inset-0 z-[-1]" onClick={() => setIsProfileOpen(false)}></div>
                <motion.div 
                  initial={{ opacity: 0, y: 8, scale: 0.98 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 8, scale: 0.98 }}
                  className="absolute right-0 mt-3 w-64 glass-card border border-white/10 shadow-[0_20px_50px_rgba(0,0,0,0.5)] p-2 z-50 rounded-2xl overflow-hidden"
                >
                  <div className="px-4 py-3 mb-2 bg-white/[0.02] rounded-xl border border-white/[0.05]">
                    <p className="text-[10px] text-slate-500 font-black uppercase tracking-widest mb-1">Authenticated As</p>
                    <p className="text-xs font-bold text-white truncate">{user?.email}</p>
                    <span className="inline-block mt-2 px-2 py-0.5 bg-brand-500/10 text-brand-400 text-[9px] font-black uppercase tracking-wider rounded-md border border-brand-500/20">
                      {user?.userType?.replace('_', ' ')}
                    </span>
                  </div>
                  
                  <div className="space-y-0.5">
                    <button
                      onClick={() => { setIsProfileOpen(false); navigate('/account-settings'); }}
                      className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs text-slate-400 hover:text-white hover:bg-white/5 transition-all group"
                    >
                      <User size={14} className="group-hover:text-brand-400" /> Account Settings
                    </button>
                  </div>
                  
                  <div className="h-px bg-white/5 my-2 mx-2"></div>
                  
                  <button 
                    onClick={() => { logout(); navigate('/login'); }}
                    className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs text-red-400 hover:text-red-300 hover:bg-red-500/10 transition-all font-bold group"
                  >
                    <LogOut size={14} className="group-hover:translate-x-0.5 transition-transform" /> Sign Out
                  </button>
                </motion.div>
              </>
            )}
          </AnimatePresence>
        </div>
      </div>
    </header>
  );
}
