import { getFirestore, collection, addDoc, getDocs, query, orderBy, limit, onSnapshot, Timestamp } from 'firebase/firestore';
import app from './firebase.service';

// Initialize Firestore
const db = getFirestore(app);

// Define chat message interface
export interface ChatMessage {
  id?: string;
  groupId: string;
  senderId: string;
  senderName: string;
  text: string;
  timestamp: Timestamp;
}

// Send a message to a group chat
export const sendGroupMessage = async (
  groupId: string,
  senderId: string,
  senderName: string,
  text: string
): Promise<void> => {
  try {
    // Validate inputs
    if (!groupId) {
      throw new Error('Group ID is required');
    }
    
    if (!senderId) {
      throw new Error('Sender ID is required');
    }
    
    if (!senderName) {
      throw new Error('Sender name is required');
    }
    
    if (!text) {
      throw new Error('Message text is required');
    }
    
    const messagesRef = collection(db, 'groups', groupId, 'messages');
    await addDoc(messagesRef, {
      groupId,
      senderId,
      senderName,
      text,
      timestamp: Timestamp.now()
    });
  } catch (error) {
    console.error('Error sending message:', error);
    throw error;
  }
};

// Get messages for a group chat
export const getGroupMessages = async (groupId: string, limitCount: number = 50): Promise<ChatMessage[]> => {
  try {
    if (!groupId) {
      throw new Error('Group ID is required');
    }
    
    const messagesRef = collection(db, 'groups', groupId, 'messages');
    const q = query(messagesRef, orderBy('timestamp', 'asc'), limit(limitCount));
    const querySnapshot = await getDocs(q);
    
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    } as ChatMessage));
  } catch (error) {
    console.error('Error fetching messages:', error);
    throw error;
  }
};

// Listen for real-time updates to group messages
export const subscribeToGroupMessages = (
  groupId: string,
  callback: (messages: ChatMessage[]) => void
): (() => void) => {
  try {
    if (!groupId) {
      throw new Error('Group ID is required');
    }
    
    const messagesRef = collection(db, 'groups', groupId, 'messages');
    const q = query(messagesRef, orderBy('timestamp', 'asc'));
    
    return onSnapshot(q, (querySnapshot) => {
      const messages: ChatMessage[] = [];
      querySnapshot.forEach((doc) => {
        messages.push({
          id: doc.id,
          ...doc.data()
        } as ChatMessage);
      });
      callback(messages);
    });
  } catch (error) {
    console.error('Error subscribing to messages:', error);
    throw error;
  }
};

export default {
  sendGroupMessage,
  getGroupMessages,
  subscribeToGroupMessages
};