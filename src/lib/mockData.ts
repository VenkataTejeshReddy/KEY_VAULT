import {
  ApiService,
  ApiKey,
  UsageLog,
  UsageHistoryPoint,
  StatusColor,
  ServiceStatus,
  ServiceForecast,
  ForecastChartPoint,
} from '../types';

export const calculateStatusColor = (used: number, limit: number): StatusColor => {
  const percentage = (used / limit) * 100;
  if (percentage > 90) return 'red';
  if (percentage >= 70) return 'yellow';
  return 'green';
};

export const calculateStatus = (used: number, limit: number): ServiceStatus => {
  const percentage = (used / limit) * 100;
  if (percentage > 90) return 'critical';
  if (percentage >= 70) return 'warning';
  return 'healthy';
};

export const MOCK_SERVICES: ApiService[] = [
  {
    id: 'github',
    name: 'GitHub API',
    category: 'Developer Tools',
    used: 4250,
    limit: 5000,
    status: 'warning',
    statusColor: 'yellow',
    resetTime: '24 mins',
    endpointUrl: 'https://api.github.com/v3',
    latencyMs: 42,
    description: 'REST API for repos, commits, and workflow automation',
    color: '#3b82f6', // blue
  },
  {
    id: 'openweather',
    name: 'OpenWeatherMap',
    category: 'Weather Telemetry',
    used: 820,
    limit: 1000,
    status: 'warning',
    statusColor: 'yellow',
    resetTime: '45 mins',
    endpointUrl: 'https://api.openweathermap.org/data/3.0',
    latencyMs: 128,
    description: 'Current weather data, forecasts, and historical observations',
    color: '#06b6d4', // cyan
  },
  {
    id: 'alphavantage',
    name: 'Alpha Vantage',
    category: 'Financial Market Data',
    used: 475,
    limit: 500,
    status: 'critical',
    statusColor: 'red',
    resetTime: '12 mins',
    endpointUrl: 'https://www.alphavantage.co/query',
    latencyMs: 195,
    description: 'Real-time and historical stock market and crypto APIs',
    color: '#ef4444', // red
  },
  {
    id: 'openai',
    name: 'OpenAI API',
    category: 'AI & Machine Learning',
    used: 14200,
    limit: 30000,
    status: 'healthy',
    statusColor: 'green',
    resetTime: '3h 15m',
    endpointUrl: 'https://api.openai.com/v1',
    latencyMs: 340,
    description: 'GPT-4o, Embeddings, and Whisper inference pipeline',
    color: '#10b981', // emerald
  },
  {
    id: 'stripe',
    name: 'Stripe API',
    category: 'Payments & Billing',
    used: 1120,
    limit: 10000,
    status: 'healthy',
    statusColor: 'green',
    resetTime: '1h 05m',
    endpointUrl: 'https://api.stripe.com/v1',
    latencyMs: 85,
    description: 'Payment intents, recurring subscriptions, and invoicing',
    color: '#8b5cf6', // purple
  },
  {
    id: 'twilio',
    name: 'Twilio SMS',
    category: 'Communications',
    used: 485,
    limit: 500,
    status: 'critical',
    statusColor: 'red',
    resetTime: '5 mins',
    endpointUrl: 'https://api.twilio.com/2010-04-01',
    latencyMs: 110,
    description: 'Programmable SMS, voice calls, and multi-factor auth',
    color: '#f59e0b', // amber
  },
];

