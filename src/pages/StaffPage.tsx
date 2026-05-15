import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { motion } from 'framer-motion';
import { Users, Plus, Search, Mail, Phone, Shield, Trash2 } from 'lucide-react';
import { staffService } from '../services/staffService';
import { roleService } from '../services/roleService';
import type { CreateStaffRequest, StaffResponse, UpdateStaffRequest } from '../types';
import Modal from '../components/ui/Modal';
import Pagination from '../components/ui/Pagination';
import { Spinner, EmptyState, ErrorBanner } from '../components/ui/Feedback';
import { getInitials } from '../lib/utils';
import { useAuth } from '../contexts/AuthContext';
import { toast } from 'sonner';
import ConfirmModal from '../components/ui/ConfirmModal';

const PAGE_SIZE = 10;

export default function StaffPage() {
  const { isTenant } = useAuth();
  const [page, setPage] = useState(0);
  const [search, setSearch] = useState('');
  const [open, setOpen] = useState(false);
  const qc = useQueryClient();

  const { data, isLoading, isError } = useQuery({
    queryKey: ['staff', page, search],
    queryFn: () => staffService.getAll({ page, size: PAGE_SIZE }, search),
  });

  const { data: rolesData } = useQuery({
    queryKey: ['roles-all'],
    queryFn: () => roleService.getAll({ page: 0, size: 100 }),
  });

  const addForm = useForm<CreateStaffRequest & { roleId?: string }>();
  const editForm = useForm<UpdateStaffRequest>();
  
  const [editingStaff, setEditingStaff] = useState<StaffResponse | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
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

  const create = useMutation({
    mutationFn: (data: CreateStaffRequest & { roleId?: string }) => {
      const { roleId, ...staffData } = data;
      return staffService.create(staffData, roleId);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['staff'] });
      setOpen(false);
      addForm.reset();
      toast.success('Staff member added');
    },
    onError: () => toast.error('Failed to add staff member'),
  });

  const update = useMutation({
    mutationFn: (data: UpdateStaffRequest) => {
      const payload: UpdateStaffRequest = {
        firstName: data.firstName,
        lastName: data.lastName,
        phoneNumber: data.phoneNumber,
        roleId: data.roleId || undefined
      };
      return staffService.update(editingStaff!.id, payload);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['staff'] });
      setIsEditModalOpen(false);
      setEditingStaff(null);
      editForm.reset();
      toast.success('Staff member updated');
    },
    onError: () => toast.error('Failed to update staff member'),
  });

  const deleteStaff = useMutation({
    mutationFn: staffService.delete,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['staff'] });
      toast.success('Staff member removed');
    },
    onError: () => toast.error('Failed to remove staff member'),
  });

  const handleEdit = (s: StaffResponse) => {
    setEditingStaff(s);
    editForm.setValue('firstName', s.firstName);
    editForm.setValue('lastName', s.lastName);
    editForm.setValue('phoneNumber', s.phoneNumber || '');
    editForm.setValue('roleId', s.roleId);
    setIsEditModalOpen(true);
  };

  const staff: StaffResponse[] = data?.data?.content ?? [];
  const paged = data?.data;
  const roles = rolesData?.data?.content ?? [];

  return (
    <div className="max-w-6xl mx-auto">
      <motion.div initial={{ opacity: 0, y: -12 }} animate={{ opacity: 1, y: 0 }} className="flex items-center justify-between mb-6">
        <div>
          <div className="flex items-center gap-2 mb-0.5">
            <Users size={18} style={{ color: 'var(--color-brand-400)' }} />
            <h1 className="text-xl font-bold text-white">Staff Management</h1>
          </div>
          <p className="text-sm text-slate-500 ml-6">Manage your team members and their roles</p>
        </div>
        {isTenant && (
          <button className="btn-primary" onClick={() => setOpen(true)}>
            <Plus size={15} /> Add Staff
          </button>
        )}
      </motion.div>

      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.08 }} className="glass overflow-hidden">
        <div className="px-4 py-3 border-b border-white/5 flex items-center justify-between gap-4">
          <div className="relative max-w-xs flex-1">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
            <input className="input-field pl-9 py-2 text-sm" placeholder="Search staff…" value={search} onChange={e => setSearch(e.target.value)} />
          </div>
        </div>

        {isLoading && <Spinner />}
        {isError && <ErrorBanner message="Failed to load staff." />}

        {!isLoading && !isError && (
          <>
            <div className="overflow-x-auto">
              <table className="data-table">
                <thead>
                  <tr>
                    <th className="px-6 py-2 text-[10px] font-bold text-slate-400 uppercase tracking-wider">Staff Member</th>
                    <th className="px-6 py-2 text-[10px] font-bold text-slate-400 uppercase tracking-wider">Contact Info</th>
                    <th className="px-6 py-2 text-[10px] font-bold text-slate-400 uppercase tracking-wider">Role</th>
                    {isTenant && <th className="px-6 py-2 text-[10px] font-bold text-slate-400 uppercase tracking-wider">Actions</th>}
                  </tr>
                </thead>
                <tbody>
                  {staff.length === 0 && (
                    <tr><td colSpan={4}>
                      <EmptyState icon={<Users size={22} />} title="No staff found" description="Add team members to your restaurant." />
                    </td></tr>
                  )}
                  {staff.map(s => (
                    <tr key={s.id}>
                      <td>
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold text-white"
                            style={{ background: 'linear-gradient(135deg, var(--color-brand-500), var(--color-brand-700))' }}>
                            {getInitials(s.firstName, s.lastName)}
                          </div>
                          <div>
                            <p className="font-bold text-white text-xs">{s.firstName} {s.lastName}</p>
                            <p className="text-[9px] text-slate-500 uppercase tracking-wider font-medium">ID: {s.id.split('-')[0]}</p>
                          </div>
                        </div>
                      </td>
                      <td>
                        <div className="flex flex-col gap-1">
                          <div className="flex items-center gap-1.5 text-[11px] text-slate-400">
                            <Mail size={10} className="text-slate-600" />
                            {s.email}
                          </div>
                          {s.phoneNumber && (
                            <div className="flex items-center gap-1.5 text-[11px] text-slate-400">
                              <Phone size={10} className="text-slate-600" />
                              {s.phoneNumber}
                            </div>
                          )}
                        </div>
                      </td>
                      <td>
                        {s.roleName ? (
                          <span className="px-2 py-0.5 rounded-full text-[9px] font-bold bg-brand-500/10 text-brand-400 border border-brand-500/20 uppercase tracking-wide">
                            {s.roleName}
                          </span>
                        ) : (
                          <span className="text-[10px] text-slate-600 italic">No role assigned</span>
                        )}
                      </td>
                      {isTenant && (
                        <td>
                          <div className="flex gap-2">
                            <button 
                              className="btn-ghost text-xs py-1 px-2"
                              onClick={() => handleEdit(s)}
                            >
                              Edit
                            </button>
                            <button 
                              className="p-1 text-slate-600 hover:text-rose-500 hover:bg-rose-500/10 rounded transition-all"
                              onClick={() => {
                                setConfirmConfig({
                                  open: true,
                                  title: 'Remove Staff',
                                  message: `Are you sure you want to remove ${s.firstName} from your staff?`,
                                  isLoading: false,
                                  onConfirm: async () => {
                                    setConfirmConfig(prev => ({ ...prev, isLoading: true }));
                                    try {
                                      await deleteStaff.mutateAsync(s.id);
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
                      )}
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

      <Modal open={open} onClose={() => { setOpen(false); addForm.reset(); }} title="Add New Staff Member">
        <form onSubmit={addForm.handleSubmit(d => create.mutate(d))} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="sm:col-span-1">
            <label className="input-label">First Name *</label>
            <input {...addForm.register('firstName', { required: 'Required' })} className="input-field" placeholder="John" />
            {addForm.formState.errors.firstName && <p className="text-xs text-red-400 mt-1">{addForm.formState.errors.firstName.message}</p>}
          </div>
          <div className="sm:col-span-1">
            <label className="input-label">Last Name *</label>
            <input {...addForm.register('lastName', { required: 'Required' })} className="input-field" placeholder="Doe" />
            {addForm.formState.errors.lastName && <p className="text-xs text-red-400 mt-1">{addForm.formState.errors.lastName.message}</p>}
          </div>
          <div className="sm:col-span-2">
            <label className="input-label">Email *</label>
            <input {...addForm.register('email', { required: 'Required' })} type="email" className="input-field" placeholder="john.doe@example.com" />
            {addForm.formState.errors.email && <p className="text-xs text-red-400 mt-1">{addForm.formState.errors.email.message}</p>}
          </div>
          <div className="sm:col-span-2">
            <label className="input-label">Password *</label>
            <input {...addForm.register('password', { required: 'Required', minLength: { value: 6, message: 'Min 6 chars' } })} type="password" className="input-field" placeholder="••••••••" />
            {addForm.formState.errors.password && <p className="text-xs text-red-400 mt-1">{addForm.formState.errors.password.message}</p>}
          </div>
          <div className="sm:col-span-1">
            <label className="input-label">Phone Number</label>
            <input {...addForm.register('phoneNumber')} className="input-field" placeholder="+1234567890" />
          </div>
          <div className="sm:col-span-1">
            <label className="input-label">Role</label>
            <div className="relative">
              <Shield size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
              <select {...addForm.register('roleId')} className="input-field pl-9 appearance-none bg-surface-800">
                <option value="">Select a role</option>
                {roles.map(r => (
                  <option key={r.id} value={r.id}>{r.name}</option>
                ))}
              </select>
            </div>
          </div>
          
          <div className="sm:col-span-2 flex justify-end gap-2 pt-2 border-t border-white/5 mt-2">
            <button type="button" className="btn-secondary" onClick={() => { setOpen(false); addForm.reset(); }}>Cancel</button>
            <button type="submit" className="btn-primary" disabled={create.isPending}>
              {create.isPending ? 'Adding…' : 'Add Staff'}
            </button>
          </div>
        </form>
      </Modal>

      <Modal open={isEditModalOpen} onClose={() => { setIsEditModalOpen(false); editForm.reset(); }} title="Edit Staff Member">
        <form onSubmit={editForm.handleSubmit(d => update.mutate(d))} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="sm:col-span-1">
            <label className="input-label">First Name *</label>
            <input {...editForm.register('firstName', { required: 'Required' })} className="input-field" placeholder="John" />
            {editForm.formState.errors.firstName && <p className="text-xs text-red-400 mt-1">{editForm.formState.errors.firstName.message}</p>}
          </div>
          <div className="sm:col-span-1">
            <label className="input-label">Last Name *</label>
            <input {...editForm.register('lastName', { required: 'Required' })} className="input-field" placeholder="Doe" />
            {editForm.formState.errors.lastName && <p className="text-xs text-red-400 mt-1">{editForm.formState.errors.lastName.message}</p>}
          </div>
          <div className="sm:col-span-2">
            <label className="input-label">Phone Number</label>
            <input {...editForm.register('phoneNumber')} className="input-field" placeholder="+1234567890" />
          </div>
          <div className="sm:col-span-2">
            <label className="input-label">Role</label>
            <div className="relative">
              <Shield size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
              <select {...editForm.register('roleId')} className="input-field pl-9 appearance-none bg-surface-800">
                <option value="">Select a role</option>
                {roles.map(r => (
                  <option key={r.id} value={r.id}>{r.name}</option>
                ))}
              </select>
            </div>
          </div>
          
          <div className="sm:col-span-2 flex justify-end gap-2 pt-2 border-t border-white/5 mt-2">
            <button type="button" className="btn-secondary" onClick={() => { setIsEditModalOpen(false); editForm.reset(); }}>Cancel</button>
            <button type="submit" className="btn-primary" disabled={update.isPending}>
              {update.isPending ? 'Saving…' : 'Save Changes'}
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
