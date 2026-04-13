import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';

const GRADIENTS = [
  'linear-gradient(135deg, rgba(56, 146, 248, 0.34), rgba(16, 185, 129, 0.15))',
  'linear-gradient(135deg, rgba(251, 226, 36, 0.38), rgba(248, 113, 113, 0.26))',
  'linear-gradient(135deg, rgba(176, 112, 254, 0.45), rgba(254, 105, 165, 0.2))',
  'linear-gradient(135deg, rgba(84, 160, 252, 0.42), rgba(163, 129, 248, 0.22))',
  'linear-gradient(135deg, rgba(48, 228, 204, 0.38), rgba(59, 131, 246, 0.22))',
  'linear-gradient(135deg, rgba(251, 162, 60, 0.4), rgba(248, 113, 113, 0.24))',
  'linear-gradient(135deg, rgba(244, 114, 218, 0.38), rgba(191, 56, 248, 0.28))',
];

function DayCard({ dayName, gradientIndex, date, dayData, refreshKey }) {
  const [meals, setMeals] = useState([]);
  const [summary, setSummary] = useState(null);

  useEffect(() => {
    if (!dayData?.id) return;
    api.get(`/api/days/${dayData.id}/meals`)
      .then(res => setMeals(res.data || []))
      .catch(err => console.error('Failed to fetch meals for day', dayData.id, err));
  }, [dayData?.id, refreshKey]);

  useEffect(() => {
    if (!date) return;
    api.get(`/api/daily-summary/${date}`)
      .then(res => setSummary(res.data))
      .catch(err => console.error('[DayCard] summary fetch failed for', date, err));
  }, [date, refreshKey]);

  const getMeal = (type) =>
    meals.find(m => m.type?.toUpperCase() === type.toUpperCase()) || null;

  const caloriesPct = summary?.progress?.caloriesPercent ?? 0;
  const proteinPct  = summary?.progress?.proteinPercent  ?? 0;
  const totalCal    = summary?.totals?.calories ?? 0;
  const totalProt   = summary?.totals?.protein  ?? 0;

  return (
    <div style={{
      position: 'relative',
      padding: '1.25rem',
      borderRadius: '20px',
      background: GRADIENTS[gradientIndex % GRADIENTS.length],
      border: '1px solid rgba(255,255,255,0.09)',
      boxShadow: '0 4px 24px rgba(0,0,0,0.4)',
      backdropFilter: 'blur(14px)',
    }}>
      {/* Day header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.85rem' }}>
        <div style={{ fontSize: '0.78rem', letterSpacing: '0.18em', textTransform: 'uppercase', fontWeight: 700, color: '#f1f5f9' }}>
          {dayName}
        </div>
        <div style={{ fontSize: '0.72rem', color: 'rgba(255,255,255,0.55)', display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '0.1rem' }}>
          <span>{totalCal} kcal · {caloriesPct}%</span>
          <span>{totalProt?.toFixed(1)}g protein · {proteinPct}%</span>
        </div>
      </div>

      {/* Progress bars */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem', marginBottom: '1rem' }}>
        <ProgressBar label="Calories" value={caloriesPct} color="#fb923c" />
        <ProgressBar label="Protein"  value={proteinPct}  color="#38bdf8" />
      </div>

      {/* Meal slots */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
        <MealSlot mealType="Breakfast" dayId={dayData?.id} meal={getMeal('BREAKFAST')} />
        <MealSlot mealType="Lunch"     dayId={dayData?.id} meal={getMeal('LUNCH')} />
        <MealSlot mealType="Dinner"    dayId={dayData?.id} meal={getMeal('DINNER')} />
        <MealSlot mealType="Snack"     dayId={dayData?.id} meal={getMeal('SNACK')} />
      </div>
    </div>
  );
}

function ProgressBar({ label, value, color }) {
  const clamped = Math.min(value, 100);
  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.68rem', color: 'rgba(255,255,255,0.5)', marginBottom: '0.2rem', letterSpacing: '0.04em' }}>
        <span>{label}</span>
        <span>{value}%</span>
      </div>
      <div style={{ height: '4px', borderRadius: '999px', background: 'rgba(255,255,255,0.1)', overflow: 'hidden' }}>
        <div style={{
          width: `${clamped}%`,
          height: '100%',
          borderRadius: '999px',
          background: value > 100
            ? 'linear-gradient(90deg, #ef4444, #f97316)'
            : `linear-gradient(90deg, ${color}, #4ade80)`,
          transition: 'width 0.4s ease',
        }} />
      </div>
    </div>
  );
}

function MealSlot({ mealType, meal, dayId }) {
  const navigate = useNavigate();

  if (!meal) {
    return (
      <button
        type="button"
        style={{
          width: '100%',
          padding: '0.6rem 0.85rem',
          borderRadius: '12px',
          border: '1px dashed rgba(255,255,255,0.18)',
          background: 'rgba(255,255,255,0.03)',
          color: 'rgba(255,255,255,0.45)',
          fontSize: '0.82rem',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          cursor: 'pointer',
          transition: 'background 0.15s',
        }}
        onClick={() => navigate('/MealCreator', { state: { mealType, dayId } })}
      >
        <span>+ Add {mealType}</span>
        <span style={{
          width: '20px',
          height: '20px',
          borderRadius: '999px',
          border: '1px solid rgba(255,255,255,0.2)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '0.85rem',
          lineHeight: 1,
        }}>+</span>
      </button>
    );
  }

  const mealCalories = meal?.foodItems?.reduce((sum, f) => sum + (f.calories || 0), 0) ?? 0;
  const mealProtein  = meal?.foodItems?.reduce((sum, f) => sum + (f.protein  || 0), 0) ?? 0;

  return (
    <button
      type="button"
      style={{
        width: '100%',
        padding: '0.6rem 0.85rem',
        borderRadius: '12px',
        border: '1px solid rgba(255,255,255,0.12)',
        background: 'rgba(255,255,255,0.07)',
        color: '#e5e7eb',
        fontSize: '0.82rem',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        cursor: 'pointer',
        textAlign: 'left',
      }}
      onClick={() => navigate('/MealCreator', { state: { mealType, dayId, mealId: meal.id } })}
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.1rem' }}>
        <span style={{ fontWeight: 600, fontSize: '0.82rem' }}>{mealType}</span>
        <span style={{ fontSize: '0.68rem', color: 'rgba(255,255,255,0.45)' }}>
          {mealCalories} kcal · {mealProtein.toFixed(1)}g protein
        </span>
      </div>
      <span style={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.3)' }}>Edit →</span>
    </button>
  );
}

export default DayCard