export const MOCK_KEYS: ApiKey[] = [
  {
    id: 'key-1',
    serviceId: 'github',
    serviceName: 'GitHub API',
    environment: 'Production',
    maskedKey: 'ghp_****-****-9F2A',
    rawKey: 'ghp_xK9mP2vL8nQ3wE7rT1yU4iO6pS9F2A',
    dateAdded: '2026-08-15',
    lastUsed: '2 mins ago',
    status: 'active',
  },
  {
    id: 'key-2',
    serviceId: 'openweather',
    serviceName: 'OpenWeatherMap',
    environment: 'Production',
    maskedKey: 'owm_****-****-7B4D',
    rawKey: 'owm_8a7d6c5b4a3f2e1d9c8b7a6f5e4d7B4D',
    dateAdded: '2026-07-28',
    lastUsed: '14 mins ago',
    status: 'active',
  },
  {
    id: 'key-3',
    serviceId: 'alphavantage',
    serviceName: 'Alpha Vantage',
    environment: 'Development',
    maskedKey: 'alpha_****-****-1C8E',
    rawKey: 'alpha_Z9X8Y7W6V5U4T3S2R1Q0P1C8E',
    dateAdded: '2026-08-01',
    lastUsed: '1 min ago',
    status: 'warning',
  },
  {
    id: 'key-4',
    serviceId: 'openai',
    serviceName: 'OpenAI API',
    environment: 'Production',
    maskedKey: 'sk-proj-****-****-3M9X',
    rawKey: 'sk-proj-9876543210abcdef01234567893M9X',
    dateAdded: '2026-06-10',
    lastUsed: 'Just now',
    status: 'active',
  },
  {
    id: 'key-5',
    serviceId: 'stripe',
    serviceName: 'Stripe API',
    environment: 'Staging',
    maskedKey: 'sk_test_****-****-55AK',
    rawKey: 'sk_test_51MzX90A812B34C56D78E90F12355AK',
    dateAdded: '2026-08-20',
    lastUsed: '4 hours ago',
    status: 'active',
  },
  {
    id: 'key-6',
    serviceId: 'twilio',
    serviceName: 'Twilio SMS',
    environment: 'Production',
    maskedKey: 'AC_live_****-****-881Q',
    rawKey: 'AC_live_11223344556677889900aabbcc881Q',
    dateAdded: '2026-05-14',
    lastUsed: '8 mins ago',
    status: 'warning',
  },
];

export const MOCK_HISTORY: UsageHistoryPoint[] = [
  { date: 'Aug 21', github: 420, openweather: 95, alphavantage: 40, openai: 1450, stripe: 120, twilio: 45, total: 2170 },
  { date: 'Aug 22', github: 580, openweather: 110, alphavantage: 55, openai: 1820, stripe: 140, twilio: 60, total: 2765 },
  { date: 'Aug 23', github: 610, openweather: 105, alphavantage: 70, openai: 2100, stripe: 160, twilio: 80, total: 3125 },
  { date: 'Aug 24', github: 550, openweather: 130, alphavantage: 65, openai: 1950, stripe: 155, twilio: 75, total: 2925 },
  { date: 'Aug 25', github: 710, openweather: 125, alphavantage: 80, openai: 2300, stripe: 190, twilio: 90, total: 3495 },
  { date: 'Aug 26', github: 690, openweather: 140, alphavantage: 85, openai: 2150, stripe: 175, twilio: 70, total: 3310 },
  { date: 'Aug 27', github: 690, openweather: 115, alphavantage: 80, openai: 2480, stripe: 180, twilio: 65, total: 3610 },
];

export const MOCK_LOGS: UsageLog[] = [
  {
    id: 'log-101',
    serviceId: 'openai',
    serviceName: 'OpenAI API',
    endpoint: '/v1/chat/completions',
    status: 200,
    responseTime: '342 ms',
    timestamp: '10:14:02',
    payloadSize: '2.4 KB',
  },
  {
    id: 'log-102',
    serviceId: 'alphavantage',
    serviceName: 'Alpha Vantage',
    endpoint: '/query?function=TIME_SERIES_DAILY',
    status: 429,
    responseTime: '180 ms',
    timestamp: '10:13:45',
    payloadSize: '0.4 KB',
  },
  {
    id: 'log-103',
    serviceId: 'github',
    serviceName: 'GitHub API',
    endpoint: '/user/repos',
    status: 200,
    responseTime: '45 ms',
    timestamp: '10:12:10',
    payloadSize: '18.1 KB',
  },
  {
    id: 'log-104',
    serviceId: 'stripe',
    serviceName: 'Stripe API',
    endpoint: '/v1/payment_intents',
    status: 200,
    responseTime: '92 ms',
    timestamp: '10:11:30',
    payloadSize: '4.8 KB',
  },
  {
    id: 'log-105',
    serviceId: 'twilio',
    serviceName: 'Twilio SMS',
    endpoint: '/2010-04-01/Accounts/Messages.json',
    status: 429,
    responseTime: '115 ms',
    timestamp: '10:09:55',
    payloadSize: '0.8 KB',
  },
  {
    id: 'log-106',
    serviceId: 'openweather',
    serviceName: 'OpenWeatherMap',
    endpoint: '/data/3.0/onecall',
    status: 200,
    responseTime: '124 ms',
    timestamp: '10:08:20',
    payloadSize: '6.2 KB',
  },
];

