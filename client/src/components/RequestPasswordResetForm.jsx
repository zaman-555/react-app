import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { requestPasswordReset } from '../features/authSlice';

const RequestPasswordResetForm = () => {
  const [email, setEmail] = useState('');
  const dispatch = useDispatch();
  const { loading, error } = useSelector((state) => state.auth);

  const handleSubmit = (e) => {
    e.preventDefault();
    dispatch(requestPasswordReset(email));
  };

  return (
    <form onSubmit={handleSubmit} className="max-w-sm mx-auto">
      <input
        type="email"
        placeholder="Email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        className="w-full p-2 mb-2 border rounded"
      />
      <button type="submit" disabled={loading} className="w-full p-2 bg-blue-500 text-white rounded">
        {loading ? 'Loading...' : 'Request Password Reset'}
      </button>
      {error && <p className="text-red-500">{error}</p>}
    </form>
  );
};

export default RequestPasswordResetForm;