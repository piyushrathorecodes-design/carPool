import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';

const Profile: React.FC = () => {
  const { user } = useAuth();
  const [profile, setProfile] = useState<any>({});
  const [editing, setEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    // In a real app, you would fetch this data from your API
    // For now, we'll use mock data
    setTimeout(() => {
      setProfile({
        name: user?.name || '',
        email: user?.email || '',
        phone: '+91 98765 43210',
        gender: 'Male',
        year: '3rd Year',
        branch: 'Computer Science',
        frequentRoute: {
          home: 'Hostel Block A',
          college: 'Main Building'
        },
        preferredTime: 'Morning',
        liveLocation: 'Hostel Area'
      });
      setLoading(false);
    }, 1000);
  }, [user]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    
    if (name.startsWith('frequentRoute.')) {
      const routeKey = name.split('.')[1];
      setProfile({
        ...profile,
        frequentRoute: {
          ...profile.frequentRoute,
          [routeKey]: value
        }
      });
    } else {
      setProfile({
        ...profile,
        [name]: value
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      setSaving(true);
      setError('');
      setSuccess('');
      
      // In a real app, you would send this data to your API
      // await api.updateProfile(profile);
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setSuccess('Profile updated successfully!');
      setEditing(false);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white shadow overflow-hidden sm:rounded-lg">
          <div className="px-4 py-5 sm:px-6 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h3 className="text-lg leading-6 font-medium text-gray-900">My Profile</h3>
              <button
                onClick={() => setEditing(!editing)}
                className="inline-flex items-center px-3 py-1 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                {editing ? 'Cancel' : 'Edit'}
              </button>
            </div>
          </div>
          
          {success && (
            <div className="bg-green-50 border-l-4 border-green-400 p-4">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div className="ml-3">
                  <p className="text-sm text-green-700">
                    {success}
                  </p>
                </div>
              </div>
            </div>
          )}
          
          {error && (
            <div className="bg-red-50 border-l-4 border-red-400 p-4">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div className="ml-3">
                  <p className="text-sm text-red-700">
                    {error}
                  </p>
                </div>
              </div>
            </div>
          )}
          
          <div className="border-t border-gray-200">
            {loading ? (
              <div className="px-4 py-5 sm:p-6">
                <div className="flex justify-center">
                  <svg className="animate-spin h-8 w-8 text-blue-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSubmit}>
                <div className="px-4 py-5 sm:p-6">
                  <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
                    <div className="sm:col-span-3">
                      <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                        Full Name
                      </label>
                      {editing ? (
                        <input
                          type="text"
                          name="name"
                          id="name"
                          value={profile.name}
                          onChange={handleChange}
                          className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                        />
                      ) : (
                        <p className="mt-1 text-sm text-gray-900">{profile.name}</p>
                      )}
                    </div>
                    
                    <div className="sm:col-span-3">
                      <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                        Email Address
                      </label>
                      <p className="mt-1 text-sm text-gray-900">{profile.email}</p>
                    </div>
                    
                    <div className="sm:col-span-3">
                      <label htmlFor="phone" className="block text-sm font-medium text-gray-700">
                        Phone Number
                      </label>
                      {editing ? (
                        <input
                          type="tel"
                          name="phone"
                          id="phone"
                          value={profile.phone}
                          onChange={handleChange}
                          className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                        />
                      ) : (
                        <p className="mt-1 text-sm text-gray-900">{profile.phone}</p>
                      )}
                    </div>
                    
                    <div className="sm:col-span-3">
                      <label htmlFor="gender" className="block text-sm font-medium text-gray-700">
                        Gender
                      </label>
                      {editing ? (
                        <select
                          id="gender"
                          name="gender"
                          value={profile.gender}
                          onChange={handleChange}
                          className="mt-1 block w-full bg-white border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                        >
                          <option value="">Select</option>
                          <option value="Male">Male</option>
                          <option value="Female">Female</option>
                          <option value="Other">Other</option>
                        </select>
                      ) : (
                        <p className="mt-1 text-sm text-gray-900">{profile.gender}</p>
                      )}
                    </div>
                    
                    <div className="sm:col-span-3">
                      <label htmlFor="year" className="block text-sm font-medium text-gray-700">
                        Year
                      </label>
                      {editing ? (
                        <input
                          type="text"
                          name="year"
                          id="year"
                          value={profile.year}
                          onChange={handleChange}
                          className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                        />
                      ) : (
                        <p className="mt-1 text-sm text-gray-900">{profile.year}</p>
                      )}
                    </div>
                    
                    <div className="sm:col-span-3">
                      <label htmlFor="branch" className="block text-sm font-medium text-gray-700">
                        Branch
                      </label>
                      {editing ? (
                        <input
                          type="text"
                          name="branch"
                          id="branch"
                          value={profile.branch}
                          onChange={handleChange}
                          className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                        />
                      ) : (
                        <p className="mt-1 text-sm text-gray-900">{profile.branch}</p>
                      )}
                    </div>
                    
                    <div className="sm:col-span-3">
                      <label htmlFor="preferredTime" className="block text-sm font-medium text-gray-700">
                        Preferred Time
                      </label>
                      {editing ? (
                        <select
                          id="preferredTime"
                          name="preferredTime"
                          value={profile.preferredTime}
                          onChange={handleChange}
                          className="mt-1 block w-full bg-white border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                        >
                          <option value="Morning">Morning</option>
                          <option value="Evening">Evening</option>
                        </select>
                      ) : (
                        <p className="mt-1 text-sm text-gray-900">{profile.preferredTime}</p>
                      )}
                    </div>
                    
                    <div className="sm:col-span-6">
                      <fieldset>
                        <legend className="text-base font-medium text-gray-900">Frequent Route</legend>
                        <div className="mt-4 grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
                          <div className="sm:col-span-3">
                            <label htmlFor="frequentRoute.home" className="block text-sm font-medium text-gray-700">
                              Home Address
                            </label>
                            {editing ? (
                              <input
                                type="text"
                                name="frequentRoute.home"
                                id="frequentRoute.home"
                                value={profile.frequentRoute.home}
                                onChange={handleChange}
                                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                              />
                            ) : (
                              <p className="mt-1 text-sm text-gray-900">{profile.frequentRoute.home}</p>
                            )}
                          </div>
                          
                          <div className="sm:col-span-3">
                            <label htmlFor="frequentRoute.college" className="block text-sm font-medium text-gray-700">
                              College Address
                            </label>
                            {editing ? (
                              <input
                                type="text"
                                name="frequentRoute.college"
                                id="frequentRoute.college"
                                value={profile.frequentRoute.college}
                                onChange={handleChange}
                                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                              />
                            ) : (
                              <p className="mt-1 text-sm text-gray-900">{profile.frequentRoute.college}</p>
                            )}
                          </div>
                        </div>
                      </fieldset>
                    </div>
                    
                    <div className="sm:col-span-6">
                      <label htmlFor="liveLocation" className="block text-sm font-medium text-gray-700">
                        Live Location
                      </label>
                      <p className="mt-1 text-sm text-gray-900">{profile.liveLocation}</p>
                    </div>
                  </div>
                </div>
                
                {editing && (
                  <div className="px-4 py-3 bg-gray-50 text-right sm:px-6">
                    <button
                      type="submit"
                      disabled={saving}
                      className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
                    >
                      {saving ? (
                        <>
                          <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                          Saving...
                        </>
                      ) : (
                        'Save Changes'
                      )}
                    </button>
                  </div>
                )}
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;