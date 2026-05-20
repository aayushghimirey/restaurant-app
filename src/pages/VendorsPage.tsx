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
import { useSearchParams } from 'react-router-dom';

const PAGE_SIZE = 10;

export default function VendorsPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const search = searchParams.get('q') || '';
  const page = parseInt(searchParams.get('page') || '0', 10);
  const setPage = (p: number) => {
    searchParams.set('page', p.toString());
    setSearchParams(searchParams);
  };
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
      reset();
      toast.success('Vendor created successfully');
    },
    onError: () => toast.error('Failed to create vendor'),
  });

  const vendors = data?.data?.content ?? [];
  const paged = data?.data;

  return (
    <div className="space-y-6">
      <motion.div initial={{ opacity: 0, y: -12 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-0.5">
            <Truck size={24} className="text-brand-400" />
            <h1 className="text-2xl font-bold text-white">Vendors</h1>
          </div>
          <p className="text-sm text-slate-500 ml-8">Manage suppliers and distribution contacts.</p>
        </div>
        
        <button className="btn-primary flex items-center justify-center whitespace-nowrap" onClick={() => setOpen(true)}>
          <Plus size={16} className="mr-2" /> Add Vendor
        </button>
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
                        <th className="px-6 py-3 text-[10px] uppercase tracking-wider text-slate-400 font-bold">Vendor Details</th>
                        <th className="px-6 py-3 text-[10px] uppercase tracking-wider text-slate-400 font-bold">Contact</th>
                        <th className="px-6 py-3 text-[10px] uppercase tracking-wider text-slate-400 font-bold">Address</th>
                        <th className="px-6 py-3 text-[10px] uppercase tracking-wider text-slate-400 font-bold">PAN Number</th>
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
                          <td className="px-6 py-2.5">
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 rounded-full bg-brand-500/10 flex items-center justify-center border border-brand-500/20 group-hover:border-brand-500/40 transition-colors shadow-lg">
                                <Truck size={14} className="text-brand-400" />
                              </div>
                              <span className="text-xs font-medium text-slate-200 group-hover:text-white transition-colors">{vendor.name}</span>
                            </div>
                          </td>
                          <td className="px-6 py-2.5">
                            <div className="flex items-center gap-2 text-slate-300">
                              <Phone size={12} className="text-slate-500" />
                              <span className="text-[11px]">{vendor.contactNumber}</span>
                            </div>
                          </td>
                          <td className="px-6 py-2.5">
                            <div className="flex items-center gap-2 text-slate-300">
                              <MapPin size={12} className="text-slate-500" />
                              <span className="text-[11px] truncate max-w-[200px]" title={vendor.address}>{vendor.address}</span>
                            </div>
                          </td>
                          <td className="px-6 py-2.5">
                            <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-brand-500/10 border border-brand-500/20 text-brand-300 font-mono text-[11px] shadow-inner">
                              <Hash size={10} className="opacity-70" />
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
