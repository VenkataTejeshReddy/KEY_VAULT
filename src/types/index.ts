export type ServiceStatus = 'healthy' | 'warning' | 'critical';
export type StatusColor = 'green' | 'yellow' | 'red';
export type KeyEnvironment = 'Production' | 'Staging' | 'Development';
export type TierType = 'free' | 'pro' | 'enterprise';
export type ActiveView = 'login' | 'dashboard' | 'vault' | 'service-detail' | 'forecast' | 'incidents' | 'settings';

export interface ApiService {
  id: string;
  name: string;
  category: string;
  used: number;
  limit: number;
  status: ServiceStatus;
  statusColor: StatusColor;
  resetTime: string;
  endpointUrl: string;
  latencyMs: number;
  description: string;
  color: string;
}

export interface ApiKey {
  id: string;
  serviceId: string;
  serviceName: string;
  environment: KeyEnvironment;
  maskedKey: string;
  rawKey: string;
  dateAdded: string;
  lastUsed: string;
  status: 'active' | 'warning' | 'revoked';
}

export interface UsageLog {
  id: string;
  serviceId: string;
  serviceName: string;
  endpoint: string;
  status: number;
  responseTime: string;
  timestamp: string;
  payloadSize: string;
}

export interface UsageHistoryPoint {
  date: string;
  github: number;
  openweather: number;
  alphavantage: number;
  openai: number;
  stripe: number;
  twilio: number;
  total: number;
}

export interface RateLimitConfig {
  tier: TierType;
  maxRequests: number;
  refillIntervalSeconds: number;
}

export interface ServiceForecast {
  serviceId: string;
  serviceName: string;
  category: string;
  currentUsed: number;
  limit: number;
  burnRatePerMinute: number;
  projectedMonthlyUsage: number;
  estimatedDepletionTime: string;
  riskLevel: 'critical' | 'high' | 'moderate' | 'low';
  projectedCost: string;
  recommendation: string;
}

export interface ForecastChartPoint {
  date: string;
  actual?: number;
  projected?: number;
  upperBand?: number;
  lowerBand?: number;
  isForecast: boolean;
}

export interface TimelineEvent {
  id: string;
  timestamp: string;
  type: 'error_5xx' | 'rate_limit_429' | 'deploy' | 'config_change' | 'traffic_burst' | 'key_rotation' | 'request_200';
  summary: string;
  serviceName?: string;
  endpoint?: string;
  status?: number;
  latency?: string;
  isTrigger?: boolean;
}

export interface Incident {
  id: string;
  startTime: string;
  affectedEndpoint: string;
  serviceId?: string | null;
  serviceName?: string | null;
  errorRate: number;
  status: 'investigating' | 'resolved';
  explanation?: string | null;
  confidence?: 'high' | 'medium' | 'low' | string | null;
  triggeringEvent?: string | null;
  suggestedNextStep?: string | null;
  timeline?: TimelineEvent[];
  timelineJson?: string | null;
  createdAt: string;
}

