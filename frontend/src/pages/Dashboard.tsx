// frontend/src/pages/Dashboard.tsx
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { poolAPI, groupAPI } from '../services/api.service';

interface Pool {
  _id: string;
  pickupLocation: { address: string };
  dropLocation: { address: string };
  dateTime: string;
  status: string;
  matchedUsers: any[];
}

interface Group {
  _id: string;
  groupName: string;
  route: {
    pickup: { address: string };
    drop: { address: string };
  };
  members: any[];
  status: string;
}

const Dashboard: React.FC = () => {
  const { user } = useAuth();
  const [upcomingPools, setUpcomingPools] = useState<any[]>([]);
  const [myGroups, setMyGroups] = useState<Group[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError('');

      // Fetch user's pool requests
      const poolsResponse = await poolAPI.getAll();
      const pools = poolsResponse.data.data as Pool[];
      
      // Filter for upcoming pools (future dates only)
      const now = new Date();
      const upcoming = pools
        .filter((pool: Pool) => new Date(pool.dateTime) > now)
        .sort((a: Pool, b: Pool) => 
          new Date(a.dateTime).getTime() - new Date(b.dateTime).getTime()
        )
        .slice(0, 5); // Show only next 5

      // Transform for display
      const transformedPools = upcoming.map((pool: Pool) => ({
        id: pool._id,
        pickup: pool.pickupLocation.address,
        drop: pool.dropLocation.address,
        date: new Date(pool.dateTime).toLocaleDateString(),
        time: new Date(pool.dateTime).toLocaleTimeString([], { 
          hour: '2-digit', 
          minute: '2-digit' 
        }),
        members: pool.matchedUsers ? pool.matchedUsers.length + 1 : 1,
        status: pool.status
      }));

      setUpcomingPools(transformedPools);

      // Fetch user's groups
      const groupsResponse = await groupAPI.getMyGroups();
      setMyGroups(groupsResponse.data.data);

    } catch (err: any) {
      console.error('Error fetching dashboard data:', err);
      setError(err.response?.data?.message || 'Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const getTotalPools = () => myGroups.length;
  const getTotalMembers = () => {
    return myGroups.reduce((total, group) => total + group.members.length, 0);
  };
  const getEstimatedSavings = () => {
    // Rough calculation: assume ₹100 per trip, 75% savings
    return myGroups.length * 100 * 0.75;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 flex items-center justify-center">
        <div className="flex flex-col items-center">
          <div className="animate-pulse-glow w-16 h-16 rounded-full bg-gradient-to-r from-purple-500 to-blue-500"></div>
          <p className="mt-4 text-gray-300 animate-fade-in">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-white">Welcome back, {user?.name}!</h1>
          <p className="mt-1 text-sm text-gray-300">Here's what's happening with your cab pools today.</p>
        </div>

        {error && (
          <div className="mb-6 rounded-md bg-red-500 bg-opacity-20 p-4 border border-red-500 border-opacity-30">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm text-red-300">{error}</p>
              </div>
            </div>
          </div>
        )}
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="ridepool-card hover-lift">
                <div className="px-4 py-5 sm:p-6">
                  <div className="flex items-center">
                    <div className="flex-shrink-0 bg-gradient-to-br from-purple-500 to-blue-500 rounded-md p-3">
                      <svg className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                      </svg>
                    </div>
                    <div className="ml-4">
                      <dt className="text-sm font-medium text-gray-300 truncate">Total Pools</dt>
                      <dd className="text-lg font-medium text-white">{getTotalPools()}</dd>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="ridepool-card hover-lift">
                <div className="px-4 py-5 sm:p-6">
                  <div className="flex items-center">
                    <div className="flex-shrink-0 bg-gradient-to-br from-green-500 to-teal-500 rounded-md p-3">
                      <svg className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                      </svg>
                    </div>
                    <div className="ml-4">
                      <dt className="text-sm font-medium text-gray-300 truncate">Connections</dt>
                      <dd className="text-lg font-medium text-white">{getTotalMembers()}</dd>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="ridepool-card hover-lift">
                <div className="px-4 py-5 sm:p-6">
                  <div className="flex items-center">
                    <div className="flex-shrink-0 bg-gradient-to-br from-yellow-500 to-orange-500 rounded-md p-3">
                      <svg className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <div className="ml-4">
                      <dt className="text-sm font-medium text-gray-300 truncate">Est. Saved</dt>
                      <dd className="text-lg font-medium text-white">₹{getEstimatedSavings()}</dd>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Upcoming pools */}
            <div className="ridepool-card">
              <div className="px-4 py-5 sm:px-6 border-b border-gray-700">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg leading-6 font-medium text-white">Upcoming Pools</h3>
                  <Link 
                    to="/find-pool" 
                    className="ridepool-btn ridepool-btn-primary px-3 py-1 rounded-md text-sm font-medium"
                  >
                    Find Pool
                  </Link>
                </div>
              </div>
              <div className="border-t border-gray-700">
                {upcomingPools.length > 0 ? (
                  <ul className="divide-y divide-gray-700">
                    {upcomingPools.map((pool) => (
                      <li key={pool.id}>
                        <Link to={`/pool/${pool.id}`} className="block hover:bg-gray-700 hover:bg-opacity-50 transition-colors duration-200">
                          <div className="px-4 py-4 sm:px-6">
                            <div className="flex items-center justify-between">
                              <p className="text-sm font-medium text-purple-400 truncate">
                                {pool.pickup} → {pool.drop}
                              </p>
                              <div className="ml-2 flex-shrink-0 flex">
                                <p className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                  pool.status === 'Matched' 
                                    ? 'bg-green-500 bg-opacity-20 text-green-300' 
                                    : pool.status === 'Open'
                                    ? 'bg-yellow-500 bg-opacity-20 text-yellow-300'
                                    : 'bg-gray-500 bg-opacity-20 text-gray-300'
                                }`}>
                                  {pool.status}
                                </p>
                              </div>
                            </div>
                            <div className="mt-2 sm:flex sm:justify-between">
                              <div className="sm:flex">
                                <p className="flex items-center text-sm text-gray-300">
                                  <svg className="flex-shrink-0 mr-1.5 h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                  </svg>
                                  {pool.date} at {pool.time}
                                </p>
                              </div>
                              <div className="mt-2 flex items-center text-sm text-gray-300 sm:mt-0">
                                <svg className="flex-shrink-0 mr-1.5 h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                                </svg>
                                {pool.members} members
                              </div>
                            </div>
                          </div>
                        </Link>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <div className="px-4 py-12 sm:p-6 text-center">
                    <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    <h3 className="mt-2 text-sm font-medium text-white">No upcoming pools</h3>
                    <p className="mt-1 text-sm text-gray-300">Get started by creating or finding a pool.</p>
                    <div className="mt-6">
                      <Link 
                        to="/find-pool" 
                        className="ridepool-btn ridepool-btn-primary inline-flex items-center px-4 py-2 rounded-md text-sm font-medium"
                      >
                        <svg className="-ml-1 mr-2 h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                        </svg>
                        Find Pool
                      </Link>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* My Groups */}
            <div className="ridepool-card">
              <div className="px-4 py-5 sm:px-6 border-b border-gray-700">
                <h3 className="text-lg leading-6 font-medium text-white">My Groups</h3>
              </div>
              <div className="border-t border-gray-700">
                {myGroups.length > 0 ? (
                  <ul className="divide-y divide-gray-700">
                    {myGroups.map((group) => (
                      <li key={group._id}>
                        <Link to={`/group/${group._id}`} className="block hover:bg-gray-700 hover:bg-opacity-50 transition-colors duration-200">
                          <div className="px-4 py-4 sm:px-6">
                            <div className="flex items-center justify-between">
                              <p className="text-sm font-medium text-purple-400">
                                {group.route.pickup.address} → {group.route.drop.address}
                              </p>
                              <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                group.status === 'Open' 
                                  ? 'bg-green-500 bg-opacity-20 text-green-300' 
                                  : group.status === 'Locked'
                                  ? 'bg-yellow-500 bg-opacity-20 text-yellow-300'
                                  : 'bg-gray-500 bg-opacity-20 text-gray-300'
                              }`}>
                                {group.status}
                              </span>
                            </div>
                            <p className="mt-2 text-sm text-gray-300">
                              {group.members.length} members
                            </p>
                          </div>
                        </Link>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <div className="px-4 py-12 text-center">
                    <p className="text-sm text-gray-300">No groups yet. Join a pool to get started!</p>
                  </div>
                )}
              </div>
            </div>
          </div>
          
          {/* Sidebar */}
          <div className="space-y-6">
            {/* Quick actions */}
            <div className="ridepool-card">
              <div className="px-4 py-5 sm:px-6 border-b border-gray-700">
                <h3 className="text-lg leading-6 font-medium text-white">Quick Actions</h3>
              </div>
              <div className="border-t border-gray-700">
                <nav className="space-y-1">
                  <Link 
                    to="/find-pool" 
                    className="flex items-center px-4 py-3 text-sm font-medium text-gray-300 hover:bg-gray-700 hover:bg-opacity-50 hover:text-white transition-colors duration-200 rounded-md"
                  >
                    <svg className="mr-3 h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                    Find Pool
                  </Link>
                  
                  <Link 
                    to="/profile" 
                    className="flex items-center px-4 py-3 text-sm font-medium text-gray-300 hover:bg-gray-700 hover:bg-opacity-50 hover:text-white transition-colors duration-200 rounded-md"
                  >
                    <svg className="mr-3 h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                    My Profile
                  </Link>
                  
                  <button 
                    onClick={fetchDashboardData}
                    className="w-full flex items-center px-4 py-3 text-sm font-medium text-gray-300 hover:bg-gray-700 hover:bg-opacity-50 hover:text-white transition-colors duration-200 rounded-md"
                  >
                    <svg className="mr-3 h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                    </svg>
                    Refresh Data
                  </button>
                </nav>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;