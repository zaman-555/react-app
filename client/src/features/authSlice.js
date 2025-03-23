import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

const API_URL = 'http://localhost:5000/api/auth';

// Async Thunks
export const registerUser = createAsyncThunk(
  '/register',
  async (userData, { rejectWithValue }) => {
    try {
      const response = await axios.post(`${API_URL}/register`, userData);
      localStorage.setItem('token', response.data.token);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);

export const loginUser = createAsyncThunk(
  'auth/login',
  async (userData, { rejectWithValue }) => {
    try {
      const response = await axios.post(`${API_URL}/login`, userData);
      localStorage.setItem('token', response.data.token);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);

export const verifyEmail = createAsyncThunk(
  '/verifyEmail',
  async (token, { rejectWithValue }) => {
    try {
      const response = await axios.get(`${API_URL}/verify/${token}`);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);

export const requestPasswordReset = createAsyncThunk(
  '/requestPasswordReset',
  async (email, { rejectWithValue }) => {
    try {
      const response = await axios.post(`${API_URL}/request-password-reset`, { email });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);

export const resetPassword = createAsyncThunk(
  '/resetPassword',
  async ({ token, password }, { rejectWithValue }) => {
    try {
      const response = await axios.post(`${API_URL}/reset-password/${token}`, { password });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);

export const googleLogin = createAsyncThunk(
  'auth/googleLogin',
  async (_, { rejectWithValue }) => {
    try {
      window.location.href = `${API_URL}/google`;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const handleGoogleCallback = createAsyncThunk(
  'auth/handleGoogleCallback',
  async (token, { rejectWithValue }) => {
    try {
      if (!token) {
        throw new Error('No token found in the callback URL.');
      }

      const response = await axios.get(`${API_URL}/user`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      return {
        user: response.data.user,
        token,
      };
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

// Slice
const authSlice = createSlice({
  name: 'auth',
  initialState: {
    user: null,
    token: localStorage.getItem('token') || null,
    loading: false,
    error: null,
  },
  reducers: {
    logout: (state) => {
      localStorage.removeItem('token');
      state.user = null;
      state.token = null;
      state.error = null;
      state.loading = false;
    },
    clearAuthError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(registerUser.pending, (state) => {
        state.loading = true;
      })
      .addCase(registerUser.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload.user;
        state.token = action.payload.token;
      })
      .addCase(registerUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload.message;
      })
      .addCase(loginUser.pending, (state) => {
        state.loading = true;
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload.user;
        state.token = action.payload.token;
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload.message;
      })
      .addCase(verifyEmail.pending, (state) => {
        state.loading = true;
      })
      .addCase(verifyEmail.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload.user;
        state.token = action.payload.token;
      })
      .addCase(verifyEmail.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload.message;
      })
      .addCase(googleLogin.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(googleLogin.fulfilled, (state) => {
        state.loading = false;
      })
      .addCase(googleLogin.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'An error occurred during Google OAuth.';
      })
      .addCase(handleGoogleCallback.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(handleGoogleCallback.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload.user;
        state.token = action.payload.token;
        state.error = null;
      })
      .addCase(handleGoogleCallback.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'An error occurred during Google OAuth.';
      });
  },
});

// Export actions
export const { logout, clearAuthError } = authSlice.actions;

export default authSlice.reducer;