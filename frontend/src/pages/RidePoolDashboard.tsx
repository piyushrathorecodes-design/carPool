import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const RidePoolDashboard: React.FC = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    totalGroups: 0
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
      
      // Mock stats data (in a real app, this would come from the backend)
      setStats({
        totalGroups: groupsResponse.data.data.length
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

        {/* Stats Cards - Only showing Total Groups */}
        <div className="grid grid-cols-1 md:grid-cols-1 lg:grid-cols-1 gap-6 mb-8">
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
        </div>

        {/* Environmental Impact Message */}
        <div className="ridepool-card p-6 mb-8">
          <div className="flex items-start">
            <div className="flex-shrink-0">
              <div className="p-3 rounded-lg bg-green-500 bg-opacity-20">
                <svg className="h-6 w-6 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                </svg>
              </div>
            </div>
            <div className="ml-4">
              <h3 className="text-lg font-bold text-white">Share Rides, Save the Environment</h3>
              <p className="mt-2 text-gray-300">
                Every cab share makes a difference. By choosing to ride together, you're reducing carbon emissions, 
                decreasing traffic congestion, and helping create a cleaner, greener campus for everyone.
              </p>
              <div className="mt-4 p-4 bg-gray-800 bg-opacity-50 rounded-lg">
                <p className="text-sm text-green-400">
                  <span className="font-bold">Did you know?</span> A single shared cab can reduce CO2 emissions by up to 75% 
                  compared to individual rides. Keep sharing to make an even bigger impact!
                </p>
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
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
                
                <button 
                  onClick={() => navigate('/groups')}
                  className="ridepool-btn ridepool-btn-tertiary py-4 px-6 rounded-xl flex flex-col items-center justify-center hover:scale-105 transition-transform"
                >
                  <svg className="h-8 w-8 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                  <span className="font-medium">All Groups</span>
                  <span className="text-sm text-green-200 mt-1">Browse all groups</span>
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
          </div>
        </div>
      </div>
    </div>
  );
};

export default RidePoolDashboard;