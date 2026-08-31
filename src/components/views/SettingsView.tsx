'use client';

import React from 'react';
import { useVault } from '../../context/VaultContext';
import { TierType } from '../../types';
import { Settings, Zap, Bell, Shield, Moon, Sun, Download, Sliders, CheckCircle2 } from 'lucide-react';

export const SettingsView: React.FC = () => {
  const {
    tier,
    setTier,
    alertThreshold,
    setAlertThreshold,
    theme,
    toggleTheme,
    getMaxRateLimit,
    usedRequests,
    keys,
    services,
  } = useVault();

  const maxLimit = getMaxRateLimit();
  const currentPercentage = Math.round((usedRequests / maxLimit) * 100);

  const handleExportKeys = () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(keys, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `keyvault_backup_${Date.now()}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  return (
    <div className="max-w-4xl space-y-8 animate-fade-in">
      {/* Top Title */}
      <div>
        <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
          <Settings className="h-6 w-6 text-cyan-600 dark:text-cyan-400" />
          KeyVault Settings & Configuration
        </h1>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
          Configure internal rate limits, notification alert thresholds, and security preferences
        </p>
      </div>

      {/* Section 1: Rate Limit Capacity Tier Switcher */}
      <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white/90 dark:bg-slate-900/80 p-6 backdrop-blur-xl shadow-sm dark:shadow-xl space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-cyan-50 dark:bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 border border-cyan-500/30">
              <Zap className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-white">Rate Limit Capacity Tier</h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Switching tiers immediately recalculates the rate limit gauge across all views
              </p>
            </div>
          </div>

          <span className="rounded-full bg-cyan-50 dark:bg-cyan-500/10 border border-cyan-500/30 px-3 py-1 font-mono text-xs font-bold text-cyan-700 dark:text-cyan-300">
            Active Max: {maxLimit} req/min
          </span>
        </div>

        {/* Tier Cards Options */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
          {/* Free Tier Card */}
          <div
            onClick={() => setTier('free')}
            className={`cursor-pointer rounded-2xl border p-5 transition-all duration-300 ${
              tier === 'free'
                ? 'border-cyan-500 bg-cyan-50/50 dark:bg-slate-800/90 shadow-md shadow-cyan-500/10 ring-1 ring-cyan-500'
                : 'border-slate-200 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-950/60 hover:border-slate-300 dark:hover:border-slate-700'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 font-mono">Free Tier</span>
              {tier === 'free' && <CheckCircle2 className="h-4 w-4 text-cyan-600 dark:text-cyan-400" />}
            </div>
            <div className="mt-3 flex items-baseline gap-1">
              <span className="text-3xl font-extrabold text-slate-900 dark:text-white font-mono">60</span>
              <span className="text-xs text-slate-500 dark:text-slate-400 font-mono">req/min</span>
            </div>
            <p className="mt-2 text-[11px] text-slate-500 dark:text-slate-400">Standard developer rate limit for lightweight evaluation</p>
          </div>

          {/* Pro Tier Card */}
          <div
            onClick={() => setTier('pro')}
            className={`cursor-pointer rounded-2xl border p-5 transition-all duration-300 ${
              tier === 'pro'
                ? 'border-cyan-500 bg-cyan-50/50 dark:bg-slate-800/90 shadow-md shadow-cyan-500/10 ring-1 ring-cyan-500'
                : 'border-slate-200 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-950/60 hover:border-slate-300 dark:hover:border-slate-700'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-cyan-600 dark:text-cyan-400 font-mono">Pro Tier</span>
              {tier === 'pro' && <CheckCircle2 className="h-4 w-4 text-cyan-600 dark:text-cyan-400" />}
            </div>
            <div className="mt-3 flex items-baseline gap-1">
              <span className="text-3xl font-extrabold text-slate-900 dark:text-white font-mono">600</span>
              <span className="text-xs text-slate-500 dark:text-slate-400 font-mono">req/min</span>
            </div>
            <p className="mt-2 text-[11px] text-slate-500 dark:text-slate-400">High bandwidth capacity for production app integration</p>
          </div>

          {/* Enterprise Tier Card */}
          <div
            onClick={() => setTier('enterprise')}
            className={`cursor-pointer rounded-2xl border p-5 transition-all duration-300 ${
              tier === 'enterprise'
                ? 'border-cyan-500 bg-cyan-50/50 dark:bg-slate-800/90 shadow-md shadow-cyan-500/10 ring-1 ring-cyan-500'
                : 'border-slate-200 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-950/60 hover:border-slate-300 dark:hover:border-slate-700'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-purple-600 dark:text-purple-400 font-mono">Enterprise</span>
              {tier === 'enterprise' && <CheckCircle2 className="h-4 w-4 text-cyan-600 dark:text-cyan-400" />}
            </div>
            <div className="mt-3 flex items-baseline gap-1">
              <span className="text-3xl font-extrabold text-slate-900 dark:text-white font-mono">3,000</span>
              <span className="text-xs text-slate-500 dark:text-slate-400 font-mono">req/min</span>
            </div>
            <p className="mt-2 text-[11px] text-slate-500 dark:text-slate-400">Uncapped burst capacity with priority routing</p>
          </div>
        </div>
      </div>

      {/* Section 2: Alert Threshold Slider */}
      <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white/90 dark:bg-slate-900/80 p-6 backdrop-blur-xl shadow-sm dark:shadow-xl space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-50 dark:bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/30">
              <Bell className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-white">Usage Alert Threshold Slider</h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Triggers visual warning banners when internal consumption hits target percentage
              </p>
            </div>
          </div>

          <span className="rounded-xl border border-amber-500/40 bg-amber-50 dark:bg-amber-500/10 px-3 py-1 font-mono text-sm font-extrabold text-amber-700 dark:text-amber-400">
            {alertThreshold}% Threshold
          </span>
        </div>

        <div className="space-y-4 pt-2">
          {/* Slider input */}
          <div className="relative pt-2">
            <input
              type="range"
              min="50"
              max="95"
              step="5"
              value={alertThreshold}
              onChange={(e) => setAlertThreshold(Number(e.target.value))}
              className="w-full h-3 bg-slate-200 dark:bg-slate-950 rounded-lg appearance-none cursor-pointer accent-cyan-500 border border-slate-300 dark:border-slate-800"
            />
            <div className="flex justify-between text-[11px] font-mono text-slate-500 dark:text-slate-500 mt-1">
              <span>50% (Conservative)</span>
              <span>70% (Standard)</span>
              <span>80% (Recommended)</span>
              <span>95% (Critical)</span>
            </div>
          </div>

          {/* Interactive Live Alert Status Preview */}
          <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/80 p-4 space-y-2">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider block">Live Alert Status Preview:</span>
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-700 dark:text-slate-300 font-mono">Current Usage ({usedRequests} / {maxLimit} req/min):</span>
              <span className="font-bold font-mono text-slate-900 dark:text-white">{currentPercentage}%</span>
            </div>

            {currentPercentage >= alertThreshold ? (
              <div className="flex items-center gap-2 rounded-lg bg-amber-100 dark:bg-amber-500/10 p-2.5 text-xs text-amber-800 dark:text-amber-400 border border-amber-300 dark:border-amber-500/30 font-medium">
                <Bell className="h-4 w-4 animate-bounce" />
                <span>ALERT TRIGGERED: Current consumption ({currentPercentage}%) exceeds set threshold ({alertThreshold}%).</span>
              </div>
            ) : (
              <div className="flex items-center gap-2 rounded-lg bg-emerald-100 dark:bg-emerald-500/10 p-2.5 text-xs text-emerald-800 dark:text-emerald-400 border border-emerald-300 dark:border-emerald-500/30 font-medium">
                <CheckCircle2 className="h-4 w-4" />
                <span>All clear: Current consumption ({currentPercentage}%) is safely below alert threshold ({alertThreshold}%).</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Section 3: Theme Preference & Data Export */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Theme Settings */}
        <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white/90 dark:bg-slate-900/80 p-6 backdrop-blur-xl shadow-sm dark:shadow-xl flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-purple-50 dark:bg-purple-500/10 text-purple-600 dark:text-purple-400 border border-purple-500/30">
                {theme === 'dark' ? <Moon className="h-5 w-5" /> : <Sun className="h-5 w-5" />}
              </div>
              <h2 className="text-base font-bold text-slate-900 dark:text-white">Visual Mode Theme</h2>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400">Toggle between Dark Mode (default) and Light Mode</p>
          </div>

          <div className="mt-4 flex items-center justify-between border-t border-slate-200 dark:border-slate-800 pt-4">
            <span className="text-xs font-mono text-slate-700 dark:text-slate-300">Active Theme: <span className="font-bold uppercase text-cyan-600 dark:text-cyan-400">{theme}</span></span>
            <button
              onClick={toggleTheme}
              className="flex items-center gap-2 rounded-xl bg-slate-100 dark:bg-slate-800 px-4 py-2 text-xs font-bold text-slate-900 dark:text-white hover:bg-slate-200 dark:hover:bg-slate-700 transition-all border border-slate-200 dark:border-slate-700 cursor-pointer"
            >
              {theme === 'dark' ? <Sun className="h-4 w-4 text-amber-400" /> : <Moon className="h-4 w-4 text-cyan-600" />}
              <span>Switch Mode</span>
            </button>
          </div>
        </div>

        {/* Data Export */}
        <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white/90 dark:bg-slate-900/80 p-6 backdrop-blur-xl shadow-sm dark:shadow-xl flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/30">
                <Download className="h-5 w-5" />
              </div>
              <h2 className="text-base font-bold text-slate-900 dark:text-white">Export Vault Credentials</h2>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400">Download active key records in JSON format for offline backup</p>
          </div>

          <div className="mt-4 flex items-center justify-between border-t border-slate-200 dark:border-slate-800 pt-4">
            <span className="text-xs font-mono text-slate-500 dark:text-slate-400">{keys.length} keys in memory</span>
            <button
              onClick={handleExportKeys}
              className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 px-4 py-2 text-xs font-bold text-slate-950 hover:from-cyan-400 hover:to-blue-500 transition-all shadow-md shadow-cyan-500/20 cursor-pointer"
            >
              <Download className="h-4 w-4" />
              <span>Export JSON</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
