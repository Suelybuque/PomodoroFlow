import React, { useState } from 'react';
import Navbar from './components/Navbar';
import Sidebar from './components/Sidebar';
import Card from './components/Card';
import { Input } from './components/Input';
import Button from './components/Button';
import './css/Settings.css';

const Settings: React.FC = () => {
  // State for timer settings
  const [pomodoroDuration, setPomodoroDuration] = useState(25);
  const [shortBreakDuration, setShortBreakDuration] = useState(5);
  const [longBreakDuration, setLongBreakDuration] = useState(15);
  const [pomodorosBeforeLongBreak, setPomodorosBeforeLongBreak] = useState(4);

  const handleSaveSettings = () => {
    // In a real application, you would save these settings to a backend or local storage
    console.log('Saving Settings:', {
      pomodoroDuration,
      shortBreakDuration,
      longBreakDuration,
      pomodorosBeforeLongBreak,
    });
    alert('Settings saved successfully!');
  };

  return (
    <div className="settings-layout">
      <Navbar />
      <main className="settings-content">
        <Sidebar />
        <section className="settings-main">
          <Card className="settings-card">
            <h2>Pomodoro Timer Settings</h2>
            <p className="settings-description">
              Customize the durations for your focus sessions and breaks.
            </p>

            <div className="setting-item">
              <label htmlFor="pomodoro-duration">Pomodoro Duration</label>
              <div className="setting-input-group">
                <Input
                  id="pomodoro-duration"
                  type="number"
                  value={pomodoroDuration}
                  onChange={(e) => setPomodoroDuration(Number(e.target.value))}
                  min="1"
                  max="60"
                  aria-label="Pomodoro Duration in minutes"
                />
                <span>minutes</span>
              </div>
            </div>

            <div className="setting-item">
              <label htmlFor="short-break-duration">Short Break Duration</label>
              <div className="setting-input-group">
                <Input
                  id="short-break-duration"
                  type="number"
                  value={shortBreakDuration}
                  onChange={(e) => setShortBreakDuration(Number(e.target.value))}
                  min="1"
                  max="30"
                  aria-label="Short Break Duration in minutes"
                />
                <span>minutes</span>
              </div>
            </div>

            <div className="setting-item">
              <label htmlFor="long-break-duration">Long Break Duration</label>
              <div className="setting-input-group">
                <Input
                  id="long-break-duration"
                  type="number"
                  value={longBreakDuration}
                  onChange={(e) => setLongBreakDuration(Number(e.target.value))}
                  min="5"
                  max="60"
                  aria-label="Long Break Duration in minutes"
                />
                <span>minutes</span>
              </div>
            </div>

            <div className="setting-item">
              <label htmlFor="pomodoros-before-long-break">Pomodoros before Long Break</label>
              <div className="setting-input-group">
                <Input
                  id="pomodoros-before-long-break"
                  type="number"
                  value={pomodorosBeforeLongBreak}
                  onChange={(e) => setPomodorosBeforeLongBreak(Number(e.target.value))}
                  min="1"
                  max="10"
                  aria-label="Number of Pomodoros before Long Break"
                />
                <span>sessions</span>
              </div>
            </div>

            <div className="settings-actions">
              <Button variant="primary" onClick={handleSaveSettings}>
                Save Settings
              </Button>
            </div>
          </Card>
        </section>
      </main>

      <footer className="app-footer">
        <p>© 2023 Pomodoro Pro.</p>
        <div className="social-links">
          {/* Placeholder for social icons */}
          <a href="#" aria-label="Github"><i className="fab fa-github"></i></a>
          <a href="#" aria-label="Twitter"><i className="fab fa-twitter"></i></a>
          <a href="#" aria-label="LinkedIn"><i className="fab fa-linkedin"></i></a>
          <a href="#" aria-label="Email"><i className="fas fa-envelope"></i></a>
        </div>
      </footer>
    </div>
  );
};

export default Settings;