'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Mail, Lock, ShieldCheck, ArrowRight, AlertCircle, Eye, EyeOff } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '@/context/AuthContext';

export default function LoginPage() {
  const router = useRouter();
  const { login } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const res = await login({ email, password });
      if (res.success) {
        router.push('/dashboard');
      } else {
        setError(res.message || 'Invalid credentials. Please check your email and password.');
        setIsLoading(false);
      }
    } catch {
      setError('An unexpected error occurred during authentication. Please try again.');
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-bgColor relative overflow-hidden p-4">
      {/* Dynamic Background Glows */}
      <motion.div
        animate={{
          rotate: [0, 360],
          scale: [1, 1.15, 1],
          opacity: [0.25, 0.45, 0.25],
        }}
        transition={{ duration: 18, repeat: Infinity, ease: 'linear' }}
        className="absolute top-[-15%] left-[-10%] w-[55%] h-[55%] bg-primary/25 blur-[120px] rounded-full pointer-events-none"
      />
      <motion.div
        animate={{
          rotate: [360, 0],
          scale: [1, 1.25, 1],
          opacity: [0.2, 0.4, 0.2],
        }}
        transition={{ duration: 22, repeat: Infinity, ease: 'linear' }}
        className="absolute bottom-[-15%] right-[-10%] w-[55%] h-[55%] bg-emerald-600/20 blur-[130px] rounded-full pointer-events-none"
      />

      {/* Main Login Card */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
        className="w-full max-w-md z-10"
      >
        {/* Brand Icon & Heading */}
        <div className="flex flex-col items-center mb-7 text-center">
          <motion.div
            whileHover={{ scale: 1.08, rotate: 3 }}
            whileTap={{ scale: 0.95 }}
            className="w-16 h-16 rounded-2xl bg-primary to-emerald-700 text-white flex items-center justify-center font-extrabold text-3xl shadow-xl shadow-primary/30 mb-4 relative overflow-hidden"
          >
            U
            <div className="absolute inset-0 bg-white/15 animate-pulse rounded-2xl" />
          </motion.div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-textColor tracking-tight">
            Urbn Furnish Admin
          </h1>
          <p className="text-xs sm:text-sm text-textMuted mt-1.5 font-medium">
            E-Commerce Portal & Order Operations
          </p>
        </div>


        {/* Form Container */}
        <div className="bg-surfaceColor/95 border border-borderColor rounded-2xl p-6 sm:p-8 shadow-2xl backdrop-blur-xl">
          <form onSubmit={handleLogin} className="space-y-5">
            <AnimatePresence>
              {error && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="bg-danger/10 border border-danger/20 text-danger text-xs p-3 rounded-xl flex items-center gap-2"
                >
                  <AlertCircle size={15} className="shrink-0" />
                  <span>{error}</span>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Email Address */}
            <div className="space-y-1.5">
              <label
                htmlFor="email"
                className="text-xs font-bold uppercase tracking-wider text-textMuted"
              >
                Admin Email
              </label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none z-10 text-textMuted group-focus-within:text-primary transition-colors">
                  <Mail size={17} />
                </div>
                <input
                  id="email"
                  type="email"
                  placeholder="superadmin@gmail.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-bgColor border border-borderColor text-textColor text-sm rounded-xl pl-10 pr-4 py-3 outline-hidden focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all placeholder:text-textMuted/40 font-medium"
                  required
                  disabled={isLoading}
                />
              </div>
            </div>

            {/* Password */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label
                  htmlFor="password"
                  className="text-xs font-bold uppercase tracking-wider text-textMuted"
                >
                  Password
                </label>
              </div>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none z-10 text-textMuted group-focus-within:text-primary transition-colors">
                  <Lock size={17} />
                </div>
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-bgColor border border-borderColor text-textColor text-sm rounded-xl pl-10 pr-10 py-3 outline-hidden focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all placeholder:text-textMuted/40 font-medium"
                  required
                  disabled={isLoading}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-textMuted hover:text-textColor transition-colors"
                >
                  {showPassword ? <EyeOff size={17} /> : <Eye size={17} />}
                </button>
              </div>
            </div>

            {/* Remember Me */}
            <div className="flex items-center justify-between pt-0.5">
              <label className="flex items-center gap-2 text-xs text-textMuted cursor-pointer select-none">
                <input
                  type="checkbox"
                  defaultChecked
                  className="h-4 w-4 rounded-md border-borderColor bg-bgColor text-primary focus:ring-primary/20 cursor-pointer accent-primary"
                />
                <span>Remember this terminal</span>
              </label>

              <span className="text-[11px] text-textMuted font-medium">
                SSL 256-bit Encrypted
              </span>
            </div>

            {/* Submit Button */}
            <motion.button
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.98 }}
              disabled={isLoading}
              type="submit"
              className={`w-full flex items-center justify-center gap-2 text-white rounded-xl px-4 py-3.5 shadow-lg shadow-primary/25 transition-all font-bold text-sm tracking-wide bg-primary hover:bg-primary-hover hover:shadow-primary/40 ${isLoading ? 'opacity-80 cursor-wait' : 'cursor-pointer'
                }`}
            >
              {isLoading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  <ShieldCheck size={18} />
                  <span>Access Admin Dashboard</span>
                  <ArrowRight size={16} />
                </>
              )}
            </motion.button>
          </form>
        </div>

        {/* Footer info */}
        <p className="mt-6 text-center text-xs text-textMuted font-medium">
          Urbn Furnish Admin Suite &bull; RBAC Module Enabled
        </p>
      </motion.div>
    </div>
  );
}

