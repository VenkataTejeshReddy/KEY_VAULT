'use client';

import React, { useState, useEffect } from 'react';
import { useVault } from '../../context/VaultContext';
import { Incident, TimelineEvent } from '../../types';
import {
  ShieldAlert,
  Sparkles,
  RefreshCw,
  AlertTriangle,
  CheckCircle2,
  GitCommit,
  Flame,
  Settings,
  Clock,
  ArrowRight,
  Server,
  Zap,
  Activity,
  Terminal,
} from 'lucide-react';

export const IncidentView: React.FC = () => {
  const { theme, services } = useVault();
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [selectedIncidentId, setSelectedIncidentId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isAnalyzing, setIsAnalyzing] = useState<boolean>(false);

  // Fetch incidents from API
  const fetchIncidents = async () => {
    try {
      setIsLoading(true);
      const res = await fetch('/api/incidents');
      if (res.ok) {
        const data: Incident[] = await res.json();
        setIncidents(data);
        if (data.length > 0 && !selectedIncidentId) {
          setSelectedIncidentId(data[0].id);
        }
      }
    } catch (err) {
      console.error('Failed to load incidents:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchIncidents();
  }, []);

  // Trigger a new AI Root Cause Replay
  const triggerNewReplay = async (serviceId: string = 'alphavantage') => {
    try {
      setIsAnalyzing(true);
      const targetService = services.find((s) => s.id === serviceId) || services[2] || {
        name: 'Alpha Vantage',
        endpointUrl: 'https://www.alphavantage.co/query?function=TIME_SERIES_DAILY',
      };

      const res = await fetch('/api/incidents', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          affectedEndpoint: targetService.endpointUrl,
          serviceId: targetService.id,
          serviceName: targetService.name,
          errorRate: Math.floor(Math.random() * 25 + 25), // 25% - 50% error rate
        }),
      });

      if (res.ok) {
        const newIncident: Incident = await res.json();
        setIncidents((prev) => [newIncident, ...prev]);
        setSelectedIncidentId(newIncident.id);
      }
    } catch (err) {
      console.error('Failed to trigger incident replay:', err);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const activeIncident = incidents.find((i) => i.id === selectedIncidentId) || incidents[0];

  const getConfidenceBadge = (confidence?: string | null) => {
    switch (confidence?.toLowerCase()) {
      case 'high':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-mono font-bold bg-emerald-100 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-400 border border-emerald-300 dark:border-emerald-500/40 shadow-sm">
            <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
            HIGH CONFIDENCE (95%)
          </span>
        );
      case 'medium':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-mono font-bold bg-amber-100 dark:bg-amber-500/20 text-amber-700 dark:text-amber-400 border border-amber-300 dark:border-amber-500/40 shadow-sm">
            <span className="h-2 w-2 rounded-full bg-amber-500" />
            MEDIUM CONFIDENCE (75%)
          </span>
        );
      case 'low':
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-mono font-bold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-300 dark:border-slate-700 shadow-sm">
            <span className="h-2 w-2 rounded-full bg-slate-400" />
            HEURISTIC ESTIMATE
          </span>
        );
    }
  };

  const getEventIcon = (type: TimelineEvent['type']) => {
    switch (type) {
      case 'deploy':
        return <GitCommit className="h-4 w-4 text-purple-500" />;
      case 'traffic_burst':
        return <Flame className="h-4 w-4 text-amber-500" />;
      case 'config_change':
        return <Settings className="h-4 w-4 text-blue-500" />;
      case 'rate_limit_429':
        return <ShieldAlert className="h-4 w-4 text-red-500" />;
      case 'error_5xx':
        return <AlertTriangle className="h-4 w-4 text-red-600" />;
      case 'request_200':
      default:
        return <CheckCircle2 className="h-4 w-4 text-emerald-500" />;
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
            <ShieldAlert className="h-6 w-6 text-red-500" />
            Incident Black Box & AI Root-Cause Replay
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Automated event timeline assembly, cross-log correlation, and OpenAI-powered root cause narration
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          {/* Dynamic Service Selector for Replay */}
          <div className="flex items-center gap-2 bg-slate-100 dark:bg-slate-800/80 p-1 rounded-xl border border-slate-200 dark:border-slate-700">
            <select
              id="incident-service-select"
              defaultValue={services[0]?.id || 'github'}
              className="bg-transparent text-xs font-semibold text-slate-800 dark:text-slate-200 px-2 py-1 focus:outline-none cursor-pointer"
            >
              {services.map((svc) => (
                <option key={svc.id} value={svc.id} className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white">
                  {svc.name} ({svc.category})
                </option>
              ))}
            </select>
            <button
              onClick={() => {
                const selectEl = document.getElementById('incident-service-select') as HTMLSelectElement | null;
                const chosenId = selectEl ? selectEl.value : services[0]?.id;
                if (chosenId) triggerNewReplay(chosenId);
              }}
              disabled={isAnalyzing}
              className="inline-flex items-center gap-1.5 rounded-lg bg-gradient-to-r from-red-600 to-amber-600 hover:from-red-500 hover:to-amber-500 text-white px-3 py-1.5 text-xs font-bold shadow-md shadow-red-500/20 transition-all cursor-pointer disabled:opacity-50"
            >
              {isAnalyzing ? (
                <RefreshCw className="h-3.5 w-3.5 animate-spin" />
              ) : (
                <Sparkles className="h-3.5 w-3.5" />
              )}
              <span>{isAnalyzing ? 'Diagnosing...' : 'Replay Incident'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Incident Switcher Tabs */}
      {incidents.length > 0 && (
        <div className="flex gap-2 overflow-x-auto pb-1">
          {incidents.map((inc) => (
            <button
              key={inc.id}
              onClick={() => setSelectedIncidentId(inc.id)}
              className={`flex items-center gap-2.5 px-4 py-2.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer border ${
                selectedIncidentId === inc.id
                  ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white border-red-500/50 shadow-md ring-1 ring-red-500/20'
                  : 'bg-slate-100/80 dark:bg-slate-900/60 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-800 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <span className="h-2 w-2 rounded-full bg-red-500 animate-pulse" />
              <span>{inc.serviceName}</span>
              <span className="text-[10px] font-mono text-red-600 dark:text-red-400 bg-red-100 dark:bg-red-500/10 px-1.5 py-0.5 rounded border border-red-300 dark:border-red-500/30">
                {inc.errorRate}% Failures
              </span>
            </button>
          ))}
        </div>
      )}

      {activeIncident ? (
        <div className="space-y-6">
          {/* Card 1: AI Root Cause Narration & Executive Summary */}
          <div className="rounded-2xl border border-red-200 dark:border-red-500/30 bg-gradient-to-br from-red-50/70 via-white to-slate-50 dark:from-red-950/20 dark:via-slate-900/90 dark:to-slate-900/90 p-6 backdrop-blur-xl shadow-lg relative overflow-hidden">
            <div className="absolute top-0 right-0 w-80 h-80 bg-red-500/5 dark:bg-red-500/10 rounded-full blur-3xl pointer-events-none" />

            <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-4">
              <div className="space-y-3 max-w-3xl">
                <div className="flex flex-wrap items-center gap-2.5">
                  <span className="flex items-center gap-1.5 text-xs font-extrabold uppercase tracking-wider text-red-600 dark:text-red-400 font-mono">
                    <Sparkles className="h-4 w-4" />
                    OpenAI SRE Root-Cause Explanation
                  </span>
                  {getConfidenceBadge(activeIncident.confidence)}
                </div>

                <h2 className="text-xl font-black text-slate-900 dark:text-white leading-snug">
                  {activeIncident.explanation}
                </h2>

                {/* Triggering Event Highlight */}
                {activeIncident.triggeringEvent && (
                  <div className="flex items-start gap-2.5 rounded-xl bg-amber-50 dark:bg-amber-500/10 border border-amber-300 dark:border-amber-500/30 p-3 text-xs">
                    <Flame className="h-4 w-4 text-amber-500 shrink-0 mt-0.5" />
                    <div>
                      <span className="font-bold text-amber-900 dark:text-amber-300 block">Triggering Root Event:</span>
                      <span className="text-amber-800 dark:text-amber-200/90 font-mono mt-0.5 block">
                        {activeIncident.triggeringEvent}
                      </span>
                    </div>
                  </div>
                )}

                {/* Suggested Next Step */}
                {activeIncident.suggestedNextStep && (
                  <div className="flex items-start gap-2.5 rounded-xl bg-cyan-50 dark:bg-cyan-500/10 border border-cyan-300 dark:border-cyan-500/30 p-3 text-xs">
                    <Terminal className="h-4 w-4 text-cyan-600 dark:text-cyan-400 shrink-0 mt-0.5" />
                    <div>
                      <span className="font-bold text-cyan-900 dark:text-cyan-300 block">Suggested SRE Remediation:</span>
                      <span className="text-cyan-800 dark:text-cyan-200/90 mt-0.5 block">
                        {activeIncident.suggestedNextStep}
                      </span>
                    </div>
                  </div>
                )}
              </div>

              {/* Quick Incident Metadata Box */}
              <div className="bg-white/80 dark:bg-slate-950/80 rounded-xl border border-slate-200 dark:border-slate-800 p-4 min-w-[240px] space-y-2 text-xs font-mono">
                <div className="flex justify-between text-slate-500 dark:text-slate-400 border-b border-slate-200 dark:border-slate-800/80 pb-1.5">
                  <span>Incident ID:</span>
                  <span className="font-bold text-slate-900 dark:text-white">{activeIncident.id.slice(0, 12)}</span>
                </div>
                <div className="flex justify-between text-slate-500 dark:text-slate-400 border-b border-slate-200 dark:border-slate-800/80 pb-1.5">
                  <span>Affected Target:</span>
                  <span className="font-bold text-slate-900 dark:text-white">{activeIncident.serviceName}</span>
                </div>
                <div className="flex justify-between text-slate-500 dark:text-slate-400 border-b border-slate-200 dark:border-slate-800/80 pb-1.5">
                  <span>Error Spike:</span>
                  <span className="font-bold text-red-600 dark:text-red-400">{activeIncident.errorRate}% 5xx/429</span>
                </div>
                <div className="flex justify-between text-slate-500 dark:text-slate-400">
                  <span>Status:</span>
                  <span className="font-bold text-amber-600 dark:text-amber-400 uppercase">{activeIncident.status}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Card 2: Normalized Event Timeline Assembler */}
          <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white/90 dark:bg-slate-900/80 p-6 backdrop-blur-xl shadow-sm dark:shadow-xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-4">
              <div className="flex items-center gap-2.5">
                <Activity className="h-5 w-5 text-cyan-600 dark:text-cyan-400" />
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  Chronological Black Box Timeline (T-15min Window)
                </h3>
              </div>
              <span className="text-xs text-slate-500 dark:text-slate-400 font-mono">
                {activeIncident.timeline?.length || 0} correlated events
              </span>
            </div>

            {/* Timeline Stream */}
            <div className="relative pl-6 space-y-6 before:absolute before:left-2.5 before:top-3 before:bottom-3 before:w-0.5 before:bg-slate-200 dark:before:bg-slate-800">
              {activeIncident.timeline && activeIncident.timeline.length > 0 ? (
                activeIncident.timeline.map((event, idx) => {
                  const isTrigger = event.isTrigger;
                  return (
                    <div
                      key={event.id || idx}
                      className={`relative flex items-start gap-4 p-4 rounded-xl transition-all border ${
                        isTrigger
                          ? 'bg-red-50 dark:bg-red-500/10 border-red-300 dark:border-red-500/40 shadow-sm ring-1 ring-red-500/20'
                          : 'bg-slate-50/70 dark:bg-slate-950/50 border-slate-200 dark:border-slate-800/80 hover:bg-slate-100 dark:hover:bg-slate-800/40'
                      }`}
                    >
                      {/* Node Bullet on Timeline */}
                      <div
                        className={`absolute -left-[30px] top-4.5 h-5 w-5 rounded-full flex items-center justify-center border ${
                          isTrigger
                            ? 'bg-red-500 text-white border-red-300 shadow-md shadow-red-500/30'
                            : 'bg-white dark:bg-slate-900 text-slate-500 border-slate-300 dark:border-slate-700'
                        }`}
                      >
                        {getEventIcon(event.type)}
                      </div>

                      {/* Event Details */}
                      <div className="space-y-1.5 flex-1 text-xs">
                        <div className="flex flex-wrap items-center justify-between gap-2">
                          <div className="flex items-center gap-2">
                            <span className="font-mono font-bold text-slate-700 dark:text-slate-300">
                              {event.timestamp}
                            </span>
                            <span
                              className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase ${
                                event.type === 'deploy'
                                  ? 'bg-purple-100 dark:bg-purple-500/20 text-purple-700 dark:text-purple-300 border border-purple-500/30'
                                  : event.type === 'traffic_burst'
                                  ? 'bg-amber-100 dark:bg-amber-500/20 text-amber-700 dark:text-amber-300 border border-amber-500/30'
                                  : event.type === 'config_change'
                                  ? 'bg-blue-100 dark:bg-blue-500/20 text-blue-700 dark:text-blue-300 border border-blue-500/30'
                                  : event.type === 'rate_limit_429'
                                  ? 'bg-red-100 dark:bg-red-500/20 text-red-700 dark:text-red-300 border border-red-500/30'
                                  : event.type === 'error_5xx'
                                  ? 'bg-red-100 dark:bg-red-500/20 text-red-700 dark:text-red-300 border border-red-500/30'
                                  : 'bg-emerald-100 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 border border-emerald-500/30'
                              }`}
                            >
                              {event.type.replace('_', ' ')}
                            </span>
                          </div>

                          {isTrigger && (
                            <span className="inline-flex items-center gap-1 font-mono text-[10px] font-bold text-red-700 dark:text-red-400 bg-red-100 dark:bg-red-500/20 px-2 py-0.5 rounded-full border border-red-300 dark:border-red-500/40">
                              <span className="h-1.5 w-1.5 rounded-full bg-red-500 animate-pulse" />
                              IDENTIFIED TRIGGER
                            </span>
                          )}
                        </div>

                        <p className="font-semibold text-slate-900 dark:text-slate-100">
                          {event.summary}
                        </p>

                        {event.endpoint && (
                          <div className="flex items-center gap-3 text-[11px] font-mono text-slate-500 dark:text-slate-400 pt-0.5">
                            <span>Endpoint: {event.endpoint}</span>
                            {event.latency && <span>Latency: {event.latency}</span>}
                            {event.status && <span>HTTP {event.status}</span>}
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })
              ) : (
                <p className="text-xs text-slate-500">No events found in the incident window.</p>
              )}
            </div>
          </div>
        </div>
      ) : (
        <div className="text-center py-12 text-slate-500">
          <p>No incidents detected. Click &quot;Replay Incident&quot; above to simulate and analyze a failure.</p>
        </div>
      )}
    </div>
  );
};
