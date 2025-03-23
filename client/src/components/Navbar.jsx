import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { logout } from '../features/authSlice';
import { Link } from 'react-router-dom';

const Navbar = () => {
  const dispatch = useDispatch();
  const { token } = useSelector((state) => state.auth);

  const handleLogout = () => {
    dispatch(logout());
  };

  return (
    <nav className="bg-blue-500 p-4">
      <div className="container mx-auto flex justify-between items-center">
        <Link to="/" className="text-white text-xl font-bold">
          MyApp
        </Link>
        <div>
          {token ? (
            <div className="flex items-center gap-4">
              <Link to="/dashboard" className="text-white">
                Dashboard
              </Link>
              <button onClick={handleLogout} className="text-white">
                Logout
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-4">
              <Link to="/login" className="text-white">
                Login
              </Link>
             
            </div>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;