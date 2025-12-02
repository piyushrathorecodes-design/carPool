import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  sendGroupMessage, 
  getGroupMessages, 
  subscribeToGroupMessages 
} from '../services/firebase-chat.service';
import { groupAPI } from '../services/api.service';
import { useAuth } from '../contexts/AuthContext';
import LocationTracker from '../components/LocationTracker';
import GroupMap from '../components/GroupMap';

interface ChatMessage {
  id: string;
  user: string;
  content: string;
  time: string;
  senderId?: string;
}

interface GroupMember {
  id: string;
  name: string;
  role: string;
  email: string;
  phone: string;
  year: string;
  branch: string;
  liveLocation?: {
    coordinates: [number, number]; // [longitude, latitude]
  };
}

interface GroupData {
  id: string;
  name: string;
  members: GroupMember[];
  route: {
    pickup: string;
    drop: string;
  };
  status: string;
  seatCount: number;
  chatRoomId: string;
  dateTime: string;
}

const GroupDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAuth();
  const [group, setGroup] = useState<GroupData | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const handleJoinGroup = async () => {
    try {
      if (!id) {
        setError('Invalid group ID.');
        return;
      }
      
      setLoading(true);
      setError('');
      
      await groupAPI.join(id);
      window.location.reload();
    } catch (err: any) {
      console.error('Error joining group:', err);
      const errorMessage = err.response?.data?.message || 'Failed to join group';
      
      if (err.response?.status === 400) {
        if (errorMessage.includes('already a member')) {
          setError('You are already a member of this group. Refreshing...');
          setTimeout(() => window.location.reload(), 1500);
        } else if (errorMessage.includes('full')) {
          setError('This group is full. Please try another group.');
        } else {
          setError(errorMessage);
        }
      } else if (err.response?.status === 404) {
        setError('Group not found.');
      } else if (err.response?.status === 401) {
        setError('You must be logged in to join a group.');
      } else {
        setError(`Failed to join group: ${errorMessage}`);
      }
      
      setLoading(false);
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError('');
        
        if (!isAuthenticated || !user) {
          setError('You must be logged in to view group details.');
          setLoading(false);
          return;
        }
        
        if (!id || id === 'create') {
          setError('Invalid group ID.');
          setLoading(false);
          setTimeout(() => {
            navigate('/groups');
          }, 2000);
          return;
        }
        
        const groupResponse = await groupAPI.getById(id);
        
        const transformedGroup: GroupData = {
          id: groupResponse.data.data._id,
          name: groupResponse.data.data.groupName,
          members: groupResponse.data.data.members.map((member: any) => ({
            id: member.user._id,
            name: member.user.name,
            role: member.role,
            email: member.user.email,
            phone: member.user.phone,
            year: member.user.year || 'N/A',
            branch: member.user.branch || 'N/A',
            liveLocation: member.user.liveLocation || null
          })),
          route: {
            pickup: groupResponse.data.data.route.pickup.address,
            drop: groupResponse.data.data.route.drop.address
          },
          status: groupResponse.data.data.status,
          seatCount: groupResponse.data.data.seatCount,
          chatRoomId: groupResponse.data.data.chatRoomId,
          dateTime: groupResponse.data.data.dateTime
        };
        
        setGroup(transformedGroup);
        
        if (id) {
          try {
            const messagesData = await getGroupMessages(id, 50);
            
            const transformedMessages = messagesData.map((message: any) => ({
              id: message.id,
              user: message.senderName || message.senderId,
              content: message.text,
              time: new Date(message.timestamp.seconds * 1000).toLocaleTimeString([], { 
                hour: '2-digit', 
                minute: '2-digit' 
              }),
              senderId: message.senderId
            }));
            
            setMessages(transformedMessages);
          } catch (msgError) {
            console.error('Error fetching messages:', msgError);
          }
        }
      } catch (err: any) {
        console.error('Error fetching group data:', err);
        if (err.response?.status === 403) {
          setError('You are not a member of this group. Please join the group first.');
        } else if (err.response?.status === 404) {
          setError('Group not found.');
        } else if (err.response?.status === 401) {
          setError('You must be logged in to view group details.');
        } else if (err.response?.status === 500) {
          setError('Server error. Please try again later.');
        } else if (!navigator.onLine) {
          setError('No internet connection. Please check your connection and try again.');
        } else {
          setError(`Failed to load group data: ${err.message || 'Unknown error'}. Please try again later.`);
        }
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
    
    if (id) {
      const unsubscribe = subscribeToGroupMessages(id, (messagesData) => {
        const transformedMessages = messagesData.map((message: any) => ({
          id: message.id,
          user: message.senderName || message.senderId,
          content: message.text,
          time: new Date(message.timestamp.seconds * 1000).toLocaleTimeString([], { 
            hour: '2-digit', 
            minute: '2-digit' 
          }),
          senderId: message.senderId
        }));
        
        setMessages(transformedMessages);
      });
      
      return () => {
        unsubscribe();
      };
    }
  }, [id, isAuthenticated, navigate, user]);

  const sendMessage = async () => {
    if (newMessage.trim() === '' || !id || !user) return;
    
    const userId = (user as any).id || (user as any)._id;
    const userName = user.name;
    
    if (!userId || !userName) {
      console.error('User ID or name is missing');
      alert('Unable to send message: User information is incomplete.');
      return;
    }
    
    try {
      await sendGroupMessage(id, userId, userName, newMessage);
      setNewMessage('');
    } catch (err: any) {
      console.error('Error sending message:', err);
      alert('Failed to send message. Please try again.');
    }
  };

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-pink-50 via-purple-50 to-indigo-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500 mx-auto"></div>
          <p className="mt-4 text-gray-900">Loading group details...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-pink-50 via-purple-50 to-indigo-50 flex items-center justify-center">
        <div className="text-center ridepool-card p-8">
          <svg className="mx-auto h-12 w-12 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
          <h3 className="mt-2 text-lg font-medium text-gray-900">Error Loading Group</h3>
          <p className="mt-1 text-sm text-gray-700">{error}</p>
          <div className="mt-6 flex flex-col sm:flex-row justify-center gap-3">
            <button
              onClick={() => window.location.reload()}
              className="ridepool-btn ridepool-btn-primary inline-flex items-center px-4 py-2 rounded-md text-sm font-medium"
            >
              Retry
            </button>
            {error.includes('not a member') && id && (
              <button
                onClick={handleJoinGroup}
                className="ridepool-btn ridepool-btn-secondary inline-flex items-center px-4 py-2 rounded-md text-sm font-medium"
              >
                Join Group
              </button>
            )}
          </div>
        </div>
      </div>
    );
  }

  const currentUserId = (user as any)?.id || (user as any)?._id;

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-purple-50 to-indigo-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-6 animate-fade-in">
          <h1 className="text-3xl font-bold text-gray-900">{group?.name}</h1>
          <p className="mt-1 text-sm text-gray-700">Group details and chat</p>
        </div>
        
        {/* Coming Soon: Cab Booking Promotion */}
        <div className="mb-6 ridepool-card p-5 bg-gradient-to-r from-purple-50 to-indigo-50 border border-purple-200 rounded-xl shadow-sm animate-pulse-slow">
          <div className="flex items-start">
            <div className="flex-shrink-0 mt-1">
              <svg className="h-6 w-6 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div className="ml-4 flex-1">
              <h3 className="text-lg font-semibold text-purple-900">Booking Cabs by Group - Coming Soon!</h3>
              <p className="mt-1 text-purple-700 text-sm">
                We're building a feature to let groups book cabs directly. Stay tuned for group discounts and seamless booking!
              </p>
            </div>
            <div className="flex-shrink-0">
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                Soon
              </span>
            </div>
          </div>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Group Info */}
          <div className="lg:col-span-1 space-y-6">
            {/* Group Details Card */}
            <div className="ridepool-card animate-slideInLeft">
              <div className="px-4 py-5 sm:px-6 border-b border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900">Group Details</h3>
              </div>
              <div className="border-t border-gray-200">
                <dl>
                  <div className="px-4 py-4 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                    <dt className="text-sm font-medium text-gray-700">Date & Time</dt>
                    <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                      {group?.dateTime ? new Date(group.dateTime).toLocaleString() : 'Not specified'}
                    </dd>
                  </div>
                  <div className="px-4 py-4 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                    <dt className="text-sm font-medium text-gray-700">Route</dt>
                    <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                      <div className="flex flex-col">
                        <span className="text-green-600">📍 {group?.route.pickup}</span>
                        <span className="text-red-600 mt-1">🏁 {group?.route.drop}</span>
                      </div>
                    </dd>
                  </div>
                  <div className="px-4 py-4 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                    <dt className="text-sm font-medium text-gray-700">Status</dt>
                    <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                      <span className={`px-3 py-1 inline-flex text-xs font-semibold rounded-full ${
                        group?.status === 'Open' 
                          ? 'bg-green-100 text-green-800' 
                          : group?.status === 'Locked' 
                            ? 'bg-yellow-100 text-yellow-800' 
                            : 'bg-gray-100 text-gray-800'
                      }`}>
                        {group?.status}
                      </span>
                    </dd>
                  </div>
                  <div className="px-4 py-4 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                    <dt className="text-sm font-medium text-gray-700">Members</dt>
                    <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                      <span className="font-medium">{group?.members.length}</span>
                      <span className="text-gray-600"> / {group?.seatCount}</span>
                    </dd>
                  </div>
                </dl>
              </div>
            </div>

            {/* Members List */}
            <div className="ridepool-card animate-slideInLeft">
              <div className="px-4 py-5 sm:px-6 border-b border-gray-200">
                <div className="flex justify-between items-center">
                  <h3 className="text-lg font-semibold text-gray-900">Members</h3>
                  <span className="px-2 py-1 text-xs bg-gray-100 rounded-full text-gray-700">
                    {group?.members.length} members
                  </span>
                </div>
              </div>
              <div className="border-t border-gray-200">
                <ul className="divide-y divide-gray-200">
                  {group?.members.map((member) => (
                    <li key={member.id} className="px-4 py-3 sm:px-6 hover:bg-white hover:bg-opacity-70 transition-colors">
                      <div className="flex items-center">
                        <div className="flex-shrink-0">
                          <div className={`rounded-full w-10 h-10 flex items-center justify-center ${
                            member.id === currentUserId
                              ? 'bg-gradient-to-br from-green-500 to-teal-500'
                              : 'bg-gradient-to-br from-pink-500 to-purple-500'
                          }`}>
                            <span className="text-white font-bold">
                              {member.name.charAt(0).toUpperCase()}
                            </span>
                          </div>
                        </div>
                        <div className="ml-3 min-w-0 flex-1">
                          <div className="flex items-center">
                            <p className="text-sm font-medium text-gray-900 truncate">
                              {member.name}
                              {member.id === currentUserId && (
                                <span className="ml-2 text-xs text-green-600">(You)</span>
                              )}
                            </p>
                            {member.role === 'admin' && (
                              <span className="ml-2 px-2 py-0.5 text-xs font-medium bg-blue-100 text-blue-800 rounded-full">
                                Admin
                              </span>
                            )}
                          </div>
                          <p className="text-sm text-gray-700 truncate">{member.email}</p>
                          {member.year !== 'N/A' && member.branch !== 'N/A' && (
                            <p className="text-xs text-gray-600">
                              {member.year} • {member.branch}
                            </p>
                          )}
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Location Tracker */}
            <LocationTracker />

            {/* Actions Card */}
            <div className="ridepool-card animate-slideInLeft">
              <div className="px-4 py-5 sm:px-6 border-b border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900">Actions</h3>
              </div>
              <div className="border-t border-gray-200">
                <div className="px-4 py-5 sm:p-6 space-y-3">
                  {group?.status === 'Open' && (
                    <button 
                      onClick={async () => {
                        if (window.confirm('Are you sure you want to lock this group? New members won\'t be able to join.')) {
                          try {
                            if (id) {
                              await groupAPI.lock(id);
                              window.location.reload();
                            }
                          } catch (err: any) {
                            alert('Failed to lock group. Please try again.');
                          }
                        }
                      }}
                      className="ridepool-btn ridepool-btn-secondary w-full flex items-center justify-center px-4 py-3 rounded-lg"
                    >
                      <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                      </svg>
                      Lock Group
                    </button>
                  )}
                  
                  <button 
                    onClick={async () => {
                      if (window.confirm('Are you sure you want to leave this group?')) {
                        try {
                          if (id) {
                            await groupAPI.leave(id);
                            navigate('/groups');
                          }
                        } catch (err: any) {
                          alert('Failed to leave group. Please try again.');
                        }
                      }
                    }}
                    className="ridepool-btn ridepool-btn-primary w-full flex items-center justify-center px-4 py-3 rounded-lg"
                  >
                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                    </svg>
                    Leave Group
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column - Map and Chat */}
          <div className="lg:col-span-2 space-y-6">
            {/* Map */}
            <GroupMap groupId={id || ''} groupData={group} />
            
            {/* Chat Container */}
            <div className="ridepool-card flex flex-col h-[calc(100vh-400px)] animate-slideInRight">
              {/* Chat Header */}
              <div className="px-4 py-4 sm:px-6 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-gray-900">Group Chat</h3>
                  <div className="flex items-center space-x-2">
                    <span className="text-xs text-gray-600">
                      {messages.length} messages
                    </span>
                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                  </div>
                </div>
              </div>
              
              {/* Chat Messages */}
              <div className="flex-1 overflow-y-auto p-4 bg-white bg-opacity-50">
                <div className="space-y-3">
                  {messages.length === 0 ? (
                    <div className="text-center py-8">
                      <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gray-100 mb-4">
                        <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                        </svg>
                      </div>
                      <p className="text-gray-600">No messages yet. Start the conversation!</p>
                    </div>
                  ) : (
                    messages.map((message) => {
                      const isCurrentUser = message.senderId === currentUserId;
                      
                      return (
                        <div key={message.id} className={`flex ${isCurrentUser ? 'justify-end' : 'justify-start'}`}>
                          {/* Other User's Message */}
                          {!isCurrentUser && (
                            <div className="flex items-start max-w-[70%]">
                              <div className="flex-shrink-0 mr-3">
                                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-pink-500 to-purple-500 flex items-center justify-center">
                                  <span className="text-white text-xs font-bold">
                                    {message.user.charAt(0).toUpperCase()}
                                  </span>
                                </div>
                              </div>
                              <div className="flex flex-col">
                                <div className="flex items-center space-x-2 mb-1">
                                  <span className="text-xs font-medium text-gray-700">
                                    {message.user}
                                  </span>
                                  <span className="text-xs text-gray-500">
                                    {message.time}
                                  </span>
                                </div>
                                <div className="bg-white rounded-2xl rounded-tl-none px-4 py-2.5 border border-gray-200 shadow-sm">
                                  <p className="text-gray-900 text-sm whitespace-pre-wrap">
                                    {message.content}
                                  </p>
                                </div>
                              </div>
                            </div>
                          )}
                          
                          {/* Current User's Message */}
                          {isCurrentUser && (
                            <div className="flex items-start max-w-[70%]">
                              <div className="flex flex-col items-end">
                                <div className="flex items-center space-x-2 mb-1">
                                  <span className="text-xs text-gray-500">
                                    {message.time}
                                  </span>
                                  <span className="text-xs font-medium text-green-600">
                                    You
                                  </span>
                                </div>
                                <div className="bg-gradient-to-br from-pink-500 to-purple-500 rounded-2xl rounded-tr-none px-4 py-2.5">
                                  <p className="text-white text-sm whitespace-pre-wrap">
                                    {message.content}
                                  </p>
                                </div>
                              </div>
                              <div className="flex-shrink-0 ml-3">
                                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-green-500 to-teal-500 flex items-center justify-center">
                                  <span className="text-white text-xs font-bold">
                                    {message.user.charAt(0).toUpperCase()}
                                  </span>
                                </div>
                              </div>
                            </div>
                          )}
                        </div>
                      );
                    })
                  )}
                  <div ref={messagesEndRef} />
                </div>
              </div>
              
              {/* Message Input */}
              <div className="border-t border-gray-200 p-4">
                <div className="flex space-x-3">
                  <div className="flex-1">
                    <textarea
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      onKeyPress={handleKeyPress}
                      rows={2}
                      className="ridepool-input w-full px-4 py-3 rounded-xl resize-none"
                      placeholder="Type your message here..."
                    />
                  </div>
                  <button
                    onClick={sendMessage}
                    disabled={!newMessage.trim()}
                    className="ridepool-btn ridepool-btn-primary px-5 py-3 rounded-xl disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                    </svg>
                  </button>
                </div>
                <div className="flex justify-between items-center mt-2">
                  <span className="text-xs text-gray-600">
                    Press Enter to send, Shift+Enter for new line
                  </span>
                  <span className="text-xs text-gray-500">
                    {newMessage.length}/500
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GroupDetail;