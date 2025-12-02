// frontend/src/pages/Dashboard.tsx
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { groupAPI } from '../services/api.service';

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

  // Calculate total groups
  const getTotalGroups = () => myGroups.length;

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
          <p className="mt-1 text-sm text-gray-300">You are part of {getTotalGroups()} group{getTotalGroups() !== 1 ? 's' : ''}.</p>
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
          {/* Main content - Only showing total groups */}
          <div className="lg:col-span-2 space-y-6">
            {/* Stats - Only showing total groups */}
            <div className="grid grid-cols-1 md:grid-cols-1 gap-4">
              <div className="ridepool-card hover-lift">
                <div className="px-4 py-5 sm:p-6">
                  <div className="flex items-center">
                    <div className="flex-shrink-0 bg-gradient-to-br from-purple-500 to-blue-500 rounded-md p-3">
                      <svg className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                      </svg>
                    </div>
                    <div className="ml-4">
                      <dt className="text-sm font-medium text-gray-300 truncate">Total Groups</dt>
                      <dd className="text-lg font-medium text-white">{getTotalGroups()}</dd>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          {/* Sidebar - Quick Actions */}
          <div className="space-y-6">
            {/* Quick actions */}
            <div className="ridepool-card">
              <div className="px-4 py-5 sm:px-6 border-b border-gray-700">
                <h3 className="text-lg leading-6 font-medium text-white">Quick Actions</h3>
              </div>
              <div className="border-t border-gray-700">
                <nav className="space-y-1">
                  <Link 
                    to="/groups" 
                    className="flex items-center px-4 py-3 text-sm font-medium text-gray-300 hover:bg-gray-700 hover:bg-opacity-50 hover:text-white transition-colors duration-200 rounded-md"
                  >
                    <svg className="mr-3 h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                    View All Groups
                  </Link>
                  
                  <Link 
                    to="/create-group" 
                    className="flex items-center px-4 py-3 text-sm font-medium text-gray-300 hover:bg-gray-700 hover:bg-opacity-50 hover:text-white transition-colors duration-200 rounded-md"
                  >
                    <svg className="mr-3 h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                    </svg>
                    Create Group
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