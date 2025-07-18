
import React, { useEffect, useState, useRef } from 'react';
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
import { useTimerContext } from './TimerContext'; 
import  TIMER_ICON_PATH from './components/images/timer2.png'
import COFFEE_ICON_PATH from './components/images/coffee.png'
import {
  POMODORO_DURATION,
  POMODOROS_BEFORE_LONG_BREAK,
  TASK_CATEGORIES,
  POMODORO_GOALS,
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
 
  const {
    isRunning,
    setIsRunning,
    timerMode,
    setTimerMode,
    setSecondsLeft,
    pomodorosDoneInCycle,
   // setPomodorosDoneInCycle, 
  } = useTimerContext();

  const [tasks, setTasks] = useState<Task[]>([]);
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'all' | 'active' | 'completed'>('active');

  const [isAddTaskModalOpen, setIsAddTaskModalOpen] = useState(false);
  const [newTaskName, setNewTaskName] = useState('');
  const [newTaskCategory, setNewTaskCategory] = useState(TASK_CATEGORIES[0]?.value || 'work');
  const [newTaskPomodoroGoal, setNewTaskPomodoroGoal] = useState(POMODORO_GOALS[0]?.value || '1');
  const [editingTask, setEditingTask] = useState<Task | null>(null);

  const [isBreakCompleteModalOpen, setIsBreakCompleteModalOpen] = useState(false);
  const [fatigueRule, setFatigueRule] = useState<null | 'pomodoro-cycle' | 'long-session-over-2-hours'>(null);
  const [isFatigueModalOpen, setIsFatigueModalOpen] = useState(false);

  const [isConfirmDeleteModalOpen, setIsConfirmDeleteModalOpen] = useState(false);
  const [taskToDeleteId, setTaskToDeleteId] = useState<string | null>(null);

  const lastPomodoroLoggedRef = useRef(0);

  useOverworkEngine({
    pomodorosDoneInCycle,
    isRunning,
    timerMode,
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

  useEffect(() => {
    if (!isRunning && pomodorosDoneInCycle > lastPomodoroLoggedRef.current) {
        console.log(`Dashboard: Pomodoro ${pomodorosDoneInCycle} ended, logging session.`);
        logPomodoroSession({ taskId: selectedTaskId, duration: POMODORO_DURATION / 60 });

        if (selectedTaskId) {
            setTasks(prev => prev.map(task => {
                if (task.id === selectedTaskId) {
                    const updatedPomodoros = task.pomodorosCompleted + 1;
                    const updatedStatus = updatedPomodoros >= task.pomodoroGoal ? 'completed' : task.status;

                    supabase
                        .from('tasks')
                        .update({ pomodorosCompleted: updatedPomodoros, status: updatedStatus })
                        .eq('id', selectedTaskId)
                        .then(({ error }) => {
                            if (error) console.error('Supabase update error after Pomodoro:', error.message);
                        });

                    return { ...task, pomodorosCompleted: updatedPomodoros, status: updatedStatus };
                }
                return task;
            }));
        }
        lastPomodoroLoggedRef.current = pomodorosDoneInCycle; 
        setIsBreakCompleteModalOpen(true); 
    } else if (!isRunning && timerMode === 'pomodoro' && lastPomodoroLoggedRef.current === pomodorosDoneInCycle) {
        setIsBreakCompleteModalOpen(true); 
    }
  }, [isRunning, timerMode, pomodorosDoneInCycle, selectedTaskId, setTasks]);


  const handleSaveTask = async () => {
    if (!newTaskName.trim()) return;

    if (editingTask) {
      const { data, error } = await supabase
        .from('tasks')
        .update({ name: newTaskName, category: newTaskCategory, pomodoroGoal: parseInt(newTaskPomodoroGoal) })
        .eq('id', editingTask.id)
        .select();

      if (error) {
        console.error('Update task error:', error.message);
        return;
      }

      if (data) {
        setTasks((prev) =>
          prev.map((task) => (task.id === editingTask.id ? (data[0] as Task) : task))
        );
      }
    } else {
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
      }
    }

    setNewTaskName('');
    setNewTaskCategory(TASK_CATEGORIES[0]?.value || 'work');
    setNewTaskPomodoroGoal(POMODORO_GOALS[0]?.value || '1');
    setEditingTask(null);
    setIsAddTaskModalOpen(false);
  };

  const handleDeleteConfirmed = async () => {
    if (taskToDeleteId) {
      const { error } = await supabase
        .from('tasks')
        .delete()
        .eq('id', taskToDeleteId);

      if (error) {
        console.error('Error deleting task:', error.message);
      } else {
        setTasks(prev => prev.filter(task => task.id !== taskToDeleteId));
        console.log(`Task ${taskToDeleteId} deleted successfully.`);
      }
      setTaskToDeleteId(null);
      setIsConfirmDeleteModalOpen(false);
    }
  };

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
      setTimerMode('pomodoro');
    }
  };

  const openDeleteConfirmModal = (taskId: string) => {
    setTaskToDeleteId(taskId);
    setIsConfirmDeleteModalOpen(true);
  };

  const cancelDelete = () => {
    setTaskToDeleteId(null);
    setIsConfirmDeleteModalOpen(false);
  };

  const handleEditTask = (task: Task) => {
    setEditingTask(task);
    setNewTaskName(task.name);
    setNewTaskCategory(task.category);
    setNewTaskPomodoroGoal(String(task.pomodoroGoal));
    setIsAddTaskModalOpen(true);
  };

  const openAddTaskModal = () => {
    setEditingTask(null);
    setNewTaskName('');
    setNewTaskCategory(TASK_CATEGORIES[0]?.value || 'work');
    setNewTaskPomodoroGoal(POMODORO_GOALS[0]?.value || '1');
    setIsAddTaskModalOpen(true);
  };

  const handleSelectTask = (taskId: string) => {
    const task = tasks.find(t => t.id === taskId);
    if (task && task.status === 'active') {
        setSelectedTaskId(taskId);
        setSecondsLeft(POMODORO_DURATION);
        setIsRunning(false);
        setTimerMode('pomodoro');
    }
  };

  const filteredTasks = tasks.filter((task) => {
    if (activeTab === 'all') return true;
    return task.status === activeTab;
  });

  const getBreakCompleteModalTitle = () => {
    if (timerMode === 'pomodoro') {
      return 'Time to Focus!';
    } else if (timerMode === 'shortBreak' || timerMode === 'longBreak') {
      return 'Break Time!';
    }
    return 'Timer Finished';
  };

  const getBreakCompleteModalMessage = () => {
    if (timerMode === 'pomodoro') {
      return 'Break is over. Ready for your next Pomodoro session!';
    } else if (timerMode === 'shortBreak' || timerMode === 'longBreak') {
      return (pomodorosDoneInCycle % POMODOROS_BEFORE_LONG_BREAK === 0)
        ? 'Great job! You\'ve completed a Pomodoro cycle. Time for a long break.'
        : 'Pomodoro completed! Time for a short break to recharge.';
    }
    return '';
  };

  const currentTaskName = selectedTaskId
    ? tasks.find((task) => task.id === selectedTaskId)?.name ?? 'Task not found'
    : 'None selected';

  return (
    <div className="dashboard-layout">
      <Navbar />
      <main className="dashboard-content">
        <section className="productive-space">
          <Card className="productive-space-card">
            <h2>Your Productive Space</h2>
            <Timer
              resetToDuration={POMODORO_DURATION}
              currentTaskName={currentTaskName}
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
              <Button variant="primary" size="small" onClick={openAddTaskModal}>
                +
              </Button>
            </div>
            {filteredTasks.length === 0 ? (
              <p className="no-tasks">No tasks to display in this category.</p>
            ) : (
              <TaskList
                tasks={filteredTasks}
                selectedTaskId={selectedTaskId}
                onSelectTask={handleSelectTask}
                onToggleStatus={handleToggleTaskStatus}
                onDeleteTask={openDeleteConfirmModal}
                onEditTask={handleEditTask}
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
        isOpen={isConfirmDeleteModalOpen}
        onClose={cancelDelete}
        title="Confirm Deletion"
        footer={
          <>
            <Button variant="secondary" onClick={cancelDelete}>
              Cancel
            </Button>
            <Button variant="danger" onClick={handleDeleteConfirmed}>
              Delete
            </Button>
          </>
        }
      >
        <div className="confirm-delete-modal-content">
          <p>Are you sure you want to delete this task?</p>
          {taskToDeleteId && (
            <p>
              Task: "
              <strong>
                {tasks.find((task) => task.id === taskToDeleteId)?.name || 'Unknown Task'}
              </strong>
              "
            </p>
          )}
        </div>
      </Modal>

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
            <Button variant="ghost" onClick={() => setIsBreakCompleteModalOpen(false)}>
              Close
            </Button>
          </>
        }
      >
        <div className="overwork-modal-content">
          <img
            src={timerMode === 'pomodoro' ? TIMER_ICON_PATH : COFFEE_ICON_PATH}
            alt={timerMode === 'pomodoro' ? "Timer icon" : "Coffee mug icon"}
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
