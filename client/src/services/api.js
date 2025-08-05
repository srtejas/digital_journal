import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor for adding auth tokens if needed
api.interceptors.request.use(
  (config) => {
    // Add auth token if available
    const token = localStorage.getItem('authToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor for handling errors
api.interceptors.response.use(
  (response) => response.data,
  (error) => {
    console.error('API Error:', error);
    return Promise.reject(error);
  }
);

export const journalApi = {
  // Questions API
  getDailyQuestions: (date) => {
    const endpoint = date ? `/questions/${date}` : '/questions';
    return api.get(endpoint);
  },

  // Journal Entries API
  saveEntry: (entryData) => api.post('/entries', entryData),
  
  getEntries: (userId, params = {}) => {
    const { startDate, endDate, limit } = params;
    const queryParams = new URLSearchParams();
    if (startDate) queryParams.append('startDate', startDate);
    if (endDate) queryParams.append('endDate', endDate);
    if (limit) queryParams.append('limit', limit);
    
    const queryString = queryParams.toString();
    return api.get(`/entries/${userId}${queryString ? `?${queryString}` : ''}`);
  },

  getEntry: (userId, date) => api.get(`/entries/${userId}/${date}`),
  
  deleteEntry: (userId, date) => api.delete(`/entries/${userId}/${date}`),

  // Analytics API
  getAnalytics: (userId, params = {}) => {
    const { startDate, endDate } = params;
    const queryParams = new URLSearchParams();
    if (startDate) queryParams.append('startDate', startDate);
    if (endDate) queryParams.append('endDate', endDate);
    
    const queryString = queryParams.toString();
    return api.get(`/analytics/${userId}${queryString ? `?${queryString}` : ''}`);
  },

  // Health check
  healthCheck: () => api.get('/health'),
};

// Utility functions
export const formatDate = (date) => {
  if (!date) return new Date().toISOString().split('T')[0];
  if (typeof date === 'string') return date;
  return date.toISOString().split('T')[0];
};

export const generateUserId = () => {
  // For demo purposes, generate a simple user ID
  // In production, this would come from authentication
  let userId = localStorage.getItem('userId');
  if (!userId) {
    userId = `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    localStorage.setItem('userId', userId);
  }
  return userId;
};

export default api;