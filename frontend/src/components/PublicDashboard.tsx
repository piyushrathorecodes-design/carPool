import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const PublicDashboard: React.FC = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    totalGroups: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPublicStats();
  }, []);

  const fetchPublicStats = async () => {
    try {
      setLoading(true);
      
      // In a real app, this would fetch public stats from the backend
      // For now, we'll use mock data
      setStats({
        totalGroups: 1247 // Mock data
      });
    } catch (error) {
      console.error('Error fetching public stats:', error);
      // Still show some mock data even if the request fails
      setStats({
        totalGroups: 1200
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSignIn = () => {
    navigate('/login');
  };

  const handleSignUp = () => {
    navigate('/register');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-pink-50 to-blue-50">
        <div className="animate-pulse-glow w-16 h-16 rounded-full bg-gradient-to-r from-pink-500 to-purple-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-10 bg-gradient-to-br from-pink-50 to-blue-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-12 text-center">
          <h1 className="text-4xl font-bold text-gray-900">Welcome to RideBuddy</h1>
          <p className="mt-4 text-xl text-gray-700">Save money, reduce emissions, and connect with fellow students</p>
        </div>

        {/* Stats Cards - Only showing Total Groups */}
        <div className="grid grid-cols-1 md:grid-cols-1 lg:grid-cols-1 gap-6 mb-12">
          <div className="ridepool-card p-8">
            <div className="flex items-center">
              <div className="p-4 rounded-lg bg-green-500 bg-opacity-20">
                <svg className="h-8 w-8 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
              <div className="ml-6">
                <h3 className="text-lg font-medium text-gray-400">Total Groups</h3>
                <p className="text-3xl font-bold text-gray-900 mt-1">{stats.totalGroups.toLocaleString()}+</p>
              </div>
            </div>
          </div>
        </div>

        {/* Environmental Impact Message */}
        <div className="ridepool-card mb-12 p-8">
          <div className="flex items-start">
            <div className="flex-shrink-0">
              <div className="p-4 rounded-lg bg-green-500 bg-opacity-20">
                <svg className="h-8 w-8 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                </svg>
              </div>
            </div>
            <div className="ml-6">
              <h3 className="text-2xl font-bold text-gray-900">Share Rides, Save the Environment</h3>
              <p className="mt-4 text-lg text-gray-700 leading-relaxed">
                Every cab share makes a difference. By choosing to ride together, you're reducing carbon emissions, 
                decreasing traffic congestion, and helping create a cleaner, greener campus for everyone.
              </p>
              <div className="mt-6 p-6 bg-gray-50 rounded-xl">
                <p className="text-lg text-green-600">
                  <span className="font-bold">Did you know?</span> A single shared cab can reduce CO2 emissions by up to 75% 
                  compared to individual rides. Keep sharing to make an even bigger impact!
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Platform Features Section */}
        <div className="mb-16">
          <div className="text-center mb-16 animate-fade-in">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
              Powerful Features for Campus Mobility
            </h2>
            <p className="text-xl text-gray-700 max-w-3xl mx-auto">
              Everything you need to make campus transportation smarter, cheaper, and more sustainable
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {/* Feature 1 */}
            <div className="ridepool-card text-center p-8 animate-slideInLeft">
              <div className="feature-icon mx-auto mb-6">
                👥
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-3">
                Smart Matching
              </h3>
              <p className="text-gray-700 leading-relaxed">
                Automatically connect with students traveling on similar routes and schedules
              </p>
            </div>

            {/* Feature 2 */}
            <div className="ridepool-card text-center p-8 animate-fade-in" style={{ animationDelay: '0.2s' }}>
              <div className="feature-icon mx-auto mb-6">
                💬
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-3">
                Real-time Chat
              </h3>
              <p className="text-gray-700 leading-relaxed">
                Communicate instantly with group members to coordinate pickup times and locations
              </p>
            </div>

            {/* Feature 3 */}
            <div className="ridepool-card text-center p-8 animate-fade-in" style={{ animationDelay: '0.4s' }}>
              <div className="feature-icon mx-auto mb-6">
                🗺️
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-3">
                Route Optimization
              </h3>
              <p className="text-gray-700 leading-relaxed">
                Efficient routing algorithms minimize travel time and distance for all group members
              </p>
            </div>

            {/* Feature 4 */}
            <div className="ridepool-card text-center p-8 animate-slideInRight" style={{ animationDelay: '0.6s' }}>
              <div className="feature-icon mx-auto mb-6">
                📱
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-3">
                Mobile Friendly
              </h3>
              <p className="text-gray-700 leading-relaxed">
                Access all features seamlessly on any device with our responsive design
              </p>
            </div>
          </div>

          <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Feature 5 */}
            <div className="ridepool-card p-8 animate-slideInLeft" style={{ animationDelay: '0.8s' }}>
              <div className="flex items-start">
                <div className="feature-icon flex-shrink-0">
                  🔐
                </div>
                <div className="ml-6">
                  <h3 className="text-2xl font-bold text-gray-900 mb-3">
                    Safe & Secure
                  </h3>
                  <p className="text-gray-700 leading-relaxed">
                    Verified student profiles, secure messaging, and emergency contact features
                  </p>
                </div>
              </div>
            </div>

            {/* Feature 6 */}
            <div className="ridepool-card p-8 animate-fade-in" style={{ animationDelay: '1s' }}>
              <div className="flex items-start">
                <div className="feature-icon flex-shrink-0">
                  🎯
                </div>
                <div className="ml-6">
                  <h3 className="text-2xl font-bold text-gray-900 mb-3">
                    Easy Management
                  </h3>
                  <p className="text-gray-700 leading-relaxed">
                    Simple group creation, member management, and ride scheduling tools
                  </p>
                </div>
              </div>
            </div>

            {/* Feature 7 */}
            <div className="ridepool-card p-8 animate-slideInRight" style={{ animationDelay: '1.2s' }}>
              <div className="flex items-start">
                <div className="feature-icon flex-shrink-0">
                  🚕
                </div>
                <div className="ml-6">
                  <h3 className="text-2xl font-bold text-gray-900 mb-3">
                    Direct Booking
                  </h3>
                  <p className="text-gray-700 leading-relaxed">
                    Coming soon: Book cabs directly through our platform with exclusive group discounts
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* CTA Section */}
        <div className="ridepool-card p-12 text-center animate-fade-in">
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
            Ready to Start Saving?
          </h2>
          <p className="text-xl text-gray-700 mb-8">
            Join RideBuddy today and never ride alone again!
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button 
              onClick={handleSignUp}
              className="ridepool-btn ridepool-btn-primary px-8 py-3 text-lg"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
              </svg>
              Sign Up Free
            </button>
            <button 
              onClick={handleSignIn}
              className="ridepool-btn ridepool-btn-outline px-8 py-3 text-lg"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
              </svg>
              Sign In
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PublicDashboard;