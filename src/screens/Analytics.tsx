/* eslint-disable prefer-const */
//* eslint-disable @typescript-eslint/no-unused-vars */
import React, { useEffect, useState } from 'react';
import Navbar from './components/Navbar';
import Card from './components/Card';
import Chart from './components/Chart'; // Reusable Chart component
import Footer from './components/Footer'; // Assuming Footer is a component now
import './css/Analytics.css';
import { supabase } from './lib/supabaseClient';

// Define interfaces for fetched data
interface PomodoroSession {
  id: string;
  created_at: string;
  task_id: string | null;
  duration: number; // in minutes
  session_type: 'pomodoro' | 'shortBreak' | 'longBreak';
}

interface Task {
  id: string;
  name: string;
  category: string;
  pomodoroGoal: number;
  pomodorosCompleted: number;
  status: 'active' | 'completed';
}

// Data structures for charts
interface WeeklyFocusDataPoint {
  day: string;
  focus: number; // in minutes
  shortBreak: number;
  longBreak: number;
  meetings: number; // Placeholder, as no data source for this yet
}

interface FocusTimeByCategoryDataPoint {
  category: string;
  time: number; // in minutes
}

// Constant for Pomodoro duration in minutes (assuming 25 minutes per pomodoro)
const POMODORO_DURATION_IN_MINUTES = 25;

