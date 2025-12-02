import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const Register: React.FC = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    phone: '',
    gender: '',
    year: '',
    branch: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  
  const { register, signInWithGoogle } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate all fields are filled
    if (!formData.name || !formData.email || !formData.password || !formData.phone || 
        !formData.gender || !formData.year || !formData.branch) {
      setError('All fields are required');
      return;
    }
    
    // Validate passwords match
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    
    // Validate email format
    if (!formData.email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) {
      setError('Please enter a valid email');
      return;
    }
    
    // Validate password strength
    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters long');
      return;
    }
    
    // Validate phone number
    if (!/^\d{10}$/.test(formData.phone)) {
      setError('Please enter a valid 10-digit phone number');
      return;
    }
    
    try {
      setError('');
      setLoading(true);
      
      // Prepare registration data (excluding confirmPassword)
      const { confirmPassword, ...registrationData } = formData;
      
      await register(registrationData);
      // Show success message and redirect to login
      setError('Registration successful! Please check your email for verification link.');
      setTimeout(() => {
        navigate('/login');
      }, 3000);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to create account');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    try {
      setError('');
      setLoading(true);
      await signInWithGoogle();
      navigate('/dashboard');
    } catch (err: any) {
      setError(err.message || 'Failed to sign in with Google');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-pink-50 via-purple-50 to-indigo-50 py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Background animations */}
      <div className="background-blob background-blob-1"></div>
      <div className="background-blob background-blob-2"></div>
      
      <div className="max-w-md w-full space-y-8 ridepool-card p-8 animate-fade-in relative z-10">
        <div className="text-center">
          <h2 className="mt-6 text-center text-3xl font-extrabold bg-gradient-to-r from-pink-500 to-purple-600 bg-clip-text text-transparent animate-gradient-shift">
            Create your account
          </h2>
          <p className="mt-2 text-center text-sm text-gray-700">
            Or{' '}
            <Link to="/login" className="font-medium text-purple-600 hover:text-purple-500">
              sign in to your account
            </Link>
          </p>
        </div>
        
        {error && (
          <div className="rounded-md bg-red-500 bg-opacity-20 p-4 border border-red-500 border-opacity-30 animate-shake">
            <div className="text-sm text-red-700">
              {error}
            </div>
          </div>
        )}
        
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="rounded-md shadow-sm space-y-4">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                Full Name *
              </label>
              <input
                id="name"
                name="name"
                type="text"
                required
                value={formData.name}
                onChange={handleChange}
                className="ridepool-input appearance-none relative block w-full px-3 py-2 placeholder-gray-500 rounded-md focus:z-10 sm:text-sm"
                placeholder="Full Name"
              />
            </div>
            
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                Email *
              </label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                value={formData.email}
                onChange={handleChange}
                className="ridepool-input appearance-none relative block w-full px-3 py-2 placeholder-gray-500 rounded-md focus:z-10 sm:text-sm"
                placeholder="Email"
              />
            </div>
            
            <div>
              <label htmlFor="phone" className="block text-sm font-medium text-gray-700">
                Phone Number *
              </label>
              <input
                id="phone"
                name="phone"
                type="tel"
                required
                value={formData.phone}
                onChange={handleChange}
                className="ridepool-input appearance-none relative block w-full px-3 py-2 placeholder-gray-500 rounded-md focus:z-10 sm:text-sm"
                placeholder="Phone Number"
              />
            </div>
            
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                Password *
              </label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="new-password"
                required
                value={formData.password}
                onChange={handleChange}
                className="ridepool-input appearance-none relative block w-full px-3 py-2 placeholder-gray-500 rounded-md focus:z-10 sm:text-sm"
                placeholder="Password (min. 6 characters)"
              />
            </div>
            
            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">
                Confirm Password *
              </label>
              <input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                autoComplete="new-password"
                required
                value={formData.confirmPassword}
                onChange={handleChange}
                className="ridepool-input appearance-none relative block w-full px-3 py-2 placeholder-gray-500 rounded-md focus:z-10 sm:text-sm"
                placeholder="Confirm Password"
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="gender" className="block text-sm font-medium text-gray-700">
                  Gender *
                </label>
                <select
                  id="gender"
                  name="gender"
                  value={formData.gender}
                  onChange={handleChange}
                  required
                  className="ridepool-input appearance-none relative block w-full px-3 py-2 placeholder-gray-500 rounded-md focus:z-10 sm:text-sm"
                >
                  <option value="">Select Gender</option>
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                </select>
              </div>
              
              <div>
                <label htmlFor="year" className="block text-sm font-medium text-gray-700">
                  Year *
                </label>
                <input
                  id="year"
                  name="year"
                  type="text"
                  required
                  value={formData.year}
                  onChange={handleChange}
                  className="ridepool-input appearance-none relative block w-full px-3 py-2 placeholder-gray-500 rounded-md focus:z-10 sm:text-sm"
                  placeholder="Year (e.g., 1st, 2nd, 3rd, 4th)"
                />
              </div>
            </div>
            
            <div>
              <label htmlFor="branch" className="block text-sm font-medium text-gray-700">
                Branch *
              </label>
              <input
                id="branch"
                name="branch"
                type="text"
                required
                value={formData.branch}
                onChange={handleChange}
                className="ridepool-input appearance-none relative block w-full px-3 py-2 placeholder-gray-500 rounded-md focus:z-10 sm:text-sm"
                placeholder="Branch (e.g., Computer Science, Electronics)"
              />
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={loading}
              className="ridepool-btn ridepool-btn-primary group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-pink-500 disabled:opacity-50 animate-pulse"
            >
              {loading ? (
                <>
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Creating Account...
                </>
              ) : (
                'Create Account'
              )}
            </button>
          </div>
          
          <div className="relative my-4">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-white text-gray-700">Or continue with</span>
            </div>
          </div>
          
          <div>
            <button
              type="button"
              onClick={handleGoogleSignIn}
              className="ridepool-btn ridepool-btn-secondary group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500"
            >
              <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
                <path fill="currentColor" d="M12.24 10.285V14.4h6.806c-.275 1.765-2.056 5.174-6.806 5.174-4.095 0-7.439-3.389-7.439-7.574s3.345-7.574 7.439-7.574c2.33 0 3.891.989 4.785 1.849l3.254-3.138C18.189 1.186 15.479 0 12.24 0c-6.635 0-12 5.365-12 12s5.365 12 12 12c6.926 0 11.52-4.869 11.52-11.726 0-.788-.085-1.39-.189-1.989H12.24z"/>
              </svg>
              Sign up with Google
            </button>
          </div>
        </form>
        
        <div className="text-center text-sm text-gray-700 mt-4">
          Already have an account?{' '}
          <Link to="/login" className="font-medium text-purple-600 hover:text-purple-500">
            Sign in
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Register;