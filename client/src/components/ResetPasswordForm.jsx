import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { resetPassword } from '../features/authSlice';

const ResetPasswordForm = () => {
  const { token } = useParams();
  const [password, setPassword] = useState('');
  const dispatch = useDispatch();
  const { loading, error } = useSelector((state) => state.auth);

  const handleSubmit = (e) => {
    e.preventDefault();
    dispatch(resetPassword({ token, password }));
  };

  return (
    <form onSubmit={handleSubmit} className="max-w-sm mx-auto">
      <input
        type="password"
        placeholder="New Password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        className="w-full p-2 mb-2 border rounded"
      />
      <button type="submit" disabled={loading} className="w-full p-2 bg-blue-500 text-white rounded">
        {loading ? 'Loading...' : 'Reset Password'}
      </button>
      {error && <p className="text-red-500">{error}</p>}
    </form>
  );
};

export default ResetPasswordForm;