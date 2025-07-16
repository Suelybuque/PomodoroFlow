
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Button from '../Button';
import './auth.css';
import SIGNUP_IMAGE_PATH from './back.jpeg';
import { supabase } from '../../lib/supabaseClient';

const Signup: React.FC = () => {
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [message, setMessage] = useState('');

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage('');

    if (password !== confirmPassword) {
      setMessage("❌ Passwords do not match.");
      return;
    }

    const { error } = await supabase.auth.signUp({ email, password });

    if (error) {
      setMessage(`❌ ${error.message}`);
      return;
    }
   
    setMessage('🎉 Signup successful! Redirecting...');
    navigate('/dashboard');
  };

  return (
    <div className="auth-container">
      <div
        className="auth-image-container"
        style={{ backgroundImage: `url(${SIGNUP_IMAGE_PATH})` }}
      />

      <div className="auth-form-wrapper">
        <div className="auth-card">
          <div className="auth-header">
            <div className="auth-logo"></div>
            <h2 className="auth-title">Create Your Account</h2>
            <p className="auth-description">Join us today and unlock a world of productivity.</p>
          </div>
          <div className="auth-body">
            <form onSubmit={handleSignup} className="auth-form">
              <div className="form-group">
                <label htmlFor="email">Email address</label>
                <input
                  type="email"
                  id="email"
                  className="auth-input"
                  placeholder="name@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="password">Password</label>
                <div className="password-input-wrapper">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    id="password"
                    className="auth-input"
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                  <span
                    className="password-toggle-icon"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    <i className={`fas ${showPassword ? 'fa-eye-slash' : 'fa-eye'}`}></i>
                  </span>
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="confirm-password">Confirm Password</label>
                <div className="password-input-wrapper">
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    id="confirm-password"
                    className="auth-input"
                    placeholder="Confirm your password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                  />
                  <span
                    className="password-toggle-icon"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  >
                    <i className={`fas ${showConfirmPassword ? 'fa-eye-slash' : 'fa-eye'}`}></i>
                  </span>
                </div>
              </div>

              {message && <p className="auth-message">{message}</p>}

              <p className="terms-privacy">
                By clicking 'Sign Up', you agree to our{' '}
                <Link to="/terms" className="auth-link">Terms of Service</Link> and{' '}
                <Link to="/privacy" className="auth-link">Privacy Policy</Link>
              </p>

              <Button type="submit" variant="primary" className="auth-submit-button">
                Sign Up
              </Button>
            </form>
          </div>
          <div className="auth-footer">
            <p className="auth-switch-link">
              Already have an account? <Link to="/" className="auth-link">Log in</Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Signup;
