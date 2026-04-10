import { useEffect, useState } from 'react';
import axios from 'axios';

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
        servings: existing.servings + item.servings,
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
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchShoppingList = async () => {
      try {
        const token = localStorage.getItem('token');
        const headers = { Authorization: `Bearer ${token}` };

        const weekRes = await axios.get('/api/weeks/current', { headers });
        const weekId = weekRes.data.id;

        const foodsRes = await axios.get(`/api/weeks/${weekId}/foods`, { headers });
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

  if (loading) return <p>Loading...</p>;
  if (error) return <p>{error}</p>;

  return (
    <div>
      <h1>Shopping List</h1>
      {items.length === 0 ? (
        <p>No food items planned this week.</p>
      ) : (
        <ul>
          {items.map((item, i) => (
            <li key={i}>
              <strong>{item.name}</strong> — {item.servings} {item.servingDescription || 'serving'}
              <span> ({item.calories} kcal, {item.protein}g protein)</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}