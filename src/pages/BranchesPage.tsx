import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { motion } from 'framer-motion';
import { GitBranch, Plus, Search, MapPin, Clock } from 'lucide-react';
import { branchService } from '../services/branchService';
import type { CreateBranchRequest, BranchResponse } from '../types';
import Modal from '../components/ui/Modal';
import Pagination from '../components/ui/Pagination';
import { Spinner, EmptyState, ErrorBanner } from '../components/ui/Feedback';
import { formatDate } from '../lib/utils';

const PAGE_SIZE = 10;

export default function BranchesPage() {
  const [page, setPage] = useState(0);
  const [search, setSearch] = useState('');
  const [open, setOpen] = useState(false);
  const qc = useQueryClient();

  const { data, isLoading, isError } = useQuery({
    queryKey: ['branches', page],
    queryFn: () => branchService.getAll({ page, size: PAGE_SIZE }),
  });

  const { register, handleSubmit, reset, formState: { isSubmitting, errors } } = useForm<CreateBranchRequest>();

  const create = useMutation({
    mutationFn: branchService.create,
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['branches'] }); setOpen(false); reset(); },
  });

  const branches: BranchResponse[] = data?.data?.content ?? [];
  const paged = data?.data;
  const filtered = search
    ? branches.filter(b => b.name.toLowerCase().includes(search.toLowerCase()))
    : branches;

  return (
    <div className="max-w-6xl mx-auto">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -12 }} animate={{ opacity: 1, y: 0 }} className="flex items-center justify-between mb-6">
        <div>
          <div className="flex items-center gap-2 mb-0.5">
            <GitBranch size={18} style={{ color: 'var(--color-brand-400)' }} />
            <h1 className="text-xl font-bold text-white">Branches</h1>
          </div>
          <p className="text-sm text-slate-500 ml-6">Manage restaurant locations</p>
        </div>
        <button className="btn-primary" onClick={() => setOpen(true)}>
          <Plus size={15} /> New Branch
        </button>
      </motion.div>

      {/* Grid view */}
      {isLoading && <Spinner />}
      {isError && <ErrorBanner message="Failed to load branches." />}

      {!isLoading && !isError && filtered.length === 0 && (
        <EmptyState icon={<GitBranch size={22} />} title="No branches yet" description="Add your first restaurant branch." action={
          <button className="btn-primary mt-2" onClick={() => setOpen(true)}><Plus size={14} /> Add Branch</button>
        } />
      )}

      {!isLoading && !isError && filtered.length > 0 && (
        <>
          {/* Search */}
          <div className="mb-4">
            <div className="relative max-w-xs">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
              <input className="input-field pl-9" placeholder="Search branches…" value={search} onChange={e => setSearch(e.target.value)} />
            </div>
          </div>

          <motion.div
            initial="hidden"
            animate="show"
            variants={{ hidden: {}, show: { transition: { staggerChildren: 0.06 } } }}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4"
          >
            {filtered.map(b => (
              <motion.div
                key={b.id}
                variants={{ hidden: { opacity: 0, y: 12 }, show: { opacity: 1, y: 0 } }}
                className="glass p-5 flex flex-col gap-3 group hover:-translate-y-1 transition-transform duration-300"
              >
                <div className="flex items-start justify-between">
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center"
                    style={{ background: 'rgba(249,115,22,0.12)', border: '1px solid rgba(249,115,22,0.2)' }}>
                    <GitBranch size={18} style={{ color: 'var(--color-brand-400)' }} />
                  </div>
                </div>
                <div>
                  <p className="font-semibold text-white text-sm">{b.name}</p>
                  {b.address && (
                    <div className="flex items-center gap-1.5 mt-1.5">
                      <MapPin size={12} className="text-slate-600 shrink-0" />
                      <p className="text-xs text-slate-500 truncate">{b.address}</p>
                    </div>
                  )}
                </div>
                <div className="flex items-center gap-1.5 pt-2 border-t border-white/5">
                  <Clock size={11} className="text-slate-600" />
                  <p className="text-xs text-slate-600">{b.createdAt ? formatDate(b.createdAt) : '—'}</p>
                </div>
              </motion.div>
            ))}
          </motion.div>

          {paged && paged.totalElements > 0 && (
            <div className="mt-4 glass overflow-hidden">
              <Pagination page={page} totalPages={paged.totalPages} totalElements={paged.totalElements} pageSize={PAGE_SIZE} onPageChange={setPage} />
            </div>
          )}
        </>
      )}

      {/* Modal */}
      <Modal open={open} onClose={() => { setOpen(false); reset(); }} title="Create Branch">
        <form onSubmit={handleSubmit(d => create.mutate(d))} className="flex flex-col gap-4">
          <div>
            <label className="input-label">Branch Name *</label>
            <input {...register('name', { required: 'Required' })} className="input-field" placeholder="Downtown Branch" />
            {errors.name && <p className="text-xs text-red-400 mt-1">{errors.name.message}</p>}
          </div>
          <div>
            <label className="input-label">Address</label>
            <input {...register('address')} className="input-field" placeholder="123 Main St, City" />
          </div>
          {create.isError && <ErrorBanner message="Failed to create branch." />}
          <div className="flex justify-end gap-2 pt-1">
            <button type="button" className="btn-secondary" onClick={() => { setOpen(false); reset(); }}>Cancel</button>
            <button type="submit" className="btn-primary" disabled={isSubmitting}>
              {isSubmitting ? 'Creating…' : 'Create Branch'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
