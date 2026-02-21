import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';

function Auth() {
  const [isLogin, setIsLogin] = useState(true);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setError('');
      const endpoint = isLogin ? '/api/auth/login' : '/api/auth/register';
      const body = { username, password };
      const response = await api.post(endpoint, body);
      localStorage.setItem('token', response.data.token);
      onLogin();
      navigate('/planner');
    } catch (err) {
      setError(err.response?.data?.message || 'Something went wrong');
    }
  };

  return (
    // Auth card
    <div
        style={{
            width: '100%',
            maxWidth: '380px',
            padding: '2.5rem 2rem',
            borderRadius: '20px',
            background:
            'radial-gradient(circle at top, rgba(168,85,247,0.16), rgba(3,7,18,0.96))',
            boxShadow: '0 24px 60px rgba(15,23,42,0.95), 0 0 20px rgba(254,215,170,0.45)',
            border: '1px solid #fed7aa',
            color: 'white',
            backdropFilter: 'blur(14px)',
        }}
    >
    <h1
        style={{
          textAlign: 'center',
          marginBottom: '1.5rem',
          fontSize: '1.5rem',
          fontWeight: '600',
        }}
    >
        {isLogin ? 'Welcome back' : 'Create account'}
      </h1>

      <form onSubmit={handleSubmit}>
        {/* Username */}
        <div style={{ marginBottom: '1rem' }}>
          <label
            style={{
              display: 'block',
              marginBottom: '0.35rem',
              fontSize: '0.85rem',
              color: '#e5e7eb',
            }}
          >
            Username
          </label>
          <input
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
            style={{
                width: '95%',
                margin: '0 auto',
                padding: '0.6rem 0.75rem',
                borderRadius: '10px',
                border: '1px solid #fed7aa',
                backgroundColor: '#020617',
                color: 'white',
                outline: 'none',
                boxShadow: '0 6px 15px rgba(15,23,42,0.95), 0 0 5px rgba(254,215,170,0.45)',
            }}

          />
        </div>

        {/* Password */}
        <div style={{ marginBottom: '1.25rem' }}>
          <label
            style={{
              display: 'block',
              marginBottom: '0.35rem',
              fontSize: '0.85rem',
              color: '#e5e7eb',
            }}
          >
            Password
          </label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            style={{
              width: '95%',
              margin: '0 auto',
              padding: '0.6rem 0.75rem',
              borderRadius: '8px',
              border: '1px solid #fed7aa',
              backgroundColor: '#020617',
              color: 'white',
              outline: 'none',
              boxShadow: '0 6px 15px rgba(15,23,42,0.95), 0 0 5px rgba(254,215,170,0.45)',
            }}
          />
        </div>

        {/* Button */}
        <div
            style={{
                display: 'flex',
                justifyContent: 'center',
                marginTop: '1.5REM'
            }}
        >
            <button
                type="submit"
                style={{
                    width: '85%',
                    padding: '0.7rem',
                    borderRadius: '999px',
                    border: 'none',
                    background:
                        'linear-gradient(135deg, #22d3ee, #ec4899)',
                    color: '#000000',
                    fontWeight: '675',
                    letterSpacing: '0.1em',
                    cursor: 'pointer',
                    boxShadow: '5 10px 24px rgba(0, 0, 0, 0.99)',
                }}
            >
                {isLogin ? 'Login' : 'Register'}
            </button>
        </div>
      </form>

      {/* Error */}
      {error && (
        <p
          style={{
            color: '#f97373',
            textAlign: 'center',
            marginTop: '1rem',
            fontSize: '0.9rem',
          }}
        >
          {error}
        </p>
      )}

      {/* Toggle */}
      <p
        style={{
          textAlign: 'center',
          marginTop: '1.25rem',
          fontSize: '0.85rem',
          color: '#9ca3af',
        }}
      >
        {isLogin ? "Don't have an account?" : 'Already registered?'}{' '}
        <button
          type="button"
          onClick={() => setIsLogin(!isLogin)}
          style={{
            background: 'none',
            border: 'none',
            color: '#60a5fa',
            cursor: 'pointer',
            textDecoration: 'underline',
            padding: 0,
            outline: 'none',
          }}
        >
          {isLogin ? 'Register' : 'Login'}
        </button>
      </p>
    </div>
  );
}

export default Auth;
