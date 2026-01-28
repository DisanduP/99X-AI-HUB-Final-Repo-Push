import { Agent, Model } from '@/app/types';

const API_BASE_URL = 'https://39e3f01b-925f-4bbb-afa9-33401131cb97.mock.pstmn.io';

export interface FetchAgentsParams {
  teamId?: string;
  page?: number;
  pageSize?: number;
}

export interface ApiAgentResponse {
  id: number;
  name: string;
  description: string;
  keyFeatures: string;
  category: string;
  status: string;
  model: string;
  teamMembers: any[];
}

export interface AgentsResponse {
  items: ApiAgentResponse[];
  total?: number;
  page?: number;
  pageSize?: number;
}

export async function fetchAgents(params: FetchAgentsParams = {}): Promise<Agent[]> {
  const { teamId, page = 1, pageSize = 10 } = params;

  const queryParams = new URLSearchParams({
    page: page.toString(),
    pageSize: pageSize.toString(),
  });

  if (teamId) {
    queryParams.append('teamId', teamId);
  }

  const url = `${API_BASE_URL}/agents?${queryParams.toString()}`;

  try {
    const response = await fetch(url);

    if (!response.ok) {
      throw new Error(`Failed to fetch agents: ${response.statusText}`);
    }

    const data: AgentsResponse = await response.json();

    // Assuming the API returns { items: ApiAgentResponse[] }
    const agents = (data.items || []).map((apiAgent: ApiAgentResponse): Agent => ({
      id: apiAgent.id.toString(),
      name: apiAgent.name,
      status: apiAgent.status === 'Active' ? 'healthy' : 'failed', // Map status
      team: apiAgent.category, // Use category as team
      environment: 'production', // Default
      model: (apiAgent.model || 'gpt-4o').replace('_', '-').toLowerCase() as Model, // Map model
      lastRun: new Date(Date.now() - 1000 * 60 * 15), // Default to 15 minutes ago
      executionTime: 1.0, // Default
      successRate: 95.0, // Default
      tools: apiAgent.keyFeatures ? apiAgent.keyFeatures.split(';').map(f => f.trim()) : [], // Split features
      description: apiAgent.description
    }));

    return agents;
  } catch (error) {
    console.error('Error fetching agents:', error);
    throw error;
  }
}

export async function fetchMyAgents(): Promise<Agent[]> {
  const url = `${API_BASE_URL}/agents/my-agents`;

  try {
    const response = await fetch(url);

    if (!response.ok) {
      throw new Error(`Failed to fetch my agents: ${response.statusText}`);
    }

    const data: ApiAgentResponse[] = await response.json();

    // Assuming the API returns an array of ApiAgentResponse
    const agents = data.map((apiAgent: ApiAgentResponse): Agent => ({
      id: apiAgent.id.toString(),
      name: apiAgent.name,
      status: apiAgent.status === 'Active' ? 'healthy' : 'failed', // Map status
      team: apiAgent.category, // Use category as team
      environment: 'production', // Default
      model: (apiAgent.model || 'gpt-4o').replace('_', '-').toLowerCase() as Model, // Map model
      lastRun: new Date(Date.now() - 1000 * 60 * 15), // Default to 15 minutes ago
      executionTime: 1.0, // Default
      successRate: 95.0, // Default
      tools: apiAgent.keyFeatures ? apiAgent.keyFeatures.split(';').map(f => f.trim()) : [], // Split features
      description: apiAgent.description
    }));

    return agents;
  } catch (error) {
    console.error('Error fetching my agents:', error);
    throw error;
  }
}

export interface CreateAgentRequest {
  name: string;
  description: string;
  category: string;
  model: string;
  keyFeatures: string;
}

export async function createAgent(agentData: CreateAgentRequest): Promise<Agent> {
  const url = `${API_BASE_URL}/agents`;

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(agentData),
    });

    if (!response.ok) {
      throw new Error(`Failed to create agent: ${response.statusText}`);
    }

    const data: ApiAgentResponse = await response.json();

    // Map the response to Agent interface
    const agent: Agent = {
      id: data.id.toString(),
      name: data.name,
      status: data.status === 'Active' ? 'healthy' : 'failed',
      team: data.category,
      environment: 'production', // Default
      model: (data.model || 'gpt-4o').replace('_', '-').toLowerCase() as Model,
      lastRun: new Date(Date.now() - 1000 * 60 * 15), // Default to 15 minutes ago
      executionTime: 1.0, // Default
      successRate: 95.0, // Default
      tools: data.keyFeatures ? data.keyFeatures.split(';').map(f => f.trim()) : [],
      description: data.description
    };

    return agent;
  } catch (error) {
    console.error('Error creating agent:', error);
    throw error;
  }
}

