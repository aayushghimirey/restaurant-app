import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { motion } from 'framer-motion';
import { Building2, Plus, Search, Trash2, Pencil } from 'lucide-react';
import { tenantService } from '../services/tenantService';
import type { CreateTenantRequest, UpdateTenantRequest, TenantResponse } from '../types';
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
  if (s === 'suspended') return <span className="badge-warning badge">{status}</span>;
  return <span className="badge-info badge">{status}</span>;
}

export default function TenantsPage() {
  const [page, setPage] = useState(0);
  const [search, setSearch] = useState('');
  const [open, setOpen] = useState(false);
  const [editTenant, setEditTenant] = useState<TenantResponse | null>(null);
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

  const createForm = useForm<CreateTenantRequest>();
  const editForm = useForm<UpdateTenantRequest>();

  const create = useMutation({
    mutationFn: tenantService.create,
    onSuccess: () => { 
      qc.invalidateQueries({ queryKey: ['tenants'] }); 
      qc.invalidateQueries({ queryKey: ['tenant-stats'] }); 
      setOpen(false); 
      createForm.reset(); 
      toast.success('Tenant created successfully');
    },
    onError: (err: any) => {
      const message = err?.response?.data?.message || 'Failed to create tenant';
      toast.error(message);
    },
  });

  const update = useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateTenantRequest }) => tenantService.update(id, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['tenants'] });
      qc.invalidateQueries({ queryKey: ['tenant-stats'] });
      setEditTenant(null);
      editForm.reset();
      toast.success('Tenant updated successfully');
    },
    onError: (err: any) => {
      const message = err?.response?.data?.message || 'Failed to update tenant';
      toast.error(message);
    },
  });
  
  const deleteTenant = useMutation({
    mutationFn: tenantService.delete,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['tenants'] });
      qc.invalidateQueries({ queryKey: ['tenant-stats'] });
      toast.success('Tenant removed');
    },
    onError: (err: any) => {
      const message = err?.response?.data?.message || 'Failed to remove tenant';
      toast.error(message);
    },
  });

  const tenants: TenantResponse[] = data?.data?.content ?? [];
  const paged = data?.data;
  const filtered = search
    ? tenants.filter(t => t.name.toLowerCase().includes(search.toLowerCase()) || t.slug.toLowerCase().includes(search.toLowerCase()))
    : tenants;

  const onCreateSubmit = (d: CreateTenantRequest) => create.mutate(d);
  const onEditSubmit = (d: UpdateTenantRequest) => {
    if (editTenant) {
      update.mutate({ id: editTenant.id, data: d });
    }
  };

  const { register: registerCreate, handleSubmit: handleSubmitCreate, reset: resetCreate, formState: { isSubmitting: isCreating, errors: createErrors } } = createForm;
  const { register: registerEdit, handleSubmit: handleSubmitEdit, reset: resetEdit, formState: { isSubmitting: isUpdating, errors: editErrors } } = editForm;


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
                          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-all">
                            <button 
                              className="p-1.5 text-slate-400 hover:text-brand-400 hover:bg-brand-500/10 rounded transition-all"
                              onClick={() => {
                                setEditTenant(t);
                                editForm.setValue('name', t.name);
                                editForm.setValue('status', t.status);
                              }}
                            >
                              <Pencil size={14} />
                            </button>
                            <button 
                              className="p-1.5 text-slate-400 hover:text-rose-500 hover:bg-rose-500/10 rounded transition-all"
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
      <Modal open={open} onClose={() => { setOpen(false); resetCreate(); }} title="Create Tenant">
        <form onSubmit={handleSubmitCreate(onCreateSubmit)} className="flex flex-col gap-4">
          <div>
            <label className="input-label">Name *</label>
            <input {...registerCreate('name', { required: 'Required' })} className="input-field" placeholder="My Restaurant Group" />
            {createErrors.name && <p className="text-xs text-red-400 mt-1">{createErrors.name.message}</p>}
          </div>
          <div>
            <label className="input-label">Slug *</label>
            <input {...registerCreate('slug', { required: 'Required' })} className="input-field" placeholder="my-restaurant" />
            {createErrors.slug && <p className="text-xs text-red-400 mt-1">{createErrors.slug.message}</p>}
          </div>
          <div>
            <label className="input-label">Admin Email *</label>
            <input {...registerCreate('adminEmail', { required: 'Required' })} type="email" className="input-field" placeholder="admin@restaurant.com" />
            {createErrors.adminEmail && <p className="text-xs text-red-400 mt-1">{createErrors.adminEmail.message}</p>}
          </div>
          <div>
            <label className="input-label">Admin Password *</label>
            <input {...registerCreate('adminPassword', { required: 'Required', minLength: { value: 6, message: 'Min 6 chars' } })} type="password" className="input-field" placeholder="••••••••" />
            {createErrors.adminPassword && <p className="text-xs text-red-400 mt-1">{createErrors.adminPassword.message}</p>}
          </div>
          {create.isError && <ErrorBanner message="Failed to create tenant." />}
          <div className="flex justify-end gap-2 pt-1">
            <button type="button" className="btn-secondary" onClick={() => { setOpen(false); resetCreate(); }}>Cancel</button>
            <button type="submit" className="btn-primary" disabled={isCreating}>
              {isCreating ? 'Creating…' : 'Create Tenant'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Edit modal */}
      <Modal open={!!editTenant} onClose={() => { setEditTenant(null); resetEdit(); }} title="Edit Tenant">
        <form onSubmit={handleSubmitEdit(onEditSubmit)} className="flex flex-col gap-4">
          <div>
            <label className="input-label">Name *</label>
            <input {...registerEdit('name', { required: 'Required' })} className="input-field" placeholder="My Restaurant Group" />
            {editErrors.name && <p className="text-xs text-red-400 mt-1">{editErrors.name.message}</p>}
          </div>
          <div>
            <label className="input-label">Status *</label>
            <select {...registerEdit('status', { required: 'Required' })} className="input-field">
              <option value="ACTIVE">ACTIVE</option>
              <option value="INACTIVE">INACTIVE</option>
              <option value="SUSPENDED">SUSPENDED</option>
            </select>
            {editErrors.status && <p className="text-xs text-red-400 mt-1">{editErrors.status.message}</p>}
          </div>
          {update.isError && <ErrorBanner message="Failed to update tenant." />}
          <div className="flex justify-end gap-2 pt-1">
            <button type="button" className="btn-secondary" onClick={() => { setEditTenant(null); resetEdit(); }}>Cancel</button>
            <button type="submit" className="btn-primary" disabled={isUpdating}>
              {isUpdating ? 'Saving…' : 'Save Changes'}
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

