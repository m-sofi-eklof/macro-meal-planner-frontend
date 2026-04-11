import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import DayCard from '../component/DayCard'
import api from '../api/axios';

const WEEK_DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

function Planner() {
  const navigate = useNavigate();
  const location = useLocation();
  const [week, setWeek] = useState(null);
  const [days, setDays] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    if (location.state?.refresh) {
      setRefreshKey(k => k + 1);
    }
  }, [location.state?.refresh]);

  const fetchCurrentWeek = async () => {
    setLoading(true);
    try {
      const res = await api.get('/api/weeks/current');
      const currentWeek = res.data;
      setWeek(currentWeek);
      await createDaysForWeek(currentWeek.id, currentWeek.startDate);
    } catch (err) {
      console.error('Failed to fetch week/days:', err);
    } finally {
      setLoading(false);
    }
  };

  const createDaysForWeek = async (weekId, startDate) => {
    const dates = Array.from({ length: 7 }, (_, i) => addDays(startDate, i));
    await Promise.all(dates.map(date => api.post(`/api/weeks/${weekId}/days`, { date })));
    const res = await api.get(`/api/weeks/${weekId}/days`);
    setDays(res.data || []);
  };

  useEffect(() => {
    fetchCurrentWeek();
  }, []);

  const handleNextWeek = async () => {
    setLoading(true);
    try {
      if (!week) return;
      const res = await api.get(`/api/weeks/${week.id}/next`);
      const nextWeek = res.data;
      setWeek(nextWeek);
      await createDaysForWeek(nextWeek.id, nextWeek.startDate);
    } catch (err) {
      console.error('Failed to fetch week/days:', err);
    } finally {
      setLoading(false);
    }
  };

  const handlePrevWeek = async () => {
    setLoading(true);
    try {
      if (!week) return;
      const res = await api.get(`/api/weeks/${week.id}/prev`);
      const prevWeek = res.data;
      setWeek(prevWeek);
      await createDaysForWeek(prevWeek.id, prevWeek.startDate);
    } catch (err) {
      console.error('Failed to fetch week/days:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenUserPage = () => navigate('/user');

  const weekLabel = week
    ? `${week.startDate} — ${week.endDate}`
    : 'Loading...';

  const addDays = (isoDate, days) => {
    const d = new Date(isoDate);
    d.setDate(d.getDate() + days);
    return d.toISOString().slice(0, 10);
  };

  const weekDates = week?.startDate
    ? WEEK_DAYS.map((_, idx) => addDays(week.startDate, idx))
    : [];

  return (
    <div style={{
      minHeight: '100vh',
      width: '100vw',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      padding: '2rem 1rem',
      background: 'radial-gradient(ellipse at top, #111827 0%, #020617 60%)',
      color: 'white',
      overflowY: 'auto',
      boxSizing: 'border-box',
    }}>

      {/* Header */}
      <div style={{
        width: '100%',
        maxWidth: '900px',
        display: 'flex',
        flexDirection: isMobile ? 'column' : 'row',
        justifyContent: 'space-between',
        alignItems: isMobile ? 'flex-start' : 'center',
        marginBottom: '1.5rem',
        gap: isMobile ? '1rem' : '0',
      }}>
        <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
          <button style={userBtnStyle} onClick={handleOpenUserPage}>ME</button>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.15rem' }}>
            <span style={{ fontSize: '0.68rem', letterSpacing: '0.16em', textTransform: 'uppercase', color: '#6b7280' }}>
              Week {week?.weekNumber ?? '—'}
            </span>
            <span style={{
              fontSize: isMobile ? 'clamp(0.82rem, 3.5vw, 1rem)' : '0.95rem',
              fontWeight: 500,
              color: '#e5e7eb',
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
            }}>
              {weekLabel}
            </span>
          </div>
        </div>

        <div style={{
          display: 'flex',
          gap: '0.4rem',
          width: isMobile ? '100%' : 'auto',
          justifyContent: isMobile ? 'space-between' : 'flex-end',
        }}>
          <button style={{ ...navBtnStyle, flex: isMobile ? 1 : 'none' }} onClick={handlePrevWeek}>‹ Prev</button>
          <button style={{ ...navBtnStyle, flex: isMobile ? 1 : 'none' }} onClick={fetchCurrentWeek}>Today</button>
          <button style={{ ...navBtnStyle, flex: isMobile ? 1 : 'none' }} onClick={handleNextWeek}>Next ›</button>
        </div>
      </div>

      {/* Shopping list button */}
      <div style={{ width: '100%', maxWidth: '900px', marginBottom: '1.5rem' }}>
        <button
          style={{
            width: '100%',
            padding: '0.75rem',
            borderRadius: '10px',
            background: 'rgba(255,255,255,0.06)',
            border: '1px solid rgba(255,255,255,0.1)',
            color: '#e5e7eb',
            fontWeight: 500,
            fontSize: '0.85rem',
            letterSpacing: '0.06em',
            cursor: 'pointer',
          }}
          onClick={() => navigate('/list')}
        >
          Shopping list →
        </button>
      </div>

      {/* Day cards */}
      {loading ? (
        <p style={{ color: '#4b5563', fontSize: '0.85rem' }}>Loading...</p>
      ) : (
        <div style={{
          width: '100%',
          maxWidth: '900px',
          display: 'flex',
          flexDirection: 'column',
          gap: '1rem',
          paddingBottom: '2rem',
        }}>
          {WEEK_DAYS.map((dayName, index) => {
            const date = weekDates[index];
            const dayData = days.find((d) => d.date === date) || null;
            return (
              <DayCard
                key={dayName}
                dayName={dayName.toUpperCase()}
                gradientIndex={index}
                date={date}
                dayData={dayData}
                refreshKey={refreshKey}
              />
            );
          })}
        </div>
      )}
    </div>
  );
}

const navBtnStyle = {
  padding: '0.45rem 0.9rem',
  borderRadius: '8px',
  border: '1px solid rgba(255,255,255,0.1)',
  background: 'rgba(255,255,255,0.05)',
  color: '#9ca3af',
  fontSize: '0.78rem',
  letterSpacing: '0.05em',
  cursor: 'pointer',
};

const userBtnStyle = {
  width: '40px',
  height: '40px',
  flexShrink: 0,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  padding: 0,
  borderRadius: '10px',
  border: '1px solid rgba(255,255,255,0.1)',
  background: 'rgba(255,255,255,0.06)',
  color: '#9ca3af',
  fontSize: '0.72rem',
  letterSpacing: '0.1em',
  cursor: 'pointer',
};

export default Planner;
