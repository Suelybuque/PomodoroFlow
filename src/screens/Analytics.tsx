import React from 'react';
import Navbar from './components/Navbar';
import Card from './components/Card';
import Chart from './components/Chart'; // Reusable Chart component
import './css/Analytics.css';

// Mock data for analytics
const weeklyFocusData = [
  { day: 'Mon', focus: 120, shortBreak: 20, longBreak: 0, meetings: 30 },
  { day: 'Tue', focus: 150, shortBreak: 25, longBreak: 15, meetings: 0 },
  { day: 'Wed', focus: 130, shortBreak: 20, longBreak: 0, meetings: 60 },
  { day: 'Thu', focus: 90, shortBreak: 15, longBreak: 0, meetings: 30 },
  { day: 'Fri', focus: 180, shortBreak: 30, longBreak: 15, meetings: 0 },
  { day: 'Sat', focus: 60, shortBreak: 10, longBreak: 0, meetings: 0 },
  { day: 'Sun', focus: 0, shortBreak: 0, longBreak: 0, meetings: 0 },
];

const focusTimeByCategoryData = [
  { category: 'Development', time: 150 },
  { category: 'Meeting', time: 70 },
  { category: 'Learning', time: 50 },
  { category: 'Planning', time: 30 },
  { category: 'Admin', time: 20 },
];

const Analytics: React.FC = () => {
  return (
    <div className="analytics-layout">
      <Navbar />
      <main className="analytics-content">
        <section className="analytics-summary">
          <Card className="summary-card">
            <div className="card-header-with-icon">
              <h3>Pomodoros Completed Today</h3>
              <i className="fas fa-info-circle"></i>
            </div>
            <p className="summary-value">12</p>
            <p className="summary-change text-green">+2 yesterday</p>
          </Card>
          <Card className="summary-card">
            <div className="card-header-with-icon">
              <h3>Tasks Completed</h3>
              <i className="fas fa-info-circle"></i>
            </div>
            <p className="summary-value">5</p>
            <p className="summary-change text-green">+1 yesterday</p>
          </Card>
          <Card className="summary-card">
            <div className="card-header-with-icon">
              <h3>Average Focus Time</h3>
              <i className="fas fa-info-circle"></i>
            </div>
            <p className="summary-value">24 min</p>
            <p className="summary-change text-red">-1 min</p>
          </Card>
        </section>

        <section className="analytics-charts">
          <Card>
            <Chart
              title="Weekly Focus Overview"
              description="Total focus and break time over the last 7 days."
            >
              {/* This is a visual representation, in a real app, you'd use a charting library */}
              <div className="weekly-chart-placeholder">
                <div className="chart-bars">
                  {weeklyFocusData.map((data) => (
                    <div key={data.day} className="chart-bar-column">
                      <div className="bar-stack">
                        <div
                          className="bar focus"
                          style={{ height: `${data.focus / 2}px` }}
                          title={`Focus: ${data.focus}min`}
                        ></div>
                        <div
                          className="bar short-break"
                          style={{ height: `${data.shortBreak * 2}px` }}
                          title={`Short Break: ${data.shortBreak}min`}
                        ></div>
                        <div
                          className="bar long-break"
                          style={{ height: `${data.longBreak * 2}px` }}
                          title={`Long Break: ${data.longBreak}min`}
                        ></div>
                        <div
                          className="bar meetings"
                          style={{ height: `${data.meetings / 2}px` }}
                          title={`Meetings: ${data.meetings}min`}
                        ></div>
                      </div>
                      <span className="bar-label">{data.day}</span>
                    </div>
                  ))}
                </div>
                <div className="chart-legend">
                  <span>
                    <span className="legend-color focus-color"></span> Focus Time (min)
                  </span>
                  <span>
                    <span className="legend-color short-break-color"></span> Short Breaks (min)
                  </span>
                  <span>
                    <span className="legend-color long-break-color"></span> Long Breaks (min)
                  </span>
                  <span>
                    <span className="legend-color meetings-color"></span> Meetings (min)
                  </span>
                </div>
              </div>
            </Chart>
          </Card>
        </section>

        <section className="analytics-insights">
          <div className="left-panel">
            <Card className="highly-focused-alert">
              <i className="fas fa-bell"></i>
              <h3>You've been highly focused! Consider a longer break soon.</h3>
              <p>Consider these suggestions:</p>
              <ul>
                <li>Take a 15-30 minute break away from your desk.</li>
                <li>Go for a short walk or do some light stretching.</li>
                <li>Hydrate and give your eyes a rest.</li>
                <li>Plan your next session to avoid burnout.</li>
              </ul>
            </Card>

            <Card className="productivity-streaks">
              <h3>Productivity Streaks</h3>
              <p className="keep-up">Keep up the great work!</p>
              <div className="streaks-data">
                <div className="streak-item">
                  <i className="fas fa-fire"></i>
                  <span className="streak-value">7</span>
                  <span className="streak-label">Current Streak (Days)</span>
                </div>
                <div className="streak-item">
                  <i className="fas fa-trophy"></i>
                  <span className="streak-value">21</span>
                  <span className="streak-label">Longest Streak (Days)</span>
                </div>
              </div>
            </Card>
          </div>

          <div className="right-panel">
            <Card>
              <h3>Focus Time by Category</h3>
              <p className="category-description">Distribution of your Pomodoros.</p>
              <div className="category-chart-list">
                {focusTimeByCategoryData.map((data, index) => (
                  <div key={index} className="category-item">
                    <span className="category-name">{data.category}</span>
                    <div className="category-bar-wrapper">
                      <div
                        className="category-bar"
                        style={{ width: `${data.time / 2}px` }} // Adjust max width based on max time
                      ></div>
                    </div>
                    <span className="category-time">{data.time}</span>
                  </div>
                ))}
              </div>
            </Card>
          </div>
        </section>

        <section className="task-status-breakdown">
          <Card>
            <h3>Task Status Breakdown</h3>
            <p className="status-description">Overview of your tasks across different statuses.</p>
            <div className="status-bars">
              <div className="status-item">
                <span className="status-label">Completed</span>
                <div className="status-bar-wrapper">
                  <div className="status-bar completed" style={{ width: '80%' }}></div>
                </div>
                <span className="status-count">25</span>
              </div>
              <div className="status-item">
                <span className="status-label">In Progress</span>
                <div className="status-bar-wrapper">
                  <div className="status-bar in-progress" style={{ width: '60%' }}></div>
                </div>
                <span className="status-count">8</span>
              </div>
              <div className="status-item">
                <span className="status-label">Pending</span>
                <div className="status-bar-wrapper">
                  <div className="status-bar pending" style={{ width: '40%' }}></div>
                </div>
                <span className="status-count">12</span>
              </div>
              <div className="status-item">
                <span className="status-label">Overdue</span>
                <div className="status-bar-wrapper">
                  <div className="status-bar overdue" style={{ width: '10%' }}></div>
                </div>
                <span className="status-count">3</span>
              </div>
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

export default Analytics;