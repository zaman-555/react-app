import React from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { logout, googleLogin } from '../features/authSlice';
import { Link, useNavigate } from 'react-router-dom';
import { GoogleLogin } from 'react-google-login';
import LoadingSpinner from '../components/LoadingSpinner';

const Home = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user, token, loading, error } = useSelector((state) => state.auth);

  const handleLogout = () => {
    dispatch(logout());
    navigate('/login');
  };

  const handleGoogleSuccess = (response) => {
    const { profileObj } = response;
    const { googleId, email, name, imageUrl } = profileObj;

    console.log('Dispatching googleLogin with:', { googleId, email, name, profilePicture: imageUrl });
    dispatch(googleLogin({ googleId, email, name, profilePicture: imageUrl }))
      .unwrap() // Unwrap the promise to handle success/failure
      .then(() => {
        navigate('/profile'); // Redirect to profile page after successful login
      })
      .catch((error) => {
        console.error('Google login failed:', error);
      });
  };

  const handleGoogleFailure = (error) => {
    console.error('Google OAuth failed:', error);
    alert('Google login failed. Please try again.'); // Display a user-friendly error message
  };

  if (loading) return <LoadingSpinner />; // Show loading spinner while processing

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col items-center justify-center p-4">
      <h1 className="text-4xl font-bold text-gray-800 mb-8">
        Welcome to the Home Page
      </h1>
      {token ? (
        <div className="bg-white p-8 rounded-lg shadow-md text-center">
          <h2 className="text-2xl font-semibold text-gray-700 mb-4">
            Hello, {user?.name}!
          </h2>
          <p className="text-gray-600 mb-6">Email: {user?.email}</p>
          {user?.profilePicture && (
            <img
              src={user.profilePicture}
              alt="Profile"
              className="w-24 h-24 rounded-full mx-auto mb-6"
            />
          )}
          <button
            onClick={handleLogout}
            className="bg-red-500 text-white px-6 py-2 rounded-lg hover:bg-red-600 transition duration-300"
          >
            Logout
          </button>
        </div>
      ) : (
        <div className="bg-white p-8 rounded-lg shadow-md text-center">
          <p className="text-gray-600 mb-6">
            Please log in or register to access your profile.
          </p>
          <div className="space-y-4">
            <Link
              to="/login"
              className="block bg-blue-500 text-white px-6 py-2 rounded-lg hover:bg-blue-600 transition duration-300"
            >
              Login with Email
            </Link>
            <Link
              to="/register"
              className="block bg-green-500 text-white px-6 py-2 rounded-lg hover:bg-green-600 transition duration-300"
            >
              Register
            </Link>
            <div className="flex items-center justify-center my-4">
              <div className="border-t border-gray-300 flex-grow"></div>
              <span className="mx-4 text-gray-500">or</span>
              <div className="border-t border-gray-300 flex-grow"></div>
            </div>
            <GoogleLogin
              clientId={import.meta.env.VITE_GOOGLE_CLIENT_ID}
              buttonText="Login with Google"
              onSuccess={handleGoogleSuccess}
              onFailure={handleGoogleFailure}
              cookiePolicy={'single_host_origin'}
              className="w-full"
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default Home;