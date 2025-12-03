import io from 'socket.io-client';

class SocketService {
  private socket: any = null;
  private isConnected = false;

  connect(token: string, userId: string) {
    if (this.socket && this.isConnected) {
      return;
    }

    // Get the API base URL from environment variables or use default
    const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';
    
    // Create socket connection
    this.socket = io(API_BASE_URL, {
      transports: ['websocket'],
      auth: {
        token
      }
    });

    // Register user with socket server
    this.socket.on('connect', () => {
      console.log('Connected to socket server');
      this.isConnected = true;
      // Register user with the server
      this.socket?.emit('register_user', userId);
    });

    // Handle disconnection
    this.socket.on('disconnect', () => {
      console.log('Disconnected from socket server');
      this.isConnected = false;
    });

    // Handle connection errors
    this.socket.on('connect_error', (error: Error) => {
      console.error('Socket connection error:', error);
      this.isConnected = false;
    });

    // Handle reconnection attempts
    this.socket.on('reconnect_attempt', (attempt: number) => {
      console.log(`Reconnection attempt: ${attempt}`);
    });

    return this.socket;
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
      this.isConnected = false;
    }
  }

  on(event: string, callback: (...args: any[]) => void) {
    if (this.socket) {
      this.socket.on(event, callback);
    }
  }

  off(event: string, callback?: (...args: any[]) => void) {
    if (this.socket) {
      this.socket.off(event, callback);
    }
  }

  emit(event: string, data: any) {
    if (this.socket) {
      this.socket.emit(event, data);
    }
  }

  isConnectedStatus() {
    return this.isConnected;
  }
}

const socketService = new SocketService();
export default socketService;