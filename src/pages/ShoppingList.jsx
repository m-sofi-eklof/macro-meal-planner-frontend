import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';

function aggregateFoodItems(items) {
  const map = new Map();
  for (const item of items) {
    const key = item.source === 'USDA'
      ? `usda-${item.fdcId}`
      : `manual-${item.name.toLowerCase()}`;
    if (map.has(key)) {
      const existing = map.get(key);
      map.set(key, {
        ...existing,
        grams: (existing.grams ?? 100) + (item.grams ?? 100),
        calories: existing.calories + item.calories,
        protein: parseFloat((existing.protein + item.protein).toFixed(1)),
      });
    } else {
      map.set(key, { ...item });
    }
  }
  return Array.from(map.values());
}

export default function ShoppingList() {
  const navigate = useNavigate();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchShoppingList = async () => {
      try {
        const weekRes  = await api.get('/api/weeks/current');
        const foodsRes = await api.get(`/api/weeks/${weekRes.data.id}/foods`);
        setItems(aggregateFoodItems(foodsRes.data));
      } catch (err) {
        setError('Failed to load shopping list');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchShoppingList();
  }, []);

  return (
    <div style={{
      minHeight: '100vh',
      width: '100vw',
      background: 'radial-gradient(ellipse at top, #111827 0%, #020617 60%)',
      color: 'white',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      padding: '2rem 1rem',
      overflowY: 'auto',
      boxSizing: 'border-box',
    }}>
      <div style={{ width: '100%', maxWidth: '540px' }}>

        {/* Back */}
        <button
          type="button"
          onClick={() => navigate('/planner')}
          style={ghostBtn}
        >
          ← Back
        </button>

        {/* Heading */}
        <div style={{ marginTop: '1.5rem', marginBottom: '1.5rem' }}>
          <h1 style={{
            margin: 0,
            fontSize: '1.4rem',
            fontWeight: 700,
            letterSpacing: '-0.02em',
            color: '#f1f5f9',
          }}>
            Shopping list
          </h1>
          <p style={{ margin: '0.35rem 0 0', fontSize: '0.82rem', color: '#4b5563' }}>
            Everything planned for this week
          </p>
        </div>

        {/* Body */}
        {loading && (
          <p style={{ color: '#374151', fontSize: '0.85rem' }}>Loading...</p>
        )}

        {error && (
          <p style={{ color: '#f87171', fontSize: '0.85rem' }}>{error}</p>
        )}

        {!loading && !error && items.length === 0 && (
          <div style={{
            padding: '2rem',
            borderRadius: '14px',
            border: '1px dashed rgba(255,255,255,0.08)',
            background: 'rgba(255,255,255,0.02)',
            textAlign: 'center',
            color: '#374151',
            fontSize: '0.85rem',
          }}>
            No food items planned this week.
          </div>
        )}

        {!loading && !error && items.length > 0 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
            {items.map((item, i) => (
              <div key={i} style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: '0.75rem 1rem',
                borderRadius: '12px',
                border: '1px solid rgba(255,255,255,0.07)',
                background: 'rgba(255,255,255,0.04)',
              }}>
                <div>
                  <div style={{ fontSize: '0.88rem', fontWeight: 500, color: '#e5e7eb' }}>
                    {item.name}
                  </div>
                  <div style={{ fontSize: '0.7rem', color: '#4b5563', marginTop: '0.1rem' }}>
                    {item.grams ?? 100}g
                  </div>
                </div>
                <div style={{ textAlign: 'right', fontSize: '0.72rem', color: '#6b7280' }}>
                  <div>{item.calories} kcal</div>
                  <div>{item.protein}g protein</div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

const ghostBtn = {
  background: 'none',
  border: '1px solid rgba(255,255,255,0.1)',
  color: '#6b7280',
  borderRadius: '8px',
  padding: '0.4rem 0.85rem',
  cursor: 'pointer',
  fontSize: '0.82rem',
};
