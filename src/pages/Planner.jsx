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

  //refetch meals when return from mealcreator
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
    ? `Week ${week.weekNumber} / ${week.startDate} - ${week.endDate}`
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
      background: 'radial-gradient(circle at top, #060918e5 0%, #030510c8 50%, #00000091 100%)',
      color: 'white',
      overflowY: 'auto',
    }}>
      {/*Week header*/}
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
        <div style={{ display: 'flex', gap: '0.7rem', flexDirection: 'row' }}>
          <button style={userButtonStyle} onClick={handleOpenUserPage}>ME</button>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
            <span style={{ fontSize: '0.9rem', letterSpacing: '0.12em', textTransform: 'uppercase', color: '#9ca3af' }}>
              Weekly plan
            </span>
            <span style={{
              fontSize: isMobile ? 'clamp(0.8rem, 3.5vw, 1rem)' : '1.1rem',
              fontWeight: 600,
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis'
            }}>
              {weekLabel}
            </span>
          </div>
        </div>

        <div style={{
          display: 'flex',
          gap: '0.5rem',
          width: isMobile ? '100%' : 'auto',
          justifyContent: isMobile ? 'space-between' : 'flex-start'
        }}>
          <button style={{ ...navButtonStyle, flex: isMobile ? 1 : 'none' }} onClick={handlePrevWeek}>‹ Prev</button>
          <button style={{ ...navButtonStyle, flex: isMobile ? 1 : 'none' }} onClick={fetchCurrentWeek}>This week</button>
          <button style={{ ...navButtonStyle, flex: isMobile ? 1 : 'none' }} onClick={handleNextWeek}>Next ›</button>
        </div>
      </div>

      {/*Shopping list button */}
      <div style={{ width: '100%', maxWidth: '900px', marginBottom: '1.5rem' }}>
        <button style={{
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
          border: 'none',
        }} onClick={navigate('/shopping')}>
          Generate shopping list
        </button>
      </div>

      {/* Day cards */}
      {loading ? (
        <p style={{ color: '#9ca3af' }}>Loading week...</p>
      ) : (
        <div style={{
          width: '100%',
          maxWidth: '900px',
          display: 'flex',
          flexDirection: 'column',
          gap: '1.25rem',
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
  width: '45px',
  height: '45px',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  padding: '0',
  borderRadius: '10px',
  border: '1px solid #8b8d7169',
  background: 'rgba(2, 92, 137, 0.59)',
  color: '#e5e7eb',
  fontSize: '0.8rem',
  letterSpacing: '0.08em',
  textTransform: 'uppercase',
  cursor: 'pointer',
  flexShrink: 0,
};

export default Planner;