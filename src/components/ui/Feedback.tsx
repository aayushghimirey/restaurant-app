import { motion } from 'framer-motion';
import { Loader2 } from 'lucide-react';

interface SpinnerProps { size?: number; label?: string; }

export function Spinner({ size = 20, label = 'Loading…' }: SpinnerProps) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 py-12 text-slate-500">
      <Loader2 size={size} className="animate-spin" style={{ color: 'var(--color-brand-500)' }} />
      <span className="text-sm">{label}</span>
    </div>
  );
}

export function PageLoader() {
  return (
    <div className="flex-1 flex items-center justify-center">
      <Spinner size={32} />
    </div>
  );
}

interface EmptyStateProps { icon?: React.ReactNode; title: string; description?: string; action?: React.ReactNode; }

export function EmptyState({ icon, title, description, action }: EmptyStateProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-col items-center justify-center gap-3 py-16 text-center"
    >
      {icon && (
        <div className="w-14 h-14 rounded-2xl flex items-center justify-center text-slate-600"
          style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)' }}>
          {icon}
        </div>
      )}
      <div>
        <p className="font-semibold text-slate-300 text-sm">{title}</p>
        {description && <p className="text-xs text-slate-600 mt-1">{description}</p>}
      </div>
      {action}
    </motion.div>
  );
}

interface ErrorBannerProps { message: string; }
export function ErrorBanner({ message }: ErrorBannerProps) {
  return (
    <div className="mx-auto mt-4 max-w-md rounded-xl px-4 py-3 text-sm text-red-400"
      style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.15)' }}>
      {message}
    </div>
  );
}
