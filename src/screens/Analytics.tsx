
import React, { useEffect, useState } from 'react';
import Navbar from './components/Navbar';
import Card from './components/Card';
import Chart from './components/Chart';
import Footer from './components/Footer';
import './css/Analytics.css';
import { supabase } from './lib/supabaseClient';


interface Task {
  id: string;
  name: string;
  category: string;
  pomodoroGoal: number;
  pomodorosCompleted: number;
  status: 'active' | 'completed';
  created_at: string;
  user_id: string;
}

interface WeeklyFocusDataPoint {
  day: string;
  focus: number;
  shortBreak: number;
  longBreak: number;
  meetings: number;
}

interface FocusTimeByCategoryDataPoint {
  category: string;
  time: number;
}

const POMODORO_DURATION_IN_MINUTES = 25;

const Analytics: React.FC = () => {
  const [, setUserId] = useState<string | null>(null);
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
  const [tasks, setTasks] = useState<Task[]>([]);

  const [pomodorosTodayValue, setPomodorosTodayValue] = useState<number | null>(null);
  const [tasksCompletedTodayValue, setTasksCompletedTodayValue] = useState<number | null>(null);
  const [averageFocusTimeTodayValue, setAverageFocusTimeTodayValue] = useState<number | null>(null);
  const [currentStreak, setCurrentStreak] = useState(0);
  const [longestStreak, setLongestStreak] = useState(0);

  useEffect(() => {
    const getSessionAndFetch = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (session?.user?.id) {
        setUserId(session.user.id);
        fetchAnalyticsData(session.user.id);
      }
    };

    getSessionAndFetch();
  }, []);

  const fetchAnalyticsData = async (userId: string) => {
    const { data: sessions, error: sessionsError } = await supabase
      .from('pomodoro_sessions')
      .select('*')
      .eq('user_id', userId);

    const { data: fetchedTasks, error: tasksError } = await supabase
      .from('tasks')
      .select('*')
      .eq('user_id', userId);

    if (sessionsError || tasksError) {
      console.error('Error:', sessionsError?.message || tasksError?.message);
      return;
    }

    setTasks(fetchedTasks as Task[]);

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const todaySessions = sessions.filter(
      (s) => new Date(s.created_at) >= today && s.session_type === 'pomodoro'
    );

    setPomodorosCompletedToday(todaySessions.length);
    setPomodorosTodayValue(todaySessions.length);

    const completedTasksToday = fetchedTasks.filter(
      (t) => new Date(t.created_at).setHours(0, 0, 0, 0) === today.getTime() && t.status === 'completed'
    );

    setTasksCompletedCount(fetchedTasks.filter(t => t.status === 'completed').length);
    setTasksCompletedTodayValue(completedTasksToday.length);

    const totalFocusTimeSumToday = todaySessions.reduce((sum, s) => sum + s.duration, 0);
    const avgToday = todaySessions.length > 0 ? totalFocusTimeSumToday / todaySessions.length : 0;

    setAverageFocusTime(avgToday);
    setAverageFocusTimeTodayValue(avgToday);

    const daysOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const weekDataMap = new Map<string, WeeklyFocusDataPoint>();
    daysOfWeek.forEach(day => weekDataMap.set(day, { day, focus: 0, shortBreak: 0, longBreak: 0, meetings: 0 }));

    sessions.forEach(session => {
      const sessionDate = new Date(session.created_at);
      const day = daysOfWeek[sessionDate.getDay()];
      const data = weekDataMap.get(day)!;

      if (session.session_type === 'pomodoro') data.focus += session.duration;
      if (session.session_type === 'shortBreak') data.shortBreak += session.duration;
      if (session.session_type === 'longBreak') data.longBreak += session.duration;
    });

    setWeeklyFocusData(Array.from(weekDataMap.values()));

    const categoryTimeMap = new Map<string, number>();
    fetchedTasks.forEach(t => {
      if (t.status === 'completed') {
        categoryTimeMap.set(
          t.category,
          (categoryTimeMap.get(t.category) || 0) + t.pomodorosCompleted * POMODORO_DURATION_IN_MINUTES
        );
      }
    });

    const categoryData: FocusTimeByCategoryDataPoint[] = Array.from(categoryTimeMap.entries()).map(([category, time]) => ({
      category,
      time,
    }));
    setFocusTimeByCategoryData(categoryData);

    setTaskStatusBreakdown({
      completed: fetchedTasks.filter(t => t.status === 'completed').length,
      inProgress: fetchedTasks.filter(t => t.status === 'active' && t.pomodorosCompleted > 0).length,
      pending: fetchedTasks.filter(t => t.status === 'active' && t.pomodorosCompleted === 0).length,
      overdue: 0,
    });

    const pomodoroDates = new Set<string>();
    sessions.forEach(s => {
      if (s.session_type === 'pomodoro') {
        const iso = new Date(s.created_at).toISOString().split('T')[0];
        pomodoroDates.add(iso);
      }
    });

    const sortedDates = Array.from(pomodoroDates).sort();
    const todayIso = today.toISOString().split('T')[0];
    const yesterdayIso = new Date(today.getTime() - 86400000).toISOString().split('T')[0];

    let tempStreak = 0;
    let maxStreak = 0;

    for (let i = sortedDates.length - 1; i >= 0; i--) {
      const date = new Date(sortedDates[i]);
      const prevDate = new Date(date);
      prevDate.setDate(date.getDate() - 1);
      const prevIso = prevDate.toISOString().split('T')[0];

      if (i > 0 && sortedDates[i - 1] === prevIso) tempStreak++;
      else {
        maxStreak = Math.max(maxStreak, tempStreak);
        tempStreak = 1;
      }
    }

    if (pomodoroDates.has(todayIso)) {
      setCurrentStreak(tempStreak);
    } else if (pomodoroDates.has(yesterdayIso)) {
      setCurrentStreak(0);
    }

    setLongestStreak(Math.max(maxStreak, tempStreak));
  };

  const maxWeeklyCombinedTime = Math.max(...weeklyFocusData.map(d => d.focus + d.shortBreak + d.longBreak), 1);
  const maxCategoryTime = Math.max(...focusTimeByCategoryData.map(d => d.time), 1);
  const totalTasks = tasks.length || 1;

  // Helper for change indicator text and color
  const getChangeText = (value: number | null, unit: string = '') => {
    if (value === null) return '';
    const sign = value >= 0 ? '+' : '';
    const colorClass = value > 0 ? 'text-green' : (value < 0 ? 'text-red' : 'text-gray');
    return <p className={`summary-change ${colorClass}`}>{`${sign}${value}${unit} today`}</p>;
  };

