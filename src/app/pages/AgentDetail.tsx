'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { mockAgents } from '@/app/data/mockData';
import { StatusBadge } from '@/app/components/StatusBadge';
import { ArrowLeft, Play, Pause, Trash2, Settings, Clock, CheckCircle2, XCircle } from 'lucide-react';
import { formatDistanceToNow, format } from 'date-fns';
import * as Tabs from '@radix-ui/react-tabs';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export function AgentDetail() {
  const params = useParams();
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');
  const [executionHistory, setExecutionHistory] = useState<any[]>([]);
  const id = params.id as string;
  const agent = mockAgents.find(a => a.id === id);

  useEffect(() => {
    setMounted(true);
    // Generate mock execution history only on client side to avoid hydration mismatch
    // Use deterministic values instead of Math.random() to prevent hydration issues
    const baseTime = Date.now();
    const history = Array.from({ length: 20 }, (_, i) => {
      const timeOffset = i * 3600000; // 1 hour intervals
      const seed = (i * 7) % 100; // Deterministic seed based on index
      return {
        time: format(new Date(baseTime - timeOffset), 'HH:mm'),
        duration: (seed % 5) + 1, // Deterministic duration 1-5
        success: seed > 10, // Deterministic success based on seed
        tokens: 1000 + (seed * 50) // Deterministic tokens
      };
    }).reverse();
    setExecutionHistory(history);
  }, []);

  if (!agent) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-foreground mb-2">Agent not found</h2>
          <button
            onClick={() => router.push('/agents')}
            className="text-primary hover:underline text-sm"
          >
            Back to agents
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-auto">
      <div className="px-8 py-6 max-w-[1600px] mx-auto">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => router.push('/agents')}
            className="flex items-center gap-2 text-muted-foreground hover:text-foreground mb-4 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="text-sm">Back to agents</span>
          </button>

          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-2xl font-semibold text-foreground mb-2">{agent.name}</h1>
              <p className="text-sm text-muted-foreground mb-4">{agent.description}</p>
              <div className="flex items-center gap-4">
                <StatusBadge status={agent.status} />
                <span className={`
                  inline-flex px-2 py-1 rounded text-xs font-medium
                  ${agent.environment === 'production' ? 'bg-blue-50 text-blue-700' : ''}
                  ${agent.environment === 'staging' ? 'bg-purple-50 text-purple-700' : ''}
                  ${agent.environment === 'development' ? 'bg-gray-100 text-gray-700' : ''}
                `}>
                  {agent.environment}
                </span>
                <span className="text-sm text-muted-foreground">
                  Last run: {mounted ? formatDistanceToNow(agent.lastRun, { addSuffix: true }) : 'Loading...'}
                </span>
              </div>
            </div>

            <div className="flex gap-2">
              <button className="px-4 py-2 bg-green-600 text-white rounded-lg text-sm font-medium hover:bg-green-700 transition-colors flex items-center gap-2">
                <Play className="w-4 h-4" />
                Run Now
              </button>
              <button className="px-4 py-2 bg-muted text-foreground rounded-lg text-sm font-medium hover:bg-muted/80 transition-colors flex items-center gap-2">
                <Pause className="w-4 h-4" />
                Disable
              </button>
              <button className="px-4 py-2 bg-muted text-foreground rounded-lg text-sm font-medium hover:bg-muted/80 transition-colors">
                <Settings className="w-4 h-4" />
              </button>
              <button className="px-4 py-2 bg-destructive text-destructive-foreground rounded-lg text-sm font-medium hover:opacity-90 transition-opacity">
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-card border border-border rounded-lg p-5">
            <div className="text-sm text-muted-foreground mb-1">Success Rate</div>
            <div className="text-2xl font-semibold text-foreground">{agent.successRate.toFixed(1)}%</div>
          </div>
          <div className="bg-card border border-border rounded-lg p-5">
            <div className="text-sm text-muted-foreground mb-1">Avg Execution Time</div>
            <div className="text-2xl font-semibold text-foreground">{agent.executionTime.toFixed(1)}s</div>
          </div>
          <div className="bg-card border border-border rounded-lg p-5">
            <div className="text-sm text-muted-foreground mb-1">Total Runs (30d)</div>
            <div className="text-2xl font-semibold text-foreground">2,847</div>
          </div>
          <div className="bg-card border border-border rounded-lg p-5">
            <div className="text-sm text-muted-foreground mb-1">Model</div>
            <div className="text-lg font-semibold text-foreground font-mono">{agent.model}</div>
          </div>
        </div>

        {/* Tabs */}
        <Tabs.Root value={activeTab} onValueChange={setActiveTab} className="w-full">
          <Tabs.List className="flex gap-4 border-b border-border mb-6">
            <Tabs.Trigger
              value="overview"
              className="px-4 py-3 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
              style={activeTab === 'overview' ? { 
                color: 'rgba(15, 143, 178)', 
                borderBottom: '2px solid rgba(15, 143, 178)' 
              } : {}}
            >
              Overview
            </Tabs.Trigger>
            <Tabs.Trigger
              value="configuration"
              className="px-4 py-3 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
              style={activeTab === 'configuration' ? { 
                color: 'rgba(15, 143, 178)', 
                borderBottom: '2px solid rgba(15, 143, 178)' 
              } : {}}
            >
              Configuration
            </Tabs.Trigger>
            <Tabs.Trigger
              value="history"
              className="px-4 py-3 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
              style={activeTab === 'history' ? { 
                color: 'rgba(15, 143, 178)', 
                borderBottom: '2px solid rgba(15, 143, 178)' 
              } : {}}
            >
              Execution History
            </Tabs.Trigger>
          </Tabs.List>

          {/* Overview Tab */}
          <Tabs.Content value="overview">
            <div className="space-y-6">
              {/* Performance Chart */}
              <div className="bg-card border border-border rounded-lg p-6">
                <h3 className="text-base font-semibold text-foreground mb-4">Execution Duration (Last 24h)</h3>
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={executionHistory}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                      <XAxis dataKey="time" tick={{ fontSize: 12 }} stroke="#6B7280" />
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
                        dataKey="duration"
                        stroke="#0891B2"
                        strokeWidth={2}
                        dot={{ r: 3 }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Tools */}
              <div className="bg-card border border-border rounded-lg p-6">
                <h3 className="text-base font-semibold text-foreground mb-4">Connected Tools</h3>
                <div className="flex flex-wrap gap-2">
                  {agent.tools.map((tool) => (
                    <span
                      key={tool}
                      className="px-3 py-1.5 text-sm font-medium"
                      style={{ backgroundColor: 'rgba(201, 232, 246)', color: '#000' }}
                    >
                      {tool}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </Tabs.Content>

          {/* Configuration Tab */}
          <Tabs.Content value="configuration">
            <div className="bg-card border border-border rounded-lg p-6">
              <h3 className="text-base font-semibold text-foreground mb-6">Agent Configuration</h3>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-muted-foreground mb-2">Agent Name</label>
                    <input
                      type="text"
                      value={agent.name}
                      readOnly
                      className="w-full px-3 py-2 bg-input-background border border-border rounded-lg text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-muted-foreground mb-2">Team</label>
                    <input
                      type="text"
                      value={agent.team}
                      readOnly
                      className="w-full px-3 py-2 bg-input-background border border-border rounded-lg text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-muted-foreground mb-2">Environment</label>
                    <input
                      type="text"
                      value={agent.environment}
                      readOnly
                      className="w-full px-3 py-2 bg-input-background border border-border rounded-lg text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-muted-foreground mb-2">Model</label>
                    <input
                      type="text"
                      value={agent.model}
                      readOnly
                      className="w-full px-3 py-2 bg-input-background border border-border rounded-lg text-sm font-mono"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-muted-foreground mb-2">Description</label>
                  <textarea
                    value={agent.description}
                    readOnly
                    rows={3}
                    className="w-full px-3 py-2 bg-input-background border border-border rounded-lg text-sm resize-none"
                  />
                </div>
              </div>
            </div>
          </Tabs.Content>

          {/* History Tab */}
          <Tabs.Content value="history">
            <div className="bg-card border border-border rounded-lg overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-border bg-muted/30">
                      <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                        Time
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                        Duration
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                        Tokens
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {executionHistory.map((exec, index) => (
                      <tr key={index} className="hover:bg-muted/20 transition-colors">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            <Clock className="w-4 h-4 text-muted-foreground" />
                            <span className="text-sm text-foreground">{exec.time}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          {exec.success ? (
                            <div className="flex items-center gap-2">
                              <CheckCircle2 className="w-4 h-4 text-green-600" />
                              <span className="text-sm text-green-600">Success</span>
                            </div>
                          ) : (
                            <div className="flex items-center gap-2">
                              <XCircle className="w-4 h-4 text-red-600" />
                              <span className="text-sm text-red-600">Failed</span>
                            </div>
                          )}
                        </td>
                        <td className="px-6 py-4">
                          <span className="text-sm text-foreground">{exec.duration.toFixed(2)}s</span>
                        </td>
                        <td className="px-6 py-4">
                          <span className="text-sm text-muted-foreground">{exec.tokens}</span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </Tabs.Content>
        </Tabs.Root>
      </div>
    </div>
  );
}
