import React, { useState, useEffect, useRef } from 'react';
import { CometChat } from '@cometchat/chat-sdk-javascript';
import { 
  initializeCometChat, 
  loginToCometChat, 
  sendTextMessage, 
  getMessages, 
  attachMessageListener, 
  removeMessageListener,
  getUsersList,
  getGroupsList,
  joinGroup
} from '../services/cometchat.service';

interface Message {
  id: string;
  text: string;
  sender: {
    uid: string;
    name: string;
  };
  receiver: {
    uid?: string;
    guid?: string;
  };
  timestamp: number;
  type: string;
}

interface User {
  uid: string;
  name: string;
}

interface Group {
  guid: string;
  name: string;
  type: string;
}

const ChatWindow: React.FC = () => {
  const [currentUser, setCurrentUser] = useState<CometChat.User | null>(null);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [selectedGroup, setSelectedGroup] = useState<Group | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [users, setUsers] = useState<User[]>([]);
  const [groups, setGroups] = useState<Group[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Initialize CometChat
  useEffect(() => {
    const initCometChat = async () => {
      try {
        await initializeCometChat();
        // Try to get already logged in user
        const loggedInUser = await CometChat.getLoggedinUser();
        if (loggedInUser) {
          setCurrentUser(loggedInUser);
          await loadUsersAndGroups();
        }
      } catch (err) {
        console.error('Error initializing CometChat:', err);
        setError('Failed to initialize chat. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    initCometChat();

    // Cleanup function
    return () => {
      removeMessageListener('chatWindowListener');
    };
  }, []);

  // Load users and groups
  const loadUsersAndGroups = async () => {
    try {
      const usersList = await getUsersList(30);
      const groupsList = await getGroupsList(30);
      
      setUsers(usersList.map(user => ({
        uid: user.getUid(),
        name: user.getName() || user.getUid()
      })));
      
      setGroups(groupsList.map(group => ({
        guid: group.getGuid(),
        name: group.getName(),
        type: group.getType()
      })));
    } catch (err) {
      console.error('Error loading users and groups:', err);
      setError('Failed to load users and groups.');
    }
  };

  // Scroll to bottom of messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Attach message listener
  useEffect(() => {
    if (!currentUser) return;

    const onTextMessageReceived = (message: CometChat.BaseMessage) => {
      // Add the new message to the messages array
      // Cast to TextMessage to access text-specific methods
      const textMessage = message as CometChat.TextMessage;
      
      const newMsg: Message = {
        id: message.getId().toString(),
        text: textMessage.getText(),
        sender: {
          uid: message.getSender().getUid(),
          name: message.getSender().getName() || message.getSender().getUid()
        },
        receiver: message.getReceiverType() === CometChat.RECEIVER_TYPE.USER 
          ? { uid: (message.getReceiver() as CometChat.User).getUid() }
          : { guid: (message.getReceiver() as CometChat.Group).getGuid() },
        timestamp: message.getSentAt(),
        type: message.getType()
      };

      setMessages(prev => [...prev, newMsg]);
    };

    attachMessageListener(
      'chatWindowListener',
      onTextMessageReceived
    );

    return () => {
      removeMessageListener('chatWindowListener');
    };
  }, [currentUser]);

  // Login user
  const handleLogin = async (uid: string, name: string) => {
    try {
      setLoading(true);
      // First create the user
      const user = new CometChat.User(uid);
      user.setName(name);
      
      try {
        await CometChat.createUser(user, import.meta.env.VITE_COMETCHAT_AUTH_KEY);
      } catch (createError) {
        // User might already exist, which is fine
        console.log('User might already exist, continuing with login');
      }
      
      // Then login
      const loggedInUser = await loginToCometChat(uid);
      setCurrentUser(loggedInUser);
      await loadUsersAndGroups();
      setError(null);
    } catch (err) {
      console.error('Error logging in:', err);
      setError('Failed to login. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Send message
  const handleSendMessage = async () => {
    if (!newMessage.trim() || !currentUser) return;
    
    if (!selectedUser && !selectedGroup) {
      setError('Please select a user or group to send message to.');
      return;
    }

    try {
      setLoading(true);
      let message: CometChat.BaseMessage;
      
      if (selectedUser) {
        message = await sendTextMessage(selectedUser.uid, newMessage, 'user');
      } else if (selectedGroup) {
        message = await sendTextMessage(selectedGroup.guid, newMessage, 'group');
      } else {
        throw new Error('No recipient selected');
      }

      // Cast to TextMessage to access text-specific methods
      const textMessage = message as CometChat.TextMessage;

      // Add message to local state
      const newMsg: Message = {
        id: message.getId().toString(),
        text: textMessage.getText(),
        sender: {
          uid: currentUser.getUid(),
          name: currentUser.getName() || currentUser.getUid()
        },
        receiver: selectedUser 
          ? { uid: selectedUser.uid } 
          : { guid: selectedGroup?.guid || '' },
        timestamp: message.getSentAt(),
        type: message.getType()
      };

      setMessages(prev => [...prev, newMsg]);
      setNewMessage('');
      setError(null);
    } catch (err) {
      console.error('Error sending message:', err);
      setError('Failed to send message. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Load messages for selected user or group
  const loadMessages = async () => {
    if (!selectedUser && !selectedGroup) return;

    try {
      setLoading(true);
      let messagesData: CometChat.BaseMessage[] = [];
      
      if (selectedUser) {
        messagesData = await getMessages(selectedUser.uid, 30, 'user');
      } else if (selectedGroup) {
        messagesData = await getMessages(selectedGroup.guid, 30, 'group');
      }

      const formattedMessages: Message[] = messagesData.map(message => {
        // Cast to TextMessage to access text-specific methods
        const textMessage = message as CometChat.TextMessage;
        
        return {
          id: message.getId().toString(),
          text: textMessage.getText(),
          sender: {
            uid: message.getSender().getUid(),
            name: message.getSender().getName() || message.getSender().getUid()
          },
          receiver: message.getReceiverType() === CometChat.RECEIVER_TYPE.USER 
            ? { uid: (message.getReceiver() as CometChat.User).getUid() }
            : { guid: (message.getReceiver() as CometChat.Group).getGuid() },
          timestamp: message.getSentAt(),
          type: message.getType()
        };
      });

      setMessages(formattedMessages);
      setError(null);
    } catch (err) {
      console.error('Error loading messages:', err);
      setError('Failed to load messages.');
    } finally {
      setLoading(false);
    }
  };

  // Join group
  const handleJoinGroup = async (group: Group) => {
    try {
      setLoading(true);
      await joinGroup(group.guid, group.type as any);
      setSelectedGroup(group);
      setSelectedUser(null);
      await loadMessages();
      setError(null);
    } catch (err) {
      console.error('Error joining group:', err);
      setError('Failed to join group. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Select user
  const handleSelectUser = async (user: User) => {
    setSelectedUser(user);
    setSelectedGroup(null);
    await loadMessages();
  };

  // Select group
  const handleSelectGroup = async (group: Group) => {
    setSelectedGroup(group);
    setSelectedUser(null);
    await loadMessages();
  };

  // Format timestamp
  const formatTime = (timestamp: number) => {
    return new Date(timestamp * 1000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  // Format date
  const formatDate = (timestamp: number) => {
    const date = new Date(timestamp * 1000);
    const today = new Date();
    
    if (date.toDateString() === today.toDateString()) {
      return 'Today';
    }
    
    return date.toLocaleDateString();
  };

  if (loading && !currentUser) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500"></div>
        <span className="ml-3 text-gray-600">Initializing chat...</span>
      </div>
    );
  }

  if (!currentUser) {
    return (
      <div className="max-w-md mx-auto mt-10 p-6 bg-white rounded-lg shadow-md">
        <h2 className="text-2xl font-bold text-center text-gray-800 mb-6">Login to Chat</h2>
        <LoginForm onLogin={handleLogin} loading={loading} />
        {error && (
          <div className="mt-4 p-3 bg-red-100 text-red-700 rounded-md">
            {error}
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-gray-50">
      {/* Chat Header */}
      <div className="bg-white shadow-sm p-4 border-b">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-gray-800">Campus Chat</h1>
            <p className="text-sm text-gray-600">
              {selectedUser 
                ? `Chatting with ${selectedUser.name}` 
                : selectedGroup 
                  ? `Group: ${selectedGroup.name}` 
                  : 'Select a user or group to start chatting'}
            </p>
          </div>
          <div className="flex items-center">
            <span className="text-sm text-gray-600 mr-2">{currentUser.getName() || currentUser.getUid()}</span>
            <div className="w-8 h-8 rounded-full bg-purple-500 flex items-center justify-center text-white font-bold">
              {currentUser.getName()?.charAt(0) || currentUser.getUid()?.charAt(0)}
            </div>
          </div>
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar - Users and Groups */}
        <div className="w-1/3 bg-white border-r flex flex-col">
          {/* Users List */}
          <div className="p-4 border-b">
            <h2 className="font-semibold text-gray-700 mb-2">Users</h2>
            <div className="space-y-2 max-h-60 overflow-y-auto">
              {users.map(user => (
                <div 
                  key={user.uid}
                  className={`p-2 rounded cursor-pointer hover:bg-gray-100 ${
                    selectedUser?.uid === user.uid ? 'bg-purple-100' : ''
                  }`}
                  onClick={() => handleSelectUser(user)}
                >
                  <div className="flex items-center">
                    <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center text-white text-sm font-bold mr-2">
                      {user.name.charAt(0)}
                    </div>
                    <span className="text-gray-800">{user.name}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Groups List */}
          <div className="p-4">
            <h2 className="font-semibold text-gray-700 mb-2">Groups</h2>
            <div className="space-y-2 max-h-60 overflow-y-auto">
              {groups.map(group => (
                <div 
                  key={group.guid}
                  className={`p-2 rounded cursor-pointer hover:bg-gray-100 ${
                    selectedGroup?.guid === group.guid ? 'bg-purple-100' : ''
                  }`}
                  onClick={() => handleSelectGroup(group)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <div className="w-8 h-8 rounded-full bg-green-500 flex items-center justify-center text-white text-sm font-bold mr-2">
                        #
                      </div>
                      <span className="text-gray-800">{group.name}</span>
                    </div>
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        handleJoinGroup(group);
                      }}
                      className="text-xs bg-purple-500 text-white px-2 py-1 rounded hover:bg-purple-600"
                    >
                      Join
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Main Chat Area */}
        <div className="flex-1 flex flex-col">
          {/* Messages Area */}
          <div className="flex-1 overflow-y-auto p-4">
            {messages.length === 0 ? (
              <div className="flex items-center justify-center h-full">
                <div className="text-center text-gray-500">
                  <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                  </svg>
                  <p className="mt-2">No messages yet</p>
                  <p className="text-sm">Start a conversation by sending a message</p>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                {messages.map((message) => (
                  <div 
                    key={message.id} 
                    className={`flex ${message.sender.uid === currentUser.getUid() ? 'justify-end' : 'justify-start'}`}
                  >
                    <div 
                      className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                        message.sender.uid === currentUser.getUid() 
                          ? 'bg-purple-500 text-white rounded-br-none' 
                          : 'bg-white text-gray-800 border rounded-bl-none'
                      }`}
                    >
                      {message.sender.uid !== currentUser.getUid() && (
                        <div className="text-xs font-semibold mb-1">
                          {message.sender.name}
                        </div>
                      )}
                      <div className="text-sm">{message.text}</div>
                      <div 
                        className={`text-xs mt-1 ${
                          message.sender.uid === currentUser.getUid() ? 'text-purple-200' : 'text-gray-500'
                        }`}
                      >
                        {formatTime(message.timestamp)}
                      </div>
                    </div>
                  </div>
                ))}
                <div ref={messagesEndRef} />
              </div>
            )}
          </div>

          {/* Message Input */}
          {(selectedUser || selectedGroup) && (
            <div className="border-t p-4 bg-white">
              {error && (
                <div className="mb-2 p-2 bg-red-100 text-red-700 rounded text-sm">
                  {error}
                </div>
              )}
              <div className="flex">
                <input
                  type="text"
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                  placeholder="Type your message..."
                  className="flex-1 border rounded-l-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500"
                  disabled={loading}
                />
                <button
                  onClick={handleSendMessage}
                  disabled={loading || !newMessage.trim()}
                  className="bg-purple-500 text-white px-6 py-2 rounded-r-lg hover:bg-purple-600 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? 'Sending...' : 'Send'}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// Simple login form component
const LoginForm: React.FC<{ 
  onLogin: (uid: string, name: string) => void; 
  loading: boolean;
}> = ({ onLogin, loading }) => {
  const [uid, setUid] = useState('');
  const [name, setName] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (uid.trim() && name.trim()) {
      onLogin(uid.trim(), name.trim());
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label htmlFor="uid" className="block text-sm font-medium text-gray-700">User ID</label>
        <input
          type="text"
          id="uid"
          value={uid}
          onChange={(e) => setUid(e.target.value)}
          className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-purple-500 focus:border-purple-500"
          placeholder="Enter your user ID"
          required
        />
      </div>
      <div>
        <label htmlFor="name" className="block text-sm font-medium text-gray-700">Name</label>
        <input
          type="text"
          id="name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-purple-500 focus:border-purple-500"
          placeholder="Enter your name"
          required
        />
      </div>
      <button
        type="submit"
        disabled={loading}
        className="w-full bg-purple-500 text-white py-2 px-4 rounded-md hover:bg-purple-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 disabled:opacity-50"
      >
        {loading ? 'Logging in...' : 'Login to Chat'}
      </button>
    </form>
  );
};

export default ChatWindow;