import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import RegisterForm from './components/RegisterForm';
import LoginForm from './components/LoginForm';
import EmailVerificationPage from './components/EmailVerificationPage';
import RequestPasswordResetForm from './components/RequestPasswordResetForm';
import ResetPasswordForm from './components/ResetPasswordForm';
import ProtectedRoute from './components/ProtectedRoute';
import HomePage from './components/HomePage';
import Dashboard from './components/Dashboard';
import GoogleAuthCallbackPage from './components/GoogleAuthCallbackPage'; 

const App = () => {
  return (
    <Router>
      <Navbar />
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/register" element={<RegisterForm />} /> {/* Register Route */}
        <Route path="/login" element={<LoginForm />} /> {/* Login Route */}
        <Route path="/verify/:token" element={<EmailVerificationPage />} />
        <Route path="/request-password-reset" element={<RequestPasswordResetForm />} />
        <Route path="/reset-password/:token" element={<ResetPasswordForm />} />
        <Route path="/auth/google/callback" element={<GoogleAuthCallbackPage />} />
        <Route element={<ProtectedRoute />}> 
          <Route path="/dashboard" element={<Dashboard />} />
        </Route>
      </Routes>
    </Router>
  );
};

export default App;