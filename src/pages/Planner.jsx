import { useState, useEffect } from 'react';
import DayCard from '../component/DayCard'
import api from '../api/axios';

const WEEK_DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

function Planner() {
  const [week, setWeek] = useState(null);
  const [days, setDays]=useState([]);
  const[loading, setLoading] = useState(true);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  useEffect(()=>{
    const handleResize = ()=> setIsMobile(window.innerWidth<768);
    window.addEventListener('resize', handleResize);
  }, []);

  const fetchCurrentWeek = async () => {
    setLoading(true);
    try {
      const res = await api.get('/api/weeks/current');
      const currentWeek = res.data;
      setWeek(currentWeek);

      const daysRes = await api.get(`/api/weeks/${currentWeek.id}/days`);
      setDays(daysRes.data || []);
    } catch (err) {
      console.error('Failed to fetch week/days:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCurrentWeek();
  }, []);


  const handleNextWeek = async ()=>{
    setLoading(true);
    try{
      //get week
      if(!week) return;
      const res = await api.get(`/api/weeks/${week.id}/next`);
      const nextWeek = res.data;
      setWeek(nextWeek);

      //get days
      const resDays = await api.get(`/api/weeks/${nextWeek.id}/days`);
      setDays(resDays.data || []);
    }catch(err){
      console.error('Failed to fetch week/days:', err);
    }finally{
      setLoading(false);
    }
  }

  const handlePrevWeek = async ()=> {
    setLoading(true);
    try{
      //get week
      if(!week) return;
      const res = await api.get(`/api/weeks/${week.id}/prev`);
      const prevWeek = res.data;
      setWeek(prevWeek);

      //get days
      const resDays = await api.get(`/api/weeks/${prevWeek.id}/days`);
      setDays(resDays.data || []);
    }catch(err){
      console.error('Failed to fetch week/days:', err);
    }finally{
      setLoading(false);
    }
  }

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
        background: 'radial-gradient(circle at top, #060918e5 0%, #030510c8 50%, #00000091 100%)',
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
          flexDirection: isMobile? 'column' : 'row',
          justifyContent: 'space-between',
          alignItems: isMobile? 'flex-start':'center',
          marginBottom: '1.5rem',
          gap: isMobile ? '1rem' : '0',
        }}
      >
        <div style={{display: 'flex', gap: '0.7rem',flexDirection: 'row'}}>
          <button style={userButtonStyle}>ME</button>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
            <span style={{ fontSize: '0.9rem', letterSpacing: '0.12em', textTransform: 'uppercase', color: '#9ca3af' }}>
              Weekly plan
            </span>
            <span style={{ fontSize: '1.1rem', fontWeight: 600 }}>
              {weekLabel}
            </span>
          </div>
        </div>

        <div style={{ 
          display: 'flex', 
          gap: '0.5rem', 
          width: isMobile?'100%':'auto',
          justifyContent: isMobile ? 'space-between' : 'flex-start'
        }}>
          <button style={{...navButtonStyle, flex : isMobile? 1: 'none'}} onClick={handlePrevWeek}>‹ Prev</button>
          <button style={{...navButtonStyle, flex : isMobile? 1: 'none'}} onClick={fetchCurrentWeek}>This week</button>
          <button style={{...navButtonStyle, flex : isMobile? 1: 'none'}} onClick={handleNextWeek}>Next ›</button>
        </div>
      </div>

      {/* Shopping list button */}
      <div style={{ width: '100%', maxWidth: '900px', marginBottom: '1.5rem' }}>
        <button
          style={{
            width: '100%',
            padding: '0.85rem 1.25rem',
            borderRadius: '999px',
            background: 'linear-gradient(135deg, rgba(254, 43, 181, 0.82), rgba(38, 160, 194, 0.77))',
            color: '#fefce8',
            fontWeight: 600,
            fontSize: '0.9rem',
            letterSpacing: '0.12em',
            textTransform: 'uppercase',
            cursor: 'pointer',
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

const userButtonStyle = {
  padding:'0.45rem 0.85rem',
  borderRadius: '10px',
  border: '1px solid #8b8d7169',
  background: 'rgba(2, 92, 137, 0.59)',
  color: '#e5e7eb',
  fontSize: '0.8rem',
  letterSpacing: '0.08em',
  textTransform: 'uppercase',
  cursor: 'pointer',
}

export default Planner;
