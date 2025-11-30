import React, { useState, useEffect } from 'react';

const AdminPanel: React.FC = () => {
  const [activeTab, setActiveTab] = useState('users');
  const [users, setUsers] = useState<any[]>([]);
  const [groups, setGroups] = useState<any[]>([]);
  const [poolRequests, setPoolRequests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [announcement, setAnnouncement] = useState({ title: '', content: '' });

  useEffect(() => {
    // In a real app, you would fetch this data from your API
    // For now, we'll use mock data
    setTimeout(() => {
      setUsers([
        { id: 1, name: 'Rahul Sharma', email: 'rahul@college.edu.in', role: 'student', status: 'Active' },
        { id: 2, name: 'Priya Patel', email: 'priya@college.edu.in', role: 'student', status: 'Active' },
        { id: 3, name: 'Amit Kumar', email: 'amit@college.edu.in', role: 'student', status: 'Banned' },
        { id: 4, name: 'Admin User', email: 'admin@college.edu.in', role: 'admin', status: 'Active' }
      ]);
      
      setGroups([
        { id: 1, name: 'Main Gate to Academic Block', members: 3, status: 'Open' },
        { id: 2, name: 'Hostel to Library', members: 2, status: 'Locked' },
        { id: 3, name: 'Girls Hostel to Canteen', members: 4, status: 'Completed' }
      ]);
      
      setPoolRequests([
        { id: 1, user: 'Rahul Sharma', pickup: 'Main Gate', drop: 'Academic Block', date: '2023-06-15', status: 'Matched' },
        { id: 2, user: 'Priya Patel', pickup: 'Hostel', drop: 'Library', date: '2023-06-16', status: 'Open' },
        { id: 3, user: 'Amit Kumar', pickup: 'Girls Hostel', drop: 'Canteen', date: '2023-06-17', status: 'Completed' }
      ]);
      
      setLoading(false);
    }, 1000);
  }, []);

  const handleBanUser = (userId: number) => {
    setUsers(users.map(user => 
      user.id === userId 
        ? { ...user, status: user.status === 'Active' ? 'Banned' : 'Active' }
        : user
    ));
  };

  const handleDeleteGroup = (groupId: number) => {
    setGroups(groups.filter(group => group.id !== groupId));
  };

  const handleSendAnnouncement = () => {
    if (announcement.title && announcement.content) {
      alert(`Announcement sent!\nTitle: ${announcement.title}\nContent: ${announcement.content}`);
      setAnnouncement({ title: '', content: '' });
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Admin Panel</h1>
          <p className="mt-1 text-sm text-gray-500">Manage users, groups, and pool requests</p>
        </div>
        
        <div className="bg-white shadow overflow-hidden sm:rounded-lg">
          {/* Tabs */}
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8" aria-label="Tabs">
              <button
                onClick={() => setActiveTab('users')}
                className={`${
                  activeTab === 'users'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
              >
                Users
              </button>
              <button
                onClick={() => setActiveTab('groups')}
                className={`${
                  activeTab === 'groups'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
              >
                Groups
              </button>
              <button
                onClick={() => setActiveTab('pools')}
                className={`${
                  activeTab === 'pools'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
              >
                Pool Requests
              </button>
              <button
                onClick={() => setActiveTab('announcements')}
                className={`${
                  activeTab === 'announcements'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
              >
                Announcements
              </button>
            </nav>
          </div>
          
          {/* Tab content */}
          <div className="border-t border-gray-200">
            {loading ? (
              <div className="px-4 py-12 sm:px-6">
                <div className="flex justify-center">
                  <svg className="animate-spin h-12 w-12 text-blue-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                </div>
              </div>
            ) : (
              <div className="px-4 py-5 sm:px-6">
                {/* Users tab */}
                {activeTab === 'users' && (
                  <div>
                    <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">Manage Users</h3>
                    <div className="overflow-x-auto">
                      <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                          <tr>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Name
                            </th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Email
                            </th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Role
                            </th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Status
                            </th>
                            <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Actions
                            </th>
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                          {users.map((user) => (
                            <tr key={user.id}>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="text-sm font-medium text-gray-900">{user.name}</div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="text-sm text-gray-500">{user.email}</div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                  user.role === 'admin' 
                                    ? 'bg-purple-100 text-purple-800' 
                                    : 'bg-green-100 text-green-800'
                                }`}>
                                  {user.role}
                                </span>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                  user.status === 'Active' 
                                    ? 'bg-green-100 text-green-800' 
                                    : 'bg-red-100 text-red-800'
                                }`}>
                                  {user.status}
                                </span>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                <button
                                  onClick={() => handleBanUser(user.id)}
                                  className={`${
                                    user.status === 'Active' 
                                      ? 'text-red-600 hover:text-red-900' 
                                      : 'text-green-600 hover:text-green-900'
                                  }`}
                                >
                                  {user.status === 'Active' ? 'Ban' : 'Unban'}
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
                
                {/* Groups tab */}
                {activeTab === 'groups' && (
                  <div>
                    <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">Manage Groups</h3>
                    <div className="overflow-x-auto">
                      <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                          <tr>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Group Name
                            </th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Members
                            </th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Status
                            </th>
                            <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Actions
                            </th>
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                          {groups.map((group) => (
                            <tr key={group.id}>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="text-sm font-medium text-gray-900">{group.name}</div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="text-sm text-gray-500">{group.members} members</div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                  group.status === 'Open' 
                                    ? 'bg-green-100 text-green-800' 
                                    : group.status === 'Locked' 
                                      ? 'bg-yellow-100 text-yellow-800' 
                                      : 'bg-gray-100 text-gray-800'
                                }`}>
                                  {group.status}
                                </span>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                <button
                                  onClick={() => handleDeleteGroup(group.id)}
                                  className="text-red-600 hover:text-red-900"
                                >
                                  Delete
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
                
                {/* Pool Requests tab */}
                {activeTab === 'pools' && (
                  <div>
                    <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">Pool Requests</h3>
                    <div className="overflow-x-auto">
                      <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                          <tr>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              User
                            </th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Route
                            </th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Date
                            </th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Status
                            </th>
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                          {poolRequests.map((request) => (
                            <tr key={request.id}>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="text-sm font-medium text-gray-900">{request.user}</div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="text-sm text-gray-500">{request.pickup} → {request.drop}</div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="text-sm text-gray-500">{request.date}</div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                  request.status === 'Open' 
                                    ? 'bg-green-100 text-green-800' 
                                    : request.status === 'Matched' 
                                      ? 'bg-blue-100 text-blue-800' 
                                      : 'bg-gray-100 text-gray-800'
                                }`}>
                                  {request.status}
                                </span>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
                
                {/* Announcements tab */}
                {activeTab === 'announcements' && (
                  <div>
                    <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">Send Announcement</h3>
                    <div className="space-y-6">
                      <div>
                        <label htmlFor="title" className="block text-sm font-medium text-gray-700">
                          Title
                        </label>
                        <input
                          type="text"
                          name="title"
                          id="title"
                          value={announcement.title}
                          onChange={(e) => setAnnouncement({...announcement, title: e.target.value})}
                          className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                          placeholder="Announcement title"
                        />
                      </div>
                      
                      <div>
                        <label htmlFor="content" className="block text-sm font-medium text-gray-700">
                          Content
                        </label>
                        <textarea
                          id="content"
                          name="content"
                          rows={4}
                          value={announcement.content}
                          onChange={(e) => setAnnouncement({...announcement, content: e.target.value})}
                          className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                          placeholder="Announcement content"
                        />
                      </div>
                      
                      <div>
                        <button
                          onClick={handleSendAnnouncement}
                          disabled={!announcement.title || !announcement.content}
                          className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
                        >
                          Send Announcement
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminPanel;