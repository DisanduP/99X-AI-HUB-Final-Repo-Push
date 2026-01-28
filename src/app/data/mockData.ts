import { Agent, TeamMember, PerformanceMetrics, AccuracyMetrics, LatencyMetrics, TokenUsageMetrics, ProductivityMetrics, MetricDataPoint } from '@/app/types';

// Helper function to generate time series data
function generateTimeSeries(days: number, baseValue: number, variance: number): MetricDataPoint[] {
  const data: MetricDataPoint[] = [];
  const now = new Date();
  
  for (let i = days; i >= 0; i--) {
    const timestamp = new Date(now);
    timestamp.setDate(timestamp.getDate() - i);
    timestamp.setHours(0, 0, 0, 0);
    
    const randomVariance = (Math.random() - 0.5) * variance;
    const value = Math.max(0, baseValue + randomVariance);
    
    data.push({ timestamp, value });
  }
  
  return data;
}

// Mock Agents
export const mockAgents: Agent[] = [
  {
    id: '1',
    name: 'Customer Support Agent',
    status: 'healthy',
    team: 'Customer Success',
    environment: 'production',
    model: 'gpt-4',
    lastRun: new Date(Date.now() - 1000 * 60 * 15), // 15 min ago
    executionTime: 2.3,
    successRate: 98.5,
    tools: ['email', 'zendesk', 'slack'],
    description: 'Handles tier-1 customer support inquiries and ticket routing'
  },
  {
    id: '2',
    name: 'Code Review Assistant',
    status: 'healthy',
    team: 'Engineering',
    environment: 'production',
    model: 'claude-3-opus',
    lastRun: new Date(Date.now() - 1000 * 60 * 5), // 5 min ago
    executionTime: 4.1,
    successRate: 95.2,
    tools: ['github', 'jira', 'sonarqube'],
    description: 'Automated code review and security vulnerability detection'
  },
  {
    id: '3',
    name: 'Data Pipeline Monitor',
    status: 'degraded',
    team: 'Data',
    environment: 'production',
    model: 'gpt-3.5-turbo',
    lastRun: new Date(Date.now() - 1000 * 60 * 45), // 45 min ago
    executionTime: 5.8,
    successRate: 87.3,
    tools: ['snowflake', 'datadog', 'pagerduty'],
    description: 'Monitors data pipeline health and sends alerts'
  },
  {
    id: '4',
    name: 'Sales Lead Qualifier',
    status: 'healthy',
    team: 'Sales',
    environment: 'production',
    model: 'gpt-4',
    lastRun: new Date(Date.now() - 1000 * 60 * 8), // 8 min ago
    executionTime: 1.9,
    successRate: 96.7,
    tools: ['salesforce', 'clearbit', 'slack'],
    description: 'Qualifies inbound leads and enriches contact data'
  },
  {
    id: '5',
    name: 'Content Moderator',
    status: 'healthy',
    team: 'Trust & Safety',
    environment: 'production',
    model: 'claude-3-sonnet',
    lastRun: new Date(Date.now() - 1000 * 60 * 2), // 2 min ago
    executionTime: 0.8,
    successRate: 99.1,
    tools: ['moderation-api', 'slack'],
    description: 'Moderates user-generated content for policy violations'
  },
  {
    id: '6',
    name: 'Invoice Processor',
    status: 'failed',
    team: 'Finance',
    environment: 'production',
    model: 'gpt-3.5-turbo',
    lastRun: new Date(Date.now() - 1000 * 60 * 120), // 2 hours ago
    executionTime: 3.2,
    successRate: 72.4,
    tools: ['quickbooks', 'stripe', 'email'],
    description: 'Processes and categorizes invoices automatically'
  },
  {
    id: '7',
    name: 'Marketing Analyzer',
    status: 'healthy',
    team: 'Marketing',
    environment: 'staging',
    model: 'gemini-pro',
    lastRun: new Date(Date.now() - 1000 * 60 * 30), // 30 min ago
    executionTime: 2.7,
    successRate: 94.8,
    tools: ['google-analytics', 'mixpanel', 'hubspot'],
    description: 'Analyzes marketing campaign performance'
  },
  {
    id: '8',
    name: 'Incident Responder',
    status: 'healthy',
    team: 'Engineering',
    environment: 'production',
    model: 'claude-3-opus',
    lastRun: new Date(Date.now() - 1000 * 60 * 60), // 1 hour ago
    executionTime: 6.4,
    successRate: 91.2,
    tools: ['pagerduty', 'datadog', 'slack', 'jira'],
    description: 'First responder for production incidents'
  }
];

