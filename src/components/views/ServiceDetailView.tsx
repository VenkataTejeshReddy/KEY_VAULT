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
  RefreshCw,
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

// Extract canonical provider type from a potentially dynamic service ID
// e.g. "groq-1748234567890" -> "groq",  "openweather-abc123" -> "openweather"
function getProviderType(serviceId: string): string {
  const known = ['github','openai','groq','openweather','weather','alphavantage','twilio','stripe'];
  if (known.includes(serviceId)) return serviceId;
  // Try stripping numeric/timestamp suffix
  const numMatch = serviceId.match(/^([a-z]+(?:weather)?)-\d+$/);
  if (numMatch && known.includes(numMatch[1])) return numMatch[1];
  // Try first segment before any dash
  const prefix = serviceId.split('-')[0];
  if (known.includes(prefix)) return prefix;
  return serviceId;
}

export const ServiceDetailView: React.FC = () => {
  const {
    services,
    selectedServiceId,
    setSelectedServiceId,
    setActiveView,
    logs,
    simulateApiCall,
    resetRateLimit,
    history,
    theme,
  } = useVault();

  const currentService =
    services.find((s) => s.id === selectedServiceId) || services[0];

  const [timeRange, setTimeRange] = useState<'24h' | '7d' | '30d'>('7d');
  const [logFilter, setLogFilter] = useState<string>('all');
  const [logSearch, setLogSearch] = useState<string>('');

  // Live Proxy Gateway State
  const [proxyEndpoint, setProxyEndpoint] = useState<string>('');
  const [isExecutingProxy, setIsExecutingProxy] = useState<boolean>(false);
  const [proxyResponse, setProxyResponse] = useState<any | null>(null);
  const [proxyHeaders, setProxyHeaders] = useState<Record<string, string> | null>(null);
  const [proxyStatus, setProxyStatus] = useState<number | null>(null);
  const [proxyLatency, setProxyLatency] = useState<string | null>(null);

  // Set default endpoint template when service changes
  const PRESET_ENDPOINTS: Record<string, Array<{ label: string; path: string }>> = {
    github: [
      { label: 'Rate Limit', path: 'rate_limit' },
      { label: 'User Info', path: 'users/octocat' },
      { label: 'My Repos', path: 'user/repos' },
      { label: 'Trending', path: 'search/repositories?q=stars:>10000&sort=stars' },
    ],
    groq: [
      { label: 'List Models', path: 'v1/models' },
    ],
    openai: [
      { label: 'List Models', path: 'v1/models' },
    ],
    openweather: [
      { label: 'London', path: 'data/2.5/weather?q=London' },
      { label: 'New York', path: 'data/2.5/weather?q=New+York' },
      { label: 'Tokyo', path: 'data/2.5/weather?q=Tokyo' },
    ],
    weather: [
      { label: 'London', path: 'data/2.5/weather?q=London' },
    ],
    alphavantage: [
      { label: 'MSFT Quote', path: 'query?function=GLOBAL_QUOTE&symbol=MSFT' },
      { label: 'IBM Quote', path: 'query?function=GLOBAL_QUOTE&symbol=IBM' },
      { label: 'AAPL Quote', path: 'query?function=GLOBAL_QUOTE&symbol=AAPL' },
    ],
    twilio: [
      { label: 'My Account', path: '2010-04-01/Accounts.json' },
    ],
    stripe: [
      { label: 'Customers', path: 'v1/customers' },
    ],
  };

  const currentPresets = PRESET_ENDPOINTS[getProviderType(currentService?.id || 'github')] || [];

  React.useEffect(() => {
    const defaultTemplates: Record<string, string> = {
      github: 'rate_limit',
      openai: 'v1/models',
      groq: 'v1/models',
      openweather: 'data/2.5/weather?q=London',
      weather: 'data/2.5/weather?q=London',
      alphavantage: 'query?function=GLOBAL_QUOTE&symbol=MSFT',
      stripe: 'v1/customers',
      twilio: '2010-04-01/Accounts.json',
    };
    const provType = getProviderType(currentService?.id || 'github');
    setProxyEndpoint(defaultTemplates[provType] || 'v1/models');
    setProxyResponse(null);
    setProxyStatus(null);
  }, [currentService?.id]);

  const handleExecuteLiveProxy = async () => {
    try {
      if (!currentService) return;
      setIsExecutingProxy(true);
      setProxyResponse(null);
      const cleanPath = proxyEndpoint.replace(/^\/+/, '');
      const url = `/api/proxy/${currentService.id}/${cleanPath}`;

      const t0 = performance.now();
      const res = await fetch(url);
      const t1 = performance.now();

      const measuredLatency = `${Math.round(t1 - t0)}ms`;
      setProxyLatency(measuredLatency);
      setProxyStatus(res.status);

      const headersMap: Record<string, string> = {};
      res.headers.forEach((val, key) => {
        if (key.startsWith('x-') || key.includes('rate') || key.includes('content-type')) {
          headersMap[key] = val;
        }
      });
      setProxyHeaders(headersMap);

      const contentType = res.headers.get('content-type') || '';
      if (contentType.includes('application/json')) {
        const data = await res.json();
        setProxyResponse(data);
      } else {
        const text = await res.text();
        setProxyResponse(text);
      }
    } catch (err: any) {
      setProxyStatus(500);
      setProxyResponse({ error: 'Gateway Execution Failed', details: err?.message || String(err) });
    } finally {
      setIsExecutingProxy(false);
    }
  };

  // Filter logs for this service
  const serviceLogs = logs.filter(
    (l) => l.serviceId === currentService?.id || l.serviceName === currentService?.name
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

  const [isRefillingThis, setIsRefillingThis] = useState(false);

  const handleRefillThisService = async () => {
    if (!currentService) return;
    setIsRefillingThis(true);
    try {
      await resetRateLimit(currentService.id);
    } catch (e) {
      console.error(e);
    } finally {
      setTimeout(() => setIsRefillingThis(false), 2000);
    }
  };

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
        <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white/90 dark:bg-slate-900/80 p-5 backdrop-blur-xl shadow-sm dark:shadow-none flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider block">Quota Consumption</span>
              <button
                onClick={handleRefillThisService}
                title="Refill / Reset this Service Quota"
                className={`flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-lg border transition-all cursor-pointer ${
                  isRefillingThis
                    ? 'bg-emerald-500/20 text-emerald-700 dark:text-emerald-400 border-emerald-500/40 shadow-sm'
                    : 'bg-slate-100 dark:bg-slate-800/80 text-slate-600 dark:text-slate-300 hover:text-cyan-700 dark:hover:text-cyan-400 border-slate-200 dark:border-slate-700'
                }`}
              >
                {isRefillingThis ? (
                  <>
                    <CheckCircle2 className="h-3 w-3 text-emerald-500" />
                    <span>Refilled!</span>
                  </>
                ) : (
                  <>
                    <RefreshCw className="h-3 w-3" />
                    <span>Refill</span>
                  </>
                )}
              </button>
            </div>
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
        </div>

        {/* Card 2: Quota Reset Clock */}
        <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white/90 dark:bg-slate-900/80 p-5 backdrop-blur-xl shadow-sm dark:shadow-none">
          <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider block">Quota Reset Timer</span>
          <div className="mt-2 flex items-center gap-2">
            <Clock className="h-5 w-5 text-cyan-600 dark:text-cyan-400" />
            <span className="text-2xl font-bold text-slate-900 dark:text-white font-mono">{formatResetLabel(currentService.resetTime)}</span>
          </div>
          <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-2">Automatic quota refill cycle for this service</p>
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
            <span>Fire Live Ping</span>
          </button>
        </div>
      </div>

      {/* Live Gateway Request Console (Level 1 Real Proxy Interceptor) */}
      <div className="rounded-2xl border border-cyan-500/30 bg-gradient-to-br from-cyan-950/20 via-slate-900/90 to-slate-900/90 p-6 backdrop-blur-xl shadow-xl space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200 dark:border-slate-800 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-cyan-500/20 text-cyan-400 border border-cyan-500/40">
              <Terminal className="h-4 w-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                Live Gateway Reverse Proxy Console
                <span className="text-[10px] font-mono font-bold bg-cyan-500/20 text-cyan-400 px-2 py-0.5 rounded border border-cyan-500/30 uppercase">
                  Level 1 Live Traffic
                </span>
              </h3>
              <p className="text-xs text-slate-400">
                Execute live HTTP calls routed through KeyVault Gateway with your stored credentials
              </p>
            </div>
          </div>

          <div className="text-right">
            <span className="text-[11px] font-mono text-slate-400 block">Gateway Base:</span>
            <span className="text-xs font-mono font-bold text-cyan-400">/api/proxy/{currentService.id}/...</span>
          </div>
        </div>

        {/* Preset Quick-Launch Buttons */}
        {currentPresets.length > 0 && (
          <div className="flex flex-wrap gap-2">
            <span className="text-xs text-slate-500 dark:text-slate-400 self-center font-medium">Quick Launch:</span>
            {currentPresets.map((preset) => (
              <button
                key={preset.path}
                onClick={() => {
                  setProxyEndpoint(preset.path);
                  setProxyResponse(null);
                  setProxyStatus(null);
                }}
                className={`px-3 py-1 rounded-lg text-xs font-mono font-semibold border transition-all cursor-pointer ${
                  proxyEndpoint === preset.path
                    ? 'bg-cyan-500/20 border-cyan-500/40 text-cyan-400'
                    : 'bg-slate-800/60 border-slate-700 text-slate-400 hover:bg-slate-700 hover:text-white'
                }`}
              >
                {preset.label}
              </button>
            ))}
          </div>
        )}

        {/* Full URL Preview */}
        <div className="flex items-center gap-2 bg-slate-950 rounded-lg px-3 py-1.5 border border-slate-800 text-[11px] font-mono text-slate-500">
          <span className="text-slate-600">→</span>
          <span className="text-emerald-400 truncate">
            {`/api/proxy/${currentService?.id}/${proxyEndpoint.replace(/^\/+/, '')}`}
          </span>
        </div>

        {/* Input Bar */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
          <div className="flex-1 flex items-center bg-slate-950 rounded-xl border border-slate-700 px-3 py-2 font-mono text-xs">
            <span className="text-cyan-500 select-none mr-2 font-bold">GET</span>
            <span className="text-slate-500 select-none mr-1">/api/proxy/{currentService.id}/</span>
            <input
              type="text"
              value={proxyEndpoint}
              onChange={(e) => setProxyEndpoint(e.target.value)}
              placeholder="e.g. users/octocat or v1/models"
              className="flex-1 bg-transparent text-white focus:outline-none placeholder-slate-600 font-mono"
            />
          </div>

          <button
            onClick={handleExecuteLiveProxy}
            disabled={isExecutingProxy}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-bold px-5 py-2.5 text-xs shadow-lg shadow-cyan-500/20 transition-all cursor-pointer disabled:opacity-50"
          >
            {isExecutingProxy ? (
              <>
                <span className="h-3.5 w-3.5 rounded-full border-2 border-slate-950 border-t-transparent animate-spin" />
                <span>Forwarding...</span>
              </>
            ) : (
              <>
                <Zap className="h-3.5 w-3.5 fill-current" />
                <span>Send Real Request</span>
              </>
            )}
          </button>
        </div>

        {/* Live Response Panel */}
        {proxyStatus !== null && (
          <div className="rounded-xl border border-slate-800 bg-slate-950 p-4 space-y-3 animate-fade-in text-xs font-mono">
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-800 pb-2.5">
              <div className="flex items-center gap-2.5">
                <span
                  className={`px-2.5 py-1 rounded-md text-xs font-bold ${
                    proxyStatus >= 200 && proxyStatus < 300
                      ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                      : proxyStatus === 429
                      ? 'bg-red-500/20 text-red-400 border border-red-500/40'
                      : 'bg-amber-500/20 text-amber-400 border border-amber-500/40'
                  }`}
                >
                  HTTP {proxyStatus}
                </span>

                {proxyLatency && (
                  <span className="bg-slate-900 text-cyan-400 px-2 py-1 rounded border border-slate-800">
                    Latency: {proxyLatency}
                  </span>
                )}

                <span className="bg-slate-900 text-slate-300 px-2 py-1 rounded border border-slate-800 text-[11px]">
                  🛡️ Intercepted by KeyVault
                </span>
              </div>

              {proxyHeaders && proxyHeaders['x-ratelimit-remaining'] && (
                <span className="text-amber-400 text-[11px]">
                  Upstream Remaining: {proxyHeaders['x-ratelimit-remaining']} reqs
                </span>
              )}
            </div>

            {/* Response Body JSON */}
            <div className="max-h-60 overflow-y-auto rounded-lg bg-slate-900/80 p-3 border border-slate-800 text-slate-300 text-[11px] leading-relaxed">
              <pre className="whitespace-pre-wrap font-mono">
                {typeof proxyResponse === 'object'
                  ? JSON.stringify(proxyResponse, null, 2)
                  : String(proxyResponse)}
              </pre>
            </div>
          </div>
        )}
      </div>
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