const generateInsights = () => {
  const insights: string[] = [];

  // ✅ Insight 1: Long Focus
  if (averageFocusTime > 90) {
    insights.push("🧠 You've been super focused today! Time for a long break to recharge and reset. 🌿");
  }

  // ✅ Insight 2: Low Task Completion
  if (tasksCompletedTodayValue !== null && tasksCompletedTodayValue < 1) {
    insights.push("📋 No tasks completed yet today. Try finishing just one to build momentum! 💡");
  }

  // ✅ Insight 3: Break Neglect
  const totalShortBreaks = weeklyFocusData.reduce((sum, d) => sum + d.shortBreak, 0);
  const totalPomodoros = weeklyFocusData.reduce((sum, d) => sum + d.focus, 0) / POMODORO_DURATION_IN_MINUTES;

  if (totalShortBreaks < totalPomodoros * 0.33) {
    insights.push("⏸️ Break alert! You've been skipping short breaks — even 5 minutes can boost clarity. ☕");
  }

  // ✅ Insight 4: Healthy Productivity
  if (
    averageFocusTime >= 25 &&
    averageFocusTime <= 35 &&
    tasksCompletedTodayValue &&
    tasksCompletedTodayValue > 0
  ) {
    insights.push("✅ You're balancing focus and task completion like a pro. Keep up the great work! 🔥");
  }

  // ✅ Insight 5: Burnout Risk
  if (currentStreak >= 5 && pomodorosCompletedToday >= 6) {
    insights.push("⚠️ You're on fire with a strong streak, but don’t forget to rest. A recharge day could do wonders. 🛌");
  }

  return insights;
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
  <h3>Today's Focus Insights</h3>
  <p>Based on your Pomodoro sessions:</p>
  <ul style={{ listStyle: 'none', paddingLeft: 0 }}>
    {generateInsights().length > 0 ? (
      generateInsights().map((insight, index) => (
        <li key={index}>{insight}</li>
      ))
    ) : (
      <li>You're doing great! Keep the momentum going. 💪🏽</li>
    )}
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
