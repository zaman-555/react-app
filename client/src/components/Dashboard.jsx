import React from 'react';
import { useLocation } from 'react-router-dom';

const Dashboard = () => {
  const location = useLocation();
  const message = new URLSearchParams(location.search).get('message');

  return (
    <div className="text-center mt-10">
      <h1 className="text-3xl font-bold">Welcome to the Dashboard!</h1>
      <p className="mt-4">You are now logged in and can access this page.</p>
      {message && <p className="text-green-500 mt-4">{message}</p>}
    </div>
  );
};

export default Dashboard;