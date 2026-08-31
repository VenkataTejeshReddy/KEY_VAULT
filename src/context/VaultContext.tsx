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

interface VaultContextType {
  activeView: ActiveView;
  setActiveView: (view: ActiveView) => void;
  selectedServiceId: string;
  setSelectedServiceId: (id: string) => void;
  openServiceDetail: (serviceId: string) => void;
  openForecast: () => void;
  
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
  
  // Data arrays
  services: ApiService[];
  keys: ApiKey[];
  logs: UsageLog[];
  history: UsageHistoryPoint[];

  // Forecast state
  forecasts: ServiceForecast[];
  forecastMultiplier: number;
  setForecastMultiplier: (multiplier: number) => void;
  forecastHistory: ForecastChartPoint[];

  // Actions
  addApiKey: (serviceId: string, serviceName: string, environment: KeyEnvironment, rawKey: string) => void;
  deleteApiKey: (keyId: string) => void;
  simulateApiCall: (serviceId?: string) => void;
  resetRateLimit: () => void;
}

const VaultContext = createContext<VaultContextType | undefined>(undefined);

export const VaultProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [activeView, setActiveView] = useState<ActiveView>('dashboard');
  const [selectedServiceId, setSelectedServiceId] = useState<string>('github');
  const [theme, setTheme] = useState<'dark' | 'light'>('dark');
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(true);
  
  const [tier, setTier] = useState<TierType>('free');
  const [alertThreshold, setAlertThreshold] = useState<number>(80);

  const [services, setServices] = useState<ApiService[]>(MOCK_SERVICES);
  const [keys, setKeys] = useState<ApiKey[]>(MOCK_KEYS);
  const [logs, setLogs] = useState<UsageLog[]>(MOCK_LOGS);
  const [history] = useState<UsageHistoryPoint[]>(MOCK_HISTORY);

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

  // Adjust used requests when tier changes so gauge scales naturally
  useEffect(() => {
    const max = getMaxRateLimit();
    if (tier === 'pro') {
      setUsedRequests(315);
    } else if (tier === 'enterprise') {
      setUsedRequests(1420);
    } else {
      setUsedRequests(42);
    }
  }, [tier]);

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

  // Periodic random API request simulator to make dashboard feel alive
  useEffect(() => {
    const interval = setInterval(() => {
      // 50% chance every 4 seconds to record a background request
      if (Math.random() > 0.5) {
        const randomService = services[Math.floor(Math.random() * services.length)];
        simulateApiCall(randomService.id);
      }
    }, 4000);

    return () => clearInterval(interval);
  }, [services]);

  const toggleTheme = () => {
    const nextTheme = theme === 'dark' ? 'light' : 'dark';
    setTheme(nextTheme);
    if (nextTheme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  };

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

  const addApiKey = (
    serviceId: string,
    serviceName: string,
    environment: KeyEnvironment,
    rawKey: string
  ) => {
    const prefix = rawKey.slice(0, 4) || 'key_';
    const suffix = rawKey.slice(-4) || 'X9Z2';
    const maskedKey = `${prefix}_****-****-${suffix}`;

    const newKey: ApiKey = {
      id: `key-${Date.now()}`,
      serviceId,
      serviceName,
      environment,
      maskedKey,
      rawKey,
      dateAdded: new Date().toISOString().split('T')[0],
      lastUsed: 'Just now',
      status: 'active',
    };

    setKeys((prev) => [newKey, ...prev]);

    // Update service count if needed
    setServices((prev) =>
      prev.map((s) => {
        if (s.id === serviceId) {
          const newUsed = Math.min(s.limit, s.used + 10);
          return {
            ...s,
            used: newUsed,
            statusColor: calculateStatusColor(newUsed, s.limit),
            status: calculateStatus(newUsed, s.limit),
          };
        }
        return s;
      })
    );
  };

  const deleteApiKey = (keyId: string) => {
    setKeys((prev) => prev.filter((k) => k.id !== keyId));
  };

  const simulateApiCall = (serviceId?: string) => {
    const targetServiceId = serviceId || selectedServiceId || 'github';
    const targetService = services.find((s) => s.id === targetServiceId) || services[0];
    
    // Increment global rate limit counter
    const maxLimit = getMaxRateLimit();
    setUsedRequests((prev) => Math.min(maxLimit, prev + 1));

    // Increment service specific used count
    setServices((prev) =>
      prev.map((s) => {
        if (s.id === targetServiceId) {
          const newUsed = Math.min(s.limit, s.used + Math.floor(Math.random() * 3) + 1);
          return {
            ...s,
            used: newUsed,
            statusColor: calculateStatusColor(newUsed, s.limit),
            status: calculateStatus(newUsed, s.limit),
          };
        }
        return s;
      })
    );

    // Create a new simulated log
    const now = new Date();
    const timestamp = now.toTimeString().split(' ')[0];
    const isRateLimited = usedRequests >= maxLimit * 0.95;
    const statusCode = isRateLimited ? 429 : 200;

    const endpointsMap: Record<string, string[]> = {
      github: ['/v3/user', '/v3/repos/octocat/hello', '/v3/commits/main'],
      openweather: ['/data/3.0/onecall', '/data/2.5/weather', '/data/2.5/forecast'],
      alphavantage: ['/query?function=TIME_SERIES_INTRADAY', '/query?function=GLOBAL_QUOTE'],
      openai: ['/v1/chat/completions', '/v1/embeddings', '/v1/models'],
      stripe: ['/v1/charges', '/v1/customers', '/v1/payment_intents'],
      twilio: ['/2010-04-01/Accounts/Messages.json', '/2010-04-01/Calls.json'],
    };

    const endpoints = endpointsMap[targetServiceId] || ['/v1/api/endpoint'];
    const chosenEndpoint = endpoints[Math.floor(Math.random() * endpoints.length)];

    const newLog: UsageLog = {
      id: `log-${Date.now()}`,
      serviceId: targetServiceId,
      serviceName: targetService.name,
      endpoint: chosenEndpoint,
      status: statusCode,
      responseTime: `${Math.floor(Math.random() * 200 + 30)} ms`,
      timestamp,
      payloadSize: `${(Math.random() * 10 + 0.5).toFixed(1)} KB`,
    };

    setLogs((prev) => [newLog, ...prev.slice(0, 49)]);
  };

  const resetRateLimit = () => {
    setUsedRequests(0);
    setRefillCountdown(60);
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

  return (
    <VaultContext.Provider
      value={{
        activeView,
        setActiveView,
        selectedServiceId,
        setSelectedServiceId,
        openServiceDetail,
        openForecast,
        theme,
        toggleTheme,
        isAuthenticated,
        login,
        logout,
        tier,
        setTier,
        getMaxRateLimit,
        alertThreshold,
        setAlertThreshold,
        usedRequests,
        refillCountdown,
        services,
        keys,
        logs,
        history,
        forecasts,
        forecastMultiplier,
        setForecastMultiplier,
        forecastHistory,
        addApiKey,
        deleteApiKey,
        simulateApiCall,
        resetRateLimit,
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
