import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';

const ACTIVITY_LEVELS = [
  { value: 'SEDENTARY',         label: 'Sedentary',         desc: 'Desk job, little to no exercise' },
  { value: 'LIGHTLY_ACTIVE',    label: 'Lightly active',    desc: 'Light exercise 1–3 days/week' },
  { value: 'MODERATELY_ACTIVE', label: 'Moderately active', desc: 'Exercise 3–5 days/week' },
  { value: 'VERY_ACTIVE',       label: 'Very active',       desc: 'Hard training 6–7 days/week' },
  { value: 'EXTREMELY_ACTIVE',  label: 'Extremely active',  desc: 'Physical job + daily training' },
];

const GOALS = [
  {
    value: 'BULK',
    label: 'Bulk',
    style:       { background: 'linear-gradient(135deg, rgba(56,186,120,0.55), rgba(16,185,129,0.45))', border: '1px solid rgba(16,185,129,0.5)', color: 'white' },
    activeStyle: { background: 'linear-gradient(135deg, rgba(56,186,120,0.55), rgba(16,185,129,0.45))', border: '2px solid rgba(16,185,129,1)',   color: 'white' },
  },
  {
    value: 'RECOMP',
    label: 'Recomp',
    style:       { background: 'linear-gradient(135deg, rgba(176,112,254,0.55), rgba(254,105,165,0.45))', border: '1px solid rgba(176,112,254,0.5)', color: 'white' },
    activeStyle: { background: 'linear-gradient(135deg, rgba(176,112,254,0.55), rgba(254,105,165,0.45))', border: '2px solid rgba(176,112,254,1)',   color: 'white' },
  },
  {
    value: 'CUT',
    label: 'Cut',
    style:       { background: 'linear-gradient(135deg, rgba(251,191,36,0.55), rgba(248,113,113,0.45))', border: '1px solid rgba(251,191,36,0.5)', color: 'white' },
    activeStyle: { background: 'linear-gradient(135deg, rgba(251,191,36,0.55), rgba(248,113,113,0.45))', border: '2px solid rgba(251,191,36,1)',   color: 'white' },
  },
];

