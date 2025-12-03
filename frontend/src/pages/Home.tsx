import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const Home: React.FC = () => {
  const { isAuthenticated } = useAuth();

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Background Decorations */}
      <div className="bg-decoration bg-decoration-1"></div>
      <div className="bg-decoration bg-decoration-2"></div>
      <div className="bg-decoration bg-decoration-3"></div>

      {/* Hero Section */}
      <div className="relative z-10 pt-20 pb-32 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          
          {/* Promotional Ad - EYE-CATCHING */}
          <div className="mb-12 animate-pulse-slow transform hover:scale-[1.02] transition-all duration-300">
            <div className="ridepool-card p-6 border-2 border-pink-300 shadow-xl bg-gradient-to-r from-pink-50 via-purple-50 to-indigo-50">
              <div className="flex flex-col md:flex-row items-center justify-between gap-6">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <div className="w-16 h-16 rounded-full bg-gradient-to-r from-pink-500 to-purple-500 flex items-center justify-center animate-pulse">
                      <svg className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                      </svg>
                    </div>
                  </div>
                  <div className="ml-6">
                    <h3 className="text-2xl font-bold text-purple-900">🚕 Booking Cabs by Group - Coming Soon!</h3>
                    <p className="mt-2 text-purple-700">
                      We're building a feature to let groups book cabs directly. Stay tuned for group discounts and seamless booking!
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <span className="px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-full text-sm font-bold animate-pulse">
                    🔥 EXCLUSIVE
                  </span>
                  <span className="px-4 py-2 bg-gradient-to-r from-yellow-400 to-orange-500 text-white rounded-full text-sm font-bold">
                    🎯 GROUP DISCOUNTS
                  </span>
                </div>
              </div>
              <div className="mt-6 flex items-center text-sm text-purple-600">
                <svg className="w-5 h-5 mr-2 animate-bounce" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
                <span className="font-semibold">Be the first to know when we launch!</span>
              </div>
            </div>
          </div>

          <div className="text-center animate-fade-in">
            {/* Logo */}
            <h1 className="brand-logo text-5xl sm:text-6xl md:text-7xl mb-6 animate-pulse-glow">
              RideBuddy
            </h1>
            
            {/* Tagline */}
            <p className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 mb-4 animate-slideInLeft">
              Share Rides, Save Money
            </p>
            <p className="text-lg sm:text-xl text-gray-700 mb-12 max-w-2xl mx-auto animate-slideInRight">
              Connect with fellow students traveling on similar routes. Reduce costs, reduce carbon footprint, and make new friends along the way.
            </p>

            {/* CTA Buttons */}
            {isAuthenticated ? (
              <div className="flex flex-col sm:flex-row gap-4 justify-center items-center animate-fade-in">
                <Link to="/dashboard" className="ridepool-btn ridepool-btn-primary px-8 py-3 text-lg">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                  </svg>
                  Go to Dashboard
                </Link>
              </div>
            ) : (
              <div className="flex flex-col sm:flex-row gap-4 justify-center items-center animate-fade-in">
                <Link to="/register" className="ridepool-btn ridepool-btn-primary px-8 py-3 text-lg">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                  </svg>
                  Get Started Free
                </Link>
                <Link to="/login" className="ridepool-btn ridepool-btn-outline px-8 py-3 text-lg">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
                  </svg>
                  Sign In
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="relative z-10 py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16 animate-fade-in">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
              Why Choose RideBuddy?
            </h2>
            <p className="text-xl text-gray-700">
              The smart way to share rides on campus
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Feature 1 */}
            <div className="feature-card animate-slideInLeft">
              <div className="feature-icon">
                👥
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-3">
                Find Travel Buddies
              </h3>
              <p className="text-gray-700 leading-relaxed">
                Match with students traveling on similar routes and schedules in real-time.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="feature-card animate-fade-in" style={{ animationDelay: '0.2s' }}>
              <div className="feature-icon">
                💰
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-3">
                Save Money
              </h3>
              <p className="text-gray-700 leading-relaxed">
                Split cab fares with fellow students and reduce your travel costs significantly.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="feature-card animate-slideInRight" style={{ animationDelay: '0.4s' }}>
              <div className="feature-icon">
                🌍
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-3">
                Go Green
              </h3>
              <p className="text-gray-700 leading-relaxed">
                Reduce carbon emissions by up to 75% and help create a cleaner campus.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Platform Features Section */}
      <div className="relative z-10 py-20 px-4 sm:px-6 lg:px-8 bg-gray-50">
        <div className="max-w-7xl mx-auto">
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
      </div>

      {/* CTA Section */}
      {!isAuthenticated && (
        <div className="relative z-10 py-20 px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto text-center">
            <div className="ridepool-card p-12 animate-fade-in">
              <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
                Ready to Start Saving?
              </h2>
              <p className="text-xl text-gray-700 mb-8">
                Join RideBuddy today and never ride alone again!
              </p>
              <Link to="/register" className="ridepool-btn ridepool-btn-primary px-8 py-3 text-lg">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
                Sign Up Now
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Home;