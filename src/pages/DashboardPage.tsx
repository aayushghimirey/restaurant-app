import { motion } from 'framer-motion';
import { Building2, GitBranch, Shield, Users, ChefHat, CheckCircle2, AlertTriangle } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useQuery } from '@tanstack/react-query';
import { tenantService } from '../services/tenantService';

const container = { hidden: {}, show: { transition: { staggerChildren: 0.08 } } };
const item = { hidden: { opacity: 0, y: 16 }, show: { opacity: 1, y: 0, transition: { duration: 0.4 } } };

interface StatCardProps {
  icon: React.ElementType;
  label: string;
  value: string;
  color: string;
  description: string;
}

function StatCard({ icon: Icon, label, value, color, description }: StatCardProps) {
  return (
    <motion.div variants={item} className="glass p-5 flex flex-col gap-4 group hover:-translate-y-1 transition-transform duration-300">
      <div className="flex items-center justify-between">
        <div className="w-10 h-10 rounded-xl flex items-center justify-center"
          style={{ background: `${color}18`, border: `1px solid ${color}28` }}>
          <Icon size={18} style={{ color }} />
        </div>
        <span className="text-2xl font-bold text-white">{value}</span>
      </div>
      <div>
        <p className="text-sm font-semibold text-slate-300">{label}</p>
        <p className="text-xs text-slate-600 mt-0.5">{description}</p>
      </div>
    </motion.div>
  );
}

export default function DashboardPage() {
  const { user, isSuperAdmin } = useAuth();

  const { data: statsData } = useQuery({
    queryKey: ['tenant-stats'],
    queryFn: () => tenantService.getStats(),
    enabled: !!isSuperAdmin,
  });

  const stats = statsData?.data;

  const superAdminCards: StatCardProps[] = [
    { icon: Building2,  label: 'Total Tenants',  value: stats ? stats.totalTenants.toString() : '—', color: '#6366f1', description: 'Registered restaurant groups' },
    { icon: CheckCircle2, label: 'Active Tenants', value: stats ? stats.activeTenants.toString() : '—', color: '#34d399', description: 'Operational accounts' },
    { icon: AlertTriangle, label: 'Suspended Tenants', value: stats ? stats.suspendedTenants.toString() : '—', color: '#ef4444', description: 'Terminated or blocked' },
    { icon: Building2,  label: 'Inactive Tenants', value: stats ? stats.inactiveTenants.toString() : '—', color: '#64748b', description: 'Deactivated accounts' },
  ];

  const tenantCards: StatCardProps[] = [
    { icon: GitBranch, label: 'Branches',  value: '—', color: '#f97316', description: 'Active restaurant locations' },
    { icon: Shield,    label: 'Roles',     value: '—', color: '#60a5fa', description: 'Permission sets defined' },
    { icon: Users,     label: 'Staff',     value: '—', color: '#34d399', description: 'Team members across branches' },
  ];

  const cards = isSuperAdmin ? superAdminCards : tenantCards;


  return (
    <div className="max-w-6xl mx-auto">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -12 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <div className="flex items-center gap-3 mb-1">
          <div className="w-8 h-8 rounded-xl flex items-center justify-center"
            style={{ background: 'linear-gradient(135deg, var(--color-brand-500), var(--color-brand-700))' }}>
            <ChefHat size={16} className="text-white" />
          </div>
          <h1 className="text-xl font-bold text-white">Dashboard</h1>
        </div>
        <p className="text-sm text-slate-500 ml-11">
          Good to see you, <span className="text-slate-300 font-medium">{user?.email}</span>
        </p>
      </motion.div>

      {/* Stats */}
      <motion.div
        variants={container}
        initial="hidden"
        animate="show"
        className={`grid gap-4 ${isSuperAdmin ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-4' : 'grid-cols-1 sm:grid-cols-3'}`}
      >
        {cards.map(c => <StatCard key={c.label} {...c} />)}
      </motion.div>

      {/* Info banner */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.35 }}
        className="mt-6 glass p-5 flex items-start gap-4"
      >
        <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0"
          style={{ background: 'rgba(249,115,22,0.12)', border: '1px solid rgba(249,115,22,0.2)' }}>
          <ChefHat size={17} style={{ color: 'var(--color-brand-400)' }} />
        </div>
        <div>
          <p className="text-sm font-semibold text-white mb-0.5">RestaurantOS</p>
          <p className="text-xs text-slate-500 leading-relaxed">
            {isSuperAdmin
              ? 'You are logged in as Super Admin. Use the Tenants section to manage restaurant groups.'
              : 'Manage your restaurant branches, assign roles, and onboard staff from the sidebar navigation.'}
          </p>
        </div>
      </motion.div>
    </div>
  );
}
