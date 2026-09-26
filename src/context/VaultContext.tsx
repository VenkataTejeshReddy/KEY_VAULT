'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import {
  ApiService,
  ApiKey,
  UsageLog,
  UsageHistoryPoint,
  ActiveView,
  TierType,
  KeyEnvironment,
  ServiceForecast,
  ForecastChartPoint,
} from '../types';
import {
  MOCK_SERVICES,
  MOCK_KEYS,
  MOCK_LOGS,
  MOCK_HISTORY,
  MOCK_FORECASTS,
  generateForecastHistory,
  calculateStatusColor,
  calculateStatus,
} from '../lib/mockData';

interface ServiceMeta {
  category: string;
  endpointUrl: string;
  color: string;
  resetTime: string;
  limit: number;
  description: string;
  providerType?: string;
}

interface VaultContextType {
  activeView: ActiveView;
  setActiveView: (view: ActiveView) => void;
  selectedServiceId: string;
  setSelectedServiceId: (id: string) => void;
  openServiceDetail: (serviceId: string) => void;
  openForecast: () => void;
  openIncidents: () => void;
  
  theme: 'dark' | 'light';
  toggleTheme: () => void;

  isAuthenticated: boolean;
  login: () => void;
  logout: () => void;

  tier: TierType;
  setTier: (tier: TierType) => void;
  getMaxRateLimit: () => number;

  alertThreshold: number;
  setAlertThreshold: (threshold: number) => void;

  // Rate limit gauge state
  usedRequests: number;
  refillCountdown: number;
  liveQuota: { used: number; limit: number; resetInSeconds: number; source: string } | null;
  
  // Data arrays
  services: ApiService[];
  keys: ApiKey[];
  logs: UsageLog[];
  history: UsageHistoryPoint[];

  // Dashboard visibility
  visibleServiceIds: Set<string>;
  toggleServiceVisibility: (serviceId: string) => void;

  // Forecast state
  forecasts: ServiceForecast[];
  forecastMultiplier: number;
  setForecastMultiplier: (multiplier: number) => void;
  forecastHistory: ForecastChartPoint[];

  // Actions
  addApiKey: (serviceId: string, serviceName: string, environment: KeyEnvironment, rawKey: string, meta?: ServiceMeta) => Promise<void>;
  deleteApiKey: (keyId: string) => void;
  simulateApiCall: (serviceId?: string) => void;
  resetRateLimit: (serviceId?: string) => Promise<void>;
  floodService: (serviceId: string, count?: number) => Promise<{ triggered429: boolean; responses: number[] }>;
}

const VaultContext = createContext<VaultContextType | undefined>(undefined);

