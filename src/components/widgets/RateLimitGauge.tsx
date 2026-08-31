'use client';

import React from 'react';
import { useVault } from '../../context/VaultContext';
import { RefreshCw, Zap, ShieldAlert, CheckCircle2 } from 'lucide-react';

export const RateLimitGauge: React.FC = () => {
  const { usedRequests, refillCountdown, getMaxRateLimit, tier, alertThreshold, resetRateLimit } = useVault();
  const maxLimit = getMaxRateLimit();
  
  const percentage = Math.min(100, Math.round((usedRequests / maxLimit) * 100));
  const isHigh = percentage >= alertThreshold;
  const isCritical = percentage >= 95;

  // Determine accent styling based on usage vs threshold
  const getGaugeColor = () => {
    if (isCritical) return 'from-rose-500 to-red-600 border-red-500/50 text-red-400';
    if (isHigh) return 'from-amber-400 to-yellow-500 border-amber-500/50 text-amber-400';
    return 'from-emerald-400 to-teal-500 border-emerald-500/50 text-emerald-400';
  };

  const getProgressColor = () => {
    if (isCritical) return 'bg-gradient-to-r from-red-500 to-rose-600 shadow-red-500/50';
    if (isHigh) return 'bg-gradient-to-r from-amber-400 to-yellow-500 shadow-amber-500/50';
    return 'bg-gradient-to-r from-emerald-400 to-teal-400 shadow-emerald-500/50';
  };

  return (
    <div className="relative overflow-hidden rounded-2xl border border-slate-200 dark:border-slate-800 bg-white/90 dark:bg-slate-900/80 p-6 backdrop-blur-xl shadow-sm dark:shadow-xl transition-all duration-300 hover:border-slate-300 dark:hover:border-slate-700">
      {/* Background radial glow */}
      <div
        className={`absolute -right-10 -top-10 h-40 w-40 rounded-full blur-3xl opacity-20 transition-colors duration-500 ${
          isCritical ? 'bg-red-500' : isHigh ? 'bg-amber-500' : 'bg-emerald-500'
        }`}
      />

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100 dark:bg-slate-800/80 text-cyan-600 dark:text-cyan-400 border border-slate-200 dark:border-slate-700/60 shadow-inner">
            <Zap className="h-5 w-5 animate-pulse" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
              Your KeyVault API Usage
              <span className="rounded-full bg-slate-100 dark:bg-slate-800 px-2.5 py-0.5 text-xs font-mono font-semibold text-cyan-700 dark:text-cyan-400 border border-slate-200 dark:border-slate-700 uppercase">
                {tier} Tier
              </span>
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">Internal Vault Rate Limit (Per Minute Window)</p>
          </div>
        </div>

        <button
          onClick={resetRateLimit}
          title="Manual Refill / Reset"
          className="flex items-center gap-1.5 rounded-lg bg-slate-100 dark:bg-slate-800/60 px-3 py-1.5 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 hover:text-slate-900 dark:hover:text-white border border-slate-200 dark:border-slate-700/50 transition-all duration-200 cursor-pointer"
        >
          <RefreshCw className="h-3.5 w-3.5" />
          <span>Refill</span>
        </button>
      </div>

      {/* Main Gauge Visual */}
      <div className="mt-6">
        <div className="flex items-baseline justify-between mb-2">
          <div className="flex items-baseline gap-2">
            <span className="text-4xl font-extrabold tracking-tight text-slate-900 dark:text-white font-mono">
              {usedRequests}
            </span>
            <span className="text-sm font-semibold text-slate-500 dark:text-slate-400 font-mono">
              / {maxLimit} req/min
            </span>
          </div>

          <div className="flex items-center gap-2">
            {isHigh && (
              <span className="flex items-center gap-1 text-xs font-bold text-amber-700 dark:text-amber-400 bg-amber-100 dark:bg-amber-500/10 px-2.5 py-1 rounded-md border border-amber-300 dark:border-amber-500/30">
                <ShieldAlert className="h-3.5 w-3.5" />
                Alert (&gt;{alertThreshold}%)
              </span>
            )}
            <span className="text-xs font-mono font-semibold text-slate-600 dark:text-slate-400 bg-slate-100 dark:bg-slate-800/80 px-2.5 py-1 rounded-md border border-slate-200 dark:border-slate-700/50">
              Refill in <span className="text-cyan-700 dark:text-cyan-400 font-bold">{refillCountdown}s</span>
            </span>
          </div>
        </div>

        {/* Progress Bar with smooth transition */}
        <div className="relative h-4 w-full rounded-full bg-slate-100 dark:bg-slate-800/90 p-0.5 border border-slate-200 dark:border-slate-700/50 overflow-hidden shadow-inner">
          <div
            className={`h-full rounded-full transition-all duration-500 ease-out shadow-lg ${getProgressColor()}`}
            style={{ width: `${percentage}%` }}
          />

          {/* Alert Threshold Marker Line */}
          <div
            className="absolute top-0 bottom-0 w-0.5 bg-amber-500 dark:bg-amber-400 shadow-[0_0_8px_#f59e0b] z-10"
            style={{ left: `${alertThreshold}%` }}
            title={`Alert Threshold (${alertThreshold}%)`}
          />
        </div>

        {/* Dynamic Status Legend Footer */}
        <div className="mt-3 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
          <span className="flex items-center gap-1.5">
            {isCritical ? (
              <span className="flex items-center gap-1 text-red-700 dark:text-red-400 font-medium">
                <ShieldAlert className="h-3.5 w-3.5" /> Severe Rate Throttling Risk
              </span>
            ) : isHigh ? (
              <span className="flex items-center gap-1 text-amber-700 dark:text-amber-400 font-medium">
                <ShieldAlert className="h-3.5 w-3.5" /> Approaching Rate Limit ({percentage}%)
              </span>
            ) : (
              <span className="flex items-center gap-1 text-emerald-700 dark:text-emerald-400 font-medium">
                <CheckCircle2 className="h-3.5 w-3.5" /> Optimal Bandwidth Capacity ({percentage}%)
              </span>
            )}
          </span>

          <span className="text-slate-500 dark:text-slate-400 font-mono">
            {tier === 'free' ? '60 req/min' : tier === 'pro' ? '600 req/min' : '3,000 req/min'} max
          </span>
        </div>
      </div>
    </div>
  );
};
