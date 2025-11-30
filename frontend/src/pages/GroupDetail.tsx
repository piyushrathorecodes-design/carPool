import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import io from 'socket.io-client';
import axios from 'axios';
import LocationTracker from '../components/LocationTracker';
import GroupMap from '../components/GroupMap';

let socket: any;

const GroupDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [group, setGroup] = useState<any>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [fareAmount, setFareAmount] = useState('');
  const [showFareCalculator, setShowFareCalculator] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError('');
        
        // Fetch group data
        const groupResponse = await axios.get(`/api/group/${id}`);
        
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
          seatCount: groupResponse.data.data.seatCount
        };
        
        setGroup(transformedGroup);
        
        // Fetch chat messages for this group
        const messagesResponse = await axios.get(`/api/chat/history/${id}`);
        
        // Transform messages to match UI structure
        const transformedMessages = messagesResponse.data.data.map((message: any) => ({
          id: message._id,
          user: message.sender.name,
          content: message.content,
          time: new Date(message.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }));
        
        setMessages(transformedMessages);
      } catch (err: any) {
        console.error('Error fetching group data:', err);
        setError('Failed to load group data. Please try again later.');
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
    
    // Initialize socket connection
    socket = io('http://localhost:5000');
    socket.emit('join_room', `group_${id}`);
    
    socket.on('receive_message', (data: any) => {
      setMessages(prev => [...prev, data]);
    });
    
    return () => {
      socket.disconnect();
    };
  }, [id]);

  const sendMessage = async () => {
    if (newMessage.trim() === '') return;
    
    try {
      // Send message to backend
      await axios.post('/api/chat/send', {
        groupId: id,
        content: newMessage,
        messageType: 'text'
      });
      
      // Clear input
      setNewMessage('');
    } catch (err: any) {
      console.error('Error sending message:', err);
      alert('Failed to send message. Please try again.');
    }
  };

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
        <div className="flex justify-center">
          <div className="animate-pulse-glow w-16 h-16 rounded-full bg-gradient-to-r from-purple-500 to-blue-500"></div>
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
          <div className="mt-6">
            <button
              onClick={() => window.location.reload()}
              className="ridepool-btn ridepool-btn-primary inline-flex items-center px-4 py-2 rounded-md text-sm font-medium"
            >
              Retry
            </button>
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