import { useState } from 'react';
import { motion } from 'framer-motion';
import { Receipt, Plus, Calendar, Clock, MapPin } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { orderService } from '../services/orderService';
import type { OrderResponse } from '../types';
import Pagination from '../components/ui/Pagination';
import { Spinner, EmptyState, ErrorBanner } from '../components/ui/Feedback';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import ConfirmModal from '../components/ui/ConfirmModal';
import { XCircle as CancelIcon } from 'lucide-react';

import { useSearchParams } from 'react-router-dom';
import { Filter, Layers, CheckCircle2, History, Edit3, Eye } from 'lucide-react';
import Modal from '../components/ui/Modal';

const PAGE_SIZE = 12;

export default function OrdersPage() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const activeStatuses = searchParams.getAll('orderStatuses');
  const page = parseInt(searchParams.get('page') || '0', 10);

  // If no status in URL, we show PENDING and SERVED by default
  const effectiveStatuses = activeStatuses.length > 0 ? activeStatuses : ['PENDING', 'SERVED'];
  
  const { data, isLoading, isError } = useQuery({
    queryKey: ['orders', page, effectiveStatuses],
    queryFn: () => orderService.getAll(
      { page, size: PAGE_SIZE }, 
      effectiveStatuses.includes('ALL') ? undefined : effectiveStatuses
    ),
  });

  const orders = data?.data?.content ?? [];
  const paged = data?.data;

  const setPage = (p: number) => {
    searchParams.set('page', p.toString());
    setSearchParams(searchParams);
  };

  const handleStatusToggle = (mode: 'ACTIVE' | 'ALL') => {
    searchParams.delete('orderStatuses');
    searchParams.delete('page');
    if (mode === 'ALL') {
      searchParams.append('orderStatuses', 'ALL');
    } else {
      // Default behavior (no params) is PENDING+SERVED
      searchParams.append('orderStatuses', 'PENDING');
      searchParams.append('orderStatuses', 'SERVED');
    }
    setSearchParams(searchParams);
  };

  const currentMode = (activeStatuses.length === 1 && activeStatuses[0] === 'ALL') ? 'ALL' : 'ACTIVE';
  const qc = useQueryClient();

  const [confirmConfig, setConfirmConfig] = useState<{
    open: boolean;
    orderId: string;
  }>({
    open: false,
    orderId: '',
  });

  const [selectedOrder, setSelectedOrder] = useState<OrderResponse | null>(null);

  const cancelMutation = useMutation({
    mutationFn: (id: string) => orderService.cancel(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['orders'] });
      toast.success('Order cancelled successfully');
      setConfirmConfig({ open: false, orderId: '' });
    },
    onError: () => {
      toast.error('Failed to cancel order');
    }
  });

  return (
    <div className="space-y-6">
      <motion.div initial={{ opacity: 0, y: -12 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-0.5">
            <Receipt size={22} className="text-brand-400" />
            <h1 className="text-2xl font-bold text-white tracking-tight">Order Manifest</h1>
          </div>
          <p className="text-xs text-slate-500 ml-8 uppercase font-bold tracking-widest">Real-time Operations</p>
        </div>
      </motion.div>

      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.08 }} className="glass overflow-hidden">
        {isLoading && <div className="p-10"><Spinner /></div>}
        {isError && <ErrorBanner message="Failed to load orders." />}

        {!isLoading && !isError && (
          <>
            {orders.length === 0 ? (
              <div className="p-10">
                <EmptyState 
                  icon={<Receipt size={22} />} 
                  title="No orders found" 
                  description={currentMode === 'ACTIVE' ? "No active orders (Pending or Served) found." : "Your order manifest is currently empty."} 
                />
              </div>
            ) : (
              <div className="p-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {orders.map((o: OrderResponse, idx) => (
                  <motion.div 
                    key={o.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.05 }}
                    onClick={() => setSelectedOrder(o)}
                    className="glass-card p-5 border-l-4 hover:scale-[1.02] transition-all flex flex-col justify-between h-[220px] cursor-pointer group"
                    style={{
                      borderLeftColor: 
                        o.status === 'PENDING' ? '#f59e0b' : 
                        o.status === 'SERVED' ? '#8b5cf6' : 
                        o.status === 'COMPLETED' ? '#10b981' : 
                        '#ef4444' // CANCELLED
                    }}
                  >
                    <div>
                      <div className="flex justify-between items-start mb-4">
                        <div>
                          <p className="font-bold text-white group-hover:text-brand-400 transition-colors">Order #{o.id.split('-')[0]}</p>
                          <div className="flex items-center gap-2 text-[10px] text-slate-500 mt-1">
                            <Clock size={10} />
                            {new Date(o.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            <Calendar size={10} className="ml-1" />
                            {new Date(o.createdAt).toLocaleDateString()}
                          </div>
                        </div>
                        <span className={`px-2 py-1 rounded text-[10px] font-black uppercase tracking-widest ${
                          o.status === 'PENDING' ? 'bg-amber-500/10 text-amber-500' :
                          o.status === 'SERVED' ? 'bg-purple-500/10 text-purple-500' :
                          o.status === 'COMPLETED' ? 'bg-emerald-500/10 text-emerald-500' :
                          'bg-red-500/10 text-red-500'
                        }`}>
                          {o.status}
                        </span>
                      </div>

                      <div className="flex items-center gap-2 text-xs text-slate-400 mb-4 bg-white/5 p-2 rounded-xl border border-white/[0.03]">
                        <MapPin size={14} className={o.tableName ? 'text-brand-400' : 'text-slate-600'} />
                        <div className="flex flex-col">
                          <span className="text-[9px] text-slate-500 uppercase font-black tracking-tighter">Location</span>
                          {o.tableName ? (
                            <span className="font-bold text-slate-200">{o.tableName}</span>
                          ) : (
                            <span className="italic text-slate-600">Takeaway</span>
                          )}
                        </div>
                      </div>
                    </div>
                    
                    <div className="pt-3 border-t border-white/5 flex justify-between items-center">
                      <div className="flex flex-col">
                        <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Total Amount</span>
                        <p className="text-base font-black text-emerald-400">NPR {o.totalAmount?.toFixed(2)}</p>
                      </div>
                      
                      <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                        <button 
                          onClick={() => setSelectedOrder(o)}
                          className="p-2 bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white rounded-lg transition-all border border-white/5"
                          title="Quick View"
                        >
                          <Eye size={14} />
                        </button>
                        {o.status !== 'CANCELLED' && o.status !== 'COMPLETED' && (
                          <button 
                            onClick={() => navigate(`/take-order?edit=${o.id}`)}
                            className="p-2 bg-brand-500/10 hover:bg-brand-500 text-brand-400 hover:text-white rounded-lg transition-all border border-brand-500/20"
                            title="Edit Order"
                          >
                            <Edit3 size={14} />
                          </button>
                        )}
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
            {paged && paged.totalElements > 0 && (
              <div className="p-4 border-t border-white/5">
                <Pagination page={page} totalPages={paged.totalPages} totalElements={paged.totalElements} pageSize={PAGE_SIZE} onPageChange={setPage} />
              </div>
            )}
          </>
        )}
      </motion.div>

      <ConfirmModal
        isOpen={confirmConfig.open}
        onClose={() => setConfirmConfig({ open: false, orderId: '' })}
        onConfirm={() => cancelMutation.mutate(confirmConfig.orderId)}
        title="Cancel Order"
        message="Are you sure you want to cancel this order? This action cannot be undone and will mark the order as void."
        isLoading={cancelMutation.isPending}
      />

      {/* ── Order Detail Modal ── */}
      <Modal 
        open={!!selectedOrder} 
        onClose={() => setSelectedOrder(null)} 
        title={`Order Details: #${selectedOrder?.id.split('-')[0]}`}
        width="max-w-md"
      >
        {selectedOrder && (
          <div className="space-y-6">
            <div className="flex items-center justify-between p-4 bg-white/5 rounded-2xl border border-white/[0.05]">
              <div className="flex flex-col">
                <span className="text-[9px] text-slate-500 uppercase font-black tracking-widest mb-1">Status</span>
                <span className={`px-2 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider w-fit ${
                  selectedOrder.status === 'PENDING' ? 'bg-amber-500/10 text-amber-500' :
                  selectedOrder.status === 'SERVED' ? 'bg-purple-500/10 text-purple-500' :
                  selectedOrder.status === 'COMPLETED' ? 'bg-emerald-500/10 text-emerald-500' :
                  'bg-red-500/10 text-red-500'
                }`}>
                  {selectedOrder.status}
                </span>
              </div>
              <div className="text-right">
                <span className="text-[9px] text-slate-500 uppercase font-black tracking-widest mb-1 block">Created At</span>
                <p className="text-xs text-white font-bold">{new Date(selectedOrder.createdAt).toLocaleString()}</p>
              </div>
            </div>

            <div className="space-y-3">
              <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-widest pl-1">Order Items</h4>
              <div className="space-y-2 max-h-[300px] overflow-y-auto custom-scrollbar pr-2">
                {selectedOrder.items?.map((i, index) => (
                  <div key={index} className="p-3 bg-slate-900 border border-white/[0.05] rounded-xl space-y-1">
                    <div className="flex justify-between text-sm">
                      <span className="text-white font-bold">{i.quantity}x {i.name}</span>
                      <span className="text-emerald-400 font-black">NPR {(i.price * i.quantity).toFixed(2)}</span>
                    </div>
                    {i.options && i.options.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-1">
                        {i.options.map(opt => (
                          <span key={opt.id} className="text-[9px] bg-white/5 text-slate-400 px-1.5 py-0.5 rounded border border-white/5">
                            {opt.name}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            <div className="pt-4 border-t border-white/5 flex items-center justify-between">
              <div>
                <span className="text-[10px] text-slate-500 font-black uppercase tracking-widest">Total Payable</span>
                <p className="text-2xl font-black text-emerald-400">NPR {selectedOrder.totalAmount?.toFixed(2)}</p>
              </div>
              <div className="flex items-center gap-2">
                 {selectedOrder.status !== 'CANCELLED' && selectedOrder.status !== 'COMPLETED' && (
                  <>
                    <button 
                      onClick={() => navigate(`/take-order?edit=${selectedOrder.id}`)}
                      className="flex items-center gap-2 px-4 py-2 bg-brand-500 text-white rounded-xl text-xs font-bold shadow-lg shadow-brand-500/20 active:scale-95 transition-all"
                    >
                      <Edit3 size={14} />
                      Edit
                    </button>
                    <button 
                      onClick={() => {
                        setConfirmConfig({ open: true, orderId: selectedOrder.id });
                        setSelectedOrder(null);
                      }}
                      className="flex items-center gap-2 px-4 py-2 bg-red-500/10 hover:bg-red-500 text-red-500 hover:text-white rounded-xl text-xs font-bold transition-all border border-red-500/20 active:scale-95"
                    >
                      <CancelIcon size={14} />
                      Cancel
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
