import React from 'react';
import Card from './Card'; 

interface Task {
  id: string;
  name: string;
  category: string;
  pomodoroGoal: number;
  pomodorosCompleted: number;
  status: 'active' | 'completed';
}

interface StatsProps {
  tasks: Task[];
  pomodorosDoneInCycle: number;
  pomodoroDurationInMinutes: number;
}

const Stats: React.FC<StatsProps> = ({ tasks, pomodorosDoneInCycle, pomodoroDurationInMinutes }) => {
  const totalFocusTime = tasks.reduce((sum, task) => sum + task.pomodorosCompleted, 0) * pomodoroDurationInMinutes;
  const tasksDoneCount = tasks.filter((t) => t.status === 'completed').length;

  return (
    <Card>
      <h3>Your Stats</h3>
      <div className="stat-item">
        <i className="fas fa-clock"></i>
        <div className="stat-info">
          <h4>Pomodoros Today</h4>
          <p>
            <span>{pomodorosDoneInCycle}</span>
            <span className="stat-description">Completed focus sessions this cycle</span>
          </p>
        </div>
      </div>
      <div className="stat-item">
        <i className="fas fa-check-circle"></i>
        <div className="stat-info">
          <h4>Tasks Done</h4>
          <p>
            <span>{tasksDoneCount}</span>
            <span className="stat-description">Tasks marked as completed</span>
          </p>
        </div>
      </div>
      <div className="stat-item">
        <i className="fas fa-hourglass-half"></i>
        <div className="stat-info">
          <h4>Total Focus</h4>
          <p>
            <span>{totalFocusTime}m</span>
            <span className="stat-description">Combined time in focus sessions</span>
          </p>
        </div>
      </div>
    </Card>
  );
};

export default Stats;