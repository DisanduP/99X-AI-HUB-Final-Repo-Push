'use client';

import { useState, useEffect } from 'react';
import { StatusBadge } from '@/app/components/StatusBadge';
import { fetchAllAgents, createAgent, updateAgent, activateAgent, deactivateAgent, assignTeamToAgent, CreateAgentRequest, AssignTeamRequest } from '@/app/services/agentService';
import { getFilteredAgents, getUniqueTeams, getUniqueEnvironments, getUniqueModels } from '@/app/data/mockData';
import { Agent } from '@/app/types';
import { Plus, MoreVertical, Search, Filter, ArrowUpDown, ArrowUp, ArrowDown, Edit, Trash2, Play, Pause } from 'lucide-react';
import * as Tooltip from '@radix-ui/react-tooltip';
import * as DropdownMenu from '@radix-ui/react-dropdown-menu';
import { formatDistanceToNow } from 'date-fns';

export function Dashboard() {
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
  const [sortField, setSortField] = useState<keyof Agent>('name');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [creating, setCreating] = useState(false);
  const [createForm, setCreateForm] = useState<CreateAgentRequest>({
    name: '',
    description: '',
    category: '',
    model: '',
    keyFeatures: ''
  });
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingAgent, setEditingAgent] = useState<Agent | null>(null);
  const [updating, setUpdating] = useState(false);
  const [editForm, setEditForm] = useState<CreateAgentRequest>({
    name: '',
    description: '',
    category: '',
    model: '',
    keyFeatures: ''
  });
  const [showAssignTeamModal, setShowAssignTeamModal] = useState(false);
  const [assigningAgent, setAssigningAgent] = useState<Agent | null>(null);
  const [assigningTeam, setAssigningTeam] = useState(false);
  const [assignTeamForm, setAssignTeamForm] = useState<AssignTeamRequest>({
    teamId: '',
    teamName: ''
  });

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    const loadAgents = async () => {
      try {
        setLoading(true);
        setError(null);
        const fetchedAgents = await fetchAllAgents();
        setAgents(fetchedAgents);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load agents');
      } finally {
        setLoading(false);
      }
    };

    loadAgents();
  }, []);

  const filteredAgents = getFilteredAgents(agents, filters).filter(agent =>
    (agent.name?.toLowerCase() || '').includes(searchQuery.toLowerCase()) ||
    (agent.description?.toLowerCase() || '').includes(searchQuery.toLowerCase())
  ).sort((a, b) => {
    const aValue = a[sortField];
    const bValue = b[sortField];
    
    if (aValue < bValue) return sortDirection === 'asc' ? -1 : 1;
    if (aValue > bValue) return sortDirection === 'asc' ? 1 : -1;
    return 0;
  });

  const handleSort = (field: keyof Agent) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const getSortIcon = (field: keyof Agent) => {
    if (sortField !== field) return <ArrowUpDown className="w-4 h-4" />;
    return sortDirection === 'asc' ? <ArrowUp className="w-4 h-4" /> : <ArrowDown className="w-4 h-4" />;
  };

  const handleCreateAgent = async () => {
    if (!createForm.name.trim() || !createForm.description.trim()) {
      alert('Please fill in all required fields');
      return;
    }

    try {
      setCreating(true);
      const newAgent = await createAgent(createForm);
      setAgents(prev => [...prev, newAgent]);
      setShowCreateModal(false);
      setCreateForm({
        name: '',
        description: '',
        category: '',
        model: '',
        keyFeatures: ''
      });
    } catch (err) {
      alert('Failed to create agent: ' + (err instanceof Error ? err.message : 'Unknown error'));
    } finally {
      setCreating(false);
    }
  };

  const handleEditAgent = (agent: Agent) => {
    setEditingAgent(agent);
    setEditForm({
      name: agent.name,
      description: agent.description,
      category: agent.team,
      model: agent.model.replace('-', '_').toUpperCase(),
      keyFeatures: agent.tools.join('; ')
    });
    setShowEditModal(true);
  };

  const handleAssignTeam = (agent: Agent) => {
    setAssigningAgent(agent);
    setAssignTeamForm({
      teamId: '',
      teamName: ''
    });
    setShowAssignTeamModal(true);
  };

  const handleUpdateAgent = async () => {
    if (!editingAgent || !editForm.name.trim() || !editForm.description.trim()) {
      alert('Please fill in all required fields');
      return;
    }

    try {
      setUpdating(true);
      const updatedAgent = await updateAgent(editingAgent.id, editForm);
      setAgents(prev => prev.map(agent => agent.id === editingAgent.id ? updatedAgent : agent));
      setShowEditModal(false);
      setEditingAgent(null);
    } catch (err) {
      alert('Failed to update agent: ' + (err instanceof Error ? err.message : 'Unknown error'));
    } finally {
      setUpdating(false);
    }
  };

  const handleDeleteAgent = async (agentId: string) => {
    if (!confirm('Are you sure you want to delete this agent?')) {
      return;
    }

    try {
      // For now, just remove from local state since we don't have a delete API
      setAgents(prev => prev.filter(agent => agent.id !== agentId));
    } catch (err) {
      alert('Failed to delete agent: ' + (err instanceof Error ? err.message : 'Unknown error'));
    }
  };

  const handleActivateAgent = async (agentId: string) => {
    try {
      const updatedAgent = await activateAgent(agentId);
      setAgents(prev => prev.map(agent => agent.id === agentId ? updatedAgent : agent));
    } catch (err) {
      alert('Failed to activate agent: ' + (err instanceof Error ? err.message : 'Unknown error'));
    }
  };

  const handleDeactivateAgent = async (agentId: string) => {
    try {
      const updatedAgent = await deactivateAgent(agentId);
      setAgents(prev => prev.map(agent => agent.id === agentId ? updatedAgent : agent));
    } catch (err) {
      alert('Failed to deactivate agent: ' + (err instanceof Error ? err.message : 'Unknown error'));
    }
  };

  const handleAssignTeamSubmit = async () => {
    if (!assigningAgent || !assignTeamForm.teamId.trim()) {
      alert('Please select a team');
      return;
    }

    setAssigningTeam(true);
    try {
      const updatedAgent = await assignTeamToAgent(assigningAgent.id, assignTeamForm);
      setAgents(prev => prev.map(agent => agent.id === assigningAgent.id ? updatedAgent : agent));
      setShowAssignTeamModal(false);
      setAssigningAgent(null);
    } catch (err) {
      alert('Failed to assign team: ' + (err instanceof Error ? err.message : 'Unknown error'));
    } finally {
      setAssigningTeam(false);
    }
  };

  const teams = getUniqueTeams(agents);
  const environments = getUniqueEnvironments(agents);
  const models = getUniqueModels(agents);

  // Stats
  const healthyCount = agents.filter(a => a.status === 'healthy').length;
  const degradedCount = agents.filter(a => a.status === 'degraded').length;
  const failedCount = agents.filter(a => a.status === 'failed').length;
  const avgSuccessRate = agents.length > 0 ? agents.reduce((acc, a) => acc + a.successRate, 0) / agents.length : 0;

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-foreground mb-2">Dashboard</h1>
          <p className="text-muted-foreground">Monitor your AI agents performance and status</p>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            <span className="ml-2 text-muted-foreground">Loading agents...</span>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-4 mb-6">
            <p className="text-destructive text-sm">{error}</p>
          </div>
        )}

        {/* Content */}
        {!loading && !error && (
          <div>
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <div className="bg-card border border-border rounded-lg p-6">
                <div>
                  <p className="text-sm text-muted-foreground">Total Agents</p>
                  <p className="text-2xl font-bold text-foreground">{agents.length}</p>
                </div>
              </div>

              <div className="bg-card border border-border rounded-lg p-6">
                <div>
                  <p className="text-sm text-muted-foreground">Healthy</p>
                  <p className="text-2xl font-bold text-green-600">{healthyCount}</p>
                </div>
              </div>

              <div className="bg-card border border-border rounded-lg p-6">
                <div>
                  <p className="text-sm text-muted-foreground">Degraded</p>
                  <p className="text-2xl font-bold text-yellow-600">{degradedCount}</p>
                </div>
              </div>

              <div className="bg-card border border-border rounded-lg p-6">
                <div>
                  <p className="text-sm text-muted-foreground">Avg Success Rate</p>
                  <p className="text-2xl font-bold text-foreground">{avgSuccessRate.toFixed(1)}%</p>
                </div>
              </div>
            </div>

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

              <button 
                onClick={() => setShowCreateModal(true)}
                className="px-4 py-2 rounded-lg text-sm font-medium transition-opacity flex items-center gap-2 hover:opacity-90"
                style={{ backgroundColor: 'rgba(13, 144, 178)', color: 'white' }}
              >
                <Plus className="w-4 h-4" />
                Add Agents
              </button>
            </div>

            {/* Agents Table */}
            <div className="bg-card border border-border rounded-lg overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-muted/50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                        <button
                          onClick={() => handleSort('name')}
                          className="flex items-center gap-1 hover:text-foreground"
                        >
                          Name
                          {getSortIcon('name')}
                        </button>
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                        <button
                          onClick={() => handleSort('status')}
                          className="flex items-center gap-1 hover:text-foreground"
                        >
                          Status
                          {getSortIcon('status')}
                        </button>
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                        <button
                          onClick={() => handleSort('team')}
                          className="flex items-center gap-1 hover:text-foreground"
                        >
                          Team
                          {getSortIcon('team')}
                        </button>
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                        <button
                          onClick={() => handleSort('environment')}
                          className="flex items-center gap-1 hover:text-foreground"
                        >
                          Environment
                          {getSortIcon('environment')}
                        </button>
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                        <button
                          onClick={() => handleSort('model')}
                          className="flex items-center gap-1 hover:text-foreground"
                        >
                          Model
                          {getSortIcon('model')}
                        </button>
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                        <button
                          onClick={() => handleSort('successRate')}
                          className="flex items-center gap-1 hover:text-foreground"
                        >
                          Success Rate
                          {getSortIcon('successRate')}
                        </button>
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                        <button
                          onClick={() => handleSort('lastRun')}
                          className="flex items-center gap-1 hover:text-foreground"
                        >
                          Last Run
                          {getSortIcon('lastRun')}
                        </button>
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {filteredAgents.map((agent) => (
                      <tr key={agent.id} className="hover:bg-muted/30">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div>
                            <div className="text-sm font-medium text-foreground">{agent.name}</div>
                            <div className="text-sm text-muted-foreground line-clamp-1">{agent.description}</div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <StatusBadge status={agent.status} showLabel={true} />
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-foreground">
                          {agent.team}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`
                            inline-flex px-2 py-1 rounded-full text-xs font-medium
                            ${agent.environment === 'production' ? 'bg-blue-100 text-blue-800' : ''}
                            ${agent.environment === 'staging' ? 'bg-purple-100 text-purple-800' : ''}
                            ${agent.environment === 'development' ? 'bg-gray-100 text-gray-800' : ''}
                          `}>
                            {agent.environment}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-mono text-muted-foreground">
                          {agent.model}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-medium">{agent.successRate.toFixed(1)}%</span>
                            <div className="w-16 bg-muted rounded-full h-2">
                              <div
                                className={`h-full rounded-full ${
                                  agent.successRate >= 95 ? 'bg-green-500' :
                                  agent.successRate >= 85 ? 'bg-yellow-500' :
                                  'bg-red-500'
                                }`}
                                style={{ width: `${agent.successRate}%` }}
                              />
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-muted-foreground">
                          {mounted ? formatDistanceToNow(agent.lastRun, { addSuffix: true }) : 'Loading...'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <DropdownMenu.Root>
                            <DropdownMenu.Trigger asChild>
                              <button className="text-muted-foreground hover:text-foreground">
                                <MoreVertical className="w-4 h-4" />
                              </button>
                            </DropdownMenu.Trigger>
                            <DropdownMenu.Portal>
                              <DropdownMenu.Content className="min-w-[160px] bg-popover border border-border rounded-md p-1 shadow-lg" align="end">
                                <DropdownMenu.Item
                                  key="edit"
                                  className="flex items-center px-2 py-2 text-sm text-popover-foreground cursor-pointer hover:bg-accent rounded"
                                  onClick={() => handleEditAgent(agent)}
                                >
                                  <Edit className="w-4 h-4 mr-2" />
                                  Edit Agent
                                </DropdownMenu.Item>
                                <DropdownMenu.Item
                                  key="assign-team"
                                  className="flex items-center px-2 py-2 text-sm text-blue-600 cursor-pointer hover:bg-accent rounded"
                                  onClick={() => handleAssignTeam(agent)}
                                >
                                  <Plus className="w-4 h-4 mr-2" />
                                  Assign Team
                                </DropdownMenu.Item>
                                <DropdownMenu.Item
                                  key="activate"
                                  className="flex items-center px-2 py-2 text-sm text-green-600 cursor-pointer hover:bg-accent rounded"
                                  onClick={() => handleActivateAgent(agent.id)}
                                >
                                  <Play className="w-4 h-4 mr-2" />
                                  Activate Agent
                                </DropdownMenu.Item>
                                <DropdownMenu.Item
                                  key="deactivate"
                                  className="flex items-center px-2 py-2 text-sm text-orange-600 cursor-pointer hover:bg-accent rounded"
                                  onClick={() => handleDeactivateAgent(agent.id)}
                                >
                                  <Pause className="w-4 h-4 mr-2" />
                                  Deactivate Agent
                                </DropdownMenu.Item>
                                <DropdownMenu.Item
                                  key="delete"
                                  className="flex items-center px-2 py-2 text-sm text-destructive cursor-pointer hover:bg-accent rounded"
                                  onClick={() => handleDeleteAgent(agent.id)}
                                >
                                  <Trash2 className="w-4 h-4 mr-2" />
                                  Delete Agent
                                </DropdownMenu.Item>
                              </DropdownMenu.Content>
                            </DropdownMenu.Portal>
                          </DropdownMenu.Root>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {filteredAgents.length === 0 && (
                <div className="py-12 text-center">
                  <p className="text-muted-foreground text-sm">No agents found matching your filters</p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Create Agent Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-card border border-border rounded-lg p-6 w-full max-w-md mx-4">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-foreground">Create New Agent</h2>
              <button
                onClick={() => setShowCreateModal(false)}
                className="text-muted-foreground hover:text-foreground"
              >
                ✕
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-1">
                  Name *
                </label>
                <input
                  type="text"
                  value={createForm.name}
                  onChange={(e) => setCreateForm(prev => ({ ...prev, name: e.target.value }))}
                  className="w-full px-3 py-2 bg-input-background border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                  placeholder="Enter agent name"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-1">
                  Description *
                </label>
                <textarea
                  value={createForm.description}
                  onChange={(e) => setCreateForm(prev => ({ ...prev, description: e.target.value }))}
                  className="w-full px-3 py-2 bg-input-background border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                  placeholder="Enter agent description"
                  rows={3}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-1">
                  Category
                </label>
                <input
                  type="text"
                  value={createForm.category}
                  onChange={(e) => setCreateForm(prev => ({ ...prev, category: e.target.value }))}
                  className="w-full px-3 py-2 bg-input-background border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                  placeholder="Enter category (e.g., Development, Marketing)"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-1">
                  Model
                </label>
                <select
                  value={createForm.model}
                  onChange={(e) => setCreateForm(prev => ({ ...prev, model: e.target.value }))}
                  className="w-full px-3 py-2 bg-input-background border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                >
                  <option value="">Select a model</option>
                  <option value="gpt-4">GPT-4</option>
                  <option value="gpt-3.5-turbo">GPT-3.5 Turbo</option>
                  <option value="claude-3">Claude-3</option>
                  <option value="llama-2">Llama-2</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-1">
                  Key Features
                </label>
                <input
                  type="text"
                  value={createForm.keyFeatures}
                  onChange={(e) => setCreateForm(prev => ({ ...prev, keyFeatures: e.target.value }))}
                  className="w-full px-3 py-2 bg-input-background border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                  placeholder="Enter key features separated by semicolons (;)"
                />
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setShowCreateModal(false)}
                className="flex-1 px-4 py-2 border border-border rounded-lg text-sm font-medium text-foreground hover:bg-muted"
              >
                Cancel
              </button>
              <button
                onClick={handleCreateAgent}
                disabled={creating}
                className="flex-1 px-4 py-2 rounded-lg text-sm font-medium text-white transition-opacity flex items-center justify-center gap-2 hover:opacity-90 disabled:opacity-50"
                style={{ backgroundColor: 'rgba(13, 144, 178)' }}
              >
                {creating ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    Creating...
                  </>
                ) : (
                  <>
                    <Plus className="w-4 h-4" />
                    Create Agent
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Agent Modal */}
      {showEditModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-card border border-border rounded-lg shadow-xl max-w-md w-full mx-4">
            <div className="px-6 py-4 border-b border-border">
              <h3 className="text-lg font-semibold text-foreground">Edit Agent</h3>
            </div>
            <div className="px-6 py-4 space-y-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-1">Name *</label>
                <input
                  type="text"
                  value={editForm.name}
                  onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                  className="w-full px-3 py-2 bg-input-background border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-ring text-foreground placeholder-muted-foreground"
                  placeholder="Enter agent name"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-1">Description *</label>
                <textarea
                  value={editForm.description}
                  onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                  className="w-full px-3 py-2 bg-input-background border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-ring text-foreground placeholder-muted-foreground"
                  placeholder="Enter agent description"
                  rows={3}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-1">Category</label>
                <input
                  type="text"
                  value={editForm.category}
                  onChange={(e) => setEditForm({ ...editForm, category: e.target.value })}
                  className="w-full px-3 py-2 bg-input-background border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-ring text-foreground placeholder-muted-foreground"
                  placeholder="Enter category"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-1">Model</label>
                <select
                  value={editForm.model}
                  onChange={(e) => setEditForm({ ...editForm, model: e.target.value })}
                  className="w-full px-3 py-2 bg-input-background border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-ring text-foreground"
                >
                  <option value="">Select model</option>
                  <option value="GPT_4o">GPT-4o</option>
                  <option value="Claude_3_Sonnet">Claude 3 Sonnet</option>
                  <option value="GPT_3_5_Turbo">GPT-3.5 Turbo</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-1">Key Features</label>
                <input
                  type="text"
                  value={editForm.keyFeatures}
                  onChange={(e) => setEditForm({ ...editForm, keyFeatures: e.target.value })}
                  className="w-full px-3 py-2 bg-input-background border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-ring text-foreground placeholder-muted-foreground"
                  placeholder="Enter key features separated by semicolons"
                />
              </div>
            </div>
            <div className="px-6 py-4 border-t border-border flex gap-3">
              <button
                onClick={() => {
                  setShowEditModal(false);
                  setEditingAgent(null);
                }}
                className="flex-1 px-4 py-2 rounded-lg text-sm font-medium text-muted-foreground bg-secondary hover:bg-secondary/80 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleUpdateAgent}
                disabled={updating}
                className="flex-1 px-4 py-2 rounded-lg text-sm font-medium text-white transition-opacity flex items-center justify-center gap-2 hover:opacity-90 disabled:opacity-50"
                style={{ backgroundColor: 'var(--primary)' }}
              >
                {updating ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    Updating...
                  </>
                ) : (
                  <>
                    <Edit className="w-4 h-4" />
                    Update Agent
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Assign Team Modal */}
      {showAssignTeamModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-card border border-border rounded-lg p-6 w-full max-w-md mx-4">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-foreground">Assign Team to Agent</h2>
              <button
                onClick={() => setShowAssignTeamModal(false)}
                className="text-muted-foreground hover:text-foreground"
              >
                ✕
              </button>
            </div>

            {assigningAgent && (
              <div className="mb-4 p-3 bg-muted rounded-lg">
                <p className="text-sm text-muted-foreground">Assigning team to:</p>
                <p className="text-sm font-medium text-foreground">{assigningAgent.name}</p>
              </div>
            )}

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-1">
                  Team ID *
                </label>
                <input
                  type="text"
                  value={assignTeamForm.teamId}
                  onChange={(e) => setAssignTeamForm(prev => ({ ...prev, teamId: e.target.value }))}
                  className="w-full px-3 py-2 bg-input-background border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                  placeholder="Enter team ID"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-1">
                  Team Name (Optional)
                </label>
                <input
                  type="text"
                  value={assignTeamForm.teamName}
                  onChange={(e) => setAssignTeamForm(prev => ({ ...prev, teamName: e.target.value }))}
                  className="w-full px-3 py-2 bg-input-background border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                  placeholder="Enter team name"
                />
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setShowAssignTeamModal(false)}
                className="flex-1 px-4 py-2 border border-border rounded-lg text-sm font-medium text-foreground hover:bg-muted"
              >
                Cancel
              </button>
              <button
                onClick={handleAssignTeamSubmit}
                disabled={assigningTeam}
                className="flex-1 px-4 py-2 rounded-lg text-sm font-medium text-white transition-opacity flex items-center justify-center gap-2 hover:opacity-90 disabled:opacity-50"
                style={{ backgroundColor: 'var(--primary)' }}
              >
                {assigningTeam ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    Assigning...
                  </>
                ) : (
                  <>
                    <Plus className="w-4 h-4" />
                    Assign Team
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
