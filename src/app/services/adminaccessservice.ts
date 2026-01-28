const API_BASE_URL = 'https://39e3f01b-925f-4bbb-afa9-33401131cb97.mock.pstmn.io';

export interface ApiAdminAccessRequest {
  id: number;
  aiAgentId: number;
  requestedByUserId: number;
  status: string;
  reviewedByUserId: number | null;
  note: string | null;
  createdAt: string;
}

export interface AdminAccessRequest {
  id: string;
  aiAgentId: string;
  requestedByUserId: string;
  status: 'pending' | 'approved' | 'rejected';
  reviewedByUserId: string | null;
  note: string | null;
  createdAt: Date;
}

export async function fetchAdminAccessRequests(): Promise<AdminAccessRequest[]> {
  const url = `${API_BASE_URL}/admin-access-requests`;

  try {
    const response = await fetch(url);

    if (!response.ok) {
      throw new Error(`Failed to fetch admin access requests: ${response.statusText}`);
    }

    const data: ApiAdminAccessRequest[] = await response.json();

    // Map the API response to AdminAccessRequest interface
    const requests = data.map((apiRequest: ApiAdminAccessRequest): AdminAccessRequest => ({
      id: apiRequest.id.toString(),
      aiAgentId: apiRequest.aiAgentId.toString(),
      requestedByUserId: apiRequest.requestedByUserId.toString(),
      status: apiRequest.status.toLowerCase() as 'pending' | 'approved' | 'rejected',
      reviewedByUserId: apiRequest.reviewedByUserId?.toString() || null,
      note: apiRequest.note,
      createdAt: new Date(apiRequest.createdAt)
    }));

    return requests;
  } catch (error) {
    console.error('Error fetching admin access requests:', error);
    throw error;
  }
}

export async function createAdminAccessRequest(aiAgentId: string): Promise<AdminAccessRequest> {
  const url = `${API_BASE_URL}/admin-access-requests`;

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        aiAgentId: parseInt(aiAgentId),
        requestedByUserId: 1, // Assuming current user ID is 1
        status: 'Pending'
      }),
    });

    if (!response.ok) {
      throw new Error(`Failed to create admin access request: ${response.statusText}`);
    }

    const data: ApiAdminAccessRequest = await response.json();

    // Map the response to AdminAccessRequest interface
    const request: AdminAccessRequest = {
      id: data.id.toString(),
      aiAgentId: data.aiAgentId.toString(),
      requestedByUserId: data.requestedByUserId.toString(),
      status: data.status.toLowerCase() as 'pending' | 'approved' | 'rejected',
      reviewedByUserId: data.reviewedByUserId?.toString() || null,
      note: data.note,
      createdAt: new Date(data.createdAt)
    };

    return request;
  } catch (error) {
    console.error('Error creating admin access request:', error);
    throw error;
  }
}
