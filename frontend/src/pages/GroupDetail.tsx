import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  initializeCometChat, 
  loginToCometChat, 
  getMessages, 
  sendTextMessage,
  attachMessageListener,
  removeMessageListener
} from '../services/cometchat.service';
import { groupAPI } from '../services/api.service';
import { useAuth } from '../contexts/AuthContext';
import LocationTracker from '../components/LocationTracker';
import GroupMap from '../components/GroupMap';

interface ChatMessage {
  id: string;
  user: string;
  content: string;
  time: string;
}

let isCometChatInitialized = false;

const GroupDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAuth();
  const [group, setGroup] = useState<any>(null);
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
        alert('Invalid group ID.');
        return;
      }
      
      await groupAPI.join(id);
      // Refresh the page to load the group data
      window.location.reload();
    } catch (err: any) {
      console.error('Error joining group:', err);
      if (err.response?.status === 400) {
        alert(`Error joining group: ${err.response.data.message || 'Group is full or you are already a member.'}`);
      } else if (err.response?.status === 404) {
        alert('Group not found.');
      } else if (err.response?.status === 401) {
        alert('You must be logged in to join a group.');
      } else {
        alert(`Failed to join group: ${err.message || 'Please try again.'}`);
      }
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError('');
        
        // Check if user is authenticated
        if (!isAuthenticated || !user) {
          setError('You must be logged in to view group details.');
          setLoading(false);
          return;
        }
        
        // Check if group ID is provided
        if (!id || id === 'create') {
          setError('Invalid group ID.');
          setLoading(false);
          // Redirect to groups page after a delay
          setTimeout(() => {
            navigate('/groups');
          }, 2000);
          return;
        }
        
        // Fetch group data
        const groupResponse = await groupAPI.getById(id);
        
        // Transform group data to match UI structure
        const transformedGroup = {
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
        
        // Initialize and login to CometChat
        if (user && !isCometChatInitialized) {
          try {
            await initializeCometChat();
            await loginToCometChat(user.id, user.id);
            isCometChatInitialized = true;
          } catch (chatError) {
            console.log('CometChat initialization/login error:', chatError);
          }
        }
        
        // Fetch chat messages for this group
        if (transformedGroup.chatRoomId) {
          try {
            const messagesData = await getMessages(transformedGroup.chatRoomId, 50, 'group');
            
            const transformedMessages = messagesData.map((message: any) => ({
              id: message.getId().toString(),
              user: message.getSender().getName() || message.getSender().getUid(),
              content: message.getText(),
              time: new Date(message.getSentAt() * 1000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
            }));
            
            setMessages(transformedMessages);
          } catch (msgError) {
            console.error('Error fetching messages:', msgError);
            // Don't show error to user, just log it
          }
        }
      } catch (err: any) {
        console.error('Error fetching group data:', err);
        // Check if it's a 403 error (not a member)
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
    
    // Attach message listener for real-time updates
    const onTextMessageReceived = (message: any) => {
      // Check if message is for this group
      if (message.getReceiverType() === 'group') {
        const newMsg = {
          id: message.getId().toString(),
          user: message.getSender().getName() || message.getSender().getUid(),
          content: message.getText(),
          time: new Date(message.getSentAt() * 1000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        };
        
        setMessages(prev => [...prev, newMsg]);
      }
    };
    
    attachMessageListener(
      'groupChatListener',
      onTextMessageReceived
    );
    
    return () => {
      removeMessageListener('groupChatListener');
    };
  }, [id, isAuthenticated]);

  const sendMessage = async () => {
    if (newMessage.trim() === '' || !id) return;
    
    try {
      // Send message through CometChat
      if (group && group.chatRoomId) {
        await sendTextMessage(group.chatRoomId, newMessage, 'group');
        
        // Add message to local state
        const newMsg = {
          id: Date.now().toString(),
          user: 'You',
          content: newMessage,
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        };
        
        setMessages(prev => [...prev, newMsg]);
        setNewMessage('');
      }
    } catch (err: any) {
      console.error('Error sending message:', err);
      alert('Failed to send message. Please try again.');
    }
  };

  // Scroll to bottom of messages
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-white">{group?.name}</h1>
          <p className="mt-1 text-sm text-gray-300">Group details and chat</p>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Group info */}
          <div className="lg:col-span-1 space-y-6">
            <div className="ridepool-card">
              <div className="px-4 py-5 sm:px-6 border-b border-gray-700">
                <h3 className="text-lg leading-6 font-medium text-white">Group Details</h3>
              </div>
              <div className="border-t border-gray-700">
                <dl>
                  <div className="px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                    <dt className="text-sm font-medium text-gray-300">Route</dt>
                    <dd className="mt-1 text-sm text-white sm:mt-0 sm:col-span-2">
                      {group?.route.pickup} → {group?.route.drop}
                    </dd>
                  </div>
                  <div className="px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                    <dt className="text-sm font-medium text-gray-300">Status</dt>
                    <dd className="mt-1 text-sm text-white sm:mt-0 sm:col-span-2">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
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
                  <div className="px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                    <dt className="text-sm font-medium text-gray-300">Members</dt>
                    <dd className="mt-1 text-sm text-white sm:mt-0 sm:col-span-2">
                      {group?.members.length} / {group?.seatCount}
                    </dd>
                  </div>
                </dl>
              </div>
            </div>
            
            {/* Members */}
            <div className="ridepool-card">
              <div className="px-4 py-5 sm:px-6 border-b border-gray-700">
                <h3 className="text-lg leading-6 font-medium text-white">Members</h3>
              </div>
              <div className="border-t border-gray-700">
                <ul className="divide-y divide-gray-700">
                  {group?.members.map((member: any) => (
                    <li key={member.id} className="px-4 py-4 sm:px-6 hover:bg-gray-700 hover:bg-opacity-30 transition-colors duration-200">
                      <div className="flex items-center">
                        <div className="flex-shrink-0">
                          <div className="bg-gradient-to-br from-purple-500 to-blue-500 rounded-xl w-10 h-10 flex items-center justify-center">
                            <span className="text-white font-bold">
                              {member.name.charAt(0)}
                            </span>
                          </div>
                        </div>
                        <div className="ml-3 min-w-0 flex-1">
                          <p className="text-sm font-medium text-white truncate">
                            {member.name}
                          </p>
                          <p className="text-sm text-gray-300 truncate">
                            {member.role === 'admin' ? 'Group Admin' : 'Member'}
                          </p>
                          {member.year !== 'N/A' && member.branch !== 'N/A' && (
                            <p className="text-xs text-gray-400">
                              {member.year} • {member.branch}
                            </p>
                          )}
                        </div>
                        {member.role === 'admin' && (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-500 bg-opacity-20 text-blue-300">
                            Admin
                          </span>
                        )}
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
            
            {/* Location Tracking */}
            <LocationTracker />
            
            {/* Actions */}
            <div className="ridepool-card">
              <div className="px-4 py-5 sm:px-6 border-b border-gray-700">
                <h3 className="text-lg leading-6 font-medium text-white">Actions</h3>
              </div>
              <div className="border-t border-gray-700">
                <div className="px-4 py-5 sm:p-6 space-y-4">
                  <button
                    onClick={() => setShowFareCalculator(!showFareCalculator)}
                    className="ridepool-btn ridepool-btn-accent w-full inline-flex justify-center items-center px-4 py-2 rounded-md text-sm font-medium"
                  >
                    <svg className="-ml-1 mr-2 h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    Fare Calculator
                  </button>
                  
                  {group?.status === 'Open' && (
                    <button className="ridepool-btn ridepool-btn-secondary w-full inline-flex justify-center items-center px-4 py-2 rounded-md text-sm font-medium">
                      <svg className="-ml-1 mr-2 h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                      </svg>
                      Lock Group
                    </button>
                  )}
                  
                  <button className="ridepool-btn ridepool-btn-primary w-full inline-flex justify-center items-center px-4 py-2 rounded-md text-sm font-medium">
                    <svg className="-ml-1 mr-2 h-5 w-5 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                    </svg>
                    Leave Group
                  </button>
                </div>
              </div>
            </div>
            
            {/* Fare calculator */}
            {showFareCalculator && (
              <div className="ridepool-card">
                <div className="px-4 py-5 sm:px-6 border-b border-gray-700">
                  <h3 className="text-lg leading-6 font-medium text-white">Fare Calculator</h3>
                </div>
                <div className="border-t border-gray-700">
                  <div className="px-4 py-5 sm:p-6">
                    <div className="space-y-4">
                      <div>
                        <label htmlFor="fareAmount" className="block text-sm font-medium text-gray-300">
                          Total Fare Amount (₹)
                        </label>
                        <div className="mt-1 relative rounded-md shadow-sm">
                          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <span className="text-gray-400 sm:text-sm">₹</span>
                          </div>
                          <input
                            type="number"
                            name="fareAmount"
                            id="fareAmount"
                            value={fareAmount}
                            onChange={(e) => setFareAmount(e.target.value)}
                            className="ridepool-input focus:z-10 block w-full pl-7 pr-12 py-2 sm:text-sm rounded-md"
                            placeholder="0.00"
                          />
                        </div>
                      </div>
                      
                      <div className="bg-gradient-to-br from-blue-500 to-blue-600 bg-opacity-20 rounded-lg p-4 border border-blue-500 border-opacity-30">
                        <div className="flex justify-between">
                          <span className="text-sm font-medium text-blue-300">Split among {group?.members.length} members:</span>
                          <span className="text-sm font-medium text-blue-300">
                            ₹{(parseFloat(fareAmount) / (group?.members.length || 1)).toFixed(2) || '0.00'} each
                          </span>
                        </div>
                      </div>
                      
                      <button
                        onClick={calculateFare}
                        disabled={!fareAmount || isNaN(Number(fareAmount))}
                        className="ridepool-btn ridepool-btn-primary w-full flex justify-center py-2 px-4 rounded-md text-sm font-medium disabled:opacity-50"
                      >
                        Calculate Split
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
          
          {/* Map and Chat */}
          <div className="lg:col-span-2 space-y-6">
            <GroupMap groupId={id || ''} />
            
            <div className="ridepool-card flex flex-col h-[calc(100vh-400px)]">
              <div className="px-4 py-5 sm:px-6 border-b border-gray-700">
                <h3 className="text-lg leading-6 font-medium text-white">Group Chat</h3>
              </div>
              
              <div className="flex-1 overflow-y-auto p-4">
                <div className="space-y-4">
                  {messages.map((message) => (
                    <div 
                      key={message.id} 
                      className={`flex ${message.user === 'You' ? 'justify-end' : 'justify-start'}`}
                    >
                      <div 
                        className={`max-w-xs md:max-w-md px-4 py-2 rounded-lg ${
                          message.user === 'You' 
                            ? 'bg-gradient-to-br from-purple-500 to-blue-500 text-white rounded-br-none' 
                            : 'bg-gray-700 bg-opacity-50 text-white rounded-bl-none'
                        }`}
                      >
                        {message.user !== 'You' && (
                          <p className="text-xs font-medium text-gray-300 mb-1">{message.user}</p>
                        )}
                        <p className="text-sm">{message.content}</p>
                        <p className={`text-xs mt-1 ${message.user === 'You' ? 'text-blue-200' : 'text-gray-400'}`}>
                          {message.time}
                        </p>
                      </div>
                    </div>
                  ))}
                  <div ref={messagesEndRef} />
                </div>
              </div>
              
              <div className="border-t border-gray-700 p-4">
                <div className="flex">
                  <textarea
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    onKeyPress={handleKeyPress}
                    rows={2}
                    className="ridepool-input flex-1 focus:z-10 block w-full sm:text-sm rounded-md"
                    placeholder="Type your message..."
                  />
                  <button
                    onClick={sendMessage}
                    disabled={!newMessage.trim()}
                    className="ridepool-btn ridepool-btn-primary ml-3 inline-flex items-center px-4 py-2 rounded-md text-sm font-medium disabled:opacity-50"
                  >
                    Send
                  </button>
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