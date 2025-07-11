import React, { useEffect, useState } from 'react';
import Card from './components/Card';
import Button from './components/Button';
import Modal from './components/Modal';
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

const Dashboard: React.FC = () => {
  const [isAddTaskModalOpen, setIsAddTaskModalOpen] = useState(false);
  const [isOverworkModalOpen, setIsOverworkModalOpen] = useState(false);
  const [newTaskName, setNewTaskName] = useState('');
  const [newTaskCategory, setNewTaskCategory] = useState('work');
  const [newTaskPomodoroGoal, setNewTaskPomodoroGoal] = useState('1');
  const [activeTab, setActiveTab] = useState<'all' | 'active' | 'completed'>('active');
  const [tasks, setTasks] = useState<Task[]>([]);

  useEffect(() => {
    const fetchTasks = async () => {
      const { data, error } = await supabase
        .from('tasks')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching tasks:', error.message);
      } else {
        setTasks(data as Task[]);
      }
    };

    fetchTasks();
  }, []);

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
      console.error('Failed to insert task:', error.message);
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

  const handleMarkTaskCompleted = async (taskId: string) => {
    const { error } = await supabase
      .from('tasks')
      .update({ status: 'completed' })
      .eq('id', taskId);

    if (error) {
      console.error('Failed to update task:', error.message);
      return;
    }

    setTasks((prevTasks) =>
      prevTasks.map((task) =>
        task.id === taskId ? { ...task, status: 'completed' } : task
      )
    );
  };

  const filteredTasks = tasks.filter((task) => {
    if (activeTab === 'all') return true;
    return task.status === activeTab;
  });

  return (
    <div className="dashboard-layout">
      <Navbar />
      <main className="dashboard-content">
        <section className="productive-space">
          <Card className="productive-space-card">
            <h2>Your Productive Space</h2>
            <div className="timer-display">
              <span className="time">25:00</span>
              <span className="focus-time-label">Focus Time</span>
            </div>
            <div className="timer-controls">
              <Button variant="primary">Start</Button>
              <Button variant="secondary">Reset</Button>
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
                  <span>3</span>
                  <span className="stat-description">Completed focus sessions today</span>
                </p>
              </div>
            </div>
            <div className="stat-item">
              <i className="fas fa-check-circle"></i>
              <div className="stat-info">
                <h4>Tasks Done</h4>
                <p>
                  <span>1</span>
                  <span className="stat-description">Tasks marked as completed</span>
                </p>
              </div>
            </div>
            <div className="stat-item">
              <i className="fas fa-hourglass-half"></i>
              <div className="stat-info">
                <h4>Total Focus</h4>
                <p>
                  <span>75m</span>
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
                  <div key={task.id} className="task-item">
                    <div className="task-left">
                      <input
                        type="checkbox"
                        checked={task.status === 'completed'}
                        onChange={() => handleMarkTaskCompleted(task.id)}
                        disabled={task.status === 'completed'}
                        aria-label={`Mark "${task.name}" as completed`}
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

      <Modal
        isOpen={isAddTaskModalOpen}
        onClose={() => setIsAddTaskModalOpen(false)}
        title="Add New Task"
        footer={
          <>
            <Button variant="secondary" onClick={() => setIsAddTaskModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" onClick={handleAddTask}>
              Save Task
            </Button>
          </>
        }
      >
        <p className="modal-description">Create a new task to organize your productivity.</p>
        <Input
          id="task-name"
          label="Task Name"
          placeholder="e.g., Finish Q3 Report"
          value={newTaskName}
          onChange={(e: { target: { value: React.SetStateAction<string> } }) => setNewTaskName(e.target.value)}
        />
        <Select
          id="category"
          label="Category"
          options={taskCategories}
          value={newTaskCategory}
          onChange={(e: { target: { value: React.SetStateAction<string> } }) => setNewTaskCategory(e.target.value)}
        />
        <Select
          id="pomodoro-goal"
          label="Pomodoro Goal"
          options={pomodoroGoals}
          value={newTaskPomodoroGoal}
          onChange={(e: { target: { value: React.SetStateAction<string> } }) => setNewTaskPomodoroGoal(e.target.value)}
        />
      </Modal>

      <Modal
        isOpen={isOverworkModalOpen}
        onClose={() => setIsOverworkModalOpen(false)}
        title="Time to Take a Breather!"
        showCloseButton={false}
        footer={
          <>
            <Button variant="primary" onClick={() => setIsOverworkModalOpen(false)}>
              Take a Break Now
            </Button>
            <Button variant="ghost" onClick={() => setIsOverworkModalOpen(false)}>
              Remind Me Later &gt;
            </Button>
          </>
        }
      >
        <div className="overwork-modal-content">
          <img
            src="/images/coffee-icon.png"
            alt="Coffee mug icon"
            className="overwork-icon"
          />
          <p>
            You've completed multiple Pomodoros. Give your mind and eyes a well-deserved break to
            recharge and maintain peak productivity.
          </p>
        </div>
      </Modal>

      <footer className="app-footer">
        <p>© 2023 Pomodoro Pro.</p>
        <div className="social-links">
          <a href="#" aria-label="Github"><i className="fab fa-github"></i></a>
          <a href="#" aria-label="Twitter"><i className="fab fa-twitter"></i></a>
          <a href="#" aria-label="LinkedIn"><i className="fab fa-linkedin"></i></a>
          <a href="#" aria-label="Email"><i className="fas fa-envelope"></i></a>
        </div>
      </footer>
    </div>
  );
};

export default Dashboard;
