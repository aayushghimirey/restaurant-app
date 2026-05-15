import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { motion } from 'framer-motion';
import { Building2, Plus, Search, Trash2 } from 'lucide-react';
import { tenantService } from '../services/tenantService';
import type { CreateTenantRequest, TenantResponse } from '../types';
import Modal from '../components/ui/Modal';
import Pagination from '../components/ui/Pagination';
import { Spinner, EmptyState, ErrorBanner } from '../components/ui/Feedback';
import { toast } from 'sonner';
import ConfirmModal from '../components/ui/ConfirmModal';

const PAGE_SIZE = 10;

function statusBadge(status: string) {
  const s = status?.toLowerCase();
  if (s === 'active') return <span className="badge-success badge">{status}</span>;
  if (s === 'inactive') return <span className="badge-danger badge">{status}</span>;
  return <span className="badge-info badge">{status}</span>;
}

export default function TenantsPage() {
  const [page, setPage] = useState(0);
  const [search, setSearch] = useState('');
  const [open, setOpen] = useState(false);
  const qc = useQueryClient();
  const [confirmConfig, setConfirmConfig] = useState<{
    open: boolean;
    title: string;
    message: string;
    onConfirm: () => void;
    isLoading: boolean;
  }>({
    open: false,
    title: '',
    message: '',
    onConfirm: () => {},
    isLoading: false
  });

  const { data, isLoading, isError } = useQuery({
    queryKey: ['tenants', page],
    queryFn: () => tenantService.getAll({ page, size: PAGE_SIZE }),
  });

  const { register, handleSubmit, reset, formState: { isSubmitting, errors } } = useForm<CreateTenantRequest>();

  const create = useMutation({
    mutationFn: tenantService.create,
    onSuccess: () => { 
      qc.invalidateQueries({ queryKey: ['tenants'] }); 
      setOpen(false); 
      reset(); 
      toast.success('Tenant created successfully');
    },
    onError: () => toast.error('Failed to create tenant'),
  });
  
  const deleteTenant = useMutation({
    mutationFn: tenantService.delete,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['tenants'] });
      toast.success('Tenant removed');
    },
    onError: () => toast.error('Failed to remove tenant'),
  });

  const tenants: TenantResponse[] = data?.data?.content ?? [];
  const paged = data?.data;
  const filtered = search
    ? tenants.filter(t => t.name.toLowerCase().includes(search.toLowerCase()) || t.slug.toLowerCase().includes(search.toLowerCase()))
    : tenants;

  const onSubmit = (d: CreateTenantRequest) => create.mutate(d);

  return (
    <div className="max-w-6xl mx-auto">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -12 }} animate={{ opacity: 1, y: 0 }} className="flex items-center justify-between mb-6">
        <div>
          <div className="flex items-center gap-2 mb-0.5">
            <Building2 size={18} style={{ color: 'var(--color-brand-400)' }} />
            <h1 className="text-xl font-bold text-white">Tenants</h1>
          </div>
          <p className="text-sm text-slate-500 ml-6">Manage all registered restaurant groups</p>
        </div>
        <button className="btn-primary" onClick={() => setOpen(true)}>
          <Plus size={15} /> New Tenant
        </button>
      </motion.div>

      {/* Table card */}
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.08 }} className="glass overflow-hidden">
        {/* Search */}
        <div className="px-4 py-3 border-b border-white/5">
          <div className="relative max-w-xs">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
            <input
              className="input-field pl-9 py-2 text-sm"
              placeholder="Search tenants…"
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>
        </div>

        {isLoading && <Spinner />}
        {isError && <ErrorBanner message="Failed to load tenants. Check your connection." />}

        {!isLoading && !isError && (
          <>
            <div className="overflow-x-auto">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Slug</th>
                    <th>Status</th>
                    <th>ID</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.length === 0 && (
                    <tr><td colSpan={4}>
                      <EmptyState icon={<Building2 size={22} />} title="No tenants yet" description="Create your first tenant to get started." />
                    </td></tr>
                  )}
                  {filtered.map(t => (
                    <tr key={t.id} className="group">
                      <td><span className="font-medium text-white">{t.name}</span></td>
                      <td><code className="text-xs text-slate-400 bg-white/5 px-2 py-0.5 rounded">{t.slug}</code></td>
                      <td>{statusBadge(t.status)}</td>
                      <td>
                        <div className="flex items-center justify-between gap-4">
                          <code className="text-xs text-slate-600">{t.id}</code>
                          <button 
                            className="p-1.5 text-slate-600 hover:text-rose-500 hover:bg-rose-500/10 rounded transition-all opacity-0 group-hover:opacity-100"
                            onClick={() => {
                              setConfirmConfig({
                                open: true,
                                title: 'Delete Tenant',
                                message: `Are you sure you want to delete ${t.name}? This will remove ALL data for this tenant.`,
                                isLoading: false,
                                onConfirm: async () => {
                                  setConfirmConfig(prev => ({ ...prev, isLoading: true }));
                                  try {
                                    await deleteTenant.mutateAsync(t.id);
                                  } finally {
                                    setConfirmConfig(prev => ({ ...prev, open: false, isLoading: false }));
                                  }
                                }
                              });
                            }}
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {paged && paged.totalElements > 0 && (
              <Pagination page={page} totalPages={paged.totalPages} totalElements={paged.totalElements} pageSize={PAGE_SIZE} onPageChange={setPage} />
            )}
          </>
        )}
      </motion.div>

      {/* Create modal */}
      <Modal open={open} onClose={() => { setOpen(false); reset(); }} title="Create Tenant">
        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
          <div>
            <label className="input-label">Name *</label>
            <input {...register('name', { required: 'Required' })} className="input-field" placeholder="My Restaurant Group" />
            {errors.name && <p className="text-xs text-red-400 mt-1">{errors.name.message}</p>}
          </div>
          <div>
            <label className="input-label">Slug *</label>
            <input {...register('slug', { required: 'Required' })} className="input-field" placeholder="my-restaurant" />
            {errors.slug && <p className="text-xs text-red-400 mt-1">{errors.slug.message}</p>}
          </div>
          <div>
            <label className="input-label">Admin Email *</label>
            <input {...register('adminEmail', { required: 'Required' })} type="email" className="input-field" placeholder="admin@restaurant.com" />
            {errors.adminEmail && <p className="text-xs text-red-400 mt-1">{errors.adminEmail.message}</p>}
          </div>
          <div>
            <label className="input-label">Admin Password *</label>
            <input {...register('adminPassword', { required: 'Required', minLength: { value: 6, message: 'Min 6 chars' } })} type="password" className="input-field" placeholder="••••••••" />
            {errors.adminPassword && <p className="text-xs text-red-400 mt-1">{errors.adminPassword.message}</p>}
          </div>
          {create.isError && <ErrorBanner message="Failed to create tenant." />}
          <div className="flex justify-end gap-2 pt-1">
            <button type="button" className="btn-secondary" onClick={() => { setOpen(false); reset(); }}>Cancel</button>
            <button type="submit" className="btn-primary" disabled={isSubmitting}>
              {isSubmitting ? 'Creating…' : 'Create Tenant'}
            </button>
          </div>
        </form>
      </Modal>

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
