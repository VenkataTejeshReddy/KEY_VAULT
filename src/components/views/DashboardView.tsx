'use client';

import React, { useState } from 'react';
import { useVault } from '../../context/VaultContext';
import { RateLimitGauge } from '../widgets/RateLimitGauge';
import { UsageCharts } from '../widgets/UsageCharts';
import { AddKeyModal } from '../modals/AddKeyModal';
import {
  Server,
  Plus,
  ArrowUpRight,
  ShieldCheck,
  AlertTriangle,
  Clock,
  ExternalLink,
  ChevronRight,
  Sparkles,
  TrendingUp,
  Eye,
  EyeOff,
  SlidersHorizontal,
  X,
} from 'lucide-react';

// Convert stored resetTime string to friendly label
function formatResetLabel(resetTime: string): string {
  const t = (resetTime || '').toLowerCase().trim();
  if (t === '1h' || t === '60m') return 'Resets every hour';
  if (t === '24h' || t === '1d') return 'Resets every 24h';
  if (t === '30d') return 'Resets every 30 days';
  if (t.endsWith('h')) {
    const h = parseInt(t);
    return isNaN(h) ? `Resets: ${resetTime}` : `Resets every ${h}h`;
  }
  if (t.endsWith('d')) {
    const d = parseInt(t);
    return isNaN(d) ? `Resets: ${resetTime}` : `Resets every ${d} days`;
  }
  return `Resets: ${resetTime}`;
}