const Analytics: React.FC = () => {
  const [pomodorosCompletedToday, setPomodorosCompletedToday] = useState(0);
  const [tasksCompletedCount, setTasksCompletedCount] = useState(0);
  const [averageFocusTime, setAverageFocusTime] = useState(0);
  const [weeklyFocusData, setWeeklyFocusData] = useState<WeeklyFocusDataPoint[]>([]);
  const [focusTimeByCategoryData, setFocusTimeByCategoryData] = useState<FocusTimeByCategoryDataPoint[]>([]);
  const [taskStatusBreakdown, setTaskStatusBreakdown] = useState({
    completed: 0,
    inProgress: 0,
    pending: 0,
    overdue: 0,
  });
  const [tasks, setTasks] = useState<Task[]>([]); // State to store all tasks for breakdown calculations

  // States for dynamic "today's value" indicators
  const [pomodorosTodayValue, setPomodorosTodayValue] = useState<number | null>(null);
  const [tasksCompletedTodayValue, setTasksCompletedTodayValue] = useState<number | null>(null);
  const [averageFocusTimeTodayValue, setAverageFocusTimeTodayValue] = useState<number | null>(null);

  // States for productivity streaks
  const [currentStreak, setCurrentStreak] = useState(0);
  const [longestStreak, setLongestStreak] = useState(0);

  useEffect(() => {
    const fetchAnalyticsData = async () => {
      // 1. Fetch Pomodoro Sessions
      const { data: sessions, error: sessionsError } = await supabase
        .from('pomodoro_sessions')
        .select('*');

      if (sessionsError) {
        console.error('Error fetching pomodoro sessions:', sessionsError.message);
        return;
      }
      console.log('Fetched Pomodoro Sessions:', sessions);

      // 2. Fetch Tasks
      const { data: fetchedTasks, error: tasksError } = await supabase
        .from('tasks')
        .select('*');

      if (tasksError) {
        console.error('Error fetching tasks:', tasksError.message);
        return;
      }
      setTasks(fetchedTasks as Task[]);
      console.log('Fetched Tasks:', fetchedTasks);

      // --- Data Processing ---

      const today = new Date();
      today.setHours(0, 0, 0, 0);

      // Removed unused 'yesterday' variable and related calculations
      // const yesterday = new Date(today);
      // yesterday.setDate(today.getDate() - 1);
      // yesterday.setHours(0, 0, 0, 0);

      const todaySessions = sessions.filter((session: PomodoroSession) => { // Explicitly type session to use PomodoroSession interface
        const sessionDate = new Date(session.created_at);
        return sessionDate >= today && session.session_type === 'pomodoro';
      });
      // Removed unused 'yesterdaySessions' variable
      // const yesterdaySessions = sessions.filter(session => { ... });

      setPomodorosCompletedToday(todaySessions.length);
      setPomodorosTodayValue(todaySessions.length);

      const completedTasksToday = fetchedTasks.filter(task => new Date(task.created_at).setHours(0,0,0,0) === today.getTime() && task.status === 'completed');
      // Removed unused 'completedTasksYesterday' variable
      // const completedTasksYesterday = fetchedTasks.filter(task => { ... });
      setTasksCompletedCount(fetchedTasks.filter(task => task.status === 'completed').length);
      setTasksCompletedTodayValue(completedTasksToday.length);

      // Removed unused 'allFocusSessions' variable
      // const allFocusSessions = sessions.filter(session => session.session_type === 'pomodoro');
      const totalFocusTimeSumToday = todaySessions.reduce((sum, session) => sum + session.duration, 0);
      // Removed unused 'totalFocusTimeSumYesterday' variable
      // const totalFocusTimeSumYesterday = yesterdaySessions.reduce((sum, session) => sum + session.duration, 0);

      const avgToday = todaySessions.length > 0 ? totalFocusTimeSumToday / todaySessions.length : 0;
      // Removed unused 'avgYesterday' variable
      // const avgYesterday = yesterdaySessions.length > 0 ? totalFocusTimeSumYesterday / yesterdaySessions.length : 0;

      setAverageFocusTime(avgToday);
      setAverageFocusTimeTodayValue(avgToday);

      const daysOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
      const weekDataMap = new Map<string, { focus: number; shortBreak: number; longBreak: number; meetings: number }>();
      daysOfWeek.forEach(day => weekDataMap.set(day, { focus: 0, shortBreak: 0, longBreak: 0, meetings: 0 }));

      sessions.forEach(session => {
        const sessionDate = new Date(session.created_at);
        const dayName = daysOfWeek[sessionDate.getDay()];
        const currentDayData = weekDataMap.get(dayName)!;

        if (session.session_type === 'pomodoro') {
          currentDayData.focus += session.duration;
        } else if (session.session_type === 'shortBreak') {
          currentDayData.shortBreak += session.duration;
        } else if (session.session_type === 'longBreak') {
          currentDayData.longBreak += session.duration;
        }
        weekDataMap.set(dayName, currentDayData);
      });

      const processedWeeklyFocusData = daysOfWeek.map(day => ({
        day: day,
        focus: weekDataMap.get(day)!.focus,
        shortBreak: weekDataMap.get(day)!.shortBreak,
        longBreak: weekDataMap.get(day)!.longBreak,
        meetings: weekDataMap.get(day)!.meetings,
      }));
      setWeeklyFocusData(processedWeeklyFocusData);

      const categoryTimeMap = new Map<string, number>();

      fetchedTasks.forEach(task => {
        if (task.status === 'completed') {
          const currentCategoryTime = categoryTimeMap.get(task.category) || 0;
          categoryTimeMap.set(task.category, currentCategoryTime + (task.pomodorosCompleted * POMODORO_DURATION_IN_MINUTES));
        }
      });
      const processedFocusTimeByCategoryData = Array.from(categoryTimeMap.entries()).map(([category, time]) => ({
        category,
        time,
      }));
      setFocusTimeByCategoryData(processedFocusTimeByCategoryData);
      console.log('Analytics: Processed Focus Time by Category Data (to Chart):', processedFocusTimeByCategoryData);


      const statusCounts = {
        completed: fetchedTasks.filter(task => task.status === 'completed').length,
        inProgress: fetchedTasks.filter(task => task.status === 'active' && task.pomodorosCompleted > 0).length,
        pending: fetchedTasks.filter(task => task.status === 'active' && task.pomodorosCompleted === 0).length,
        overdue: 0,
      };
      setTaskStatusBreakdown(statusCounts);

      const pomodoroDates = new Set<string>();
      sessions.forEach(session => {
        if (session.session_type === 'pomodoro') {
          const date = new Date(session.created_at);
          pomodoroDates.add(date.toISOString().split('T')[0]);
        }
      });

      const sortedDates = Array.from(pomodoroDates).sort();

      let currentStreakCount = 0;
      let longestStreakCount = 0;
      let tempStreak = 0;

      const todayIso = today.toISOString().split('T')[0];
      // Recalculate yesterdayIso here for streak logic, as the variable itself was removed
      const yesterdayIso = new Date(today.getTime() - 24 * 60 * 60 * 1000).toISOString().split('T')[0];

      if (pomodoroDates.has(todayIso)) {
        tempStreak = 1;
        currentStreakCount = 1;
      } else if (pomodoroDates.has(yesterdayIso)) {
        currentStreakCount = 0;
      }

      for (let i = sortedDates.length - 1; i >= 0; i--) {
        const currentDate = new Date(sortedDates[i]);
        const prevDate = new Date(currentDate);
        prevDate.setDate(currentDate.getDate() - 1);

        const prevDateIso = prevDate.toISOString().split('T')[0];

        if (i > 0 && sortedDates[i - 1] === prevDateIso) {
          tempStreak++;
        } else {
          longestStreakCount = Math.max(longestStreakCount, tempStreak);
          tempStreak = 1;
        }

        if (sortedDates[i] === todayIso) {
            currentStreakCount = Math.max(currentStreakCount, tempStreak);
        } else if (sortedDates[i] === yesterdayIso && !pomodoroDates.has(todayIso)) {
            currentStreakCount = 0;
        }
      }
      longestStreakCount = Math.max(longestStreakCount, tempStreak);

      if (!pomodoroDates.has(todayIso) && !pomodoroDates.has(yesterdayIso)) {
          currentStreakCount = 0;
      } else if (!pomodoroDates.has(todayIso) && pomodoroDates.has(yesterdayIso)) {
          currentStreakCount = 0;
      } else if (pomodoroDates.has(todayIso)) {
          let tempCurrentStreak = 0;
          let checkDate = new Date(today);
          while (pomodoroDates.has(checkDate.toISOString().split('T')[0])) {
              tempCurrentStreak++;
              checkDate.setDate(checkDate.getDate() - 1);
          }
          currentStreakCount = tempCurrentStreak;
      }


      setCurrentStreak(currentStreakCount);
      setLongestStreak(longestStreakCount);
    };

    fetchAnalyticsData();
  }, []);

  const maxWeeklyCombinedTime = Math.max(...weeklyFocusData.map(d => d.focus + d.shortBreak + d.longBreak + d.meetings), 1);
  const maxCategoryTime = Math.max(...focusTimeByCategoryData.map(d => d.time), 1);
  const totalTasks = tasks.length || 1;

  // Helper for change indicator text and color
  const getChangeText = (value: number | null, unit: string = '') => {
    if (value === null) return '';
    const sign = value >= 0 ? '+' : '';
    const colorClass = value > 0 ? 'text-green' : (value < 0 ? 'text-red' : 'text-gray');
    return <p className={`summary-change ${colorClass}`}>{`${sign}${value}${unit} today`}</p>;
  };

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
            <p className="summary-value">{pomodorosCompletedToday}</p>
            {getChangeText(pomodorosTodayValue)}
          </Card>
          <Card className="summary-card">
            <div className="card-header-with-icon">
              <h3>Tasks Completed</h3>
              <i className="fas fa-info-circle"></i>
            </div>
            <p className="summary-value">{tasksCompletedCount}</p>
            {getChangeText(tasksCompletedTodayValue)}
          </Card>
          <Card className="summary-card">
            <div className="card-header-with-icon">
              <h3>Average Focus Time</h3>
              <i className="fas fa-info-circle"></i>
            </div>
            <p className="summary-value">{averageFocusTime.toFixed(1)} min</p>
            {getChangeText(averageFocusTimeTodayValue, ' min')}
          </Card>
        </section>

        <section className="analytics-charts">
          <Card>
            <Chart
              title="Weekly Focus Overview"
              description="Total focus and break time over the last 7 days."
            >
              <div className="weekly-chart-placeholder">
                <div className="chart-bars">
                  {weeklyFocusData.map((data) => {
                    const totalDayTime = data.focus + data.shortBreak + data.longBreak + data.meetings;
                    const scaleFactor = totalDayTime === 0 ? 0 : 100 / maxWeeklyCombinedTime;

                    return (
                      <div key={data.day} className="chart-bar-column">
                        <div className="bar-stack">
                          <div
                            className="bar focus"
                            style={{ height: `${data.focus * scaleFactor}px` }}
                            title={`Focus: ${data.focus}min`}
                          ></div>
                          <div
                            className="bar short-break"
                            style={{ height: `${data.shortBreak * scaleFactor}px` }}
                            title={`Short Break: ${data.shortBreak}min`}
                          ></div>
                          <div
                            className="bar long-break"
                            style={{ height: `${data.longBreak * scaleFactor}px` }}
                            title={`Long Break: ${data.longBreak}min`}
                          ></div>
                          <div
                            className="bar meetings"
                            style={{ height: `${data.meetings * scaleFactor}px` }}
                            title={`Meetings: ${data.meetings}min`}
                          ></div>
                        </div>
                        <span className="bar-label">{data.day}</span>
                      </div>
                    );
                  })}
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
                  <span className="streak-value">{currentStreak}</span>
                  <span className="streak-label">Current Streak (Days)</span>
                </div>
                <div className="streak-item">
                  <i className="fas fa-trophy"></i>
                  <span className="streak-value">{longestStreak}</span>
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
                        style={{ width: `${(data.time / maxCategoryTime) * 100}%` }}
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
                  <div className="status-bar completed" style={{ width: `${(taskStatusBreakdown.completed / totalTasks) * 100}%` }}></div>
                </div>
                <span className="status-count">{taskStatusBreakdown.completed}</span>
              </div>
              <div className="status-item">
                <span className="status-label">In Progress</span>
                <div className="status-bar-wrapper">
                  <div className="status-bar in-progress" style={{ width: `${(taskStatusBreakdown.inProgress / totalTasks) * 100}%` }}></div>
                </div>
                <span className="status-count">{taskStatusBreakdown.inProgress}</span>
              </div>
              <div className="status-item">
                <span className="status-label">Pending</span>
                <div className="status-bar-wrapper">
                  <div className="status-bar pending" style={{ width: `${(taskStatusBreakdown.pending / totalTasks) * 100}%` }}></div>
                </div>
                <span className="status-count">{taskStatusBreakdown.pending}</span>
              </div>
              <div className="status-item">
                <span className="status-label">Overdue</span>
                <div className="status-bar-wrapper">
                  <div className="status-bar overdue" style={{ width: `${(taskStatusBreakdown.overdue / totalTasks) * 100}%` }}></div>
                </div>
                <span className="status-count">{taskStatusBreakdown.overdue}</span>
              </div>
            </div>
          </Card>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default Analytics;
