import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const Navbar: React.FC = () => {
  const { isAuthenticated, isAdmin, logout, user } = useAuth();
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav className="bg-gray-800 bg-opacity-80 backdrop-blur-md text-white shadow-lg border-b border-gray-700 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link to="/dashboard" className="flex-shrink-0 flex items-center">
              <span className="text-xl font-bold bg-gradient-to-r from-purple-400 to-blue-500 bg-clip-text text-transparent hover-lift">
                Ride Pool
              </span>
            </Link>
          </div>
          
          <div className="hidden md:flex items-center space-x-4">
            {isAuthenticated ? (
              <>
                <Link to="/dashboard" className="px-3 py-2 rounded-md text-sm font-medium hover:bg-gray-700 transition-colors duration-200 hover-lift">
                  Dashboard
                </Link>
                <Link to="/find-pool" className="px-3 py-2 rounded-md text-sm font-medium hover:bg-gray-700 transition-colors duration-200 hover-lift">
                  Find Pool
                </Link>
                <Link to="/groups" className="px-3 py-2 rounded-md text-sm font-medium hover:bg-gray-700 transition-colors duration-200 hover-lift">
                  Groups
                </Link>
                <Link to="/profile" className="px-3 py-2 rounded-md text-sm font-medium hover:bg-gray-700 transition-colors duration-200 hover-lift">
                  Profile
                </Link>
                
                {isAdmin && (
                  <Link to="/admin" className="px-3 py-2 rounded-md text-sm font-medium hover:bg-gray-700 transition-colors duration-200 hover-lift">
                    Admin
                  </Link>
                )}
                
                {/* User profile section with visible logout button */}
                <div className="flex items-center space-x-3">
                  <div className="flex items-center">
                    <div className="h-8 w-8 rounded-full bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center hover-glow">
                      <span className="text-xs font-bold text-white">
                        {user?.name?.charAt(0).toUpperCase() || 'U'}
                      </span>
                    </div>
                    <span className="ml-2 text-sm font-medium">{user?.name || 'User'}</span>
                  </div>
                  <button
                    onClick={handleLogout}
                    className="px-3 py-2 rounded-md text-sm font-medium bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white transition-all duration-200 transform hover:scale-105 hover-lift ridepool-btn"
                  >
                    Logout
                  </button>
                </div>
              </>
            ) : (
              <>
                <Link to="/login" className="px-3 py-2 rounded-md text-sm font-medium hover:bg-gray-700 transition-colors duration-200 hover-lift">
                  Login
                </Link>
                <Link to="/register" className="px-3 py-2 rounded-md text-sm font-medium bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 text-white transition-all duration-200 transform hover:scale-105 hover-lift ridepool-btn">
                  Register
                </Link>
              </>
            )}
          </div>
          
          {/* Mobile menu button */}
          <div className="md:hidden flex items-center">
            <button 
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="inline-flex items-center justify-center p-2 rounded-md text-white hover:text-white hover:bg-gray-700 focus:outline-none transition-colors duration-200 hover-lift"
            >
              <svg className="h-6 w-6" stroke="currentColor" fill="none" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          </div>
        </div>
      </div>
      
      {/* Mobile menu */}
      {isMenuOpen && (
        <div className="md:hidden bg-gray-800 bg-opacity-90 backdrop-blur-md border-t border-gray-700 animate-fade-in">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
            {isAuthenticated ? (
              <>
                <Link to="/dashboard" className="block px-3 py-2 rounded-md text-base font-medium hover:bg-gray-700 transition-colors duration-200">
                  Dashboard
                </Link>
                <Link to="/find-pool" className="block px-3 py-2 rounded-md text-base font-medium hover:bg-gray-700 transition-colors duration-200">
                  Find Pool
                </Link>
                <Link to="/groups" className="block px-3 py-2 rounded-md text-base font-medium hover:bg-gray-700 transition-colors duration-200">
                  Groups
                </Link>
                <Link to="/profile" className="block px-3 py-2 rounded-md text-base font-medium hover:bg-gray-700 transition-colors duration-200">
                  Profile
                </Link>
                {isAdmin && (
                  <Link to="/admin" className="block px-3 py-2 rounded-md text-base font-medium hover:bg-gray-700 transition-colors duration-200">
                    Admin
                  </Link>
                )}
                <button
                  onClick={handleLogout}
                  className="w-full text-left block px-3 py-2 rounded-md text-base font-medium bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white transition-all duration-200"
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link to="/login" className="block px-3 py-2 rounded-md text-base font-medium hover:bg-gray-700 transition-colors duration-200">
                  Login
                </Link>
                <Link to="/register" className="block px-3 py-2 rounded-md text-base font-medium bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 text-white transition-all duration-200">
                  Register
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;