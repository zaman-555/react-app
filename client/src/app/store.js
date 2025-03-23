import { configureStore } from '@reduxjs/toolkit';
import authReducer from '../features/authSlice'; // Adjust the path as needed

const store = configureStore({
  reducer: {
    auth: authReducer,
    // Add other reducers here
  },
});

export default store; // Ensure this is present