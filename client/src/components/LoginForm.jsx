import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, useLocation } from 'react-router-dom';
import { loginUser, googleLogin, handleGoogleCallback, clearAuthError } from '../features/authSlice';

const LoginForm = () => {
  const [formData, setFormData] = useState({ email: '', password: '' });
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const { loading, error: authError, user, token } = useSelector((state) => state.auth);

  // Get error message from location state (e.g., from GoogleAuthCallbackPage)
  const errorMessage = location.state?.error;

  // Handle Google OAuth callback when the component mounts
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const token = urlParams.get('token');

    if (token) {
      // Dispatch handleGoogleCallback to process the token
      dispatch(handleGoogleCallback(token))
        .unwrap()
        .then(() => {
          navigate('/dashboard'); // Redirect to dashboard after successful login
        })
        .catch((error) => {
          console.error('Google OAuth callback failed:', error);
          navigate('/login', { state: { error: 'Google OAuth failed. Please try again.' } });
        });
    }
  }, [dispatch, navigate]);

  // Clear error message after 5 seconds
  useEffect(() => {
    if (authError || errorMessage) {
      const timer = setTimeout(() => {
        dispatch(clearAuthError()); // Clear the error
        navigate(location.pathname, { state: {} }); // Clear the state
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [authError, errorMessage, dispatch, navigate, location.pathname]);

  // Handle form submission for email/password login
  const handleSubmit = (e) => {
    e.preventDefault();

    console.log('Form Data:', formData);
    console.log('Dispatching loginUser action...');

    dispatch(loginUser(formData))
      .unwrap()
      .then((userData) => {
        console.log('Login successful. User Data:', userData);
        navigate('/dashboard'); // Redirect to dashboard after successful login
      })
      .catch((error) => {
        console.error('Login failed:', error);
      });
  };

  // Handle Google OAuth login
  const handleGoogleLogin = () => {
    dispatch(googleLogin())
      .unwrap()
      .then(() => {
        console.log('Google OAuth initiated successfully');
      })
      .catch((error) => {
        console.error('Google OAuth failed:', error);
      });
  };

  return (
    <div className="max-w-sm mx-auto mt-10">
      <h2 className="text-2xl font-bold mb-4">Login</h2>
      <form onSubmit={handleSubmit} className="mb-4">
        <input
          type="email"
          placeholder="Email"
          value={formData.email}
          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
          className="w-full p-2 mb-2 border rounded"
        />
        <input
          type="password"
          placeholder="Password"
          value={formData.password}
          onChange={(e) => setFormData({ ...formData, password: e.target.value })}
          className="w-full p-2 mb-2 border rounded"
        />
        <button
          type="submit"
          disabled={loading}
          className="w-full p-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          {loading ? 'Loading...' : 'Login'}
        </button>
        {authError && <p className="text-red-500 mt-2">{authError}</p>}
        {errorMessage && <p className="text-red-500 mt-2">{errorMessage}</p>}
      </form>

      {/* Google Login Button */}
      <div className="mt-4">
        <button
          onClick={handleGoogleLogin}
          className="w-full p-2 bg-red-500 text-white rounded hover:bg-red-600 flex items-center justify-center"
        >
          <svg
            className="w-6 h-6 mr-2"
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 48 48"
          >
            <path
              fill="#EA4335"
              d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"
            />
            <path
              fill="#4285F4"
              d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"
            />
            <path
              fill="#FBBC05"
              d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"
            />
            <path
              fill="#34A853"
              d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"
            />
            <path
              fill="#fff"
              d="M0 0h48v48H0z"
              opacity=".01"
            />
          </svg>
          Login with Google
        </button>
      </div>

      {/* Link to Register Page */}
      <div className="mt-4 text-center">
        <p>
          Don't have an account?{' '}
          <a href="/register" className="text-blue-500 hover:underline">
            Register here
          </a>
        </p>
      </div>
    </div>
  );
};

export default LoginForm;