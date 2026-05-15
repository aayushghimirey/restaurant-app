import { motion, AnimatePresence } from 'framer-motion';
import { AlertTriangle, X } from 'lucide-react';

interface ConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title?: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  variant?: 'danger' | 'warning' | 'info';
  isLoading?: boolean;
}

export default function ConfirmModal({
  isOpen,
  onClose,
  onConfirm,
  title = 'Are you sure?',
  message,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  variant = 'danger',
  isLoading = false
}: ConfirmModalProps) {
  
  const colors = {
    danger: 'text-rose-500 bg-rose-500/10 border-rose-500/20',
    warning: 'text-amber-500 bg-amber-500/10 border-amber-500/20',
    info: 'text-brand-400 bg-brand-500/10 border-brand-500/20'
  };

  const btnColors = {
    danger: 'bg-rose-500 hover:bg-rose-600 shadow-rose-500/20',
    warning: 'bg-amber-500 hover:bg-amber-600 shadow-amber-500/20',
    info: 'bg-brand-500 hover:bg-brand-600 shadow-brand-500/20'
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/80 backdrop-blur-md"
            onClick={onClose}
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="relative w-full max-w-sm glass-card border-white/10 shadow-2xl p-6 overflow-hidden"
          >
            {/* Background Glow */}
            <div className={`absolute -top-24 -right-24 w-48 h-48 blur-[80px] rounded-full opacity-20 ${variant === 'danger' ? 'bg-rose-500' : 'bg-brand-500'}`} />

            <div className="flex flex-col items-center text-center space-y-4 relative z-10">
              <div className={`w-16 h-16 rounded-2xl flex items-center justify-center border ${colors[variant]}`}>
                <AlertTriangle size={32} />
              </div>
              
              <div className="space-y-2">
                <h3 className="text-xl font-bold text-white">{title}</h3>
                <p className="text-sm text-slate-400 leading-relaxed px-2">
                  {message}
                </p>
              </div>

              <div className="flex flex-col w-full gap-2 pt-2">
                <button
                  onClick={onConfirm}
                  disabled={isLoading}
                  className={`w-full py-3 rounded-xl text-white font-bold text-sm transition-all shadow-lg active:scale-95 disabled:opacity-50 ${btnColors[variant]}`}
                >
                  {isLoading ? 'Processing...' : confirmText}
                </button>
                <button
                  onClick={onClose}
                  disabled={isLoading}
                  className="w-full py-3 rounded-xl bg-white/5 hover:bg-white/10 text-slate-400 font-bold text-sm transition-all active:scale-95 border border-white/5"
                >
                  {cancelText}
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
