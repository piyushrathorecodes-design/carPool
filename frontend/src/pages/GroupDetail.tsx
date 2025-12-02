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
}

const GroupDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAuth();
  const [group, setGroup] = useState<GroupData | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [fareAmount, setFareAmount] = useState('');
  const [showFareCalculator, setShowFareCalculator] = useState(false);
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
            branch: member.user.branch || 'N/A'
          })),
          route: {
            pickup: groupResponse.data.data.route.pickup.address,
            drop: groupResponse.data.data.route.drop.address
          },
          status: groupResponse.data.data.status,
          seatCount: groupResponse.data.data.seatCount,
          chatRoomId: groupResponse.data.data.chatRoomId
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

  const calculateFare = () => {
    if (!fareAmount || isNaN(Number(fareAmount))) return;
      
    const amount = parseFloat(fareAmount);
    const memberCount = group?.members.length || 1;
    const share = (amount / memberCount).toFixed(2);
      
    alert(`Total fare: ₹${amount}\nEach person owes: ₹${share}`);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500 mx-auto"></div>
          <p className="mt-4 text-white">Loading group details...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 flex items-center justify-center">
        <div className="text-center ridepool-card p-8">
          <svg className="mx-auto h-12 w-12 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
          <h3 className="mt-2 text-lg font-medium text-white">Error Loading Group</h3>
          <p className="mt-1 text-sm text-gray-300">{error}</p>
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
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-white">{group?.name}</h1>
          <p className="mt-1 text-sm text-gray-300">Group details and chat</p>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Group Info */}
          <div className="lg:col-span-1 space-y-6">
            {/* Group Details Card */}
            <div className="ridepool-card">
              <div className="px-4 py-5 sm:px-6 border-b border-gray-700">
                <h3 className="text-lg font-semibold text-white">Group Details</h3>
              </div>
              <div className="border-t border-gray-700">
                <dl>
                  <div className="px-4 py-4 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                    <dt className="text-sm font-medium text-gray-300">Route</dt>
                    <dd className="mt-1 text-sm text-white sm:mt-0 sm:col-span-2">
                      <div className="flex flex-col">
                        <span className="text-green-400">📍 {group?.route.pickup}</span>
                        <span className="text-red-400 mt-1">🏁 {group?.route.drop}</span>
                      </div>
                    </dd>
                  </div>
                  <div className="px-4 py-4 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                    <dt className="text-sm font-medium text-gray-300">Status</dt>
                    <dd className="mt-1 text-sm text-white sm:mt-0 sm:col-span-2">
                      <span className={`px-3 py-1 inline-flex text-xs font-semibold rounded-full ${
                        group?.status === 'Open' 
                          ? 'bg-green-500 bg-opacity-20 text-green-300' 
                          : group?.status === 'Locked' 
                            ? 'bg-yellow-500 bg-opacity-20 text-yellow-300' 
                            : 'bg-gray-500 bg-opacity-20 text-gray-300'
                      }`}>
                        {group?.status}
                      </span>
                    </dd>
                  </div>
                  <div className="px-4 py-4 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                    <dt className="text-sm font-medium text-gray-300">Members</dt>
                    <dd className="mt-1 text-sm text-white sm:mt-0 sm:col-span-2">
                      <span className="font-medium">{group?.members.length}</span>
                      <span className="text-gray-400"> / {group?.seatCount}</span>
                    </dd>
                  </div>
                </dl>
              </div>
            </div>

            {/* Members List */}
            <div className="ridepool-card">
              <div className="px-4 py-5 sm:px-6 border-b border-gray-700">
                <div className="flex justify-between items-center">
                  <h3 className="text-lg font-semibold text-white">Members</h3>
                  <span className="px-2 py-1 text-xs bg-gray-700 rounded-full text-gray-300">
                    {group?.members.length} members
                  </span>
                </div>
              </div>
              <div className="border-t border-gray-700">
                <ul className="divide-y divide-gray-700">
                  {group?.members.map((member) => (
                    <li key={member.id} className="px-4 py-3 sm:px-6 hover:bg-gray-700 hover:bg-opacity-30 transition-colors">
                      <div className="flex items-center">
                        <div className="flex-shrink-0">
                          <div className={`rounded-full w-10 h-10 flex items-center justify-center ${
                            member.id === currentUserId
                              ? 'bg-gradient-to-br from-green-500 to-teal-500'
                              : 'bg-gradient-to-br from-purple-500 to-blue-500'
                          }`}>
                            <span className="text-white font-bold">
                              {member.name.charAt(0).toUpperCase()}
                            </span>
                          </div>
                        </div>
                        <div className="ml-3 min-w-0 flex-1">
                          <div className="flex items-center">
                            <p className="text-sm font-medium text-white truncate">
                              {member.name}
                              {member.id === currentUserId && (
                                <span className="ml-2 text-xs text-green-400">(You)</span>
                              )}
                            </p>
                            {member.role === 'admin' && (
                              <span className="ml-2 px-2 py-0.5 text-xs font-medium bg-blue-500 bg-opacity-20 text-blue-300 rounded-full">
                                Admin
                              </span>
                            )}
                          </div>
                          <p className="text-sm text-gray-300 truncate">{member.email}</p>
                          {member.year !== 'N/A' && member.branch !== 'N/A' && (
                            <p className="text-xs text-gray-400">
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
            <div className="ridepool-card">
              <div className="px-4 py-5 sm:px-6 border-b border-gray-700">
                <h3 className="text-lg font-semibold text-white">Actions</h3>
              </div>
              <div className="border-t border-gray-700">
                <div className="px-4 py-5 sm:p-6 space-y-3">
                  <button
                    onClick={() => setShowFareCalculator(!showFareCalculator)}
                    className="ridepool-btn ridepool-btn-accent w-full flex items-center justify-center px-4 py-3 rounded-lg"
                  >
                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    Fare Calculator
                  </button>
                  
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

            {/* Fare Calculator */}
            {showFareCalculator && (
              <div className="ridepool-card">
                <div className="px-4 py-5 sm:px-6 border-b border-gray-700">
                  <h3 className="text-lg font-semibold text-white">Fare Calculator</h3>
                </div>
                <div className="border-t border-gray-700">
                  <div className="px-4 py-5 sm:p-6">
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">
                          Total Fare Amount (₹)
                        </label>
                        <div className="relative">
                          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <span className="text-gray-400">₹</span>
                          </div>
                          <input
                            type="number"
                            value={fareAmount}
                            onChange={(e) => setFareAmount(e.target.value)}
                            className="ridepool-input pl-8 w-full py-2.5 rounded-lg"
                            placeholder="0.00"
                          />
                        </div>
                      </div>
                      
                      <div className="bg-gradient-to-br from-blue-500 to-blue-600 bg-opacity-20 rounded-lg p-4 border border-blue-500 border-opacity-30">
                        <div className="flex justify-between items-center">
                          <span className="text-sm font-medium text-blue-300">Split among {group?.members.length} members:</span>
                          <span className="text-lg font-bold text-blue-200">
                            ₹{(parseFloat(fareAmount) / (group?.members.length || 1)).toFixed(2) || '0.00'}
                          </span>
                        </div>
                        <p className="text-xs text-blue-400 mt-1">per person</p>
                      </div>
                      
                      <button
                        onClick={calculateFare}
                        disabled={!fareAmount || isNaN(Number(fareAmount))}
                        className="ridepool-btn ridepool-btn-primary w-full py-2.5 rounded-lg font-medium disabled:opacity-50"
                      >
                        Calculate Split
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Right Column - Map and Chat */}
          <div className="lg:col-span-2 space-y-6">
            {/* Map */}
            <GroupMap groupId={id || ''} groupData={group} />
            
            {/* Chat Container */}
            <div className="ridepool-card flex flex-col h-[calc(100vh-400px)]">
              {/* Chat Header */}
              <div className="px-4 py-4 sm:px-6 border-b border-gray-700">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-white">Group Chat</h3>
                  <div className="flex items-center space-x-2">
                    <span className="text-xs text-gray-400">
                      {messages.length} messages
                    </span>
                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                  </div>
                </div>
              </div>
              
              {/* Chat Messages */}
              <div className="flex-1 overflow-y-auto p-4 bg-gray-900 bg-opacity-30">
                <div className="space-y-3">
                  {messages.length === 0 ? (
                    <div className="text-center py-8">
                      <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gray-800 mb-4">
                        <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                        </svg>
                      </div>
                      <p className="text-gray-400">No messages yet. Start the conversation!</p>
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
                                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center">
                                  <span className="text-white text-xs font-bold">
                                    {message.user.charAt(0).toUpperCase()}
                                  </span>
                                </div>
                              </div>
                              <div className="flex flex-col">
                                <div className="flex items-center space-x-2 mb-1">
                                  <span className="text-xs font-medium text-gray-300">
                                    {message.user}
                                  </span>
                                  <span className="text-xs text-gray-500">
                                    {message.time}
                                  </span>
                                </div>
                                <div className="bg-gray-700 rounded-2xl rounded-tl-none px-4 py-2.5">
                                  <p className="text-white text-sm whitespace-pre-wrap">
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
                                  <span className="text-xs font-medium text-green-400">
                                    You
                                  </span>
                                </div>
                                <div className="bg-gradient-to-br from-purple-500 to-blue-500 rounded-2xl rounded-tr-none px-4 py-2.5">
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
              <div className="border-t border-gray-700 p-4">
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
                  <span className="text-xs text-gray-400">
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