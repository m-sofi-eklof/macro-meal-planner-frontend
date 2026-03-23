import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';

function UserPage() {
  const navigate = useNavigate();
  const [calories, setCalories] = useState('');
  const [protein, setProtein] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchGoals = async () => {
      try {
        const res = await api.get('/api/users/goals');
        setCalories(res.data.calories ?? '');
        setProtein(res.data.protein ?? '');
      } catch (err) {
        console.error('Failed to fetch goals:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchGoals();
  }, []);

  const handleSave = async () => {
    setSaving(true);
    setError(null);
    setSuccess(false);
    try {
      await api.put('/api/users/goals', {
        calories: Number(calories),
        protein: Number(protein),
      });
      setSuccess(true);
      setTimeout(() => setSuccess(false), 2500);
    } catch (err) {
      setError('Failed to save goals. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      width: '100vw',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      padding: '2rem 1rem',
      background: 'radial-gradient(circle at top, #060918e5 0%, #030510c8 50%, #00000091 100%)',
      color: 'white',
    }}>
      <div style={{ width: '100%', maxWidth: '480px' }}>

        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '2.5rem' }}>
          <button onClick={() => navigate('/planner')} style={backButtonStyle}>‹</button>
          <div>
            <div style={{ fontSize: '0.8rem', letterSpacing: '0.12em', textTransform: 'uppercase', color: '#9ca3af' }}>
              Account
            </div>
            <div style={{ fontSize: '1.2rem', fontWeight: 600 }}>My Goals</div>
          </div>
        </div>

        {loading ? (
          <p style={{ color: '#9ca3af' }}>Loading...</p>
        ) : (
          <div style={cardStyle}>
            <p style={{ fontSize: '0.85rem', color: '#9ca3af', marginBottom: '1.75rem', lineHeight: 1.6 }}>
              Set your daily targets. These will be used to track your progress on each day's summary.
            </p>

            <label style={labelStyle}>Daily Calories (kcal)</label>
            <input
              type="number"
              value={calories}
              onChange={e => setCalories(e.target.value)}
              placeholder="e.g. 2000"
              style={inputStyle}
            />

            <label style={{ ...labelStyle, marginTop: '1.25rem' }}>Daily Protein (g)</label>
            <input
              type="number"
              value={protein}
              onChange={e => setProtein(e.target.value)}
              placeholder="e.g. 150"
              style={inputStyle}
            />

            {error && (
              <p style={{ color: '#f87171', fontSize: '0.85rem', marginTop: '1rem' }}>{error}</p>
            )}
            {success && (
              <p style={{ color: '#34d399', fontSize: '0.85rem', marginTop: '1rem' }}>Goals saved!</p>
            )}

            <button
              onClick={handleSave}
              disabled={saving}
              style={{ ...saveButtonStyle, opacity: saving ? 0.6 : 1, marginTop: '2rem' }}
            >
              {saving ? 'Saving...' : 'Save Goals'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

const backButtonStyle = {
  width: '38px',
  height: '38px',
  borderRadius: '10px',
  border: '1px solid #4b5563',
  background: 'rgba(15,23,42,0.9)',
  color: '#e5e7eb',
  fontSize: '1.2rem',
  cursor: 'pointer',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  flexShrink: 0,
};

const cardStyle = {
  background: 'rgba(255,255,255,0.04)',
  border: '1px solid rgba(255,255,255,0.08)',
  borderRadius: '16px',
  padding: '1.75rem',
  backdropFilter: 'blur(12px)',
};

const labelStyle = {
  display: 'block',
  fontSize: '0.8rem',
  letterSpacing: '0.1em',
  textTransform: 'uppercase',
  color: '#9ca3af',
  marginBottom: '0.5rem',
};

const inputStyle = {
  width: '100%',
  padding: '0.75rem 1rem',
  borderRadius: '10px',
  border: '1px solid rgba(139,141,113,0.35)',
  background: 'rgba(2,92,137,0.15)',
  color: '#f3f4f6',
  fontSize: '1rem',
  outline: 'none',
  boxSizing: 'border-box',
};

const saveButtonStyle = {
  width: '100%',
  padding: '0.85rem',
  borderRadius: '999px',
  border: 'none',
  background: 'linear-gradient(135deg, rgba(254,43,181,0.82), rgba(38,160,194,0.77))',
  color: '#fefce8',
  fontWeight: 600,
  fontSize: '0.9rem',
  letterSpacing: '0.12em',
  textTransform: 'uppercase',
  cursor: 'pointer',
};

export default UserPage;