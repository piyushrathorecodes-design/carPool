import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { notificationAPI } from '../services/api.service';
import socketService from '../services/socket.service';

const Navbar: React.FC = () => {
  const { isAuthenticated, isAdmin, logout, user, token } = useAuth();
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [showNotifications, setShowNotifications] = useState(false);

  // Fetch unread notification count and set up socket connection
  useEffect(() => {
    if (isAuthenticated && user && token) {
      fetchUnreadCount();
      
      // Connect to socket server
      socketService.connect(token, user.id);
      
      // Listen for new notifications
      socketService.on('new_notification', (notification: any) => {
        // Add new notification to the list
        setNotifications(prev => [notification, ...prev]);
        // Increment unread count
        setUnreadCount(prev => prev + 1);
      });
    }
    
    // Clean up socket connection on unmount
    return () => {
      socketService.off('new_notification');
    };
  }, [isAuthenticated, user, token]);

  const fetchUnreadCount = async () => {
    try {
      const res = await notificationAPI.getUnreadCount();
      setUnreadCount(res.data.count);
    } catch (error) {
      console.error('Error fetching unread count:', error);
    }
  };

  const handleLogout = () => {
    // Disconnect socket before logout
    socketService.disconnect();
    logout();
    navigate('/login');
  };

  const toggleNotifications = async () => {
    if (!showNotifications) {
      // Fetch notifications when opening
      try {
        const res = await notificationAPI.getAll();
        setNotifications(res.data.data);
        // Mark all as read
        await notificationAPI.markAllAsRead();
        setUnreadCount(0);
      } catch (error) {
        console.error('Error fetching notifications:', error);
      }
    }
    setShowNotifications(!showNotifications);
  };

  return (
    <nav className="bg-white bg-opacity-80 backdrop-blur-md text-gray-900 shadow-lg border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link to="/dashboard" className="flex-shrink-0 flex items-center">
              <span className="text-xl font-bold bg-gradient-to-r from-pink-500 to-purple-500 bg-clip-text text-transparent hover-lift">
                RideBuddy
              </span>
            </Link>
          </div>
          
          <div className="hidden md:flex items-center space-x-4">
            {isAuthenticated ? (
              <>
                <Link to="/dashboard" className="px-3 py-2 rounded-md text-sm font-medium hover:bg-gray-100 transition-colors duration-200 hover-lift">
                  Dashboard
                </Link>
                <Link to="/find-pool" className="px-3 py-2 rounded-md text-sm font-medium hover:bg-gray-100 transition-colors duration-200 hover-lift">
                  Find Pool
                </Link>
                <Link to="/groups" className="px-3 py-2 rounded-md text-sm font-medium hover:bg-gray-100 transition-colors duration-200 hover-lift">
                  Groups
                </Link>
                <Link to="/profile" className="px-3 py-2 rounded-md text-sm font-medium hover:bg-gray-100 transition-colors duration-200 hover-lift">
                  Profile
                </Link>
                
                {isAdmin && (
                  <Link to="/admin" className="px-3 py-2 rounded-md text-sm font-medium hover:bg-gray-100 transition-colors duration-200 hover-lift">
                    Admin
                  </Link>
                )}
                
                {/* Notification Bell */}
                <div className="relative">
                  <button 
                    onClick={toggleNotifications}
                    className="p-2 rounded-full hover:bg-gray-100 relative"
                  >
                    <svg className="h-6 w-6 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                    </svg>
                    {unreadCount > 0 && (
                      <span className="absolute top-0 right-0 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-white transform translate-x-1/2 -translate-y-1/2 bg-red-500 rounded-full">
                        {unreadCount}
                      </span>
                    )}
                  </button>
                  
                  {/* Notification Dropdown */}
                  {showNotifications && (
                    <div className="origin-top-right absolute right-0 mt-2 w-80 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 z-50">
                      <div className="p-4">
                        <div className="flex items-center justify-between mb-4">
                          <h3 className="text-lg font-medium text-gray-900">Notifications</h3>
                          {notifications.length > 0 && (
                            <span className="text-sm text-gray-500">{notifications.length} items</span>
                          )}
                        </div>
                        
                        {notifications.length === 0 ? (
                          <p className="text-gray-500 text-center py-4">No notifications</p>
                        ) : (
                          <div className="max-h-96 overflow-y-auto">
                            {notifications.map((notification) => (
                              <div 
                                key={notification._id} 
                                className={`p-3 rounded-md mb-2 ${!notification.isRead ? 'bg-blue-50' : 'hover:bg-gray-50'}`}
                              >
                                <div className="flex justify-between">
                                  <h4 className="font-medium text-gray-900">{notification.title}</h4>
                                  <span className="text-xs text-gray-500">
                                    {new Date(notification.createdAt).toLocaleDateString()}
                                  </span>
                                </div>
                                <p className="text-sm text-gray-600 mt-1">{notification.content}</p>
                                {notification.type === 'system' && (
                                  <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800 mt-2">
                                    Announcement
                                  </span>
                                )}
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
                
                {/* User profile section with visible logout button */}
                <div className="flex items-center space-x-3">
                  <div className="flex items-center">
                    <div className="h-8 w-8 rounded-full bg-gradient-to-br from-pink-500 to-purple-500 flex items-center justify-center hover-glow">
                      <span className="text-xs font-bold text-white">
                        {user?.name?.charAt(0).toUpperCase() || 'U'}
                      </span>
                    </div>
                    <span className="ml-2 text-sm font-medium">{user?.name || 'User'}</span>
                  </div>
                  <button
                    onClick={handleLogout}
                    className="px-3 py-2 rounded-md text-sm font-medium bg-gradient-to-r from-red-500 to-pink-500 hover:from-red-600 hover:to-pink-600 text-white transition-all duration-200 transform hover:scale-105 hover-lift ridepool-btn"
                  >
                    Logout
                  </button>
                </div>
              </>
            ) : (
              <>
                <Link to="/login" className="px-3 py-2 rounded-md text-sm font-medium hover:bg-gray-100 transition-colors duration-200 hover-lift">
                  Login
                </Link>
                <Link to="/register" className="px-3 py-2 rounded-md text-sm font-medium bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white transition-all duration-200 transform hover:scale-105 hover-lift ridepool-btn">
                  Register
                </Link>
              </>
            )}
          </div>
          
          {/* Mobile menu button */}
          <div className="md:hidden flex items-center">
            <button 
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="inline-flex items-center justify-center p-2 rounded-md text-gray-900 hover:text-gray-900 hover:bg-gray-100 focus:outline-none transition-colors duration-200 hover-lift"
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
        <div className="md:hidden bg-white bg-opacity-90 backdrop-blur-md border-t border-gray-200">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
            {isAuthenticated ? (
              <>
                <Link to="/dashboard" className="block px-3 py-2 rounded-md text-base font-medium hover:bg-gray-100 transition-colors duration-200">
                  Dashboard
                </Link>
                <Link to="/find-pool" className="block px-3 py-2 rounded-md text-base font-medium hover:bg-gray-100 transition-colors duration-200">
                  Find Pool
                </Link>
                <Link to="/groups" className="block px-3 py-2 rounded-md text-base font-medium hover:bg-gray-100 transition-colors duration-200">
                  Groups
                </Link>
                <Link to="/profile" className="block px-3 py-2 rounded-md text-base font-medium hover:bg-gray-100 transition-colors duration-200">
                  Profile
                </Link>
                {isAdmin && (
                  <Link to="/admin" className="block px-3 py-2 rounded-md text-base font-medium hover:bg-gray-100 transition-colors duration-200">
                    Admin
                  </Link>
                )}
                <button
                  onClick={handleLogout}
                  className="w-full text-left block px-3 py-2 rounded-md text-base font-medium bg-gradient-to-r from-red-500 to-pink-500 hover:from-red-600 hover:to-pink-600 text-white transition-all duration-200"
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link to="/login" className="block px-3 py-2 rounded-md text-base font-medium hover:bg-gray-100 transition-colors duration-200">
                  Login
                </Link>
                <Link to="/register" className="block px-3 py-2 rounded-md text-base font-medium bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white transition-all duration-200">
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