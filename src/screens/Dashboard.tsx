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
import './css/Dashboard.css';
import { supabase } from './lib/supabaseClient';
import { useOverworkEngine } from './components/useOverworkEngine.tsx';
// Import only the constants 
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

  // Timer states (remain in Dashboard as the central orchestrator)
  const [secondsLeft, setSecondsLeft] = useState(POMODORO_DURATION);
  const [isRunning, setIsRunning] = useState(false);
  const [pomodorosDoneInCycle, setPomodorosDoneInCycle] = useState(0);
  const [timerMode, setTimerMode] = useState<'pomodoro' | 'shortBreak' | 'longBreak'>('pomodoro');

  // Add/Edit Task modal states
  const [isAddTaskModalOpen, setIsAddTaskModalOpen] = useState(false);
  const [newTaskName, setNewTaskName] = useState('');
  // Use first category/goal from constants as default, ensuring they exist
  const [newTaskCategory, setNewTaskCategory] = useState(TASK_CATEGORIES[0]?.value || 'work');
  const [newTaskPomodoroGoal, setNewTaskPomodoroGoal] = useState(POMODORO_GOALS[0]?.value || '1');
  const [editingTask, setEditingTask] = useState<Task | null>(null);

  // Break Completion Modal state
  const [isBreakCompleteModalOpen, setIsBreakCompleteModalOpen] = useState(false);
  // Re-added this state for the separate "Overwork" modal, as per original file
  const [isOverworkModalOpen, setIsOverworkModalOpen] = useState(false);

  // Delete Confirmation Modal states
  const [isConfirmDeleteModalOpen, setIsConfirmDeleteModalOpen] = useState(false);
  const [taskToDeleteId, setTaskToDeleteId] = useState<string | null>(null);


