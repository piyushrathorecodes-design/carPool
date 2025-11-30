import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const RidePoolDashboard: React.FC = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    totalGroups: 0,
    activeRides: 0,
    savedMoney: 0,
    co2Saved: 0
  });
  const [recentGroups, setRecentGroups] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      
      // Fetch user groups
      const groupsResponse = await axios.get('/api/group/mygroups');
      
      // Fetch user profile for stats
      const profileResponse = await axios.get('/api/auth/me');
      
      // Mock stats data (in a real app, this would come from the backend)
      setStats({
        totalGroups: groupsResponse.data.data.length,
        activeRides: Math.floor(Math.random() * 10),
        savedMoney: Math.floor(Math.random() * 5000),
        co2Saved: Math.floor(Math.random() * 1000)
      });
      
      // Set recent groups
      setRecentGroups(groupsResponse.data.data.slice(0, 3));
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateGroup = () => {
    navigate('/find-pool');
  };

  const handleJoinGroup = () => {
    navigate('/find-pool');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 flex items-center justify-center">
        <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-purple-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white">Welcome to Ride Pool</h1>
          <p className="mt-2 text-gray-300">Save money, reduce emissions, and connect with fellow students</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="ridepool-card p-6 animate-fade-in">
            <div className="flex items-center">
              <div className="p-3 rounded-lg bg-purple-500 bg-opacity-20">
                <svg className="h-6 w-6 text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
              <div className="ml-4">
                <h3 className="text-sm font-medium text-gray-400">Total Groups</h3>
                <p className="text-2xl font-bold text-white">{stats.totalGroups}</p>
              </div>
            </div>
          </div>

          <div className="ridepool-card p-6 animate-fade-in">
            <div className="flex items-center">
              <div className="p-3 rounded-lg bg-blue-500 bg-opacity-20">
                <svg className="h-6 w-6 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
              </div>
              <div className="ml-4">
                <h3 className="text-sm font-medium text-gray-400">Active Rides</h3>
                <p className="text-2xl font-bold text-white">{stats.activeRides}</p>
              </div>
            </div>
          </div>

          <div className="ridepool-card p-6 animate-fade-in">
            <div className="flex items-center">
              <div className="p-3 rounded-lg bg-green-500 bg-opacity-20">
                <svg className="h-6 w-6 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div className="ml-4">
                <h3 className="text-sm font-medium text-gray-400">Saved Money</h3>
                <p className="text-2xl font-bold text-white">₹{stats.savedMoney}</p>
              </div>
            </div>
          </div>

          <div className="ridepool-card p-6 animate-fade-in">
            <div className="flex items-center">
              <div className="p-3 rounded-lg bg-teal-500 bg-opacity-20">
                <svg className="h-6 w-6 text-teal-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.871 4A17.926 17.926 0 003 12c0 2.874.673 5.59 1.871 8m14.13 0a17.926 17.926 0 001.87-8c0-2.874-.673-5.59-1.87-8M9 9h1.246a1 1 0 01.961.725l1.586 5.55a1 1 0 00.961.725H15m1-7h-.08a2 2 0 00-1.519.698L9.6 15.302A2 2 0 018.08 16H8" />
                </svg>
              </div>
              <div className="ml-4">
                <h3 className="text-sm font-medium text-gray-400">CO2 Saved (kg)</h3>
                <p className="text-2xl font-bold text-white">{stats.co2Saved}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column */}
          <div className="lg:col-span-2 space-y-8">
            {/* Quick Actions */}
            <div className="ridepool-card p-6">
              <h2 className="text-xl font-bold text-white mb-6">Quick Actions</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <button 
                  onClick={handleCreateGroup}
                  className="ridepool-btn ridepool-btn-primary py-4 px-6 rounded-xl flex flex-col items-center justify-center hover:scale-105 transition-transform"
                >
                  <svg className="h-8 w-8 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                  <span className="font-medium">Create Group</span>
                  <span className="text-sm text-purple-200 mt-1">Start a new ride pool</span>
                </button>
                
                <button 
                  onClick={handleJoinGroup}
                  className="ridepool-btn ridepool-btn-secondary py-4 px-6 rounded-xl flex flex-col items-center justify-center hover:scale-105 transition-transform"
                >
                  <svg className="h-8 w-8 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                  </svg>
                  <span className="font-medium">Join Group</span>
                  <span className="text-sm text-blue-200 mt-1">Find existing pools</span>
                </button>
              </div>
            </div>

            {/* Recent Activity */}
            <div className="ridepool-card p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-white">Recent Groups</h2>
                <button 
                  onClick={() => navigate('/my-groups')}
                  className="text-purple-400 hover:text-purple-300 text-sm font-medium"
                >
                  View All
                </button>
              </div>
              
              {recentGroups.length > 0 ? (
                <div className="space-y-4">
                  {recentGroups.map((group) => (
                    <div 
                      key={group._id} 
                      className="flex items-center p-4 bg-gray-800 bg-opacity-50 rounded-lg hover:bg-gray-700 hover:bg-opacity-50 transition-colors cursor-pointer"
                      onClick={() => navigate(`/group/${group._id}`)}
                    >
                      <div className="flex-shrink-0 w-12 h-12 rounded-full bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center">
                        <svg className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                        </svg>
                      </div>
                      <div className="ml-4 flex-1">
                        <h3 className="text-white font-medium">{group.groupName}</h3>
                        <p className="text-gray-400 text-sm">
                          {group.route.pickup.address.split(',')[0]} → {group.route.drop.address.split(',')[0]}
                        </p>
                      </div>
                      <div className="flex items-center">
                        <span className="ridepool-badge ridepool-badge-primary">
                          {group.members.length}/{group.seatCount}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <svg className="mx-auto h-12 w-12 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                  </svg>
                  <h3 className="mt-2 text-sm font-medium text-gray-300">No groups yet</h3>
                  <p className="mt-1 text-sm text-gray-500">Get started by creating your first group.</p>
                  <div className="mt-6">
                    <button
                      onClick={handleCreateGroup}
                      className="ridepool-btn ridepool-btn-primary px-4 py-2 rounded-lg"
                    >
                      Create Group
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Right Column */}
          <div className="space-y-8">
            {/* Upcoming Rides */}
            <div className="ridepool-card p-6">
              <h2 className="text-xl font-bold text-white mb-6">Upcoming Rides</h2>
              <div className="space-y-4">
                <div className="p-4 bg-gray-800 bg-opacity-50 rounded-lg">
                  <div className="flex justify-between">
                    <h3 className="font-medium text-white">Morning Ride</h3>
                    <span className="ridepool-badge ridepool-badge-success">Tomorrow</span>
                  </div>
                  <p className="text-gray-400 text-sm mt-1">8:00 AM • Main Gate → Academic Block</p>
                  <div className="flex items-center mt-3">
                    <div className="flex -space-x-2">
                      <div className="w-6 h-6 rounded-full bg-gradient-to-br from-purple-500 to-blue-500"></div>
                      <div className="w-6 h-6 rounded-full bg-gradient-to-br from-green-500 to-teal-500"></div>
                    </div>
                    <span className="text-xs text-gray-400 ml-2">2 members</span>
                  </div>
                </div>
                
                <div className="p-4 bg-gray-800 bg-opacity-50 rounded-lg">
                  <div className="flex justify-between">
                    <h3 className="font-medium text-white">Evening Ride</h3>
                    <span className="ridepool-badge ridepool-badge-warning">Fri, 5:30 PM</span>
                  </div>
                  <p className="text-gray-400 text-sm mt-1">5:30 PM • Academic Block → Main Gate</p>
                  <div className="flex items-center mt-3">
                    <div className="flex -space-x-2">
                      <div className="w-6 h-6 rounded-full bg-gradient-to-br from-purple-500 to-blue-500"></div>
                      <div className="w-6 h-6 rounded-full bg-gradient-to-br from-green-500 to-teal-500"></div>
                      <div className="w-6 h-6 rounded-full bg-gradient-to-br from-yellow-500 to-orange-500"></div>
                    </div>
                    <span className="text-xs text-gray-400 ml-2">3 members</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Environmental Impact */}
            <div className="ridepool-card p-6">
              <h2 className="text-xl font-bold text-white mb-6">Your Impact</h2>
              <div className="text-center py-4">
                <div className="relative inline-flex items-center justify-center w-24 h-24">
                  <svg className="w-24 h-24 transform -rotate-90" viewBox="0 0 100 100">
                    <circle cx="50" cy="50" r="45" fill="none" stroke="#374151" strokeWidth="8" />
                    <circle 
                      cx="50" 
                      cy="50" 
                      r="45" 
                      fill="none" 
                      stroke="url(#gradient)" 
                      strokeWidth="8" 
                      strokeLinecap="round"
                      strokeDasharray="283"
                      strokeDashoffset="70"
                    />
                    <defs>
                      <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                        <stop offset="0%" stopColor="#8B5CF6" />
                        <stop offset="100%" stopColor="#0EA5E9" />
                      </linearGradient>
                    </defs>
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className="text-2xl font-bold text-white">75%</span>
                    <span className="text-xs text-gray-400">Reduced</span>
                  </div>
                </div>
                <p className="mt-4 text-gray-300">You've reduced your carbon footprint by sharing rides</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RidePoolDashboard;