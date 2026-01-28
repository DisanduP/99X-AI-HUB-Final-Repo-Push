'use client';

import { useState } from 'react';
import { MetricCard } from '@/app/components/MetricCard';
import {
  mockPerformanceMetrics,
  mockAccuracyMetrics,
  mockLatencyMetrics,
  mockTokenUsageMetrics,
  mockProductivityMetrics
} from '@/app/data/mockData';
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';
import { format } from 'date-fns';
import * as Tabs from '@radix-ui/react-tabs';
import * as TooltipRadix from '@radix-ui/react-tooltip';
import { Info, TrendingUp, TrendingDown } from 'lucide-react';

const COLORS = ['#0891B2', '#8B5CF6', '#10B981', '#F59E0B', '#EF4444'];

export function Metrics() {
  const [timeRange, setTimeRange] = useState<'7d' | '30d' | '90d'>('30d');
  const [activeTab, setActiveTab] = useState('performance');

  // Format data for charts
  const performanceData = mockPerformanceMetrics.executionTime.map((item, index) => ({
    date: format(item.timestamp, 'MMM dd'),
    executionTime: item.value,
    throughput: mockPerformanceMetrics.throughput[index]?.value || 0,
    failureRate: mockPerformanceMetrics.failureRate[index]?.value || 0
  }));

  const accuracyData = mockAccuracyMetrics.taskSuccessRate.map((item, index) => ({
    date: format(item.timestamp, 'MMM dd'),
    successRate: item.value,
    validationRate: mockAccuracyMetrics.validationPassRate[index]?.value || 0
  }));

  const latencyData = mockLatencyMetrics.endToEndLatency.map((item, index) => ({
    date: format(item.timestamp, 'MMM dd'),
    endToEnd: item.value,
    modelResponse: mockLatencyMetrics.modelResponseTime[index]?.value || 0,
    toolCall: mockLatencyMetrics.toolCallLatency[index]?.value || 0
  }));

  const costData = mockTokenUsageMetrics.costEstimation.map(item => ({
    date: format(item.timestamp, 'MMM dd'),
    cost: item.value
  }));

  const productivityData = mockProductivityMetrics.timeSaved.map((item, index) => ({
    date: format(item.timestamp, 'MMM dd'),
    timeSaved: item.value,
    tasksAutomated: mockProductivityMetrics.tasksAutomated[index]?.value || 0,
    roi: mockProductivityMetrics.roi[index]?.value || 0
  }));

  return (
    <div className="flex-1 overflow-auto">
      <div className="px-8 py-6 max-w-[1600px] mx-auto">
        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-foreground mb-2">Metrics</h1>
            <p className="text-sm text-muted-foreground">Detailed analytics and performance insights</p>
          </div>

          {/* Time Range Selector */}
          <div className="flex gap-2">
            <button
              onClick={() => setTimeRange('7d')}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                timeRange === '7d'
                  ? ''
                  : 'bg-muted text-foreground hover:bg-muted/80'
              }`}
              style={timeRange === '7d' ? { backgroundColor: 'rgba(13, 144, 178)', color: 'white' } : {}}
            >
              7 days
            </button>
            <button
              onClick={() => setTimeRange('30d')}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                timeRange === '30d'
                  ? ''
                  : 'bg-muted text-foreground hover:bg-muted/80'
              }`}
              style={timeRange === '30d' ? { backgroundColor: 'rgba(13, 144, 178)', color: 'white' } : {}}
            >
              30 days
            </button>
            <button
              onClick={() => setTimeRange('90d')}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                timeRange === '90d'
                  ? ''
                  : 'bg-muted text-foreground hover:bg-muted/80'
              }`}
              style={timeRange === '90d' ? { backgroundColor: 'rgba(13, 144, 178)', color: 'white' } : {}}
            >
              90 days
            </button>
          </div>
        </div>

        {/* Tabs */}
        <Tabs.Root value={activeTab} onValueChange={setActiveTab} className="w-full">
          <Tabs.List className="flex gap-4 border-b border-border mb-8">
            <Tabs.Trigger
              value="performance"
              className="px-4 py-3 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
              style={activeTab === 'performance' ? { 
                color: 'rgba(13, 144, 178)', 
                borderBottom: '2px solid rgba(13, 144, 178)' 
              } : {}}
            >
              Performance
            </Tabs.Trigger>
            <Tabs.Trigger
              value="accuracy"
              className="px-4 py-3 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
              style={activeTab === 'accuracy' ? { 
                color: 'rgba(13, 144, 178)', 
                borderBottom: '2px solid rgba(13, 144, 178)' 
              } : {}}
            >
              Accuracy
            </Tabs.Trigger>
            <Tabs.Trigger
              value="latency"
              className="px-4 py-3 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
              style={activeTab === 'latency' ? { 
                color: 'rgba(13, 144, 178)', 
                borderBottom: '2px solid rgba(13, 144, 178)' 
              } : {}}
            >
              Latency
            </Tabs.Trigger>
            <Tabs.Trigger
              value="tokens"
              className="px-4 py-3 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
              style={activeTab === 'tokens' ? { 
                color: 'rgba(13, 144, 178)', 
                borderBottom: '2px solid rgba(13, 144, 178)' 
              } : {}}
            >
              Token Usage
            </Tabs.Trigger>
            <Tabs.Trigger
              value="productivity"
              className="px-4 py-3 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
              style={activeTab === 'productivity' ? { 
                color: 'rgba(13, 144, 178)', 
                borderBottom: '2px solid rgba(13, 144, 178)' 
              } : {}}
            >
              Productivity
            </Tabs.Trigger>
          </Tabs.List>

          {/* Performance Tab */}
          <Tabs.Content value="performance">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <MetricCard
                title="Execution Time"
                description="Average execution time per agent run (seconds)"
              >
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={performanceData}>
                    <defs>
                      <linearGradient id="executionGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#0891B2" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="#0891B2" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                    <XAxis dataKey="date" tick={{ fontSize: 12 }} stroke="#6B7280" />
                    <YAxis tick={{ fontSize: 12 }} stroke="#6B7280" />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: '#FFFFFF',
                        border: '1px solid #E5E7EB',
                        borderRadius: '8px',
                        fontSize: '12px'
                      }}
                    />
                    <Area
                      type="monotone"
                      dataKey="executionTime"
                      stroke="#0891B2"
                      strokeWidth={2}
                      fill="url(#executionGradient)"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </MetricCard>

              <MetricCard
                title="Throughput"
                description="Number of successful agent executions per hour"
              >
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={performanceData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                    <XAxis dataKey="date" tick={{ fontSize: 12 }} stroke="#6B7280" />
                    <YAxis tick={{ fontSize: 12 }} stroke="#6B7280" />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: '#FFFFFF',
                        border: '1px solid #E5E7EB',
                        borderRadius: '8px',
                        fontSize: '12px'
                      }}
                    />
                    <Line
                      type="monotone"
                      dataKey="throughput"
                      stroke="#10B981"
                      strokeWidth={2}
                      dot={{ r: 3 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </MetricCard>

              <MetricCard
                title="Failure Rate"
                description="Percentage of failed agent executions"
              >
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={performanceData}>
                    <defs>
                      <linearGradient id="failureGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#EF4444" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="#EF4444" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                    <XAxis dataKey="date" tick={{ fontSize: 12 }} stroke="#6B7280" />
                    <YAxis tick={{ fontSize: 12 }} stroke="#6B7280" />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: '#FFFFFF',
                        border: '1px solid #E5E7EB',
                        borderRadius: '8px',
                        fontSize: '12px'
                      }}
                    />
                    <Area
                      type="monotone"
                      dataKey="failureRate"
                      stroke="#EF4444"
                      strokeWidth={2}
                      fill="url(#failureGradient)"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </MetricCard>

              {/* KPI Summary */}
              <div className="bg-card border border-border rounded-lg p-6">
                <h3 className="text-base font-semibold text-foreground mb-4">Performance Summary</h3>
                <div className="space-y-4">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm text-muted-foreground">Avg Execution Time</span>
                      <span className="text-sm font-semibold text-foreground">3.2s</span>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-green-600">
                      <TrendingDown className="w-3 h-3" />
                      <span>12% faster than last week</span>
                    </div>
                  </div>
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm text-muted-foreground">Hourly Throughput</span>
                      <span className="text-sm font-semibold text-foreground">145</span>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-green-600">
                      <TrendingUp className="w-3 h-3" />
                      <span>8% increase</span>
                    </div>
                  </div>
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm text-muted-foreground">Failure Rate</span>
                      <span className="text-sm font-semibold text-foreground">4.2%</span>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-green-600">
                      <TrendingDown className="w-3 h-3" />
                      <span>2.1% improvement</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </Tabs.Content>

          {/* Accuracy Tab */}
          <Tabs.Content value="accuracy">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <MetricCard
                title="Task Success Rate"
                description="Percentage of tasks completed successfully"
              >
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={accuracyData}>
                    <defs>
                      <linearGradient id="successGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#10B981" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="#10B981" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                    <XAxis dataKey="date" tick={{ fontSize: 12 }} stroke="#6B7280" />
                    <YAxis domain={[0, 100]} tick={{ fontSize: 12 }} stroke="#6B7280" />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: '#FFFFFF',
                        border: '1px solid #E5E7EB',
                        borderRadius: '8px',
                        fontSize: '12px'
                      }}
                    />
                    <Area
                      type="monotone"
                      dataKey="successRate"
                      stroke="#10B981"
                      strokeWidth={2}
                      fill="url(#successGradient)"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </MetricCard>

              <MetricCard
                title="Validation Pass Rate"
                description="Percentage of outputs passing validation rules"
              >
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={accuracyData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                    <XAxis dataKey="date" tick={{ fontSize: 12 }} stroke="#6B7280" />
                    <YAxis domain={[0, 100]} tick={{ fontSize: 12 }} stroke="#6B7280" />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: '#FFFFFF',
                        border: '1px solid #E5E7EB',
                        borderRadius: '8px',
                        fontSize: '12px'
                      }}
                    />
                    <Line
                      type="monotone"
                      dataKey="validationRate"
                      stroke="#8B5CF6"
                      strokeWidth={2}
                      dot={{ r: 3 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </MetricCard>

              <div className="lg:col-span-2">
                <MetricCard
                  title="Accuracy Trends"
                  description="Combined success and validation rates over time"
                >
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={accuracyData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                      <XAxis dataKey="date" tick={{ fontSize: 12 }} stroke="#6B7280" />
                      <YAxis domain={[0, 100]} tick={{ fontSize: 12 }} stroke="#6B7280" />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: '#FFFFFF',
                          border: '1px solid #E5E7EB',
                          borderRadius: '8px',
                          fontSize: '12px'
                        }}
                      />
                      <Legend />
                      <Line
                        type="monotone"
                        dataKey="successRate"
                        stroke="#10B981"
                        strokeWidth={2}
                        name="Success Rate"
                      />
                      <Line
                        type="monotone"
                        dataKey="validationRate"
                        stroke="#8B5CF6"
                        strokeWidth={2}
                        name="Validation Rate"
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </MetricCard>
              </div>
            </div>
          </Tabs.Content>

          {/* Latency Tab */}
          <Tabs.Content value="latency">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="lg:col-span-2">
                <MetricCard
                  title="Latency Breakdown"
                  description="End-to-end, model response, and tool call latencies (ms)"
                >
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={latencyData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                      <XAxis dataKey="date" tick={{ fontSize: 12 }} stroke="#6B7280" />
                      <YAxis tick={{ fontSize: 12 }} stroke="#6B7280" />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: '#FFFFFF',
                          border: '1px solid #E5E7EB',
                          borderRadius: '8px',
                          fontSize: '12px'
                        }}
                      />
                      <Legend />
                      <Line
                        type="monotone"
                        dataKey="endToEnd"
                        stroke="#0891B2"
                        strokeWidth={2}
                        name="End-to-End"
                      />
                      <Line
                        type="monotone"
                        dataKey="modelResponse"
                        stroke="#F59E0B"
                        strokeWidth={2}
                        name="Model Response"
                      />
                      <Line
                        type="monotone"
                        dataKey="toolCall"
                        stroke="#8B5CF6"
                        strokeWidth={2}
                        name="Tool Call"
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </MetricCard>
              </div>

              <MetricCard
                title="Model Response Time"
                description="Time for model to generate response (ms)"
              >
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={latencyData}>
                    <defs>
                      <linearGradient id="modelLatencyGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#F59E0B" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="#F59E0B" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                    <XAxis dataKey="date" tick={{ fontSize: 12 }} stroke="#6B7280" />
                    <YAxis tick={{ fontSize: 12 }} stroke="#6B7280" />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: '#FFFFFF',
                        border: '1px solid #E5E7EB',
                        borderRadius: '8px',
                        fontSize: '12px'
                      }}
                    />
                    <Area
                      type="monotone"
                      dataKey="modelResponse"
                      stroke="#F59E0B"
                      strokeWidth={2}
                      fill="url(#modelLatencyGradient)"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </MetricCard>

              <MetricCard
                title="Tool Call Latency"
                description="Time for external tool calls (ms)"
              >
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={latencyData}>
                    <defs>
                      <linearGradient id="toolLatencyGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#8B5CF6" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="#8B5CF6" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                    <XAxis dataKey="date" tick={{ fontSize: 12 }} stroke="#6B7280" />
                    <YAxis tick={{ fontSize: 12 }} stroke="#6B7280" />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: '#FFFFFF',
                        border: '1px solid #E5E7EB',
                        borderRadius: '8px',
                        fontSize: '12px'
                      }}
                    />
                    <Area
                      type="monotone"
                      dataKey="toolCall"
                      stroke="#8B5CF6"
                      strokeWidth={2}
                      fill="url(#toolLatencyGradient)"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </MetricCard>
            </div>
          </Tabs.Content>

          {/* Token Usage Tab */}
          <Tabs.Content value="tokens">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <MetricCard
                title="Tokens per Agent"
                description="Total token consumption by agent"
              >
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={mockTokenUsageMetrics.tokensPerAgent}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                    <XAxis
                      dataKey="agent"
                      tick={{ fontSize: 10 }}
                      angle={-45}
                      textAnchor="end"
                      height={80}
                      stroke="#6B7280"
                    />
                    <YAxis tick={{ fontSize: 12 }} stroke="#6B7280" />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: '#FFFFFF',
                        border: '1px solid #E5E7EB',
                        borderRadius: '8px',
                        fontSize: '12px'
                      }}
                    />
                    <Bar dataKey="tokens" fill="#0891B2" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </MetricCard>

              <MetricCard
                title="Model Breakdown"
                description="Token usage by model type"
              >
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={mockTokenUsageMetrics.modelBreakdown}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={(entry) => `${entry.model}: ${entry.percentage}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="tokens"
                    >
                      {mockTokenUsageMetrics.modelBreakdown.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{
                        backgroundColor: '#FFFFFF',
                        border: '1px solid #E5E7EB',
                        borderRadius: '8px',
                        fontSize: '12px'
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </MetricCard>

              <div className="lg:col-span-2">
                <MetricCard
                  title="Cost Estimation"
                  description="Estimated token costs over time (USD)"
                >
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={costData}>
                      <defs>
                        <linearGradient id="costGradient" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#EF4444" stopOpacity={0.3} />
                          <stop offset="95%" stopColor="#EF4444" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                      <XAxis dataKey="date" tick={{ fontSize: 12 }} stroke="#6B7280" />
                      <YAxis tick={{ fontSize: 12 }} stroke="#6B7280" />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: '#FFFFFF',
                          border: '1px solid #E5E7EB',
                          borderRadius: '8px',
                          fontSize: '12px'
                        }}
                        formatter={(value) => `$${typeof value === 'number' ? value.toFixed(2) : value}`}
                      />
                      <Area
                        type="monotone"
                        dataKey="cost"
                        stroke="#EF4444"
                        strokeWidth={2}
                        fill="url(#costGradient)"
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </MetricCard>
              </div>
            </div>
          </Tabs.Content>

          {/* Productivity Tab */}
          <Tabs.Content value="productivity">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <MetricCard
                title="Time Saved"
                description="Hours saved through automation"
              >
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={productivityData}>
                    <defs>
                      <linearGradient id="timeSavedGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#10B981" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="#10B981" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                    <XAxis dataKey="date" tick={{ fontSize: 12 }} stroke="#6B7280" />
                    <YAxis tick={{ fontSize: 12 }} stroke="#6B7280" />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: '#FFFFFF',
                        border: '1px solid #E5E7EB',
                        borderRadius: '8px',
                        fontSize: '12px'
                      }}
                    />
                    <Area
                      type="monotone"
                      dataKey="timeSaved"
                      stroke="#10B981"
                      strokeWidth={2}
                      fill="url(#timeSavedGradient)"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </MetricCard>

              <MetricCard
                title="Tasks Automated"
                description="Number of tasks automated daily"
              >
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={productivityData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                    <XAxis dataKey="date" tick={{ fontSize: 12 }} stroke="#6B7280" />
                    <YAxis tick={{ fontSize: 12 }} stroke="#6B7280" />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: '#FFFFFF',
                        border: '1px solid #E5E7EB',
                        borderRadius: '8px',
                        fontSize: '12px'
                      }}
                    />
                    <Bar dataKey="tasksAutomated" fill="#0891B2" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </MetricCard>

              <div className="lg:col-span-2">
                <MetricCard
                  title="Return on Investment (ROI)"
                  description="ROI multiplier over time"
                >
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={productivityData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                      <XAxis dataKey="date" tick={{ fontSize: 12 }} stroke="#6B7280" />
                      <YAxis tick={{ fontSize: 12 }} stroke="#6B7280" />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: '#FFFFFF',
                          border: '1px solid #E5E7EB',
                          borderRadius: '8px',
                          fontSize: '12px'
                        }}
                        formatter={(value) => `${value}x`}
                      />
                      <Line
                        type="monotone"
                        dataKey="roi"
                        stroke="#10B981"
                        strokeWidth={3}
                        dot={{ r: 4 }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </MetricCard>
              </div>
            </div>
          </Tabs.Content>
        </Tabs.Root>
      </div>
    </div>
  );
}
