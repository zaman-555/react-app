import axios from 'axios';

const API_URL = 'http://localhost:5000/api/auth';

// Register a new user
export const register = async (userData) => {
  return axios.post(`${API_URL}/register`, userData);
};

// Login with email and password
export const login = async (credentials) => {
  return axios.post(`${API_URL}/login`, credentials);
};

// Verify email with token
export const verifyEmail = async (token) => {
  return axios.get(`${API_URL}/verify?token=${token}`);
};

// Request password reset
export const requestPasswordReset = async (email) => {
  return axios.post(`${API_URL}/request-password-reset`, { email });
};

// Reset password
export const resetPassword = async (data) => {
  return axios.post(`${API_URL}/reset-password`, data);
};

// Google OAuth login
export const googleLogin = async (googleData) => {
  return axios.post(`${API_URL}/google/callback`, googleData);
};