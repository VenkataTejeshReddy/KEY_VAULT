'use client';

import React, { useState } from 'react';
import { useVault } from '../../context/VaultContext';
import { RefreshCw, Zap, ShieldAlert, CheckCircle2, Flame, Wifi } from 'lucide-react';

export const RateLimitGauge: React.FC = () => {
  const {
    usedRequests, refillCountdown, getMaxRateLimit, tier,
    alertThreshold, resetRateLimit, liveQuota, floodService, services,
  } = useVault();

  const [selectedGaugeService, setSelectedGaugeService] = useState<string>('github');
  const [isFlooding, setIsFlooding] = useState(false);
  const [floodResult, setFloodResult] = useState<{ triggered429: boolean; responses: number[] } | null>(null);
  const [selectedFloodService, setSelectedFloodService] = useState('github');
  const [isRefilled, setIsRefilled] = useState(false);

  const handleRefillClick = async () => {
    await resetRateLimit();
    setIsRefilled(true);
    setTimeout(() => setIsRefilled(false), 2500);
  };

  const maxLimit = getMaxRateLimit();
  const currentGaugeService =
    services.find((s) => s.id === selectedGaugeService) ||
    services.find((s) => s.id === 'github') ||
    services[0];

  const isGitHub = currentGaugeService?.id === 'github';
  const displayUsed = isGitHub && liveQuota ? liveQuota.used : (currentGaugeService?.used ?? usedRequests);
  const displayLimit = isGitHub && liveQuota ? liveQuota.limit : (currentGaugeService?.limit ?? maxLimit);
  const displayReset = isGitHub && liveQuota ? liveQuota.resetInSeconds : refillCountdown;
  const isLive = Boolean(isGitHub && liveQuota);

  const percentage = Math.min(100, Math.round((displayUsed / Math.max(1, displayLimit)) * 100));
  const isHigh = percentage >= alertThreshold;
  const isCritical = percentage >= 95;

  const getProgressColor = () => {
    if (isCritical) return 'bg-gradient-to-r from-red-500 to-rose-600 shadow-red-500/50';
    if (isHigh) return 'bg-gradient-to-r from-amber-400 to-yellow-500 shadow-amber-500/50';
    return 'bg-gradient-to-r from-emerald-400 to-teal-400 shadow-emerald-500/50';
  };

  const formatResetTime = (seconds: number) => {
    if (seconds >= 3600) return `${Math.floor(seconds / 3600)}h ${Math.floor((seconds % 3600) / 60)}m`;
    if (seconds >= 60) return `${Math.floor(seconds / 60)}m ${seconds % 60}s`;
    return `${seconds}s`;
  };

  const handleFlood = async () => {
    setIsFlooding(true);
    setFloodResult(null);
    try {
      const result = await floodService(selectedFloodService, 60);
      setFloodResult(result);
    } finally {
      setIsFlooding(false);
    }
  };

  const floodableServices = services.filter((s) =>
    ['github', 'groq', 'alphavantage', 'twilio', 'openweather'].includes(s.id)
  );

  return (
    <div className="relative overflow-hidden rounded-2xl border border-slate-200 dark:border-slate-800 bg-white/90 dark:bg-slate-900/80 p-6 backdrop-blur-xl shadow-sm dark:shadow-xl transition-all duration-300 hover:border-slate-300 dark:hover:border-slate-700">
      {/* Background radial glow */}
      <div
        className={`absolute -right-10 -top-10 h-40 w-40 rounded-full blur-3xl opacity-20 transition-colors duration-500 ${
          isCritical ? 'bg-red-500' : isHigh ? 'bg-amber-500' : 'bg-emerald-500'
        }`}
      />

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100 dark:bg-slate-800/80 text-cyan-600 dark:text-cyan-400 border border-slate-200 dark:border-slate-700/60 shadow-inner">
            <Zap className="h-5 w-5 animate-pulse" />
          </div>
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                Live Quota:
              </h3>
              <select
                value={selectedGaugeService}
                onChange={(e) => setSelectedGaugeService(e.target.value)}
                className="rounded-lg bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-bold text-cyan-700 dark:text-cyan-300 px-2.5 py-1 focus:outline-none focus:ring-1 focus:ring-cyan-500 cursor-pointer"
              >
                {services.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name} ({s.used}/{s.limit})
                  </option>
                ))}
              </select>
              <span className="rounded-full bg-slate-100 dark:bg-slate-800 px-2.5 py-0.5 text-xs font-mono font-semibold text-cyan-700 dark:text-cyan-400 border border-slate-200 dark:border-slate-700 uppercase">
                {tier} Tier
              </span>
              <span className="flex items-center gap-1 rounded-full bg-emerald-100 dark:bg-emerald-500/10 px-2 py-0.5 text-xs font-bold text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-500/30">
                <Wifi className="h-3 w-3" /> LIVE
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              {isGitHub
                ? 'Real-time from GitHub API · refreshes every 20s'
                : `Real-time Gateway telemetry tracking for ${currentGaugeService?.name || 'Service'}`}
            </p>
          </div>
        </div>

        <button
          onClick={handleRefillClick}
          title="Manual Refill / Reset All Quotas"
          className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold border transition-all duration-200 cursor-pointer ${
            isRefilled
              ? 'bg-emerald-500/20 text-emerald-700 dark:text-emerald-400 border-emerald-500/40 shadow-sm'
              : 'bg-slate-100 dark:bg-slate-800/60 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 hover:text-slate-900 dark:hover:text-white border-slate-200 dark:border-slate-700/50'
          }`}
        >
          {isRefilled ? (
            <>
              <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />
              <span>Refilled!</span>
            </>
          ) : (
            <>
              <RefreshCw className="h-3.5 w-3.5" />
              <span>Refill</span>
            </>
          )}
        </button>
      </div>

      {/* Main Gauge Visual */}
      <div className="mt-6">
        <div className="flex items-baseline justify-between mb-2">
          <div className="flex items-baseline gap-2">
            <span suppressHydrationWarning className="text-4xl font-extrabold tracking-tight text-slate-900 dark:text-white font-mono">
              {displayUsed}
            </span>
            <span className="text-sm font-semibold text-slate-500 dark:text-slate-400 font-mono">
              / {displayLimit.toLocaleString()} {isGitHub ? 'req/hr' : 'reqs'}
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
              Reset in <span className="text-cyan-700 dark:text-cyan-400 font-bold">{formatResetTime(displayReset)}</span>
            </span>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="relative h-4 w-full rounded-full bg-slate-100 dark:bg-slate-800/90 p-0.5 border border-slate-200 dark:border-slate-700/50 overflow-hidden shadow-inner">
          <div
            className={`h-full rounded-full transition-all duration-500 ease-out shadow-lg ${getProgressColor()}`}
            style={{ width: `${percentage}%` }}
          />
          <div
            className="absolute top-0 bottom-0 w-0.5 bg-amber-500 dark:bg-amber-400 shadow-[0_0_8px_#f59e0b] z-10"
            style={{ left: `${alertThreshold}%` }}
            title={`Alert Threshold (${alertThreshold}%)`}
          />
        </div>

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
            {displayLimit.toLocaleString()} {isGitHub ? 'req/hr max' : 'reqs max'}
          </span>
        </div>
      </div>

      {/* ─── Flood Test Panel ─── */}
      <div className="mt-5 rounded-xl border border-rose-200 dark:border-rose-500/20 bg-rose-50 dark:bg-rose-500/5 p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Flame className="h-4 w-4 text-rose-500" />
            <span className="text-sm font-bold text-rose-700 dark:text-rose-400">Quota Flood Test</span>
            <span className="text-xs text-slate-500 dark:text-slate-400">Fire 60 real requests → trigger genuine 429</span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <select
            value={selectedFloodService}
            onChange={e => setSelectedFloodService(e.target.value)}
            className="flex-1 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm text-slate-700 dark:text-slate-300 px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-rose-400"
          >
            {floodableServices.length > 0
              ? floodableServices.map(s => (
                  <option key={s.id} value={s.id}>{s.name}</option>
                ))
              : (
                <>
                  <option value="github">GitHub API</option>
                  <option value="groq">Groq</option>
                  <option value="alphavantage">Alpha Vantage</option>
                  <option value="twilio">Twilio</option>
                </>
              )}
          </select>

          <button
            onClick={handleFlood}
            disabled={isFlooding}
            className={`flex items-center gap-2 rounded-lg px-4 py-1.5 text-sm font-bold transition-all duration-200 border cursor-pointer ${
              isFlooding
                ? 'bg-rose-100 dark:bg-rose-500/10 text-rose-400 dark:text-rose-500 border-rose-200 dark:border-rose-500/20 cursor-not-allowed'
                : 'bg-rose-600 hover:bg-rose-700 text-white border-rose-600 shadow-lg shadow-rose-500/20 hover:shadow-rose-500/30'
            }`}
          >
            <Flame className={`h-4 w-4 ${isFlooding ? 'animate-bounce' : ''}`} />
            {isFlooding ? 'Flooding…' : 'Flood Now'}
          </button>
        </div>

        {/* Result Badge */}
        {floodResult && (
          <div className={`mt-3 rounded-lg px-4 py-2.5 text-sm font-mono border ${
            floodResult.triggered429
              ? 'bg-red-100 dark:bg-red-500/10 border-red-300 dark:border-red-500/30 text-red-700 dark:text-red-400'
              : 'bg-emerald-100 dark:bg-emerald-500/10 border-emerald-300 dark:border-emerald-500/30 text-emerald-700 dark:text-emerald-400'
          }`}>
            {floodResult.triggered429 ? (
              <>
                <span className="font-black">🚨 HTTP 429 TRIGGERED!</span>
                &nbsp;·&nbsp;
                {floodResult.responses.filter(s => s === 429).length} of {floodResult.responses.length} requests rate-limited
                &nbsp;·&nbsp; Incident auto-created in Black Box
              </>
            ) : (
              <>
                <span className="font-black">✅ No 429 yet</span>
                &nbsp;·&nbsp; All {floodResult.responses.length} returned {[...new Set(floodResult.responses)].join(', ')}
                &nbsp;·&nbsp; Quota not exhausted at this volume
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
