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
  TrendingUp,
  Landmark,
  LayoutDashboard
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';

const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 24 } }
};

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
    <motion.div 
      variants={containerVariants}
      initial="hidden"
      animate="show"
      className="p-6 md:p-8 max-w-7xl mx-auto space-y-12"
    >
      {/* Header & Period Selector */}
      <motion.div variants={itemVariants} className="flex flex-col md:flex-row md:items-end justify-between gap-6 relative z-20">
        <div className="flex items-center gap-4">
          <div className="h-14 w-14 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary shadow-lg shadow-primary/5">
            <LayoutDashboard className="h-7 w-7" />
          </div>
          <div>
            <h1 className="text-4xl font-black tracking-tight text-white drop-shadow-sm">Dashboard</h1>
            <p className="text-sm font-medium text-muted-foreground mt-1">
              Real-time overview of your restaurant's performance.
            </p>
          </div>
        </div>

        <div className="flex p-1.5 bg-white/5 backdrop-blur-2xl rounded-2xl border border-white/10 w-fit relative shadow-xl">
          {periods.map((p) => (
            <button
              key={p.id}
              onClick={() => setPeriod(p.id)}
              className={cn(
                "relative px-6 py-2.5 rounded-xl text-[11px] font-black uppercase tracking-widest transition-all duration-300 z-10",
                period === p.id 
                  ? "text-white" 
                  : "text-muted-foreground hover:text-white/80"
              )}
            >
              {period === p.id && (
                <motion.div
                  layoutId="activePeriod"
                  className="absolute inset-0 bg-primary rounded-xl shadow-lg shadow-primary/20"
                  transition={{ type: "spring", stiffness: 300, damping: 24 }}
                />
              )}
              <span className="relative z-20">{p.label}</span>
            </button>
          ))}
        </div>
      </motion.div>

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-8">
        
        {/* Left Column: Reservations & Purchases */}
        <div className="xl:col-span-8 space-y-8">
          
          {/* 1. Reservations Section */}
          <motion.section variants={itemVariants} className="space-y-4 relative">
            <div className="absolute -left-6 top-0 bottom-0 w-1 bg-gradient-to-b from-primary/50 to-transparent rounded-r-full hidden md:block" />
            <div className="flex items-center gap-3 mb-4">
              <div className="h-8 w-8 rounded-lg bg-primary/20 flex items-center justify-center text-primary">
                <UtensilsCrossed className="h-4 w-4" />
              </div>
              <h2 className="text-xs font-black uppercase tracking-[0.25em] text-white/80">Reservation Orders</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <StatsCard
                title="Total Orders"
                value={reservations?.orderCount ?? 0}
                icon={<UtensilsCrossed className="h-6 w-6" />}
                isLoading={isReservationsLoading}
                description="Total reservations received"
              />
              <StatsCard
                title="Success Orders"
                value={reservations?.successOrderCount ?? 0}
                icon={<CheckCircle2 className="h-6 w-6" />}
                isLoading={isReservationsLoading}
                className="border-emerald-500/20 hover:shadow-emerald-500/5"
                description="Completed & paid orders"
              />
              <StatsCard
                title="Cancelled Orders"
                value={reservations?.cancelledCount ?? 0}
                icon={<XCircle className="h-6 w-6" />}
                isLoading={isReservationsLoading}
                className="border-rose-500/20 hover:shadow-rose-500/5"
                description="Dropped or voided"
              />
            </div>
          </motion.section>

          {/* 2. Purchases Section */}
          <motion.section variants={itemVariants} className="space-y-4 relative">
             <div className="absolute -left-6 top-0 bottom-0 w-1 bg-gradient-to-b from-amber-500/50 to-transparent rounded-r-full hidden md:block" />
            <div className="flex items-center gap-3 mb-4">
               <div className="h-8 w-8 rounded-lg bg-amber-500/20 flex items-center justify-center text-amber-500">
                <ShoppingCart className="h-4 w-4" />
              </div>
              <h2 className="text-xs font-black uppercase tracking-[0.25em] text-white/80">Procurement</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <StatsCard
                title="Purchase Count"
                value={purchases?.purchaseCount ?? 0}
                icon={<ShoppingCart className="h-6 w-6" />}
                isLoading={isPurchasesLoading}
                description="Stock intake sessions"
              />
              <StatsCard
                title="Total Expenditure"
                value={formatCurrency(purchases?.purchaseAmount)}
                icon={<Wallet className="h-6 w-6" />}
                isLoading={isPurchasesLoading}
                description="Funds spent on inventory"
              />
            </div>
          </motion.section>
        </div>

        {/* Right Column: Finance Section */}
        <div className="xl:col-span-4">
          <motion.section variants={itemVariants} className="space-y-4 h-full relative">
            <div className="absolute -left-6 top-0 bottom-0 w-1 bg-gradient-to-b from-emerald-500/50 to-transparent rounded-r-full hidden md:block" />
             <div className="flex items-center gap-3 mb-4">
               <div className="h-8 w-8 rounded-lg bg-emerald-500/20 flex items-center justify-center text-emerald-500">
                <Landmark className="h-4 w-4" />
              </div>
              <h2 className="text-xs font-black uppercase tracking-[0.25em] text-white/80">Financial Summary</h2>
            </div>
            <div className="grid grid-cols-1 gap-6 h-[calc(100%-3rem)]">
              <StatsCard
                title="Total Revenue"
                value={formatCurrency(finances?.totalInvoiceRevenue)}
                icon={<TrendingUp className="h-6 w-6" />}
                isLoading={isFinancesLoading}
                className="border-emerald-500/20 hover:shadow-emerald-500/5 bg-emerald-500/[0.02]"
                description="Gross sales from invoices"
              />
              <StatsCard
                title="Total Expenses"
                value={formatCurrency(finances?.totalPurchaseExpense)}
                icon={<Landmark className="h-6 w-6" />}
                isLoading={isFinancesLoading}
                className="border-rose-500/20 hover:shadow-rose-500/5 bg-rose-500/[0.02]"
                description="Operating purchase costs"
              />
              <StatsCard
                title="VAT Paid"
                value={formatCurrency(finances?.totalVatPaid)}
                icon={<Receipt className="h-6 w-6" />}
                isLoading={isFinancesLoading}
                className="border-blue-500/20 hover:shadow-blue-500/5 bg-blue-500/[0.02]"
                description="Total value added tax"
              />
            </div>
          </motion.section>
        </div>

      </div>
    </motion.div>
  );
}
