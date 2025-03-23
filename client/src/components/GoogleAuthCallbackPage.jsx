import React, { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { useNavigate, useLocation } from 'react-router-dom';
import { handleGoogleCallback } from '../features/authSlice';

const GoogleAuthCallbackPage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const token = urlParams.get('token');
    console.log("urlParams>",urlParams);
   
    if (token) {
      // Dispatch handleGoogleCallback to process the token
      dispatch(handleGoogleCallback(token))
        .unwrap()
        .then(() => {
          // Save the token to localStorage
          localStorage.setItem('token', token);

          // Redirect to the dashboard without the token in the URL
          navigate('/dashboard', { replace: true });
        })
        .catch((error) => {
          console.error('Google OAuth callback failed:', error);
          navigate('/login', { state: { error: 'Google OAuth failed. Please try again.' } });
        });
    }
  }, [dispatch, navigate]);

  return (
    <div>
      <p>Processing Google OAuth login...</p>
    </div>
  );
};

export default GoogleAuthCallbackPage;