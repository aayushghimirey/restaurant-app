import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import {
  Building2, Mail, Phone, MapPin, FileText,
  Loader2, Save, CheckCircle2, AlertCircle
} from 'lucide-react';
import { businessDetailService } from '../services/businessDetailService';
import type { BusinessDetailRequest } from '../types';
import { toast } from 'sonner';
import { useAuth } from '../contexts/AuthContext';

const inputCls =
  'w-full bg-slate-900 border border-white/[0.08] rounded-xl px-4 py-3 text-sm text-white placeholder:text-slate-600 focus:outline-none focus:border-brand-500/60 focus:bg-slate-800 transition-all';

const labelCls = 'text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5 flex items-center gap-1.5';

export default function AccountSettingsPage() {
  const qc = useQueryClient();
  const { isTenant } = useAuth(); // true = TENANT_ADMIN, false = STAFF

  const { data, isLoading, isError } = useQuery({
    queryKey: ['business-detail'],
    queryFn: businessDetailService.get,
    retry: false,
  });

  const detail = data?.data;

  const [form, setForm] = useState<BusinessDetailRequest>({
    businessName: '',
    address: '',
    businessEmail: '',
    businessPhone: '',
    panNumber: '',
  });

  // Sync form when data loads
  const [synced, setSynced] = useState(false);
  if (detail && !synced) {
    setForm({
      businessName: detail.businessName ?? '',
      address: detail.address ?? '',
      businessEmail: detail.businessEmail ?? '',
      businessPhone: detail.businessPhone ?? '',
      panNumber: detail.panNumber ?? '',
    });
    setSynced(true);
  }

  const mutation = useMutation({
    mutationFn: () => businessDetailService.saveOrUpdate(form),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['business-detail'] });
      setSynced(false);
      toast.success('Business details saved successfully!');
    },
    onError: () => toast.error('Failed to save business details'),
  });

  const handleChange = (field: keyof BusinessDetailRequest, value: string) => {
    if (!isTenant) return; // safety guard
    setForm(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isTenant) return;
    if (!form.businessName.trim()) {
      toast.error('Business name is required');
      return;
    }
    mutation.mutate();
  };

  // Styles differ between editable and read-only
  const fieldCls = isTenant
    ? inputCls
    : 'w-full bg-slate-950/60 border border-white/[0.04] rounded-xl px-4 py-3 text-sm text-slate-300 cursor-default select-none';

  return (
    <div className="max-w-3xl mx-auto">
      {/* Page Header */}
      <motion.div
        initial={{ opacity: 0, y: -12 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-brand-500/10 border border-brand-500/20 flex items-center justify-center text-brand-400">
            <Building2 size={22} />
          </div>
          <div>
            <h1 className="text-xl font-bold text-white">Account Settings</h1>
            <p className="text-xs text-slate-500 mt-0.5 uppercase font-bold tracking-widest">
              Business Profile &amp; Identity
            </p>
          </div>
          {/* Read-only badge for staff */}
          {!isTenant && (
            <span className="ml-auto px-3 py-1 bg-slate-800 border border-white/5 rounded-lg text-[10px] font-black text-slate-400 uppercase tracking-widest">
              View Only
            </span>
          )}
        </div>
      </motion.div>

      {isLoading ? (
        <div className="flex items-center justify-center py-20 text-slate-500 gap-3">
          <Loader2 className="animate-spin" size={24} />
          <span className="text-sm font-medium">Loading business details…</span>
        </div>
      ) : (
        <motion.form
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
          onSubmit={handleSubmit}
          className="space-y-6"
        >
          {/* First-time setup notice — only shown to admins */}
          {isError && !detail && isTenant && (
            <div className="flex items-start gap-3 p-4 bg-amber-500/10 border border-amber-500/20 rounded-2xl text-amber-400">
              <AlertCircle size={16} className="shrink-0 mt-0.5" />
              <p className="text-xs font-semibold leading-relaxed">
                No business profile found. Fill in the form below to configure your business
                identity — this information appears on invoices and receipts.
              </p>
            </div>
          )}

          {/* Not configured yet, visible to staff */}
          {isError && !detail && !isTenant && (
            <div className="flex items-start gap-3 p-4 bg-slate-800/60 border border-white/5 rounded-2xl text-slate-400">
              <AlertCircle size={16} className="shrink-0 mt-0.5" />
              <p className="text-xs font-semibold leading-relaxed">
                Business details have not been configured yet. Please ask your administrator to set them up.
              </p>
            </div>
          )}

          {/* Card: Business Identity */}
          <div className="bg-slate-900/50 border border-white/[0.07] rounded-2xl p-6 space-y-5">
            <div className="flex items-center gap-2 border-b border-white/5 pb-4">
              <Building2 size={14} className="text-brand-400" />
              <span className="text-xs font-black text-white uppercase tracking-widest">Business Identity</span>
            </div>

            <div className="grid grid-cols-1 gap-5">
              {/* Business Name */}
              <div>
                <label className={labelCls}>
                  <Building2 size={11} className="text-brand-400" />
                  Business Name {isTenant && <span className="text-rose-400">*</span>}
                </label>
                <input
                  type="text"
                  placeholder={isTenant ? 'e.g. Sunrise Kitchen Pvt. Ltd.' : '—'}
                  value={form.businessName}
                  onChange={e => handleChange('businessName', e.target.value)}
                  className={fieldCls}
                  readOnly={!isTenant}
                  required={isTenant}
                />
              </div>

              {/* PAN Number */}
              <div>
                <label className={labelCls}>
                  <FileText size={11} className="text-brand-400" />
                  PAN Number
                </label>
                <input
                  type="text"
                  placeholder={isTenant ? 'e.g. 123456789' : '—'}
                  value={form.panNumber}
                  onChange={e => handleChange('panNumber', e.target.value)}
                  className={fieldCls}
                  readOnly={!isTenant}
                  maxLength={20}
                />
              </div>

              {/* Address */}
              <div>
                <label className={labelCls}>
                  <MapPin size={11} className="text-brand-400" />
                  Address
                </label>
                <input
                  type="text"
                  placeholder={isTenant ? 'e.g. Thamel, Kathmandu' : '—'}
                  value={form.address}
                  onChange={e => handleChange('address', e.target.value)}
                  className={fieldCls}
                  readOnly={!isTenant}
                />
              </div>
            </div>
          </div>

          {/* Card: Contact Details */}
          <div className="bg-slate-900/50 border border-white/[0.07] rounded-2xl p-6 space-y-5">
            <div className="flex items-center gap-2 border-b border-white/5 pb-4">
              <Mail size={14} className="text-brand-400" />
              <span className="text-xs font-black text-white uppercase tracking-widest">Contact Details</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              {/* Email */}
              <div>
                <label className={labelCls}>
                  <Mail size={11} className="text-brand-400" />
                  Business Email
                </label>
                <input
                  type="email"
                  placeholder={isTenant ? 'e.g. info@myrestaurant.com' : '—'}
                  value={form.businessEmail}
                  onChange={e => handleChange('businessEmail', e.target.value)}
                  className={fieldCls}
                  readOnly={!isTenant}
                />
              </div>

              {/* Phone */}
              <div>
                <label className={labelCls}>
                  <Phone size={11} className="text-brand-400" />
                  Business Phone
                </label>
                <input
                  type="tel"
                  placeholder={isTenant ? 'e.g. 01-4123456' : '—'}
                  value={form.businessPhone}
                  onChange={e => handleChange('businessPhone', e.target.value)}
                  className={fieldCls}
                  readOnly={!isTenant}
                  maxLength={20}
                />
              </div>
            </div>
          </div>

          {/* Receipt Preview — visible to everyone */}
          {form.businessName && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              className="bg-slate-900/50 border border-white/[0.07] rounded-2xl p-6"
            >
              <div className="flex items-center gap-2 border-b border-white/5 pb-4 mb-5">
                <CheckCircle2 size={14} className="text-emerald-400" />
                <span className="text-xs font-black text-white uppercase tracking-widest">Receipt Preview</span>
                <span className="ml-auto text-[9px] text-slate-500 uppercase tracking-widest font-bold">
                  How it appears on bills
                </span>
              </div>

              <div className="bg-white rounded-xl p-5 font-mono text-slate-900 text-center space-y-1 max-w-xs mx-auto shadow-inner border border-slate-200">
                <p className="font-black text-sm uppercase tracking-widest">{form.businessName}</p>
                {form.address && <p className="text-[10px] text-slate-500">{form.address}</p>}
                {form.businessPhone && <p className="text-[10px] text-slate-500">Tel: {form.businessPhone}</p>}
                {form.businessEmail && <p className="text-[10px] text-slate-500">{form.businessEmail}</p>}
                {form.panNumber && (
                  <p className="text-[10px] text-slate-400 border-t border-dashed border-slate-300 pt-1 mt-1">
                    PAN: {form.panNumber}
                  </p>
                )}
              </div>
            </motion.div>
          )}

          {/* Save Button — only for Tenant Admin */}
          {isTenant && (
            <div className="flex justify-end pb-8">
              <button
                type="submit"
                disabled={mutation.isPending}
                className="flex items-center gap-2 px-6 py-3 bg-brand-500 hover:bg-brand-400 disabled:bg-slate-700 disabled:text-slate-500 text-white rounded-xl text-sm font-black uppercase tracking-wider transition-all shadow-lg shadow-brand-500/20 hover:shadow-brand-500/40"
              >
                {mutation.isPending ? (
                  <>
                    <Loader2 size={16} className="animate-spin" />
                    Saving…
                  </>
                ) : (
                  <>
                    <Save size={16} />
                    Save Business Details
                  </>
                )}
              </button>
            </div>
          )}
        </motion.form>
      )}
    </div>
  );
}
