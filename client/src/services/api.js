import axios from 'axios';

const isProd = process.env.NODE_ENV === 'production';
const API_URL = process.env.REACT_APP_API_URL || (isProd ? '/api' : 'http://localhost:5000/api');

// Base URL for serving static files (images)
export const BASE_URL = process.env.REACT_APP_API_URL
  ? process.env.REACT_APP_API_URL.replace('/api', '')
  : (isProd ? '' : 'http://localhost:5000');

// Create axios instance
const api = axios.create({
  baseURL: API_URL,
});

// Add token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle 401 responses — clear stale auth and redirect
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      localStorage.removeItem('token');
      // Only redirect if not already on login/signup pages
      const path = window.location.pathname;
      if (path !== '/login' && path !== '/signup' && path !== '/') {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

// Auth API
export const authAPI = {
  signup: (name, username, email, password, preferences, gender) =>
    api.post('/auth/signup', { name, username, email, password, preferences, gender }),
  login: (email, password) =>
    api.post('/auth/login', { email, password }),
  getCurrentUser: () =>
    api.get('/auth/me'),
  testProtected: () =>
    api.get('/auth/protected'),
};

// Clothing API
export const clothingAPI = {
  uploadClothing: (formData) =>
    api.post('/clothing/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),
  getClothing: () =>
    api.get('/clothing'),
  getDonatedClothing: () =>
    api.get('/clothing/donated'),
  getClothingById: (id) =>
    api.get(`/clothing/${id}`),
  updateClothing: (id, data) =>
    api.put(`/clothing/${id}`, data),
  deleteClothing: (id) =>
    api.delete(`/clothing/${id}`),
  donateClothing: (id, data) =>
    api.post(`/clothing/${id}/donate`, data),
  filterClothing: (params) =>
    api.get('/clothing/filter', { params }),
};

// Recommend API
export const recommendAPI = {
  getOutfit: (params) =>
    api.get('/recommend/outfit', { params }),
  getWeather: (params) =>
    api.get('/recommend/weather', { params }),
  submitFeedback: (data) => 
    api.post('/recommend/feedback', data),
};

// Outfit History API
export const historyAPI = {
  saveOutfit: (data) => api.post('/history', data),
  getHistory: () => api.get('/history')
};

// Admin API
export const adminAPI = {
  getStats: () => api.get('/admin/stats'),
  getUsers: () => api.get('/admin/users'),
  getDonations: () => api.get('/admin/donations'),
  deleteUser: (id) => api.delete(`/admin/users/${id}`),
  updateUserRole: (id, role) => api.put(`/admin/users/${id}/role`, { role }),
  getUserWardrobe: (id) => api.get(`/admin/users/${id}/wardrobe`),
  getAllClothing: (params) => api.get('/admin/clothing', { params }),
  deleteClothing: (id) => api.delete(`/admin/clothing/${id}`),
  getAnalytics: () => api.get('/admin/analytics'),
  getSystemInfo: () => api.get('/admin/system')
};

export default api;
