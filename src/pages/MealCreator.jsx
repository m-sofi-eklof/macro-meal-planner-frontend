import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import api from '../api/axios';
import { getFavorites, saveFavorite, deleteFavorite, quickAdd } from '../api/favorites';
import { getFavoriteMeals, saveMealAsFavorite, deleteFavoriteMeal, quickAddMeal } from '../api/favoriteMeals';

const MEAL_GRADIENTS = {
  BREAKFAST: 'linear-gradient(135deg, rgba(251,226,36,0.35), rgba(248,113,113,0.2))',
  LUNCH:     'linear-gradient(135deg, rgba(56,146,248,0.4), rgba(16,185,129,0.18))',
  DINNER:    'linear-gradient(135deg, rgba(176,112,254,0.4), rgba(254,105,165,0.2))',
  SNACK:     'linear-gradient(135deg, rgba(48,228,204,0.35), rgba(59,131,246,0.2))',
};

function MealCreator() {
  const navigate = useNavigate();
  const location = useLocation();

  const mealType = (location.state?.mealType || 'MEAL').toUpperCase();
  const dayId    = location.state?.dayId || null;

  const [mealId, setMealId] = useState(location.state?.mealId || null);
  const [foodItems, setFoodItems] = useState([]);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const [mode, setMode] = useState('idle');

  const [query, setQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [searching, setSearching] = useState(false);
  const [selectedResult, setSelectedResult] = useState(null);
  const [selectedQty, setSelectedQty] = useState('1');

  const [manualName, setManualName] = useState('');
  const [manualCalories, setManualCalories] = useState('');
  const [manualProtein, setManualProtein] = useState('');
  const [manualQty, setManualQty] = useState('100');

  const [favorites, setFavorites] = useState([]);
  const [favoriteMeals, setFavoriteMeals] = useState([]);
  const [showSaveMealModal, setShowSaveMealModal] = useState(false);
  const [favoriteMealName, setFavoriteMealName] = useState('');

  // load current food items when editing a meal
  useEffect(() => {
    if (!location.state?.mealId) return;
    api.get(`/api/meals/${location.state.mealId}/food-items`)
      .then(res => setFoodItems(res.data || []))
      .catch(() => {});
  }, []);

  useEffect(() => {
    getFavorites()
      .then(setFavorites)
      .catch(e => console.error('Failed to load favorites', e));
  }, []);

  useEffect(() => {
    getFavoriteMeals()
      .then(setFavoriteMeals)
      .catch(e => console.error('Failed to load favorite meals', e));
  }, []);

  const refreshFavorites = () =>
    getFavorites()
      .then(setFavorites)
      .catch(e => console.error('Failed to refresh favorites', e));

  const refreshFavoriteMeals = () =>
    getFavoriteMeals()
      .then(setFavoriteMeals)
      .catch(e => console.error('Failed to refresh favorite meals', e));

  const refreshFoodItems = (id) =>
    api.get(`/api/meals/${id}/food-items`)
      .then(res => setFoodItems(res.data || []))
      .catch(e => console.error('Failed to refresh food items', e));

  const totalCalories = foodItems.reduce((sum, f) => sum + (f.calories || 0), 0);
  const totalProtein  = foodItems.reduce((sum, f) => sum + (f.protein  || 0), 0);

  const ensureMeal = async () => {
    if (mealId) return mealId;
    if (!dayId) {
      setError('No day selected, go back and tap a meal slot.');
      return null;
    }
    const res = await api.post(`/api/days/${dayId}/meals`, { type: mealType, orderIndex: 0 });
    setMealId(res.data.id);
    return res.data.id;
  };

  const handleSearch = async () => {
    if (!query.trim()) return;
    setSearching(true);
    setSearchResults([]);
    setSelectedResult(null);
    try {
      const res = await api.get('/api/nutrition/search', { params: { query } });
      setSearchResults(res.data || []);
    } catch {
      setError('Search failed. Try again.');
    } finally {
      setSearching(false);
    }
  };

  const handleAddFromSearch = async () => {
    if (!selectedResult) return;
    setSaving(true);
    setError('');
    try {
      const id = await ensureMeal();
      if (!id) return;
      const qty = parseFloat(selectedQty) || 1;
      const res = await api.post(`/api/meals/${id}/food-items`, {
        source: 'USDA',
        fdcId: selectedResult.fdcId,
        servings: qty,
      });
      setFoodItems(prev => [...prev, res.data]);
      setSelectedResult(null);
      setSelectedQty('1');
      setSearchResults([]);
      setQuery('');
      setMode('idle');
    } catch {
      setError('Failed to add item.');
    } finally {
      setSaving(false);
    }
  };

  const handleAddManual = async () => {
    if (!manualName.trim() || !manualCalories) return;
    setSaving(true);
    setError('');
    try {
      const id = await ensureMeal();
      if (!id) return;
      const res = await api.post(`/api/meals/${id}/food-items`, {
        source: 'MANUAL',
        name: manualName,
        calories: parseFloat(manualCalories),
        protein: parseFloat(manualProtein) || 0,
        servings: parseFloat(manualQty) || 100,
      });
      setFoodItems(prev => [...prev, res.data]);
      setManualName('');
      setManualCalories('');
      setManualProtein('');
      setManualQty('100');
      setMode('idle');
    } catch {
      setError('Failed to add item.');
    } finally {
      setSaving(false);
    }
  };

  const handleRemove = async (foodItemId) => {
    if (!mealId) return;
    try {
      await api.delete(`/api/meals/${mealId}/food-items/${foodItemId}`);
      setFoodItems(prev => prev.filter(f => f.id !== foodItemId));
    } catch {
      setError('Failed to remove item.');
    }
  };

  const handleQuickAdd = async (favoriteId) => {
    try {
      const id = await ensureMeal();
      if (!id) return;
      const item = await quickAdd(favoriteId, id);
      setFoodItems(prev => [...prev, item]);
    } catch (e) {
      console.error('Quick add failed', e);
    }
  };

  const handleDeleteFavorite = async (id) => {
    try {
      await deleteFavorite(id);
      await refreshFavorites();
    } catch (e) {
      console.error('Failed to delete favorite', e);
    }
  };

  const handleSaveFavorite = async (result) => {
    try {
      await saveFavorite(result);
      await refreshFavorites();
    } catch (e) {
      console.error('Failed to save favorite', e);
    }
  };

  const handleQuickAddMeal = async (favoriteMealId) => {
    try {
      const id = await ensureMeal();
      if (!id) return;
      await quickAddMeal(favoriteMealId, id);
      await refreshFoodItems(id);
      await refreshFavoriteMeals();
    } catch (e) {
      console.error('Quick add meal failed', e);
    }
  };

  const handleDeleteFavoriteMeal = async (id) => {
    try {
      await deleteFavoriteMeal(id);
      await refreshFavoriteMeals();
    } catch (e) {
      console.error('Failed to delete favorite meal', e);
    }
  };

  const handleSaveMealAsFavorite = async () => {
    if (!favoriteMealName.trim() || !mealId) return;
    try {
      await saveMealAsFavorite(mealId, favoriteMealName.trim());
      await refreshFavoriteMeals();
      setShowSaveMealModal(false);
      setFavoriteMealName('');
    } catch (e) {
      console.error('Failed to save meal as favorite', e);
    }
  };

  const resetSearch = () => {
    setMode('idle');
    setSearchResults([]);
    setSelectedResult(null);
    setQuery('');
  };

  const gradient = MEAL_GRADIENTS[mealType] || MEAL_GRADIENTS.SNACK;

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

      {/* Header card */}
      <div style={{ width: '100%', maxWidth: '520px', marginBottom: '1.5rem' }}>
        <button type="button" onClick={() => navigate('/planner', { state: { refresh: Date.now() } })} style={ghostBtn}>
          ← Back
        </button>

        <div style={{
          marginTop: '1rem',
          padding: '1.25rem 1.5rem',
          borderRadius: '16px',
          background: gradient,
          border: '1px solid rgba(255,255,255,0.09)',
          boxShadow: '0 4px 24px rgba(0,0,0,0.4)',
          backdropFilter: 'blur(14px)',
        }}>
          <div style={{ fontSize: '0.68rem', color: 'rgba(255,255,255,0.45)', letterSpacing: '0.16em', textTransform: 'uppercase' }}>
            Adding
          </div>
          <div style={{ fontSize: '1.3rem', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', marginTop: '0.1rem' }}>
            {mealType}
          </div>
          <div style={{ marginTop: '0.85rem', display: 'flex', gap: '2rem' }}>
            <MacroStat label="Calories" value={`${totalCalories} kcal`} />
            <MacroStat label="Protein"  value={`${totalProtein.toFixed(1)}g`} />
          </div>
        </div>
      </div>

      {/* Favourite meals */}
      <div style={{ width: '100%', maxWidth: '520px', marginBottom: '1.25rem' }}>
        <div style={sectionLabel}>Favourite meals ⚡</div>
        {favoriteMeals.length === 0 ? (
          <div style={mutedHint}>Save a meal to see it here</div>
        ) : (
          <div style={{ display: 'flex', gap: '0.5rem', overflowX: 'auto', paddingBottom: '0.35rem' }}>
            {favoriteMeals.map(fm => (
              <div key={fm.id} style={quickCard}>
                <button type="button" onClick={() => handleDeleteFavoriteMeal(fm.id)} style={dismissBtn}>×</button>
                <div style={quickCardName}>{fm.name}</div>
                <div style={quickCardSub}>{fm.itemCount ?? fm.items?.length ?? '?'} items</div>
                <button type="button" onClick={() => handleQuickAddMeal(fm.id)} style={{ ...quickAddBtn, background: 'linear-gradient(135deg, rgba(176,112,254,0.55), rgba(254,105,165,0.35))' }}>
                  Add all
                </button>
              </div>
            ))}
          </div>
        )}

        {foodItems.length > 0 && (
          <button
            type="button"
            onClick={() => { setFavoriteMealName(''); setShowSaveMealModal(true); }}
            style={{ ...ghostBtn, marginTop: '0.65rem', fontSize: '0.77rem' }}
          >
            Save meal as favourite ★
          </button>
        )}
      </div>

      {/* Save meal modal */}
      {showSaveMealModal && (
        <div style={{
          position: 'fixed', inset: 0,
          background: 'rgba(0,0,0,0.75)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          zIndex: 100, padding: '1rem',
        }}>
          <div style={{
            width: '100%', maxWidth: '340px',
            background: 'rgba(15,23,42,0.98)',
            border: '1px solid rgba(255,255,255,0.08)',
            borderRadius: '16px',
            padding: '1.5rem',
            backdropFilter: 'blur(16px)',
          }}>
            <div style={{ fontSize: '0.85rem', fontWeight: 600, color: '#e5e7eb', marginBottom: '1rem' }}>
              Save meal as favourite
            </div>
            <div style={sectionLabel}>Meal name</div>
            <input
              autoFocus
              value={favoriteMealName}
              onChange={e => setFavoriteMealName(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleSaveMealAsFavorite()}
              placeholder="e.g. My go-to breakfast"
              style={{ ...inputStyle, marginBottom: '1rem' }}
            />
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <button type="button" onClick={handleSaveMealAsFavorite} disabled={!favoriteMealName.trim()} style={primaryBtn}>
                Save
              </button>
              <button type="button" onClick={() => setShowSaveMealModal(false)} style={ghostBtn}>
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Food items list */}
      <div style={{ width: '100%', maxWidth: '520px', marginBottom: '1rem' }}>
        <div style={sectionLabel}>Food items</div>

        {foodItems.length === 0 ? (
          <div style={{
            padding: '1.5rem',
            borderRadius: '12px',
            border: '1px dashed rgba(255,255,255,0.1)',
            background: 'rgba(255,255,255,0.02)',
            color: '#4b5563',
            textAlign: 'center',
            fontSize: '0.82rem',
          }}>
            No items yet — search or add one below
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
            {foodItems.map(item => (
              <div key={item.id} style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: '0.65rem 0.9rem',
                borderRadius: '12px',
                border: '1px solid rgba(255,255,255,0.07)',
                background: 'rgba(255,255,255,0.04)',
              }}>
                <div>
                  <div style={{ fontSize: '0.85rem', fontWeight: 500, color: '#e5e7eb' }}>{item.name}</div>
                  <div style={{ fontSize: '0.72rem', color: '#6b7280', marginTop: '0.1rem' }}>
                    {item.servings} servings · {item.calories} kcal · {item.protein}g protein
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => handleRemove(item.id)}
                  style={{ ...ghostBtn, padding: '0.2rem 0.5rem', fontSize: '0.75rem', color: '#f87171', borderColor: 'rgba(248,113,113,0.25)' }}
                >
                  ✕
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Favourite food items */}
      <div style={{ width: '100%', maxWidth: '520px', marginBottom: '1rem' }}>
        <div style={sectionLabel}>Favourites ⚡</div>
        {favorites.length === 0 ? (
          <div style={mutedHint}>Save items from search to add favourites</div>
        ) : (
          <div style={{ display: 'flex', gap: '0.5rem', overflowX: 'auto', paddingBottom: '0.35rem' }}>
            {favorites.map(fav => (
              <div key={fav.id} style={quickCard}>
                <button type="button" onClick={() => handleDeleteFavorite(fav.id)} style={dismissBtn}>×</button>
                <div style={quickCardName}>{fav.name}</div>
                <div style={quickCardSub}>{fav.calories} kcal · {fav.protein ?? 0}g</div>
                <button type="button" onClick={() => handleQuickAdd(fav.id)} style={{ ...quickAddBtn, background: 'linear-gradient(135deg, rgba(56,146,248,0.55), rgba(16,185,129,0.35))' }}>
                  Add
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Add buttons (idle) */}
      {mode === 'idle' && (
        <div style={{ width: '100%', maxWidth: '520px', display: 'flex', gap: '0.6rem', marginBottom: '1rem' }}>
          <button
            type="button"
            onClick={() => setMode('search')}
            style={{ ...actionBtn, background: 'rgba(56,146,248,0.18)', borderColor: 'rgba(56,146,248,0.3)' }}
          >
            Search food
          </button>
          <button
            type="button"
            onClick={() => setMode('manual')}
            style={{ ...actionBtn, background: 'rgba(251,162,60,0.15)', borderColor: 'rgba(251,162,60,0.28)' }}
          >
            + Add manually
          </button>
        </div>
      )}

      {/* Search panel */}
      {mode === 'search' && (
        <div style={{ width: '100%', maxWidth: '520px', ...panelStyle }}>
          <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.75rem' }}>
            <input
              value={query}
              onChange={e => setQuery(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleSearch()}
              placeholder="e.g. chicken breast"
              style={{ ...inputStyle, flex: 1 }}
            />
            <button type="button" onClick={handleSearch} disabled={searching} style={searchBtn}>
              {searching ? '…' : 'Search'}
            </button>
          </div>

          {!selectedResult && searchResults.length > 0 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem', maxHeight: '220px', overflowY: 'auto' }}>
              {searchResults.map((r, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                  <button
                    type="button"
                    onClick={() => setSelectedResult(r)}
                    style={{
                      flex: 1, textAlign: 'left',
                      padding: '0.55rem 0.8rem',
                      borderRadius: '10px',
                      border: '1px solid rgba(255,255,255,0.07)',
                      background: 'rgba(255,255,255,0.03)',
                      color: '#e5e7eb',
                      cursor: 'pointer',
                      fontSize: '0.82rem',
                    }}
                  >
                    <div>{r.name}</div>
                    <div style={{ fontSize: '0.7rem', color: '#6b7280', marginTop: '0.1rem' }}>
                      {r.calories} kcal · {r.protein ?? 0}g protein · per {r.servingDescription || '1 serving'}
                    </div>
                  </button>
                  <button
                    type="button"
                    onClick={() => handleSaveFavorite(r)}
                    title="Save to favourites"
                    style={{
                      flexShrink: 0,
                      background: 'rgba(255,255,255,0.04)',
                      border: '1px solid rgba(255,255,255,0.1)',
                      borderRadius: '8px',
                      color: '#fbbf24',
                      cursor: 'pointer',
                      fontSize: '0.95rem',
                      padding: '0.42rem 0.52rem',
                      lineHeight: 1,
                    }}
                  >★</button>
                </div>
              ))}
            </div>
          )}

          {selectedResult && (
            <div>
              <div style={{ fontSize: '0.88rem', fontWeight: 500, marginBottom: '0.5rem', color: '#e5e7eb' }}>
                {selectedResult.name}
              </div>
              <div style={{ fontSize: '0.72rem', color: '#6b7280', marginBottom: '0.65rem' }}>
                1 serving = {selectedResult.servingDescription || '100g'}
              </div>
              <div style={{ display: 'flex', gap: '0.6rem', alignItems: 'flex-end' }}>
                <div style={{ flex: 1 }}>
                  <div style={fieldLabel}>Servings</div>
                  <input type="number" value={selectedQty} onChange={e => setSelectedQty(e.target.value)} style={inputStyle} />
                </div>
                <button type="button" onClick={handleAddFromSearch} disabled={saving} style={primaryBtn}>
                  {saving ? '…' : 'Add'}
                </button>
                <button type="button" onClick={() => setSelectedResult(null)} style={ghostBtn}>←</button>
              </div>
            </div>
          )}

          <button type="button" onClick={resetSearch} style={{ ...ghostBtn, marginTop: '0.85rem', fontSize: '0.78rem' }}>
            Cancel
          </button>
        </div>
      )}

      {/* Manual panel */}
      {mode === 'manual' && (
        <div style={{ width: '100%', maxWidth: '520px', ...panelStyle }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.7rem' }}>
            <div>
              <div style={fieldLabel}>Name</div>
              <input value={manualName} onChange={e => setManualName(e.target.value)} placeholder="e.g. Oat milk" style={inputStyle} />
            </div>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <div style={{ flex: 1 }}>
                <div style={fieldLabel}>Calories</div>
                <input type="number" value={manualCalories} onChange={e => setManualCalories(e.target.value)} placeholder="kcal" style={inputStyle} />
              </div>
              <div style={{ flex: 1 }}>
                <div style={fieldLabel}>Protein (g)</div>
                <input type="number" value={manualProtein} onChange={e => setManualProtein(e.target.value)} placeholder="g" style={inputStyle} />
              </div>
              <div style={{ flex: 1 }}>
                <div style={fieldLabel}>Qty (g)</div>
                <input type="number" value={manualQty} onChange={e => setManualQty(e.target.value)} style={inputStyle} />
              </div>
            </div>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <button type="button" onClick={handleAddManual} disabled={saving || !manualName.trim() || !manualCalories} style={primaryBtn}>
                {saving ? 'Adding…' : 'Add item'}
              </button>
              <button type="button" onClick={() => setMode('idle')} style={ghostBtn}>Cancel</button>
            </div>
          </div>
        </div>
      )}

      {error && (
        <p style={{ color: '#f87171', fontSize: '0.82rem', marginTop: '0.5rem', textAlign: 'center' }}>
          {error}
        </p>
      )}

      {/* Done button */}
      {foodItems.length > 0 && (
        <div style={{ width: '100%', maxWidth: '520px', marginTop: '1.5rem' }}>
          <button
            type="button"
            onClick={() => navigate('/planner', { state: { refresh: Date.now() } })}
            style={{
              width: '100%',
              padding: '0.8rem',
              borderRadius: '10px',
              border: 'none',
              background: 'white',
              color: '#0a0a0a',
              fontWeight: 600,
              letterSpacing: '0.04em',
              cursor: 'pointer',
              fontSize: '0.9rem',
            }}
          >
            Done
          </button>
        </div>
      )}
    </div>
  );
}

function MacroStat({ label, value }) {
  return (
    <div>
      <div style={{ fontSize: '0.65rem', color: 'rgba(255,255,255,0.45)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>{label}</div>
      <div style={{ fontSize: '0.95rem', fontWeight: 600 }}>{value}</div>
    </div>
  );
}

const ghostBtn   = { background: 'none', border: '1px solid rgba(255,255,255,0.12)', color: '#9ca3af', borderRadius: '8px', padding: '0.4rem 0.85rem', cursor: 'pointer', fontSize: '0.82rem' };
const primaryBtn = { padding: '0.55rem 1.25rem', borderRadius: '8px', border: 'none', background: 'white', color: '#0a0a0a', fontWeight: 600, cursor: 'pointer', fontSize: '0.85rem' };
const actionBtn  = { flex: 1, padding: '0.7rem', borderRadius: '10px', border: '1px solid', color: '#e5e7eb', fontWeight: 500, fontSize: '0.82rem', cursor: 'pointer', letterSpacing: '0.03em' };
const panelStyle = { padding: '1.25rem', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.08)', background: 'rgba(255,255,255,0.04)', backdropFilter: 'blur(12px)', marginBottom: '1rem' };
const inputStyle = { width: '100%', padding: '0.55rem 0.75rem', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.1)', background: 'rgba(255,255,255,0.05)', color: 'white', outline: 'none', fontSize: '0.88rem', boxSizing: 'border-box' };
const fieldLabel = { fontSize: '0.68rem', color: '#6b7280', marginBottom: '0.3rem', textTransform: 'uppercase', letterSpacing: '0.08em' };
const searchBtn  = { padding: '0.55rem 1rem', borderRadius: '8px', border: 'none', background: 'white', color: '#0a0a0a', fontWeight: 600, cursor: 'pointer', fontSize: '0.82rem', whiteSpace: 'nowrap' };
const sectionLabel = { fontSize: '0.68rem', color: '#4b5563', textTransform: 'uppercase', letterSpacing: '0.14em', marginBottom: '0.5rem' };
const mutedHint    = { fontSize: '0.78rem', color: '#374151', fontStyle: 'italic' };

// Quick-add card shared styles
const quickCard    = { flexShrink: 0, padding: '0.55rem 0.7rem', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.08)', background: 'rgba(255,255,255,0.04)', minWidth: '110px', maxWidth: '145px', position: 'relative' };
const quickCardName = { fontSize: '0.76rem', fontWeight: 600, color: '#e5e7eb', marginBottom: '0.15rem', paddingRight: '0.9rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' };
const quickCardSub  = { fontSize: '0.66rem', color: '#6b7280', marginBottom: '0.4rem' };
const quickAddBtn   = { width: '100%', padding: '0.22rem', borderRadius: '6px', border: 'none', color: 'white', fontWeight: 600, fontSize: '0.7rem', cursor: 'pointer' };
const dismissBtn    = { position: 'absolute', top: '0.28rem', right: '0.28rem', background: 'none', border: 'none', color: '#4b5563', cursor: 'pointer', fontSize: '0.68rem', lineHeight: 1, padding: '0.1rem 0.15rem' };

export default MealCreator;
