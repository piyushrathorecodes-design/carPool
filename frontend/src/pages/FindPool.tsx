import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import MapInput from '../components/MapInput';

const FindPool: React.FC = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    pickup: '',
    drop: '',
    date: '',
    time: '',
    gender: 'Any'
  });
  
  const [pickupCoordinates, setPickupCoordinates] = useState<[number, number]>([0, 0]);
  const [dropCoordinates, setDropCoordinates] = useState<[number, number]>([0, 0]);
  const [matches, setMatches] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const [searchData, setSearchData] = useState<any>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      setLoading(true);
      setSearched(true);
      
      // Store search data for potential group creation
      const requestData = {
        pickupLocation: {
          address: formData.pickup,
          coordinates: pickupCoordinates
        },
        dropLocation: {
          address: formData.drop,
          coordinates: dropCoordinates
        },
        dateTime: `${formData.date}T${formData.time}:00.000Z`,
        preferredGender: formData.gender
      };
      
      setSearchData(requestData);
      
      // Call the real API
      const response = await axios.post('/api/pool/match', requestData);
      
      // Transform API response to match our UI structure
      const transformedMatches = response.data.data.map((match: any) => ({
        id: match._id,
        user: {
          name: match.createdBy.name,
          // Note: We'll need to get year and branch from user profile
          year: 'N/A',
          branch: 'N/A'
        },
        matchScore: Math.round(match.matchScore),
        distanceSimilarity: {
          pickup: match.distanceSimilarity.pickup,
          drop: match.distanceSimilarity.drop
        },
        timeSimilarity: Math.round(match.timeDifference),
        route: {
          pickup: match.pickupLocation.address,
          drop: match.dropLocation.address
        },
        dateTime: new Date(match.dateTime).toLocaleString()
      }));
      
      setMatches(transformedMatches);
    } catch (err: any) {
      console.error('Error finding pool matches:', err);
      // Show error message to user
      setMatches([]);
    } finally {
      setLoading(false);
    }
  };

  // Function to create a new group when no matches are found
  const handleCreateGroup = async () => {
    try {
      setLoading(true);
      
      // First create a pool request
      const poolResponse = await axios.post('/api/pool/create', searchData);
      const poolRequestId = poolResponse.data.data._id;
      
      // Then create a group with this pool request
      const groupResponse = await axios.post('/api/group/create', {
        groupName: `Trip from ${formData.pickup.split(',')[0]} to ${formData.drop.split(',')[0]}`,
        route: {
          pickup: searchData.pickupLocation,
          drop: searchData.dropLocation
        },
        seatCount: 4 // Default seat count
      });
      
      const groupId = groupResponse.data.data._id;
      
      // Navigate to the newly created group
      navigate(`/group/${groupId}`);
    } catch (err: any) {
      console.error('Error creating group:', err);
      alert('Failed to create group. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-white">Find Pool</h1>
          <p className="mt-1 text-sm text-gray-300">Find students traveling on similar routes and schedules.</p>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Search form */}
          <div className="lg:col-span-1">
            <div className="ridepool-card">
              <div className="px-4 py-5 sm:px-6 border-b border-gray-700">
                <h3 className="text-lg leading-6 font-medium text-white">Search Criteria</h3>
              </div>
              <div className="border-t border-gray-700">
                <form onSubmit={handleSubmit} className="px-4 py-5 sm:p-6">
                  <div className="space-y-6">
                    <div>
                      <label htmlFor="pickup" className="block text-sm font-medium text-gray-300">
                        Pickup Location
                      </label>
                      <MapInput
                        onLocationSelect={(location) => {
                          setFormData({ ...formData, pickup: location.address });
                          setPickupCoordinates(location.coordinates);
                        }}
                        placeholder="Enter pickup location"
                      />
                    </div>
                    
                    <div>
                      <label htmlFor="drop" className="block text-sm font-medium text-gray-300">
                        Drop Location
                      </label>
                      <MapInput
                        onLocationSelect={(location) => {
                          setFormData({ ...formData, drop: location.address });
                          setDropCoordinates(location.coordinates);
                        }}
                        placeholder="Enter drop location"
                      />
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label htmlFor="date" className="block text-sm font-medium text-gray-300">
                          Date
                        </label>
                        <input
                          type="date"
                          name="date"
                          id="date"
                          required
                          value={formData.date}
                          onChange={handleChange}
                          className="ridepool-input mt-1 block w-full rounded-md py-2 px-3 focus:z-10 sm:text-sm"
                        />
                      </div>
                      
                      <div>
                        <label htmlFor="time" className="block text-sm font-medium text-gray-300">
                          Time
                        </label>
                        <input
                          type="time"
                          name="time"
                          id="time"
                          required
                          value={formData.time}
                          onChange={handleChange}
                          className="ridepool-input mt-1 block w-full rounded-md py-2 px-3 focus:z-10 sm:text-sm"
                        />
                      </div>
                    </div>
                    
                    <div>
                      <label htmlFor="gender" className="block text-sm font-medium text-gray-300">
                        Gender Preference
                      </label>
                      <select
                        id="gender"
                        name="gender"
                        value={formData.gender}
                        onChange={handleChange}
                        className="ridepool-input mt-1 block w-full rounded-md py-2 px-3 focus:z-10 sm:text-sm"
                      >
                        <option value="Any">Any</option>
                        <option value="Male">Male</option>
                        <option value="Female">Female</option>
                      </select>
                    </div>
                    
                    <div>
                      <button
                        type="submit"
                        disabled={loading}
                        className="ridepool-btn ridepool-btn-primary w-full flex justify-center py-2 px-4 rounded-md text-sm font-medium disabled:opacity-50"
                      >
                        {loading ? (
                          <>
                            <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                            Searching...
                          </>
                        ) : (
                          'Find Matches'
                        )}
                      </button>
                    </div>
                  </div>
                </form>
              </div>
            </div>
          </div>
          
          {/* Results */}
          <div className="lg:col-span-2">
            <div className="ridepool-card">
              <div className="px-4 py-5 sm:px-6 border-b border-gray-700">
                <h3 className="text-lg leading-6 font-medium text-white">
                  {searched ? 'Matching Students' : 'How to Find a Pool'}
                </h3>
              </div>
              <div className="border-t border-gray-700">
                {!searched ? (
                  <div className="px-4 py-12 sm:px-6 text-center">
                    <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                    <h3 className="mt-2 text-sm font-medium text-white">Search for Matches</h3>
                    <p className="mt-1 text-sm text-gray-300">
                      Enter your pickup location, destination, date, and time to find students traveling on similar routes.
                    </p>
                  </div>
                ) : loading ? (
                  <div className="px-4 py-12 sm:px-6">
                    <div className="flex justify-center">
                      <div className="animate-pulse-glow w-16 h-16 rounded-full bg-gradient-to-r from-purple-500 to-blue-500"></div>
                    </div>
                    <p className="mt-4 text-center text-sm text-gray-300">
                      Finding matches for your route...
                    </p>
                  </div>
                ) : matches.length > 0 ? (
                  <ul className="divide-y divide-gray-700">
                    {matches.map((match) => (
                      <li key={match.id} className="hover:bg-gray-700 hover:bg-opacity-30 transition-colors duration-200">
                        <div className="px-4 py-5 sm:px-6">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center">
                              <div className="flex-shrink-0">
                                <div className="bg-gradient-to-br from-purple-500 to-blue-500 rounded-xl w-16 h-16 flex items-center justify-center">
                                  <span className="text-white font-bold text-xl">
                                    {match.user.name.charAt(0)}
                                  </span>
                                </div>
                              </div>
                              <div className="ml-4">
                                <h4 className="text-lg font-medium text-white">{match.user.name}</h4>
                                <p className="text-sm text-gray-300">
                                  {match.user.year} • {match.user.branch}
                                </p>
                              </div>
                            </div>
                            
                            <div className="flex items-center">
                              <div className="text-right mr-4">
                                <p className="text-sm font-medium text-white">
                                  Match Score: {match.matchScore}%
                                </p>
                                <p className="text-xs text-gray-300">
                                  {Math.round(match.distanceSimilarity.pickup/1000)}km pickup, {Math.round(match.distanceSimilarity.drop/1000)}km drop
                                </p>
                              </div>
                              
                              <Link 
                                to={`/group/create?match=${match.id}`}
                                className="ridepool-btn ridepool-btn-primary inline-flex items-center px-3 py-1 rounded-md text-sm font-medium"
                              >
                                Connect
                              </Link>
                            </div>
                          </div>
                          
                          <div className="mt-4 grid grid-cols-1 sm:grid-cols-3 gap-4">
                            <div className="bg-gradient-to-br from-blue-500 to-blue-600 bg-opacity-20 rounded-lg p-3 border border-blue-500 border-opacity-30">
                              <p className="text-xs font-medium text-blue-300">ROUTE</p>
                              <p className="mt-1 text-sm text-white">{match.route.pickup} → {match.route.drop}</p>
                            </div>
                            
                            <div className="bg-gradient-to-br from-green-500 to-green-600 bg-opacity-20 rounded-lg p-3 border border-green-500 border-opacity-30">
                              <p className="text-xs font-medium text-green-300">DATE & TIME</p>
                              <p className="mt-1 text-sm text-white">{match.dateTime}</p>
                            </div>
                            
                            <div className="bg-gradient-to-br from-purple-500 to-purple-600 bg-opacity-20 rounded-lg p-3 border border-purple-500 border-opacity-30">
                              <p className="text-xs font-medium text-purple-300">SIMILARITY</p>
                              <p className="mt-1 text-sm text-white">
                                ±{match.timeSimilarity} min time difference
                              </p>
                            </div>
                          </div>
                        </div>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <div className="px-4 py-12 sm:px-6 text-center">
                    <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <h3 className="mt-2 text-sm font-medium text-white">No matches found</h3>
                    <p className="mt-1 text-sm text-gray-300">
                      Be the first to create a group for this route!
                    </p>
                    <div className="mt-6">
                      <button
                        onClick={handleCreateGroup}
                        disabled={loading}
                        className="ridepool-btn ridepool-btn-primary inline-flex items-center px-4 py-2 rounded-md text-sm font-medium disabled:opacity-50"
                      >
                        {loading ? (
                          <>
                            <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                            Creating Group...
                          </>
                        ) : (
                          'Create New Group'
                        )}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FindPool;