// src/components/Footer.tsx
import React from 'react';
import './css/Footer.css'; // Assuming you'll create or have a CSS file for the footer

const Footer: React.FC = () => {
  return (
    <footer className="app-footer">
      <p>© 2023 Pomodoro Pro.</p>
      <div className="social-links">
        <a href="#" aria-label="Github"><i className="fab fa-github">github</i></a>
        <a href="#" aria-label="Twitter"><i className="fab fa-twitter"></i></a>
        <a href="#" aria-label="LinkedIn"><i className="fab fa-linkedin">LinkedIn</i></a>
        <a href="#" aria-label="Email"><i className="fas fa-envelope"></i>Email</a>
      </div>
    </footer>
  );
};

export default Footer;

