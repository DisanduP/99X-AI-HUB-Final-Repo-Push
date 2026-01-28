'use client';

import { useState, useEffect } from 'react';
import { fetchAgents } from '@/app/services/agentService';
import { getFilteredAgents, getUniqueTeams, getUniqueEnvironments, getUniqueModels } from '@/app/data/mockData';
import { StatusBadge } from '@/app/components/StatusBadge';
import { Plus, Search } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { Agent } from '@/app/types';
import { ArrowLeft, Play, Pause, Trash2, Settings, Clock, CheckCircle2, XCircle } from 'lucide-react';
import { format } from 'date-fns';
import * as Tabs from '@radix-ui/react-tabs';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export function Agents() {
  const [searchQuery, setSearchQuery] = useState('');
  const [agents, setAgents] = useState<Agent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);
  const [filters, setFilters] = useState({
    team: 'all',
    environment: 'all',
    model: 'all',
    status: 'all'
  });
  const [selectedAgent, setSelectedAgent] = useState<Agent | null>(null);
  const [activeTab, setActiveTab] = useState('overview');
  const [executionHistory, setExecutionHistory] = useState<any[]>([]);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    const loadAgents = async () => {
      try {
        setLoading(true);
        setError(null);
        // For now, fetch without teamId. Adjust if teamId is available.
        const fetchedAgents = await fetchAgents({ page: 1, pageSize: 100 }); // Fetch more to handle client-side filtering
        setAgents(fetchedAgents);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load agents');
      } finally {
        setLoading(false);
      }
    };

    loadAgents();
  }, []);

  useEffect(() => {
    if (selectedAgent) {
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
    }
  }, [selectedAgent]);

  const filteredAgents = getFilteredAgents(agents, filters).filter(agent =>
    (agent.name?.toLowerCase() || '').includes(searchQuery.toLowerCase()) ||
    (agent.description?.toLowerCase() || '').includes(searchQuery.toLowerCase())
  );

  const teams = getUniqueTeams(agents);
  const environments = getUniqueEnvironments(agents);
  const models = getUniqueModels(agents);

  return (
    <div className="flex-1 overflow-auto">
      <div className="px-8 py-6 max-w-[1600px] mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-semibold text-foreground mb-2">Dashboard</h1>
          <p className="text-sm text-muted-foreground">Manage your AI agent registry</p>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="py-12 text-center">
            <p className="text-muted-foreground">Loading agents...</p>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="py-12 text-center">
            <p className="text-red-500 text-sm">{error}</p>
            <button
              onClick={() => window.location.reload()}
              className="mt-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm"
            >
              Retry
            </button>
          </div>
        )}

        {/* Content */}
        {!loading && !error && (
          <div>
            {/* Controls */}
            <div className="flex flex-col sm:flex-row gap-4 mb-6">
              {/* Search */}
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <input
                  type="text"
                  placeholder="Search agents..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 bg-input-background border border-border rounded-lg text-sm focus:outline-none focus:ring-2"
                  style={{ '--tw-ring-color': 'rgba(13, 144, 178)' } as any}
                />
              </div>

              {/* Filters */}
              <div className="flex gap-2 flex-wrap">
                <select
                  value={filters.team}
                  onChange={(e) => setFilters({ ...filters, team: e.target.value })}
                  className="px-3 py-2 bg-input-background border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                >
                  <option value="all">All Teams</option>
                  {teams.map((team, index) => (
                    <option key={`team-${index}`} value={team}>{team}</option>
                  ))}
                </select>

                <select
                  value={filters.environment}
                  onChange={(e) => setFilters({ ...filters, environment: e.target.value })}
                  className="px-3 py-2 bg-input-background border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                >
                  <option value="all">All Environments</option>
                  {environments.map((env, index) => (
                    <option key={`env-${index}`} value={env}>{env}</option>
                  ))}
                </select>

                <select
                  value={filters.model}
                  onChange={(e) => setFilters({ ...filters, model: e.target.value })}
                  className="px-3 py-2 bg-input-background border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                >
                  <option value="all">All Models</option>
                  {models.map((model, index) => (
                    <option key={`model-${index}`} value={model}>{model}</option>
                  ))}
                </select>

                <select
                  value={filters.status}
                  onChange={(e) => setFilters({ ...filters, status: e.target.value })}
                  className="px-3 py-2 bg-input-background border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                >
                  <option value="all">All Statuses</option>
                  <option value="healthy">Healthy</option>
                  <option value="degraded">Degraded</option>
                  <option value="failed">Failed</option>
                </select>
              </div>
            </div>

            {/* Agents Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredAgents.map((agent) => (
                <div
                  key={agent.id}
                  onClick={() => setSelectedAgent(agent)}
                  className="bg-card border border-border rounded-lg p-6 hover:shadow-lg hover:border-primary/50 transition-all cursor-pointer"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <h3 className="text-base font-semibold text-foreground mb-1">{agent.name}</h3>
                      <p className="text-sm text-muted-foreground line-clamp-2">{agent.description}</p>
                    </div>
                    <StatusBadge status={agent.status} showLabel={false} />
                  </div>

                  <div className="space-y-3 mb-4">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Team</span>
                      <span className="text-foreground font-medium">{agent.team}</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Environment</span>
                      <span className={`
                        inline-flex px-2 py-0.5 rounded text-xs font-medium
                        ${agent.environment === 'production' ? 'bg-blue-50 text-blue-700' : ''}
                        ${agent.environment === 'staging' ? 'bg-purple-50 text-purple-700' : ''}
                        ${agent.environment === 'development' ? 'bg-gray-100 text-gray-700' : ''}
                      `}>
                        {agent.environment}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Model</span>
                      <span className="text-foreground font-mono text-xs">{agent.model}</span>
                    </div>
                  </div>

                  <div className="pt-4 border-t border-border">
                    <div className="flex items-center justify-between text-xs text-muted-foreground mb-2">
                      <span>Success Rate</span>
                      <span className="font-medium text-foreground">{agent.successRate.toFixed(1)}%</span>
                    </div>
                    <div className="bg-muted rounded-full h-2">
                      <div
                        className={`h-full rounded-full ${
                          agent.successRate >= 95 ? 'bg-green-500' :
                          agent.successRate >= 85 ? 'bg-yellow-500' :
                          'bg-red-500'
                        }`}
                        style={{ width: `${agent.successRate}%` }}
                      />
                    </div>
                    <div className="mt-2 text-xs text-muted-foreground">
                      Last run: {mounted ? formatDistanceToNow(agent.lastRun, { addSuffix: true }) : 'Loading...'}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {filteredAgents.length === 0 && (
              <div className="py-12 text-center">
                <p className="text-muted-foreground text-sm">No agents found matching your filters</p>
              </div>
            )}
          </div>
        )}

        {/* Agent Details */}
        {selectedAgent && (
          <div className="mt-8">
            {/* Back button */}
            <button
              onClick={() => setSelectedAgent(null)}
              className="flex items-center gap-2 text-muted-foreground hover:text-foreground mb-4 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              <span className="text-sm">Back to agents</span>
            </button>

            {/* Agent header */}
            <div className="flex items-start justify-between mb-8">
              <div>
                <h1 className="text-2xl font-semibold text-foreground mb-2">{selectedAgent.name}</h1>
                <p className="text-sm text-muted-foreground mb-4">{selectedAgent.description}</p>
                <div className="flex items-center gap-4">
                  <StatusBadge status={selectedAgent.status} />
                  <span className={`
                    inline-flex px-2 py-1 rounded text-xs font-medium
                    ${selectedAgent.environment === 'production' ? 'bg-blue-50 text-blue-700' : ''}
                    ${selectedAgent.environment === 'staging' ? 'bg-purple-50 text-purple-700' : ''}
                    ${selectedAgent.environment === 'development' ? 'bg-gray-100 text-gray-700' : ''}
                  `}>
                    {selectedAgent.environment}
                  </span>
                  <span className="text-sm text-muted-foreground">
                    Last run: {mounted ? formatDistanceToNow(selectedAgent.lastRun, { addSuffix: true }) : 'Loading...'}
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

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
              <div className="bg-card border border-border rounded-lg p-5">
                <div className="text-sm text-muted-foreground mb-1">Success Rate</div>
                <div className="text-2xl font-semibold text-foreground">{selectedAgent.successRate.toFixed(1)}%</div>
              </div>
              <div className="bg-card border border-border rounded-lg p-5">
                <div className="text-sm text-muted-foreground mb-1">Avg Execution Time</div>
                <div className="text-2xl font-semibold text-foreground">{selectedAgent.executionTime.toFixed(1)}s</div>
              </div>
              <div className="bg-card border border-border rounded-lg p-5">
                <div className="text-sm text-muted-foreground mb-1">Total Runs (30d)</div>
                <div className="text-2xl font-semibold text-foreground">2,847</div>
              </div>
              <div className="bg-card border border-border rounded-lg p-5">
                <div className="text-sm text-muted-foreground mb-1">Model</div>
                <div className="text-lg font-semibold text-foreground font-mono">{selectedAgent.model}</div>
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
                      {selectedAgent.tools.map((tool) => (
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
                          value={selectedAgent.name}
                          readOnly
                          className="w-full px-3 py-2 bg-input-background border border-border rounded-lg text-sm"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-muted-foreground mb-2">Team</label>
                        <input
                          type="text"
                          value={selectedAgent.team}
                          readOnly
                          className="w-full px-3 py-2 bg-input-background border border-border rounded-lg text-sm"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-muted-foreground mb-2">Environment</label>
                        <input
                          type="text"
                          value={selectedAgent.environment}
                          readOnly
                          className="w-full px-3 py-2 bg-input-background border border-border rounded-lg text-sm"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-muted-foreground mb-2">Model</label>
                        <input
                          type="text"
                          value={selectedAgent.model}
                          readOnly
                          className="w-full px-3 py-2 bg-input-background border border-border rounded-lg text-sm font-mono"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-muted-foreground mb-2">Description</label>
                      <textarea
                        value={selectedAgent.description}
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
        )}
      </div>
    </div>
  );
}
