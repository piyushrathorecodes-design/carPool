import React, { useState } from 'react';
import { Link } from 'react-router-dom';

const FindPool: React.FC = () => {
  const [formData, setFormData] = useState({
    pickup: '',
    drop: '',
    date: '',
    time: '',
    gender: 'Any'
  });
  const [matches, setMatches] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);

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
      
      // In a real app, you would send this data to your API
      // const response = await api.findPoolMatches(formData);
      
      // Simulate API call with mock data
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      setMatches([
        {
          id: 1,
          user: {
            name: 'Rahul Sharma',
            year: '3rd Year',
            branch: 'Computer Science'
          },
          matchScore: 92,
          distanceSimilarity: {
            pickup: 1200,
            drop: 2500
          },
          timeSimilarity: 5,
          route: {
            pickup: 'Hostel Block A',
            drop: 'Main Gate'
          },
          dateTime: '2023-06-15 08:30 AM'
        },
        {
          id: 2,
          user: {
            name: 'Priya Patel',
            year: '2nd Year',
            branch: 'Electronics'
          },
          matchScore: 87,
          distanceSimilarity: {
            pickup: 800,
            drop: 3200
          },
          timeSimilarity: 12,
          route: {
            pickup: 'Girls Hostel',
            drop: 'Academic Block'
          },
          dateTime: '2023-06-15 08:45 AM'
        },
        {
          id: 3,
          user: {
            name: 'Amit Kumar',
            year: '4th Year',
            branch: 'Mechanical'
          },
          matchScore: 78,
          distanceSimilarity: {
            pickup: 2100,
            drop: 1800
          },
          timeSimilarity: 8,
          route: {
            pickup: 'Boys Hostel',
            drop: 'Library'
          },
          dateTime: '2023-06-15 08:20 AM'
        }
      ]);
    } catch (err) {
      console.error('Error finding pool matches:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Find Pool</h1>
          <p className="mt-1 text-sm text-gray-500">Find students traveling on similar routes and schedules.</p>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Search form */}
          <div className="lg:col-span-1">
            <div className="bg-white shadow overflow-hidden sm:rounded-lg">
              <div className="px-4 py-5 sm:px-6 border-b border-gray-200">
                <h3 className="text-lg leading-6 font-medium text-gray-900">Search Criteria</h3>
              </div>
              <div className="border-t border-gray-200">
                <form onSubmit={handleSubmit} className="px-4 py-5 sm:p-6">
                  <div className="space-y-6">
                    <div>
                      <label htmlFor="pickup" className="block text-sm font-medium text-gray-700">
                        Pickup Location
                      </label>
                      <input
                        type="text"
                        name="pickup"
                        id="pickup"
                        required
                        value={formData.pickup}
                        onChange={handleChange}
                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                        placeholder="Enter pickup location"
                      />
                    </div>
                    
                    <div>
                      <label htmlFor="drop" className="block text-sm font-medium text-gray-700">
                        Drop Location
                      </label>
                      <input
                        type="text"
                        name="drop"
                        id="drop"
                        required
                        value={formData.drop}
                        onChange={handleChange}
                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                        placeholder="Enter drop location"
                      />
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label htmlFor="date" className="block text-sm font-medium text-gray-700">
                          Date
                        </label>
                        <input
                          type="date"
                          name="date"
                          id="date"
                          required
                          value={formData.date}
                          onChange={handleChange}
                          className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                        />
                      </div>
                      
                      <div>
                        <label htmlFor="time" className="block text-sm font-medium text-gray-700">
                          Time
                        </label>
                        <input
                          type="time"
                          name="time"
                          id="time"
                          required
                          value={formData.time}
                          onChange={handleChange}
                          className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                        />
                      </div>
                    </div>
                    
                    <div>
                      <label htmlFor="gender" className="block text-sm font-medium text-gray-700">
                        Gender Preference
                      </label>
                      <select
                        id="gender"
                        name="gender"
                        value={formData.gender}
                        onChange={handleChange}
                        className="mt-1 block w-full bg-white border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
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
                        className="w-full flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
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
            <div className="bg-white shadow overflow-hidden sm:rounded-lg">
              <div className="px-4 py-5 sm:px-6 border-b border-gray-200">
                <h3 className="text-lg leading-6 font-medium text-gray-900">
                  {searched ? 'Matching Students' : 'How to Find a Pool'}
                </h3>
              </div>
              <div className="border-t border-gray-200">
                {!searched ? (
                  <div className="px-4 py-12 sm:px-6 text-center">
                    <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                    <h3 className="mt-2 text-sm font-medium text-gray-900">Search for Matches</h3>
                    <p className="mt-1 text-sm text-gray-500">
                      Enter your pickup location, destination, date, and time to find students traveling on similar routes.
                    </p>
                  </div>
                ) : loading ? (
                  <div className="px-4 py-12 sm:px-6">
                    <div className="flex justify-center">
                      <svg className="animate-spin h-12 w-12 text-blue-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                    </div>
                    <p className="mt-4 text-center text-sm text-gray-500">
                      Finding matches for your route...
                    </p>
                  </div>
                ) : matches.length > 0 ? (
                  <ul className="divide-y divide-gray-200">
                    {matches.map((match) => (
                      <li key={match.id} className="hover:bg-gray-50">
                        <div className="px-4 py-5 sm:px-6">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center">
                              <div className="flex-shrink-0">
                                <div className="bg-gray-200 border-2 border-dashed rounded-xl w-16 h-16" />
                              </div>
                              <div className="ml-4">
                                <h4 className="text-lg font-medium text-gray-900">{match.user.name}</h4>
                                <p className="text-sm text-gray-500">
                                  {match.user.year} • {match.user.branch}
                                </p>
                              </div>
                            </div>
                            
                            <div className="flex items-center">
                              <div className="text-right mr-4">
                                <p className="text-sm font-medium text-gray-900">
                                  Match Score: {match.matchScore}%
                                </p>
                                <p className="text-xs text-gray-500">
                                  {Math.round(match.distanceSimilarity.pickup/1000)}km pickup, {Math.round(match.distanceSimilarity.drop/1000)}km drop
                                </p>
                              </div>
                              
                              <Link 
                                to={`/group/create?match=${match.id}`}
                                className="inline-flex items-center px-3 py-1 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                              >
                                Connect
                              </Link>
                            </div>
                          </div>
                          
                          <div className="mt-4 grid grid-cols-1 sm:grid-cols-3 gap-4">
                            <div className="bg-blue-50 rounded-lg p-3">
                              <p className="text-xs font-medium text-blue-800">ROUTE</p>
                              <p className="mt-1 text-sm text-gray-900">{match.route.pickup} → {match.route.drop}</p>
                            </div>
                            
                            <div className="bg-green-50 rounded-lg p-3">
                              <p className="text-xs font-medium text-green-800">DATE & TIME</p>
                              <p className="mt-1 text-sm text-gray-900">{match.dateTime}</p>
                            </div>
                            
                            <div className="bg-purple-50 rounded-lg p-3">
                              <p className="text-xs font-medium text-purple-800">SIMILARITY</p>
                              <p className="mt-1 text-sm text-gray-900">
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
                    <h3 className="mt-2 text-sm font-medium text-gray-900">No matches found</h3>
                    <p className="mt-1 text-sm text-gray-500">
                      Try adjusting your search criteria to find more matches.
                    </p>
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