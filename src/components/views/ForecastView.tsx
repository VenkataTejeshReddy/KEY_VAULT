'use client';

import React, { useState } from 'react';
import { useVault } from '../../context/VaultContext';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend,
} from 'recharts';
import {
  TrendingUp,
  AlertTriangle,
  Zap,
  DollarSign,
  Clock,
  Sliders,
  CheckCircle2,
  Server,
  Sparkles,
  ArrowRight,
  ShieldAlert,
  Info,
  Flame,
} from 'lucide-react';

export const ForecastView: React.FC = () => {
  const {
    forecasts,
    forecastMultiplier,
    setForecastMultiplier,
    forecastHistory,
    openServiceDetail,
    theme,
    services,
  } = useVault();

  const [activeHorizon, setActiveHorizon] = useState<'7d' | '14d' | '30d'>('7d');

  // Aggregated forecast metrics
  const totalProjectedMonthly = forecasts.reduce((acc, f) => acc + f.projectedMonthlyUsage, 0);
  const criticalExhaustionCount = forecasts.filter((f) => f.riskLevel === 'critical').length;
  const highExhaustionCount = forecasts.filter((f) => f.riskLevel === 'high').length;
  const totalBurnRate = forecasts.reduce((acc, f) => acc + f.burnRatePerMinute, 0);

  const getRiskBadge = (risk: 'critical' | 'high' | 'moderate' | 'low') => {
    switch (risk) {
      case 'critical':
        return (
          <span className="flex items-center gap-1 text-[11px] font-bold text-red-700 dark:text-red-400 bg-red-100 dark:bg-red-500/10 px-2.5 py-0.5 rounded-full border border-red-300 dark:border-red-500/30 font-mono">
            <span className="h-1.5 w-1.5 rounded-full bg-red-500 animate-pulse" />
            CRITICAL DEPLETION
          </span>
        );
      case 'high':
        return (
          <span className="flex items-center gap-1 text-[11px] font-bold text-amber-700 dark:text-amber-400 bg-amber-100 dark:bg-amber-500/10 px-2.5 py-0.5 rounded-full border border-amber-300 dark:border-amber-500/30 font-mono">
            <span className="h-1.5 w-1.5 rounded-full bg-amber-500 dark:bg-amber-400" />
            HIGH VELOCITY
          </span>
        );
      case 'moderate':
        return (
          <span className="flex items-center gap-1 text-[11px] font-bold text-cyan-700 dark:text-cyan-400 bg-cyan-100 dark:bg-cyan-500/10 px-2.5 py-0.5 rounded-full border border-cyan-300 dark:border-cyan-500/30 font-mono">
            <span className="h-1.5 w-1.5 rounded-full bg-cyan-500 dark:bg-cyan-400" />
            MODERATE
          </span>
        );
      case 'low':
      default:
        return (
          <span className="flex items-center gap-1 text-[11px] font-bold text-emerald-700 dark:text-emerald-400 bg-emerald-100 dark:bg-emerald-500/10 px-2.5 py-0.5 rounded-full border border-emerald-300 dark:border-emerald-500/30 font-mono">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 dark:bg-emerald-400" />
            OPTIMAL & SAFE
          </span>
        );
    }
  };

  // Custom chart tooltip
  const CustomForecastTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const dataPoint = payload[0]?.payload;
      return (
        <div className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white/95 dark:bg-slate-900/95 p-3 shadow-2xl backdrop-blur-md text-xs">
          <p className="font-semibold text-slate-900 dark:text-slate-200 border-b border-slate-200 dark:border-slate-800 pb-1.5 mb-2 font-mono flex items-center justify-between gap-3">
            <span>{label}</span>
            {dataPoint?.isForecast && (
              <span className="text-[10px] bg-cyan-50 dark:bg-cyan-500/20 text-cyan-700 dark:text-cyan-400 px-1.5 py-0.5 rounded border border-cyan-500/30">
                Forecasted
              </span>
            )}
          </p>
          <div className="space-y-1 font-mono">
            {dataPoint?.actual !== undefined && (
              <div className="flex items-center justify-between gap-4">
                <span className="text-slate-500 dark:text-slate-400">Recorded Volume:</span>
                <span className="font-bold text-slate-900 dark:text-white">{dataPoint.actual.toLocaleString()} reqs</span>
              </div>
            )}
            {dataPoint?.projected !== undefined && (
              <div className="flex items-center justify-between gap-4 text-cyan-600 dark:text-cyan-400">
                <span className="font-semibold">Projected Model:</span>
                <span className="font-bold">{dataPoint.projected.toLocaleString()} reqs</span>
              </div>
            )}
            {dataPoint?.upperBand !== undefined && dataPoint?.lowerBand !== undefined && (
              <div className="flex items-center justify-between gap-4 text-[11px] text-slate-400 border-t border-slate-200 dark:border-slate-800 pt-1 mt-1">
                <span>Confidence Range:</span>
                <span>{dataPoint.lowerBand.toLocaleString()} – {dataPoint.upperBand.toLocaleString()}</span>
              </div>
            )}
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Top Title & Header Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
            <TrendingUp className="h-6 w-6 text-cyan-600 dark:text-cyan-400" />
            API Usage & Quota Forecast
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Predictive quota burn rates, rate exhaustion estimations, and traffic surge stress testing
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 rounded-full border border-cyan-500/30 bg-cyan-50 dark:bg-cyan-500/10 px-3 py-1 text-xs font-mono font-semibold text-cyan-700 dark:text-cyan-300">
            <Sparkles className="h-3.5 w-3.5 text-cyan-500 dark:text-cyan-400" />
            <span>AI Confidence: 94.2%</span>
          </div>
        </div>
      </div>

      {/* Top 4 Predictive Metric Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Projected 30-Day Requests */}
        <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white/90 dark:bg-slate-900/80 p-5 backdrop-blur-xl shadow-sm dark:shadow-none">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 text-xs font-semibold uppercase tracking-wider">
            <span>Projected Monthly Volume</span>
            <TrendingUp className="h-4 w-4 text-cyan-600 dark:text-cyan-400" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-extrabold text-slate-900 dark:text-white font-mono">
              {totalProjectedMonthly.toLocaleString()}
            </span>
            <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 font-mono">
              +{Math.round((forecastMultiplier - 1) * 100 + 12)}% vs base
            </span>
          </div>
          <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-2">
            Based on 7-day weighted velocity modeling
          </p>
        </div>

        {/* Card 2: Quota Depletion Risk */}
        <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white/90 dark:bg-slate-900/80 p-5 backdrop-blur-xl shadow-sm dark:shadow-none">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 text-xs font-semibold uppercase tracking-wider">
            <span>Imminent Depletion Risk</span>
            <AlertTriangle className="h-4 w-4 text-red-500" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-extrabold text-red-600 dark:text-red-400 font-mono">
              {criticalExhaustionCount + highExhaustionCount} APIs
            </span>
            <span className="text-xs text-slate-500 dark:text-slate-400 font-mono">
              ({criticalExhaustionCount} Critical)
            </span>
          </div>
          <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-2">
            Projected to breach quota within 2 hours
          </p>
        </div>

        {/* Card 3: Estimated Monthly API Spend */}
        <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white/90 dark:bg-slate-900/80 p-5 backdrop-blur-xl shadow-sm dark:shadow-none">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 text-xs font-semibold uppercase tracking-wider">
            <span>Est. Cumulative Cost</span>
            <DollarSign className="h-4 w-4 text-emerald-500" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-extrabold text-slate-900 dark:text-white font-mono">
              ${(424 * forecastMultiplier).toFixed(2)}
            </span>
            <span className="text-xs text-slate-500 dark:text-slate-400 font-mono">/ mo</span>
          </div>
          <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-2">
            Includes paid tiers & overage allocations
          </p>
        </div>

        {/* Card 4: Global Aggregate Burn Rate */}
        <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white/90 dark:bg-slate-900/80 p-5 backdrop-blur-xl shadow-sm dark:shadow-none">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 text-xs font-semibold uppercase tracking-wider">
            <span>Global Burn Rate</span>
            <Flame className="h-4 w-4 text-amber-500" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-extrabold text-slate-900 dark:text-white font-mono">
              {totalBurnRate.toFixed(1)}
            </span>
            <span className="text-xs text-slate-500 dark:text-slate-400 font-mono">req/min</span>
          </div>
          <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-2">
            Velocity across {services.length} connected endpoints
          </p>
        </div>
      </div>

      {/* Traffic Surge Simulator Bar */}
      <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white/90 dark:bg-slate-900/80 p-6 backdrop-blur-xl shadow-sm dark:shadow-xl space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-cyan-50 dark:bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 border border-cyan-500/30">
              <Sliders className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                Traffic Surge Stress-Test Simulator
                <span className="rounded-full bg-cyan-50 dark:bg-cyan-500/10 border border-cyan-500/30 px-2.5 py-0.5 text-xs font-mono font-bold text-cyan-700 dark:text-cyan-300">
                  {forecastMultiplier}x Multiplier
                </span>
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Drag slider to model API consumption spikes and test instant rate exhaustion thresholds
              </p>
            </div>
          </div>

          {/* Quick Preset Buttons */}
          <div className="flex flex-wrap gap-1.5">
            {[
              { label: 'Baseline (1x)', val: 1.0 },
              { label: 'Moderate (+50%)', val: 1.5 },
              { label: 'Launch Spike (2.5x)', val: 2.5 },
              { label: 'Max Surge (5x)', val: 5.0 },
            ].map((preset) => (
              <button
                key={preset.label}
                onClick={() => setForecastMultiplier(preset.val)}
                className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                  forecastMultiplier === preset.val
                    ? 'bg-cyan-500 text-slate-950 font-bold shadow-md shadow-cyan-500/20'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white border border-slate-200 dark:border-slate-700'
                }`}
              >
                {preset.label}
              </button>
            ))}
          </div>
        </div>

        {/* Interactive Range Slider */}
        <div className="pt-2">
          <input
            type="range"
            min="0.5"
            max="5.0"
            step="0.1"
            value={forecastMultiplier}
            onChange={(e) => setForecastMultiplier(Number(e.target.value))}
            className="w-full h-3 bg-slate-200 dark:bg-slate-950 rounded-lg appearance-none cursor-pointer accent-cyan-500 border border-slate-300 dark:border-slate-800"
          />
          <div className="flex justify-between text-[11px] font-mono text-slate-500 dark:text-slate-500 mt-1">
            <span>0.5x (-50% Traffic)</span>
            <span>1.0x (Normal Baseline)</span>
            <span>2.5x (High Traffic Event)</span>
            <span>5.0x (Black Friday Burst)</span>
          </div>
        </div>
      </div>

      {/* Trajectory Forecast Recharts Chart */}
      <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white/90 dark:bg-slate-900/80 p-6 backdrop-blur-xl shadow-sm dark:shadow-xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <div className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-cyan-600 dark:text-cyan-400" />
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">Predictive Usage Trajectory & Confidence Interval</h3>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Historical recordings seamlessly continued with forecast confidence bounds
            </p>
          </div>

          <div className="flex bg-slate-100 dark:bg-slate-950 rounded-xl p-1 border border-slate-200 dark:border-slate-800 text-xs">
            {(['7d', '14d', '30d'] as const).map((h) => (
              <button
                key={h}
                onClick={() => setActiveHorizon(h)}
                className={`px-3 py-1 rounded-lg font-semibold transition-all cursor-pointer ${
                  activeHorizon === h
                    ? 'bg-white dark:bg-slate-800 text-cyan-600 dark:text-cyan-400 border border-slate-200 dark:border-slate-700 shadow-sm'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                {h} Projection
              </button>
            ))}
          </div>
        </div>

        <div className="h-80 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={forecastHistory} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="forecastActualGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.6} />
                  <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.05} />
                </linearGradient>
                <linearGradient id="forecastProjectedGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.5} />
                  <stop offset="95%" stopColor="#06b6d4" stopOpacity={0.0} />
                </linearGradient>
                <linearGradient id="confidenceBandGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.25} />
                  <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0.02} />
                </linearGradient>
              </defs>

              <CartesianGrid strokeDasharray="3 3" stroke={theme === 'dark' ? '#1e293b' : '#e2e8f0'} vertical={false} />
              <XAxis dataKey="date" stroke={theme === 'dark' ? '#64748b' : '#94a3b8'} fontSize={11} tickLine={false} />
              <YAxis stroke={theme === 'dark' ? '#64748b' : '#94a3b8'} fontSize={11} tickLine={false} />
              <Tooltip content={<CustomForecastTooltip />} />
              <Legend
                wrapperStyle={{ paddingTop: '10px', fontSize: '12px' }}
                formatter={(value) => <span className="text-slate-700 dark:text-slate-300 font-semibold">{value}</span>}
              />

              {/* Confidence upper band */}
              <Area
                type="monotone"
                dataKey="upperBand"
                name="Confidence Range"
                stroke="none"
                fill="url(#confidenceBandGrad)"
              />

              {/* Recorded Actual History */}
              <Area
                type="monotone"
                dataKey="actual"
                name="Recorded Actual Traffic"
                stroke="#3b82f6"
                strokeWidth={3}
                fill="url(#forecastActualGrad)"
              />

              {/* Forecast Projection */}
              <Area
                type="monotone"
                dataKey="projected"
                name="AI Projected Trajectory"
                stroke="#06b6d4"
                strokeWidth={3}
                strokeDasharray="5 5"
                fill="url(#forecastProjectedGrad)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Quota Exhaustion Predictions & Recommendations Table */}
      <div className="overflow-hidden rounded-2xl border border-slate-200 dark:border-slate-800 bg-white/90 dark:bg-slate-900/80 backdrop-blur-xl shadow-sm dark:shadow-xl">
        <div className="p-5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Clock className="h-5 w-5 text-cyan-600 dark:text-cyan-400" />
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">API Quota Depletion Forecast & Recommendations</h3>
          </div>
          <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">Real-time velocity countdown</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/60 text-slate-600 dark:text-slate-400 uppercase font-mono tracking-wider">
              <tr>
                <th className="py-3.5 px-4 font-semibold">API Service</th>
                <th className="py-3.5 px-4 font-semibold">Quota Used / Limit</th>
                <th className="py-3.5 px-4 font-semibold">Burn Rate</th>
                <th className="py-3.5 px-4 font-semibold">Time to Exhaustion</th>
                <th className="py-3.5 px-4 font-semibold">Depletion Risk</th>
                <th className="py-3.5 px-4 font-semibold">Recommended Mitigation</th>
                <th className="py-3.5 px-4 font-semibold text-right">Inspect</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-slate-800/60 text-slate-800 dark:text-slate-300">
              {forecasts.map((f) => {
                const percentage = Math.round((f.currentUsed / f.limit) * 100);
                return (
                  <tr key={f.serviceId} className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors group">
                    {/* Service */}
                    <td className="py-4 px-4 font-semibold text-slate-900 dark:text-white">
                      <div className="flex items-center gap-2.5">
                        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-100 dark:bg-slate-800 text-cyan-600 dark:text-cyan-400 border border-slate-200 dark:border-slate-700">
                          <Server className="h-4 w-4" />
                        </div>
                        <div>
                          <span className="font-bold block text-slate-900 dark:text-white">{f.serviceName}</span>
                          <span className="text-[10px] text-slate-500 dark:text-slate-400">{f.category}</span>
                        </div>
                      </div>
                    </td>

                    {/* Quota Progress */}
                    <td className="py-4 px-4 font-mono">
                      <div className="space-y-1">
                        <span className="font-bold text-slate-900 dark:text-white">
                          {f.currentUsed.toLocaleString()} / {f.limit.toLocaleString()}
                          <span className="text-slate-500 dark:text-slate-400 font-normal ml-1">({percentage}%)</span>
                        </span>
                        <div className="h-1.5 w-28 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden border border-slate-200 dark:border-slate-700">
                          <div
                            className={`h-full rounded-full ${
                              f.riskLevel === 'critical'
                                ? 'bg-red-500'
                                : f.riskLevel === 'high'
                                ? 'bg-amber-400'
                                : 'bg-emerald-400'
                            }`}
                            style={{ width: `${Math.min(100, percentage)}%` }}
                          />
                        </div>
                      </div>
                    </td>

                    {/* Burn Rate */}
                    <td className="py-4 px-4 font-mono font-bold text-slate-900 dark:text-white">
                      <span className="flex items-center gap-1">
                        <Flame className="h-3.5 w-3.5 text-amber-500" />
                        {f.burnRatePerMinute} req/min
                      </span>
                    </td>

                    {/* Time to Exhaustion */}
                    <td className="py-4 px-4 font-mono text-xs">
                      <span
                        className={`font-bold ${
                          f.riskLevel === 'critical'
                            ? 'text-red-600 dark:text-red-400'
                            : f.riskLevel === 'high'
                            ? 'text-amber-600 dark:text-amber-400'
                            : 'text-slate-700 dark:text-slate-300'
                        }`}
                      >
                        {f.estimatedDepletionTime}
                      </span>
                    </td>

                    {/* Risk Badge */}
                    <td className="py-4 px-4">{getRiskBadge(f.riskLevel)}</td>

                    {/* Recommendation */}
                    <td className="py-4 px-4 text-xs text-slate-600 dark:text-slate-400 max-w-xs">
                      {f.recommendation}
                    </td>

                    {/* Action Button */}
                    <td className="py-4 px-4 text-right">
                      <button
                        onClick={() => openServiceDetail(f.serviceId)}
                        className="inline-flex items-center gap-1 rounded-lg bg-slate-100 dark:bg-slate-800 px-3 py-1.5 text-xs font-semibold text-cyan-700 dark:text-cyan-400 hover:bg-slate-200 dark:hover:bg-slate-700 transition-all border border-slate-200 dark:border-slate-700 cursor-pointer"
                      >
                        <span>Telemetry</span>
                        <ArrowRight className="h-3.5 w-3.5" />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