export async function updateAgent(agentId: string | number, agentData: Partial<CreateAgentRequest>): Promise<Agent> {
  const url = `${API_BASE_URL}/agents/${agentId}`;

  try {
    const response = await fetch(url, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(agentData),
    });

    if (!response.ok) {
      throw new Error(`Failed to update agent: ${response.statusText}`);
    }

    const data: ApiAgentResponse = await response.json();

    // Map the response to Agent interface
    const agent: Agent = {
      id: data.id.toString(),
      name: data.name,
      status: data.status === 'Active' ? 'healthy' : 'failed',
      team: data.category,
      environment: 'production', // Default
      model: (data.model || 'gpt-4o').replace('_', '-').toLowerCase() as Model,
      lastRun: new Date(Date.now() - 1000 * 60 * 15), // Default to 15 minutes ago
      executionTime: 1.0, // Default
      successRate: 95.0, // Default
      tools: data.keyFeatures ? data.keyFeatures.split(';').map(f => f.trim()) : [],
      description: data.description
    };

    return agent;
  } catch (error) {
    console.error('Error updating agent:', error);
    throw error;
  }
}

export async function activateAgent(agentId: string | number): Promise<Agent> {
  const url = `${API_BASE_URL}/agents/${agentId}/activate`;

  try {
    const response = await fetch(url, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to activate agent: ${response.statusText}`);
    }

    const data: ApiAgentResponse = await response.json();

    // Map the response to Agent interface
    const agent: Agent = {
      id: data.id.toString(),
      name: data.name,
      status: data.status === 'Active' ? 'healthy' : 'failed',
      team: data.category,
      environment: 'production', // Default
      model: (data.model || 'gpt-4o').replace('_', '-').toLowerCase() as Model,
      lastRun: new Date(Date.now() - 1000 * 60 * 15), // Default to 15 minutes ago
      executionTime: 1.0, // Default
      successRate: 95.0, // Default
      tools: data.keyFeatures ? data.keyFeatures.split(';').map(f => f.trim()) : [],
      description: data.description
    };

    return agent;
  } catch (error) {
    console.error('Error activating agent:', error);
    throw error;
  }
}

export async function deactivateAgent(agentId: string | number): Promise<Agent> {
  const url = `${API_BASE_URL}/agents/${agentId}/inactivate`;

  try {
    const response = await fetch(url, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to deactivate agent: ${response.statusText}`);
    }

    const data: ApiAgentResponse = await response.json();

    // Map the response to Agent interface
    const agent: Agent = {
      id: data.id.toString(),
      name: data.name,
      status: data.status === 'Active' ? 'healthy' : data.status === 'Paused' ? 'degraded' : 'failed',
      team: data.category,
      environment: 'production', // Default
      model: (data.model || 'gpt-4o').replace('_', '-').toLowerCase() as Model,
      lastRun: new Date(Date.now() - 1000 * 60 * 15), // Default to 15 minutes ago
      executionTime: 1.0, // Default
      successRate: 95.0, // Default
      tools: data.keyFeatures ? data.keyFeatures.split(';').map(f => f.trim()) : [],
      description: data.description
    };

    return agent;
  } catch (error) {
    console.error('Error deactivating agent:', error);
    throw error;
  }
}