function UserPage() {
  const navigate = useNavigate();

  // existing goals state
  const [calories, setCalories] = useState('');
  const [protein, setProtein]   = useState('');
  const [loading, setLoading]   = useState(true);
  const [saving, setSaving]     = useState(false);
  const [success, setSuccess]   = useState(false);
  const [error, setError]       = useState(null);

  // calculator state
  const [stats, setStats] = useState({
    gender:        'MALE',
    age:           '',
    weightKg:      '',
    heightCm:      '',
    activityLevel: 'MODERATELY_ACTIVE',
    goal:          'RECOMP',
  });
  const [calcResult, setCalcResult]   = useState(null);
  const [calculating, setCalculating] = useState(false);
  const [calcSuccess, setCalcSuccess] = useState(false);

  // fetch goals
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

  // fetch saved stats
  useEffect(() => {
    api.get('/api/users/stats')
      .then(res => {
        const d = res.data;
        setStats({
          gender:        d.gender        ?? 'MALE',
          age:           d.age           != null ? String(d.age)      : '',
          weightKg:      d.weightKg      != null ? String(d.weightKg) : '',
          heightCm:      d.heightCm      != null ? String(d.heightCm) : '',
          activityLevel: d.activityLevel ?? 'MODERATELY_ACTIVE',
          goal:          d.goal          ?? 'RECOMP',
        });
      })
      .catch(() => {});
  }, []);

  const handleSave = async () => {
    setSaving(true);
    setError(null);
    setSuccess(false);
    try {
      await api.put('/api/users/goals', {
        calories: Number(calories),
        protein:  Number(protein),
      });
      setSuccess(true);
      setTimeout(() => setSuccess(false), 2500);
    } catch (err) {
      setError('Failed to save goals. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const setStat = (key, value) => setStats(prev => ({ ...prev, [key]: value }));

  const handleCalculate = async () => {
    setCalculating(true);
    setCalcResult(null);
    try {
      await api.put('/api/users/stats', {
        ...stats,
        age:      stats.age      !== '' ? Number(stats.age)      : null,
        weightKg: stats.weightKg !== '' ? Number(stats.weightKg) : null,
        heightCm: stats.heightCm !== '' ? Number(stats.heightCm) : null,
      });
      const res = await api.post('/api/users/calculate-macros', {
        ...stats,
        age:      stats.age      !== '' ? Number(stats.age)      : null,
        weightKg: stats.weightKg !== '' ? Number(stats.weightKg) : null,
        heightCm: stats.heightCm !== '' ? Number(stats.heightCm) : null,
      });
      setCalcResult(res.data);
    } catch (e) {
      console.error('Calculation failed', e);
    } finally {
      setCalculating(false);
    }
  };

  const handleApplyGoals = async () => {
    if (!calcResult) return;
    try {
      await api.put('/api/users/goals', {
        calories: calcResult.recommendedCalories,
        protein:  calcResult.recommendedProtein,
      });
      setCalories(String(calcResult.recommendedCalories));
      setProtein(String(calcResult.recommendedProtein));
      setCalcSuccess(true);
      setTimeout(() => setCalcSuccess(false), 2500);
    } catch (e) {
      console.error('Failed to apply goals', e);
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
      overflowY: 'auto',
      boxSizing: 'border-box',
    }}>
      <div style={{ width: '100%', maxWidth: '480px' }}>

        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '2rem' }}>
          <button onClick={() => navigate('/planner')} style={backButtonStyle}>‹</button>
          <div>
            <div style={{ fontSize: '0.8rem', letterSpacing: '0.12em', textTransform: 'uppercase', color: '#9ca3af' }}>Account</div>
            <div style={{ fontSize: '1.2rem', fontWeight: 600 }}>My Goals</div>
          </div>
        </div>

        {/* ── CALCULATOR CARD ────────────────────────────────── */}
        <div style={{ ...cardStyle, marginBottom: '1.5rem' }}>
          <div style={{ fontSize: '0.75rem', letterSpacing: '0.1em', textTransform: 'uppercase', color: '#9ca3af', marginBottom: '1.25rem' }}>
            Macro Calculator
          </div>

          {/* Goal picker */}
          <div style={{ fontSize: '0.75rem', letterSpacing: '0.08em', textTransform: 'uppercase', color: '#9ca3af', marginBottom: '0.5rem' }}>Goal</div>
          <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.25rem' }}>
            {GOALS.map(g => (
              <button
                key={g.value}
                onClick={() => setStat('goal', g.value)}
                style={{
                  flex: 1,
                  padding: '0.55rem 0',
                  borderRadius: '8px',
                  fontWeight: 600,
                  fontSize: '0.85rem',
                  cursor: 'pointer',
                  transition: 'all 0.15s',
                  ...(stats.goal === g.value ? g.activeStyle : g.style),
                }}
              >
                {g.label}
              </button>
            ))}
          </div>

          {/* Gender picker */}
          <div style={{ fontSize: '0.75rem', letterSpacing: '0.08em', textTransform: 'uppercase', color: '#9ca3af', marginBottom: '0.5rem' }}>Gender</div>
          <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.25rem' }}>
            {['MALE', 'FEMALE'].map(g => (
              <button
                key={g}
                onClick={() => setStat('gender', g)}
                style={{
                  flex: 1,
                  padding: '0.55rem 0',
                  borderRadius: '8px',
                  fontWeight: 500,
                  fontSize: '0.85rem',
                  cursor: 'pointer',
                  ...(stats.gender === g
                    ? { background: 'rgba(255,255,255,0.12)', border: '1px solid rgba(255,255,255,0.25)', color: 'white' }
                    : { background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)', color: '#6b7280' }),
                }}
              >
                {g === 'MALE' ? 'Male' : 'Female'}
              </button>
            ))}
          </div>

          {/* Inputs row */}
          <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '1.25rem' }}>
            {[
              { key: 'age',      label: 'Age',    placeholder: 'yrs' },
              { key: 'weightKg', label: 'Weight', placeholder: 'kg'  },
              { key: 'heightCm', label: 'Height', placeholder: 'cm'  },
            ].map(({ key, label, placeholder }) => (
              <div key={key} style={{ flex: 1 }}>
                <div style={labelStyle}>{label}</div>
                <input
                  type="number"
                  value={stats[key]}
                  onChange={e => setStat(key, e.target.value)}
                  placeholder={placeholder}
                  style={inputStyle}
                />
              </div>
            ))}
          </div>

          {/* Activity level */}
          <div style={{ fontSize: '0.75rem', letterSpacing: '0.08em', textTransform: 'uppercase', color: '#9ca3af', marginBottom: '0.5rem' }}>Activity level</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem', marginBottom: '1.5rem' }}>
            {ACTIVITY_LEVELS.map(a => {
              const active = stats.activityLevel === a.value;
              return (
                <div
                  key={a.value}
                  onClick={() => setStat('activityLevel', a.value)}
                  style={{
                    padding: '0.65rem 0.85rem',
                    borderRadius: '10px',
                    cursor: 'pointer',
                    borderLeft: active ? '3px solid #22d3ee' : '3px solid transparent',
                    background: active ? 'rgba(34,211,238,0.07)' : 'rgba(255,255,255,0.03)',
                    border: active ? '1px solid rgba(34,211,238,0.2)' : '1px solid rgba(255,255,255,0.06)',
                    borderLeftWidth: '3px',
                    borderLeftColor: active ? '#22d3ee' : 'transparent',
                  }}
                >
                  <div style={{ fontSize: '0.88rem', fontWeight: active ? 600 : 400, color: active ? 'white' : '#d1d5db' }}>{a.label}</div>
                  <div style={{ fontSize: '0.75rem', color: '#6b7280', marginTop: '0.15rem' }}>{a.desc}</div>
                </div>
              );
            })}
          </div>

          {/* Calculate button */}
          <button
            onClick={handleCalculate}
            disabled={calculating}
            style={{ ...saveButtonStyle, opacity: calculating ? 0.6 : 1 }}
          >
            {calculating ? 'Calculating...' : 'Calculate'}
          </button>

          {/* Results */}
          {calcResult && (
            <div style={{
              marginTop: '1.25rem',
              padding: '1rem',
              borderRadius: '10px',
              background: 'rgba(255,255,255,0.04)',
              border: '1px solid rgba(255,255,255,0.08)',
            }}>
              <div style={{ fontSize: '1rem', fontWeight: 600, marginBottom: '0.25rem' }}>
                {calcResult.recommendedCalories} kcal &nbsp;·&nbsp; {calcResult.recommendedProtein}g protein
              </div>
              <div style={{ fontSize: '0.78rem', color: '#6b7280', marginBottom: '1rem' }}>
                TDEE: {calcResult.tdee} kcal &nbsp;·&nbsp; BMR: {calcResult.bmr} kcal
              </div>
              <button
                onClick={handleApplyGoals}
                style={{ ...saveButtonStyle }}
              >
                Apply & Save
              </button>
              {calcSuccess && (
                <p style={{ color: '#34d399', fontSize: '0.85rem', marginTop: '0.75rem', textAlign: 'center' }}>Goals updated!</p>
              )}
            </div>
          )}
        </div>

        {/* ── MANUAL GOALS CARD ──────────────────────────────── */}
        {loading ? (
          <p style={{ color: '#9ca3af' }}>Loading...</p>
        ) : (
          <div style={cardStyle}>
            <p style={{ fontSize: '0.85rem', color: '#9ca3af', marginBottom: '1.75rem', lineHeight: 1.6 }}>
              Set your daily targets manually, or apply the calculated values above.
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

            {error   && <p style={{ color: '#f87171', fontSize: '0.85rem', marginTop: '1rem' }}>{error}</p>}
            {success && <p style={{ color: '#34d399', fontSize: '0.85rem', marginTop: '1rem' }}>Goals saved!</p>}

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
  fontSize: '0.75rem',
  letterSpacing: '0.08em',
  textTransform: 'uppercase',
  color: '#9ca3af',
  marginBottom: '0.4rem',
};

const inputStyle = {
  width: '100%',
  padding: '0.65rem 0.85rem',
  borderRadius: '10px',
  border: '1px solid rgba(139,141,113,0.35)',
  background: 'rgba(2,92,137,0.15)',
  color: '#f3f4f6',
  fontSize: '0.95rem',
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
