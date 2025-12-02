import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { groupAPI } from '../services/api.service';
import { useAuth } from '../contexts/AuthContext';
import MapInput from '../components/MapInput';

interface Group {
  _id: string;
  groupName: string;
  members: {
    user: {
      _id: string;
      name: string;
      email: string;
    };
    role: string;
  }[];
  route: {
    pickup: {
      address: string;
    };
    drop: {
      address: string;
    };
  };
  seatCount: number;
  status: string;
  description?: string;
  createdAt: string;
}

const GroupsPage: React.FC = () => {
  const [groups, setGroups] = useState<Group[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [groupName, setGroupName] = useState('');
  const [groupDescription, setGroupDescription] = useState('');
  const [pickupAddress, setPickupAddress] = useState('');
  const [dropAddress, setDropAddress] = useState('');
  const [pickupCoordinates, setPickupCoordinates] = useState<[number, number] | null>(null);
  const [dropCoordinates, setDropCoordinates] = useState<[number, number] | null>(null);
  const [preferredGender, setPreferredGender] = useState('Any');
  const [seatCount, setSeatCount] = useState(4);
  const [joiningGroupId, setJoiningGroupId] = useState<string | null>(null);
  const [showSearchForm, setShowSearchForm] = useState(true);
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [searching, setSearching] = useState(false);
  
  const { user } = useAuth();
  const navigate = useNavigate();

  // Load groups
  useEffect(() => {
    loadGroups();
  }, []);

  // Load groups from backend
  const loadGroups = async () => {
    try {
      setLoading(true);
      const response = await groupAPI.getAll();
      setGroups(response.data.data);
      setError(null);
    } catch (err: any) {
      console.error('Error loading groups:', err);
      setError('Failed to load groups');
    } finally {
      setLoading(false);
    }
  };

  // Search for matching groups
  const handleSearchGroups = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!pickupAddress.trim() || !dropAddress.trim()) {
      setError('Both pickup and drop addresses are required');
      return;
    }
    
    if (!pickupCoordinates || !dropCoordinates) {
      setError('Please select locations from the suggestions');
      return;
    }
    
    try {
      setSearching(true);
      
      // Search for matching groups
      const response = await groupAPI.match({
        pickupLocation: {
          address: pickupAddress,
          coordinates: pickupCoordinates
        },
        dropLocation: {
          address: dropAddress,
          coordinates: dropCoordinates
        },
        preferredGender
      });
      
      setSearchResults(response.data.data);
      setShowSearchForm(false); // Hide search form and show results
    } catch (err: any) {
      console.error('Error searching groups:', err);
      setError('Failed to search groups. Please try again.');
    } finally {
      setSearching(false);
    }
  };

  // Reset search and show search form again
  const resetSearch = () => {
    setSearchResults([]);
    setShowSearchForm(true);
    setShowCreateForm(false);
    setPickupAddress('');
    setDropAddress('');
    setPickupCoordinates(null);
    setDropCoordinates(null);
    setPreferredGender('Any');
  };

  // Create a new group
  const handleCreateGroup = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!groupName.trim()) {
      setError('Group name is required');
      return;
    }
    
    if (!pickupAddress.trim() || !dropAddress.trim()) {
      setError('Both pickup and drop addresses are required');
      return;
    }
    
    try {
      setLoading(true);
      
      // Create group in backend
      const response = await groupAPI.create({
        groupName,
        description: groupDescription,
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
        seatCount
      });
      
      // Navigate to the newly created group
      if (response.data.data._id) {
        navigate(`/group/${response.data.data._id}`);
        return;
      }
      
      // Refresh groups list
      await loadGroups();
      
      // Reset form
      setGroupName('');
      setGroupDescription('');
      setPickupAddress('');
      setDropAddress('');
      setPickupCoordinates(null);
      setDropCoordinates(null);
      setSeatCount(4);
      setShowCreateForm(false);
      
      // Show success message
      setError('Group created successfully!');
      
      // Clear success message after 3 seconds
      setTimeout(() => setError(null), 3000);
    } catch (err: any) {
      console.error('Error creating group:', err);
      setError('Failed to create group. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Join a group
  const handleJoinGroup = async (groupId: string) => {
    try {
      setJoiningGroupId(groupId);
      
      // Join group in backend
      await groupAPI.join(groupId);
      
      // Reload groups to reflect changes
      await loadGroups();
      
      // Navigate to group detail
      navigate(`/group/${groupId}`);
    } catch (err: any) {
      console.error('Error joining group:', err);
      const errorMessage = err.response?.data?.message || 'Failed to join group';
      
      if (err.response?.status === 400) {
        if (errorMessage.includes('already a member')) {
          setError('You are already a member of this group.');
        } else if (errorMessage.includes('full')) {
          setError('This group is full. Please try another group.');
        } else {
          setError(errorMessage);
        }
      } else if (err.response?.status === 404) {
        setError('Group not found.');
      } else if (err.response?.status === 401) {
        setError('You must be logged in to join a group.');
      } else {
        setError(`Failed to join group: ${errorMessage}`);
      }
      
      // Clear error after 3 seconds
      setTimeout(() => setError(null), 3000);
    } finally {
      setJoiningGroupId(null);
    }
  };

  // Navigate to group detail
  const goToGroupDetail = (groupId: string) => {
    navigate(`/group/${groupId}`);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-purple-50 to-indigo-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8 animate-fade-in">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Student Groups</h1>
              <p className="mt-2 text-gray-700">Connect with fellow students traveling on similar routes</p>
            </div>
            <div className="flex space-x-3">
              <button
                onClick={() => {
                  setShowSearchForm(true);
                  setShowCreateForm(false);
                }}
                className={`ridepool-btn px-6 py-3 rounded-lg font-semibold hover-lift ${showSearchForm && !showCreateForm ? 'ridepool-btn-primary' : 'ridepool-btn-secondary'}`}
              >
                Find Group
              </button>
              <button
                onClick={() => {
                  setShowCreateForm(!showCreateForm);
                  setShowSearchForm(false);
                }}
                className={`ridepool-btn px-6 py-3 rounded-lg font-semibold hover-lift ${showCreateForm ? 'ridepool-btn-primary' : 'ridepool-btn-secondary'}`}
              >
                {showCreateForm ? 'Cancel' : 'Create Group'}
              </button>
            </div>
          </div>
        </div>

        {/* Search Form */}
        {showSearchForm && (
          <div className="mb-8 ridepool-card p-6 animate-slideInTop">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Find Groups</h2>
            <form onSubmit={handleSearchGroups} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="searchPickupAddress" className="block text-sm font-medium text-gray-700 mb-1">
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
                  <label htmlFor="searchDropAddress" className="block text-sm font-medium text-gray-700 mb-1">
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
              
              <div>
                <label htmlFor="preferredGender" className="block text-sm font-medium text-gray-700 mb-1">
                  Gender Preference
                </label>
                <select
                  id="preferredGender"
                  value={preferredGender}
                  onChange={(e) => setPreferredGender(e.target.value)}
                  className="ridepool-input w-full rounded-md py-2 px-3 focus:z-10 sm:text-sm"
                >
                  <option value="Any">Any</option>
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                </select>
              </div>
              
              <div className="flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={resetSearch}
                  className="ridepool-btn ridepool-btn-secondary px-4 py-2 rounded-md text-sm font-medium"
                >
                  Reset
                </button>
                <button
                  type="submit"
                  disabled={searching}
                  className="ridepool-btn ridepool-btn-primary px-4 py-2 rounded-md text-sm font-medium disabled:opacity-50"
                >
                  {searching ? 'Searching...' : 'Search Groups'}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="mb-6 p-4 rounded-lg bg-red-500 bg-opacity-20 border border-red-500 border-opacity-30 animate-shake">
            <p className="text-red-700">{error}</p>
          </div>
        )}

        {/* Create Group Form */}
        {showCreateForm && (
          <div className="mb-8 ridepool-card p-6 animate-slideInTop">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Create New Group</h2>
            <form onSubmit={handleCreateGroup} className="space-y-4">
              <div>
                <label htmlFor="groupName" className="block text-sm font-medium text-gray-700 mb-1">
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
                <label htmlFor="groupDescription" className="block text-sm font-medium text-gray-700 mb-1">
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
                  <label htmlFor="pickupAddress" className="block text-sm font-medium text-gray-700 mb-1">
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
                  <label htmlFor="dropAddress" className="block text-sm font-medium text-gray-700 mb-1">
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
              
              <div>
                <label htmlFor="seatCount" className="block text-sm font-medium text-gray-700 mb-1">
                  Number of Seats
                </label>
                <select
                  id="seatCount"
                  value={seatCount}
                  onChange={(e) => setSeatCount(parseInt(e.target.value))}
                  className="ridepool-input w-full rounded-md py-2 px-3 focus:z-10 sm:text-sm"
                >
                  <option value={2}>2 seats</option>
                  <option value={3}>3 seats</option>
                  <option value={4}>4 seats</option>
                </select>
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

        {/* Search Results */}
        {!showSearchForm && searchResults.length > 0 && (
          <div className="mb-8 ridepool-card p-6 animate-fade-in">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-gray-900">Matching Groups ({searchResults.length})</h2>
              <button
                onClick={resetSearch}
                className="ridepool-btn ridepool-btn-secondary px-4 py-2 rounded-md text-sm font-medium"
              >
                New Search
              </button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {searchResults.map((group) => (
                <div 
                  key={group._id} 
                  className="ridepool-card p-5 hover:bg-white hover:bg-opacity-70 transition-all duration-200 cursor-pointer animate-slideInLeft"
                  onClick={() => goToGroupDetail(group._id)}
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="text-lg font-medium text-gray-900">{group.groupName}</h3>
                      <p className="mt-1 text-sm text-gray-700 line-clamp-2">
                        {group.description || 'No description provided'}
                      </p>
                    </div>
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                      {Math.round(group.matchScore)}% match
                    </span>
                  </div>
                  
                  <div className="mt-3 text-sm text-gray-600">
                    <div className="flex items-center">
                      <svg className="flex-shrink-0 mr-1.5 h-4 w-4 text-gray-500" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                      </svg>
                      {group.route.pickup.address} → {group.route.drop.address}
                    </div>
                    <div className="flex items-center mt-1">
                      <svg className="flex-shrink-0 mr-1.5 h-4 w-4 text-gray-500" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                        <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" />
                      </svg>
                      {Math.round(group.distanceSimilarity.pickup/1000)}km pickup, {Math.round(group.distanceSimilarity.drop/1000)}km drop
                    </div>
                  </div>
                  
                  <div className="mt-4 flex items-center justify-between">
                    <div className="flex items-center text-sm text-gray-600">
                      <svg className="flex-shrink-0 mr-1.5 h-5 w-5 text-gray-500" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3zM6 8a2 2 0 11-4 0 2 2 0 014 0zM16 18v-3a5.972 5.972 0 00-.75-2.906A3.005 3.005 0 0119 15v3h-3zM4.75 12.094A5.973 5.973 0 004 15v3H1v-3a3 3 0 013.75-2.906z" />
                      </svg>
                      {group.members.length}/{group.seatCount} seats
                    </div>
                    
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleJoinGroup(group._id);
                      }}
                      disabled={joiningGroupId === group._id}
                      className="ridepool-btn ridepool-btn-primary px-3 py-1 rounded-md text-xs font-medium disabled:opacity-50"
                    >
                      {joiningGroupId === group._id ? 'Joining...' : 'Join Group'}
                    </button>
                  </div>
                </div>
              ))}
            </div>
            
            <div className="mt-6 text-center">
              <p className="text-gray-700 mb-4">Didn't find what you're looking for?</p>
              <button
                onClick={() => {
                  setShowCreateForm(true);
                  setShowSearchForm(false); // Hide search form when creating
                }}
                className="ridepool-btn ridepool-btn-primary px-6 py-3 rounded-lg font-semibold"
              >
                Create New Group
              </button>
            </div>
          </div>
        )}
        
        {/* No Search Results */}
        {!showSearchForm && searchResults.length === 0 && !searching && (
          <div className="mb-8 ridepool-card p-6 animate-fade-in text-center">
            <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <h3 className="mt-2 text-sm font-medium text-gray-900">No matching groups found</h3>
            <p className="mt-1 text-sm text-gray-500">
              Be the first to create a group for this route!
            </p>
            <div className="mt-6">
              <button
                onClick={() => {
                  setShowCreateForm(true);
                  setShowSearchForm(false); // Hide search form when creating
                }}
                className="ridepool-btn ridepool-btn-primary inline-flex items-center px-4 py-2 rounded-md text-sm font-medium"
              >
                Create New Group
              </button>
              <button
                onClick={resetSearch}
                className="ml-3 ridepool-btn ridepool-btn-secondary inline-flex items-center px-4 py-2 rounded-md text-sm font-medium"
              >
                Search Again
              </button>
            </div>
          </div>
        )}

        {/* Groups List */}
        <div className="ridepool-card p-6 animate-fade-in">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold text-gray-900">Available Groups</h2>
            <button
              onClick={loadGroups}
              disabled={loading}
              className="text-purple-600 hover:text-purple-500 text-sm font-medium"
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
              <h3 className="mt-2 text-sm font-medium text-gray-700">No groups found</h3>
              <p className="mt-1 text-sm text-gray-500">
                Get started by creating a new group.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {groups.map((group) => (
                <div 
                  key={group._id} 
                  className="ridepool-card p-5 hover:bg-white hover:bg-opacity-70 transition-all duration-200 cursor-pointer animate-slideInLeft"
                  onClick={() => goToGroupDetail(group._id)}
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="text-lg font-medium text-gray-900">{group.groupName}</h3>
                      <p className="mt-1 text-sm text-gray-700 line-clamp-2">
                        {group.description || 'No description provided'}
                      </p>
                    </div>
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${{
                      'Open': 'bg-green-100 text-green-800',
                      'Locked': 'bg-yellow-100 text-yellow-800',
                      'Completed': 'bg-gray-100 text-gray-800'
                    }[group.status] || 'bg-gray-100 text-gray-800'}`}>
                      {group.status}
                    </span>
                  </div>
                  
                  <div className="mt-3 text-sm text-gray-600">
                    <div className="flex items-center">
                      <svg className="flex-shrink-0 mr-1.5 h-4 w-4 text-gray-500" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                      </svg>
                      {group.route.pickup.address} → {group.route.drop.address}
                    </div>
                  </div>
                  
                  <div className="mt-4 flex items-center justify-between">
                    <div className="flex items-center text-sm text-gray-600">
                      <svg className="flex-shrink-0 mr-1.5 h-5 w-5 text-gray-500" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3zM6 8a2 2 0 11-4 0 2 2 0 014 0zM16 18v-3a5.972 5.972 0 00-.75-2.906A3.005 3.005 0 0119 15v3h-3zM4.75 12.094A5.973 5.973 0 004 15v3H1v-3a3 3 0 013.75-2.906z" />
                      </svg>
                      {group.members.length}/{group.seatCount} seats
                    </div>
                    
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleJoinGroup(group._id);
                      }}
                      disabled={joiningGroupId === group._id}
                      className="ridepool-btn ridepool-btn-primary px-3 py-1 rounded-md text-xs font-medium disabled:opacity-50"
                    >
                      {joiningGroupId === group._id ? 'Joining...' : 'Join Group'}
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