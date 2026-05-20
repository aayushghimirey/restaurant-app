import { motion } from 'framer-motion';
import {
  CheckCircle2,
  Layout,
  Loader2,
  MapPin,
  Plus,
  Power, PowerOff,
  Users,
  XCircle
} from 'lucide-react';
import { useEffect, useState } from 'react';
import CreateTableModal from '../components/tables/CreateTableModal';
import Pagination from '../components/ui/Pagination';
import { tableService } from '../services/tableService';
import type { TableResponse, TableStatus, TableSummaryResponse } from '../types';

const PAGE_SIZE = 20;

import { useSearchParams } from 'react-router-dom';

export default function TablesPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const search = searchParams.get('q') || '';
  const statusFilter = (searchParams.get('status') as TableStatus | 'ALL') || 'ALL';
  
  const [tables, setTables] = useState<TableResponse[]>([]);
  const [summary, setSummary] = useState<TableSummaryResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const page = parseInt(searchParams.get('page') || '0', 10);
  const setPage = (p: number) => {
    searchParams.set('page', p.toString());
    setSearchParams(searchParams);
  };
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  const setStatusFilter = (status: TableStatus | 'ALL') => {
    if (status === 'ALL') {
      searchParams.delete('status');
    } else {
      searchParams.set('status', status);
    }
    searchParams.delete('page');
    setSearchParams(searchParams);
  };

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
    <div className="space-y-6">
      {/* Header Row */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-white flex items-center gap-2">
            <Layout size={20} className="text-brand-400" />
            Floor Map
          </h1>
          <p className="text-xs text-slate-500 mt-1">Manage restaurant layout and table availability.</p>
        </div>
        <button
          className="btn-primary"
          onClick={() => setIsCreateModalOpen(true)}
        >
          <Plus size={16} />
          Add Table
        </button>
      </div>

      {/* Stats Summary */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div 
          onClick={() => setStatusFilter('ALL')}
          className={`glass-card p-4 flex items-center gap-4 cursor-pointer hover:border-brand-500/50 hover:bg-brand-500/5 transition-all duration-200 ${
            statusFilter === 'ALL' ? 'border-brand-500 shadow-lg shadow-brand-500/10 bg-brand-500/5' : 'border-white/5'
          }`}
        >
          <div className="w-10 h-10 rounded-xl bg-brand-500/10 flex items-center justify-center text-brand-400">
            <Layout size={20} />
          </div>
          <div>
            <p className="text-[10px] text-slate-500 uppercase font-bold tracking-wider">Total Tables</p>
            <p className="text-xl font-bold text-white">{summary?.totalTables ?? totalElements}</p>
          </div>
        </div>
        <div 
          onClick={() => setStatusFilter('AVAILABLE')}
          className={`glass-card p-4 flex items-center gap-4 cursor-pointer hover:border-emerald-500/50 hover:bg-emerald-500/5 transition-all duration-200 ${
            statusFilter === 'AVAILABLE' ? 'border-emerald-500 shadow-lg shadow-emerald-500/10 bg-emerald-500/5' : 'border-emerald-500/10'
          }`}
        >
          <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-500">
            <CheckCircle2 size={20} />
          </div>
          <div>
            <p className="text-[10px] text-slate-500 uppercase font-bold tracking-wider">Available</p>
            <p className="text-xl font-bold text-emerald-500">
              {summary?.availableTables ?? 0}
            </p>
          </div>
        </div>
        <div 
          onClick={() => setStatusFilter('RESERVED')}
          className={`glass-card p-4 flex items-center gap-4 cursor-pointer hover:border-amber-500/50 hover:bg-amber-500/5 transition-all duration-200 ${
            statusFilter === 'RESERVED' ? 'border-amber-500 shadow-lg shadow-amber-500/10 bg-amber-500/5' : 'border-amber-500/10'
          }`}
        >
          <div className="w-10 h-10 rounded-xl bg-amber-500/10 flex items-center justify-center text-amber-500">
            <XCircle size={20} />
          </div>
          <div>
            <p className="text-[10px] text-slate-500 uppercase font-bold tracking-wider">Reserved</p>
            <p className="text-xl font-bold text-amber-500">
              {summary?.reservedTables ?? 0}
            </p>
          </div>
        </div>
        <div 
          onClick={() => setStatusFilter('DISABLED')}
          className={`glass-card p-4 flex items-center gap-4 cursor-pointer hover:border-red-500/50 hover:bg-red-500/5 transition-all duration-200 ${
            statusFilter === 'DISABLED' ? 'border-red-500 shadow-lg shadow-red-500/10 bg-red-500/5' : 'border-red-500/10'
          }`}
        >
          <div className="w-10 h-10 rounded-xl bg-red-500/10 flex items-center justify-center text-red-500">
            <XCircle size={20} />
          </div>
          <div>
            <p className="text-[10px] text-slate-500 uppercase font-bold tracking-wider">Disabled</p>
            <p className="text-xl font-bold text-red-500">
              {summary?.disabledTables ?? 0}
            </p>
          </div>
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