export async function fetchAllAgents(params: FetchAgentsParams = {}): Promise<Agent[]> {
  const { teamId, page = 1, pageSize = 100 } = params; // Fetch more for dashboard

  const queryParams = new URLSearchParams({
    page: page.toString(),
    pageSize: pageSize.toString(),
  });

  if (teamId) {
    queryParams.append('teamId', teamId);
  }

  const url = `${API_BASE_URL}/agents?${queryParams.toString()}`;

  try {
    const response = await fetch(url);

    if (!response.ok) {
      throw new Error(`Failed to fetch all agents: ${response.statusText}`);
    }

    const data: AgentsResponse = await response.json();

    // Assuming the API returns { items: ApiAgentResponse[] }
    const agents = (data.items || []).map((apiAgent: ApiAgentResponse): Agent => ({
      id: apiAgent.id.toString(),
      name: apiAgent.name,
      status: apiAgent.status === 'Active' ? 'healthy' : apiAgent.status === 'Paused' ? 'degraded' : 'failed',
      team: apiAgent.category,
      environment: 'production', // Default
      model: (apiAgent.model || 'gpt-4o').replace('_', '-').toLowerCase() as Model,
      lastRun: new Date(Date.now() - 1000 * 60 * 15), // Default to 15 minutes ago
      executionTime: 1.0, // Default
      successRate: 95.0, // Default
      tools: apiAgent.keyFeatures ? apiAgent.keyFeatures.split(';').map(f => f.trim()) : [],
      description: apiAgent.description
    }));

    return agents;
  } catch (error) {
    console.error('Error fetching all agents:', error);
    throw error;
  }
}

export async function fetchAgentsById(agentId: string | number, params: Omit<FetchAgentsParams, 'teamId'> = {}): Promise<Agent[]> {
  const { page = 1, pageSize = 10 } = params;

  const queryParams = new URLSearchParams({
    page: page.toString(),
    pageSize: pageSize.toString(),
  });

  const url = `${API_BASE_URL}/agents/${agentId}?${queryParams.toString()}`;

  try {
    const response = await fetch(url);

    if (!response.ok) {
      throw new Error(`Failed to fetch agents by ID: ${response.statusText}`);
    }

    const data: AgentsResponse = await response.json();

    // Assuming the API returns { items: ApiAgentResponse[] }
    const agents = (data.items || []).map((apiAgent: ApiAgentResponse): Agent => ({
      id: apiAgent.id.toString(),
      name: apiAgent.name,
      status: apiAgent.status === 'Active' ? 'healthy' : apiAgent.status === 'Paused' ? 'degraded' : 'failed',
      team: apiAgent.category,
      environment: 'production', // Default
      model: (apiAgent.model || 'gpt-4o').replace('_', '-').toLowerCase() as Model,
      lastRun: new Date(Date.now() - 1000 * 60 * 15), // Default to 15 minutes ago
      executionTime: 1.0, // Default
      successRate: 95.0, // Default
      tools: apiAgent.keyFeatures ? apiAgent.keyFeatures.split(';').map(f => f.trim()) : [],
      description: apiAgent.description
    }));

    return agents;
  } catch (error) {
    console.error('Error fetching agents by ID:', error);
    throw error;
  }
}

export interface AssignTeamRequest {
  teamId: string;
  teamName?: string;
}

export async function assignTeamToAgent(agentId: string | number, teamData: AssignTeamRequest): Promise<Agent> {
  const url = `${API_BASE_URL}/agents/${agentId}/team/${encodeURIComponent(teamData.teamId)}`;

  console.log('Assigning team to agent:', { agentId, teamId: teamData.teamId, url });

  try {
    const response = await fetch(url, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    console.log('Response status:', response.status, response.statusText);

    if (!response.ok) {
      const errorText = await response.text().catch(() => '');
      console.error('API Error:', { status: response.status, statusText: response.statusText, errorText });
      throw new Error(`Failed to assign team to agent: ${response.status} ${response.statusText || 'Unknown error'}${errorText ? ` - ${errorText}` : ''}`);
    }

    const data: ApiAgentResponse = await response.json();
    console.log('API Response:', data);

    // Map the response to Agent interface
    const agent: Agent = {
      id: data.id.toString(),
      name: data.name,
      status: data.status === 'Active' ? 'healthy' : data.status === 'Paused' ? 'degraded' : 'failed',
      team: data.category,
      environment: 'production', // Default
      model: (data.model || 'gpt-4o').replace('_', '-').toLowerCase() as Model,
      lastRun: new Date(Date.now() - 1000 * 60 * 15), // Default to 15 minutes ago
      executionTime: 1.0, // Default
      successRate: 95.0, // Default
      tools: data.keyFeatures ? data.keyFeatures.split(';').map(f => f.trim()) : [],
      description: data.description
    };

    return agent;
  } catch (error) {
    console.error('Error assigning team to agent:', error);
    throw error;
  }
}
