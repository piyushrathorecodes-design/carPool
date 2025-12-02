import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  initializeCometChat, 
  loginToCometChat, 
  createGroup as createCometChatGroup,
  joinGroup as joinCometChatGroup,
  getGroupsList
} from '../services/cometchat.service';
import { useAuth } from '../contexts/AuthContext';

interface Group {
  guid: string;
  name: string;
  type: string;
  memberCount: number;
  description?: string;
}

const GroupsPage: React.FC = () => {
  const [groups, setGroups] = useState<Group[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [groupName, setGroupName] = useState('');
  const [groupDescription, setGroupDescription] = useState('');
  const [groupType, setGroupType] = useState<'public' | 'private' | 'password'>('public');
  const [password, setPassword] = useState('');
  const [joiningGroupId, setJoiningGroupId] = useState<string | null>(null);
  
  const { user } = useAuth();
  const navigate = useNavigate();

  // Initialize and load groups
  useEffect(() => {
    const initAndLoadGroups = async () => {
      try {
        setLoading(true);
        await initializeCometChat();
        
        // Login to CometChat if user exists
        if (user) {
          try {
            await loginToCometChat(user.id, user.id);
          } catch (loginError) {
            console.log('User might already be logged in or login failed');
          }
        }
        
        await loadGroups();
      } catch (err) {
        console.error('Error initializing CometChat:', err);
        setError('Failed to initialize chat service');
      } finally {
        setLoading(false);
      }
    };

    initAndLoadGroups();
  }, [user]);

  // Load groups from CometChat
  const loadGroups = async () => {
    try {
      const groupsList = await getGroupsList(50);
      const formattedGroups: Group[] = groupsList.map(group => ({
        guid: group.getGuid(),
        name: group.getName(),
        type: group.getType(),
        memberCount: group.getMembersCount(),
        description: group.getDescription()
      }));
      
      setGroups(formattedGroups);
      setError(null);
    } catch (err) {
      console.error('Error loading groups:', err);
      setError('Failed to load groups');
    }
  };

  // Create a new group
  const handleCreateGroup = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!groupName.trim()) {
      setError('Group name is required');
      return;
    }
    
    try {
      setLoading(true);
      
      // Generate a unique GUID for the group
      const guid = `group_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      
      // Create group in CometChat
      const newGroup = await createCometChatGroup(
        guid,
        groupName,
        groupType,
        groupType === 'password' ? password : undefined
      );
      
      // Refresh groups list
      await loadGroups();
      
      // Reset form
      setGroupName('');
      setGroupDescription('');
      setGroupType('public');
      setPassword('');
      setShowCreateForm(false);
      
      // Show success message
      setError('Group created successfully!');
      
      // Clear success message after 3 seconds
      setTimeout(() => setError(null), 3000);
    } catch (err) {
      console.error('Error creating group:', err);
      setError('Failed to create group. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Join a group
  const handleJoinGroup = async (group: Group) => {
    try {
      setJoiningGroupId(group.guid);
      
      // Join group in CometChat
      await joinCometChatGroup(
        group.guid,
        group.type as any,
        group.type === 'password' ? password : undefined
      );
      
      // Navigate to group chat
      navigate(`/group-chat/${group.guid}`);
    } catch (err) {
      console.error('Error joining group:', err);
      setError('Failed to join group. Please try again.');
    } finally {
      setJoiningGroupId(null);
    }
  };

  // Navigate to group chat
  const goToGroupChat = (groupId: string) => {
    navigate(`/group-chat/${groupId}`);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-white">Student Groups</h1>
              <p className="mt-2 text-gray-300">Connect with fellow students traveling on similar routes</p>
            </div>
            <button
              onClick={() => setShowCreateForm(!showCreateForm)}
              className="ridepool-btn ridepool-btn-primary px-6 py-3 rounded-lg font-semibold hover-lift"
            >
              {showCreateForm ? 'Cancel' : 'Create Group'}
            </button>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-6 p-4 rounded-lg bg-red-500 bg-opacity-20 border border-red-500 border-opacity-30">
            <p className="text-red-200">{error}</p>
          </div>
        )}

        {/* Create Group Form */}
        {showCreateForm && (
          <div className="mb-8 ridepool-card p-6">
            <h2 className="text-xl font-bold text-white mb-4">Create New Group</h2>
            <form onSubmit={handleCreateGroup} className="space-y-4">
              <div>
                <label htmlFor="groupName" className="block text-sm font-medium text-gray-300 mb-1">
                  Group Name *
                </label>
                <input
                  type="text"
                  id="groupName"
                  value={groupName}
                  onChange={(e) => setGroupName(e.target.value)}
                  className="ridepool-input w-full rounded-md py-2 px-3 focus:z-10 sm:text-sm"
                  placeholder="Enter group name"
                  required
                />
              </div>
              
              <div>
                <label htmlFor="groupDescription" className="block text-sm font-medium text-gray-300 mb-1">
                  Description
                </label>
                <textarea
                  id="groupDescription"
                  value={groupDescription}
                  onChange={(e) => setGroupDescription(e.target.value)}
                  className="ridepool-input w-full rounded-md py-2 px-3 focus:z-10 sm:text-sm"
                  placeholder="Describe your group (e.g., 'Students traveling from Main Gate to Academic Block')"
                  rows={3}
                />
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="groupType" className="block text-sm font-medium text-gray-300 mb-1">
                    Group Type
                  </label>
                  <select
                    id="groupType"
                    value={groupType}
                    onChange={(e) => setGroupType(e.target.value as any)}
                    className="ridepool-input w-full rounded-md py-2 px-3 focus:z-10 sm:text-sm"
                  >
                    <option value="public">Public</option>
                    <option value="private">Private</option>
                    <option value="password">Password Protected</option>
                  </select>
                </div>
                
                {groupType === 'password' && (
                  <div>
                    <label htmlFor="groupPassword" className="block text-sm font-medium text-gray-300 mb-1">
                      Password
                    </label>
                    <input
                      type="password"
                      id="groupPassword"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="ridepool-input w-full rounded-md py-2 px-3 focus:z-10 sm:text-sm"
                      placeholder="Enter group password"
                    />
                  </div>
                )}
              </div>
              
              <div className="flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setShowCreateForm(false)}
                  className="ridepool-btn ridepool-btn-secondary px-4 py-2 rounded-md text-sm font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="ridepool-btn ridepool-btn-primary px-4 py-2 rounded-md text-sm font-medium disabled:opacity-50"
                >
                  {loading ? 'Creating...' : 'Create Group'}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Groups List */}
        <div className="ridepool-card p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold text-white">Available Groups</h2>
            <button
              onClick={loadGroups}
              disabled={loading}
              className="text-purple-400 hover:text-purple-300 text-sm font-medium"
            >
              Refresh
            </button>
          </div>
          
          {loading && groups.length === 0 ? (
            <div className="flex justify-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
            </div>
          ) : groups.length === 0 ? (
            <div className="text-center py-12">
              <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
              <h3 className="mt-2 text-sm font-medium text-white">No groups found</h3>
              <p className="mt-1 text-sm text-gray-300">
                Get started by creating a new group.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {groups.map((group) => (
                <div 
                  key={group.guid} 
                  className="ridepool-card p-5 hover:bg-gray-700 hover:bg-opacity-30 transition-all duration-200 cursor-pointer"
                  onClick={() => goToGroupChat(group.guid)}
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="text-lg font-medium text-white">{group.name}</h3>
                      <p className="mt-1 text-sm text-gray-300 line-clamp-2">
                        {group.description || 'No description provided'}
                      </p>
                    </div>
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      group.type === 'public' 
                        ? 'bg-green-100 text-green-800' 
                        : group.type === 'private' 
                          ? 'bg-yellow-100 text-yellow-800' 
                          : 'bg-red-100 text-red-800'
                    }`}>
                      {group.type.charAt(0).toUpperCase() + group.type.slice(1)}
                    </span>
                  </div>
                  
                  <div className="mt-4 flex items-center justify-between">
                    <div className="flex items-center text-sm text-gray-400">
                      <svg className="flex-shrink-0 mr-1.5 h-5 w-5 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3zM6 8a2 2 0 11-4 0 2 2 0 014 0zM16 18v-3a5.972 5.972 0 00-.75-2.906A3.005 3.005 0 0119 15v3h-3zM4.75 12.094A5.973 5.973 0 004 15v3H1v-3a3 3 0 013.75-2.906z" />
                      </svg>
                      {group.memberCount} members
                    </div>
                    
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleJoinGroup(group);
                      }}
                      disabled={joiningGroupId === group.guid}
                      className="ridepool-btn ridepool-btn-primary px-3 py-1 rounded-md text-xs font-medium disabled:opacity-50"
                    >
                      {joiningGroupId === group.guid ? 'Joining...' : 'Join Group'}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default GroupsPage;