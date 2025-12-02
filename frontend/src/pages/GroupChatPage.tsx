import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  initializeCometChat, 
  loginToCometChat, 
  getMessages, 
  sendTextMessage,
  attachMessageListener,
  removeMessageListener,
  getLoggedInUser
} from '../services/cometchat.service';
import { useAuth } from '../contexts/AuthContext';

interface Message {
  id: string;
  text: string;
  sender: {
    uid: string;
    name: string;
  };
  timestamp: number;
  type: string;
}

const GroupChatPage: React.FC = () => {
  const { groupId } = useParams<{ groupId: string }>();
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [groupName, setGroupName] = useState('Group Chat');
  const [currentUser, setCurrentUser] = useState<any>(null);
  
  const { user } = useAuth();
  const navigate = useNavigate();
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Initialize and load messages
  useEffect(() => {
    const initAndLoadChat = async () => {
      if (!groupId || !user) {
        navigate('/groups');
        return;
      }

      try {
        setLoading(true);
        await initializeCometChat();
        
        // Login to CometChat
        const loggedInUser = await loginToCometChat(user.id, user.id);
        setCurrentUser(loggedInUser);
        
        // Load messages
        await loadMessages();
      } catch (err) {
        console.error('Error initializing chat:', err);
        setError('Failed to initialize chat. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    initAndLoadChat();

    // Cleanup function
    return () => {
      removeMessageListener('groupChatListener');
    };
  }, [groupId, user, navigate]);

  // Attach message listener for real-time updates
  useEffect(() => {
    if (!groupId || !user) return;

    const onTextMessageReceived = (message: any) => {
      // Check if message is for this group
      if (message.getReceiverType() === 'group' && message.getReceiver().getGuid() === groupId) {
        const newMsg: Message = {
          id: message.getId().toString(),
          text: message.getText(),
          sender: {
            uid: message.getSender().getUid(),
            name: message.getSender().getName() || message.getSender().getUid()
          },
          timestamp: message.getSentAt(),
          type: message.getType()
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
  }, [groupId, user]);

  // Scroll to bottom of messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Load messages from CometChat
  const loadMessages = async () => {
    if (!groupId) return;

    try {
      const messagesData = await getMessages(groupId, 50, 'group');
      
      const formattedMessages: Message[] = messagesData.map(message => {
        // Cast to TextMessage to access text-specific methods
        const textMessage = message as any;
        
        return {
          id: message.getId().toString(),
          text: textMessage.getText(),
          sender: {
            uid: message.getSender().getUid(),
            name: message.getSender().getName() || message.getSender().getUid()
          },
          timestamp: message.getSentAt(),
          type: message.getType()
        };
      });

      setMessages(formattedMessages);
      setError(null);
    } catch (err) {
      console.error('Error loading messages:', err);
      setError('Failed to load messages');
    }
  };

  // Send message
  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newMessage.trim() || !groupId) return;
    
    try {
      setLoading(true);
      
      // Send message through CometChat
      await sendTextMessage(groupId, newMessage, 'group');
      
      // Clear input
      setNewMessage('');
      setError(null);
    } catch (err) {
      console.error('Error sending message:', err);
      setError('Failed to send message. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Format timestamp
  const formatTime = (timestamp: number) => {
    return new Date(timestamp * 1000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  // Go back to groups
  const goBackToGroups = () => {
    navigate('/groups');
  };

  if (loading && messages.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 flex flex-col">
      {/* Chat Header */}
      <div className="bg-gray-800 bg-opacity-50 border-b border-gray-700 p-4">
        <div className="flex items-center">
          <button
            onClick={goBackToGroups}
            className="mr-4 text-gray-300 hover:text-white"
          >
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
          </button>
          <div>
            <h1 className="text-xl font-bold text-white">{groupName}</h1>
            <p className="text-sm text-gray-300">{messages.length} messages</p>
          </div>
        </div>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4">
        {error && (
          <div className="mb-4 p-3 bg-red-500 bg-opacity-20 border border-red-500 border-opacity-30 rounded-md">
            <p className="text-red-200 text-sm">{error}</p>
          </div>
        )}

        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center">
            <svg className="mx-auto h-16 w-16 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
            <h3 className="mt-4 text-lg font-medium text-white">No messages yet</h3>
            <p className="mt-2 text-gray-300">
              Be the first to start the conversation!
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {messages.map((message) => (
              <div 
                key={message.id} 
                className={`flex ${message.sender.uid === user?.id ? 'justify-end' : 'justify-start'}`}
              >
                {message.sender.uid !== user?.id && (
                  <div className="flex-shrink-0 mr-3">
                    <div className="bg-gradient-to-br from-purple-500 to-blue-500 rounded-full w-10 h-10 flex items-center justify-center">
                      <span className="text-white font-bold text-sm">
                        {message.sender.name.charAt(0).toUpperCase()}
                      </span>
                    </div>
                  </div>
                )}
                
                <div className={`max-w-xs lg:max-w-md ${message.sender.uid === user?.id ? 'ml-auto' : ''}`}>
                  {message.sender.uid !== user?.id && (
                    <div className="text-xs font-semibold text-gray-300 mb-1">
                      {message.sender.name}
                    </div>
                  )}
                  <div 
                    className={`px-4 py-2 rounded-2xl ${
                      message.sender.uid === user?.id 
                        ? 'bg-gradient-to-r from-purple-500 to-blue-500 text-white rounded-br-none' 
                        : 'bg-gray-700 text-white rounded-bl-none'
                    }`}
                  >
                    <div className="text-sm">{message.text}</div>
                    <div 
                      className={`text-xs mt-1 ${
                        message.sender.uid === user?.id ? 'text-purple-100' : 'text-gray-300'
                      }`}
                    >
                      {formatTime(message.timestamp)}
                    </div>
                  </div>
                </div>
                
                {message.sender.uid === user?.id && (
                  <div className="flex-shrink-0 ml-3">
                    <div className="bg-gradient-to-br from-green-500 to-teal-500 rounded-full w-10 h-10 flex items-center justify-center">
                      <span className="text-white font-bold text-sm">
                        {message.sender.name.charAt(0).toUpperCase()}
                      </span>
                    </div>
                  </div>
                )}
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>
        )}
      </div>

      {/* Message Input */}
      <div className="border-t border-gray-700 p-4 bg-gray-800 bg-opacity-50">
        <form onSubmit={handleSendMessage} className="flex">
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && !e.shiftKey && handleSendMessage(e as any)}
            placeholder="Type your message..."
            className="flex-1 bg-gray-700 text-white rounded-l-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500"
            disabled={loading}
          />
          <button
            type="submit"
            disabled={loading || !newMessage.trim()}
            className="bg-gradient-to-r from-purple-500 to-blue-500 text-white px-6 py-2 rounded-r-lg hover:from-purple-600 hover:to-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
          >
            Send
          </button>
        </form>
      </div>
    </div>
  );
};

export default GroupChatPage;