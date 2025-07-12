/* eslint-disable @typescript-eslint/no-unused-vars */
import React, { useEffect, useState } from 'react';
import Card from './components/Card';
import Button from './components/Button';
import { Input, Select } from './components/Input';
import Navbar from './components/Navbar';
import './css/Dashboard.css';
import { supabase } from './lib/supabaseClient';

const taskCategories = [
  { value: 'work', label: 'Work' },
  { value: 'study', label: 'Study' },
  { value: 'personal', label: 'Personal' },
  { value: 'health', label: 'Health' },
];

const pomodoroGoals = [
  { value: '1', label: '1 Pomodoro (25 min)' },
  { value: '2', label: '2 Pomodoros (50 min)' },
  { value: '3', label: '3 Pomodoros (75 min)' },
  { value: '4', label: '4 Pomodoros (100 min)' },
];

interface Task {
  id: string;
  name: string;
  category: string;
  pomodoroGoal: number;
  pomodorosCompleted: number;
  status: 'active' | 'completed';
}

const POMODORO_DURATION = 25 * 60; // seconds
const BREAK_AFTER = 4;

const Dashboard: React.FC = () => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'all' | 'active' | 'completed'>('active');

  // Timer
  const [secondsLeft, setSecondsLeft] = useState(POMODORO_DURATION);
  const [isRunning, setIsRunning] = useState(false);
  const [pomodorosDone, setPomodorosDone] = useState(0);

  // Add Task modal states
  const [isAddTaskModalOpen, setIsAddTaskModalOpen] = useState(false);
  const [newTaskName, setNewTaskName] = useState('');
  const [newTaskCategory, setNewTaskCategory] = useState('work');
  const [newTaskPomodoroGoal, setNewTaskPomodoroGoal] = useState('1');

  // Overwork modal state
  const [isOverworkModalOpen, setIsOverworkModalOpen] = useState(false);

  // Fetch tasks once on mount
  useEffect(() => {
    async function fetchTasks() {
      const { data, error } = await supabase
        .from('tasks')
        .select('*')
        .order('created_at', { ascending: false });
      if (error) console.error('Fetch error:', error.message);
      else setTasks(data as Task[]);
    }
    fetchTasks();
  }, []);

  // Timer countdown effect
  useEffect(() => {
    if (!isRunning) return;

    if (secondsLeft === 0) {
      setIsRunning(false);
      setPomodorosDone((count) => count + 1);
      setSecondsLeft(POMODORO_DURATION);

      // Show break modal if needed
      if (pomodorosDone + 1 >= BREAK_AFTER) {
        setIsOverworkModalOpen(true);
        setPomodorosDone(0);
      }

      // Update task's pomodorosCompleted & maybe status
      if (selectedTaskId) {
        setTasks((prev) => {
          return prev.map((task) => {
            if (task.id === selectedTaskId) {
              const updatedPomodoros = task.pomodorosCompleted + 1;
              const updatedStatus =
                updatedPomodoros >= task.pomodoroGoal ? 'completed' : task.status;

              // Update Supabase
              supabase
                .from('tasks')
                .update({ pomodorosCompleted: updatedPomodoros, status: updatedStatus })
                .eq('id', selectedTaskId)
                .then(({ error }) => {
                  if (error) console.error('Update error:', error.message);
                });

              return { ...task, pomodorosCompleted: updatedPomodoros, status: updatedStatus };
            }
            return task;
          });
        });
      }

      return;
    }

    const timerId = setInterval(() => {
      setSecondsLeft((time) => time - 1);
    }, 1000);

    return () => clearInterval(timerId);
  }, [isRunning, secondsLeft, pomodorosDone, selectedTaskId]);

  // Add new task handler
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const handleAddTask = async () => {
    if (!newTaskName.trim()) return;

    const { data, error } = await supabase
      .from('tasks')
      .insert([
        {
          name: newTaskName,
          category: newTaskCategory,
          pomodoroGoal: parseInt(newTaskPomodoroGoal),
          pomodorosCompleted: 0,
          status: 'active',
        },
      ])
      .select();

    if (error) {
      console.error('Insert error:', error.message);
      return;
    }

    if (data) {
      setTasks((prev) => [...prev, ...(data as Task[])]);
      setNewTaskName('');
      setNewTaskCategory('work');
      setNewTaskPomodoroGoal('1');
      setIsAddTaskModalOpen(false);
    }
  };

  // Toggle task completed / active status
  const handleToggleTaskStatus = async (taskId: string) => {
    const task = tasks.find((t) => t.id === taskId);
    if (!task) return;

    const newStatus = task.status === 'completed' ? 'active' : 'completed';

    const { error } = await supabase
      .from('tasks')
      .update({ status: newStatus })
      .eq('id', taskId);

    if (error) {
      console.error('Update status error:', error.message);
      return;
    }

    setTasks((prev) =>
      prev.map((t) => (t.id === taskId ? { ...t, status: newStatus } : t))
    );

    if (newStatus === 'completed' && selectedTaskId === taskId) {
      setSelectedTaskId(null);
      setIsRunning(false);
      setSecondsLeft(POMODORO_DURATION);
    }
  };

  // Filter tasks by tab
  const filteredTasks = tasks.filter((task) => {
    if (activeTab === 'all') return true;
    return task.status === activeTab;
  });

  // Format seconds to mm:ss
  const formatTime = (secs: number) => {
    const minutes = Math.floor(secs / 60);
    const seconds = secs % 60;
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };

  return (
    <div className="dashboard-layout">
      <Navbar />
      <main className="dashboard-content">
        <section className="productive-space">
          <Card className="productive-space-card">
            <h2>Your Productive Space</h2>
            <div className="timer-display">
              <span className="time">{formatTime(secondsLeft)}</span>
              <span className="focus-time-label">Focus Time</span>
            </div>
            <div className="timer-controls">
              <Button variant="primary" onClick={() => setIsRunning((r) => !r)}>
                {isRunning ? 'Pause' : 'Start'}
              </Button>
              <Button
                variant="secondary"
                onClick={() => {
                  setIsRunning(false);
                  setSecondsLeft(POMODORO_DURATION);
                }}
              >
                Reset
              </Button>
            </div>
            <div className="selected-task-info" style={{ marginTop: 10 }}>
              <strong>Current Task: </strong>{' '}
              {selectedTaskId
                ? tasks.find((task) => task.id === selectedTaskId)?.name ?? 'Task not found'
                : 'None selected'}
            </div>
          </Card>
        </section>

        <aside className="your-stats">
          <Card>
            <h3>Your Stats</h3>
            <div className="stat-item">
              <i className="fas fa-clock"></i>
              <div className="stat-info">
                <h4>Pomodoros Today</h4>
                <p>
                  <span>{pomodorosDone}</span>
                  <span className="stat-description">Completed focus sessions today</span>
                </p>
              </div>
            </div>
            <div className="stat-item">
              <i className="fas fa-check-circle"></i>
              <div className="stat-info">
                <h4>Tasks Done</h4>
                <p>
                  <span>{tasks.filter((t) => t.status === 'completed').length}</span>
                  <span className="stat-description">Tasks marked as completed</span>
                </p>
              </div>
            </div>
            <div className="stat-item">
              <i className="fas fa-hourglass-half"></i>
              <div className="stat-info">
                <h4>Total Focus</h4>
                <p>
                  <span>{pomodorosDone * 25}m</span>
                  <span className="stat-description">Combined time in focus sessions</span>
                </p>
              </div>
            </div>
          </Card>

          <Card className="tasks-card">
            <div className="tasks-header">
              <div className="task-tabs">
                <Button
                  variant={activeTab === 'all' ? 'primary' : 'ghost'}
                  size="small"
                  onClick={() => setActiveTab('all')}
                >
                  All Tasks
                </Button>
                <Button
                  variant={activeTab === 'active' ? 'primary' : 'ghost'}
                  size="small"
                  onClick={() => setActiveTab('active')}
                >
                  Active
                </Button>
                <Button
                  variant={activeTab === 'completed' ? 'primary' : 'ghost'}
                  size="small"
                  onClick={() => setActiveTab('completed')}
                >
                  Completed
                </Button>
              </div>
              <Button variant="primary" size="small" onClick={() => setIsAddTaskModalOpen(true)}>
                +
              </Button>
            </div>
            <div className="task-list">
              {filteredTasks.length === 0 ? (
                <p className="no-tasks">No tasks to display in this category.</p>
              ) : (
                filteredTasks.map((task) => (
                  <div
                    key={task.id}
                    className={`task-item ${selectedTaskId === task.id ? 'selected-task' : ''}`}
                    onClick={() => {
                      if (task.status === 'active') {
                        setSelectedTaskId(task.id);
                        setSecondsLeft(POMODORO_DURATION);
                        setIsRunning(false);
                      }
                    }}
                    style={{ cursor: task.status === 'active' ? 'pointer' : 'default' }}
                    aria-label={`Select task ${task.name} for Pomodoro timer`}
                  >
                    <div className="task-left">
                      <input
                        type="checkbox"
                        checked={task.status === 'completed'}
                        onChange={() => handleToggleTaskStatus(task.id)}
                        aria-label={`Mark "${task.name}" as ${
                          task.status === 'completed' ? 'active' : 'completed'
                        }`}
                      />
                      <span className="task-name">{task.name}</span>
                    </div>
                    <div className="task-right">
                      <span className={`task-category ${task.category.toLowerCase()}`}>
                        {task.category}
                      </span>
                      <span className="task-progress">
                        {task.pomodorosCompleted}/{task.pomodoroGoal}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </Card>
        </aside>
      </main>

      {/* Your Modal components are managed outside this file */}
    </div>
  );
};

export default Dashboard;
