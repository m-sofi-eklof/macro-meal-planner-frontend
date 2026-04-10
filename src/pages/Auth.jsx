import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';

function Auth() {
  const [isLogin, setIsLogin] = useState(true);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setError('');
      const endpoint = isLogin ? '/api/auth/login' : '/api/auth/register';
      const response = await api.post(endpoint, { username, password });
      const token = response?.data?.token;
      if (!token) {
        setError('Login succeeded but no token was returned');
        return;
      }
      login(token);
      navigate('/planner');
    } catch (err) {
      const msg =
        err?.response?.data?.message ||
        err?.message ||
        'Something went wrong';
      setError(msg);
    }
  };

  const inputStyle = {
    width: '100%',
    boxSizing: 'border-box',
    padding: '0.65rem 0.85rem',
    borderRadius: '8px',
    border: '1px solid rgba(255,255,255,0.1)',
    backgroundColor: 'rgba(255,255,255,0.05)',
    color: 'white',
    outline: 'none',
    fontSize: '0.9rem',
  };

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      gap: '2rem',
      width: '100%',
      maxWidth: '360px',
      padding: '1rem',
    }}>

      {/* Tagline */}
      <div style={{ textAlign: 'center' }}>
        <h1 style={{
          fontSize: '2.4rem',
          fontWeight: '800',
          margin: 0,
          lineHeight: 1.15,
          letterSpacing: '-0.03em',
          background: 'linear-gradient(135deg, #22d3ee 0%, #ec4899 100%)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          backgroundClip: 'text',
        }}>
          Your meals.<br />Your macros.
        </h1>
        <p style={{
          fontSize: '0.92rem',
          color: '#9ca3af',
          fontWeight: '500',
          marginTop: '0.65rem',
          lineHeight: 1.5,
        }}>
          Forget generic meal plans — this one's built around you.
        </p>
      </div>

      {/* Card */}
      <div style={{
        width: '100%',
        padding: '2rem',
        borderRadius: '16px',
        backgroundColor: 'rgba(255,255,255,0.04)',
        border: '1px solid rgba(255,255,255,0.08)',
        backdropFilter: 'blur(12px)',
      }}>
        <h2 style={{
          textAlign: 'center',
          fontSize: '1rem',
          fontWeight: '500',
          color: '#e5e7eb',
          margin: '0 0 1.5rem 0',
        }}>
          {isLogin ? 'Welcome back' : 'Create account'}
        </h2>

        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: '1rem' }}>
            <label style={{
              display: 'block',
              marginBottom: '0.35rem',
              fontSize: '0.75rem',
              color: '#9ca3af',
              letterSpacing: '0.06em',
              textTransform: 'uppercase',
            }}>
              Username
            </label>
            <input
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              style={inputStyle}
            />
          </div>

          <div style={{ marginBottom: '1.5rem' }}>
            <label style={{
              display: 'block',
              marginBottom: '0.35rem',
              fontSize: '0.75rem',
              color: '#9ca3af',
              letterSpacing: '0.06em',
              textTransform: 'uppercase',
            }}>
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              style={inputStyle}
            />
          </div>

          <button
            type="submit"
            style={{
              width: '100%',
              padding: '0.75rem',
              borderRadius: '8px',
              border: 'none',
              backgroundColor: 'white',
              color: '#0a0a0a',
              fontWeight: '600',
              fontSize: '0.9rem',
              cursor: 'pointer',
              letterSpacing: '0.01em',
            }}
          >
            {isLogin ? 'Sign in' : 'Create account'}
          </button>
        </form>

        {error && (
          <p style={{
            color: '#f87171',
            textAlign: 'center',
            marginTop: '1rem',
            fontSize: '0.85rem',
          }}>
            {error}
          </p>
        )}

        <p style={{
          textAlign: 'center',
          marginTop: '1.25rem',
          fontSize: '0.82rem',
          color: '#6b7280',
        }}>
          {isLogin ? "Don't have an account?" : 'Already registered?'}{' '}
          <button
            type="button"
            onClick={() => setIsLogin(!isLogin)}
            style={{
              background: 'none',
              border: 'none',
              color: '#d1d5db',
              cursor: 'pointer',
              textDecoration: 'underline',
              padding: 0,
              fontSize: '0.82rem',
            }}
          >
            {isLogin ? 'Register' : 'Sign in'}
          </button>
        </p>
      </div>
    </div>
  );
}

export default Auth;
