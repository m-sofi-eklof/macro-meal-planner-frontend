import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import api from '../api/axios';

const MEAL_GRADIENTS = {
  BREAKFAST:'linear-gradient(135deg, rgba(251,226,36,0.5), rgba(248,113,113,0.3))',
  LUNCH:'linear-gradient(135deg, rgba(56,146,248,0.55), rgba(16,185,129,0.25))',
  DINNER:'linear-gradient(135deg, rgba(176,112,254,0.6), rgba(254,105,165,0.27))',
  SNACK:'linear-gradient(135deg, rgba(48,228,204,0.5), rgba(59,131,246,0.3))',
};

function MealCreator() {
  const navigate = useNavigate();
  const location = useLocation();

  const mealType = (location.state?.mealType||'MEAL').toUpperCase();
  const dayId = location.state?.dayId||null;

  const [mealId, setMealId] = useState(location.state?.mealId || null);
  const [foodItems, setFoodItems] = useState([]);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const [mode, setMode] = useState('idle');

  const [query, setQuery]= useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [searching, setSearching] = useState(false);
  const [selectedResult, setSelectedResult] =useState(null);
  const [selectedQty, setSelectedQty] =useState('1');

  const [manualName, setManualName]=useState('');
  const [manualCalories, setManualCalories] =useState('');
  const [manualProtein, setManualProtein] =useState('');
  const [manualQty, setManualQty] =useState('100');

  //load current food items when editing a meal
  useEffect(() => {
    if (!location.state?.mealId) return;
    api.get(`/api/meals/${location.state.mealId}/food-items`)
      .then(res=>setFoodItems(res.data||[]))
      .catch(()=>{});
  },[]);

  const totalCalories = foodItems.reduce((sum, f)=> sum + (f.calories ||0),0);
  const totalProtein = foodItems.reduce((sum, f)=> sum + (f.protein ||0),0);

  const ensureMeal = async()=> {
    if (mealId) return mealId;
    if (!dayId) {
      setError('No day selected, go back and tap a meal slot.');
      return null;
    }
    const res = await api.post(`/api/days/${dayId}/meals`, {
      type: mealType,
      orderIndex: 0,
    });
    setMealId(res.data.id);
    return res.data.id;
  };

  const handleSearch = async()=> {
    if(!query.trim()) return;
    setSearching(true);
    setSearchResults([]);
    setSelectedResult(null);
    try{
      const res = await api.get('/api/nutrition/search', { params: { query } });
      setSearchResults(res.data || []);
    } catch {
      setError('Search failed. Try again.');
    } finally {
      setSearching(false);
    }
  };

  const handleAddFromSearch = async()=> {
    if(!selectedResult) return;
    setSaving(true);
    setError('');
    try {
      const id = await ensureMeal();
      if(!id) return;
      const qty = parseFloat(selectedQty)|| 1;
      const res = await api.post(`/api/meals/${id}/food-items`, {
        source: 'USDA',
        fdcId: selectedResult.fdcId,
        servings: qty,
      });
      setFoodItems(prev =>[...prev, res.data]);
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
    if (!manualName.trim()||!manualCalories) return;
    setSaving(true);
    setError('');
    try {
      const id = await ensureMeal();
      if(!id) return;
      const res = await api.post(`/api/meals/${id}/food-items`, {
        source:'MANUAL',
        name: manualName,
        calories: parseFloat(manualCalories),
        protein: parseFloat(manualProtein) || 0,
        servings: parseFloat(manualQty) || 100,
      });
      setFoodItems(prev =>[...prev, res.data]);
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

  const handleRemove = async (foodItemId)=> {
    if (!mealId) return;
    try {
      await api.delete(`/api/meals/${mealId}/food-items/${foodItemId}`);
      setFoodItems(prev => prev.filter(f => f.id !== foodItemId));
    } catch {
      setError('Failed to remove item.');
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
      background: 'radial-gradient(circle at top, #060918e5 0%, #030510c8 50%, #00000091 100%)',
      color: 'white',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      padding: '2rem 1rem',
      overflowY: 'auto',
    }}>

      {/*header card*/}
      <div style={{width:'100%', maxWidth:'520px', marginBottom:'1.5rem'}}>
        <button type="button" onClick={()=> navigate('/planner', { state: {refresh: Date.now()}})} style={ghostBtn}>
          ← Back
        </button>

        <div style={{
          marginTop: '1rem',
          padding: '1.25rem 1.5rem',
          borderRadius: '20px',
          background: gradient,
          border: '1px solid rgba(254,215,170,0.5)',
          boxShadow: '0 12px 30px rgba(15,23,42,0.95), 0 0 6px rgba(168,85,247,0.35)',
          backdropFilter: 'blur(16px)',
        }}>
          <div style={{fontSize:'0.72rem', color:'#9ca3af', letterSpacing:'0.14em', textTransform:'uppercase' }}>
            Adding
          </div>
          <div style={{fontSize:'1.4rem', fontWeight:700, letterSpacing:'0.12em', textTransform:'uppercase' }}>
            {mealType}
          </div>
          <div style={{ marginTop:'0.85rem', display:'flex', gap:'2rem' }}>
            <MacroStat label="Calories" value={`${totalCalories} kcal`} />
            <MacroStat label="Protein" value={`${totalProtein.toFixed(1)}g`} />
          </div>
        </div>
      </div>

      {/*food items list*/}
      <div style={{width:'100%', maxWidth:'520px', marginBottom:'1rem' }}>
        <div style={sectionLabel}>Food items</div>

        {foodItems.length === 0 ? (
          <div style={{
            padding: '1.5rem',
            borderRadius: '16px',
            border: '1px dashed rgba(148,163,184,0.35)',
            background: 'rgba(15,23,42,0.6)',
            color: '#6b7280',
            textAlign: 'center',
            fontSize: '0.85rem',
          }}>
            No items yet. Search or add one below
          </div>
        ) : (
          <div style={{ display:'flex', flexDirection:'column', gap:'0.5rem' }}>
            {foodItems.map(item =>(
              <div key={item.id} style={{
                display: 'flex',
                justifyContent:'space-between',
                alignItems:'center',
                padding:'0.7rem 1rem',
                borderRadius:'14px',
                border:'1px solid rgba(148,163,184,0.18)',
                background:'rgba(15,23,42,0.85)',
              }}>
                <div>
                  <div style={{ fontSize:'0.9rem', fontWeight:500 }}>{item.name}</div>
                  <div style={{ fontSize:'0.75rem', color:'#9ca3af', marginTop:'0.15rem' }}>
                    {item.servings} servings · {item.calories} kcal · {item.protein}g protein
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => handleRemove(item.id)}
                  style={{ ...ghostBtn, padding:'0.2rem 0.55rem', fontSize:'0.8rem', color:'#f87171', borderColor:'rgba(248,113,113,0.35)'}}
                >
                  ✕
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/*add buttons(idle)*/}
      {mode === 'idle' && (
        <div style={{ width: '100%', maxWidth: '520px', display: 'flex', gap: '0.75rem', marginBottom: '1rem' }}>
          <button type="button" onClick={() => setMode('search')} style={{ ...actionBtn, background: 'linear-gradient(135deg, rgba(56,146,248,0.65), rgba(16,185,129,0.45))' }}>
            Search
          </button>
          <button type="button" onClick={() => setMode('manual')} style={{ ...actionBtn, background: 'linear-gradient(135deg, rgba(251,162,60,0.65), rgba(248,113,113,0.45))' }}>
            + Add manually
          </button>
        </div>
      )}

      {/*search panel*/}
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
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem', maxHeight: '220px', overflowY: 'auto' }}>
              {searchResults.map((r, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => setSelectedResult(r)}
                  style={{ textAlign: 'left', padding: '0.6rem 0.85rem', borderRadius: '10px', border: '1px solid rgba(148,163,184,0.18)', background: 'rgba(15,23,42,0.8)', color: '#e5e7eb', cursor: 'pointer', fontSize: '0.85rem' }}
                >
                  <div>{r.name}</div>
                  <div style={{ fontSize: '0.72rem', color: '#9ca3af', marginTop: '0.15rem' }}>
                    {r.calories} kcal · {r.protein ?? 0}g protein · per {r.servingDescription || '100g'}
                  </div>
                </button>
              ))}
            </div>
          )}

          {selectedResult &&(
            <div>
              <div style={{ fontSize: '0.9rem', fontWeight: 500, marginBottom: '0.6rem', color: '#e5e7eb' }}>
                {selectedResult.name}
              </div>
              <div style={{ fontSize: '0.75rem', color: '#9ca3af', marginBottom: '0.6rem' }}>
                1 serving = {selectedResult.servingDescription || '100g'}
              </div>
              <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'flex-end' }}>
                <div style={{ flex: 1 }}>
                  <div style={fieldLabel}>Servings</div>
                  <input type="number" value={selectedQty} onChange={e => setSelectedQty(e.target.value)} style={inputStyle} />
                </div>
                <button type="button" onClick={handleAddFromSearch} disabled={saving} style={confirmBtn}>
                  {saving ? '…' : 'Add'}
                </button>
                <button type="button" onClick={() => setSelectedResult(null)} style={ghostBtn}>←</button>
              </div>
            </div>
          )}

          <button type="button" onClick={resetSearch} style={{ ...ghostBtn, marginTop: '0.85rem', fontSize: '0.8rem' }}>
            Cancel
          </button>
        </div>
      )}

      {/*manual panel*/}
      {mode === 'manual' && (
        <div style={{ width: '100%', maxWidth: '520px', ...panelStyle }}>
          <div style={{display: 'flex', flexDirection: 'column', gap: '0.75rem'}}>
            <div>
              <div style={fieldLabel}>Name</div>
              <input value={manualName} onChange={e => setManualName(e.target.value)} placeholder="e.g. Oat milk" style={inputStyle} />
            </div>
            <div style={{ display: 'flex', gap: '0.6rem'}}>
              <div style={{ flex: 1}}>
                <div style={fieldLabel}>Calories</div>
                <input type="number" value={manualCalories} onChange={e => setManualCalories(e.target.value)} placeholder="kcal" style={inputStyle} />
              </div>
              <div style={{ flex: 1}}>
                <div style={fieldLabel}>Protein (g)</div>
                <input type="number" value={manualProtein} onChange={e => setManualProtein(e.target.value)} placeholder="g" style={inputStyle} />
              </div>
              <div style={{ flex: 1}}>
                <div style={fieldLabel}>Qty (g)</div>
                <input type="number" value={manualQty} onChange={e => setManualQty(e.target.value)} style={inputStyle} />
              </div>
            </div>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <button type="button" onClick={handleAddManual} disabled={saving || !manualName.trim() || !manualCalories} style={confirmBtn}>
                {saving ? 'Adding…' : 'Add item'}
              </button>
              <button type="button" onClick={() => setMode('idle')} style={ghostBtn}>Cancel</button>
            </div>
          </div>
        </div>
      )}

      {error && (
        <p style={{ color:'#f87171', fontSize:'0.85rem', marginTop:'0.5rem', textAlign:'center' }}>
          {error}
        </p>
      )}

      {/*done button*/}
      {foodItems.length > 0 && (
        <div style={{ width: '100%', maxWidth: '520px', marginTop: '1.5rem' }}>
          <button
            type="button"
            onClick={() =>navigate('/planner', { state: { refresh: Date.now() } })}
            style={{
              width: '100%',
              padding: '0.85rem',
              borderRadius: '999px',
              border: 'none',
              background: 'linear-gradient(135deg, #22d3ee, #ec4899)',
              color: '#000',
              fontWeight: 675,
              letterSpacing: '0.1em',
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
      <div style={{ fontSize: '0.7rem', color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.1em' }}>{label}</div>
      <div style={{ fontSize: '1rem', fontWeight: 600 }}>{value}</div>
    </div>
  );
}

const ghostBtn = { background: 'none', border: '1px solid rgba(148,163,184,0.3)', color: '#9ca3af', borderRadius: '999px', padding: '0.4rem 0.9rem', cursor: 'pointer', fontSize: '0.85rem' };
const actionBtn = { flex: 1, padding: '0.75rem', borderRadius: '14px', border: '1px solid rgba(148,163,184,0.18)', color: 'white', fontWeight: 600, fontSize: '0.85rem', cursor: 'pointer', letterSpacing: '0.05em' };
const panelStyle = { padding: '1.25rem', borderRadius: '20px', border: '1px solid rgba(148,163,184,0.18)', background: 'rgba(15,23,42,0.85)', backdropFilter: 'blur(14px)', marginBottom: '1rem' };
const inputStyle = { width: '100%', padding: '0.55rem 0.75rem', borderRadius: '10px', border: '1px solid rgba(148,163,184,0.3)', background: '#020617', color: 'white', outline: 'none', fontSize: '0.9rem', boxSizing: 'border-box' };
const fieldLabel = { fontSize: '0.72rem', color: '#9ca3af', marginBottom: '0.3rem', textTransform: 'uppercase', letterSpacing: '0.08em' };
const searchBtn = { padding: '0.55rem 1rem', borderRadius: '10px', border: 'none', background: 'linear-gradient(135deg, rgba(56,146,248,0.8), rgba(16,185,129,0.6))', color: 'white', fontWeight: 600, cursor: 'pointer', fontSize: '0.85rem', whiteSpace: 'nowrap' };
const confirmBtn = { padding: '0.55rem 1.25rem', borderRadius: '10px', border: 'none', background: 'linear-gradient(135deg, #22d3ee, #ec4899)', color: '#000', fontWeight: 600, cursor: 'pointer', fontSize: '0.85rem' };
const sectionLabel = { fontSize: '0.72rem', color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.14em', marginBottom: '0.6rem' };

export default MealCreator;