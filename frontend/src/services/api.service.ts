// frontend/src/services/api.service.ts

import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true, // Important for cookies
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token expired or invalid
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Auth APIs
export const authAPI = {
  register: (data: any) => api.post('/api/auth/register', data),
  login: (data: any) => api.post('/api/auth/login', data),
  getMe: () => api.get('/api/auth/me'),
  logout: () => api.get('/api/auth/logout'),
};

// User APIs
export const userAPI = {
  getProfile: () => api.get('/api/auth/me'),
  updateProfile: (id: string, data: any) => api.put(`/api/users/${id}`, data),
  updateLocation: (coordinates: [number, number]) => 
    api.put('/api/users/location', { coordinates }),
  getNearbyUsers: (longitude: number, latitude: number, maxDistance?: number) =>
    api.get('/api/users/nearby', { params: { longitude, latitude, maxDistance } }),
};

// Pool APIs
export const poolAPI = {
  create: (data: any) => api.post('/api/pool/create', data),
  getAll: () => api.get('/api/pool/requests'),
  getMyRequests: () => api.get('/api/pool/my-requests'),
  getById: (id: string) => api.get(`/api/pool/${id}`),
  delete: (id: string) => api.delete(`/api/pool/${id}`),
  updateStatus: (id: string, status: string) => 
    api.patch(`/api/pool/${id}/status`, { status }),
  match: (data: any) => api.post('/api/pool/match', data),
};

// Group APIs
export const groupAPI = {
  create: (data: any) => api.post('/api/group/create', data),
  getMyGroups: () => api.get('/api/group/mygroups'),
  getById: (id: string) => api.get(`/api/group/${id}`),
  join: (id: string) => api.post(`/api/group/join/${id}`),
  leave: (id: string) => api.post(`/api/group/leave/${id}`),
  lock: (id: string) => api.patch(`/api/group/lock/${id}`),
};

// Chat APIs
export const chatAPI = {
  sendMessage: (data: any) => api.post('/api/chat/send', data),
  getHistory: (groupId: string) => api.get(`/api/chat/history/${groupId}`),
  markAsRead: (messageId: string) => api.put(`/api/chat/read/${messageId}`),
};

// Notification APIs
export const notificationAPI = {
  getAll: () => api.get('/api/notifications'),
  getUnreadCount: () => api.get('/api/notifications/unread-count'),
  markAsRead: (id: string) => api.put(`/api/notifications/${id}/read`),
  markAllAsRead: () => api.put('/api/notifications/read-all'),
  delete: (id: string) => api.delete(`/api/notifications/${id}`),
};

// Admin APIs
export const adminAPI = {
  getAllUsers: () => api.get('/api/admin/users'),
  getAllGroups: () => api.get('/api/admin/groups'),
  getAllPoolRequests: () => api.get('/api/admin/pool-requests'),
  banUser: (id: string) => api.put(`/api/admin/users/${id}/ban`),
  deleteGroup: (id: string) => api.delete(`/api/admin/groups/${id}`),
  sendAnnouncement: (data: any) => api.post('/api/admin/announcement', data),
};

export default api;