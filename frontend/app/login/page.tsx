'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { Lock, Mail, Loader2, Sparkles } from 'lucide-react';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { login, isAuthenticated, isLoading } = useAuth();
  const { showToast } = useToast();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && isAuthenticated) {
      router.replace('/');
    }
  }, [isAuthenticated, isLoading, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      showToast('Please fill in all fields', 'warning');
      return;
    }

    setIsSubmitting(true);
    try {
      await login(email, password);
      showToast('Successfully signed in!', 'success');
      router.push('/');
    } catch (err: any) {
      showToast(err.message || 'Invalid email or password', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-zinc-950">
        <Loader2 className="w-8 h-8 text-indigo-500 animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-zinc-950 p-4 relative overflow-hidden">
      {/* Background glowing effects */}
      <div className="absolute top-1/4 left-1/4 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-indigo-500/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 translate-x-1/2 translate-y-1/2 w-96 h-96 bg-violet-500/10 rounded-full blur-[120px] pointer-events-none" />

      {/* Main card */}
      <div className="max-w-md w-full bg-zinc-900 border border-zinc-800 rounded-2xl shadow-2xl p-8 relative z-10">
        {/* Header Logo */}
        <div className="flex flex-col items-center mb-8">
          <div className="w-12 h-12 rounded-xl bg-indigo-600 flex items-center justify-center font-bold text-white text-xl tracking-wider shadow-lg shadow-indigo-600/30 mb-3">
            SP
          </div>
          <h2 className="text-2xl font-bold tracking-tight text-white flex items-center gap-1.5">
            Welcome to StockPilot <Sparkles className="w-5 h-5 text-indigo-400" />
          </h2>
          <p className="text-zinc-500 text-sm mt-1">Sign in to manage your inventory workflow</p>
        </div>

        {/* Credentials hints for quick testing */}
        <div className="mb-6 bg-zinc-950 border border-zinc-850 p-3 rounded-lg text-xs space-y-1">
          <span className="text-zinc-400 font-semibold uppercase tracking-wider block mb-1">Demo Credentials:</span>
          <div className="flex justify-between text-zinc-500">
            <span>Admin: <span className="text-indigo-400">admin@stockpilot.com</span></span>
            <span>Pass: <span className="text-zinc-400">password123</span></span>
          </div>
        </div>

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-zinc-400 text-xs font-semibold uppercase tracking-wider mb-2">
              Email Address
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-600" />
              <input
                type="email"
                required
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="w-full bg-zinc-950 border border-zinc-800 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 rounded-lg py-2.5 pl-10 pr-4 text-sm text-white placeholder-zinc-700 outline-none transition-all duration-150"
              />
            </div>
          </div>

          <div>
            <label className="block text-zinc-400 text-xs font-semibold uppercase tracking-wider mb-2">
              Password
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-600" />
              <input
                type="password"
                required
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-zinc-950 border border-zinc-800 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 rounded-lg py-2.5 pl-10 pr-4 text-sm text-white placeholder-zinc-700 outline-none transition-all duration-150"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full flex items-center justify-center gap-2 py-3 px-4 mt-6 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-sm font-semibold tracking-wide shadow-lg shadow-indigo-600/25 hover:shadow-indigo-600/35 transition-all duration-150 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Entering flight...</span>
              </>
            ) : (
              <span>Sign In</span>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
