
import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Button from '../Button'; 
import { supabase } from '../../lib/supabaseClient';
import './auth.css'; 
import LOGIN_IMAGE_PATH from './back.jpeg'; 

const Login: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [message, setMessage] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    // If user is already logged in, redirect to dashboard
    const checkSession = async () => {
      const { data } = await supabase.auth.getSession();
      if (data.session) {
        navigate('/dashboard');
      }
    };
    checkSession();
  }, [navigate]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage('');
    const { error } = await supabase.auth.signInWithPassword({ email, password });

    if (error) {
      setMessage(error.message);
    } else {
      setMessage('🎉 Login successful!');
      navigate('/dashboard');
    }
  };

  return (
    <div className="auth-container">
      <div
        className="auth-image-container"
        style={{ backgroundImage: `url(${LOGIN_IMAGE_PATH})` }}
      />

      <div className="auth-form-wrapper">
        <div className="auth-card">
          <div className="auth-header">
            <div className="auth-logo"></div>
            <h2 className="auth-title">Welcome Back!</h2>
          </div>

          <div className="auth-body">
            <form onSubmit={handleLogin} className="auth-form">
              <div className="form-group">
                <label htmlFor="email">Email</label>
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
                    placeholder="********"
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
                <Link to="/forgot-password" className="auth-link forgot-password-link">Forgot password?</Link>
              </div>

              {message && <p className="auth-message">{message}</p>}

              <Button type="submit" variant="primary" className="auth-submit-button">
                Log In
              </Button>
            </form>
          </div>

          <div className="auth-footer">
            <div className="social-login-divider">Or continue with</div>
            <div className="social-buttons">
              <Button variant="secondary" className="social-button">
                <i className="fab fa-google social-icon"></i> Continue with Google
              </Button>
              <Button variant="secondary" className="social-button">
                <i className="fab fa-apple social-icon"></i> Continue with Apple
              </Button>
            </div>
            <p className="auth-switch-link">
              Don't have an account? <Link to="/signup" className="auth-link">Sign up</Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
