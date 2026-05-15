import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  History, Search, Filter, ArrowUpRight, ArrowDownLeft,
  Calendar, Info, ArrowRight
} from 'lucide-react';
import { inventoryService } from '../../services/inventoryService';
import type { InventoryTransactionResponse } from '../../types/inventory';
import { format } from 'date-fns';
import Pagination from '../../components/ui/Pagination';

export default function InventoryTransactionsPage() {
  const [transactions, setTransactions] = useState<InventoryTransactionResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);

  useEffect(() => {
    fetchTransactions();
  }, [page]);

  const fetchTransactions = async () => {
    try {
      const res = await inventoryService.getTransactions(page, 20);
      if (res.success && res.data) {
        setTransactions(res.data.content);
        setTotalPages(res.data.totalPages);
        setTotalElements(res.data.totalElements);
      }
    } catch (err) {
      console.error('Failed to fetch transactions', err);
    } finally {
      setLoading(false);
    }
  };

  const filteredTransactions = transactions; // Backend filtering if implemented, currently just pagination

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <History className="text-brand-400" />
            Stock Ledger
          </h1>
          <p className="text-slate-400 text-sm mt-1">Audit log of all stock movements and adjustments.</p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col md:flex-row gap-4 items-center glass-card p-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
          <input
            type="text"
            placeholder="Search by item or remark..."
            className="w-full bg-slate-800/50 border border-white/10 rounded-xl pl-10 pr-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-brand-500/50 transition-all"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <button className="btn-ghost flex items-center gap-2">
          <Calendar size={18} />
          Filter Date
        </button>
      </div>

      {/* Transactions Table */}
      <div className="glass-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-white/5 bg-white/[0.02]">
                <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Date & Time</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Item</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Type</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider text-center">Change</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Balance After</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Remark</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {loading ? (
                Array(5).fill(0).map((_, i) => (
                  <tr key={i} className="animate-pulse">
                    <td colSpan={6} className="px-6 py-4"><div className="h-10 bg-white/5 rounded-lg" /></td>
                  </tr>
                ))
              ) : filteredTransactions.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-slate-500">
                    No transactions found.
                  </td>
                </tr>
              ) : filteredTransactions.map((tx) => (
                <motion.tr 
                  key={tx.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="hover:bg-white/[0.02] transition-colors"
                >
                  <td className="px-6 py-4">
                    <div className="text-sm text-white font-medium">
                      {format(new Date(tx.createdAt), 'MMM dd, yyyy')}
                    </div>
                    <div className="text-[10px] text-slate-500">
                      {format(new Date(tx.createdAt), 'HH:mm:ss')}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm font-semibold text-white">{tx.stockItemName}</div>
                    <div className="text-[10px] text-slate-500 uppercase tracking-tighter">
                      REF: {tx.referenceType}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="px-2 py-1 rounded-md bg-white/5 text-[10px] font-bold text-slate-400 uppercase tracking-tight border border-white/5">
                      {tx.transactionType.replace(/_/g, ' ')}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <div className={`flex items-center justify-center gap-1 font-bold ${tx.direction > 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                      {tx.direction > 0 ? <ArrowUpRight size={14} /> : <ArrowDownLeft size={14} />}
                      {tx.originalQuantity}
                      <span className="text-[10px] font-normal opacity-70 ml-1">{tx.originalUnitName}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm font-bold text-white flex items-center gap-1">
                       {tx.balanceAfter}
                       <span className="text-[10px] font-normal text-slate-500">Units</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-xs text-slate-400 max-w-[200px] truncate" title={tx.remark}>
                      {tx.remark || '-'}
                    </div>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
        {/* Pagination */}
        {totalElements > 0 && (
          <div className="px-6 py-4 border-t border-white/5 bg-white/[0.01]">
            <Pagination page={page} totalPages={totalPages} totalElements={totalElements} pageSize={20} onPageChange={setPage} />
          </div>
        )}
      </div>
    </div>
  );
}
