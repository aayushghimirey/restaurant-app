import { useState } from 'react';
import { DateSelection } from '../types';
import { useReservationDashboard, usePurchaseDashboard, useFinanceDashboard } from '../api/queries/useDashboardData';
import { StatsCard } from './StatsCard';
import { 
  ShoppingCart, 
  Wallet, 
  Receipt,
  UtensilsCrossed,
  XCircle,
  CheckCircle2,
  CalendarDays,
  TrendingUp,
  Landmark
} from 'lucide-react';
import { cn } from '@/lib/utils';

export default function DashboardPage() {
  const [period, setPeriod] = useState<DateSelection>(DateSelection.TODAY);

  const { data: reservations, isLoading: isReservationsLoading } = useReservationDashboard(period);
  const { data: purchases, isLoading: isPurchasesLoading } = usePurchaseDashboard(period);
  const { data: finances, isLoading: isFinancesLoading } = useFinanceDashboard(period);

  const formatCurrency = (amount: number = 0) => {
    return new Intl.NumberFormat('en-NP', {
      style: 'currency',
      currency: 'NPR',
      minimumFractionDigits: 2,
    }).format(amount).replace('NPR', 'Rs');
  };

  const periods = [
    { id: DateSelection.TODAY, label: 'Today' },
    { id: DateSelection.WEEK, label: 'This Week' },
    { id: DateSelection.MONTH, label: 'This Month' },
  ];

  return (
    <div className="p-6 space-y-8 animate-in">
      {/* Header & Period Selector */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h1 className="text-3xl font-black tracking-tight text-white">Dashboard</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Real-time overview of your restaurant's performance.
          </p>
        </div>

        <div className="flex p-1 bg-white/5 backdrop-blur-xl rounded-xl border border-white/5 w-fit">
          {periods.map((p) => (
            <button
              key={p.id}
              onClick={() => setPeriod(p.id)}
              className={cn(
                "px-6 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all duration-300",
                period === p.id 
                  ? "bg-primary text-white shadow-lg shadow-primary/20" 
                  : "text-muted-foreground hover:text-white"
              )}
            >
              {p.label}
            </button>
          ))}
        </div>
      </div>

      {/* 1. Reservations Section */}
      <section className="space-y-4">
        <div className="flex items-center gap-2 mb-2">
          <div className="h-6 w-1 bg-primary rounded-full" />
          <h2 className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground">Reservation Orders</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <StatsCard
            title="Total Orders"
            value={reservations?.orderCount ?? 0}
            icon={<UtensilsCrossed className="h-5 w-5" />}
            isLoading={isReservationsLoading}
            description="Total reservations received"
          />
          <StatsCard
            title="Success Orders"
            value={reservations?.successOrderCount ?? 0}
            icon={<CheckCircle2 className="h-5 w-5" />}
            isLoading={isReservationsLoading}
            className="border-emerald-500/20"
            description="Completed & paid orders"
          />
          <StatsCard
            title="Cancelled Orders"
            value={reservations?.cancelledCount ?? 0}
            icon={<XCircle className="h-5 w-5" />}
            isLoading={isReservationsLoading}
            className="border-rose-500/20"
            description="Dropped or voided"
          />
        </div>
      </section>

      {/* 2. Purchases Section */}
      <section className="space-y-4">
        <div className="flex items-center gap-2 mb-2">
          <div className="h-6 w-1 bg-amber-500 rounded-full" />
          <h2 className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground">Procurement</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <StatsCard
            title="Purchase Count"
            value={purchases?.purchaseCount ?? 0}
            icon={<ShoppingCart className="h-5 w-5" />}
            isLoading={isPurchasesLoading}
            description="Stock intake sessions"
          />
          <StatsCard
            title="Total Expenditure"
            value={formatCurrency(purchases?.purchaseAmount)}
            icon={<Wallet className="h-5 w-5" />}
            isLoading={isPurchasesLoading}
            description="Funds spent on inventory"
          />
        </div>
      </section>

      {/* 3. Finance Section */}
      <section className="space-y-4">
        <div className="flex items-center gap-2 mb-2">
          <div className="h-6 w-1 bg-emerald-500 rounded-full" />
          <h2 className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground">Financial Summary</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <StatsCard
            title="Total Revenue"
            value={formatCurrency(finances?.totalInvoiceRevenue)}
            icon={<TrendingUp className="h-5 w-5" />}
            isLoading={isFinancesLoading}
            className="border-emerald-500/20"
            description="Gross sales from invoices"
          />
          <StatsCard
            title="Total Expenses"
            value={formatCurrency(finances?.totalPurchaseExpense)}
            icon={<Landmark className="h-5 w-5" />}
            isLoading={isFinancesLoading}
            className="border-rose-500/20"
            description="Operating purchase costs"
          />
          <StatsCard
            title="VAT Paid"
            value={formatCurrency(finances?.totalVatPaid)}
            icon={<Receipt className="h-5 w-5" />}
            isLoading={isFinancesLoading}
            description="Total value added tax"
          />
        </div>
      </section>
    </div>
  );
}
