import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Layout, Plus, Search, Filter,
  Users, MapPin, CheckCircle2, XCircle,
  ArrowUpRight, ArrowDownLeft, Loader2, Power, PowerOff
} from 'lucide-react';
import { tableService } from '../services/tableService';
import type { TableResponse, TableStatus, TableSummaryResponse } from '../types';
import CreateTableModal from '../components/tables/CreateTableModal';
import Pagination from '../components/ui/Pagination';

const PAGE_SIZE = 20;

export default function TablesPage() {
  const [tables, setTables] = useState<TableResponse[]>([]);
  const [summary, setSummary] = useState<TableSummaryResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<TableStatus | 'ALL'>('AVAILABLE');
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  useEffect(() => {
    fetchTables();
  }, [search, statusFilter, page]);

  const fetchTables = async () => {
    try {
      const [res, summaryRes] = await Promise.all([
        tableService.getTables(
          search,
          statusFilter === 'ALL' ? undefined : statusFilter,
          page,
          PAGE_SIZE
        ),
        tableService.getTableSummary()
      ]);

      if (res.success && res.data) {
        setTables(res.data.content);
        setTotalPages(res.data.totalPages);
        setTotalElements(res.data.totalElements);
      }
      if (summaryRes.success && summaryRes.data) {
        setSummary(summaryRes.data);
      }
    } catch (err) {
      console.error('Failed to fetch tables', err);
    } finally {
      setLoading(false);
    }
  };

  const toggleTableStatus = async (id: string, currentStatus: TableStatus) => {
    try {
      if (currentStatus === 'DISABLED') {
        await tableService.enableTable(id);
      } else {
        await tableService.disableTable(id);
      }
      fetchTables();
    } catch (err) {
      console.error('Failed to toggle table status', err);
    }
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <Layout className="text-brand-400" />
            Table Management
          </h1>
          <p className="text-slate-400 text-sm mt-1">Manage restaurant layout and table availability.</p>
        </div>
        <button
          className="btn-primary flex items-center gap-2 self-start"
          onClick={() => setIsCreateModalOpen(true)}
        >
          <Plus size={18} />
          Add New Table
        </button>
      </div>

      {/* Stats Summary */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="glass-card p-4 flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-brand-500/10 flex items-center justify-center text-brand-400">
            <Layout size={24} />
          </div>
          <div>
            <p className="text-xs text-slate-400 uppercase font-bold tracking-wider">Total Tables</p>
            <p className="text-2xl font-bold text-white">{summary?.totalTables ?? totalElements}</p>
          </div>
        </div>
        <div className="glass-card p-4 flex items-center gap-4 border-emerald-500/20">
          <div className="w-12 h-12 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-500">
            <CheckCircle2 size={24} />
          </div>
          <div>
            <p className="text-xs text-slate-400 uppercase font-bold tracking-wider">Available</p>
            <p className="text-2xl font-bold text-emerald-500">
              {summary?.availableTables ?? 0}
            </p>
          </div>
        </div>
        <div className="glass-card p-4 flex items-center gap-4 border-amber-500/20">
          <div className="w-12 h-12 rounded-xl bg-amber-500/10 flex items-center justify-center text-amber-500">
            <XCircle size={24} />
          </div>
          <div>
            <p className="text-xs text-slate-400 uppercase font-bold tracking-wider">Reserved</p>
            <p className="text-2xl font-bold text-amber-500">
              {summary?.reservedTables ?? 0}
            </p>
          </div>
        </div>
        <div className="glass-card p-4 flex items-center gap-4 border-red-500/20">
          <div className="w-12 h-12 rounded-xl bg-red-500/10 flex items-center justify-center text-red-500">
            <XCircle size={24} />
          </div>
          <div>
            <p className="text-xs text-slate-400 uppercase font-bold tracking-wider">Disabled</p>
            <p className="text-2xl font-bold text-red-500">
              {summary?.disabledTables ?? 0}
            </p>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col md:flex-row gap-4 items-center justify-between glass-card p-4">
        <div className="relative w-full md:w-96">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
          <input
            type="text"
            placeholder="Search tables..."
            className="w-full bg-slate-800/50 border border-white/10 rounded-xl pl-10 pr-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-brand-500/50 transition-all"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className="flex items-center gap-2 w-full md:w-auto">
          <Filter size={18} className="text-slate-500" />
          <select
            className="bg-slate-800/50 border border-white/10 rounded-xl px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-brand-500/50 transition-all cursor-pointer grow md:grow-0"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as any)}
          >
            <option value="ALL">All Statuses</option>
            <option value="AVAILABLE">Available</option>
            <option value="RESERVED">Reserved</option>
            <option value="DISABLED">Disabled</option>
          </select>
        </div>
      </div>

      {/* Tables Grid */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 text-slate-500">
          <Loader2 className="animate-spin mb-4" size={40} />
          <p>Loading tables layout...</p>
        </div>
      ) : tables.length === 0 ? (
        <div className="glass-card p-20 text-center text-slate-500">
          <p className="text-lg">No tables found.</p>
          <p className="text-sm">Add your first table to get started.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {tables.map((table) => (
            <motion.div
              key={table.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className={`glass-card p-6 border-l-4 transition-all hover:scale-[1.02] ${table.tableStatus === 'AVAILABLE' ? 'border-emerald-500' :
                  table.tableStatus === 'RESERVED' ? 'border-amber-500' : 'border-slate-700'
                } ${table.tableStatus === 'DISABLED' ? 'opacity-60 grayscale-[0.5]' : ''}`}
            >
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-xl font-bold text-white">{table.name}</h3>
                  <div className="flex items-center gap-1.5 text-slate-400 text-sm mt-1">
                    <MapPin size={14} />
                    {table.location}
                  </div>
                </div>
                <span className={`px-2 py-1 rounded text-[10px] font-black uppercase tracking-widest ${table.tableStatus === 'AVAILABLE' ? 'bg-emerald-500/10 text-emerald-500' :
                    table.tableStatus === 'RESERVED' ? 'bg-amber-500/10 text-amber-500' : 'bg-slate-500/10 text-slate-500'
                  }`}>
                  {table.tableStatus}
                </span>
              </div>

              <div className="flex items-center gap-4 py-4 border-y border-white/5 my-4">
                <div className="flex flex-col">
                  <span className="text-[10px] text-slate-500 uppercase font-bold">Capacity</span>
                  <div className="flex items-center gap-1.5 text-white font-bold">
                    <Users size={16} className="text-brand-400" />
                    {table.capacity} Persons
                  </div>
                </div>
              </div>

              <div className="flex justify-end pt-2">
                <button
                  onClick={() => toggleTableStatus(table.id, table.tableStatus)}
                  title={table.tableStatus === 'DISABLED' ? 'Enable Table' : 'Disable Table'}
                  className={`p-1.5 rounded-md transition-all ${
                    table.tableStatus === 'DISABLED'
                      ? 'text-emerald-500 hover:bg-emerald-500/10'
                      : 'text-slate-500 hover:text-red-500 hover:bg-red-500/10'
                  }`}
                >
                  {table.tableStatus === 'DISABLED' ? (
                    <Power size={14} />
                  ) : (
                    <PowerOff size={14} />
                  )}
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Pagination */}
      {!loading && totalElements > 0 && (
        <div className="glass-card overflow-hidden">
          <Pagination page={page} totalPages={totalPages} totalElements={totalElements} pageSize={PAGE_SIZE} onPageChange={setPage} />
        </div>
      )}

      <CreateTableModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSuccess={fetchTables}
      />
    </div>
  );
}