useOverworkEngine({
  pomodorosDoneInCycle,
  isRunning,
  timerMode,
  setIsOverworkModalOpen,
});

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

  // Handler for when the Timer component signals a phase completion
  const handleTimerEnd = useCallback(async () => { // Made async to allow Supabase insertion
    if (timerMode === 'pomodoro') {
      // Pomodoro just finished
      const nextPomodorosDoneInCycle = pomodorosDoneInCycle + 1;
      setPomodorosDoneInCycle(nextPomodorosDoneInCycle);

      // --- NEW LOGIC: Log completed Pomodoro session to Supabase ---
      await logPomodoroSession({ taskId: selectedTaskId, duration: POMODORO_DURATION / 60 });



      // Update selected task's pomodorosCompleted and status
      if (selectedTaskId) {
        setTasks((prev) => {
          return prev.map((task) => {
            if (task.id === selectedTaskId) {
              const updatedPomodoros = task.pomodorosCompleted + 1;
              const updatedStatus =
                updatedPomodoros >= task.pomodoroGoal ? 'completed' : task.status;

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
          });
        });
      }

      // Determine next mode: Long Break or Short Break
      if (nextPomodorosDoneInCycle % POMODOROS_BEFORE_LONG_BREAK === 0) {
        setTimerMode('longBreak');
        setSecondsLeft(LONG_BREAK_DURATION);
        setIsOverworkModalOpen(true); // Open overwork modal after a cycle
      } else {
        setTimerMode('shortBreak');
        setSecondsLeft(SHORT_BREAK_DURATION);
      }
      setIsBreakCompleteModalOpen(true); // Show modal that Pomodoro ended, break starting
    } else {
      // Break just finished (short or long)
      setTimerMode('pomodoro');
      setSecondsLeft(POMODORO_DURATION);
      setIsBreakCompleteModalOpen(true); // Show modal that break ended, Pomodoro starting
    }
  }, [timerMode, pomodorosDoneInCycle, selectedTaskId, setTasks, setPomodorosDoneInCycle, setTimerMode, setSecondsLeft, setIsBreakCompleteModalOpen, setIsOverworkModalOpen]);


  // Handle Add/Save Task (combines add and edit logic)
  const handleSaveTask = async () => {
    if (!newTaskName.trim()) return;

    if (editingTask) {
      const { data, error } = await supabase
        .from('tasks')
        .update({
          name: newTaskName,
          category: newTaskCategory,
          pomodoroGoal: parseInt(newTaskPomodoroGoal),
        })
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

    // If the currently selected task is marked completed, clear selection and reset timer
    if (newStatus === 'completed' && selectedTaskId === taskId) {
      setSelectedTaskId(null);
      setIsRunning(false);
      setSecondsLeft(POMODORO_DURATION);
      setTimerMode('pomodoro'); // Reset mode
    }
  };

  // Open delete confirmation modal
  const openDeleteConfirmModal = (taskId: string) => {
    setTaskToDeleteId(taskId);
    setIsConfirmDeleteModalOpen(true);
  };

  // Perform actual deletion after confirmation
  const confirmDelete = async () => {
    if (!taskToDeleteId) return;

    const { error } = await supabase
      .from('tasks')
      .delete()
      .eq('id', taskToDeleteId);

    if (error) {
      console.error('Delete task error:', error.message);
      return;
    }

    setTasks((prev) => prev.filter((task) => task.id !== taskToDeleteId));

    // If the deleted task was the selected one, clear selection and reset timer
    if (selectedTaskId === taskToDeleteId) {
      setSelectedTaskId(null);
      setIsRunning(false);
      setSecondsLeft(POMODORO_DURATION);
      setTimerMode('pomodoro'); // Reset mode
    }

    setTaskToDeleteId(null);
    setIsConfirmDeleteModalOpen(false);
  };

  // Cancel delete operation
  const cancelDelete = () => {
    setTaskToDeleteId(null);
    setIsConfirmDeleteModalOpen(false);
  };

  // Handle Edit Task (opens modal with task data)
  const handleEditTask = (task: Task) => {
    setEditingTask(task);
    setNewTaskName(task.name);
    setNewTaskCategory(task.category);
    setNewTaskPomodoroGoal(String(task.pomodoroGoal));
    setIsAddTaskModalOpen(true);
  };

  // Handler for opening Add Task modal (clears editing state)
  const openAddTaskModal = () => {
    setEditingTask(null);
    setNewTaskName('');
    setNewTaskCategory(TASK_CATEGORIES[0]?.value || 'work');
    setNewTaskPomodoroGoal(POMODORO_GOALS[0]?.value || '1');
    setIsAddTaskModalOpen(true);
  };

  // Handler for selecting a task (passed to TaskList)
  const handleSelectTask = (taskId: string) => {
    const task = tasks.find(t => t.id === taskId);
    if (task && task.status === 'active') { // Only allow selecting active tasks
        setSelectedTaskId(taskId);
        setSecondsLeft(POMODORO_DURATION); // Reset timer when a new task is selected
        setIsRunning(false); // Pause timer when a new task is selected, user can start it
        setTimerMode('pomodoro'); // Reset mode to pomodoro when a new task is selected
    }
  };

  // Filter tasks by tab
  const filteredTasks = tasks.filter((task) => {
    if (activeTab === 'all') return true;
    return task.status === activeTab;
  });

  // Helper to get modal title after a phase completes
  const getBreakCompleteModalTitle = () => {
    if (timerMode === 'pomodoro') {
      return 'Time to Focus!';
    } else if (timerMode === 'shortBreak' || timerMode === 'longBreak') {
      return 'Break Time!';
    }
    return 'Timer Finished'; // Fallback
  };

  // Helper to get modal message after a phase completes
  const getBreakCompleteModalMessage = () => {
    if (timerMode === 'pomodoro') {
      return 'Break is over. Ready for your next Pomodoro session!';
    } else if (timerMode === 'shortBreak' || timerMode === 'longBreak') {
      return (pomodorosDoneInCycle % POMODOROS_BEFORE_LONG_BREAK === 0)
        ? 'Great job! You\'ve completed a Pomodoro cycle. Time for a long break.'
        : 'Pomodoro completed! Time for a short break to recharge.';
    }
    return ''; // Fallback
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
              secondsLeft={secondsLeft}
              setSecondsLeft={setSecondsLeft}
              isRunning={isRunning}
              setIsRunning={setIsRunning}
              timerMode={timerMode}
              onTimerEnd={handleTimerEnd}
              resetToDuration={POMODORO_DURATION} // When reset, go back to full Pomodoro duration
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

      {/* Add/Edit Task Modal - Now a separate component */}
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

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={isConfirmDeleteModalOpen}
        onClose={cancelDelete}
        title="Confirm Deletion"
        footer={
          <>
            <Button variant="secondary" onClick={cancelDelete}>
              Cancel
            </Button>
            <Button variant="danger" onClick={confirmDelete}>
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


      {/* Break Completion / Transition Modal */}
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
           <Button
  variant="ghost"
  onClick={() => {
    setIsBreakCompleteModalOpen(false);
    setTimerMode('pomodoro');         // Switch mode back
    setSecondsLeft(POMODORO_DURATION); // Reset timer
    setIsRunning(false);               // Pause until user presses "Start Focus"
  }}
>
  Skip Break
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
  isOpen={isOverworkModalOpen}
  onClose={() => setIsOverworkModalOpen(false)}
  title="You're Overworking 😓"
  footer={
    <>
      <Button variant="primary" onClick={() => setIsOverworkModalOpen(false)}>
        Take a Break
      </Button>
      <Button variant="ghost" onClick={() => setIsOverworkModalOpen(false)}>
        Skip for Now
      </Button>
    </>
  }
>
  <p>
    You've completed 4 Pomodoros without a break. Time to recharge your focus and avoid burnout!
  </p>
</Modal>

      <Footer />
    </div>
  );
};

export default Dashboard;