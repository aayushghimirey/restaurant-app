import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Receipt, Search, CreditCard, Wallet, 
  Clock, Eye, CheckCircle2,
  Loader2, Calculator, Percent, Printer, FileText, History
} from 'lucide-react';
import { invoiceService } from '../services/invoiceService';
import { businessDetailService } from '../services/businessDetailService';
import type { InvoiceResponse, InvoiceStatus, PaymentMethod } from '../types';
import { DateFilter } from '../types';
import { toast } from 'sonner';
import { useSearchParams } from 'react-router-dom';
import Pagination from '../components/ui/Pagination';
import { useAuth } from '../contexts/AuthContext';
import { useQuery } from '@tanstack/react-query';

const PAGE_SIZE = 10;

export default function InvoicesPage() {
  const { user } = useAuth();

  // Business name from the registered business profile (takes priority over tenant name)
  const { data: bizData } = useQuery({
    queryKey: ['business-detail'],
    queryFn: businessDetailService.get,
    retry: false,
  });
  const bizName = bizData?.data?.businessName || user?.tenantName || 'STS Hospitality';
  const bizAddress = bizData?.data?.address || '';
  const bizPhone = bizData?.data?.businessPhone || '';
  const bizPan = bizData?.data?.panNumber || '';

  const [searchParams, setSearchParams] = useSearchParams();
  const search = searchParams.get('q') || '';
  const statusFilter = (searchParams.get('status') as InvoiceStatus | 'ALL') || 'PENDING';
  const dateFilter = (searchParams.get('dateFilter') as DateFilter) || DateFilter.TODAY;
  const page = parseInt(searchParams.get('page') || '0', 10);
   
  const setPage = (p: number) => {
    searchParams.set('page', p.toString());
    setSearchParams(searchParams);
  };
 
  const [invoices, setInvoices] = useState<InvoiceResponse[]>([]);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  const [loading, setLoading] = useState(true);

  // Stats
  const [stats, setStats] = useState({
    totalInvoiced: 0,
    pendingCount: 0,
    cashReceipts: 0,
    digitalReceipts: 0
  });

  // Modal & Drawer State
  const [selectedInvoice, setSelectedInvoice] = useState<InvoiceResponse | null>(null);
  const [isProcessModalOpen, setIsProcessModalOpen] = useState(false);
  const [isDetailDrawerOpen, setIsDetailDrawerOpen] = useState(false);

  // Form State for Processing
  const [discount, setDiscount] = useState<number>(0);
  const [discountType, setDiscountType] = useState<'FLAT' | 'PERCENT'>('FLAT');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('CASH');
  const [processing, setProcessing] = useState(false);
  const [printLoading, setPrintLoading] = useState(false);

  const calculatedDiscount = selectedInvoice
    ? discountType === 'FLAT'
      ? discount
      : (selectedInvoice.netTotal * discount) / 100
    : 0;

  const fetchInvoices = async () => {
    setLoading(true);
    try {
      const activeFilter = statusFilter === 'ALL' ? undefined : statusFilter;
      const [res, summaryRes] = await Promise.all([
        invoiceService.getAll(activeFilter, dateFilter, page, PAGE_SIZE),
        invoiceService.getSummary(dateFilter)
      ]);
      if (res.success && res.data) {
        setInvoices(res.data.content);
        setTotalPages(res.data.totalPages);
        setTotalElements(res.data.totalElements);
      }
      if (summaryRes.success && summaryRes.data) {
        const s = summaryRes.data;
        setStats({
          totalInvoiced: s.totalSales,
          pendingCount: Number(s.pendingInvoices),
          cashReceipts: s.cashSales,
          digitalReceipts: s.cardSales + s.fonepaySales
        });
      }
    } catch (err) {
      console.error(err);
      toast.error('Failed to load invoices registry');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInvoices();
  }, [search, statusFilter, dateFilter, page]);

  const handleOpenProcess = (invoice: InvoiceResponse) => {
    setSelectedInvoice(invoice);
    setDiscount(0);
    setDiscountType('FLAT');
    setPaymentMethod('CASH');
    setIsProcessModalOpen(true);
  };

  const handleOpenDetail = (invoice: InvoiceResponse) => {
    setSelectedInvoice(invoice);
    setIsDetailDrawerOpen(true);
  };

  const handleProcessSubmit = async (e: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!selectedInvoice) return;

    if (calculatedDiscount < 0 || calculatedDiscount > selectedInvoice.netTotal) {
      return toast.error('Discount cannot exceed the total bill amount');
    }

    setProcessing(true);
    try {
      const res = await invoiceService.process({
        id: selectedInvoice.invoiceId,
        discountAmount: calculatedDiscount,
        paymentMethod
      });
      if (res.success) {
        toast.success('Invoice settled! Opening receipt...');
        setIsProcessModalOpen(false);
        fetchInvoices();
        // Auto-open receipt page immediately after settlement
        await handlePrintReceipt(selectedInvoice.invoiceId);
      }
    } catch (err) {
      console.error(err);
      toast.error('Failed to process payment');
    } finally {
      setProcessing(false);
    }
  };

  const handlePrintReceipt = async (invoiceId: string) => {
    setPrintLoading(true);
    try {
      const res = await invoiceService.issueReceiptToken(invoiceId);
      if (!res.success || !res.data?.token) {
        toast.error('Could not prepare receipt for printing');
        return;
      }
      const url = `http://localhost:9000/api/invoices/${invoiceId}/print?token=${res.data.token}`;
      window.open(url, '_blank', 'noopener,noreferrer');
    } catch (err) {
      console.error(err);
      toast.error('Failed to open receipt');
    } finally {
      setPrintLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-white flex items-center gap-2.5">
            <Receipt size={20} className="text-brand-400" />
            Billing & Invoices
          </h1>
          <p className="text-slate-500 text-xs mt-1">Settle active tables, record transactions, and export customer receipts.</p>
        </div>
      </div>

      {/* Stats Summary Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="glass-card p-4 flex items-center gap-4 border-emerald-500/10">
          <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-500 shadow-md">
            <Wallet size={20} />
          </div>
          <div>
            <p className="text-[10px] text-slate-500 uppercase font-bold tracking-wider">Settled Earnings</p>
            <p className="text-xl font-bold text-emerald-500">Rs. {stats.totalInvoiced.toFixed(2)}</p>
          </div>
        </div>

        <div className="glass-card p-4 flex items-center gap-4 border-amber-500/10">
          <div className="w-10 h-10 rounded-xl bg-amber-500/10 flex items-center justify-center text-amber-500 shadow-md">
            <Clock size={20} />
          </div>
          <div>
            <p className="text-[10px] text-slate-500 uppercase font-bold tracking-wider">Unpaid / Pending</p>
            <p className="text-xl font-bold text-amber-500">{stats.pendingCount} Bills</p>
          </div>
        </div>

        <div className="glass-card p-4 flex items-center gap-4 border-brand-500/10">
          <div className="w-10 h-10 rounded-xl bg-brand-500/10 flex items-center justify-center text-brand-400 shadow-md">
            <Percent size={20} />
          </div>
          <div>
            <p className="text-[10px] text-slate-500 uppercase font-bold tracking-wider">Cash Register</p>
            <p className="text-xl font-bold text-brand-400">Rs. {stats.cashReceipts.toFixed(2)}</p>
          </div>
        </div>

        <div className="glass-card p-4 flex items-center gap-4 border-violet-500/10">
          <div className="w-10 h-10 rounded-xl bg-violet-500/10 flex items-center justify-center text-violet-400 shadow-md">
            <CreditCard size={20} />
          </div>
          <div>
            <p className="text-[10px] text-slate-500 uppercase font-bold tracking-wider">Card & Digital</p>
            <p className="text-xl font-bold text-violet-400">Rs. {stats.digitalReceipts.toFixed(2)}</p>
          </div>
        </div>
      </div>

      {/* Filter and Search Controls */}
      <div className="flex flex-col sm:flex-row gap-4 items-center justify-between bg-white/[0.02] border border-white/5 rounded-2xl p-4">
        {/* Search */}
        <div className="relative w-full sm:w-72">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={16} />
          <input
            type="text"
            placeholder="Search invoice details..."
            value={search}
            onChange={(e) => {
              const val = e.target.value;
              if (val) searchParams.set('q', val);
              else searchParams.delete('q');
              searchParams.delete('page');
              setSearchParams(searchParams);
            }}
            className="w-full bg-slate-800/50 border border-white/10 rounded-xl pl-9 pr-4 py-2 text-xs text-white focus:outline-none focus:ring-2 focus:ring-brand-500/50 placeholder:text-slate-500 transition-all"
          />
        </div>

        {/* Filters */}
        <div className="flex items-center gap-3 w-full sm:w-auto justify-end flex-wrap">
          {/* Date Filter */}
          <select
            value={dateFilter}
            onChange={(e) => {
              const val = e.target.value as DateFilter;
              searchParams.set('dateFilter', val);
              searchParams.delete('page');
              setSearchParams(searchParams);
            }}
            className="bg-slate-800/50 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:ring-2 focus:ring-brand-500/50 cursor-pointer min-w-[130px] transition-all"
          >
            <option value={DateFilter.TODAY}>Today</option>
            <option value={DateFilter.THIS_WEEK}>This Week</option>
            <option value={DateFilter.THIS_MONTH}>This Month</option>
          </select>

          {statusFilter !== 'PENDING' ? (
            <>
              <button
                type="button"
                onClick={() => {
                  searchParams.set('status', 'PENDING');
                  searchParams.delete('page');
                  setSearchParams(searchParams);
                }}
                className="px-4 py-2 bg-brand-500/10 border border-brand-500/25 text-brand-400 hover:bg-brand-500/20 rounded-xl text-xs font-black uppercase tracking-wider transition-all flex items-center gap-1.5"
              >
                <Clock size={12} />
                Show Pending Bills
              </button>

              <select
                value={statusFilter}
                onChange={(e) => {
                  const val = e.target.value;
                  searchParams.set('status', val);
                  searchParams.delete('page');
                  setSearchParams(searchParams);
                }}
                className="bg-slate-800/50 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:ring-2 focus:ring-brand-500/50 cursor-pointer min-w-[130px] transition-all"
              >
                <option value="ALL">All History</option>
                <option value="COMPLETED">Settled Only</option>
                <option value="CANCELLED">Cancelled Only</option>
              </select>
            </>
          ) : (
            <button
              type="button"
              onClick={() => {
                searchParams.set('status', 'ALL');
                searchParams.delete('page');
                setSearchParams(searchParams);
              }}
              className="px-4 py-2 bg-slate-800/80 border border-white/5 text-slate-400 hover:text-white rounded-xl text-xs font-black uppercase tracking-wider transition-all hover:bg-slate-700/60 flex items-center gap-1.5"
            >
              <History size={12} />
              View Invoice History
            </button>
          )}
        </div>
      </div>

      {/* Main Table */}
      <div className="glass-card overflow-hidden">
        {loading ? (
          <div className="p-16 flex flex-col items-center justify-center gap-3">
            <Loader2 className="animate-spin text-brand-400" size={32} />
            <p className="text-xs text-slate-500">Loading invoice registry...</p>
          </div>
        ) : invoices.length === 0 ? (
          <div className="p-16 text-center text-slate-500 text-xs">
            No invoices match your selected filters. Let's take customer orders to generate bills!
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse whitespace-nowrap">
              <thead>
                <tr className="bg-slate-800/80 border-b border-white/10">
                  <th className="px-6 py-3.5 text-[10px] uppercase tracking-wider text-slate-400 font-black">Invoice Code</th>
                  <th className="px-6 py-3.5 text-[10px] uppercase tracking-wider text-slate-400 font-black">Table Reference</th>
                  <th className="px-6 py-3.5 text-[10px] uppercase tracking-wider text-slate-400 font-black">Gross Sum</th>
                  <th className="px-6 py-3.5 text-[10px] uppercase tracking-wider text-slate-400 font-black">Discounts</th>
                  <th className="px-6 py-3.5 text-[10px] uppercase tracking-wider text-slate-400 font-black">Net Total</th>
                  <th className="px-6 py-3.5 text-[10px] uppercase tracking-wider text-slate-400 font-black">Method</th>
                  <th className="px-6 py-3.5 text-[10px] uppercase tracking-wider text-slate-400 font-black">Status</th>
                  <th className="px-6 py-3.5 text-[10px] uppercase tracking-wider text-slate-400 font-black text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {invoices.map((inv) => (
                  <tr key={inv.invoiceId} className="hover:bg-white/[0.01] transition-all">
                    <td className="px-6 py-3 font-mono text-[11px] text-slate-300">
                      INV-{inv.invoiceId.split('-')[0].toUpperCase()}
                    </td>
                    <td className="px-6 py-3">
                      <span className="text-xs font-bold text-white uppercase">{inv.tableName || 'Takeaway'}</span>
                    </td>
                    <td className="px-6 py-3 text-xs font-semibold text-slate-400">
                      Rs. {inv.netTotal.toFixed(2)}
                    </td>
                    <td className="px-6 py-3 text-xs font-semibold text-rose-400/80">
                      -Rs. {inv.discountAmount.toFixed(2)}
                    </td>
                    <td className="px-6 py-3 text-xs font-black text-brand-400">
                      Rs. {inv.grossTotal.toFixed(2)}
                    </td>
                    <td className="px-6 py-3">
                      {inv.paymentMethod ? (
                        <span className="px-2 py-0.5 rounded bg-slate-800 text-[10px] text-slate-400 uppercase font-mono tracking-widest border border-white/5">
                          {inv.paymentMethod}
                        </span>
                      ) : (
                        <span className="text-slate-600 text-[10px]">—</span>
                      )}
                    </td>
                    <td className="px-6 py-3">
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider border ${
                        inv.status === 'COMPLETED' 
                          ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                          : inv.status === 'PENDING'
                          ? 'bg-amber-500/10 text-amber-400 border-amber-500/20'
                          : 'bg-rose-500/10 text-rose-400 border-rose-500/20'
                      }`}>
                        <span className={`w-1 h-1 rounded-full ${
                          inv.status === 'COMPLETED' ? 'bg-emerald-500' : inv.status === 'PENDING' ? 'bg-amber-500' : 'bg-rose-500'
                        }`} />
                        {inv.status}
                      </span>
                    </td>
                    <td className="px-6 py-3 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => handleOpenDetail(inv)}
                          className="p-1.5 hover:bg-white/5 text-slate-400 hover:text-white rounded-lg transition-all"
                          title="View Digital Receipt"
                        >
                          <Eye size={14} />
                        </button>
                        {inv.status === 'PENDING' && (
                          <button
                            onClick={() => handleOpenProcess(inv)}
                            className="flex items-center gap-1 px-3 py-1 bg-brand-600 hover:bg-brand-500 text-white rounded-lg text-[10px] font-black uppercase tracking-wider transition-all"
                          >
                            <CreditCard size={10} />
                            Settle Bill
                          </button>
                        )}
                        {inv.status === 'COMPLETED' && (
                          <button
                            onClick={() => handlePrintReceipt(inv.invoiceId)}
                            className="p-1.5 hover:bg-emerald-500/10 text-slate-500 hover:text-emerald-400 rounded-lg transition-all"
                            title="Print Receipt"
                          >
                            <Printer size={14} />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Pagination */}
      {totalPages > 0 && (
        <div className="mt-4 glass-card p-4">
          <Pagination page={page} totalPages={totalPages} totalElements={totalElements} pageSize={PAGE_SIZE} onPageChange={setPage} />
        </div>
      )}

      {/* Full-Screen Payment Processing View */}
      <AnimatePresence>
        {isProcessModalOpen && selectedInvoice && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[200] bg-slate-950 flex flex-col md:flex-row overflow-hidden"
          >
            {/* Left Column: Client Facing Receipt Summary */}
            <div className="w-full md:w-1/2 bg-slate-900 border-r border-white/5 p-8 flex flex-col justify-between overflow-y-auto">
              <div>
                {/* Brand Header */}
                <div className="flex items-center justify-between border-b border-white/5 pb-4 mb-6">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-brand-500/10 flex items-center justify-center text-brand-400 font-bold border border-brand-500/20 shadow-lg uppercase text-xs">
                      {bizName.split(' ').map((n: string) => n[0]).join('').substring(0, 3)}
                    </div>
                    <div>
                      <h2 className="text-sm font-black text-white tracking-widest uppercase">
                        {bizName}
                      </h2>
                      <p className="text-[10px] text-slate-500 uppercase tracking-widest font-semibold">
                        {bizAddress || 'Premium Fine Dine'}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="px-2.5 py-1 rounded-md bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[9px] font-black uppercase tracking-wider animate-pulse">
                      Live Bill Review
                    </span>
                  </div>
                </div>

                {/* Settle Details */}
                <div className="flex items-center justify-between bg-slate-950/40 rounded-xl p-4 border border-white/5 mb-6">
                  <div>
                    <p className="text-[9px] text-slate-500 font-black uppercase tracking-widest">Table Reference</p>
                    <p className="text-sm font-bold text-white uppercase mt-0.5">{selectedInvoice.tableName || 'Takeaway'}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-[9px] text-slate-500 font-black uppercase tracking-widest">Receipt Code</p>
                    <p className="text-xs font-mono font-bold text-slate-300 uppercase mt-0.5">INV-{selectedInvoice.invoiceId.split('-')[0].toUpperCase()}</p>
                  </div>
                </div>

                {/* Ordered Items Manifest */}
                <div className="space-y-3 max-h-[45vh] overflow-y-auto pr-2 custom-scrollbar">
                  <p className="text-[9px] font-black text-slate-400 uppercase tracking-wider mb-2">Itemized Summary</p>
                  {selectedInvoice.items && selectedInvoice.items.length > 0 ? (
                    selectedInvoice.items.map((item, index) => (
                      <div key={index} className="flex justify-between items-center bg-slate-950/20 rounded-xl p-3 border border-white/[0.02]">
                        <div>
                          <p className="text-xs font-bold text-white uppercase">{item.name}</p>
                          <p className="text-[10px] text-slate-500 mt-0.5">{item.quantity} x Rs. {item.price.toFixed(2)}</p>
                        </div>
                        <p className="text-xs font-black text-slate-300">Rs. {(item.quantity * item.price).toFixed(2)}</p>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-6 text-slate-500 text-xs">No items in this order</div>
                  )}
                </div>
              </div>

              {/* Client Thank You & Verified Total Block */}
              <div className="mt-8 border-t border-white/5 pt-6 space-y-4">
                <div className="bg-gradient-to-br from-brand-600/10 to-violet-600/10 border border-brand-500/20 rounded-2xl p-5 flex items-center justify-between shadow-xl">
                  <div>
                    <span className="text-[10px] font-black uppercase tracking-widest text-brand-400 block mb-0.5">Net Amount Due</span>
                    <span className="text-2xl font-black text-white tracking-tight">
                      Rs. {Math.max(0, selectedInvoice.netTotal - calculatedDiscount).toFixed(2)}
                    </span>
                  </div>
                  <div className="text-right">
                    <span className="text-[9px] text-slate-500 block">Base: Rs. {selectedInvoice.netTotal.toFixed(2)}</span>
                    {calculatedDiscount > 0 && (
                      <span className="text-[9px] text-rose-400 block font-semibold">Disc: -Rs. {calculatedDiscount.toFixed(2)}</span>
                    )}
                  </div>
                </div>
                <p className="text-center text-[10px] text-slate-500 tracking-wider">
                  Please verify your items and pricing above. Thank you for dining with us!
                </p>
              </div>
            </div>

            {/* Right Column: Cashier Settle Panel */}
            <div className="w-full md:w-1/2 p-8 flex flex-col justify-between bg-slate-950 overflow-y-auto">
              <div>
                {/* Cashier Panel Header */}
                <div className="flex items-center justify-between border-b border-white/5 pb-4 mb-8">
                  <div className="flex items-center gap-2.5">
                    <CreditCard className="text-brand-400" size={18} />
                    <h3 className="text-sm font-black text-white uppercase tracking-wider">Cashier Settlement Desk</h3>
                  </div>
           
                </div>

                <div className="space-y-8">
                  {/* Settlement Discount with FLAT / PERCENT Switcher */}
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
                        <Calculator size={12} className="text-brand-400" /> Apply Settlement Discount
                      </label>
                      <div className="flex bg-slate-900 rounded-lg p-0.5 border border-white/5">
                        <button
                          type="button"
                          onClick={() => {
                            setDiscountType('FLAT');
                            setDiscount(0);
                          }}
                          className={`px-3 py-1 rounded-md text-[9px] font-black uppercase transition-all ${
                            discountType === 'FLAT'
                              ? 'bg-brand-500 text-white shadow-md'
                              : 'text-slate-500 hover:text-slate-300'
                          }`}
                        >
                          Flat (Rs.)
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setDiscountType('PERCENT');
                            setDiscount(0);
                          }}
                          className={`px-3 py-1 rounded-md text-[9px] font-black uppercase transition-all ${
                            discountType === 'PERCENT'
                              ? 'bg-brand-500 text-white shadow-md'
                              : 'text-slate-500 hover:text-slate-300'
                          }`}
                        >
                          Percent (%)
                        </button>
                      </div>
                    </div>
                    <div className="relative">
                      <input
                        type="number"
                        step="any"
                        min="0"
                        max={discountType === 'PERCENT' ? 100 : selectedInvoice.netTotal}
                        placeholder={discountType === 'PERCENT' ? "Enter percentage (e.g. 10)" : "Enter amount in Rs."}
                        value={discount || ''}
                        onChange={(e) => setDiscount(Number(e.target.value))}
                        className="w-full bg-slate-900 border border-white/10 rounded-xl px-4 py-3.5 text-sm text-white focus:outline-none focus:ring-2 focus:ring-brand-500/50 transition-all font-bold tracking-wide"
                      />
                      {discount > 0 && (
                        <div className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[10px] text-slate-500 font-bold uppercase tracking-wider bg-slate-950 px-2 py-1 rounded border border-white/5">
                          Calculated: -Rs. {calculatedDiscount.toFixed(2)}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Payment Method large selector blocks */}
                  <div className="space-y-3">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Settle Payment Method</label>
                    <div className="grid grid-cols-3 gap-3">
                      {(['CASH', 'CARD', 'FONEPAY'] as PaymentMethod[]).map((method) => {
                        let methodDesc = 'Cash Registry';
                        if (method === 'CARD') methodDesc = 'POS Terminal';
                        if (method === 'FONEPAY') methodDesc = 'Mobile QR';
                        return (
                          <button
                            key={method}
                            type="button"
                            onClick={() => setPaymentMethod(method)}
                            className={`p-4 rounded-2xl border flex flex-col items-center justify-center gap-2 transition-all duration-200 text-left ${
                              paymentMethod === method
                                ? 'bg-brand-500/10 border-brand-500 text-brand-400 shadow-[0_0_20px_rgba(99,102,241,0.2)] ring-2 ring-brand-500/20'
                                : 'bg-slate-900 border-white/5 text-slate-500 hover:bg-slate-900/60 hover:border-white/10'
                            }`}
                          >
                            <span className="text-xs font-black uppercase tracking-wider">{method}</span>
                            <span className="text-[8px] text-slate-500 uppercase tracking-widest">{methodDesc}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="mt-8 border-t border-white/5 pt-6">
                <div className="flex gap-4">
                  <button
                    type="button"
                    onClick={() => {
                      setIsProcessModalOpen(false);
                      setDiscount(0);
                    }}
                    className="flex-1 py-4 bg-slate-900 border border-white/5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-2xl text-xs font-bold uppercase tracking-wider transition-all"
                  >
                    Cancel Settle
                  </button>
                  <button
                    type="button"
                    onClick={handleProcessSubmit}
                    disabled={processing}
                    className="flex-[2] py-4 bg-brand-500 hover:bg-brand-400 disabled:bg-slate-800 text-white rounded-2xl text-xs font-black uppercase tracking-wider transition-all flex items-center justify-center gap-2 shadow-lg shadow-brand-500/20"
                  >
                    {processing ? (
                      <div className="flex items-center gap-2">
                        <Loader2 className="animate-spin" size={14} />
                        Settle Processing...
                      </div>
                    ) : (
                      <>
                        <CheckCircle2 size={14} />
                        Finalize & Close Bill
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Digital Receipt Drawer */}
      <AnimatePresence>
        {isDetailDrawerOpen && selectedInvoice && (
          <div className="fixed inset-0 z-[100] flex justify-end">
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/80 backdrop-blur-sm"
              onClick={() => setIsDetailDrawerOpen(false)}
            />
            <motion.div
              initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 28, stiffness: 220 }}
              className="relative w-full max-w-sm h-full bg-slate-900 border-l border-white/10 shadow-2xl p-6 flex flex-col justify-between overflow-y-auto"
            >
              {/* Receipt Header */}
              <div className="space-y-4">
                <div className="flex items-center justify-between border-b border-white/5 pb-4">
                  <div className="flex items-center gap-2">
                    <Receipt className="text-brand-400" size={20} />
                    <h3 className="text-sm font-bold text-white">Digital Receipt</h3>
                  </div>
                  <button 
                    onClick={() => setIsDetailDrawerOpen(false)}
                    className="p-1.5 hover:bg-white/5 rounded-lg text-slate-400 hover:text-white transition-all text-xs font-bold"
                  >
                    ✕
                  </button>
                </div>

                {/* Printable style card ticket */}
                <div className="bg-white text-slate-900 rounded-2xl p-5 font-mono shadow-inner border border-slate-200 flex flex-col gap-4 text-xs">
                  <div className="text-center border-b border-dashed border-slate-300 pb-4">
                    <h4 className="font-black text-sm uppercase tracking-widest">
                      {bizName}
                    </h4>
                    {bizAddress && <p className="text-[10px] text-slate-500 mt-1">{bizAddress}</p>}
                    {bizPhone && <p className="text-[10px] text-slate-500">Tel: {bizPhone}</p>}
                    {user?.branchName && <p className="text-[10px] text-slate-400 mt-0.5">{user.branchName}</p>}
                    {bizPan && <p className="text-[10px] text-slate-400">PAN: {bizPan}</p>}
                  </div>

                  <div className="space-y-1.5 text-[10px]">
                    <div className="flex justify-between">
                      <span className="text-slate-500 uppercase">Receipt Code:</span>
                      <span className="font-bold uppercase">INV-{selectedInvoice.invoiceId.split('-')[0].toUpperCase()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500 uppercase">Table:</span>
                      <span className="font-bold uppercase">{selectedInvoice.tableName || 'Takeaway'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500 uppercase">Status:</span>
                      <span className="font-bold uppercase">{selectedInvoice.status}</span>
                    </div>
                    {selectedInvoice.paymentMethod && (
                      <div className="flex justify-between">
                        <span className="text-slate-500 uppercase">Paid Via:</span>
                        <span className="font-bold uppercase">{selectedInvoice.paymentMethod}</span>
                      </div>
                    )}
                  </div>

                  {/* Items List */}
                  <div className="border-t border-b border-dashed border-slate-300 py-3 my-1 space-y-2">
                    {selectedInvoice.items && selectedInvoice.items.length > 0 ? (
                      selectedInvoice.items.map((item, index) => (
                        <div key={index} className="flex justify-between items-start text-[10px] gap-2">
                          <div className="flex-1">
                            <p className="font-bold uppercase">{item.name}</p>
                            <span className="text-[9px] text-slate-500">{item.quantity} x Rs. {item.price.toFixed(2)}</span>
                          </div>
                          <span className="font-bold">Rs. {(item.quantity * item.price).toFixed(2)}</span>
                        </div>
                      ))
                    ) : (
                      <p className="text-center text-[10px] text-slate-400 py-2">No items listed</p>
                    )}
                  </div>

                  {/* Totals */}
                  <div className="space-y-1 text-[11px] font-bold">
                    <div className="flex justify-between">
                      <span className="uppercase text-slate-500">Gross Total</span>
                      <span>Rs. {selectedInvoice.netTotal.toFixed(2)}</span>
                    </div>
                    {selectedInvoice.discountAmount > 0 && (
                      <div className="flex justify-between text-rose-600">
                        <span className="uppercase font-bold">Discount Allowed</span>
                        <span>-Rs. {selectedInvoice.discountAmount.toFixed(2)}</span>
                      </div>
                    )}
                    <div className="h-px bg-slate-200 my-1" />
                    <div className="flex justify-between text-xs font-black">
                      <span className="uppercase">Net Bill Sum</span>
                      <span>Rs. {selectedInvoice.grossTotal.toFixed(2)}</span>
                    </div>
                  </div>

                  <div className="text-center border-t border-dashed border-slate-300 pt-4 mt-1">
                    <p className="text-[9px] text-slate-400 uppercase tracking-widest font-black">Thank you for dining with us!</p>
                  </div>
                </div>
              </div>

              {/* Drawer footer actions */}
              <div className="flex gap-2.5 pt-4 border-t border-white/5">
                <button
                  onClick={() => handlePrintReceipt(selectedInvoice.invoiceId)}
                  disabled={printLoading}
                  className="flex-1 py-2.5 rounded-xl border border-white/10 bg-white/5 text-xs text-white font-bold hover:bg-white/10 disabled:opacity-50 transition-all flex items-center justify-center gap-1.5"
                >
                  {printLoading ? (
                    <Loader2 size={13} className="animate-spin" />
                  ) : (
                    <Printer size={13} />
                  )}
                  Print / Save PDF
                </button>
                <button
                  onClick={() => handlePrintReceipt(selectedInvoice.invoiceId)}
                  disabled={printLoading}
                  className="flex-1 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-500 disabled:opacity-50 text-xs text-white font-bold transition-all flex items-center justify-center gap-1.5"
                >
                  <FileText size={13} /> Open Receipt
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