// Mock Team Members
export const mockTeamMembers: TeamMember[] = [
  {
    id: '1',
    name: 'Sarah Chen',
    email: 'sarah.chen@99xagent.com',
    role: 'admin',
    teams: ['Engineering', 'Data'],
    avatar: 'SC',
    joinedDate: new Date('2023-01-15')
  },
  {
    id: '2',
    name: 'Marcus Johnson',
    email: 'marcus.j@99xagent.com',
    role: 'developer',
    teams: ['Engineering'],
    avatar: 'MJ',
    joinedDate: new Date('2023-03-22')
  },
  {
    id: '3',
    name: 'Yuki Tanaka',
    email: 'yuki.t@99xagent.com',
    role: 'developer',
    teams: ['Customer Success', 'Sales'],
    avatar: 'YT',
    joinedDate: new Date('2023-06-10')
  },
  {
    id: '4',
    name: 'Alex Rivera',
    email: 'alex.rivera@99xagent.com',
    role: 'admin',
    teams: ['Engineering', 'Trust & Safety', 'Data'],
    avatar: 'AR',
    joinedDate: new Date('2022-11-05')
  },
  {
    id: '5',
    name: 'Emma Wilson',
    email: 'emma.w@99xagent.com',
    role: 'viewer',
    teams: ['Marketing'],
    avatar: 'EW',
    joinedDate: new Date('2024-01-08')
  },
  {
    id: '6',
    name: 'David Park',
    email: 'david.park@99xagent.com',
    role: 'developer',
    teams: ['Finance'],
    avatar: 'DP',
    joinedDate: new Date('2023-09-14')
  }
];

// Mock Performance Metrics
export const mockPerformanceMetrics: PerformanceMetrics = {
  executionTime: generateTimeSeries(30, 3.2, 2),
  throughput: generateTimeSeries(30, 145, 40),
  failureRate: generateTimeSeries(30, 4.2, 3)
};

// Mock Accuracy Metrics
export const mockAccuracyMetrics: AccuracyMetrics = {
  taskSuccessRate: generateTimeSeries(30, 94, 5),
  validationPassRate: generateTimeSeries(30, 96, 3)
};

// Mock Latency Metrics
export const mockLatencyMetrics: LatencyMetrics = {
  endToEndLatency: generateTimeSeries(30, 850, 300),
  modelResponseTime: generateTimeSeries(30, 420, 150),
  toolCallLatency: generateTimeSeries(30, 230, 100)
};

// Mock Token Usage Metrics
export const mockTokenUsageMetrics: TokenUsageMetrics = {
  tokensPerAgent: [
    { agent: 'Customer Support Agent', tokens: 2450000 },
    { agent: 'Code Review Assistant', tokens: 1890000 },
    { agent: 'Sales Lead Qualifier', tokens: 1240000 },
    { agent: 'Content Moderator', tokens: 980000 },
    { agent: 'Incident Responder', tokens: 870000 },
    { agent: 'Data Pipeline Monitor', tokens: 750000 },
    { agent: 'Marketing Analyzer', tokens: 620000 },
    { agent: 'Invoice Processor', tokens: 450000 }
  ],
  costEstimation: generateTimeSeries(30, 1840, 400),
  modelBreakdown: [
    { model: 'GPT-4', tokens: 4120000, percentage: 42 },
    { model: 'Claude-3-Opus', tokens: 2760000, percentage: 28 },
    { model: 'GPT-3.5-Turbo', tokens: 1850000, percentage: 19 },
    { model: 'Claude-3-Sonnet', tokens: 980000, percentage: 10 },
    { model: 'Gemini-Pro', tokens: 620000, percentage: 6 }
  ]
};

// Mock Productivity Metrics
export const mockProductivityMetrics: ProductivityMetrics = {
  timeSaved: generateTimeSeries(30, 420, 80),
  tasksAutomated: generateTimeSeries(30, 1850, 300),
  roi: generateTimeSeries(30, 3.8, 0.6)
};

// Helper function to get filtered agents
export function getFilteredAgents(
  agents: Agent[],
  filters: {
    team?: string;
    environment?: string;
    model?: string;
    status?: string;
  }
): Agent[] {
  return agents.filter(agent => {
    if (filters.team && filters.team !== 'all' && agent.team !== filters.team) return false;
    if (filters.environment && filters.environment !== 'all' && agent.environment !== filters.environment) return false;
    if (filters.model && filters.model !== 'all' && agent.model !== filters.model) return false;
    if (filters.status && filters.status !== 'all' && agent.status !== filters.status) return false;
    return true;
  });
}

// Get unique values for filters
export function getUniqueTeams(agents: Agent[]): string[] {
  return Array.from(new Set(agents.map(a => a.team))).sort();
}

export function getUniqueEnvironments(agents: Agent[]): string[] {
  return Array.from(new Set(agents.map(a => a.environment))).sort();
}

export function getUniqueModels(agents: Agent[]): string[] {
  return Array.from(new Set(agents.map(a => a.model))).sort();
}
