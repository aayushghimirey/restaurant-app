import { NavLink, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import BranchSwitcher from './BranchSwitcher';
import {
  LayoutDashboard, Building2, GitBranch, Shield,
  Users, LogOut, ChefHat, X, Menu, Package, History, Settings, Ruler, Utensils,
  LayoutGrid, Receipt, Truck, ShoppingBag, Layers, FileText
} from 'lucide-react';
import { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useQuery } from '@tanstack/react-query';
import { businessDetailService } from '../../services/businessDetailService';

const superAdminNav = [
  { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/tenants',   icon: Building2,       label: 'Tenants' },
];

const tenantNav = [
  { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/orders',    icon: Receipt,         label: 'Orders' },
  { to: '/invoices',  icon: FileText,        label: 'Invoices' },
  { to: '/take-order',icon: ShoppingBag,     label: 'Take Order' },
  { to: '/branches',  icon: GitBranch,       label: 'Branches' },
  { to: '/staff',     icon: Users,           label: 'Staff' },
  { to: '/vendors',   icon: Truck,           label: 'Vendors' },
  { to: '/menu',      icon: Utensils,        label: 'Menu' },
  { to: '/tables',    icon: LayoutGrid,      label: 'Tables' },
  { to: '/inventory', icon: Package,         label: 'Inventory' },
  { to: '/inventory/transactions', icon: History, label: 'Transactions' },
  { to: '/inventory/categories', icon: Layers,    label: 'Categories' },
  { to: '/inventory/settings', icon: Ruler,       label: 'Units' },
  { to: '/roles',              icon: Shield,          label: 'Roles' },
];

function NavItem({ to, icon: Icon, label }: { to: string; icon: React.ElementType; label: string }) {
  return (
    <NavLink
      to={to}
      end
      className={({ isActive }) =>
        `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold transition-all duration-300 group ${
          isActive
            ? 'text-white shadow-[0_4px_12px_rgba(99,102,241,0.3)]'
            : 'text-slate-400 hover:text-white hover:bg-white/5'
        }`
      }
      style={({ isActive }) =>
        isActive
          ? { background: 'linear-gradient(135deg, var(--color-brand-500), var(--color-brand-700))', border: '1px solid rgba(255,255,255,0.1)' }
          : {}
      }
    >
      {({ isActive }) => (
        <>
          <Icon size={18} className={isActive ? 'text-white' : 'text-slate-500 group-hover:text-slate-300'} />
          {label}
        </>
      )}
    </NavLink>
  );
}

export default function Sidebar() {
  const { user, logout, isSuperAdmin, isTenant } = useAuth();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);

  // Fetch business name — only relevant for tenant users
  const { data: bizData } = useQuery({
    queryKey: ['business-detail'],
    queryFn: businessDetailService.get,
    enabled: !isSuperAdmin,
    retry: false,
  });
  const displayName = bizData?.data?.businessName || user?.tenantName || 'STS-HOSPITALITY';

  let nav = isSuperAdmin ? superAdminNav : tenantNav;
  if (!isSuperAdmin && !isTenant) {
    nav = nav.filter(item => 
      item.to !== '/branches' && 
      item.to !== '/roles'
    );
  }

  const handleLogout = () => { logout(); navigate('/login'); };

  const SidebarContent = () => (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className="flex items-center gap-3 px-4 py-6 border-b border-white/5">
        <div className="w-10 h-10 rounded-xl flex items-center justify-center shadow-[0_4px_20px_rgba(99,102,241,0.4)]"
          style={{ background: 'linear-gradient(135deg, var(--color-brand-500), var(--color-brand-600))' }}>
          <ChefHat size={20} className="text-white" />
        </div>
        <div>
          <p className="text-sm font-bold text-white leading-tight uppercase truncate max-w-[140px]">
            {displayName}
          </p>
          <div className="flex flex-col gap-0.5 mt-0.5">
            <p className="text-[10px] text-slate-500 uppercase font-medium tracking-wider">
              {user?.userType?.replace('_', ' ') ?? 'System'}
            </p>
            {user?.branchName && (
              <div className="flex items-center gap-1.5 px-1.5 py-0.5 rounded-md bg-brand-500/10 text-brand-400 font-bold border border-brand-500/20 truncate max-w-[140px] mt-1">
                <GitBranch size={10} className="shrink-0" />
                <span className="text-[9px] uppercase tracking-tighter truncate">{user.branchName}</span>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="mt-4">
        <BranchSwitcher />
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 flex flex-col gap-1 overflow-y-auto custom-scrollbar">
        {nav.map(item => <NavItem key={item.to} {...item} />)}
      </nav>

    </div>
  );

  useEffect(() => {
    const handleToggle = () => setMobileOpen(v => !v);
    window.addEventListener('toggle-sidebar', handleToggle);
    return () => window.removeEventListener('toggle-sidebar', handleToggle);
  }, []);

  return (
    <>
      {/* Mobile overlay */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm lg:hidden"
            onClick={() => setMobileOpen(false)}
          />
        )}
      </AnimatePresence>

      {/* Mobile sidebar */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.aside
            initial={{ x: -280 }} animate={{ x: 0 }} exit={{ x: -280 }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed left-0 top-0 bottom-0 w-64 z-50 lg:hidden"
            style={{ background: 'var(--color-surface-800)', borderRight: '1px solid rgba(255,255,255,0.07)' }}
          >
            <SidebarContent />
          </motion.aside>
        )}
      </AnimatePresence>

      {/* Desktop sidebar */}
      <aside className="hidden lg:flex flex-col w-60 shrink-0 h-screen sticky top-0 self-start"
        style={{ background: 'var(--color-surface-800)', borderRight: '1px solid rgba(255,255,255,0.06)' }}>
        <SidebarContent />
      </aside>
    </>
  );
}
