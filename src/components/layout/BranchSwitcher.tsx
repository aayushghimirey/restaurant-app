import { useQuery, useMutation } from '@tanstack/react-query';
import { GitBranch, ChevronDown, Check, Loader2 } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';
import { branchService } from '../../services/branchService';
import { authService } from '../../services/authService';
import { useAuth } from '../../contexts/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';

export default function BranchSwitcher() {
  const { user, switchBranch } = useAuth();
  const [open, setOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const { data, isLoading } = useQuery({
    queryKey: ['branches-switcher'],
    queryFn: () => branchService.getAll({ page: 0, size: 50 }),
    enabled: user?.userType !== 'SUPER_ADMIN' && user?.userType !== 'STAFF',
  });

  const switchMutation = useMutation({
    mutationFn: (branchId: string) => authService.switchBranch(branchId).then(res => ({ res, branchId })),
    onSuccess: ({ res, branchId }) => {
      if (res.success) {
        const branch = branches.find(b => b.id === branchId);
        const updatedUser = { 
          ...res.data, 
          branchId: res.data.branchId || branchId,
          branchName: res.data.branchName || branch?.name 
        };
        switchBranch(updatedUser);
        setOpen(false);
        setTimeout(() => {
          window.location.reload();
        }, 100);
      }
    },
  });

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Don't show for Super Admin or Staff (per user request)
  if (user?.userType === 'SUPER_ADMIN' || user?.userType === 'STAFF') return null;

  const branches = data?.data?.content ?? [];
  const currentBranch = branches.find(b => b.id === user?.branchId);

  return (
    <div className="px-3 mb-4 relative" ref={dropdownRef}>
      <button
        onClick={() => setOpen(!open)}
        disabled={isLoading || switchMutation.isPending}
        className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-sm font-medium transition-all duration-200 bg-white/5 border border-white/10 hover:bg-white/8 text-slate-300 hover:text-white"
      >
        <div className="w-6 h-6 rounded-lg flex items-center justify-center shrink-0"
          style={{ background: 'rgba(249,115,22,0.1)', border: '1px solid rgba(249,115,22,0.15)' }}>
          {switchMutation.isPending ? (
            <Loader2 size={12} className="animate-spin text-brand-500" />
          ) : (
            <GitBranch size={12} className="text-brand-400" />
          )}
        </div>
        <span className="flex-1 text-left truncate">
          {isLoading ? (user?.branchName || 'Loading...') : (currentBranch?.name || user?.branchName || 'Select Branch')}
        </span>
        <ChevronDown size={14} className={`transition-transform duration-200 ${open ? 'rotate-180' : ''}`} />
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="absolute top-full left-3 right-3 mt-2 z-50 glass shadow-2xl overflow-hidden py-1 max-h-60 overflow-y-auto"
          >
            {branches.length === 0 ? (
              <div className="px-4 py-3 text-xs text-slate-500 text-center">No branches available</div>
            ) : (
              branches.map(branch => (
                <button
                  key={branch.id}
                  onClick={() => switchMutation.mutate(branch.id)}
                  disabled={switchMutation.isPending}
                  className="w-full flex items-center justify-between px-4 py-2.5 text-sm hover:bg-white/5 transition-colors text-slate-300 hover:text-white"
                >
                  <span className="truncate">{branch.name}</span>
                  {branch.id === user?.branchId && <Check size={14} className="text-brand-500" />}
                </button>
              ))
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
