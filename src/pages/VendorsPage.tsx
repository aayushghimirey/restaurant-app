import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { motion } from 'framer-motion';
import { Truck, Plus, Search, MapPin, Phone, Hash } from 'lucide-react';
import { vendorService } from '../services/vendorService';
import type { VendorResponse, CreateVendorRequest } from '../types';
import Modal from '../components/ui/Modal';
import Pagination from '../components/ui/Pagination';
import { Spinner, EmptyState, ErrorBanner } from '../components/ui/Feedback';
import { toast } from 'sonner';

const PAGE_SIZE = 10;

export default function VendorsPage() {
  const [page, setPage] = useState(0);
  const [search, setSearch] = useState('');
  const [open, setOpen] = useState(false);
  const qc = useQueryClient();

  const { data, isLoading, isError } = useQuery({
    queryKey: ['vendors', search, page],
    queryFn: () => vendorService.getAll(search || undefined, page, PAGE_SIZE),
  });

  const { register, handleSubmit, reset, formState: { isSubmitting, errors } } = useForm<CreateVendorRequest>();

  const create = useMutation({
    mutationFn: (data: CreateVendorRequest) => vendorService.create(data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['vendors'] });
      setOpen(false);
      reset();
      toast.success('Vendor created successfully');
    },
    onError: () => toast.error('Failed to create vendor'),
  });

  const vendors = data?.data?.content ?? [];
  const paged = data?.data;

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      <motion.div initial={{ opacity: 0, y: -12 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-0.5">
            <Truck size={24} className="text-brand-400" />
            <h1 className="text-2xl font-bold text-white">Vendors</h1>
          </div>
          <p className="text-sm text-slate-500 ml-8">Manage suppliers and distribution contacts.</p>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={16} />
            <input
              type="text"
              placeholder="Search vendors..."
              value={search}
              onChange={e => { setSearch(e.target.value); setPage(0); }}
              className="w-full bg-slate-800/50 border border-white/10 rounded-xl pl-9 pr-4 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-brand-500/50 transition-all"
            />
          </div>
          <button className="btn-primary flex items-center justify-center whitespace-nowrap" onClick={() => setOpen(true)}>
            <Plus size={16} className="mr-2" /> Add Vendor
          </button>
        </div>
      </motion.div>

      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.08 }}>
        {isLoading && <div className="p-10"><Spinner /></div>}
        {isError && <ErrorBanner message="Failed to load vendors." />}

        {!isLoading && !isError && (
          <>
            {vendors.length === 0 ? (
              <div className="p-10 glass rounded-xl">
                <EmptyState icon={<Truck size={22} />} title="No vendors found" description={search ? "Try adjusting your search query." : "Add your first vendor to get started."} />
              </div>
            ) : (
              <div className="glass rounded-xl overflow-hidden border border-white/5 shadow-2xl">
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse whitespace-nowrap">
                    <thead>
                      <tr className="bg-slate-800/80 border-b border-white/10">
                        <th className="px-6 py-4 text-[11px] uppercase tracking-wider text-slate-400 font-semibold">Vendor Details</th>
                        <th className="px-6 py-4 text-[11px] uppercase tracking-wider text-slate-400 font-semibold">Contact</th>
                        <th className="px-6 py-4 text-[11px] uppercase tracking-wider text-slate-400 font-semibold">Address</th>
                        <th className="px-6 py-4 text-[11px] uppercase tracking-wider text-slate-400 font-semibold">PAN Number</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                      {vendors.map((vendor: VendorResponse, idx: number) => (
                        <motion.tr 
                          key={vendor.id}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: idx * 0.05 }}
                          className="hover:bg-white/[0.02] transition-colors group"
                        >
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 rounded-full bg-brand-500/10 flex items-center justify-center border border-brand-500/20 group-hover:border-brand-500/40 transition-colors shadow-lg">
                                <Truck size={18} className="text-brand-400" />
                              </div>
                              <span className="font-medium text-slate-200 group-hover:text-white transition-colors">{vendor.name}</span>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-2 text-slate-300">
                              <Phone size={14} className="text-slate-500" />
                              <span className="text-sm">{vendor.contactNumber}</span>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-2 text-slate-300">
                              <MapPin size={14} className="text-slate-500" />
                              <span className="text-sm truncate max-w-[200px]" title={vendor.address}>{vendor.address}</span>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-brand-500/10 border border-brand-500/20 text-brand-300 font-mono text-sm shadow-inner">
                              <Hash size={12} className="opacity-70" />
                              {vendor.panNumber}
                            </div>
                          </td>
                        </motion.tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
            
            {paged && paged.totalElements > 0 && (
              <div className="mt-6 glass rounded-xl p-4">
                <Pagination page={page} totalPages={paged.totalPages} totalElements={paged.totalElements} pageSize={PAGE_SIZE} onPageChange={setPage} />
              </div>
            )}
          </>
        )}
      </motion.div>

      <Modal open={open} onClose={() => { setOpen(false); reset(); }} title="Add New Vendor">
        <form onSubmit={handleSubmit(d => create.mutate(d))} className="space-y-4">
          <div>
            <label className="input-label">Vendor Name *</label>
            <input
              {...register('name', { required: 'Name is required' })}
              className="input-field"
              placeholder="e.g. Fresh Farms Ltd."
            />
            {errors.name && <p className="text-xs text-red-400 mt-1">{errors.name.message}</p>}
          </div>
          <div>
            <label className="input-label">Address *</label>
            <input
              {...register('address', { required: 'Address is required' })}
              className="input-field"
              placeholder="123 Market St, City"
            />
            {errors.address && <p className="text-xs text-red-400 mt-1">{errors.address.message}</p>}
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="input-label">Contact Number *</label>
              <input
                {...register('contactNumber', { required: 'Contact number is required' })}
                className="input-field"
                placeholder="+1 234 567 890"
              />
              {errors.contactNumber && <p className="text-xs text-red-400 mt-1">{errors.contactNumber.message}</p>}
            </div>
            <div>
              <label className="input-label">PAN Number *</label>
              <input
                {...register('panNumber', { required: 'PAN number is required' })}
                className="input-field"
                placeholder="ABCDE1234F"
              />
              {errors.panNumber && <p className="text-xs text-red-400 mt-1">{errors.panNumber.message}</p>}
            </div>
          </div>
          
          <div className="flex justify-end gap-2 pt-4 border-t border-white/5 mt-6">
            <button type="button" className="btn-secondary" onClick={() => { setOpen(false); reset(); }}>Cancel</button>
            <button type="submit" className="btn-primary" disabled={create.isPending}>
              {create.isPending ? 'Saving…' : 'Save Vendor'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
