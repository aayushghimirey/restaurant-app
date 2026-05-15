import React, { useState } from 'react';
import Modal from '../ui/Modal';
import { tableService } from '../../services/tableService';
import type { CreateTableRequest } from '../../types';
import { Layout, Users, MapPin, Loader2, Plus } from 'lucide-react';
import toast from 'react-hot-toast';

interface CreateTableModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export default function CreateTableModal({ isOpen, onClose, onSuccess }: CreateTableModalProps) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<CreateTableRequest>({
    name: '',
    capacity: 4,
    location: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await tableService.createTable(formData);
      if (res.success) {
        toast.success('Table created successfully');
        onSuccess();
        onClose();
        setFormData({ name: '', capacity: 4, location: '' });
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to create table');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal open={isOpen} onClose={onClose} title="Add New Table">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-bold text-slate-400 mb-1">Table Name</label>
          <div className="relative">
            <Layout className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
            <input
              required
              type="text"
              placeholder="e.g. Table 1, VIP 2"
              className="w-full bg-slate-800/50 border border-white/10 rounded-xl pl-10 pr-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-brand-500/50 transition-all"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-bold text-slate-400 mb-1">Capacity</label>
            <div className="relative">
              <Users className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
              <input
                required
                type="number"
                min="1"
                className="w-full bg-slate-800/50 border border-white/10 rounded-xl pl-10 pr-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-brand-500/50 transition-all"
                value={formData.capacity}
                onChange={(e) => setFormData({ ...formData, capacity: parseInt(e.target.value) })}
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-bold text-slate-400 mb-1">Location</label>
            <div className="relative">
              <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
              <input
                required
                type="text"
                placeholder="e.g. Main Hall, Terrace"
                className="w-full bg-slate-800/50 border border-white/10 rounded-xl pl-10 pr-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-brand-500/50 transition-all"
                value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
              />
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-3 mt-6">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-slate-400 hover:text-white transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className="btn-primary flex items-center gap-2"
          >
            {loading ? <Loader2 className="animate-spin" size={18} /> : <Plus size={18} />}
            Create Table
          </button>
        </div>
      </form>
    </Modal>
  );
}
