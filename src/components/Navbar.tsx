'use client';

import React from 'react';
import { useVault } from '../context/VaultContext';
import { Shield, Sun, Moon, Search, Zap, User, Menu, Bell } from 'lucide-react';

interface NavbarProps {
  onToggleSidebarMobile?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ onToggleSidebarMobile }) => {
  const { activeView, theme, toggleTheme, tier, usedRequests, getMaxRateLimit, alertThreshold, logout } = useVault();
  const maxLimit = getMaxRateLimit();
  const percentage = Math.round((usedRequests / maxLimit) * 100);
  const isAlerting = percentage >= alertThreshold;

  const viewTitles: Record<string, string> = {
    dashboard: 'Dashboard Telemetry',
    vault: 'API Key Vault',
    'service-detail': 'Service Telemetry Detail',
    forecast: 'Predictive Forecast',
    settings: 'Vault & Rate Settings',
  };

  return (
    <header className="sticky top-0 z-30 flex h-16 w-full items-center justify-between border-b border-slate-200 dark:border-slate-800/80 bg-white/90 dark:bg-slate-950/80 px-4 md:px-6 backdrop-blur-xl transition-colors">
      <div className="flex items-center gap-3">
        {/* Mobile menu trigger */}
        <button
          onClick={onToggleSidebarMobile}
          className="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-100 dark:bg-slate-900 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors md:hidden"
        >
          <Menu className="h-5 w-5" />
        </button>

        {/* Brand Logo & Name */}
        <div className="flex items-center gap-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-tr from-cyan-500 to-blue-600 shadow-md shadow-cyan-500/20 text-slate-950 font-bold">
            <Shield className="h-5 w-5 stroke-[2.5]" />
          </div>
          <div>
            <span className="text-base font-extrabold tracking-tight text-slate-900 dark:text-white flex items-center gap-1.5">
              KeyVault
              <span className="h-2 w-2 rounded-full bg-cyan-400 animate-ping" />
            </span>
            <span className="hidden sm:block text-[10px] uppercase font-mono tracking-widest text-slate-500 dark:text-slate-400">
              API Security & Telemetry
            </span>
          </div>
        </div>

        {/* Current View Breadcrumb */}
        <div className="hidden lg:flex items-center gap-2 pl-4 border-l border-slate-200 dark:border-slate-800 text-sm font-semibold text-slate-500 dark:text-slate-300">
          <span>/</span>
          <span className="text-cyan-600 dark:text-cyan-400 font-bold">{viewTitles[activeView] || 'Overview'}</span>
        </div>
      </div>

      {/* Center Search bar */}
      <div className="hidden md:flex items-center relative w-72">
        <Search className="absolute left-3 h-4 w-4 text-slate-400 dark:text-slate-500" />
        <input
          type="text"
          placeholder="Search API keys, services, or endpoints..."
          className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-100/90 dark:bg-slate-900/90 pl-9 pr-4 py-1.5 text-xs text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:border-cyan-500/60 focus:outline-none focus:ring-1 focus:ring-cyan-500/60 font-medium transition-all"
        />
      </div>

      {/* Right Controls */}
      <div className="flex items-center gap-3">
        {/* Tier badge */}
        <div className="hidden sm:flex items-center gap-1.5 rounded-full border border-cyan-500/30 bg-cyan-50 dark:bg-cyan-500/10 px-3 py-1 text-xs font-mono font-semibold text-cyan-700 dark:text-cyan-300">
          <Zap className="h-3.5 w-3.5 text-cyan-500 dark:text-cyan-400" />
          <span className="uppercase">{tier}</span>
          <span className="text-slate-500 dark:text-slate-400">({maxLimit}/m)</span>
        </div>

        {/* Notifications Icon with indicator */}
        <button
          className={`relative rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-100 dark:bg-slate-900 p-2 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-all ${
            isAlerting ? 'border-amber-500/50 text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-500/10' : ''
          }`}
          title={isAlerting ? `Alert: Rate usage at ${percentage}%` : 'System notifications clear'}
        >
          <Bell className="h-4 w-4" />
          {isAlerting && (
            <span className="absolute -top-1 -right-1 flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-amber-500"></span>
            </span>
          )}
        </button>

        {/* Theme Toggle Button */}
        <button
          onClick={toggleTheme}
          title={`Switch to ${theme === 'dark' ? 'Light' : 'Dark'} Mode`}
          className="rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-100 dark:bg-slate-900 p-2 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200 dark:hover:bg-slate-800 transition-all"
        >
          {theme === 'dark' ? <Sun className="h-4 w-4 text-amber-400" /> : <Moon className="h-4 w-4 text-cyan-600" />}
        </button>

        {/* User Profile Avatar / Logout */}
        <div className="flex items-center gap-2 pl-2 border-l border-slate-200 dark:border-slate-800">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-tr from-purple-500 to-indigo-600 text-white font-bold text-xs shadow-inner">
            KV
          </div>
          <button
            onClick={logout}
            className="hidden sm:block text-xs font-semibold text-slate-500 dark:text-slate-400 hover:text-red-500 dark:hover:text-red-400 transition-colors"
          >
            Sign Out
          </button>
        </div>
      </div>
    </header>
  );
};
