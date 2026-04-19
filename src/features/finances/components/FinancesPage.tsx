import { useMemo, useState } from 'react';
import { 
  Wallet, 
  History, 
  FileText, 
  Receipt, 
  ArrowUpRight, 
  Calendar, 
  ChevronLeft, 
  ChevronRight, 
  Loader2, 
  CreditCard,
  Search,
  Filter
} from 'lucide-react';
import { useFinancePurchases, useFinanceInvoices } from '../api';
import { PurchaseRecordResponse, InvoiceRecordResponse } from '../types';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

type TabType = 'purchases' | 'invoices';

export default function FinancesPage() {
  const [activeTab, setActiveTab] = useState<TabType>('purchases');
  const [page, setPage] = useState(0);
  const [searchTerm, setSearchTerm] = useState('');
  
  const { data: purchaseData, isLoading: isLoadingPurchases } = useFinancePurchases({ page, size: 10 });
  const { data: invoiceData, isLoading: isLoadingInvoices } = useFinanceInvoices({ page, size: 10 });

  const isLoading = activeTab === 'purchases' ? isLoadingPurchases : isLoadingInvoices;
  const currentData = activeTab === 'purchases' ? purchaseData : invoiceData;

  const filteredRecords = useMemo(() => {
    if (!currentData?.data) return [];
    if (!searchTerm.trim()) return currentData.data;

    const term = searchTerm.toLowerCase();
    return (currentData.data as any[]).filter(record => 
      record.id.toLowerCase().includes(term) || 
      (record.purchaseId && record.purchaseId.toLowerCase().includes(term)) ||
      (record.invoiceId && record.invoiceId.toLowerCase().includes(term)) ||
      (record.billingType && record.billingType.toLowerCase().includes(term)) ||
      (record.moneyTransaction && record.moneyTransaction.toLowerCase().includes(term))
    );
  }, [currentData, searchTerm]);

  const totalPossible = activeTab === 'purchases' ? purchaseData?.totalElements || 0 : invoiceData?.totalElements || 0;
  const displayedSum = useMemo(() => {
    return (filteredRecords as any[]).reduce((acc, r) => acc + (r.grossTotal || 0), 0);
  }, [filteredRecords]);

  const handleTabChange = (tab: TabType) => {
    setActiveTab(tab);
    setPage(0);
    setSearchTerm('');
  };

  return (
    <div className="p-6 md:p-8 space-y-10 animate-in max-w-[1400px] mx-auto">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-border pb-6">
        <div className="space-y-2">
          <div className="flex items-center gap-3">
            <h2 className="text-3xl font-black tracking-tight text-foreground">Finance Accounting</h2>
            <div className="h-6 w-[1px] bg-border hidden md:block" />
          </div>
          <p className="text-muted-foreground text-sm font-medium flex items-center gap-2">
            <Wallet className="h-4 w-4" /> Audit trails and historical transaction records.
          </p>
        </div>

        <div className="flex items-center bg-muted/50 p-1 rounded-xl border border-border shadow-inner">
          <button
            onClick={() => handleTabChange('purchases')}
            className={cn(
              "px-6 py-2 rounded-lg text-xs font-bold uppercase tracking-widest transition-all text-muted-foreground",
              activeTab === 'purchases' 
                ? "bg-card text-foreground shadow-sm" 
                : "hover:text-foreground hover:bg-muted/80"
            )}
          >
            Purchase Records
          </button>
          <button
            onClick={() => handleTabChange('invoices')}
            className={cn(
               "px-6 py-2 rounded-lg text-xs font-bold uppercase tracking-widest transition-all text-muted-foreground",
              activeTab === 'invoices' 
                ? "bg-card text-foreground shadow-sm" 
                : "hover:text-foreground hover:bg-muted/80"
            )}
          >
            Invoice Records
          </button>
        </div>
      </div>

      {/* Stats/Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[
          { label: 'Total Volume', value: totalPossible, icon: History, color: 'text-blue-500' },
          { label: 'Page Settlement', value: `Rs ${displayedSum.toLocaleString()}`, icon: CreditCard, color: 'text-emerald-500' },
          { label: 'System Health', value: 'Live', icon: Filter, color: 'text-primary' },
        ].map((stat) => (
          <div
            key={stat.label}
            className="bg-card border border-border p-6 rounded-2xl flex items-center gap-5 shadow-sm"
          >
            <div className={cn("h-12 w-12 rounded-xl bg-muted/50 flex items-center justify-center border border-border", stat.color)}>
              <stat.icon className="h-5 w-5" />
            </div>
            <div>
              <p className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em]">{stat.label}</p>
              <p className="text-xl font-bold text-foreground tracking-tighter mt-1">{stat.value}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Main Table Content */}
      <div className="bg-card shadow-sm rounded-2xl overflow-hidden border border-border flex flex-col">
          <div className="p-6 border-b border-border flex flex-col md:flex-row justify-between items-center gap-4 bg-muted/20">
            <div className="flex items-center gap-3">
              <h3 className="text-sm font-bold text-foreground uppercase tracking-widest">
                {activeTab === 'purchases' ? 'System Acquisition Audit' : 'Customer Billing Audit'}
              </h3>
            </div>
            
            <div className="relative w-full md:w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <input 
                placeholder="Search record IDs..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-card border border-border rounded-xl h-10 pl-10 pr-4 text-sm font-semibold text-foreground outline-none focus:ring-2 focus:ring-primary/20 transition-all shadow-sm"
              />
            </div>
          </div>

          <div className="overflow-x-auto custom-scrollbar relative">
             {isLoading && (
              <div className="absolute inset-0 z-10 bg-background/50 flex flex-col items-center justify-center">
                <Loader2 className="h-8 w-8 text-primary animate-spin" />
              </div>
            )}
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-muted/30 border-b border-border">
                  <th className="px-6 py-4 text-[10px] uppercase tracking-[0.2em] font-black text-muted-foreground">Record Integrity</th>
                  <th className="px-6 py-4 text-[10px] uppercase tracking-[0.2em] font-black text-muted-foreground">Transaction Link</th>
                  <th className="px-6 py-4 text-[10px] uppercase tracking-[0.2em] font-black text-muted-foreground">Finance Category</th>
                  <th className="px-6 py-4 text-[10px] uppercase tracking-[0.2em] font-black text-muted-foreground text-right">Settlement Value</th>
                  <th className="px-6 py-4 text-[10px] uppercase tracking-[0.2em] font-black text-muted-foreground text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                  {activeTab === 'purchases' ? (
                    (filteredRecords as PurchaseRecordResponse[]).map((record) => (
                      <tr 
                        key={record.id}
                        className="hover:bg-muted/20 transition-colors group"
                      >
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-4">
                            <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center text-[10px] font-bold text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-all">
                              <History className="h-4 w-4" />
                            </div>
                            <div>
                              <p className="text-xs font-bold text-foreground tracking-wider font-mono">{record.id.split('-')[0]}...</p>
                              <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground font-bold uppercase mt-1">
                                <Calendar className="h-3 w-3" />
                                {new Date(record.createdDateTime).toLocaleDateString()}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <p className="text-[11px] font-bold text-foreground uppercase tracking-widest flex items-center gap-2">
                             <Receipt className="h-3.5 w-3.5 text-muted-foreground" />
                             {record.purchaseId.split('-')[0]}
                          </p>
                        </td>
                        <td className="px-6 py-4">
                           <div className="flex flex-col gap-1 items-start">
                            <span className={cn("px-2 py-0.5 rounded-md text-[9px] font-black tracking-[0.2em] uppercase border", 
                              record.billingType === 'VAT' ? "bg-emerald-50 text-emerald-600 border-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/20" : 
                              "bg-amber-50 text-amber-600 border-amber-200 dark:bg-amber-500/10 dark:text-amber-400 dark:border-amber-500/20"
                            )}>
                              {record.billingType}
                            </span>
                            <span className="text-[9px] font-black text-muted-foreground uppercase tracking-widest ml-1">
                              {record.moneyTransaction}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <div className="flex flex-col items-end">
                            <p className="text-[13px] font-black text-foreground">Rs {record.grossTotal.toLocaleString()}</p>
                            <p className="text-[9px] text-muted-foreground font-medium uppercase tracking-widest mt-0.5">VAT: Rs {record.vatAmount}</p>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-center">
                          <Button variant="ghost" size="sm" className="h-8 w-8 p-0 rounded-lg text-muted-foreground hover:text-primary hover:bg-primary/10 transition-all mx-auto">
                            <ArrowUpRight className="h-4 w-4" />
                          </Button>
                        </td>
                      </tr>
                    ))
                  ) : (
                    (filteredRecords as InvoiceRecordResponse[]).map((record) => (
                      <tr 
                        key={record.id}
                        className="hover:bg-muted/20 transition-colors group"
                      >
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-4">
                            <div className="h-10 w-10 rounded-xl bg-purple-500/10 border border-purple-200 flex items-center justify-center text-[10px] font-bold text-purple-600 group-hover:bg-purple-600 group-hover:text-white transition-all dark:bg-purple-500/10 dark:text-purple-400 dark:border-purple-500/20">
                              <FileText className="h-4 w-4" />
                            </div>
                            <div>
                               <p className="text-xs font-bold text-foreground font-mono tracking-wider">{record.id.split('-')[0]}...</p>
                               <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground font-bold uppercase mt-1">
                                <Calendar className="h-3 w-3" />
                                {new Date(record.createdDateTime).toLocaleDateString()}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                           <p className="text-[11px] font-bold text-foreground uppercase tracking-widest flex items-center gap-2">
                             <CreditCard className="h-3.5 w-3.5 text-muted-foreground" />
                             {record.invoiceId.split('-')[0]}
                          </p>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex flex-col gap-1 items-start">
                            <p className="text-[9px] font-black text-muted-foreground uppercase tracking-widest">Reservation Audit</p>
                            <div className="text-[10px] text-foreground font-bold flex flex-col gap-1 mt-1">
                               <div className="flex items-center gap-2">
                                <span className="text-emerald-500 font-black">IN:</span> {new Date(record.reservationTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                               </div>
                               <div className="flex items-center gap-2">
                                <span className="text-red-500 font-black">OUT:</span> {record.reservationEndTime ? new Date(record.reservationEndTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '--:--'}
                               </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <p className="text-[13px] font-black text-foreground">Rs {record.grossTotal.toLocaleString()}</p>
                        </td>
                        <td className="px-6 py-4 text-center">
                          <Button variant="ghost" size="sm" className="h-8 w-8 p-0 rounded-lg text-muted-foreground hover:text-primary hover:bg-primary/10 transition-all mx-auto">
                            <ArrowUpRight className="h-4 w-4" />
                          </Button>
                        </td>
                      </tr>
                    ))
                  )}

                {(!currentData || filteredRecords.length === 0) && !isLoading && (
                  <tr>
                    <td colSpan={5} className="p-12 text-center text-muted-foreground text-sm font-bold uppercase tracking-widest">
                       <div className="flex flex-col items-center gap-3">
                          <History className="h-8 w-8 opacity-20" />
                          No records found.
                       </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {currentData && currentData.totalPages > 1 && (
            <div className="border-t border-border px-6 py-4 flex flex-col sm:flex-row items-center justify-between gap-4 bg-muted/5">
              <span className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.1em]">
                Page {page + 1} of {currentData.totalPages}
              </span>
              <div className="flex gap-2">
                 <Button 
                   variant="outline" 
                   size="sm" 
                   onClick={() => setPage(p => Math.max(0, p - 1))}
                   disabled={page === 0}
                   className="h-8 rounded-lg font-bold text-xs"
                 >
                   <ChevronLeft className="h-4 w-4 mr-1" /> Prev
                 </Button>
                 <Button 
                   variant="outline" 
                   size="sm" 
                   onClick={() => setPage(p => p + 1)}
                   disabled={page >= currentData.totalPages - 1}
                   className="h-8 rounded-lg font-bold text-xs"
                 >
                   Next <ChevronRight className="h-4 w-4 ml-1" />
                 </Button>
              </div>
            </div>
          )}
      </div>
    </div>
  );
}
