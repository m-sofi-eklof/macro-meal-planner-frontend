import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Auth from './pages/Auth';
import Planner from './pages/Planner';
import MealCreator from './pages/MealCreator';
import { useAuth } from './context/AuthContext';
import { AuthProvider } from './context/AuthContext';

function ProtectedRoute({ children }) {
  const { isAuthenticated } = useAuth();
  if (!isAuthenticated) {
    return <Navigate to="/auth" replace />;
  }
  return children;
}
function AppContent(){
  return(
    <Router>
        <Routes>
          <Route path="/auth" element={<Auth />} />
          <Route
            path="/planner"
            element={
              <ProtectedRoute>
                <Planner />
              </ProtectedRoute>
            }
          />
          <Route
            path="/MealCreator"
            element={
              <ProtectedRoute>
                <MealCreator/>
              </ProtectedRoute>
            }
          />
          <Route path="*" element={<Navigate to="/auth" />} />
        </Routes>
      </Router>
  );
}

function App() {
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
      <AppContent />
    </div>
  );
}

export default App;
