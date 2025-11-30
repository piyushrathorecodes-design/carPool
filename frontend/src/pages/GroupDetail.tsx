import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import io from 'socket.io-client';

let socket: any;

const GroupDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [group, setGroup] = useState<any>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [fareAmount, setFareAmount] = useState('');
  const [showFareCalculator, setShowFareCalculator] = useState(false);

  useEffect(() => {
    // In a real app, you would fetch this data from your API
    // For now, we'll use mock data
    setTimeout(() => {
      setGroup({
        id: id,
        name: 'Main Gate to Academic Block',
        members: [
          { id: 1, name: 'You', role: 'admin' },
          { id: 2, name: 'Rahul Sharma', role: 'member' },
          { id: 3, name: 'Priya Patel', role: 'member' }
        ],
        route: {
          pickup: 'Main Gate',
          drop: 'Academic Block'
        },
        status: 'Open',
        seatCount: 4
      });
      
      setMessages([
        { id: 1, user: 'Rahul Sharma', content: 'Hi everyone! Looking forward to our ride tomorrow.', time: '10:30 AM' },
        { id: 2, user: 'You', content: 'Same here! What time are we meeting at the gate?', time: '10:32 AM' },
        { id: 3, user: 'Priya Patel', content: 'Let\'s meet at 8:15 AM sharp.', time: '10:35 AM' }
      ]);
      
      setLoading(false);
    }, 1000);
    
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

  const sendMessage = () => {
    if (newMessage.trim() === '') return;
    
    const messageData = {
      roomId: `group_${id}`,
      user: 'You',
      content: newMessage,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };
    
    socket.emit('send_message', messageData);
    setMessages(prev => [...prev, messageData]);
    setNewMessage('');
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
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="flex justify-center">
          <svg className="animate-spin h-12 w-12 text-blue-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">{group?.name}</h1>
          <p className="mt-1 text-sm text-gray-500">Group details and chat</p>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Group info */}
          <div className="lg:col-span-1 space-y-6">
            <div className="bg-white shadow overflow-hidden sm:rounded-lg">
              <div className="px-4 py-5 sm:px-6 border-b border-gray-200">
                <h3 className="text-lg leading-6 font-medium text-gray-900">Group Details</h3>
              </div>
              <div className="border-t border-gray-200">
                <dl>
                  <div className="px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                    <dt className="text-sm font-medium text-gray-500">Route</dt>
                    <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                      {group?.route.pickup} → {group?.route.drop}
                    </dd>
                  </div>
                  <div className="px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                    <dt className="text-sm font-medium text-gray-500">Status</dt>
                    <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
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
                  <div className="px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                    <dt className="text-sm font-medium text-gray-500">Members</dt>
                    <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                      {group?.members.length} / {group?.seatCount}
                    </dd>
                  </div>
                </dl>
              </div>
            </div>
            
            {/* Members */}
            <div className="bg-white shadow overflow-hidden sm:rounded-lg">
              <div className="px-4 py-5 sm:px-6 border-b border-gray-200">
                <h3 className="text-lg leading-6 font-medium text-gray-900">Members</h3>
              </div>
              <div className="border-t border-gray-200">
                <ul className="divide-y divide-gray-200">
                  {group?.members.map((member: any) => (
                    <li key={member.id} className="px-4 py-4 sm:px-6">
                      <div className="flex items-center">
                        <div className="flex-shrink-0">
                          <div className="bg-gray-200 border-2 border-dashed rounded-xl w-10 h-10" />
                        </div>
                        <div className="ml-3 min-w-0 flex-1">
                          <p className="text-sm font-medium text-gray-900 truncate">
                            {member.name}
                          </p>
                          <p className="text-sm text-gray-500 truncate">
                            {member.role === 'admin' ? 'Group Admin' : 'Member'}
                          </p>
                        </div>
                        {member.role === 'admin' && (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                            Admin
                          </span>
                        )}
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
            
            {/* Actions */}
            <div className="bg-white shadow overflow-hidden sm:rounded-lg">
              <div className="px-4 py-5 sm:px-6 border-b border-gray-200">
                <h3 className="text-lg leading-6 font-medium text-gray-900">Actions</h3>
              </div>
              <div className="border-t border-gray-200">
                <div className="px-4 py-5 sm:p-6 space-y-4">
                  <button
                    onClick={() => setShowFareCalculator(!showFareCalculator)}
                    className="w-full inline-flex justify-center items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                  >
                    <svg className="-ml-1 mr-2 h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    Fare Calculator
                  </button>
                  
                  {group?.status === 'Open' && (
                    <button className="w-full inline-flex justify-center items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-yellow-600 hover:bg-yellow-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-yellow-500">
                      <svg className="-ml-1 mr-2 h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                      </svg>
                      Lock Group
                    </button>
                  )}
                  
                  <button className="w-full inline-flex justify-center items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
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
              <div className="bg-white shadow overflow-hidden sm:rounded-lg">
                <div className="px-4 py-5 sm:px-6 border-b border-gray-200">
                  <h3 className="text-lg leading-6 font-medium text-gray-900">Fare Calculator</h3>
                </div>
                <div className="border-t border-gray-200">
                  <div className="px-4 py-5 sm:p-6">
                    <div className="space-y-4">
                      <div>
                        <label htmlFor="fareAmount" className="block text-sm font-medium text-gray-700">
                          Total Fare Amount (₹)
                        </label>
                        <div className="mt-1 relative rounded-md shadow-sm">
                          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <span className="text-gray-500 sm:text-sm">₹</span>
                          </div>
                          <input
                            type="number"
                            name="fareAmount"
                            id="fareAmount"
                            value={fareAmount}
                            onChange={(e) => setFareAmount(e.target.value)}
                            className="focus:ring-blue-500 focus:border-blue-500 block w-full pl-7 pr-12 py-2 sm:text-sm border-gray-300 rounded-md"
                            placeholder="0.00"
                          />
                        </div>
                      </div>
                      
                      <div className="bg-blue-50 rounded-lg p-4">
                        <div className="flex justify-between">
                          <span className="text-sm font-medium text-blue-800">Split among {group?.members.length} members:</span>
                          <span className="text-sm font-medium text-blue-800">
                            ₹{(parseFloat(fareAmount) / (group?.members.length || 1)).toFixed(2) || '0.00'} each
                          </span>
                        </div>
                      </div>
                      
                      <button
                        onClick={calculateFare}
                        disabled={!fareAmount || isNaN(Number(fareAmount))}
                        className="w-full flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
                      >
                        Calculate Split
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
          
          {/* Chat */}
          <div className="lg:col-span-2">
            <div className="bg-white shadow overflow-hidden sm:rounded-lg flex flex-col h-[calc(100vh-200px)]">
              <div className="px-4 py-5 sm:px-6 border-b border-gray-200">
                <h3 className="text-lg leading-6 font-medium text-gray-900">Group Chat</h3>
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
                            ? 'bg-blue-100 text-blue-900 rounded-br-none' 
                            : 'bg-gray-100 text-gray-900 rounded-bl-none'
                        }`}
                      >
                        {message.user !== 'You' && (
                          <p className="text-xs font-medium text-gray-500 mb-1">{message.user}</p>
                        )}
                        <p className="text-sm">{message.content}</p>
                        <p className={`text-xs mt-1 ${message.user === 'You' ? 'text-blue-700' : 'text-gray-500'}`}>
                          {message.time}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              
              <div className="border-t border-gray-200 p-4">
                <div className="flex">
                  <textarea
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    onKeyPress={handleKeyPress}
                    rows={2}
                    className="flex-1 shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md"
                    placeholder="Type your message..."
                  />
                  <button
                    onClick={sendMessage}
                    disabled={!newMessage.trim()}
                    className="ml-3 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
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