export const DashboardView: React.FC = () => {
  const {
    services, openServiceDetail, keys, simulateApiCall, openForecast, forecasts,
    visibleServiceIds, toggleServiceVisibility,
  } = useVault();
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isManagePanelOpen, setIsManagePanelOpen] = useState(false);

  const visibleServices = services.filter((s) =>
    visibleServiceIds.size === 0 || visibleServiceIds.has(s.id)
  );

  const criticalForecast = forecasts.find((f) => f.riskLevel === 'critical');

  // Status color pill helper
  const getStatusBadge = (color: string, status: string) => {
    switch (color) {
      case 'red':
        return (
          <span className="flex items-center gap-1 text-[11px] font-bold text-red-700 dark:text-red-400 bg-red-100 dark:bg-red-500/10 px-2.5 py-0.5 rounded-full border border-red-300 dark:border-red-500/30 font-mono">
            <span className="h-1.5 w-1.5 rounded-full bg-red-500 animate-pulse" />
            CRITICAL (&gt;90%)
          </span>
        );
      case 'yellow':
        return (
          <span className="flex items-center gap-1 text-[11px] font-bold text-amber-700 dark:text-amber-400 bg-amber-100 dark:bg-amber-500/10 px-2.5 py-0.5 rounded-full border border-amber-300 dark:border-amber-500/30 font-mono">
            <span className="h-1.5 w-1.5 rounded-full bg-amber-500 dark:bg-amber-400" />
            WARNING (70–90%)
          </span>
        );
      case 'green':
      default:
        return (
          <span className="flex items-center gap-1 text-[11px] font-bold text-emerald-700 dark:text-emerald-400 bg-emerald-100 dark:bg-emerald-500/10 px-2.5 py-0.5 rounded-full border border-emerald-300 dark:border-emerald-500/30 font-mono">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 dark:bg-emerald-400" />
            HEALTHY (&lt;70%)
          </span>
        );
    }
  };

  // Progress bar color generator
  const getProgressBarColor = (color: string) => {
    switch (color) {
      case 'red':
        return 'bg-gradient-to-r from-red-500 to-rose-600 shadow-[0_0_12px_rgba(239,68,68,0.4)]';
      case 'yellow':
        return 'bg-gradient-to-r from-amber-400 to-yellow-500 shadow-[0_0_12px_rgba(245,158,11,0.4)]';
      case 'green':
      default:
        return 'bg-gradient-to-r from-emerald-500 to-teal-400 shadow-[0_0_12px_rgba(16,185,129,0.4)]';
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Top Banner Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">API Key Telemetry Dashboard</h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Real-time API quota limits, internal rate consumption, and connected services overview
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => simulateApiCall()}
            className="flex items-center gap-1.5 rounded-xl border border-cyan-500/30 dark:border-cyan-500/40 bg-cyan-500/10 dark:bg-cyan-950/40 px-3.5 py-2 text-xs font-semibold text-cyan-700 dark:text-cyan-300 hover:bg-cyan-500/20 dark:hover:bg-cyan-900/50 transition-all shadow-sm cursor-pointer"
          >
            <Sparkles className="h-3.5 w-3.5 text-cyan-600 dark:text-cyan-400 animate-spin-slow" />
            <span>Fire Live Ping</span>
          </button>

          <button
            onClick={() => setIsAddModalOpen(true)}
            className="flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 px-4 py-2 text-xs font-bold text-slate-950 shadow-lg shadow-cyan-500/20 hover:from-cyan-400 hover:to-blue-500 transition-all cursor-pointer"
          >
            <Plus className="h-4 w-4" />
            <span>Add Connection</span>
          </button>
        </div>
      </div>

      {/* Live Rate Limit Gauge Widget */}
      <RateLimitGauge />

      {/* Dashboard Manage View Panel */}
      {isManagePanelOpen && (
        <div className="relative rounded-2xl border border-slate-200 dark:border-slate-700 bg-white/90 dark:bg-slate-900/90 p-5 backdrop-blur-xl shadow-lg animate-fade-in">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <SlidersHorizontal className="h-4 w-4 text-cyan-600 dark:text-cyan-400" />
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">Manage Dashboard Cards</h3>
              <span className="text-xs text-slate-500 dark:text-slate-400">Toggle which service cards appear below</span>
            </div>
            <button
              onClick={() => setIsManagePanelOpen(false)}
              className="p-1 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
            {services.map((svc) => {
              const isVisible = visibleServiceIds.has(svc.id);
              return (
                <button
                  key={svc.id}
                  onClick={() => toggleServiceVisibility(svc.id)}
                  className={`flex items-center gap-2 rounded-xl border px-3 py-2 text-xs font-semibold transition-all cursor-pointer ${
                    isVisible
                      ? 'border-cyan-500/50 bg-cyan-50 dark:bg-cyan-500/10 text-cyan-700 dark:text-cyan-300'
                      : 'border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-500 dark:text-slate-500'
                  }`}
                >
                  {isVisible ? (
                    <Eye className="h-3.5 w-3.5 text-cyan-500" />
                  ) : (
                    <EyeOff className="h-3.5 w-3.5 text-slate-400" />
                  )}
                  <span className="truncate">{svc.name}</span>
                </button>
              );
            })}
            {services.length === 0 && (
              <p className="col-span-full text-xs text-slate-500 dark:text-slate-400 text-center py-3">
                No services connected yet. Click "Add Connection" to get started.
              </p>
            )}
          </div>
        </div>
      )}

      {/* Forecast & Predictive Telemetry Quick Banner */}
      <div className="relative overflow-hidden rounded-2xl border border-cyan-500/30 bg-gradient-to-r from-cyan-500/10 via-blue-500/5 to-purple-500/10 p-5 backdrop-blur-xl transition-all hover:border-cyan-500/50">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-start sm:items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-cyan-500 text-slate-950 shadow-md shadow-cyan-500/20 font-bold">
              <TrendingUp className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                  AI Quota Depletion Forecast
                  <span className="rounded-full bg-cyan-100 dark:bg-cyan-500/20 text-cyan-700 dark:text-cyan-300 text-[10px] font-mono font-bold px-2 py-0.5 border border-cyan-300 dark:border-cyan-500/30">
                    Live Velocity
                  </span>
                </h3>
              </div>
              <p className="text-xs text-slate-600 dark:text-slate-400 mt-0.5">
                {criticalForecast ? (
                  <span>
                    <span className="font-semibold text-red-600 dark:text-red-400">{criticalForecast.serviceName}</span> is forecasted to deplete remaining quota in{' '}
                    <span className="font-bold text-red-600 dark:text-red-400 font-mono">{criticalForecast.estimatedDepletionTime}</span> at current burn rate ({criticalForecast.burnRatePerMinute} req/min).
                  </span>
                ) : (
                  'All connected endpoints are running safely within quota thresholds across next 30 days.'
                )}
              </p>
            </div>
          </div>

          <button
            onClick={openForecast}
            className="flex items-center justify-center gap-1.5 shrink-0 rounded-xl bg-slate-900 dark:bg-white text-white dark:text-slate-950 px-4 py-2 text-xs font-bold shadow-md hover:bg-slate-800 dark:hover:bg-slate-100 transition-all cursor-pointer"
          >
            <span>Explore Forecast</span>
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Connected Services Summary Grid */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Server className="h-5 w-5 text-cyan-600 dark:text-cyan-400" />
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">
              Connected Services ({visibleServices.length}{visibleServices.length !== services.length ? `/${services.length}` : ''})
            </h2>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsManagePanelOpen((v) => !v)}
              className={`flex items-center gap-1.5 rounded-xl border px-3 py-1.5 text-xs font-semibold transition-all cursor-pointer ${
                isManagePanelOpen
                  ? 'border-cyan-500/50 bg-cyan-50 dark:bg-cyan-500/10 text-cyan-700 dark:text-cyan-300'
                  : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:border-slate-300 dark:hover:border-slate-600'
              }`}
            >
              <SlidersHorizontal className="h-3.5 w-3.5" />
              Manage View
            </button>
            <span className="text-xs text-slate-500 dark:text-slate-400 hidden sm:inline">Click any card to inspect detail telemetry logs</span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {visibleServices.map((svc) => {
            const percentage = Math.round((svc.used / svc.limit) * 100);
            return (
              <div
                key={svc.id}
                onClick={() => openServiceDetail(svc.id)}
                className="group relative cursor-pointer overflow-hidden rounded-2xl border border-slate-200 dark:border-slate-800 bg-white/90 dark:bg-slate-900/80 p-5 backdrop-blur-xl shadow-sm dark:shadow-none transition-all duration-300 hover:-translate-y-1 hover:border-cyan-500/50 hover:shadow-xl hover:shadow-cyan-500/10"
              >
                {/* Header */}
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div
                      className="flex h-10 w-10 items-center justify-center rounded-xl font-bold text-white shadow-sm"
                      style={{ backgroundColor: `${svc.color}25`, border: `1px solid ${svc.color}50` }}
                    >
                      <Server className="h-5 w-5" style={{ color: svc.color }} />
                    </div>
                    <div>
                      <h3 className="font-semibold text-slate-900 dark:text-white text-sm group-hover:text-cyan-600 dark:group-hover:text-cyan-400 transition-colors flex items-center gap-1.5">
                        {svc.name}
                        <ChevronRight className="h-3.5 w-3.5 text-slate-400 dark:text-slate-500 opacity-0 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all" />
                      </h3>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400">{svc.category}</p>
                    </div>
                  </div>

                  {getStatusBadge(svc.statusColor, svc.status)}
                </div>

                {/* Description */}
                <p className="text-xs text-slate-600 dark:text-slate-400 line-clamp-1 mt-3 mb-4">{svc.description}</p>

                {/* Progress Bar & Used vs Limit */}
                <div className="space-y-1.5">
                  <div className="flex items-baseline justify-between text-xs font-mono">
                    <span className="text-slate-500 dark:text-slate-400">Used / Limit:</span>
                    <span className="font-bold text-slate-900 dark:text-white">
                      {svc.used.toLocaleString()} / {svc.limit.toLocaleString()}
                      <span className="text-slate-500 dark:text-slate-400 font-normal ml-1">({percentage}%)</span>
                    </span>
                  </div>

                  <div className="h-2.5 w-full rounded-full bg-slate-100 dark:bg-slate-800 p-0.5 overflow-hidden border border-slate-200 dark:border-slate-700/50">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${getProgressBarColor(
                        svc.statusColor
                      )}`}
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                </div>

                {/* Footer Metadata */}
                <div className="mt-4 flex items-center justify-between border-t border-slate-200 dark:border-slate-800/80 pt-3 text-[11px] text-slate-500 dark:text-slate-400 font-mono">
                  <span className="flex items-center gap-1">
                    <Clock className="h-3 w-3 text-slate-400 dark:text-slate-500" />
                    {formatResetLabel(svc.resetTime)}
                  </span>
                  <span className="text-slate-500 dark:text-slate-400">Latency: {svc.latencyMs}ms</span>
                </div>
              </div>
            );
          })}
          {visibleServices.length === 0 && services.length > 0 && (
            <div className="col-span-full rounded-2xl border border-dashed border-slate-300 dark:border-slate-700 p-10 text-center">
              <EyeOff className="h-8 w-8 text-slate-400 dark:text-slate-600 mx-auto mb-2" />
              <p className="text-sm text-slate-500 dark:text-slate-400 font-medium">All service cards are hidden.</p>
              <button
                onClick={() => setIsManagePanelOpen(true)}
                className="mt-2 text-xs text-cyan-600 dark:text-cyan-400 hover:underline cursor-pointer"
              >
                Open Manage View to show them
              </button>
            </div>
          )}
        </div>
      </div>

      {/* 7-Day Usage Charts */}
      <UsageCharts />

      {/* Add Connection Modal */}
      <AddKeyModal isOpen={isAddModalOpen} onClose={() => setIsAddModalOpen(false)} />
    </div>
  );
};
