const GRADIENTS = [
  'linear-gradient(135deg, rgba(56,189,248,0.18), rgba(16,185,129,0.12))',
  'linear-gradient(135deg, rgba(251,191,36,0.18), rgba(248,113,113,0.14))',
  'linear-gradient(135deg, rgba(192,132,252,0.22), rgba(248,113,113,0.16))',
  'linear-gradient(135deg, rgba(96,165,250,0.2), rgba(129,140,248,0.16))',
  'linear-gradient(135deg, rgba(45,212,191,0.18), rgba(59,130,246,0.14))',
  'linear-gradient(135deg, rgba(251,146,60,0.2), rgba(248,113,113,0.16))',
  'linear-gradient(135deg, rgba(244,114,182,0.2), rgba(56,189,248,0.16))',
];

function DayCard({ dayName, gradientIndex,date, dayData }) {
  // hardcoded demo macros for now
  const caloriesPct = dayData?.caloriesPct ?? 0;
  const proteinPct = dayData?.proteinPct ?? 0;

  return (
    <div
      style={{
        position: 'relative',
        padding: '1.5rem 1.25rem',
        borderRadius: '24px',
        background: GRADIENTS[gradientIndex % GRADIENTS.length],
        border: '1px solid rgba(254,215,170,0.6)',
        boxShadow:
          '0 24px 60px rgba(15,23,42,0.95), 0 0 18px rgba(168,85,247,0.45)',
        backdropFilter: 'blur(16px)',
      }}
    >
      {/* Day header */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '1rem',
        }}
      >
        <div
          style={{
            fontSize: '1.1rem',
            letterSpacing: '0.16em',
            textTransform: 'uppercase',
            fontWeight: 700,
          }}
        >
          {dayName}
        </div>

        <div
          style={{
            fontSize: '0.8rem',
            color: '#e5e7eb',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'flex-end',
            gap: '0.15rem',
          }}
        >
          <span>Calories {caloriesPct}%</span>
          <span>Protein {proteinPct}%</span>
        </div>
      </div>

      {/* Progress bars */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem', marginBottom: '1.2rem' }}>
        <ProgressBar label="Calories" value={caloriesPct} color="#fb923c" />
        <ProgressBar label="Protein" value={proteinPct} color="#38bdf8" />
      </div>

      {/* Meal slots */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
        <MealSlot mealType="Breakfast" />
        <MealSlot mealType="Lunch" />
        <MealSlot mealType="Dinner" />
        <MealSlot mealType="Snack" />
      </div>
    </div>
  );
}

function ProgressBar({ label, value, color }) {
  return (
    <div>
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          fontSize: '0.75rem',
          color: '#e5e7eb',
          marginBottom: '0.2rem',
        }}
      >
        <span>{label}</span>
        <span>{value}%</span>
      </div>
      <div
        style={{
          height: '6px',
          borderRadius: '999px',
          background: 'rgba(15,23,42,0.85)',
          overflow: 'hidden',
        }}
      >
        <div
          style={{
            width: `${value}%`,
            height: '100%',
            borderRadius: '999px',
            background: `linear-gradient(90deg, ${color}, #16f947)`,
            boxShadow: '0 0 10px rgba(251,146,60,0.6)',
          }}
        />
      </div>
    </div>
  );
}


function MealSlot({ mealType, meal }) {
  const hasMeal = !!meal; // later: real data

  if (!hasMeal) {
    // empty state
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
      >
        <span style={{ opacity: 0.9 }}>+ Add {mealType}</span>
        <span
          style={{
            width: '22px',
            height: '22px',
            borderRadius: '999px',
            border: '1px solid rgba(148,163,184,0.9)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '1rem',
          }}
        >
          +
        </span>
      </button>
    );
  }

  // filled state (placeholder for later)
  return (
    <div
      style={{
        width: '100%',
        padding: '0.65rem 0.85rem',
        borderRadius: '14px',
        border: '1px solid rgba(148,163,184,0.9)',
        background: 'rgba(15,23,42,0.92)',
        display: 'flex',
        flexDirection: 'column',
        gap: '0.25rem',
      }}
    >
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          fontSize: '0.9rem',
          fontWeight: 500,
        }}
      >
        <span>{meal.name}</span>
        <button
          type="button"
          style={{
            fontSize: '0.75rem',
            borderRadius: '999px',
            padding: '0.1rem 0.55rem',
            border: '1px solid #4b5563',
            background: 'rgba(15,23,42,0.9)',
            color: '#e5e7eb',
            cursor: 'pointer',
          }}
        >
          Edit
        </button>
      </div>
      <span style={{ fontSize: '0.75rem', color: '#9ca3af' }}>
        {meal.macroText}
      </span>
    </div>
  );
}

export default DayCard;
