import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { Receipt, Plus, Calendar, Clock, MapPin } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { orderService } from '../services/orderService';
import type { OrderResponse } from '../types';
import Pagination from '../components/ui/Pagination';
import { Spinner, EmptyState, ErrorBanner } from '../components/ui/Feedback';

const PAGE_SIZE = 10;

export default function OrdersPage() {
  const navigate = useNavigate();
  const [page, setPage] = useState(0);

  const { data, isLoading, isError } = useQuery({
    queryKey: ['orders', page],
    queryFn: () => orderService.getAll({ page, size: PAGE_SIZE }),
  });

  const orders = data?.data?.content ?? [];
  const paged = data?.data;

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      <motion.div initial={{ opacity: 0, y: -12 }} animate={{ opacity: 1, y: 0 }} className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2 mb-0.5">
            <Receipt size={24} className="text-brand-400" />
            <h1 className="text-2xl font-bold text-white">Orders</h1>
          </div>
          <p className="text-sm text-slate-500 ml-8">Manage incoming orders and status.</p>
        </div>
      </motion.div>

      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.08 }} className="glass overflow-hidden">
        {isLoading && <div className="p-10"><Spinner /></div>}
        {isError && <ErrorBanner message="Failed to load orders." />}

        {!isLoading && !isError && (
          <>
            {orders.length === 0 ? (
              <div className="p-10">
                <EmptyState icon={<Receipt size={22} />} title="No orders found" description="Create a new order to get started." />
              </div>
            ) : (
              <div className="p-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {orders.map((o: OrderResponse, idx) => (
                  <motion.div 
                    key={o.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.05 }}
                    className="glass-card p-5 border-l-4 hover:scale-[1.02] transition-all flex flex-col justify-between h-full"
                    style={{
                      borderLeftColor: 
                        o.status === 'PENDING' ? '#f59e0b' : 
                        o.status === 'DELIVERED' ? '#10b981' : 
                        '#64748b'
                    }}
                  >
                    <div>
                      <div className="flex justify-between items-start mb-3">
                        <div>
                          <p className="font-bold text-white">Order #{o.id.split('-')[0]}</p>
                          <div className="flex items-center gap-2 text-[10px] text-slate-500 mt-1">
                            <Calendar size={10} />
                            {new Date(o.createdAt).toLocaleDateString()}
                            <Clock size={10} className="ml-1" />
                            {new Date(o.createdAt).toLocaleTimeString()}
                          </div>
                        </div>
                        <span className={`px-2 py-1 rounded text-[10px] font-black uppercase tracking-widest ${
                          o.status === 'PENDING' ? 'bg-amber-500/10 text-amber-500' :
                          o.status === 'DELIVERED' ? 'bg-emerald-500/10 text-emerald-500' :
                          'bg-slate-500/10 text-slate-500'
                        }`}>
                          {o.status}
                        </span>
                      </div>

                      <div className="flex items-center gap-1.5 text-xs text-slate-400 mb-4 pb-4 border-b border-white/5">
                        <MapPin size={12} className={o.tableName ? 'text-brand-400' : 'text-slate-600'} />
                        {o.tableName ? (
                          <span className="font-semibold text-brand-300">{o.tableName}</span>
                        ) : (
                          <span className="italic text-slate-600">Takeaway</span>
                        )}
                      </div>

                      <div className="space-y-2 mb-4">
                        {o.items?.map((i, index) => (
                          <div key={index} className="flex flex-col gap-0.5">
                            <div className="text-xs text-slate-300 flex justify-between font-medium">
                              <span className="truncate pr-2">{i.quantity}x {i.name}</span>
                              <span className="text-slate-400">NPR {(i.price * i.quantity).toFixed(2)}</span>
                            </div>
                            {i.options && i.options.length > 0 && (
                               <div className="pl-4 text-[10px] text-slate-500">
                                 {i.options.map(opt => `+ ${opt.name}`).join(', ')}
                               </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                    
                    <div className="pt-3 border-t border-white/5 flex justify-between items-center mt-auto">
                      <span className="text-xs text-slate-500 font-bold uppercase">Total</span>
                      <p className="text-lg font-bold text-emerald-400">NPR {o.totalAmount?.toFixed(2)}</p>
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
    </div>
  );
}
