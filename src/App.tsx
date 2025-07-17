// App.tsx
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Dashboard from './screens/Dashboard';
import Settings from './screens/Settings';
import Analytics from './screens/Analytics';
import Signup from './screens/components/auth/SignUp';
import Login from './screens/components/auth/Login';
import ProtectedRoute from './screens/ProtectedRoute';
import './App.css';
import { TimerProvider } from './screens/TimerContext';

function App() {
  return (
       <TimerProvider>
        <Router>
          <Routes>
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute>
                  <Dashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/analytics"
              element={
                <ProtectedRoute>
                  <Analytics />
                </ProtectedRoute>
              }
            />
            <Route
              path="/settings/*"
              element={
                <ProtectedRoute>
                  <Settings />
                </ProtectedRoute>
              }
            />
            <Route path="/signup" element={<Signup />} />
            <Route path="/" element={<Login />} />
            <Route path="*" element={<div>404 Not Found</div>} />
          </Routes>
        </Router>
    </TimerProvider>
  );
}

export default App;