export const MOCK_FORECASTS: ServiceForecast[] = [
  {
    serviceId: 'alphavantage',
    serviceName: 'Alpha Vantage',
    category: 'Financial Market Data',
    currentUsed: 475,
    limit: 500,
    burnRatePerMinute: 4.8,
    projectedMonthlyUsage: 14250,
    estimatedDepletionTime: '5 mins',
    riskLevel: 'critical',
    projectedCost: '$49.00',
    recommendation: 'Enable client-side caching (TTL 300s) or upgrade to Premium 500 req/min tier.',
  },
  {
    serviceId: 'twilio',
    serviceName: 'Twilio SMS',
    category: 'Communications',
    currentUsed: 485,
    limit: 500,
    burnRatePerMinute: 3.2,
    projectedMonthlyUsage: 9600,
    estimatedDepletionTime: '12 mins',
    riskLevel: 'critical',
    projectedCost: '$120.00',
    recommendation: 'Batch outgoing MFA SMS queues to prevent burst throttle errors.',
  },
  {
    serviceId: 'github',
    serviceName: 'GitHub API',
    category: 'Developer Tools',
    currentUsed: 4250,
    limit: 5000,
    burnRatePerMinute: 18.5,
    projectedMonthlyUsage: 48500,
    estimatedDepletionTime: '40 mins',
    riskLevel: 'high',
    projectedCost: '$0.00 (Enterprise Plan)',
    recommendation: 'Implement conditional ETag headers to reduce consumed rate allocation.',
  },
  {
    serviceId: 'openweather',
    serviceName: 'OpenWeatherMap',
    category: 'Weather Telemetry',
    currentUsed: 820,
    limit: 1000,
    burnRatePerMinute: 2.1,
    projectedMonthlyUsage: 3200,
    estimatedDepletionTime: '1.4 hours',
    riskLevel: 'high',
    projectedCost: '$15.00',
    recommendation: 'Increase geolocation query aggregation interval from 1m to 5m.',
  },
  {
    serviceId: 'openai',
    serviceName: 'OpenAI API',
    category: 'AI & Machine Learning',
    currentUsed: 14200,
    limit: 30000,
    burnRatePerMinute: 38.0,
    projectedMonthlyUsage: 92400,
    estimatedDepletionTime: '6.9 hours',
    riskLevel: 'moderate',
    projectedCost: '$240.00',
    recommendation: 'Switch summarization sub-tasks to GPT-4o-mini to reduce token burn by 65%.',
  },
  {
    serviceId: 'stripe',
    serviceName: 'Stripe API',
    category: 'Payments & Billing',
    currentUsed: 1120,
    limit: 10000,
    burnRatePerMinute: 1.4,
    projectedMonthlyUsage: 4200,
    estimatedDepletionTime: 'Safe (>30 days)',
    riskLevel: 'low',
    projectedCost: '$0.00',
    recommendation: 'Rate allocation optimal. No proactive adjustment required.',
  },
];

export const generateForecastHistory = (multiplier: number = 1.0): ForecastChartPoint[] => {
  const baseHistorical: ForecastChartPoint[] = [
    { date: 'Aug 21', actual: 2170, isForecast: false },
    { date: 'Aug 22', actual: 2765, isForecast: false },
    { date: 'Aug 23', actual: 3125, isForecast: false },
    { date: 'Aug 24', actual: 2925, isForecast: false },
    { date: 'Aug 25', actual: 3495, isForecast: false },
    { date: 'Aug 26', actual: 3310, isForecast: false },
    { date: 'Aug 27 (Today)', actual: 3610, projected: 3610, upperBand: 3610, lowerBand: 3610, isForecast: false },
  ];

  const baseToday = 3610;
  const growthRate = 0.05 * multiplier;

  const futureDates = [
    'Aug 28', 'Aug 29', 'Aug 30', 'Aug 31', 'Sep 01', 'Sep 02', 'Sep 03'
  ];

  const futurePoints: ForecastChartPoint[] = futureDates.map((date, idx) => {
    const step = idx + 1;
    const projected = Math.round(baseToday * (1 + growthRate * step) * multiplier);
    const variance = Math.round(projected * 0.12 * Math.sqrt(step));
    return {
      date,
      projected,
      upperBand: projected + variance,
      lowerBand: Math.max(0, projected - variance),
      isForecast: true,
    };
  });

  return [...baseHistorical, ...futurePoints];
};
