'use client';

import { useState, useEffect } from 'react';
import { useTheme } from 'next-themes';
import { Moon, Sun, Monitor, Key, Shield, RefreshCw, Copy, Check } from 'lucide-react';
import { fetchAdminAccessRequests, createAdminAccessRequest, AdminAccessRequest } from '@/app/services/adminaccessservice';

export function Settings() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  // Notification preferences state
  const [notifications, setNotifications] = useState({
    agentStatusChanges: false,
    performanceAlerts: true,
    successRateDrops: true,
    newTeamMembers: true,
    teamActivity: false,
    emailNotifications: true,
    browserNotifications: false
  });

  // Admin access state
  const [adminRequests, setAdminRequests] = useState<AdminAccessRequest[]>([]);
  const [adminLoading, setAdminLoading] = useState(true);
  const [adminError, setAdminError] = useState<string | null>(null);
  const [requestingAccess, setRequestingAccess] = useState(false);

  // API key state
  const [apiKey, setApiKey] = useState({
    key: 'ak_••••••••••••••••••••••••••••••••',
    generatedAt: new Date('2026-01-15T10:30:00'),
    isVisible: false,
    copied: false
  });

  // Avoid hydration mismatch
  useEffect(() => {
    setMounted(true);
  }, []);

  // Fetch admin access requests
  useEffect(() => {
    const loadAdminRequests = async () => {
      try {
        setAdminLoading(true);
        setAdminError(null);
        const requests = await fetchAdminAccessRequests();
        setAdminRequests(requests);
      } catch (err) {
        setAdminError(err instanceof Error ? err.message : 'Failed to load admin requests');
      } finally {
        setAdminLoading(false);
      }
    };

    loadAdminRequests();
  }, []);

  if (!mounted) {
    return null;
  }

  const toggleNotification = (key: keyof typeof notifications) => {
    setNotifications(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  const requestAdminAccess = async () => {
    try {
      setRequestingAccess(true);
      // For now, we'll request access for agent ID 1. In a real app, this would be dynamic.
      const newRequest = await createAdminAccessRequest('1');
      setAdminRequests(prev => [...prev, newRequest]);
    } catch (err) {
      alert('Failed to request admin access: ' + (err instanceof Error ? err.message : 'Unknown error'));
    } finally {
      setRequestingAccess(false);
    }
  };

  const generateApiKey = () => {
    const newKey = 'ak_' + Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
    setApiKey({
      key: newKey,
      generatedAt: new Date(),
      isVisible: true,
      copied: false
    });
  };

  const toggleApiKeyVisibility = () => {
    setApiKey(prev => ({ ...prev, isVisible: !prev.isVisible }));
  };

  const copyApiKey = async () => {
    try {
      await navigator.clipboard.writeText(apiKey.key);
      setApiKey(prev => ({ ...prev, copied: true }));
      setTimeout(() => setApiKey(prev => ({ ...prev, copied: false })), 2000);
    } catch (err) {
      console.error('Failed to copy API key:', err);
    }
  };

  const themes = [
    {
      id: 'light',
      label: 'Light',
      icon: <Sun className="w-5 h-5" />,
      description: 'Clean and bright interface'
    },
    {
      id: 'dark',
      label: 'Dark',
      icon: <Moon className="w-5 h-5" />,
      description: 'Easy on the eyes in low light'
    },
    {
      id: 'system',
      label: 'System',
      icon: <Monitor className="w-5 h-5" />,
      description: 'Follow your system preference'
    }
  ];

  return (
    <div className="flex-1 overflow-auto">
      <div className="px-8 py-6 max-w-[800px] mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-semibold text-foreground mb-2">Settings</h1>
          <p className="text-sm text-muted-foreground">Customize your experience</p>
        </div>

        {/* Theme Settings */}
        <div className="bg-card border border-border rounded-lg p-6">
          <h2 className="text-lg font-medium text-foreground mb-4">Appearance</h2>
          <p className="text-sm text-muted-foreground mb-6">
            Choose how the interface looks to you.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {themes.map((themeOption) => (
              <button
                key={themeOption.id}
                onClick={() => setTheme(themeOption.id)}
                className={`
                  p-4 rounded-lg border-2 transition-all
                  ${theme === themeOption.id
                    ? 'border-primary bg-primary/5'
                    : 'border-border hover:border-primary/50'
                  }
                `}
              >
                <div className="flex flex-col items-center gap-3">
                  <div className={`
                    p-3 rounded-full
                    ${theme === themeOption.id
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-muted text-muted-foreground'
                    }
                  `}>
                    {themeOption.icon}
                  </div>
                  <div className="text-center">
                    <div className="font-medium text-foreground">{themeOption.label}</div>
                    <div className="text-xs text-muted-foreground mt-1">
                      {themeOption.description}
                    </div>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Notifications Settings */}
        <div className="mt-8 bg-card border border-border rounded-lg p-6">
          <h2 className="text-lg font-medium text-foreground mb-4">Notifications</h2>
          <p className="text-sm text-muted-foreground mb-6">
            Configure how you receive notifications about your agents and team activity.
          </p>

          <div className="space-y-6">
            {/* Agent Notifications */}
            <div>
              <h3 className="text-sm font-medium text-foreground mb-3">Agent Notifications</h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-sm font-medium text-foreground">Agent Status Changes</div>
                    <div className="text-xs text-muted-foreground">Get notified when agents go online/offline or change status</div>
                  </div>
                  <button
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 ${
                      notifications.agentStatusChanges ? 'bg-primary' : 'bg-muted'
                    }`}
                    onClick={() => toggleNotification('agentStatusChanges')}
                  >
                    <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      notifications.agentStatusChanges ? 'translate-x-6' : 'translate-x-1'
                    }`} />
                  </button>
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-sm font-medium text-foreground">Performance Alerts</div>
                    <div className="text-xs text-muted-foreground">Receive alerts for performance issues or failures</div>
                  </div>
                  <button
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 ${
                      notifications.performanceAlerts ? 'bg-primary' : 'bg-muted'
                    }`}
                    onClick={() => toggleNotification('performanceAlerts')}
                  >
                    <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      notifications.performanceAlerts ? 'translate-x-6' : 'translate-x-1'
                    }`} />
                  </button>
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-sm font-medium text-foreground">Success Rate Drops</div>
                    <div className="text-xs text-muted-foreground">Alert when agent success rates fall below threshold</div>
                  </div>
                  <button
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 ${
                      notifications.successRateDrops ? 'bg-primary' : 'bg-muted'
                    }`}
                    onClick={() => toggleNotification('successRateDrops')}
                  >
                    <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      notifications.successRateDrops ? 'translate-x-6' : 'translate-x-1'
                    }`} />
                  </button>
                </div>
              </div>
            </div>

            {/* Team Notifications */}
            <div className="border-t border-border pt-6">
              <h3 className="text-sm font-medium text-foreground mb-3">Team Notifications</h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-sm font-medium text-foreground">New Team Members</div>
                    <div className="text-xs text-muted-foreground">Get notified when new members join your team</div>
                  </div>
                  <button
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 ${
                      notifications.newTeamMembers ? 'bg-primary' : 'bg-muted'
                    }`}
                    onClick={() => toggleNotification('newTeamMembers')}
                  >
                    <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      notifications.newTeamMembers ? 'translate-x-6' : 'translate-x-1'
                    }`} />
                  </button>
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-sm font-medium text-foreground">Team Activity</div>
                    <div className="text-xs text-muted-foreground">Receive updates about team member activities</div>
                  </div>
                  <button
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 ${
                      notifications.teamActivity ? 'bg-primary' : 'bg-muted'
                    }`}
                    onClick={() => toggleNotification('teamActivity')}
                  >
                    <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      notifications.teamActivity ? 'translate-x-6' : 'translate-x-1'
                    }`} />
                  </button>
                </div>
              </div>
            </div>

            {/* Notification Methods */}
            <div className="border-t border-border pt-6">
              <h3 className="text-sm font-medium text-foreground mb-3">Notification Methods</h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-sm font-medium text-foreground">Email Notifications</div>
                    <div className="text-xs text-muted-foreground">Receive notifications via email</div>
                  </div>
                  <button
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 ${
                      notifications.emailNotifications ? 'bg-primary' : 'bg-muted'
                    }`}
                    onClick={() => toggleNotification('emailNotifications')}
                  >
                    <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      notifications.emailNotifications ? 'translate-x-6' : 'translate-x-1'
                    }`} />
                  </button>
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-sm font-medium text-foreground">Browser Notifications</div>
                    <div className="text-xs text-muted-foreground">Show notifications in your browser</div>
                  </div>
                  <button
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 ${
                      notifications.browserNotifications ? 'bg-primary' : 'bg-muted'
                    }`}
                    onClick={() => toggleNotification('browserNotifications')}
                  >
                    <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      notifications.browserNotifications ? 'translate-x-6' : 'translate-x-1'
                    }`} />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Admin Access Section */}
        <div className="mt-8 bg-card border border-border rounded-lg p-6">
          <h2 className="text-lg font-medium text-foreground mb-4 flex items-center gap-2">
            <Shield className="w-5 h-5" />
            Admin Access
          </h2>
          <p className="text-sm text-muted-foreground mb-6">
            Request administrative privileges for your team. This will be reviewed by existing administrators.
          </p>

          <div className="space-y-4">
            {adminLoading ? (
              <div className="flex items-center justify-center py-8">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
                <span className="ml-2 text-muted-foreground">Loading admin requests...</span>
              </div>
            ) : adminError ? (
              <div className="p-4 bg-destructive/10 border border-destructive/20 rounded-lg">
                <p className="text-destructive text-sm">{adminError}</p>
              </div>
            ) : (
              <div className="flex items-center justify-between p-4 bg-muted/30 rounded-lg">
                <div>
                  <div className="text-sm font-medium text-foreground">Current Status</div>
                  <div className="text-xs text-muted-foreground mt-1">
                    {adminRequests.length === 0 && 'No admin access requested'}
                    {adminRequests.some(r => r.status === 'pending') && 'Request pending approval'}
                    {adminRequests.some(r => r.status === 'approved') && 'Admin access granted'}
                    {adminRequests.some(r => r.status === 'rejected') && 'Request was rejected'}
                  </div>
                  {adminRequests.length > 0 && (
                    <div className="text-xs text-muted-foreground mt-1">
                      Latest request: {adminRequests[adminRequests.length - 1]?.createdAt.toLocaleDateString()}
                    </div>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  {adminRequests.some(r => r.status === 'approved') && (
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                      <Check className="w-3 h-3 mr-1" />
                      Admin
                    </span>
                  )}
                  {adminRequests.some(r => r.status === 'pending') && (
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                      Pending
                    </span>
                  )}
                  {!adminRequests.some(r => r.status === 'pending') && !adminRequests.some(r => r.status === 'approved') && (
                    <button
                      onClick={requestAdminAccess}
                      disabled={requestingAccess}
                      className="px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:opacity-90 transition-opacity disabled:opacity-50 flex items-center gap-2"
                    >
                      {requestingAccess ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                          Requesting...
                        </>
                      ) : (
                        <>
                          <Shield className="w-4 h-4" />
                          Request Access
                        </>
                      )}
                    </button>
                  )}
                </div>
              </div>
            )}

            {/* Show recent requests */}
            {adminRequests.length > 0 && (
              <div className="border-t border-border pt-4">
                <h3 className="text-sm font-medium text-foreground mb-3">Recent Requests</h3>
                <div className="space-y-2">
                  {adminRequests.slice(-3).reverse().map((request) => (
                    <div key={request.id} className="flex items-center justify-between p-3 bg-muted/20 rounded-lg">
                      <div>
                        <div className="text-sm font-medium text-foreground">
                          Agent #{request.aiAgentId}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {request.createdAt.toLocaleDateString()}
                        </div>
                      </div>
                      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                        request.status === 'approved' ? 'bg-green-100 text-green-800' :
                        request.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-red-100 text-red-800'
                      }`}>
                        {request.status === 'approved' && <Check className="w-3 h-3 mr-1" />}
                        {request.status.charAt(0).toUpperCase() + request.status.slice(1)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="text-xs text-muted-foreground">
              <strong>Note:</strong> Admin requests are reviewed by existing team administrators and may take 1-2 business days to process.
            </div>
          </div>
        </div>

        {/* API Key Section */}
        <div className="mt-8 bg-card border border-border rounded-lg p-6">
          <h2 className="text-lg font-medium text-foreground mb-4 flex items-center gap-2">
            <Key className="w-5 h-5" />
            API Keys
          </h2>
          <p className="text-sm text-muted-foreground mb-6">
            Generate and manage API keys for pushing metrics to your agent teams.
          </p>

          <div className="space-y-4">
            <div className="p-4 bg-muted/30 rounded-lg">
              <div className="flex items-center justify-between mb-3">
                <div className="text-sm font-medium text-foreground">Agent Metrics API Key</div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={toggleApiKeyVisibility}
                    className="text-xs text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {apiKey.isVisible ? 'Hide' : 'Show'}
                  </button>
                  <button
                    onClick={copyApiKey}
                    className="p-1.5 hover:bg-muted rounded transition-colors"
                    title="Copy API key"
                  >
                    {apiKey.copied ? (
                      <Check className="w-4 h-4 text-green-600" />
                    ) : (
                      <Copy className="w-4 h-4" />
                    )}
                  </button>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <code className="flex-1 px-3 py-2 bg-background border border-border rounded text-sm font-mono">
                  {apiKey.isVisible ? apiKey.key : 'ak_••••••••••••••••••••••••••••••••'}
                </code>
                <button
                  onClick={generateApiKey}
                  className="flex items-center gap-2 px-3 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:opacity-90 transition-opacity"
                >
                  <RefreshCw className="w-4 h-4" />
                  Regenerate
                </button>
              </div>

              <div className="text-xs text-muted-foreground mt-2">
                Generated on {apiKey.generatedAt.toLocaleDateString()} at {apiKey.generatedAt.toLocaleTimeString()}
              </div>
            </div>

            <div className="text-xs text-muted-foreground">
              <strong>Security Note:</strong> Keep your API key secure and never share it publicly. Regenerating will invalidate the previous key.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
