import { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Auth from './pages/Auth';
import { useAuth } from './context/AuthContext';

function ProtectedRoute({children}){
  const {isAuthenticated}=useAuth();
  if (!isAuthenticated){
    return <Navigate to="/auth" replace/>
  }
  return children;
}

function App() {
  const [isAuth, setIsAuth] = useState(!!localStorage.getItem('token'));

  return (
    <div
      style={{
        minHeight: '100vh',
        width: '100vw',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        background: 'radial-gradient(circle at top, #1f2937 0%, #020617 55%, #020617 100%)',
      }}
    >
      <Router>
        <Routes>
          <Route
            path="/auth" element={<Auth/>} />
          <Route
            path="/planner"
            element={
              <ProtectedRoute>
                <div style={{color: 'white'}}>Planner coming soon</div>
              </ProtectedRoute>
            }
          />
          <Route path="*" element={<Navigate to="/auth" />} />
        </Routes>
      </Router>
    </div>
  );
}

export default App;
