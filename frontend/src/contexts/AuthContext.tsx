import React, { createContext, useState, useEffect, useContext } from 'react';
import axios from 'axios';
import type { ReactNode } from 'react';

// Declare Google types
declare global {
  interface Window {
    google: any;
  }
}

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

  // Set up axios default headers
  useEffect(() => {
    const storedToken = localStorage.getItem('token');
    if (storedToken) {
      setToken(storedToken);
      axios.defaults.headers.common['Authorization'] = `Bearer ${storedToken}`;
      loadUser();
    } else {
      setLoading(false);
    }
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
  const logout = () => {
    localStorage.removeItem('token');
    setToken(null);
    setUser(null);
    delete axios.defaults.headers.common['Authorization'];
  };

  // Google Sign-In function
  const handleGoogleSignIn = async () => {
    try {
      // Check if we have a Google Client ID
      const googleClientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;
      
      if (!googleClientId) {
        throw new Error('Google Sign-In is not configured for this deployment. Please use email/password login instead.');
      }
      
      // Create a promise that will resolve when Google Auth is ready
      const googleAuthReady = new Promise((resolve, reject) => {
        if (typeof window !== 'undefined' && window.google && window.google.accounts) {
          resolve(window.google.accounts);
        } else {
          // Dynamically load the Google Platform library
          const script = document.createElement('script');
          script.src = 'https://accounts.google.com/gsi/client';
          script.async = true;
          script.defer = true;
          script.onload = () => resolve((window as any).google.accounts);
          script.onerror = () => reject(new Error('Failed to load Google Platform library'));
          document.head.appendChild(script);
        }
      });
      
      // Wait for Google Auth to be ready
      const accounts: any = await googleAuthReady;
      
      // Create a promise for the OAuth flow
      return new Promise<void>((resolve, reject) => {
        // Initialize Google Auth client
        const client = accounts.oauth2.initTokenClient({
          client_id: googleClientId,
          scope: 'openid profile email',
          callback: async (response: any) => {
            if (response.error) {
              reject(new Error(response.error_description || response.error));
              return;
            }
            
            try {
              // Send the token to your backend for verification
              const res = await axios.post('/api/auth/google', { 
                access_token: response.access_token 
              });
              
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
              resolve();
            } catch (err: any) {
              reject(new Error(err.response?.data?.message || 'Failed to authenticate with Google'));
            }
          },
        });
        
        // Request authorization
        client.requestAccessToken();
      });
    } catch (error) {
      console.error('Google sign-in error:', error);
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