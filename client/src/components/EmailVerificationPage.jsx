import React, { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { verifyEmail } from '../features/authSlice';

const EmailVerificationPage = () => {
  const { token } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();

  useEffect(() => {
    if (!token) {
      // If no token is found, redirect to the login page with an error message
      navigate('/login', { state: { error: 'Invalid or missing token' } });
      return;
    }

    // Dispatch the verifyEmail thunk to process the token
    dispatch(verifyEmail(token))
      .unwrap()
      .then(() => {
        // Redirect to the dashboard after successful verification
        navigate('/dashboard', { state: { message: 'Email verified successfully!' } });
      })
      .catch((error) => {
        console.error('Email verification failed:', error);
        // Redirect to the login page with an error message
        navigate('/login', { state: { error: 'Email verification failed. Please try again.' } });
      });
  }, [token, dispatch, navigate]);

  return (
    <div className="text-center mt-10">
      <p>Verifying your email...</p>
    </div>
  );
};

export default EmailVerificationPage;