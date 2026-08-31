'use client';

import React, { useState } from 'react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend,
} from 'recharts';
import { useVault } from '../../context/VaultContext';
import { Activity, BarChart2 } from 'lucide-react';

export const UsageCharts: React.FC = () => {
  const { history, services, theme } = useVault();
  const [selectedServiceFilter, setSelectedServiceFilter] = useState<string>('all');

  // Colors mapping per service
  const serviceColors: Record<string, string> = {
    github: '#3b82f6',
    openweather: '#06b6d4',
    alphavantage: '#ef4444',
    openai: '#10b981',
    stripe: '#8b5cf6',
    twilio: '#f59e0b',
  };

  // Custom tooltip component for Recharts
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white/95 dark:bg-slate-900/95 p-3 shadow-2xl backdrop-blur-md text-xs">
          <p className="font-semibold text-slate-900 dark:text-slate-200 border-b border-slate-200 dark:border-slate-800 pb-1.5 mb-2 font-mono">
            {label} 2026
          </p>
          <div className="space-y-1">
            {payload.map((entry: any, index: number) => (
              <div key={`item-${index}`} className="flex items-center justify-between gap-4 font-mono">
                <span className="flex items-center gap-1.5" style={{ color: entry.color }}>
                  <span className="h-2 w-2 rounded-full" style={{ backgroundColor: entry.color }} />
                  {entry.name}:
                </span>
                <span className="font-bold text-slate-900 dark:text-white">{entry.value.toLocaleString()} reqs</span>
              </div>
            ))}
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white/90 dark:bg-slate-900/80 p-6 backdrop-blur-xl shadow-sm dark:shadow-xl transition-all duration-300">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <div className="flex items-center gap-2">
            <Activity className="h-5 w-5 text-cyan-600 dark:text-cyan-400" />
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">Historical API Key Usage</h3>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Aggregated request volume over the past 7 days across connected APIs
          </p>
        </div>

        {/* Service filter buttons */}
        <div className="flex flex-wrap items-center gap-1.5 bg-slate-100 dark:bg-slate-950/60 p-1.5 rounded-xl border border-slate-200 dark:border-slate-800">
          <button
            onClick={() => setSelectedServiceFilter('all')}
            className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
              selectedServiceFilter === 'all'
                ? 'bg-cyan-500 text-slate-950 font-bold shadow-md shadow-cyan-500/20'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200/60 dark:hover:bg-slate-800'
            }`}
          >
            All Services
          </button>
          {services.map((svc) => (
            <button
              key={svc.id}
              onClick={() => setSelectedServiceFilter(svc.id)}
              className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                selectedServiceFilter === svc.id
                  ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-bold border border-slate-200 dark:border-slate-700 shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200/60 dark:hover:bg-slate-800/50'
              }`}
            >
              {svc.name.split(' ')[0]}
            </button>
          ))}
        </div>
      </div>

      {/* Recharts Area Container */}
      <div className="h-72 w-full pt-2">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={history} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <defs>
              {services.map((svc) => (
                <linearGradient key={svc.id} id={`grad-${svc.id}`} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={svc.color} stopOpacity={0.4} />
                  <stop offset="95%" stopColor={svc.color} stopOpacity={0.0} />
                </linearGradient>
              ))}
              <linearGradient id="grad-total" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.5} />
                <stop offset="95%" stopColor="#06b6d4" stopOpacity={0.0} />
              </linearGradient>
            </defs>

            <CartesianGrid strokeDasharray="3 3" stroke={theme === 'dark' ? '#1e293b' : '#e2e8f0'} vertical={false} />
            <XAxis
              dataKey="date"
              stroke={theme === 'dark' ? '#64748b' : '#94a3b8'}
              fontSize={11}
              tickLine={false}
              axisLine={{ stroke: theme === 'dark' ? '#334155' : '#cbd5e1' }}
            />
            <YAxis
              stroke={theme === 'dark' ? '#64748b' : '#94a3b8'}
              fontSize={11}
              tickLine={false}
              axisLine={{ stroke: theme === 'dark' ? '#334155' : '#cbd5e1' }}
              tickFormatter={(val) => `${val}`}
            />
            <Tooltip content={<CustomTooltip />} />
            <Legend
              wrapperStyle={{ paddingTop: '10px', fontSize: '12px' }}
              formatter={(value) => <span className="text-slate-700 dark:text-slate-300 font-semibold">{value}</span>}
            />

            {selectedServiceFilter === 'all' ? (
              services.map((svc) => (
                <Area
                  key={svc.id}
                  type="monotone"
                  dataKey={svc.id}
                  name={svc.name}
                  stroke={svc.color}
                  strokeWidth={2}
                  fillOpacity={1}
                  fill={`url(#grad-${svc.id})`}
                  stackId="1"
                />
              ))
            ) : (
              <Area
                type="monotone"
                dataKey={selectedServiceFilter}
                name={services.find((s) => s.id === selectedServiceFilter)?.name || selectedServiceFilter}
                stroke={serviceColors[selectedServiceFilter] || '#06b6d4'}
                strokeWidth={3}
                fillOpacity={1}
                fill={`url(#grad-${selectedServiceFilter})`}
              />
            )}
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};
