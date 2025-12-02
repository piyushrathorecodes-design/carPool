import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../contexts/AuthContext';

const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [groups, setGroups] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchUserGroups();
  }, []);

  const fetchUserGroups = async () => {
    try {
      setLoading(true);
      const response = await axios.get('/api/group/mygroups');
      setGroups(response.data.data);
    } catch (error) {
      console.error('Error fetching groups:', error);
    } finally {
      setLoading(false);
    }
  };

  const getTotalGroups = () => {
    return groups.length;
  };

  const handleCreateGroup = () => {
    navigate('/groups');
  };

  const handleJoinGroup = () => {
    navigate('/groups');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-pink-50 via-purple-50 to-indigo-50 flex items-center justify-center">
        <div className="animate-pulse-glow w-16 h-16 rounded-full bg-gradient-to-r from-pink-500 to-purple-500 animate-heartbeat"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-purple-50 to-indigo-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Welcome Section */}
        <div className="mb-8 animate-fade-in">
          <h1 className="text-3xl font-bold text-gray-900">Welcome back, {user?.name}!</h1>
          <p className="mt-2 text-gray-700">
            You are part of {getTotalGroups()} group{getTotalGroups() !== 1 ? 's' : ''}.
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-1 lg:grid-cols-1 gap-6 mb-8">
          <div className="ridepool-card animate-slideInLeft">
            <div className="flex items-center p-6">
              <div className="p-3 rounded-lg bg-green-500 bg-opacity-20">
                <svg className="h-6 w-6 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
              <div className="ml-4">
                <h3 className="text-sm font-medium text-gray-700">Total Groups</h3>
                <p className="text-2xl font-bold text-gray-900">{getTotalGroups()}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="ridepool-card mb-8 animate-slideInRight">
          <h2 className="text-xl font-bold text-gray-900 mb-6">Quick Actions</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <button 
              onClick={handleCreateGroup}
              className="ridepool-btn ridepool-btn-primary py-4 px-6 rounded-xl flex flex-col items-center justify-center hover:scale-105 transition-transform"
            >
              <svg className="h-8 w-8 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              <span className="font-medium">Create Group</span>
              <span className="text-sm text-white mt-1">Start a new ride pool</span>
            </button>
            
            <button 
              onClick={handleJoinGroup}
              className="ridepool-btn ridepool-btn-secondary py-4 px-6 rounded-xl flex flex-col items-center justify-center hover:scale-105 transition-transform"
            >
              <svg className="h-8 w-8 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
              </svg>
              <span className="font-medium">Join Group</span>
              <span className="text-sm text-white mt-1">Find & join existing pools</span>
            </button>
          </div>
        </div>

        {/* Recent Groups */}
        <div className="ridepool-card animate-fade-in">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-gray-900">Your Groups</h2>
            <button 
              onClick={() => navigate('/groups')}
              className="text-purple-600 hover:text-purple-500 text-sm font-medium"
            >
              View All
            </button>
          </div>
          
          {groups.length > 0 ? (
            <div className="space-y-4">
              {groups.slice(0, 3).map((group) => (
                <div 
                  key={group._id} 
                  className="flex items-center p-4 bg-white bg-opacity-50 rounded-lg hover:bg-white hover:bg-opacity-70 transition-colors cursor-pointer ridepool-card"
                  onClick={() => navigate(`/group/${group._id}`)}
                >
                  <div className="flex-shrink-0 w-12 h-12 rounded-full bg-gradient-to-br from-pink-500 to-purple-500 flex items-center justify-center">
                    <svg className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                  </div>
                  <div className="ml-4 flex-1">
                    <h3 className="text-gray-900 font-medium">{group.groupName}</h3>
                    <p className="text-gray-700 text-sm">
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
              <h3 className="mt-2 text-sm font-medium text-gray-700">No groups yet</h3>
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
    </div>
  );
};

export default Dashboard;