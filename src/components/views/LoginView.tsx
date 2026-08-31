'use client';

import React, { useState } from 'react';
import { useVault } from '../../context/VaultContext';
import { Shield, Key, ArrowRight, Lock, CheckCircle2, Zap } from 'lucide-react';

export const LoginView: React.FC = () => {
  const { login } = useVault();
  const [email, setEmail] = useState('developer@keyvault.dev');
  const [password, setPassword] = useState('••••••••••••');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      login();
    }, 600);
  };

  return (
    <div className="relative flex min-h-screen w-full items-center justify-center bg-slate-50 dark:bg-slate-950 px-4 py-12 overflow-hidden transition-colors duration-200">
      {/* Dynamic Background Mesh Gradients */}
      <div className="absolute -top-40 -left-40 h-96 w-96 rounded-full bg-cyan-500/10 dark:bg-cyan-500/10 blur-3xl" />
      <div className="absolute -bottom-40 -right-40 h-96 w-96 rounded-full bg-blue-600/10 dark:bg-blue-600/10 blur-3xl" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-[500px] w-[500px] rounded-full bg-purple-500/10 dark:bg-purple-500/5 blur-3xl pointer-events-none" />

      {/* Main Glass Card */}
      <div className="relative z-10 w-full max-w-md overflow-hidden rounded-3xl border border-slate-200 dark:border-slate-800 bg-white/90 dark:bg-slate-900/80 p-8 backdrop-blur-2xl shadow-xl dark:shadow-2xl transition-all">
        {/* Top Branding Header */}
        <div className="text-center">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-tr from-cyan-500 to-blue-600 shadow-xl shadow-cyan-500/25 text-slate-950 font-bold mb-4">
            <Shield className="h-8 w-8 stroke-[2.5]" />
          </div>
          <h1 className="text-2xl font-extrabold tracking-tight text-slate-900 dark:text-white">Welcome to KeyVault</h1>
          <p className="mt-1.5 text-xs text-slate-500 dark:text-slate-400">
            Personal API Key Management & Real-time Rate Limit Telemetry
          </p>
        </div>

        {/* Feature Pills */}
        <div className="mt-6 flex items-center justify-center gap-4 border-y border-slate-200 dark:border-slate-800/80 py-3 text-[11px] text-slate-600 dark:text-slate-400">
          <span className="flex items-center gap-1 font-medium">
            <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500 dark:text-emerald-400" /> Auto-Masking
          </span>
          <span className="flex items-center gap-1 font-medium">
            <Zap className="h-3.5 w-3.5 text-cyan-500 dark:text-cyan-400" /> Live Gauge
          </span>
          <span className="flex items-center gap-1 font-medium">
            <Lock className="h-3.5 w-3.5 text-purple-500 dark:text-purple-400" /> Client Security
          </span>
        </div>

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
              Email Address
            </label>
            <div className="relative">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full rounded-xl border border-slate-300 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/80 px-4 py-2.5 text-sm text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-600 focus:border-cyan-500 focus:outline-none focus:ring-1 focus:ring-cyan-500 transition-all font-medium"
              />
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                Vault Master Passcode
              </label>
              <a href="#" onClick={(e) => e.preventDefault()} className="text-[11px] text-cyan-600 dark:text-cyan-400 hover:underline font-medium">
                Forgot passcode?
              </a>
            </div>
            <div className="relative">
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full rounded-xl border border-slate-300 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/80 px-4 py-2.5 text-sm text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-600 focus:border-cyan-500 focus:outline-none focus:ring-1 focus:ring-cyan-500 transition-all font-mono"
              />
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isLoading}
            className="group relative flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 py-3 text-sm font-bold text-slate-950 shadow-lg shadow-cyan-500/25 hover:from-cyan-400 hover:to-blue-500 transition-all disabled:opacity-70 mt-6 cursor-pointer"
          >
            {isLoading ? (
              <span className="flex items-center gap-2">
                <span className="h-4 w-4 rounded-full border-2 border-slate-950 border-t-transparent animate-spin" />
                Unlocking Vault...
              </span>
            ) : (
              <>
                <span>Access Dashboard</span>
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </>
            )}
          </button>
        </form>

        {/* Demo Quick Launch Button */}
        <div className="mt-6 text-center">
          <p className="text-xs text-slate-500 dark:text-slate-500 mb-2">— Or explore instant demo mode —</p>
          <button
            onClick={login}
            className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-100 dark:bg-slate-950/60 py-2.5 text-xs font-bold text-cyan-700 dark:text-cyan-400 hover:bg-slate-200 dark:hover:bg-slate-800 hover:text-cyan-800 dark:hover:text-cyan-300 transition-all cursor-pointer"
          >
            Enter KeyVault as Demo Admin
          </button>
        </div>
      </div>
    </div>
  );
};
