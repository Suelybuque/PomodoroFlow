import React from 'react';
import { NavLink } from 'react-router-dom';
import './css/Sidebar.css';



const Sidebar: React.FC = () => {
  return (
    <aside className="sidebar">
      <nav className="sidebar-nav">
        <ul>
          <li>
            <NavLink to="/settings/timer" className={({ isActive }) => (isActive ? 'active' : '')}>
              <i className="fas fa-clock"></i> Timer
            </NavLink>
          </li>
          <li>
            <NavLink to="/settings/notifications" className={({ isActive }) => (isActive ? 'active' : '')}>
              <i className="fas fa-bell"></i> Notifications
            </NavLink>
          </li>
          <li>
            <NavLink to="/settings/appearance" className={({ isActive }) => (isActive ? 'active' : '')}>
              <i className="fas fa-palette"></i> Appearance
            </NavLink>
          </li>
          <li>
            <NavLink to="/settings/sound" className={({ isActive }) => (isActive ? 'active' : '')}>
              <i className="fas fa-volume-up"></i> Sound
            </NavLink>
          </li>
          <li>
            <NavLink to="/settings/advanced" className={({ isActive }) => (isActive ? 'active' : '')}>
              <i className="fas fa-cogs"></i> Advanced
            </NavLink>
          </li>
        </ul>
      </nav>
    </aside>
  );
};

export default Sidebar;