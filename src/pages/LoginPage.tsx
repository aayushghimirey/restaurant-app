import { useState } from 'react';
import { useNavigate, Navigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { motion } from 'framer-motion';
import { ChefHat, Mail, Lock, Eye, EyeOff, Loader2 } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { authService } from '../services/authService';
import type { LoginRequest } from '../types';

export default function LoginPage() {
  const { login, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [showPass, setShowPass] = useState(false);
  const [error, setError] = useState('');

  const { register, handleSubmit, formState: { isSubmitting, errors } } = useForm<LoginRequest>();

  if (isAuthenticated) return <Navigate to="/dashboard" replace />;

  const onSubmit = async (data: LoginRequest) => {
    setError('');
    try {
      const res = await authService.login(data);
      if (res.success) {
        login(res.data);
        navigate('/dashboard');
      } else {
        setError(res.message ?? 'Login failed');
      }
    } catch (e: unknown) {
      const msg = (e as { response?: { data?: { message?: string } } })?.response?.data?.message;
      setError(msg ?? 'Invalid credentials');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6 relative overflow-hidden">
      {/* Dynamic Background */}
      <div className="absolute top-[-10%] left-[-5%] w-[40%] h-[40%] rounded-full bg-brand-500/15 blur-[120px] pointer-events-none animate-pulse" />
      <div className="absolute bottom-[-10%] right-[-5%] w-[40%] h-[40%] rounded-full bg-accent-500/10 blur-[120px] pointer-events-none" style={{ animationDelay: '1s' }} />

      <motion.div
        initial={{ opacity: 0, y: 20, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        className="w-full max-w-md z-10"
      >
        <div className="glass p-8 md:p-10 shadow-2xl relative overflow-hidden">
          {/* Subtle light streak */}
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-brand-400 to-transparent opacity-30" />
          
          <div className="text-center mb-10">
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.2, duration: 0.5 }}
              className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-[0_10px_30px_rgba(99,102,241,0.4)]"
              style={{ background: 'linear-gradient(135deg, var(--color-brand-500), var(--color-brand-700))' }}
            >
              <ChefHat size={32} className="text-white" />
            </motion.div>
            <h1 className="text-3xl font-extrabold text-white tracking-tight mb-2">Welcome Back</h1>
            <p className="text-slate-400 text-sm font-medium">Sign in to manage your restaurant empire</p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-5">
            <div>
              <label className="input-label">Email Address</label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                  <Mail size={16} className="text-slate-500 group-focus-within:text-brand-400 transition-colors" />
                </div>
                <input
                  {...register('email', { required: 'Email is required' })}
                  type="email"
                  placeholder="admin@restaurant.com"
                  className="input-field pl-11"
                />
              </div>
              {errors.email && <p className="text-[11px] text-red-400 mt-1.5 ml-1 font-medium">{errors.email.message}</p>}
            </div>

            <div>
              <div className="flex justify-between items-center mb-1.5">
                <label className="input-label mb-0">Password</label>
                <button type="button" className="text-[11px] font-semibold text-brand-400 hover:text-brand-300 transition-colors">
                  Forgot Password?
                </button>
              </div>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                  <Lock size={16} className="text-slate-500 group-focus-within:text-brand-400 transition-colors" />
                </div>
                <input
                  {...register('password', { required: 'Password is required' })}
                  type={showPass ? 'text' : 'password'}
                  placeholder="••••••••"
                  className="input-field pl-11 pr-11"
                />
                <button 
                  type="button" 
                  onClick={() => setShowPass(v => !v)}
                  className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-500 hover:text-white transition-colors"
                >
                  {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              {errors.password && <p className="text-[11px] text-red-400 mt-1.5 ml-1 font-medium">{errors.password.message}</p>}
            </div>

            {error && (
              <motion.div 
                initial={{ opacity: 0, x: -10 }} 
                animate={{ opacity: 1, x: 0 }}
                className="px-4 py-3 rounded-xl text-sm font-medium bg-red-500/10 border border-red-500/20 text-red-400 text-center"
              >
                {error}
              </motion.div>
            )}

            <button 
              type="submit" 
              className="btn-primary w-full justify-center h-12 text-base mt-2 shadow-[0_10px_25px_-5px_rgba(99,102,241,0.4)]" 
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <Loader2 size={20} className="animate-spin" />
              ) : (
                "Sign In"
              )}
            </button>
          </form>
        </div>

        <div className="mt-8 text-center">
          <p className="text-[11px] font-bold text-slate-500 uppercase tracking-[0.2em]">
            RestaurantOS Premium v2.0
          </p>
        </div>
      </motion.div>
    </div>
  );
}
