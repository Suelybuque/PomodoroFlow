/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @typescript-eslint/no-unused-vars */
import React, { useEffect, useState, useCallback } from 'react';
import Card from './components/Card';
import Button from './components/Button';
import Modal from './components/Modal';
import TaskList from './components/TaskList';
import Navbar from './components/Navbar';
import Timer from './components/Timer';
import Stats from './components/Stats';
import Footer from './components/Footer';
import AddEditTaskModal from './components/AddEditTaskModal';
import { logPomodoroSession } from './components/logSessions';
import FatigueRecommendations from './components/FatigueRecommendations';
import './css/Dashboard.css';
import { supabase } from './lib/supabaseClient';
import { useOverworkEngine } from './components/useOverworkEngine';

import {
  POMODORO_DURATION,
  SHORT_BREAK_DURATION,
  LONG_BREAK_DURATION,
  POMODOROS_BEFORE_LONG_BREAK,
  TASK_CATEGORIES,
  POMODORO_GOALS,
  TIMER_ICON_PATH,
  COFFEE_ICON_PATH,
} from './components/constants';

interface Task {
  id: string;
  name: string;
  category: string;
  pomodoroGoal: number;
  pomodorosCompleted: number;
  status: 'active' | 'completed';
}

const Dashboard: React.FC = () => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'all' | 'active' | 'completed'>('active');

  const [secondsLeft, setSecondsLeft] = useState(POMODORO_DURATION);
  const [isRunning, setIsRunning] = useState(false);
  const [pomodorosDoneInCycle, setPomodorosDoneInCycle] = useState(0);
  const [timerMode, setTimerMode] = useState<'pomodoro' | 'shortBreak' | 'longBreak'>('pomodoro');

  const [isAddTaskModalOpen, setIsAddTaskModalOpen] = useState(false);
  const [newTaskName, setNewTaskName] = useState('');
  const [newTaskCategory, setNewTaskCategory] = useState(TASK_CATEGORIES[0]?.value || 'work');
  const [newTaskPomodoroGoal, setNewTaskPomodoroGoal] = useState(POMODORO_GOALS[0]?.value || '1');
  const [editingTask, setEditingTask] = useState<Task | null>(null);

  const [isBreakCompleteModalOpen, setIsBreakCompleteModalOpen] = useState(false);
  // isBreakSkipped state is removed
  const [fatigueRule, setFatigueRule] = useState<null | 'pomodoro-cycle' | 'long-session-over-2-hours'>(null); // Removed 'skipped-3-breaks'
  const [isFatigueModalOpen, setIsFatigueModalOpen] = useState(false);

  const [isConfirmDeleteModalOpen, setIsConfirmDeleteModalOpen] = useState(false);
  const [taskToDeleteId, setTaskToDeleteId] = useState<string | null>(null);

  // handleBreakSkippedProcessed callback is removed

  useOverworkEngine({
    pomodorosDoneInCycle,
    isRunning,
    timerMode,
    // breakSkippedFlag and onBreakSkippedProcessed are no longer passed
    onFatigueDetected: (rule) => {
      setFatigueRule(rule);
      setIsFatigueModalOpen(true);
    },
  });

  useEffect(() => {
    const fetchTasks = async () => {
      const { data, error } = await supabase
        .from('tasks')
        .select('*')
        .order('created_at', { ascending: false });

      if (!error && data) setTasks(data as Task[]);
    };
    fetchTasks();
  }, []);

  const handleTimerEnd = useCallback(async () => {
    if (timerMode === 'pomodoro') {
      const nextPomodorosDoneInCycle = pomodorosDoneInCycle + 1;
      setPomodorosDoneInCycle(nextPomodorosDoneInCycle);
      await logPomodoroSession({ taskId: selectedTaskId, duration: POMODORO_DURATION / 60 });

      if (selectedTaskId) {
        setTasks(prev => prev.map(task => {
          if (task.id === selectedTaskId) {
            const updatedPomodoros = task.pomodorosCompleted + 1;
            const updatedStatus = updatedPomodoros >= task.pomodoroGoal ? 'completed' : task.status;
            supabase.from('tasks').update({ pomodorosCompleted: updatedPomodoros, status: updatedStatus }).eq('id', selectedTaskId);
            return { ...task, pomodorosCompleted: updatedPomodoros, status: updatedStatus };
          }
          return task;
        }));
      }

      if (nextPomodorosDoneInCycle % POMODOROS_BEFORE_LONG_BREAK === 0) {
        setTimerMode('longBreak');
        setSecondsLeft(LONG_BREAK_DURATION);
      } else {
        setTimerMode('shortBreak');
        setSecondsLeft(SHORT_BREAK_DURATION);
      }

      setIsBreakCompleteModalOpen(true);
      // setIsBreakSkipped(false); // Removed
    } else {
      setTimerMode('pomodoro');
      setSecondsLeft(POMODORO_DURATION);
      setIsBreakCompleteModalOpen(true);
      // setIsBreakSkipped(false); // Removed
    }
  }, [timerMode, pomodorosDoneInCycle, selectedTaskId]);

  const handleSaveTask = async () => {
    if (!newTaskName.trim()) return;

    if (editingTask) {
      const { data } = await supabase
        .from('tasks')
        .update({ name: newTaskName, category: newTaskCategory, pomodoroGoal: parseInt(newTaskPomodoroGoal) })
        .eq('id', editingTask.id)
        .select();
      if (data) setTasks(prev => prev.map(task => task.id === editingTask.id ? (data[0] as Task) : task));
    } else {
      const { data } = await supabase
        .from('tasks')
        .insert([{ name: newTaskName, category: newTaskCategory, pomodoroGoal: parseInt(newTaskPomodoroGoal), pomodorosCompleted: 0, status: 'active' }])
        .select();
      if (data) setTasks(prev => [...prev, ...(data as Task[])]);
    }

    setNewTaskName('');
    setNewTaskCategory(TASK_CATEGORIES[0]?.value || 'work');
    setNewTaskPomodoroGoal(POMODORO_GOALS[0]?.value || '1');
    setEditingTask(null);
    setIsAddTaskModalOpen(false);
  };

  const getBreakCompleteModalTitle = () =>
    timerMode === 'pomodoro' ? 'Time to Focus!' : 'Break Time!';

  const getBreakCompleteModalMessage = () =>
    timerMode === 'pomodoro'
      ? 'Break is over. Ready for your next Pomodoro session!'
      : pomodorosDoneInCycle % POMODOROS_BEFORE_LONG_BREAK === 0
        ? 'Great job! You’ve completed a Pomodoro cycle. Time for a long break.'
        : 'Pomodoro completed! Time for a short break to recharge.';

  return (
    <div className="dashboard-layout">
      <Navbar />
      <main className="dashboard-content">
        <section className="productive-space">
          <Card className="productive-space-card">
            <h2>Your Productive Space</h2>
            <Timer
              secondsLeft={secondsLeft}
              setSecondsLeft={setSecondsLeft}
              isRunning={isRunning}
              setIsRunning={setIsRunning}
              timerMode={timerMode}
              onTimerEnd={handleTimerEnd}
              resetToDuration={POMODORO_DURATION}
              currentTaskName={
                selectedTaskId
                  ? tasks.find(task => task.id === selectedTaskId)?.name ?? 'Task not found'
                  : 'None selected'
              }
            />
          </Card>
        </section>

        <aside className="your-stats">
          <Stats
            tasks={tasks}
            pomodorosDoneInCycle={pomodorosDoneInCycle}
            pomodoroDurationInMinutes={POMODORO_DURATION / 60}
          />
          <Card className="tasks-card">
            <div className="tasks-header">
              <div className="task-tabs">
                {['all', 'active', 'completed'].map(tab => (
                  <Button
                    key={tab}
                    variant={activeTab === tab ? 'primary' : 'ghost'}
                    size="small"
                    onClick={() => setActiveTab(tab as any)}
                  >
                    {tab.charAt(0).toUpperCase() + tab.slice(1)}
                  </Button>
                ))}
              </div>
              <Button variant="primary" size="small" onClick={() => setIsAddTaskModalOpen(true)}>+</Button>
            </div>
            {tasks.filter(task => activeTab === 'all' || task.status === activeTab).length === 0 ? (
              <p className="no-tasks">No tasks to display in this category.</p>
            ) : (
              <TaskList
                tasks={tasks.filter(task => activeTab === 'all' || task.status === activeTab)}
                selectedTaskId={selectedTaskId}
                onSelectTask={(taskId) => {
                  const task = tasks.find(t => t.id === taskId);
                  if (task?.status === 'active') {
                    setSelectedTaskId(taskId);
                    setIsRunning(false);
                    setTimerMode('pomodoro');
                    setSecondsLeft(POMODORO_DURATION);
                  }
                }}
                onToggleStatus={async (taskId) => {
                  const task = tasks.find(t => t.id === taskId);
                  if (!task) return;
                  const newStatus = task.status === 'completed' ? 'active' : 'completed';
                  await supabase.from('tasks').update({ status: newStatus }).eq('id', taskId);
                  setTasks(prev => prev.map(t => t.id === taskId ? { ...t, status: newStatus } : t));
                }}
                onDeleteTask={(taskId) => {
                  setTaskToDeleteId(taskId);
                  setIsConfirmDeleteModalOpen(true);
                }}
                onEditTask={(task) => {
                  setEditingTask(task);
                  setNewTaskName(task.name);
                  setNewTaskCategory(task.category);
                  setNewTaskPomodoroGoal(String(task.pomodoroGoal));
                  setIsAddTaskModalOpen(true);
                }}
              />
            )}
          </Card>
        </aside>
      </main>

      <AddEditTaskModal
        isOpen={isAddTaskModalOpen}
        onClose={() => setIsAddTaskModalOpen(false)}
        editingTask={editingTask}
        newTaskName={newTaskName}
        setNewTaskName={setNewTaskName}
        newTaskCategory={newTaskCategory}
        setNewTaskCategory={setNewTaskCategory}
        newTaskPomodoroGoal={newTaskPomodoroGoal}
        setNewTaskPomodoroGoal={setNewTaskPomodoroGoal}
        onSave={handleSaveTask}
      />

      <Modal
        isOpen={isBreakCompleteModalOpen}
        onClose={() => setIsBreakCompleteModalOpen(false)}
        title={getBreakCompleteModalTitle()}
        showCloseButton={false}
        footer={
          <>
            <Button variant="primary" onClick={() => {
              setIsBreakCompleteModalOpen(false);
              setIsRunning(true);
            }}>
              {timerMode === 'pomodoro' ? 'Start Focus' : 'Start Break'}
            </Button>
            <Button variant="ghost" onClick={() => {
              setIsBreakCompleteModalOpen(false);
              setTimerMode('pomodoro');
              setSecondsLeft(POMODORO_DURATION);
              setIsRunning(false);
              // setIsBreakSkipped(true); // Removed
              console.log('Dashboard: Skip Break clicked, isBreakSkipped logic removed.'); // Debug log
            }}>
              Skip Break
            </Button>
          </>
        }
      >
        <div className="overwork-modal-content">
          <img
            src={timerMode === 'pomodoro' ? TIMER_ICON_PATH : COFFEE_ICON_PATH}
            alt={timerMode === 'pomodoro' ? 'Timer icon' : 'Coffee mug icon'}
            className="overwork-icon"
          />
          <p>{getBreakCompleteModalMessage()}</p>
        </div>
      </Modal>

      <Modal
        isOpen={isFatigueModalOpen}
        onClose={() => setIsFatigueModalOpen(false)}
        title="Fatigue Alert ⚠️"
        footer={<Button variant="primary" onClick={() => setIsFatigueModalOpen(false)}>Will do!</Button>}
      >
        {fatigueRule && <FatigueRecommendations ruleCode={fatigueRule} />}
      </Modal>

      <Footer />
    </div>
  );
};

export default Dashboard;
