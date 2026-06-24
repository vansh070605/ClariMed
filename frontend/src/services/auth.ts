import api from './api';

export const login = async (email: string, password: string) => {
  const formData = new URLSearchParams();
  formData.append('username', email); // OAuth2 expects 'username' field
  formData.append('password', password);

  const response = await api.post('/auth/login', formData, {
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
  });
  return response.data;
};

export const register = async (name: string, email: string, password: string) => {
  const response = await api.post('/auth/register', { name, email, password });
  return response.data;
};

export const logout = async () => {
  const response = await api.post('/auth/logout');
  return response.data;
};

export const getCurrentUser = async () => {
  const response = await api.get('/auth/me');
  return response.data;
};

export const updateProfile = async (name: string) => {
  const response = await api.put('/auth/profile', { name });
  return response.data;
};

export const updatePassword = async (currentPassword: string, newPassword: string) => {
  const response = await api.put('/auth/password', { 
    current_password: currentPassword, 
    new_password: newPassword 
  });
  return response.data;
};
