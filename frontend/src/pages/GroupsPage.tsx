// Fixed GroupsPage.tsx with working group creation

import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { groupAPI } from '../services/api.service';
import MapInput from '../components/MapInput';

interface GroupMember {
  user: {
    _id: string;
    name: string;
    year?: string;
    branch?: string;
  };
  role: string;
}

interface Group {
  _id: string;
  groupName: string;
  members: GroupMember[];
  route: {
    pickup: { address: string };
    drop: { address: string };
  };
  seatCount: number;
  status: string;
  description?: string;
  dateTime: string;
  createdAt: string;
  isMember?: boolean;
  canJoin?: boolean;
}

const GroupsPage: React.FC = () => {
  const [groups, setGroups] = useState<Group[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [viewMode, setViewMode] = useState<'all' | 'my'>('all'); // Toggle between all groups and my groups
  
  // Form states
  const [groupName, setGroupName] = useState('');
  const [groupDescription, setGroupDescription] = useState('');
  const [pickupAddress, setPickupAddress] = useState('');
  const [dropAddress, setDropAddress] = useState('');
  const [pickupCoordinates, setPickupCoordinates] = useState<[number, number] | null>(null);
  const [dropCoordinates, setDropCoordinates] = useState<[number, number] | null>(null);
  const [groupDate, setGroupDate] = useState('');
  const [groupTime, setGroupTime] = useState('08:00');
  const [seatCount, setSeatCount] = useState(4);
  const [joiningGroupId, setJoiningGroupId] = useState<string | null>(null);
  const [creatingGroup, setCreatingGroup] = useState(false);
  
  const navigate = useNavigate();
  const location = useLocation();
  
  // Handle incoming data from FindPool page
  useEffect(() => {
    const state: any = location.state;
    if (state && state.fromFindPool) {
      setShowCreateForm(true);
      
      // Pre-fill form data if available
      if (state.formData) {
        const { pickup, drop } = state.formData;
        setPickupAddress(pickup);
        setDropAddress(drop);
      }
      
      // Pre-fill search data if available
      if (state.searchData) {
        const { pickupLocation, dropLocation } = state.searchData;
        if (pickupLocation && pickupLocation.coordinates) {
          setPickupCoordinates(pickupLocation.coordinates);
        }
        if (dropLocation && dropLocation.coordinates) {
          setDropCoordinates(dropLocation.coordinates);
        }
        
        // Set date and time if available
        if (state.searchData.dateTime) {
          const dateTime = new Date(state.searchData.dateTime);
          setGroupDate(dateTime.toISOString().split('T')[0]);
          setGroupTime(
            dateTime.getHours().toString().padStart(2, '0') + 
            ':' + 
            dateTime.getMinutes().toString().padStart(2, '0')
          );
        }
      }
      
      // Clear the location state
      window.history.replaceState({}, document.title, location.pathname);
    }
  }, [location.state]);

  useEffect(() => {
    loadGroups();
  }, [viewMode]);

  const loadGroups = async () => {
    try {
      setLoading(true);
      const response = viewMode === 'all' 
        ? await groupAPI.getAll() 
        : await groupAPI.getMyGroups();
      setGroups(response.data.data);
      setError(null);
    } catch (err: any) {
      console.error('Error loading groups:', err);
      setError('Failed to load groups');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateGroup = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate form
    if (!groupName.trim()) {
      setError('Group name is required');
      return;
    }
    
    if (!pickupAddress.trim() || !dropAddress.trim()) {
      setError('Both pickup and drop addresses are required');
      return;
    }
    
    if (!pickupCoordinates || !dropCoordinates) {
      setError('Please select locations from the suggestions');
      return;
    }
    
    if (!groupDate) {
      setError('Date is required');
      return;
    }
    
    try {
      setCreatingGroup(true);
      setError(null);
      
      // Combine date and time
      const dateTime = `${groupDate}T${groupTime}:00`;
      
      // Create group payload
      const groupData = {
        groupName: groupName.trim(),
        description: groupDescription.trim(),
        route: {
          pickup: {
            address: pickupAddress,
            coordinates: pickupCoordinates
          },
          drop: {
            address: dropAddress,
            coordinates: dropCoordinates
          }
        },
        dateTime: dateTime,
        seatCount: seatCount
      };
      
      console.log('Creating group with data:', groupData);
      
      // Call API
      const response = await groupAPI.create(groupData);
      
      console.log('Group created successfully:', response.data);
      
      // Navigate to the newly created group
      if (response.data.data && response.data.data._id) {
        navigate(`/group/${response.data.data._id}`);
        return;
      }
      
      // If navigation didn't happen, reload groups and close form
      await loadGroups();
      resetForm();
      setShowCreateForm(false);
      
    } catch (err: any) {
      console.error('Error creating group:', err);
      console.error('Error response:', err.response?.data);
      setError(err.response?.data?.message || 'Failed to create group. Please try again.');
    } finally {
      setCreatingGroup(false);
    }
  };

  const resetForm = () => {
    setGroupName('');
    setGroupDescription('');
    setPickupAddress('');
    setDropAddress('');
    setPickupCoordinates(null);
    setDropCoordinates(null);
    setGroupDate('');
    setGroupTime('08:00');
    setSeatCount(4);
  };

  const handleJoinGroup = async (groupId: string) => {
    try {
      setJoiningGroupId(groupId);
      await groupAPI.join(groupId);
      navigate(`/group/${groupId}`);
    } catch (err: any) {
      console.error('Error joining group:', err);
      const errorMessage = err.response?.data?.message || 'Failed to join group';
      setError(errorMessage);
      setTimeout(() => setError(null), 3000);
    } finally {
      setJoiningGroupId(null);
    }
  };

  const goToGroupDetail = (groupId: string) => {
    navigate(`/group/${groupId}`);
  };

  if (loading && groups.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-pink-50 via-purple-50 to-indigo-50 flex items-center justify-center">
        <div className="spinner w-16 h-16"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-purple-50 to-indigo-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8 animate-fadeIn">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Student Groups</h1>
              <p className="mt-2 text-gray-700">{viewMode === 'all' ? 'Connect with fellow students traveling on similar routes' : 'Your groups'}</p>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => {
                  setViewMode('all');
                }}
                className={`px-4 py-2 rounded-lg font-medium ${viewMode === 'all' ? 'ridepool-btn ridepool-btn-primary' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}
              >
                All Groups
              </button>
              <button
                onClick={() => {
                  setViewMode('my');
                }}
                className={`px-4 py-2 rounded-lg font-medium ${viewMode === 'my' ? 'ridepool-btn ridepool-btn-primary' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}
              >
                My Groups
              </button>
              <button
                onClick={() => {
                  setShowCreateForm(!showCreateForm);
                  setError(null);
                  if (!showCreateForm) resetForm();
                }}
                className="ridepool-btn ridepool-btn-primary"
              >
                {showCreateForm ? (
                  <>
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                    Cancel
                  </>
                ) : (
                  <>
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                    Create Group
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-500 rounded-lg animate-slideInLeft">
            <div className="flex items-start">
              <svg className="w-5 h-5 text-red-500 mt-0.5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
              <p className="text-sm text-red-700">{error}</p>
            </div>
          </div>
        )}

        {/* Create Group Form */}
        {showCreateForm && (
          <div className="mb-8 ridepool-card p-6 animate-slideInTop">
            <h2 className="text-xl font-bold text-gray-900 mb-6">Create New Group</h2>
            <form onSubmit={handleCreateGroup} className="space-y-6">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Group Name *
                </label>
                <input
                  type="text"
                  value={groupName}
                  onChange={(e) => setGroupName(e.target.value)}
                  className="ridepool-input"
                  placeholder="e.g., Morning Campus Commute"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Description (Optional)
                </label>
                <textarea
                  value={groupDescription}
                  onChange={(e) => setGroupDescription(e.target.value)}
                  className="ridepool-input resize-none"
                  placeholder="Describe your group..."
                  rows={3}
                />
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Pickup Location *
                  </label>
                  <MapInput
                    onLocationSelect={(location) => {
                      setPickupAddress(location.address);
                      setPickupCoordinates(location.coordinates);
                    }}
                    placeholder="Enter pickup location"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Drop Location *
                  </label>
                  <MapInput
                    onLocationSelect={(location) => {
                      setDropAddress(location.address);
                      setDropCoordinates(location.coordinates);
                    }}
                    placeholder="Enter drop location"
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Date *
                  </label>
                  <input
                    type="date"
                    value={groupDate}
                    onChange={(e) => setGroupDate(e.target.value)}
                    className="ridepool-input"
                    required
                    min={new Date().toISOString().split('T')[0]}
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Time *
                  </label>
                  <input
                    type="time"
                    value={groupTime}
                    onChange={(e) => setGroupTime(e.target.value)}
                    className="ridepool-input"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Seats
                  </label>
                  <select
                    value={seatCount}
                    onChange={(e) => setSeatCount(parseInt(e.target.value))}
                    className="ridepool-input"
                  >
                    <option value={2}>2 seats</option>
                    <option value={3}>3 seats</option>
                    <option value={4}>4 seats</option>
                  </select>
                </div>
              </div>
              
              <div className="flex justify-end gap-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowCreateForm(false);
                    resetForm();
                  }}
                  className="ridepool-btn bg-gray-200 text-gray-700 hover:bg-gray-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={creatingGroup}
                  className="ridepool-btn ridepool-btn-primary"
                >
                  {creatingGroup ? (
                    <>
                      <div className="spinner w-5 h-5 border-2"></div>
                      Creating...
                    </>
                  ) : (
                    <>
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      Create Group
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Groups List */}
        <div className="ridepool-card p-6 animate-fadeIn">
          <h2 className="text-xl font-bold text-gray-900 mb-6">{viewMode === 'all' ? 'Available Groups' : 'My Groups'}</h2>
          
          {loading ? (
            <div className="flex justify-center py-12">
              <div className="spinner w-12 h-12"></div>
            </div>
          ) : groups.length === 0 ? (
            <div className="text-center py-12">
              <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
              <h3 className="mt-2 text-sm font-medium text-gray-700">No groups found</h3>
              <p className="mt-1 text-sm text-gray-500">
                Be the first to create a group!
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {groups.map((group) => (
                <div 
                  key={group._id} 
                  className="ridepool-card p-5 cursor-pointer animate-slideInLeft"
                  onClick={() => goToGroupDetail(group._id)}
                >
                  <div className="flex justify-between items-start mb-4">
                    <h3 className="text-lg font-bold text-gray-900">{group.groupName}</h3>
                    <span className={`ridepool-badge ${
                      group.status === 'Open' ? 'bg-green-100 text-green-800' :
                      group.status === 'Locked' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {group.status}
                    </span>
                  </div>
                  
                  <div className="space-y-2 text-sm text-gray-600 mb-4">
                    <div className="flex items-start">
                      <svg className="w-4 h-4 mr-2 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                      </svg>
                      <span className="line-clamp-1">{group.route.pickup.address}</span>
                    </div>
                    <div className="flex items-start">
                      <svg className="w-4 h-4 mr-2 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                      </svg>
                      <span className="line-clamp-1">{group.route.drop.address}</span>
                    </div>
                    <div className="flex items-center">
                      <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                      </svg>
                      {new Date(group.dateTime).toLocaleString()}
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between pt-4 border-t">
                    <div className="flex items-center text-sm text-gray-600">
                      <svg className="w-5 h-5 mr-1" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3zM6 8a2 2 0 11-4 0 2 2 0 014 0zM16 18v-3a5.972 5.972 0 00-.75-2.906A3.005 3.005 0 0119 15v3h-3zM4.75 12.094A5.973 5.973 0 004 15v3H1v-3a3 3 0 013.75-2.906z" />
                      </svg>
                      {group.members.length}/{group.seatCount}
                    </div>
                    
                    {/* Member details with year and branch */}
                    <div className="flex -space-x-2">
                      {group.members.slice(0, 3).map((member) => (
                        <div 
                          key={member.user._id} 
                          className="relative group"
                          title={`${member.user.name}${member.user.year ? ` (${member.user.year})` : ''}${member.user.branch ? ` - ${member.user.branch}` : ''}`}
                        >
                          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-pink-500 to-purple-500 flex items-center justify-center text-white text-xs font-bold border-2 border-white">
                            {member.user.name.charAt(0)}
                          </div>
                          {member.user.year && (
                            <div className="absolute -bottom-6 left-1/2 transform -translate-x-1/2 bg-gray-800 text-white text-xs rounded py-1 px-2 whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-200 z-10">
                              <div className="text-center">
                                <div className="font-medium">{member.user.name}</div>
                                <div>{member.user.year}{member.user.branch ? ` • ${member.user.branch}` : ''}</div>
                              </div>
                              <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-1 w-2 h-2 bg-gray-800 rotate-45"></div>
                            </div>
                          )}
                        </div>
                      ))}
                      {group.members.length > 3 && (
                        <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center text-gray-600 text-xs font-bold border-2 border-white">
                          +{group.members.length - 3}
                        </div>
                      )}
                    </div>
                    
                    {viewMode === 'all' && (
                      group.isMember ? (
                        <span className="text-sm text-green-600 font-medium">Member</span>
                      ) : group.canJoin ? (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleJoinGroup(group._id);
                          }}
                          disabled={joiningGroupId === group._id}
                          className="ridepool-btn ridepool-btn-primary text-sm px-4 py-2"
                        >
                          {joiningGroupId === group._id ? 'Joining...' : 'Join'}
                        </button>
                      ) : (
                        <span className="text-sm text-gray-500">
                          {group.status === 'Locked' ? 'Locked' : 'Full'}
                        </span>
                      )
                    )}
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