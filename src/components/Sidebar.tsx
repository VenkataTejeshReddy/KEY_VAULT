'use client';

import React from 'react';
import { useVault } from '../context/VaultContext';
import { ActiveView } from '../types';
import { LayoutDashboard, Key, Server, Settings, ShieldCheck, ExternalLink, X, TrendingUp } from 'lucide-react';

interface SidebarProps {
  mobileOpen?: boolean;
  onCloseMobile?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ mobileOpen = false, onCloseMobile }) => {
  const { activeView, setActiveView, keys, services } = useVault();

  const navItems: { id: ActiveView; label: string; icon: React.FC<{ className?: string }> }[] = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'vault', label: 'API Key Vault', icon: Key },
    { id: 'service-detail', label: 'Service Detail', icon: Server },
    { id: 'forecast', label: 'Usage Forecast', icon: TrendingUp },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  const handleNavClick = (view: ActiveView) => {
    setActiveView(view);
    if (onCloseMobile) onCloseMobile();
  };

  const activeKeysCount = keys.filter((k) => k.status === 'active').length;
  const criticalServicesCount = services.filter((s) => s.statusColor === 'red').length;

  const content = (
    <div className="flex h-full flex-col justify-between p-4">
      <div className="space-y-6">
        {/* Mobile Header Close */}
        <div className="flex items-center justify-between md:hidden border-b border-slate-200 dark:border-slate-800 pb-3">
          <span className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider">Navigation</span>
          <button onClick={onCloseMobile} className="text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white">
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Navigation Menu Links */}
        <nav className="space-y-1.5">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeView === item.id;
            return (
              <button
                key={item.id}
                onClick={() => handleNavClick(item.id)}
                className={`group flex w-full items-center gap-3 rounded-xl px-3.5 py-2.5 text-xs font-semibold transition-all duration-200 ${
                  isActive
                    ? 'bg-cyan-50 dark:bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 border border-cyan-500/30 shadow-sm shadow-cyan-500/10'
                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-900 hover:text-slate-900 dark:hover:text-white border border-transparent'
                }`}
              >
                <Icon className={`h-4 w-4 transition-transform group-hover:scale-110 ${isActive ? 'text-cyan-600 dark:text-cyan-400' : 'text-slate-400 dark:text-slate-500'}`} />
                <span>{item.label}</span>
                {item.id === 'vault' && (
                  <span className="ml-auto rounded-full bg-slate-200 dark:bg-slate-800 px-2 py-0.5 text-[10px] font-mono text-cyan-700 dark:text-cyan-300 font-semibold border border-slate-300 dark:border-slate-700">
                    {keys.length}
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Bottom Health & Key Count Widget */}
      <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-100/80 dark:bg-slate-900/60 p-3.5 space-y-2">
        <div className="flex items-center justify-between text-xs">
          <span className="text-slate-600 dark:text-slate-400 flex items-center gap-1.5">
            <ShieldCheck className="h-3.5 w-3.5 text-emerald-500 dark:text-emerald-400" />
            Active Vault Keys
          </span>
          <span className="font-mono font-bold text-slate-900 dark:text-white">{activeKeysCount}</span>
        </div>
        <div className="flex items-center justify-between text-xs">
          <span className="text-slate-600 dark:text-slate-400">Health Alerts</span>
          {criticalServicesCount > 0 ? (
            <span className="font-mono font-bold text-red-600 dark:text-red-400 bg-red-100 dark:bg-red-500/10 px-2 py-0.5 rounded border border-red-300 dark:border-red-500/30">
              {criticalServicesCount} Critical
            </span>
          ) : (
            <span className="font-mono font-bold text-emerald-600 dark:text-emerald-400">All Good</span>
          )}
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className="hidden md:flex w-64 flex-col shrink-0 border-r border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-slate-950/60 backdrop-blur-xl">
        {content}
      </aside>

      {/* Mobile Sidebar Overlay Drawer */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 md:hidden bg-slate-900/40 dark:bg-slate-950/80 backdrop-blur-md flex">
          <div className="w-64 max-w-xs bg-white dark:bg-slate-950 border-r border-slate-200 dark:border-slate-800 h-full">
            {content}
          </div>
          <div className="flex-1" onClick={onCloseMobile} />
        </div>
      )}
    </>
  );
};
