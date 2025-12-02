import React, { createContext, useState, useEffect, useContext } from 'react';
import axios from 'axios';
import type { ReactNode } from 'react';
import { auth, googleProvider } from '../services/firebaseConfig';
import { signInWithPopup, signOut, onAuthStateChanged } from 'firebase/auth';

// Set base URL for API requests
axios.defaults.baseURL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';

// Define types
interface User {
  id: string;
  name: string;
  email: string;
  role: string;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  login: (email: string, password: string) => Promise<void>;
  register: (userData: any) => Promise<any>;
  logout: () => void;
  signInWithGoogle: () => Promise<void>;
  isAuthenticated: boolean;
  isAdmin: boolean;
}

interface AuthProviderProps {
  children: ReactNode;
}

// Create context
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Auth provider component
export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  // Set up axios default headers and Firebase auth listener
  useEffect(() => {
    const storedToken = localStorage.getItem('token');
    if (storedToken) {
      setToken(storedToken);
      axios.defaults.headers.common['Authorization'] = `Bearer ${storedToken}`;
      loadUser();
    } else {
      setLoading(false);
    }
    
    // Listen for Firebase auth state changes
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      if (!firebaseUser && !storedToken) {
        // No Firebase user and no stored token, ensure we're logged out
        setLoading(false);
      }
    });
    
    // Cleanup subscription
    return () => unsubscribe();
  }, []);

  // Load user data
  const loadUser = async () => {
    try {
      const res = await axios.get('/api/auth/me');
      // Ensure the user object has the correct structure
      const userData = {
        id: res.data.data._id || res.data.data.id,
        name: res.data.data.name,
        email: res.data.data.email,
        role: res.data.data.role
      };
      setUser(userData);
    } catch (err) {
      console.error('Error loading user:', err);
      logout();
    } finally {
      setLoading(false);
    }
  };

  // Login function
  const login = async (email: string, password: string) => {
    try {
      const res = await axios.post('/api/auth/login', { email, password });
      const { token, user } = res.data;
      
      // Ensure the user object has the correct structure
      const userData = {
        id: user._id || user.id,
        name: user.name,
        email: user.email,
        role: user.role
      };
      
      localStorage.setItem('token', token);
      setToken(token);
      setUser(userData);
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    } catch (err: any) {
      // Provide better error message for unverified emails
      if (err.response?.data?.message?.includes('verify your email')) {
        throw new Error('Please verify your email before logging in. Check your inbox for the verification link.');
      }
      throw err;
    }
  };

  // Register function
  const register = async (userData: any) => {
    try {
      const res = await axios.post('/api/auth/register', userData);
      // Don't automatically log in - user needs to verify email first
      return res.data;
    } catch (err) {
      throw err;
    }
  };

  // Logout function
  const logout = async () => {
    try {
      // Sign out from Firebase
      await signOut(auth);
    } catch (error) {
      console.error('Error signing out from Firebase:', error);
    } finally {
      // Clear local storage and state
      localStorage.removeItem('token');
      setToken(null);
      setUser(null);
      delete axios.defaults.headers.common['Authorization'];
    }
  };

  // Google Sign-In function
  const handleGoogleSignIn = async () => {
    try {
      // Sign in with Google using Firebase
      const result = await signInWithPopup(auth, googleProvider);
      const user = result.user;
      
      // Get the ID token from Firebase user
      const idToken = await user.getIdToken();
      
      // Send the token to your backend for verification
      const res = await axios.post('/api/auth/firebase', { idToken });
      
      const { token, userData } = res.data;
      
      // Ensure the user object has the correct structure
      const userObject = {
        id: userData._id || userData.id,
        name: userData.name,
        email: userData.email,
        role: userData.role
      };
      
      localStorage.setItem('token', token);
      setToken(token);
      setUser(userObject);
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    } catch (error: any) {
      console.error('Google sign-in error:', error);
      // Handle Firebase auth errors
      if (error.code) {
        switch (error.code) {
          case 'auth/popup-closed-by-user':
            throw new Error('Sign in popup was closed. Please try again.');
          case 'auth/cancelled-popup-request':
            throw new Error('Sign in was cancelled. Please try again.');
          case 'auth/network-request-failed':
            throw new Error('Network error. Please check your connection and try again.');
          default:
            throw new Error(`Authentication failed: ${error.message}`);
        }
      }
      throw error;
    }
  };

  // Auth status
  const isAuthenticated = !!user;
  const isAdmin = user?.role === 'admin';

  // Context value
  const contextValue: AuthContextType = {
    user,
    token,
    login,
    register,
    logout,
    signInWithGoogle: handleGoogleSignIn,
    isAuthenticated,
    isAdmin
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
};

// Custom hook to use auth context
export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export default AuthContext;