import React from 'react';
import { useSelector } from 'react-redux';
import { Navigate, Outlet } from 'react-router-dom';

const ProtectedRoute = () => {
  const { token } = useSelector((state) => state.auth);

  // If the user is not authenticated, redirect to the login page
  if (!token) {
    return <Navigate to="/login" replace />;
  }

  // If the user is authenticated, render the child routes
  return <Outlet />;
};

export default ProtectedRoute;