import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, Link } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { ThemeProvider } from './contexts/ThemeContext';
import Navbar from './components/Navbar';
import Login from './pages/Login';
import Register from './pages/Register';
import FindPool from './pages/FindPool';
import GroupDetail from './pages/GroupDetail';
import Profile from './pages/Profile';
import RidePoolDashboard from './components/RidePoolDashboard';
import GroupsPage from './pages/GroupsPage';
import GroupChatPage from './pages/GroupChatPage';
import EmailVerification from './pages/EmailVerification';
import './App.css';

// Background Animation Component with enhanced smooth animations
const BackgroundAnimation: React.FC = () => {
  // Create floating orbs for enhanced background
  const orbs = Array.from({ length: 15 }, (_, i) => (
    <div 
      key={i} 
      className="floating-orb"
      style={{
        top: `${Math.random() * 100}%`,
        left: `${Math.random() * 100}%`,
        width: `${Math.random() * 100 + 20}px`,
        height: `${Math.random() * 100 + 20}px`,
        animationDelay: `${Math.random() * 10}s`,
        animationDuration: `${Math.random() * 20 + 20}s`
      }}
    ></div>
  ));

  return (
    <>
      <div className="animated-grid"></div>
      <div className="background-blob background-blob-1"></div>
      <div className="background-blob background-blob-2"></div>
      {orbs}
    </>
  );
};

// Protected Route Component
const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated, token } = useAuth();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check if we have a token but haven't loaded user data yet
    if (token && !isAuthenticated) {
      // Wait a bit for auth context to initialize
      const timer = setTimeout(() => {
        setIsLoading(false);
      }, 1000);
      return () => clearTimeout(timer);
    } else {
      setIsLoading(false);
    }
  }, [isAuthenticated, token]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="w-16 h-16 rounded-full bg-gradient-to-r from-pink-500 to-orange-500"></div>
      </div>
    );
  }

  return isAuthenticated ? <>{children}</> : <Navigate to="/login" />;
};

// Public Route Component (routes that should not be accessed when logged in)
const PublicRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated } = useAuth();
  return !isAuthenticated ? <>{children}</> : <Navigate to="/dashboard" />;
};

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <Router>
          <div className="min-h-screen bg-white text-gray-900 relative">
            <BackgroundAnimation />
            <Routes>
              <Route path="/" element={
                <PublicRoute>
                  <div className="min-h-screen flex items-center justify-center relative z-10">
                    <div className="text-center p-8 rounded-2xl ridepool-card shadow-2xl max-w-2xl w-full mx-4">
                      <h1 className="text-5xl font-bold bg-gradient-to-r from-pink-500 via-purple-500 to-indigo-500 bg-clip-text text-transparent mb-6">
                        Ride Pool
                      </h1>
                      <div className="w-24 h-1 bg-gradient-to-r from-pink-500 to-purple-500 mx-auto mb-6 rounded-full"></div>
                      <p className="text-xl text-gray-700 mb-8">
                        Welcome to the future of campus transportation
                      </p>
                      <div className="flex flex-col sm:flex-row gap-4 justify-center">
                        <Link to="/login" className="ridepool-btn ridepool-btn-primary px-6 py-3 rounded-lg font-semibold">
                          Get Started
                        </Link>
                        <Link to="/register" className="ridepool-btn ridepool-btn-secondary px-6 py-3 rounded-lg font-semibold">
                          Sign Up
                        </Link>
                      </div>
                    </div>
                  </div>
                </PublicRoute>
              } />
              <Route path="/login" element={
                <PublicRoute>
                  <Login />
                </PublicRoute>
              } />
              <Route path="/register" element={
                <PublicRoute>
                  <Register />
                </PublicRoute>
              } />
              <Route path="/dashboard" element={
                <ProtectedRoute>
                  <div className="min-h-screen flex flex-col">
                    <Navbar />
                    <main className="flex-grow pt-16">
                      <RidePoolDashboard />
                    </main>
                  </div>
                </ProtectedRoute>
              } />
              <Route path="/find-pool" element={
                <ProtectedRoute>
                  <div className="min-h-screen flex flex-col">
                    <Navbar />
                    <main className="flex-grow pt-16">
                      <FindPool />
                    </main>
                  </div>
                </ProtectedRoute>
              } />
              <Route path="/group/:id" element={
                <ProtectedRoute>
                  <div className="min-h-screen flex flex-col">
                    <Navbar />
                    <main className="flex-grow pt-16">
                      <GroupDetail />
                    </main>
                  </div>
                </ProtectedRoute>
              } />
              <Route path="/group/create" element={
                <Navigate to="/groups" replace />
              } />
              <Route path="/profile" element={
                <ProtectedRoute>
                  <div className="min-h-screen flex flex-col">
                    <Navbar />
                    <main className="flex-grow pt-16">
                      <Profile />
                    </main>
                  </div>
                </ProtectedRoute>
              } />
              <Route path="/groups" element={
                <ProtectedRoute>
                  <div className="min-h-screen flex flex-col">
                    <Navbar />
                    <main className="flex-grow pt-16">
                      <GroupsPage />
                    </main>
                  </div>
                </ProtectedRoute>
              } />
              <Route path="/group-chat/:groupId" element={
                <ProtectedRoute>
                  <GroupChatPage />
                </ProtectedRoute>
              } />
              <Route path="/verify-email" element={<EmailVerification />} />
            </Routes>
          </div>
        </Router>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;