'use client';

import React, { useState, useEffect } from 'react';
import { useVault } from '../context/VaultContext';
import { Shield, Sun, Moon, Search, Zap, User, Menu, Bell } from 'lucide-react';

interface NavbarProps {
  onToggleSidebarMobile?: () => void;
}

interface NotificationItem {
  id: string;
  title: string;
  message: string;
  time: string;
  type: 'critical' | 'warning' | 'info';
  read: boolean;
  actionLabel?: string;
  action?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ onToggleSidebarMobile }) => {
  const {
    activeView,
    theme,
    toggleTheme,
    tier,
    usedRequests,
    getMaxRateLimit,
    alertThreshold,
    logout,
    services,
    openIncidents,
    openServiceDetail,
  } = useVault();
  const maxLimit = getMaxRateLimit();
  const percentage = Math.round((usedRequests / maxLimit) * 100);
  const isAlerting = percentage >= alertThreshold;

  const [isNotificationOpen, setIsNotificationOpen] = useState(false);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);

  useEffect(() => {
    const list: NotificationItem[] = [];

    if (percentage >= 90) {
      list.push({
        id: 'notif-rate-crit',
        title: 'Critical Rate Limit Quota (90%+)',
        message: `Global rate limit at ${percentage}% (${usedRequests}/${maxLimit} req/min). Upstream 429 errors may occur.`,
        time: 'Just now',
        type: 'critical',
        read: false,
      });
    } else if (percentage >= alertThreshold) {
      list.push({
        id: 'notif-rate-warn',
        title: 'Rate Limit Warning Threshold Reached',
        message: `Global rate limit at ${percentage}% (${usedRequests}/${maxLimit} req/min).`,
        time: '1 min ago',
        type: 'warning',
        read: false,
      });
    }

    const warningServices = services.filter((s) => s.status === 'warning' || s.status === 'critical' || s.used / s.limit >= 0.8);
    warningServices.forEach((s) => {
      list.push({
        id: `notif-svc-${s.id}`,
        title: `${s.name} Quota Alert (${Math.round((s.used / s.limit) * 100)}%)`,
        message: `${s.name} has consumed ${s.used} of ${s.limit} allocated monthly requests.`,
        time: '5 mins ago',
        type: s.status === 'critical' ? 'critical' : 'warning',
        read: false,
        actionLabel: 'Inspect Service',
        action: () => openServiceDetail(s.id),
      });
    });

    list.push({
      id: 'notif-inc-1',
      title: 'Incident Black Box Ready',
      message: 'AI Root Cause Replay and event correlation engine ready for incident simulations.',
      time: '10 mins ago',
      type: 'info',
      read: true,
      actionLabel: 'View Incidents',
      action: () => openIncidents(),
    });

    setNotifications(list);
  }, [percentage, alertThreshold, usedRequests, maxLimit, services]);

  const unreadCount = notifications.filter((n) => !n.read).length;

  const viewTitles: Record<string, string> = {
    dashboard: 'Dashboard Telemetry',
    vault: 'API Key Vault',
    'service-detail': 'Service Telemetry Detail',
    forecast: 'Predictive Forecast',
    incidents: 'Incident Black Box & AI SRE',
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

        {/* Notifications Icon with Popover */}
        <div className="relative">
          <button
            onClick={() => setIsNotificationOpen((prev) => !prev)}
            className={`relative rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-100 dark:bg-slate-900 p-2 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-all cursor-pointer ${
              unreadCount > 0 ? 'border-amber-500/50 text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-500/10' : ''
            }`}
            title={unreadCount > 0 ? `${unreadCount} unread system notifications` : 'System notifications'}
          >
            <Bell className="h-4 w-4" />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[9px] font-bold text-white shadow-sm">
                {unreadCount}
              </span>
            )}
          </button>

          {/* Notifications Dropdown Panel */}
          {isNotificationOpen && (
            <div className="absolute right-0 mt-2 w-80 sm:w-96 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 shadow-2xl backdrop-blur-2xl z-50 animate-fade-in text-xs space-y-3">
              <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-2.5">
                <div className="flex items-center gap-2">
                  <Bell className="h-4 w-4 text-cyan-600 dark:text-cyan-400" />
                  <span className="font-bold text-slate-900 dark:text-white text-sm">System Notifications</span>
                </div>
                {unreadCount > 0 && (
                  <button
                    onClick={() => setNotifications((prev) => prev.map((n) => ({ ...n, read: true })))}
                    className="text-[11px] font-semibold text-cyan-600 dark:text-cyan-400 hover:underline cursor-pointer"
                  >
                    Mark all as read
                  </button>
                )}
              </div>

              <div className="max-h-72 overflow-y-auto space-y-2 pr-1 divide-y divide-slate-100 dark:divide-slate-800/60">
                {notifications.length === 0 ? (
                  <p className="text-center py-6 text-slate-400">No active alerts. All systems normal.</p>
                ) : (
                  notifications.map((notif) => (
                    <div
                      key={notif.id}
                      className={`pt-2 flex items-start gap-2.5 p-2 rounded-xl transition-colors ${
                        notif.read ? 'opacity-70 bg-transparent' : 'bg-slate-50 dark:bg-slate-800/50'
                      }`}
                    >
                      <div className="mt-0.5 shrink-0">
                        {notif.type === 'critical' ? (
                          <span className="flex h-2 w-2 rounded-full bg-red-500" />
                        ) : notif.type === 'warning' ? (
                          <span className="flex h-2 w-2 rounded-full bg-amber-500" />
                        ) : (
                          <span className="flex h-2 w-2 rounded-full bg-cyan-500" />
                        )}
                      </div>
                      <div className="flex-1 space-y-1">
                        <p className="font-semibold text-slate-800 dark:text-slate-200">{notif.title}</p>
                        <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">{notif.message}</p>
                        <div className="flex items-center justify-between pt-1">
                          <span className="text-[10px] font-mono text-slate-400">{notif.time}</span>
                          {notif.action && (
                            <button
                              onClick={() => {
                                notif.action?.();
                                setIsNotificationOpen(false);
                              }}
                              className="text-[10px] font-bold text-cyan-600 dark:text-cyan-400 hover:underline cursor-pointer"
                            >
                              {notif.actionLabel || 'View Details'} →
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

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
