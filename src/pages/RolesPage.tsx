import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { motion } from 'framer-motion';
import { Shield, Plus, Search } from 'lucide-react';
import { roleService } from '../services/roleService';
import type { CreateRoleRequest, RoleResponse } from '../types';
import Modal from '../components/ui/Modal';
import Pagination from '../components/ui/Pagination';
import { Spinner, EmptyState, ErrorBanner } from '../components/ui/Feedback';

const PAGE_SIZE = 10;

export default function RolesPage() {
  const [page, setPage] = useState(0);
  const [search, setSearch] = useState('');
  const [open, setOpen] = useState(false);
  const qc = useQueryClient();

  const { data, isLoading, isError } = useQuery({
    queryKey: ['roles', page],
    queryFn: () => roleService.getAll({ page, size: PAGE_SIZE }),
  });

  const { register, handleSubmit, reset, formState: { isSubmitting, errors } } = useForm<CreateRoleRequest>();

  const create = useMutation({
    mutationFn: roleService.create,
    onSuccess: () => { 
      qc.invalidateQueries({ queryKey: ['roles'] }); 
      setOpen(false); 
      reset(); 
    },
  });

  const roles: RoleResponse[] = data?.data?.content ?? [];
  const paged = data?.data;
  const filtered = search
    ? roles.filter(r => r.name.toLowerCase().includes(search.toLowerCase()))
    : roles;

  return (
    <div className="max-w-6xl mx-auto">
      <motion.div initial={{ opacity: 0, y: -12 }} animate={{ opacity: 1, y: 0 }} className="flex items-center justify-between mb-6">
        <div>
          <div className="flex items-center gap-2 mb-0.5">
            <Shield size={18} style={{ color: 'var(--color-brand-400)' }} />
            <h1 className="text-xl font-bold text-white">Roles</h1>
          </div>
          <p className="text-sm text-slate-500 ml-6">Permission sets for your team</p>
        </div>
        <button className="btn-primary" onClick={() => setOpen(true)}>
          <Plus size={15} /> New Role
        </button>
      </motion.div>

      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.08 }} className="glass overflow-hidden">
        <div className="px-4 py-3 border-b border-white/5">
          <div className="relative max-w-xs">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
            <input className="input-field pl-9 py-2 text-sm" placeholder="Search roles…" value={search} onChange={e => setSearch(e.target.value)} />
          </div>
        </div>

        {isLoading && <Spinner />}
        {isError && <ErrorBanner message="Failed to load roles." />}

        {!isLoading && !isError && (
          <>
            <div className="overflow-x-auto">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Role Name</th>
                    <th>Description</th>
                    <th>Scope</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.length === 0 && (
                    <tr><td colSpan={3}>
                      <EmptyState icon={<Shield size={22} />} title="No roles yet" description="Create roles to assign to staff members." />
                    </td></tr>
                  )}
                  {filtered.map(r => (
                    <tr key={r.id}>
                      <td>
                        <div className="flex items-center gap-2.5">
                          <div className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0"
                            style={{ background: 'rgba(96,165,250,0.12)', border: '1px solid rgba(96,165,250,0.2)' }}>
                            <Shield size={13} style={{ color: '#60a5fa' }} />
                          </div>
                          <span className="font-medium text-white text-sm">{r.name}</span>
                        </div>
                      </td>
                      <td>{r.description ? <span className="text-slate-400">{r.description}</span> : <span className="text-slate-600 text-xs">No description</span>}</td>
                      <td>
                        {r.branchId
                          ? <span className="badge-info badge">Branch</span>
                          : <span className="badge-warning badge">Tenant</span>
                        }
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

      <Modal open={open} onClose={() => { setOpen(false); reset(); }} title="Create Role">
        <form onSubmit={handleSubmit(d => create.mutate(d))} className="flex flex-col gap-4">
          <div>
            <label className="input-label">Role Name *</label>
            <input {...register('name', { required: 'Required' })} className="input-field" placeholder="e.g. Manager, Cashier" />
            {errors.name && <p className="text-xs text-red-400 mt-1">{errors.name.message}</p>}
          </div>
          <div>
            <label className="input-label">Description</label>
            <textarea {...register('description')} className="input-field resize-none" rows={3} placeholder="What does this role do?" />
          </div>
          {create.isError && <ErrorBanner message="Failed to create role." />}
          <div className="flex justify-end gap-2 pt-1">
            <button type="button" className="btn-secondary" onClick={() => { setOpen(false); reset(); }}>Cancel</button>
            <button type="submit" className="btn-primary" disabled={isSubmitting}>
              {isSubmitting ? 'Creating…' : 'Create Role'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
