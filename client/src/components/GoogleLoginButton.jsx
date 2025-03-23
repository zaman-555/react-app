import React from 'react';
import { useDispatch } from 'react-redux';
import { googleLogin } from '../features/authSlice';

const GoogleLoginButton = () => {
  const dispatch = useDispatch();

  const handleGoogleLogin = () => {
    dispatch(googleLogin());
  };

  return (
    <button
      onClick={handleGoogleLogin}
      className="w-full p-2 bg-red-500 text-white rounded hover:bg-red-600"
    >
      Login with Google
    </button>
  );
};

export default GoogleLoginButton;