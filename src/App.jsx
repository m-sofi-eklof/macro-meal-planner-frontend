import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Auth from './pages/Auth';

const isAuthenticated = () => !!localStorage.getItem('token');

function App() {
  return (
    // Full page background + center content
    <div
    style={{
      minHeight: '100vh',
      width: '100vw',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      background:
        'radial-gradient(circle at top, #1f2937 0%, #020617 55%, #020617 100%)',
    }}
  >

      <Router>
        <Routes>
          <Route
            path="/auth"
            element={!isAuthenticated() ? <Auth /> : <Navigate to="/planner" />}
          />
          <Route
            path="/planner"
            element={
              isAuthenticated()
                ? <div style={{ color: 'white' }}>Planner coming soon</div>
                : <Navigate to="/auth" />
            }
          />
          <Route path="*" element={<Navigate to="/auth" />} />
        </Routes>
      </Router>
    </div>
  );
}

export default App;
