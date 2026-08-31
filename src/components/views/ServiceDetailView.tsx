'use client';

import React, { useState } from 'react';
import { useVault } from '../../context/VaultContext';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from 'recharts';
import {
  Server,
  ArrowLeft,
  Clock,
  Zap,
  Activity,
  CheckCircle2,
  AlertTriangle,
  Play,
  ShieldCheck,
  Globe,
  Terminal,
  Filter,
  Search,
} from 'lucide-react';

export const ServiceDetailView: React.FC = () => {
  const {
    services,
    selectedServiceId,
    setSelectedServiceId,
    setActiveView,
    logs,
    simulateApiCall,
    history,
    theme,
  } = useVault();

  const [timeRange, setTimeRange] = useState<'24h' | '7d' | '30d'>('7d');
  const [logFilter, setLogFilter] = useState<string>('all');
  const [logSearch, setLogSearch] = useState<string>('');

  const currentService =
    services.find((s) => s.id === selectedServiceId) || services[0];

  // Filter logs for this service
  const serviceLogs = logs.filter(
    (l) => l.serviceId === currentService.id || l.serviceName === currentService.name
  );

  const filteredLogs = serviceLogs.filter((log) => {
    const matchesStatus =
      logFilter === 'all' ||
      (logFilter === '200' && log.status === 200) ||
      (logFilter === '429' && log.status === 429);
    const matchesSearch = log.endpoint.toLowerCase().includes(logSearch.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  const percentage = Math.round((currentService.used / currentService.limit) * 100);

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Top Bar with Back Button & Service Selector */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setActiveView('dashboard')}
            className="flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white transition-all cursor-pointer"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>

          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">{currentService.name}</h1>
              <span className="rounded-full bg-slate-100 dark:bg-slate-800 px-2.5 py-0.5 text-xs font-mono font-semibold text-cyan-700 dark:text-cyan-400 border border-slate-200 dark:border-slate-700">
                {currentService.category}
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{currentService.description}</p>
          </div>
        </div>

        {/* Switch Service Selector */}
        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-500 dark:text-slate-400 hidden sm:inline font-medium">Switch Service:</span>
          <select
            value={currentService.id}
            onChange={(e) => setSelectedServiceId(e.target.value)}
            className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-3 py-1.5 text-xs font-semibold text-slate-900 dark:text-white focus:border-cyan-500 focus:outline-none shadow-sm cursor-pointer"
          >
            {services.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Hero Stats Card */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {/* Card 1: Quota Usage */}
        <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white/90 dark:bg-slate-900/80 p-5 backdrop-blur-xl shadow-sm dark:shadow-none">
          <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider block">Quota Consumption</span>
          <div className="mt-2 flex items-baseline justify-between">
            <span className="text-2xl font-extrabold text-slate-900 dark:text-white font-mono">{percentage}%</span>
            <span className="text-xs text-slate-500 dark:text-slate-400 font-mono">
              {currentService.used.toLocaleString()} / {currentService.limit.toLocaleString()}
            </span>
          </div>
          <div className="mt-3 h-2 w-full rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden border border-slate-200 dark:border-slate-700/50">
            <div
              className={`h-full rounded-full transition-all duration-500 ${
                currentService.statusColor === 'red'
                  ? 'bg-red-500'
                  : currentService.statusColor === 'yellow'
                  ? 'bg-amber-400'
                  : 'bg-emerald-400'
              }`}
              style={{ width: `${percentage}%` }}
            />
          </div>
        </div>

        {/* Card 2: Quota Reset Clock */}
        <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white/90 dark:bg-slate-900/80 p-5 backdrop-blur-xl shadow-sm dark:shadow-none">
          <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider block">Quota Reset Timer</span>
          <div className="mt-2 flex items-center gap-2">
            <Clock className="h-5 w-5 text-cyan-600 dark:text-cyan-400" />
            <span className="text-2xl font-bold text-slate-900 dark:text-white font-mono">{currentService.resetTime}</span>
          </div>
          <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-2">Automatic monthly rate refill window</p>
        </div>

        {/* Card 3: Endpoint Health & Latency */}
        <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white/90 dark:bg-slate-900/80 p-5 backdrop-blur-xl shadow-sm dark:shadow-none">
          <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider block">Average Latency</span>
          <div className="mt-2 flex items-center gap-2">
            <Zap className="h-5 w-5 text-emerald-500 dark:text-emerald-400" />
            <span className="text-2xl font-bold text-slate-900 dark:text-white font-mono">{currentService.latencyMs} ms</span>
          </div>
          <p className="text-[11px] text-emerald-600 dark:text-emerald-400 font-medium mt-2 flex items-center gap-1">
            <CheckCircle2 className="h-3 w-3" /> Operational (99.98% Uptime)
          </p>
        </div>

        {/* Card 4: Base Endpoint URL */}
        <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white/90 dark:bg-slate-900/80 p-5 backdrop-blur-xl shadow-sm dark:shadow-none flex flex-col justify-between">
          <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider block">Target Endpoint</span>
          <div className="my-1 font-mono text-xs text-cyan-700 dark:text-cyan-300 truncate bg-slate-50 dark:bg-slate-950 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-800">
            {currentService.endpointUrl}
          </div>
          <button
            onClick={() => simulateApiCall(currentService.id)}
            className="flex items-center justify-center gap-1.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 py-2 text-xs font-bold text-slate-950 shadow-lg shadow-cyan-500/20 hover:from-cyan-400 hover:to-blue-500 transition-all mt-2 cursor-pointer"
          >
            <Play className="h-3.5 w-3.5 fill-current" />
            <span>Simulate Request</span>
          </button>
        </div>
      </div>

      {/* Expanded Recharts Telemetry Chart */}
      <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white/90 dark:bg-slate-900/80 p-6 backdrop-blur-xl shadow-sm dark:shadow-xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div className="flex items-center gap-2">
            <Activity className="h-5 w-5 text-cyan-600 dark:text-cyan-400" />
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">Expanded Usage Analytics</h3>
          </div>

          <div className="flex bg-slate-100 dark:bg-slate-950 rounded-xl p-1 border border-slate-200 dark:border-slate-800">
            {(['24h', '7d', '30d'] as const).map((range) => (
              <button
                key={range}
                onClick={() => setTimeRange(range)}
                className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
                  timeRange === range
                    ? 'bg-white dark:bg-slate-800 text-cyan-600 dark:text-cyan-400 border border-slate-200 dark:border-slate-700 shadow-sm'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                {range} View
              </button>
            ))}
          </div>
        </div>

        <div className="h-80 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={history} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="detailGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={currentService.color} stopOpacity={0.6} />
                  <stop offset="95%" stopColor={currentService.color} stopOpacity={0.0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke={theme === 'dark' ? '#1e293b' : '#e2e8f0'} vertical={false} />
              <XAxis dataKey="date" stroke={theme === 'dark' ? '#64748b' : '#94a3b8'} fontSize={11} tickLine={false} />
              <YAxis stroke={theme === 'dark' ? '#64748b' : '#94a3b8'} fontSize={11} tickLine={false} />
              <Tooltip
                contentStyle={{
                  backgroundColor: theme === 'dark' ? '#0f172a' : '#ffffff',
                  borderColor: theme === 'dark' ? '#334155' : '#cbd5e1',
                  color: theme === 'dark' ? '#f8fafc' : '#0f172a',
                  borderRadius: '12px',
                  boxShadow: '0 10px 25px -5px rgba(0,0,0,0.1)'
                }}
                itemStyle={{ color: '#06b6d4' }}
              />
              <Area
                type="monotone"
                dataKey={currentService.id}
                stroke={currentService.color}
                strokeWidth={3}
                fillOpacity={1}
                fill="url(#detailGrad)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Recent Request Logs Section */}
      <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white/90 dark:bg-slate-900/80 p-6 backdrop-blur-xl shadow-sm dark:shadow-xl space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Terminal className="h-5 w-5 text-cyan-600 dark:text-cyan-400" />
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">Live Request Stream Logs</h3>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400 dark:text-slate-500" />
              <input
                type="text"
                value={logSearch}
                onChange={(e) => setLogSearch(e.target.value)}
                placeholder="Filter logs..."
                className="rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 pl-8 pr-3 py-1.5 text-xs text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:border-cyan-500 focus:outline-none font-medium"
              />
            </div>

            <div className="flex bg-slate-100 dark:bg-slate-950 rounded-xl p-1 border border-slate-200 dark:border-slate-800 text-xs">
              <button
                onClick={() => setLogFilter('all')}
                className={`px-2.5 py-1 rounded-lg font-medium transition-all ${
                  logFilter === 'all'
                    ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-sm'
                    : 'text-slate-600 dark:text-slate-400'
                }`}
              >
                All Status
              </button>
              <button
                onClick={() => setLogFilter('200')}
                className={`px-2.5 py-1 rounded-lg font-medium transition-all ${
                  logFilter === '200' ? 'bg-emerald-100 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-400' : 'text-slate-600 dark:text-slate-400'
                }`}
              >
                200 OK
              </button>
              <button
                onClick={() => setLogFilter('429')}
                className={`px-2.5 py-1 rounded-lg font-medium transition-all ${
                  logFilter === '429' ? 'bg-red-100 dark:bg-red-500/20 text-red-700 dark:text-red-400' : 'text-slate-600 dark:text-slate-400'
                }`}
              >
                429 Rate Limit
              </button>
            </div>
          </div>
        </div>

        {/* Logs Table */}
        <div className="overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950">
          <table className="w-full text-left text-xs font-mono">
            <thead className="border-b border-slate-200 dark:border-slate-800 bg-slate-100 dark:bg-slate-900/60 text-slate-600 dark:text-slate-400 uppercase">
              <tr>
                <th className="py-3 px-4">Timestamp</th>
                <th className="py-3 px-4">Endpoint Path</th>
                <th className="py-3 px-4">HTTP Status</th>
                <th className="py-3 px-4">Latency</th>
                <th className="py-3 px-4 text-right">Payload Size</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-slate-800/50 text-slate-800 dark:text-slate-300">
              {filteredLogs.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-slate-500 dark:text-slate-400 font-sans">
                    No activity logs recorded yet. Click &quot;Simulate Request&quot; above!
                  </td>
                </tr>
              ) : (
                filteredLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-slate-100/60 dark:hover:bg-slate-900/50 transition-colors">
                    <td className="py-3 px-4 text-slate-500 dark:text-slate-400">{log.timestamp}</td>
                    <td className="py-3 px-4 text-cyan-700 dark:text-cyan-300 font-bold">{log.endpoint}</td>
                    <td className="py-3 px-4">
                      {log.status === 200 ? (
                        <span className="inline-block rounded bg-emerald-100 dark:bg-emerald-500/10 px-2 py-0.5 text-[10px] font-bold text-emerald-700 dark:text-emerald-400 border border-emerald-300 dark:border-emerald-500/30">
                          200 OK
                        </span>
                      ) : (
                        <span className="inline-block rounded bg-red-100 dark:bg-red-500/10 px-2 py-0.5 text-[10px] font-bold text-red-700 dark:text-red-400 border border-red-300 dark:border-red-500/30">
                          429 TOO MANY REQS
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-slate-700 dark:text-slate-300">{log.responseTime}</td>
                    <td className="py-3 px-4 text-right text-slate-500 dark:text-slate-400">{log.payloadSize}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
