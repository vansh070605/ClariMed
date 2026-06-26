import axios from 'axios';

// Create an Axios instance
const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000', // Backend URL
  withCredentials: true, // Crucial for sending HttpOnly cookies
  headers: {
    'Content-Type': 'application/json',
  },
});

// Response Interceptor: Handle auth errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // If 401 Unauthorized, maybe redirect to login or clear token
    if (error.response?.status === 401) {
      // Do not force redirect yet to avoid redirect loops, let AuthProvider handle it
    }
    return Promise.reject(error);
  }
);

export default api;
