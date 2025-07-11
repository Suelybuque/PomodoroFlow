import React from 'react';
import { Link, useLocation } from 'react-router-dom'; // Assuming react-router-dom for navigation
import './css/Navbar.css';
//import { ReactComponent as PomodoroProLogo } from './react.svg'; // Assuming an SVG logo

//interface NavbarProps {
  // No specific props needed for now based on the design
//}

const Navbar: React.FC = () => {

  const location = useLocation();

  return (
    <nav className="navbar">
      <div className="navbar-brand">
  
        <Link to="/" className="navbar-app-name">
          Pomodoro Pro
        </Link>
      </div>
      <ul className="navbar-nav">
        <li className="nav-item">
          <Link to="/" className={`nav-link ${location.pathname === '/' ? 'active' : ''}`}>
            Dashboard
          </Link>
        </li>
        <li className="nav-item">
          <Link
            to="/analytics"
            className={`nav-link ${location.pathname === '/analytics' ? 'active' : ''}`}
          >
            Analytics
          </Link>
        </li>
        <li className="nav-item">
          <Link
            to="/settings"
            className={`nav-link ${location.pathname === '/settings' ? 'active' : ''}`}
          >
            Settings
          </Link>
        </li>
      </ul>
    </nav>
  );
};

export default Navbar;