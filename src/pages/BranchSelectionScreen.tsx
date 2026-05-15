import { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { GitBranch, ChefHat, LogOut, Loader2, Plus, ArrowRight } from 'lucide-react';
import { branchService } from '../services/branchService';
import { authService } from '../services/authService';
import { useAuth } from '../contexts/AuthContext';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import Modal from '../components/ui/Modal';
import { ErrorBanner } from '../components/ui/Feedback';
import type { CreateBranchRequest } from '../types';

export default function BranchSelectionScreen() {
  const { user, switchBranch, logout } = useAuth();
  const navigate = useNavigate();

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ['branches-selection'],
    queryFn: () => branchService.getAll({ page: 0, size: 50 }),
  });

  const [createOpen, setCreateOpen] = useState(false);
  const { register, handleSubmit, reset, formState: { isSubmitting: isCreating, errors } } = useForm<CreateBranchRequest>();

  const createMutation = useMutation({
    mutationFn: branchService.create,
    onSuccess: () => {
      refetch();
      setCreateOpen(false);
      reset();
    },
  });

  const switchMutation = useMutation({
    mutationFn: (branchId: string) => authService.switchBranch(branchId).then(res => ({ res, branchId })),
    onSuccess: ({ res, branchId }) => {
      if (res.success) {
        const branch = data?.data?.content?.find(b => b.id === branchId);
        const updatedUser = { 
          ...res.data, 
          branchId: res.data.branchId || branchId,
          branchName: res.data.branchName || branch?.name 
        };
        switchBranch(updatedUser);
        setTimeout(() => window.location.reload(), 100);
      }
    },
  });

  const handleLogout = () => { logout(); navigate('/login'); };
  const branches = data?.data?.content ?? [];

  return (
    <div className="min-h-screen flex items-center justify-center p-6 relative overflow-hidden bg-surface-900">
      {/* Mesh Gradients */}
      <div className="absolute top-[-15%] left-[-10%] w-[50%] h-[50%] rounded-full bg-brand-500/10 blur-[140px] pointer-events-none" />
      <div className="absolute bottom-[-15%] right-[-10%] w-[50%] h-[50%] rounded-full bg-accent-500/10 blur-[140px] pointer-events-none" />

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
        className="w-full max-w-2xl z-10"
      >
        <div className="glass p-8 md:p-12 text-center relative overflow-hidden">
          {/* Top accent line */}
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-brand-500 to-transparent opacity-40" />

          <div className="w-20 h-20 rounded-3xl flex items-center justify-center mx-auto mb-8 shadow-[0_15px_40px_rgba(99,102,241,0.3)] animate-float"
            style={{ background: 'linear-gradient(135deg, var(--color-brand-500), var(--color-brand-700))' }}>
            <ChefHat size={40} className="text-white" />
          </div>
          
          <h1 className="text-3xl font-extrabold text-white tracking-tight mb-3">Initialize Workspace</h1>
          <p className="text-slate-400 mb-12 max-w-md mx-auto text-sm leading-relaxed">
            Welcome, <span className="text-brand-300 font-bold">{user?.email}</span>. 
            Select an active branch to begin managing your restaurant operations.
          </p>

          {isLoading ? (
            <div className="flex flex-col items-center gap-4 py-16">
              <Loader2 size={40} className="animate-spin text-brand-500" />
              <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">Synchronizing Branches...</p>
            </div>
          ) : isError ? (
            <div className="py-12 px-8 rounded-2xl bg-red-500/5 border border-red-500/15 mb-8">
              <p className="text-red-400 font-medium mb-6">Encountered an error while fetching workspace data.</p>
              <button onClick={() => refetch()} className="btn-secondary text-xs px-6">Retry Connection</button>
            </div>
          ) : branches.length === 0 ? (
            <div className="py-16 px-8 rounded-3xl bg-white/[0.02] border border-white/5 mb-10 group transition-all hover:bg-white/[0.04]">
              <div className="w-16 h-16 rounded-2xl bg-brand-500/10 flex items-center justify-center mx-auto mb-6">
                <GitBranch size={28} className="text-brand-400" />
              </div>
              <p className="text-slate-300 font-semibold text-lg mb-2">No Active Branches</p>
              <p className="text-slate-500 text-sm mb-8 max-w-xs mx-auto">Get started by initializing your first restaurant location.</p>
              <button 
                onClick={() => setCreateOpen(true)}
                className="btn-primary"
              >
                <Plus size={18} />
                Create First Branch
              </button>
            </div>
          ) : (
            <div className="mb-10">
              <div className="flex items-center justify-between mb-6 px-2">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-brand-500 animate-pulse" />
                  <p className="text-[11px] font-bold text-slate-500 uppercase tracking-[0.2em]">Live Environments</p>
                </div>
                <button 
                  onClick={() => setCreateOpen(true)}
                  className="flex items-center gap-1.5 text-xs font-bold text-brand-400 hover:text-brand-300 transition-colors uppercase tracking-wider"
                >
                  <Plus size={14} />
                  New Branch
                </button>
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 text-left">
                {branches.map(branch => (
                  <button
                    key={branch.id}
                    onClick={() => switchMutation.mutate(branch.id)}
                    disabled={switchMutation.isPending}
                    className="flex flex-col items-start gap-4 p-6 rounded-2xl bg-white/[0.03] border border-white/10 hover:bg-white/[0.06] hover:border-brand-500/40 transition-all duration-300 group relative overflow-hidden"
                  >
                    <div className="absolute top-0 right-0 p-4 opacity-0 group-hover:opacity-100 transition-opacity">
                      <ArrowRight size={16} className="text-brand-400" />
                    </div>
                    <div className="w-12 h-12 rounded-xl flex items-center justify-center bg-white/5 group-hover:bg-brand-500/20 transition-all duration-300 group-hover:scale-110">
                      <GitBranch size={22} className="text-slate-400 group-hover:text-brand-400 transition-colors" />
                    </div>
                    <div>
                      <p className="font-bold text-white group-hover:text-brand-300 transition-colors truncate max-w-[200px]">{branch.name}</p>
                      {branch.address && (
                        <p className="text-[11px] text-slate-500 mt-1 font-medium truncate max-w-[200px] leading-relaxed italic">
                          {branch.address}
                        </p>
                      )}
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          <div className="pt-8 border-t border-white/5 flex flex-col sm:flex-row items-center justify-center gap-6">
            <button 
              onClick={handleLogout}
              className="btn-ghost text-red-400/70 hover:text-red-400 hover:bg-red-500/5 text-xs font-bold uppercase tracking-widest"
            >
              <LogOut size={16} />
              Terminate Session
            </button>
          </div>
        </div>
      </motion.div>

      {/* Create Branch Modal */}
      <Modal open={createOpen} onClose={() => { setCreateOpen(false); reset(); }} title="Deploy New Branch">
        <form onSubmit={handleSubmit(d => createMutation.mutate(d))} className="flex flex-col gap-6 text-left py-2">
          <div>
            <label className="input-label">Branch Name</label>
            <input {...register('name', { required: 'Required' })} className="input-field" placeholder="e.g. Central Kitchen" />
            {errors.name && <p className="text-[11px] text-red-400 mt-2 font-bold">{errors.name.message}</p>}
          </div>
          <div>
            <label className="input-label">Physical Address</label>
            <input {...register('address')} className="input-field" placeholder="e.g. 101 Innovation Dr, Tech City" />
          </div>
          {createMutation.isError && <ErrorBanner message="Failed to initialize the new branch." />}
          <div className="flex justify-end gap-3 pt-2">
            <button type="button" className="btn-secondary px-6" onClick={() => { setCreateOpen(false); reset(); }}>Cancel</button>
            <button type="submit" className="btn-primary min-w-[140px]" disabled={isCreating}>
              {isCreating ? <Loader2 size={18} className="animate-spin" /> : 'Deploy Branch'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
