import axios from 'axios';

// Create axios instance with default configuration
const api = axios.create({
  baseURL: '/api', // Use relative path with Vite proxy
  timeout: 30000, // 30 second timeout for AI responses
  headers: {
    'Content-Type': 'application/json',
  },
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
  (response) => {
    return response;
  },
  (error) => {
    if (error.response?.status === 401) {
      // Token expired or invalid
      localStorage.removeItem('token');
      delete api.defaults.headers.common['Authorization'];
      window.location.href = '/login';
    }
    
    return Promise.reject(error);
  }
);



// API endpoints for channels
export const channelsAPI = {
  // Get all channels with pagination and filtering
  getAll: (params = {}) => api.get('/channels', { params }),

  // Get single channel
  getById: (id) => api.get(`/channels/${id}`),

  // Create new channel
  create: (data) => api.post('/channels', data),

  // Join channel
  join: (id) => api.post(`/channels/${id}/join`),

  // Leave channel
  leave: (id) => api.post(`/channels/${id}/leave`),

  // Delete channel
  delete: (id) => api.delete(`/channels/${id}`),
};

// Cache utility
const cache = {
  get: (key) => {
    try {
      const item = localStorage.getItem(`cache_${key}`);
      if (item) {
        const { data, timestamp } = JSON.parse(item);
        // Cache valid for 1 minute
        if (Date.now() - timestamp < 60000) {
          return data;
        }
      }
    } catch (error) {
      console.error('Cache read error:', error);
    }
    return null;
  },
  
  set: (key, data) => {
    try {
      localStorage.setItem(`cache_${key}`, JSON.stringify({
        data,
        timestamp: Date.now()
      }));
    } catch (error) {
      console.error('Cache write error:', error);
    }
  },
  
  clear: (key) => {
    try {
      localStorage.removeItem(`cache_${key}`);
    } catch (error) {
      console.error('Cache clear error:', error);
    }
  }
};

// API endpoints for newsletter
export const newsletterAPI = {
  // Subscribe to newsletter
  subscribe: (data) => api.post('/newsletter/subscribe', data),

  // Unsubscribe from newsletter
  unsubscribe: (data) => api.post('/newsletter/unsubscribe', data),

  // Get subscriber status
  getStatus: (email) => api.get(`/newsletter/status/${email}`),

  // Update preferences
  updatePreferences: (data) => api.put('/newsletter/preferences', data),
};

export { api, cache };
