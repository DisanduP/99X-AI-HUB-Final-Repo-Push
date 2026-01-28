export type AgentStatus = 'healthy' | 'degraded' | 'failed';
export type Environment = 'production' | 'staging' | 'development';
export type Model = 'gpt-4' | 'gpt-3.5-turbo' | 'claude-3-opus' | 'claude-3-sonnet' | 'gemini-pro';
export type Role = 'admin' | 'developer' | 'viewer';

export interface Agent {
  id: string;
  name: string;
  status: AgentStatus;
  team: string;
  environment: Environment;
  model: Model;
  lastRun: Date;
  executionTime: number;
  successRate: number;
  tools: string[];
  description: string;
}

export interface TeamMember {
  id: string;
  name: string;
  email: string;
  role: Role;
  teams: string[];
  avatar: string;
  joinedDate: Date;
}

export interface MetricDataPoint {
  timestamp: Date;
  value: number;
}

export interface PerformanceMetrics {
  executionTime: MetricDataPoint[];
  throughput: MetricDataPoint[];
  failureRate: MetricDataPoint[];
}

export interface AccuracyMetrics {
  taskSuccessRate: MetricDataPoint[];
  validationPassRate: MetricDataPoint[];
}

export interface LatencyMetrics {
  endToEndLatency: MetricDataPoint[];
  modelResponseTime: MetricDataPoint[];
  toolCallLatency: MetricDataPoint[];
}

export interface TokenUsageMetrics {
  tokensPerAgent: { agent: string; tokens: number }[];
  costEstimation: MetricDataPoint[];
  modelBreakdown: { model: string; tokens: number; percentage: number }[];
}

export interface ProductivityMetrics {
  timeSaved: MetricDataPoint[];
  tasksAutomated: MetricDataPoint[];
  roi: MetricDataPoint[];
}
