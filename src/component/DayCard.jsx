import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';

const GRADIENTS = [
  'linear-gradient(135deg, rgba(56, 146, 248, 0.57), rgba(16, 185, 129, 0.25))',
  'linear-gradient(135deg, rgba(251, 226, 36, 0.51), rgba(248, 113, 113, 0.32))',
  'linear-gradient(135deg, rgba(176, 112, 254, 0.63), rgba(254, 105, 165, 0.27))',
  'linear-gradient(135deg, rgba(84, 160, 252, 0.57), rgba(163, 129, 248, 0.32))',
  'linear-gradient(135deg, rgba(48, 228, 204, 0.54), rgba(59, 131, 246, 0.33))',
  'linear-gradient(135deg, rgba(251, 162, 60, 0.56), rgba(248, 113, 113, 0.35))',
  'linear-gradient(135deg, rgba(244, 114, 218, 0.54), rgba(191, 56, 248, 0.41))',
];

function DayCard({ dayName, gradientIndex, date, dayData, refreshKey }) {
  const [meals, setMeals] = useState([]);
  const [summary, setSummary] = useState(null);

  useEffect(() => {
    if (!dayData?.id) return;
    api.get(`/api/days/${dayData.id}/meals`)
      .then(res =>setMeals(res.data||[]))
      .catch(() =>{});
  }, [dayData?.id, refreshKey]);

  useEffect(() => {
    if(!date) return;
    api.get(`/api/daily-summary/${date}`)
      .then(res => setSummary(res.data))
      .catch(()=>{});
  },[date, refreshKey]);

  const getMeal = (type) =>
    meals.find(m => m.type?.toUpperCase()=== type.toUpperCase())||null;

  const caloriesPct = summary?.progress?.caloriesPercent ?? 0;
  const proteinPct = summary?.progress?.proteinPercent ?? 0;
  const totalCal = summary?.totals?.calories ?? 0;
  const totalProt = summary?.totals?.protein ?? 0;

  return (
    <div
      style={{
        position: 'relative',
        padding: '1.5rem 1.25rem',
        borderRadius: '24px',
        background: GRADIENTS[gradientIndex % GRADIENTS.length],
        border: '1px solid rgba(254,215,170,0.6)',
        boxShadow: '0 12px 30px rgba(15,23,42,0.95), 0 0 6px rgba(168,85,247,0.45)',
        backdropFilter: 'blur(16px)',
      }}
    >
      {/*Day header*/}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
        <div style={{ fontSize: '1.1rem', letterSpacing: '0.16em', textTransform: 'uppercase', fontWeight: 700 }}>
          {dayName}
        </div>
        <div style={{ fontSize: '0.8rem', color: '#e5e7eb', display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '0.15rem' }}>
          <span>{totalCal} kcal · {caloriesPct}%</span>
          <span>{totalProt?.toFixed(1)}g protein · {proteinPct}%</span>
        </div>
      </div>

      {/*Progress bars*/}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem', marginBottom: '1.2rem' }}>
        <ProgressBar label="Calories" value={caloriesPct} color="#fb923c" />
        <ProgressBar label="Protein" value={proteinPct} color="#38bdf8" />
      </div>

      {/* Meal slots */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
        <MealSlot mealType="Breakfast" dayId={dayData?.id} meal={getMeal('BREAKFAST')} />
        <MealSlot mealType="Lunch" dayId={dayData?.id} meal={getMeal('LUNCH')} />
        <MealSlot mealType="Dinner" dayId={dayData?.id} meal={getMeal('DINNER')} />
        <MealSlot mealType="Snack" dayId={dayData?.id} meal={getMeal('SNACK')} />
      </div>
    </div>
  );
}

function ProgressBar({ label, value, color }) {
  const clamped = Math.min(value, 100);
  return(
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: '#e5e7eb', marginBottom: '0.2rem' }}>
        <span>{label}</span>
        <span>{value}%</span>
      </div>
      <div style={{ height: '6px', borderRadius: '999px', background: 'rgba(15,23,42,0.85)', overflow: 'hidden' }}>
        <div style={{
          width: `${clamped}%`,
          height: '100%',
          borderRadius: '999px',
          background: value > 100
            ? 'linear-gradient(90deg, #ef4444, #f97316)'
            : `linear-gradient(90deg, ${color}, #16f947)`,
          boxShadow: '0 0 10px rgba(251,146,60,0.6)',
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
          padding: '0.65rem 0.85rem',
          borderRadius: '14px',
          border: '1px dashed rgba(148,163,184,0.9)',
          background: 'rgba(15,23,42,0.85)',
          color: '#e5e7eb',
          fontSize: '0.85rem',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          cursor: 'pointer',
        }}
        onClick={() => navigate('/MealCreator', { state: { mealType, dayId } })}
      >
        <span style={{ opacity: 0.9 }}>+ Add {mealType}</span>
        <span style={{ width: '22px', height: '22px', borderRadius: '999px', border: '1px solid rgba(148,163,184,0.9)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1rem' }}>
          +
        </span>
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
        padding: '0.65rem 0.85rem',
        borderRadius: '14px',
        border: '1px solid rgba(148,163,184,0.45)',
        background: 'rgba(15,23,42,0.92)',
        color: '#e5e7eb',
        fontSize: '0.85rem',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        cursor: 'pointer',
        textAlign: 'left',
      }}
      onClick={() => navigate('/MealCreator', { state: { mealType, dayId, mealId: meal.id } })}
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.1rem' }}>
        <span style={{ fontWeight: 500 }}>{mealType}</span>
        <span style={{ fontSize: '0.72rem', color: '#9ca3af' }}>
          {mealCalories} kcal · {mealProtein.toFixed(1)}g protein
        </span>
      </div>
      <span style={{ fontSize: '0.75rem', color: '#6b7280' }}>Edit →</span>
    </button>
  );
}

export default DayCard;