export const VaultProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [activeView, setActiveView] = useState<ActiveView>('dashboard');
  const [selectedServiceId, setSelectedServiceId] = useState<string>('github');
  const [theme, setThemeState] = useState<'dark' | 'light'>('dark');
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(true);

  const [tier, setTier] = useState<TierType>('free');
  const [alertThreshold, setAlertThreshold] = useState<number>(80);

  const [services, setServices] = useState<ApiService[]>([]);
  const [keys, setKeys] = useState<ApiKey[]>([]);
  const [logs, setLogs] = useState<UsageLog[]>([]);
  const [history] = useState<UsageHistoryPoint[]>(MOCK_HISTORY);

  // Dashboard visibility: which service cards to show
  const [visibleServiceIds, setVisibleServiceIds] = useState<Set<string>>(new Set());

  // Load visibility prefs from localStorage on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem('keyvault_visible_services');
      if (saved) {
        setVisibleServiceIds(new Set(JSON.parse(saved) as string[]));
      }
    } catch {}
  }, []);

  // When new services load and no visibility prefs exist yet, show all by default
  useEffect(() => {
    if (services.length > 0 && visibleServiceIds.size === 0) {
      setVisibleServiceIds(new Set(services.map((s) => s.id)));
    }
  }, [services]);

  const toggleServiceVisibility = (serviceId: string) => {
    setVisibleServiceIds((prev) => {
      const next = new Set(prev);
      if (next.has(serviceId)) {
        next.delete(serviceId);
      } else {
        next.add(serviceId);
      }
      try {
        localStorage.setItem('keyvault_visible_services', JSON.stringify([...next]));
      } catch {}
      return next;
    });
  };

  // Initialize theme from localStorage on client mount
  useEffect(() => {
    try {
      const savedTheme = localStorage.getItem('keyvault_theme') as 'dark' | 'light' | null;
      if (savedTheme === 'dark' || savedTheme === 'light') {
        setThemeState(savedTheme);
        if (savedTheme === 'dark') {
          document.documentElement.classList.add('dark');
          document.documentElement.style.colorScheme = 'dark';
        } else {
          document.documentElement.classList.remove('dark');
          document.documentElement.style.colorScheme = 'light';
        }
      } else {
        // Default to dark mode
        document.documentElement.classList.add('dark');
        document.documentElement.style.colorScheme = 'dark';
      }
    } catch {
      // ignore storage errors
    }
  }, []);

  const setTheme = (newTheme: 'dark' | 'light') => {
    setThemeState(newTheme);
    try {
      localStorage.setItem('keyvault_theme', newTheme);
    } catch {
      // ignore
    }
    if (newTheme === 'dark') {
      document.documentElement.classList.add('dark');
      document.documentElement.style.colorScheme = 'dark';
    } else {
      document.documentElement.classList.remove('dark');
      document.documentElement.style.colorScheme = 'light';
    }
  };

  const toggleTheme = () => {
    const nextTheme = theme === 'dark' ? 'light' : 'dark';
    setTheme(nextTheme);
  };

  // Fetch initial data from PostgreSQL via Next.js API
  useEffect(() => {
    Promise.all([
      fetch('/api/services').then(res => res.json()),
      fetch('/api/keys').then(res => res.json()),
      fetch('/api/logs').then(res => res.json())
    ]).then(([fetchedServices, fetchedKeys, fetchedLogs]) => {
      if (Array.isArray(fetchedServices) && fetchedServices.length > 0) setServices(fetchedServices);
      else setServices(MOCK_SERVICES);
      
      if (Array.isArray(fetchedKeys) && fetchedKeys.length > 0) setKeys(fetchedKeys);
      else setKeys(MOCK_KEYS);

      if (Array.isArray(fetchedLogs) && fetchedLogs.length > 0) setLogs(fetchedLogs);
      else setLogs(MOCK_LOGS);
    }).catch(console.error);
  }, []);

  // Rate limit gauge logic
  const getMaxRateLimit = (): number => {
    switch (tier) {
      case 'pro': return 600;
      case 'enterprise': return 3000;
      case 'free':
      default: return 60;
    }
  };

  const [usedRequests, setUsedRequests] = useState<number>(42);
  const [refillCountdown, setRefillCountdown] = useState<number>(48);
  const [liveQuota, setLiveQuota] = useState<{ used: number; limit: number; resetInSeconds: number; source: string } | null>(null);

  const fetchLiveQuota = async () => {
    try {
      const res = await fetch('/api/quota/github');
      if (res.ok) {
        const data = await res.json();
        if (data.source === 'live') {
          setLiveQuota({
            used: data.used,
            limit: data.limit,
            resetInSeconds: data.resetInSeconds,
            source: 'live',
          });
          // Also sync the local gauge with real data
          setUsedRequests(data.used);
          setRefillCountdown(data.resetInSeconds);
        }
      }
    } catch { /* silent fail */ }
  };

  // Poll real GitHub quota every 20 seconds
  useEffect(() => {
    fetchLiveQuota();
    const interval = setInterval(fetchLiveQuota, 20_000);
    return () => clearInterval(interval);
  }, []);

  // Load persisted usedRequests on client mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem('keyvault_used_requests');
      if (saved !== null) {
        setUsedRequests(Number(saved));
      }
    } catch {}
  }, []);

  // Persist usedRequests in localStorage whenever it changes
  useEffect(() => {
    try {
      localStorage.setItem('keyvault_used_requests', String(usedRequests));
    } catch {}
  }, [usedRequests]);

  // Adjust used requests when tier changes
  const handleSetTier = (newTier: TierType) => {
    setTier(newTier);
    if (newTier === 'pro') setUsedRequests(315);
    else if (newTier === 'enterprise') setUsedRequests(1420);
    else setUsedRequests(42);
  };

  // Countdown timer effect
  useEffect(() => {
    const interval = setInterval(() => {
      setRefillCountdown((prev) => {
        if (prev <= 1) {
          // Refill window!
          setUsedRequests((curr) => Math.max(0, Math.floor(curr * 0.15)));
          return 60;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  // Periodic live API heartbeat: pings real upstream proxy endpoints (GitHub, Groq, Twilio)
  // so every single line in the dashboard log and telemetry is a real HTTP round-trip with real latency
  useEffect(() => {
    const liveServices = ['github', 'groq', 'twilio'];
    let index = 0;

    const interval = setInterval(() => {
      const activeServiceId = liveServices[index % liveServices.length];
      index++;
      simulateApiCall(activeServiceId);
    }, 7000);

    return () => clearInterval(interval);
  }, [services]);

  // Periodic poll of real logs and services from PostgreSQL
  useEffect(() => {
    const syncInterval = setInterval(() => {
      Promise.all([
        fetch('/api/logs').then((r) => r.json()),
        fetch('/api/services').then((r) => r.json()),
      ])
        .then(([fetchedLogs, fetchedServices]) => {
          if (Array.isArray(fetchedLogs) && fetchedLogs.length > 0) setLogs(fetchedLogs);
          if (Array.isArray(fetchedServices) && fetchedServices.length > 0) setServices(fetchedServices);
        })
        .catch(() => {});
    }, 6000);

    return () => clearInterval(syncInterval);
  }, []);

  const login = () => {
    setIsAuthenticated(true);
    setActiveView('dashboard');
  };

  const logout = () => {
    setIsAuthenticated(false);
    setActiveView('login');
  };

  const openServiceDetail = (serviceId: string) => {
    setSelectedServiceId(serviceId);
    setActiveView('service-detail');
  };

  const addApiKey = async (
    serviceId: string,
    serviceName: string,
    environment: KeyEnvironment,
    rawKey: string,
    meta?: ServiceMeta
  ): Promise<void> => {
    const prefix = rawKey.slice(0, 4) || 'key_';
    const suffix = rawKey.slice(-4) || 'X9Z2';
    const maskedKey = `${prefix}_****-****-${suffix}`;

    try {
      // Step 1: Create a brand-new ApiService row so the card appears on the dashboard
      if (meta) {
        const svcRes = await fetch('/api/services', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            id: serviceId,
            name: serviceName,
            category: meta.category,
            used: 0,
            limit: meta.limit,
            status: 'healthy',
            statusColor: 'green',
            resetTime: meta.resetTime,
            endpointUrl: meta.endpointUrl,
            latencyMs: 120,
            description: meta.description,
            color: meta.color,
          }),
        });
        if (svcRes.ok) {
          const newSvc = await svcRes.json();
          setServices((prev) => [...prev, newSvc]);
          // Auto-show the new card
          setVisibleServiceIds((prev) => {
            const next = new Set(prev);
            next.add(newSvc.id);
            try {
              localStorage.setItem('keyvault_visible_services', JSON.stringify([...next]));
            } catch {}
            return next;
          });
        }
      }

      // Step 2: Save the key linked to the new service
      const newKeyData = {
        serviceId,
        serviceName,
        environment,
        maskedKey,
        rawKey,
        dateAdded: new Date().toISOString().split('T')[0],
        lastUsed: 'Just now',
        status: 'active',
      };
      const keyRes = await fetch('/api/keys', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newKeyData),
      });
      if (!keyRes.ok) throw new Error('Failed to save key');
      const savedKey = await keyRes.json();
      setKeys((prev) => [savedKey, ...prev]);
    } catch (err) {
      console.error(err);
    }
  };

  const deleteApiKey = async (keyId: string) => {
    try {
      // Allow optimistic UI update or wait for network. We will wait for network here.
      const res = await fetch(`/api/keys?id=${keyId}`, { method: 'DELETE' });
      if (res.ok) {
        setKeys((prev) => prev.filter((k) => k.id !== keyId));
      }
    } catch (err) {
      console.error('Failed to delete key', err);
    }
  };

  // Live API Ping: executes a real HTTP request through the KeyVault proxy gateway
  const simulateApiCall = async (serviceId?: string) => {
    const targetServiceId = serviceId || selectedServiceId || 'github';
    const targetService = services.find((s) => s.id === targetServiceId) || services[0];

    // Resolve canonical provider from dynamic IDs like "groq-1748234567890"
    const knownProviders = ['github','openai','groq','openweather','weather','alphavantage','twilio','stripe'];
    const resolveProvider = (id: string) => {
      if (knownProviders.includes(id)) return id;
      const m = id.match(/^([a-z]+)-\d+$/);
      if (m && knownProviders.includes(m[1])) return m[1];
      const prefix = id.split('-')[0];
      return knownProviders.includes(prefix) ? prefix : id;
    };
    const providerType = resolveProvider(targetServiceId);

    const providerPaths: Record<string, string> = {
      github: 'rate_limit',
      groq: 'v1/models',
      twilio: '2010-04-01/Accounts.json',
      alphavantage: 'query?function=GLOBAL_QUOTE&symbol=MSFT',
      openweather: 'data/2.5/weather?q=London',
      openai: 'v1/models',
    };

    const proxyPath = providerPaths[providerType] || 'v1/models';
    const endpoint = `/api/proxy/${targetServiceId}/${proxyPath}`;
    const startTime = performance.now();

    try {
      const res = await fetch(endpoint);
      const latencyMs = Math.round(performance.now() - startTime);
      const headerLatency = res.headers.get('X-KeyVault-Latency') || `${latencyMs}ms`;
      const byteLength = Number(res.headers.get('content-length')) || 850;
      const payloadSizeStr = `${(byteLength / 1024).toFixed(1)} KB`;
      const now = new Date();

      const newLog: UsageLog = {
        id: `log-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
        serviceId: targetServiceId,
        serviceName: targetService?.name || targetServiceId,
        endpoint: endpoint.replace(`/api/proxy/${targetServiceId}`, ''),
        status: res.status,
        responseTime: headerLatency,
        timestamp: now.toTimeString().split(' ')[0],
        payloadSize: payloadSizeStr,
      };

      setLogs((prev) => [newLog, ...prev.slice(0, 49)]);

      // Sync service stats
      fetch('/api/services')
        .then((r) => r.json())
        .then((fetched) => {
          if (Array.isArray(fetched) && fetched.length > 0) setServices(fetched);
        })
        .catch(() => {});
    } catch (err) {
      console.warn('Real live proxy ping notice:', err);
    }
  };

  const resetRateLimit = async (serviceId?: string) => {
    setUsedRequests(0);
    setRefillCountdown(60);
    try {
      // Reset service usage in DB so Gateway unblocks
      const targetServices = serviceId
        ? services.filter((s) => s.id === serviceId)
        : services;

      await Promise.all(
        targetServices.map((s) =>
          fetch('/api/services', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ ...s, used: 0, status: 'healthy', statusColor: 'green' }),
          })
        )
      );
      const updated = await fetch('/api/services').then((r) => r.json());
      if (Array.isArray(updated)) setServices(updated);
    } catch {}
  };

  // Flood Test: fires `count` real proxy requests in rapid succession to consume quota & trigger a genuine 429
  const floodService = async (serviceId: string, count: number = 60): Promise<{ triggered429: boolean; responses: number[] }> => {
    // Resolve canonical provider from dynamic IDs like "groq-1748234567890"
    const knownProviders = ['github','openai','groq','openweather','weather','alphavantage','twilio','stripe'];
    const resolveProvider = (id: string) => {
      if (knownProviders.includes(id)) return id;
      const m = id.match(/^([a-z]+)-\d+$/);
      if (m && knownProviders.includes(m[1])) return m[1];
      const prefix = id.split('-')[0];
      return knownProviders.includes(prefix) ? prefix : id;
    };
    const providerType = resolveProvider(serviceId);

    const floodPaths: Record<string, string> = {
      github: 'user',
      groq: 'v1/models',
      alphavantage: 'query?function=GLOBAL_QUOTE&symbol=MSFT',
      twilio: '2010-04-01/Accounts.json',
      openweather: 'data/2.5/weather?q=London',
      openai: 'v1/models',
    };
    const proxyPath = floodPaths[providerType] || 'v1/models';
    const endpoint = `/api/proxy/${serviceId}/${proxyPath}`;
    const statuses: number[] = [];

    const batch = Array.from({ length: count }, () =>
      fetch(endpoint).then((r) => r.status).catch(() => 0)
    );
    const results = await Promise.allSettled(batch);
    results.forEach((r) => statuses.push(r.status === 'fulfilled' ? r.value : 0));

    const triggered429 = statuses.includes(429);

    // Log the flood result as a new incident if 429 was triggered
    if (triggered429) {
      fetch('/api/incidents', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          serviceId,
          serviceName: services.find((s) => s.id === serviceId)?.name || serviceId,
          affectedEndpoint: endpoint,
          errorRate: (statuses.filter((s) => s === 429).length / statuses.length) * 100,
        }),
      }).catch(console.error);
    }

    // Immediately sync live quota and telemetry from server
    await fetchLiveQuota();
    fetch('/api/services')
      .then((r) => r.json())
      .then((fetched) => {
        if (Array.isArray(fetched) && fetched.length > 0) setServices(fetched);
      })
      .catch(() => {});
    fetch('/api/logs')
      .then((r) => r.json())
      .then((fetchedLogs) => {
        if (Array.isArray(fetchedLogs) && fetchedLogs.length > 0) setLogs(fetchedLogs);
      })
      .catch(() => {});

    return { triggered429, responses: statuses };
  };

  const [forecastMultiplier, setForecastMultiplier] = useState<number>(1.0);
  const [forecasts, setForecasts] = useState<ServiceForecast[]>(MOCK_FORECASTS);

  // Recalculate forecasts when multiplier changes or services change
  useEffect(() => {
    setForecasts(
      MOCK_FORECASTS.map((f) => {
        const matchingService = services.find((s) => s.id === f.serviceId);
        const currentUsed = matchingService ? matchingService.used : f.currentUsed;
        const limit = matchingService ? matchingService.limit : f.limit;
        const burnRate = Number((f.burnRatePerMinute * forecastMultiplier).toFixed(1));
        const remaining = Math.max(0, limit - currentUsed);
        
        let estimatedTime = 'Safe (>30 days)';
        let riskLevel: 'critical' | 'high' | 'moderate' | 'low' = 'low';

        if (burnRate > 0) {
          const minutesToDeplete = remaining / burnRate;
          if (minutesToDeplete <= 15) {
            estimatedTime = `${Math.max(1, Math.round(minutesToDeplete))} mins`;
            riskLevel = 'critical';
          } else if (minutesToDeplete <= 120) {
            estimatedTime = `${(minutesToDeplete / 60).toFixed(1)} hours`;
            riskLevel = 'high';
          } else if (minutesToDeplete <= 1440) {
            estimatedTime = `${(minutesToDeplete / 60).toFixed(1)} hours`;
            riskLevel = 'moderate';
          } else if (minutesToDeplete <= 43200) {
            estimatedTime = `${(minutesToDeplete / 1440).toFixed(1)} days`;
            riskLevel = 'moderate';
          }
        }

        return {
          ...f,
          currentUsed,
          limit,
          burnRatePerMinute: burnRate,
          projectedMonthlyUsage: Math.round(f.projectedMonthlyUsage * forecastMultiplier),
          estimatedDepletionTime: estimatedTime,
          riskLevel,
        };
      })
    );
  }, [forecastMultiplier, services]);

  const forecastHistory = generateForecastHistory(forecastMultiplier);

  const openForecast = () => {
    setActiveView('forecast');
  };

  const openIncidents = () => {
    setActiveView('incidents');
  };

  return (
    <VaultContext.Provider
      value={{
        activeView,
        setActiveView,
        selectedServiceId,
        setSelectedServiceId,
        openServiceDetail,
        openForecast,
        openIncidents,
        theme,
        toggleTheme,
        isAuthenticated,
        login,
        logout,
        tier,
        setTier: handleSetTier,
        getMaxRateLimit,
        alertThreshold,
        setAlertThreshold,
        usedRequests,
        refillCountdown,
        liveQuota,
        services,
        keys,
        logs,
        history,
        visibleServiceIds,
        toggleServiceVisibility,
        forecasts,
        forecastMultiplier,
        setForecastMultiplier,
        forecastHistory,
        addApiKey,
        deleteApiKey,
        simulateApiCall,
        resetRateLimit,
        floodService,
      }}
    >
      {children}
    </VaultContext.Provider>
  );
};

export const useVault = () => {
  const context = useContext(VaultContext);
  if (!context) {
    throw new Error('useVault must be used within a VaultProvider');
  }
  return context;
};
