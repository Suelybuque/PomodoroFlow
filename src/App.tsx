import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Dashboard from './screens/Dashboard';
import Settings from './screens/Settings';
import Analytics from './screens/Analytics';
import './App.css'; // Global styles
//import '@fortawesome/fontawesome-free/css/all.min.css'; // For Font Awesome icons

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/analytics" element={<Analytics />} />
        {/* Nested routes for settings, or just render the main settings page */}
        <Route path="/settings/*" element={<Settings />} /> {/* Using * for nested paths like /settings/timer */}
        {/* Add a catch-all route for 404 or redirect */}
        <Route path="*" element={<div>404 Not Found</div>} />
      </Routes>
    </Router>
  );
}

export default App;