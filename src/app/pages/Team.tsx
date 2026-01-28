'use client';

import { useState, useEffect } from 'react';
import { fetchTeams, inviteTeamMember, updateTeam, deleteTeam, addTeamMember, removeTeamMember, createTeam, Team as TeamType } from '@/app/services/teamService';
import { TeamMember } from '@/app/types';
import { Plus, Mail, MoreVertical, Shield, Code, Eye, Search, Edit, Users, Trash2 } from 'lucide-react';
import { format } from 'date-fns';
import * as Dialog from '@radix-ui/react-dialog';

export function Team() {
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState<'admin' | 'developer' | 'viewer'>('developer');
  const [inviteTeamId, setInviteTeamId] = useState<string>('');
  const [showCreateTeamModal, setShowCreateTeamModal] = useState(false);
  const [createTeamName, setCreateTeamName] = useState('');
  const [createTeamDescription, setCreateTeamDescription] = useState('');
  const [showEditTeamModal, setShowEditTeamModal] = useState(false);
  const [editingTeam, setEditingTeam] = useState<TeamType | null>(null);
  const [editTeamName, setEditTeamName] = useState('');
  const [editTeamDescription, setEditTeamDescription] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [teams, setTeams] = useState<TeamType[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [inviteLoading, setInviteLoading] = useState(false);
  const [inviteError, setInviteError] = useState<string | null>(null);
  const [updateLoading, setUpdateLoading] = useState(false);
  const [updateError, setUpdateError] = useState<string | null>(null);
  const [createLoading, setCreateLoading] = useState(false);
  const [createError, setCreateError] = useState<string | null>(null);
  const [deleteLoading, setDeleteLoading] = useState<string | null>(null); // teamId being deleted
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [removeLoading, setRemoveLoading] = useState<string | null>(null); // memberId being removed
  const [removeError, setRemoveError] = useState<string | null>(null);

  useEffect(() => {
    const loadTeams = async () => {
      try {
        setLoading(true);
        setError(null);
        const teamsData = await fetchTeams();
        setTeams(teamsData);

        // Flatten all team members from all teams
        const allMembers = teamsData.flatMap(team => team.members);
        setTeamMembers(allMembers);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load team members');
      } finally {
        setLoading(false);
      }
    };

    loadTeams();
  }, []);

  const filteredMembers = teamMembers.filter(member =>
    (member.name?.toLowerCase() || '').includes(searchQuery.toLowerCase()) ||
    (member.email?.toLowerCase() || '').includes(searchQuery.toLowerCase()) ||
    (member.role?.toLowerCase() || '').includes(searchQuery.toLowerCase()) ||
    (member.teams?.some(team => team?.toLowerCase().includes(searchQuery.toLowerCase())) || false)
  );

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'admin':
        return <Shield className="w-4 h-4 text-purple-600" />;
      case 'developer':
        return <Code className="w-4 h-4 text-blue-600" />;
      case 'viewer':
        return <Eye className="w-4 h-4 text-gray-600" />;
      default:
        return null;
    }
  };

  const getRoleBadge = (role: string) => {
    const config = {
      admin: 'bg-purple-50 text-purple-700',
      developer: 'bg-blue-50 text-blue-700',
      viewer: 'bg-gray-100 text-gray-700'
    };
    return config[role as keyof typeof config] || config.viewer;
  };

  const handleInvite = async () => {
    if (!inviteEmail.trim()) {
      setInviteError('Email is required');
      return;
    }

    if (!inviteTeamId) {
      setInviteError('Please select a team');
      return;
    }

    try {
      setInviteLoading(true);
      setInviteError(null);

      await addTeamMember(inviteTeamId, {
        email: inviteEmail.trim(),
        role: inviteRole,
      });

      // For mock API, add the member to local state immediately
      // In a real app, this would be handled by the API response
      const selectedTeam = teams.find(team => team.id === inviteTeamId);
      if (selectedTeam) {
        const newMember: TeamMember = {
          id: `${inviteTeamId}-${Date.now()}`, // Temporary ID
          name: inviteEmail.split('@')[0], // Use email prefix as name for demo
          email: inviteEmail.trim(),
          role: inviteRole,
          teams: [selectedTeam.name],
          avatar: inviteEmail.charAt(0).toUpperCase(),
          joinedDate: new Date()
        };

        // Update teams state - add member to the selected team
        setTeams(prevTeams =>
          prevTeams.map(team =>
            team.id === inviteTeamId
              ? { ...team, members: [...team.members, newMember], memberCount: team.memberCount + 1 }
              : team
          )
        );

        // Update teamMembers state - add to the flattened list
        setTeamMembers(prevMembers => [...prevMembers, newMember]);
      }

      // Reset form and close modal
      setInviteEmail('');
      setInviteRole('developer');
      setInviteTeamId('');
      setShowInviteModal(false);

      // Optional: Still refresh from API to ensure consistency
      // const teamsData = await fetchTeams();
      // setTeams(teamsData);
      // const allMembers = teamsData.flatMap(team => team.members);
      // setTeamMembers(allMembers);
    } catch (err) {
      setInviteError(err instanceof Error ? err.message : 'Failed to add team member');
    } finally {
      setInviteLoading(false);
    }
  };

  const handleEditTeam = (team: TeamType) => {
    setEditingTeam(team);
    setEditTeamName(team.name);
    setEditTeamDescription(team.description);
    setShowEditTeamModal(true);
  };

  const handleUpdateTeam = async () => {
    if (!editingTeam || !editTeamName.trim()) {
      setUpdateError('Team name is required');
      return;
    }

    try {
      setUpdateLoading(true);
      setUpdateError(null);

      await updateTeam(editingTeam.id, {
        name: editTeamName.trim(),
        description: editTeamDescription.trim(),
      });

      // For mock API, update the team in local state immediately
      // In a real app, this would be handled by the API response
      setTeams(prevTeams =>
        prevTeams.map(team =>
          team.id === editingTeam.id
            ? { ...team, name: editTeamName.trim(), description: editTeamDescription.trim() }
            : team
        )
      );

      // Update team members list if team name changed
      if (editTeamName.trim() !== editingTeam.name) {
        setTeamMembers(prevMembers =>
          prevMembers.map(member =>
            member.teams.includes(editingTeam.name)
              ? {
                  ...member,
                  teams: member.teams.map(teamName =>
                    teamName === editingTeam.name ? editTeamName.trim() : teamName
                  )
                }
              : member
          )
        );
      }

      // Reset form and close modal
      setEditTeamName('');
      setEditTeamDescription('');
      setEditingTeam(null);
      setShowEditTeamModal(false);

      // Optional: Still refresh from API to ensure consistency
      // const teamsData = await fetchTeams();
      // setTeams(teamsData);
      // const allMembers = teamsData.flatMap(team => team.members);
      // setTeamMembers(allMembers);
    } catch (err) {
      setUpdateError(err instanceof Error ? err.message : 'Failed to update team');
    } finally {
      setUpdateLoading(false);
    }
  };

  const handleCreateTeam = async () => {
    if (!createTeamName.trim()) {
      setCreateError('Team name is required');
      return;
    }

    try {
      setCreateLoading(true);
      setCreateError(null);

      await createTeam({
        name: createTeamName.trim(),
        description: createTeamDescription.trim(),
      });

      // For mock API, add the new team to local state immediately
      // In a real app, this would be handled by the API response
      const newTeam: TeamType = {
        id: `team-${Date.now()}`, // Temporary ID
        name: createTeamName.trim(),
        description: createTeamDescription.trim(),
        memberCount: 0,
        members: []
      };

      setTeams(prevTeams => [...prevTeams, newTeam]);

      // Reset form and close modal
      setCreateTeamName('');
      setCreateTeamDescription('');
      setShowCreateTeamModal(false);

      // Optional: Still refresh from API to ensure consistency
      // const teamsData = await fetchTeams();
      // setTeams(teamsData);
    } catch (err) {
      setCreateError(err instanceof Error ? err.message : 'Failed to create team');
    } finally {
      setCreateLoading(false);
    }
  };

  const handleDeleteTeam = async (teamId: string) => {
    if (!confirm('Are you sure you want to delete this team? This action cannot be undone.')) {
      return;
    }

    try {
      setDeleteLoading(teamId);
      setDeleteError(null);

      await deleteTeam(teamId);

      // For mock API, remove the team from local state immediately
      // In a real app, this would be handled by the API response
      setTeams(prevTeams => prevTeams.filter(team => team.id !== teamId));
      const updatedTeams = teams.filter(team => team.id !== teamId);
      setTeamMembers(updatedTeams.flatMap(team => team.members));

      // Optional: Still refresh from API to ensure consistency
      // const teamsData = await fetchTeams();
      // setTeams(teamsData);
      // const allMembers = teamsData.flatMap(team => team.members);
      // setTeamMembers(allMembers);
    } catch (err) {
      setDeleteError(err instanceof Error ? err.message : 'Failed to delete team');
    } finally {
      setDeleteLoading(null);
    }
  };

  const handleRemoveMember = async (memberId: string, teamId: string) => {
    if (!confirm('Are you sure you want to remove this team member?')) {
      return;
    }

    try {
      setRemoveLoading(memberId);
      setRemoveError(null);

      await removeTeamMember(teamId, memberId);

      // For mock API, remove the member from local state immediately
      // In a real app, this would be handled by the API response
      setTeams(prevTeams =>
        prevTeams.map(team =>
          team.id === teamId
            ? {
                ...team,
                members: team.members.filter(member => member.id !== memberId),
                memberCount: team.memberCount - 1
              }
            : team
        )
      );

      // Remove from the flattened team members list
      setTeamMembers(prevMembers => prevMembers.filter(member => member.id !== memberId));

    } catch (err) {
      setRemoveError(err instanceof Error ? err.message : 'Failed to remove team member');
    } finally {
      setRemoveLoading(null);
    }
  };

  return (
    <div className="flex-1 overflow-auto">
      <div className="px-8 py-6 max-w-[1600px] mx-auto">
        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-foreground mb-2">Team</h1>
            <p className="text-sm text-muted-foreground">Manage team members and their access</p>
          </div>


        </div>

        {/* Loading State */}
        {loading && (
          <div className="py-12 text-center">
            <p className="text-muted-foreground">Loading team members...</p>
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

        {/* Delete Error */}
        {deleteError && (
          <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-600 text-sm">{deleteError}</p>
          </div>
        )}

        {/* Remove Member Error */}
        {removeError && (
          <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-600 text-sm">{removeError}</p>
          </div>
        )}

        {/* Create Team Error */}
        {createError && (
          <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-600 text-sm">{createError}</p>
          </div>
        )}

        {/* Content */}
        {!loading && !error && (
          <>
            {/* Controls */}
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          {/* Search */}
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search team members..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-input-background border border-border rounded-lg text-sm focus:outline-none focus:ring-2"
              style={{ '--tw-ring-color': 'rgba(13, 144, 178)' } as any}
            />
          </div>

          <div className="flex gap-3">
            <button
              onClick={() => setShowCreateTeamModal(true)}
              className="px-4 py-2 rounded-lg text-sm font-medium transition-opacity flex items-center gap-2 hover:opacity-90 border border-border bg-background text-foreground hover:bg-muted"
            >
              <Plus className="w-4 h-4" />
              Create Team
            </button>

            <button
              onClick={() => setShowInviteModal(true)}
              className="px-4 py-2 rounded-lg text-sm font-medium transition-opacity flex items-center gap-2 hover:opacity-90"
              style={{ backgroundColor: 'rgba(13, 144, 178)', color: 'white' }}
            >
              <Plus className="w-4 h-4" />
              Invite Member
            </button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-card border border-border rounded-lg p-5">
            <div className="text-sm text-muted-foreground mb-1">Total Members</div>
            <div className="text-3xl font-semibold text-foreground">{filteredMembers.length}</div>
          </div>
          <div className="bg-card border border-border rounded-lg p-5">
            <div className="text-sm text-muted-foreground mb-1">Admins</div>
            <div className="text-3xl font-semibold text-purple-600">
              {filteredMembers.filter(m => m.role === 'admin').length}
            </div>
          </div>
          <div className="bg-card border border-border rounded-lg p-5">
            <div className="text-sm text-muted-foreground mb-1">Developers</div>
            <div className="text-3xl font-semibold text-blue-600">
              {filteredMembers.filter(m => m.role === 'developer').length}
            </div>
          </div>
          <div className="bg-card border border-border rounded-lg p-5">
            <div className="text-sm text-muted-foreground mb-1">Viewers</div>
            <div className="text-3xl font-semibold text-gray-600">
              {filteredMembers.filter(m => m.role === 'viewer').length}
            </div>
          </div>
        </div>

        {/* Teams Section */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-foreground">Teams</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {teams.map((team) => (
              <div key={team.id} className="bg-card border border-border rounded-lg p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div 
                      className="w-10 h-10 rounded-lg flex items-center justify-center font-medium text-white"
                      style={{ backgroundColor: 'rgba(13, 144, 178)' }}
                    >
                      <Users className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="font-medium text-foreground">{team.name}</h3>
                      <p className="text-sm text-muted-foreground">{team.memberCount} members</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleEditTeam(team)}
                      className="p-2 hover:bg-muted rounded-lg transition-colors"
                    >
                      <Edit className="w-4 h-4 text-muted-foreground" />
                    </button>
                    <button
                      onClick={() => handleDeleteTeam(team.id)}
                      disabled={deleteLoading === team.id}
                      className="p-2 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50"
                    >
                      {deleteLoading === team.id ? (
                        <div className="w-4 h-4 border-2 border-red-500 border-t-transparent rounded-full animate-spin" />
                      ) : (
                        <Trash2 className="w-4 h-4 text-red-500" />
                      )}
                    </button>
                  </div>
                </div>
                <p className="text-sm text-muted-foreground">{team.description}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Team Members Table */}
        <div className="bg-card border border-border rounded-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border bg-muted/30">
                  <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Member
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Role
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Teams
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Joined
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filteredMembers.map((member) => (
                  <tr key={member.id} className="hover:bg-muted/20 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div 
                          className="w-10 h-10 rounded-full flex items-center justify-center font-medium"
                          style={{ backgroundColor: 'rgba(13, 144, 178)', color: 'white' }}
                        >
                          {member.avatar}
                        </div>
                        <div>
                          <div className="text-sm font-medium text-foreground">{member.name}</div>
                          <div className="text-xs text-muted-foreground">{member.email}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${getRoleBadge(member.role)}`}>
                        {getRoleIcon(member.role)}
                        {member.role.charAt(0).toUpperCase() + member.role.slice(1)}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-wrap gap-1">
                        {member.teams.map((team, index) => (
                          <span
                            key={index}
                            className="px-2 py-0.5 text-xs"
                            style={{ backgroundColor: 'rgba(201, 232, 246)', color: '#000' }}
                          >
                            {team}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm text-muted-foreground">
                        {format(member.joinedDate, 'MMM dd, yyyy')}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => {
                            // Extract teamId from memberId (format: "teamId-userId")
                            const teamId = member.id.split('-')[0];
                            handleRemoveMember(member.id, teamId);
                          }}
                          disabled={removeLoading === member.id}
                          className="p-1 hover:bg-red-50 rounded transition-colors disabled:opacity-50"
                        >
                          {removeLoading === member.id ? (
                            <div className="w-4 h-4 border-2 border-red-500 border-t-transparent rounded-full animate-spin" />
                          ) : (
                            <Trash2 className="w-4 h-4 text-red-500" />
                          )}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        </>
        )}
      </div>

      {/* Invite Modal */}
      <Dialog.Root open={showInviteModal} onOpenChange={setShowInviteModal}>
        <Dialog.Portal>
          <Dialog.Overlay className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50" />
          <Dialog.Content className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white border border-gray-300 rounded-lg p-6 w-full max-w-md z-50 shadow-xl">
            <Dialog.Title className="text-lg font-semibold text-gray-900 mb-4">
              Add Team Member
            </Dialog.Title>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Team
                </label>
                <select
                  value={inviteTeamId}
                  onChange={(e) => setInviteTeamId(e.target.value)}
                  className="w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 text-gray-900"
                  style={{ '--tw-ring-color': 'rgba(13, 144, 178)' } as any}
                >
                  <option value="">Select a team</option>
                  {teams.map((team) => (
                    <option key={team.id} value={team.id}>
                      {team.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email Address
                </label>
                <input
                  type="email"
                  value={inviteEmail}
                  onChange={(e) => setInviteEmail(e.target.value)}
                  placeholder="colleague@company.com"
                  className="w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 text-gray-900"
                  style={{ '--tw-ring-color': 'rgba(13, 144, 178)' } as any}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Role
                </label>
                <select
                  value={inviteRole}
                  onChange={(e) => setInviteRole(e.target.value as 'admin' | 'developer' | 'viewer')}
                  className="w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 text-gray-900"
                  style={{ '--tw-ring-color': 'rgba(13, 144, 178)' } as any}
                >
                  <option value="viewer">Viewer</option>
                  <option value="developer">Developer</option>
                  <option value="admin">Admin</option>
                </select>
              </div>

              {inviteError && (
                <div className="text-red-500 text-sm">
                  {inviteError}
                </div>
              )}

              <div className="pt-4 flex gap-3">
                <button
                  onClick={() => setShowInviteModal(false)}
                  disabled={inviteLoading}
                  className="flex-1 px-4 py-2 bg-gray-200 text-gray-900 rounded-lg text-sm font-medium hover:bg-gray-300 transition-colors disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleInvite}
                  disabled={inviteLoading}
                  className="flex-1 px-4 py-2 text-white rounded-lg text-sm font-medium hover:opacity-90 transition-opacity flex items-center justify-center gap-2 disabled:opacity-50"
                  style={{ backgroundColor: 'rgba(13, 144, 178)' }}
                >
                  {inviteLoading ? (
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <Mail className="w-4 h-4" />
                  )}
                  {inviteLoading ? 'Adding...' : 'Add Member'}
                </button>
              </div>
            </div>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>

      {/* Create Team Modal */}
      <Dialog.Root open={showCreateTeamModal} onOpenChange={setShowCreateTeamModal}>
        <Dialog.Portal>
          <Dialog.Overlay className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50" />
          <Dialog.Content className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white border border-gray-300 rounded-lg p-6 w-full max-w-md z-50 shadow-xl">
            <Dialog.Title className="text-lg font-semibold text-gray-900 mb-4">
              Create New Team
            </Dialog.Title>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Team Name
                </label>
                <input
                  type="text"
                  value={createTeamName}
                  onChange={(e) => setCreateTeamName(e.target.value)}
                  placeholder="Enter team name"
                  className="w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 text-gray-900"
                  style={{ '--tw-ring-color': 'rgba(13, 144, 178)' } as any}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description
                </label>
                <textarea
                  value={createTeamDescription}
                  onChange={(e) => setCreateTeamDescription(e.target.value)}
                  placeholder="Enter team description"
                  rows={3}
                  className="w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 text-gray-900 resize-none"
                  style={{ '--tw-ring-color': 'rgba(13, 144, 178)' } as any}
                />
              </div>

              {createError && (
                <div className="text-red-500 text-sm">
                  {createError}
                </div>
              )}

              <div className="pt-4 flex gap-3">
                <button
                  onClick={() => setShowCreateTeamModal(false)}
                  disabled={createLoading}
                  className="flex-1 px-4 py-2 bg-gray-200 text-gray-900 rounded-lg text-sm font-medium hover:bg-gray-300 transition-colors disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleCreateTeam}
                  disabled={createLoading}
                  className="flex-1 px-4 py-2 text-white rounded-lg text-sm font-medium hover:opacity-90 transition-opacity flex items-center justify-center gap-2 disabled:opacity-50"
                  style={{ backgroundColor: 'rgba(13, 144, 178)' }}
                >
                  {createLoading ? (
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <Plus className="w-4 h-4" />
                  )}
                  {createLoading ? 'Creating...' : 'Create Team'}
                </button>
              </div>
            </div>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>

      {/* Edit Team Modal */}
      <Dialog.Root open={showEditTeamModal} onOpenChange={setShowEditTeamModal}>
        <Dialog.Portal>
          <Dialog.Overlay className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50" />
          <Dialog.Content className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white border border-gray-300 rounded-lg p-6 w-full max-w-md z-50 shadow-xl">
            <Dialog.Title className="text-lg font-semibold text-gray-900 mb-4">
              Edit Team
            </Dialog.Title>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Team Name
                </label>
                <input
                  type="text"
                  value={editTeamName}
                  onChange={(e) => setEditTeamName(e.target.value)}
                  placeholder="Enter team name"
                  className="w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 text-gray-900"
                  style={{ '--tw-ring-color': 'rgba(13, 144, 178)' } as any}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description
                </label>
                <textarea
                  value={editTeamDescription}
                  onChange={(e) => setEditTeamDescription(e.target.value)}
                  placeholder="Enter team description"
                  rows={3}
                  className="w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 text-gray-900 resize-none"
                  style={{ '--tw-ring-color': 'rgba(13, 144, 178)' } as any}
                />
              </div>

              {updateError && (
                <div className="text-red-500 text-sm">
                  {updateError}
                </div>
              )}

              <div className="pt-4 flex gap-3">
                <button
                  onClick={() => setShowEditTeamModal(false)}
                  disabled={updateLoading}
                  className="flex-1 px-4 py-2 bg-gray-200 text-gray-900 rounded-lg text-sm font-medium hover:bg-gray-300 transition-colors disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleUpdateTeam}
                  disabled={updateLoading}
                  className="flex-1 px-4 py-2 text-white rounded-lg text-sm font-medium hover:opacity-90 transition-opacity flex items-center justify-center gap-2 disabled:opacity-50"
                  style={{ backgroundColor: 'rgba(13, 144, 178)' }}
                >
                  {updateLoading ? (
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <Edit className="w-4 h-4" />
                  )}
                  {updateLoading ? 'Updating...' : 'Update Team'}
                </button>
              </div>
            </div>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>
    </div>
  );
}
