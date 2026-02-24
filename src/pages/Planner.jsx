import { useState, useEffect } from 'react';
import DayCard from '../component/DayCard'
import api from '../api/axios';

const WEEK_DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

function Planner() {
  const [week, setWeek] = useState(null);
  const [days, setDays]=useState([]);
  const[loading, setLoading] = useState(true);

  useEffect(()=>{
    const fetchCurrentWeek = async () =>{
      try{
        //current week
        const res = await api.get('/api/weeks/current');
        const currentWeek= res.data;
        setWeek(currentWeek);

        //days for that week
        const daysRes = await api.get(`/api/weeks/${currentWeek.id}/days`);
        setDays(daysRes.data || []);
      }catch(err){
        console.error('Failed to fetch week/days:', err);
      }finally{
        setLoading(false);
      }
    };
    fetchCurrentWeek();
  }, []);

  const weekLabel = week
  ? `Week ${week.weekNumber} / ${week.startDate} - ${week.endDate}`
  : 'Loading...'

  const addDays = (isoDate, days)=>{
    const d = new Date(isoDate);
    d.setDate(d.getDate()+days);
    return d.toISOString().slice(0,10);
  };

  const weekDates =
  week?.startDate
  ? WEEK_DAYS.map((_, idx)=> addDays(week.startDate,idx))
  : [];

  return (
    <div
      style={{
        minHeight: '100vh',
        width: '100vw',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        padding: '2rem 1rem',
        background: 'radial-gradient(circle at top, #020617 0%, #020617 50%, #000000 100%)',
        color: 'white',
        overflowY: 'auto',
      }}
    >
      {/* Week header */}
      <div
        style={{
          width: '100%',
          maxWidth: '900px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '1.5rem',
        }}
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
          <span style={{ fontSize: '0.9rem', letterSpacing: '0.12em', textTransform: 'uppercase', color: '#9ca3af' }}>
            Weekly plan
          </span>
          <span style={{ fontSize: '1.1rem', fontWeight: 600 }}>
            {weekLabel}
          </span>
        </div>

        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <button style={navButtonStyle}>‹ Prev</button>
          <button style={navButtonStyle}>This week</button>
          <button style={navButtonStyle}>Next ›</button>
        </div>
      </div>

      {/* Shopping list button */}
      <div style={{ width: '100%', maxWidth: '900px', marginBottom: '1.5rem' }}>
        <button
          style={{
            width: '100%',
            padding: '0.85rem 1.25rem',
            borderRadius: '999px',
            border: '1px solid #8bf62d72',
            background: 'linear-gradient(135deg, rgba(251, 60, 175, 0.42), rgba(22, 137, 157, 0.7))',
            color: '#fefce8',
            fontWeight: 600,
            fontSize: '0.9rem',
            letterSpacing: '0.12em',
            textTransform: 'uppercase',
            cursor: 'pointer',
            boxShadow: '0 16px 40px rgba(15,23,42,0.9), 0 0 18px rgba(251,146,60,0.4)',
          }}
        >
          Generate shopping list
        </button>
      </div>

      {/* Day cards */}
      {loading ? (
        <p style={{ color: '#9ca3af' }}>Loading week...</p>
      ) : (
      <div
        style={{
          width: '100%',
          maxWidth: '900px',
          display: 'flex',
          flexDirection: 'column',
          gap: '1.25rem',
          paddingBottom: '2rem',
        }}
      >
        {WEEK_DAYS.map((dayName, index) => {
          const date = weekDates[index]; //yy mm dd

          //find match by date
          const dayData = days.find((d)=> d.date === date) || null;

          return (
            <DayCard
              key={dayName}
              dayName={dayName.toUpperCase()}
              gradientIndex={index}
              date={date}
            />
          );
        })}
      </div>
      )}
    </div>
  );
}

const navButtonStyle = {
  padding: '0.45rem 0.85rem',
  borderRadius: '999px',
  border: '1px solid #4b5563',
  background: 'rgba(15,23,42,0.9)',
  color: '#e5e7eb',
  fontSize: '0.8rem',
  letterSpacing: '0.08em',
  textTransform: 'uppercase',
  cursor: 'pointer',
};

export default Planner;
