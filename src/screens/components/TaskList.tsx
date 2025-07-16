import React from 'react';
import TaskItem from './TaskItem';

export interface Task {
  id: string;
  name: string;
  category: string;
  pomodoroGoal: number;
  pomodorosCompleted: number;
  status: 'active' | 'completed';
}

interface TaskListProps {
  tasks: Task[];
  selectedTaskId: string | null;
  onSelectTask: (id: string) => void;
  onToggleStatus: (id: string) => void;
  onDeleteTask: (id: string) => void; 
  onEditTask: (task: Task) => void; 
}

export default class TaskList extends React.Component<TaskListProps> {
  render() {
    const { tasks, selectedTaskId, onSelectTask, onToggleStatus, onDeleteTask, onEditTask } = this.props;

    if (tasks.length === 0) {
      return <p className="no-tasks">No tasks to display in this category.</p>;
    }

    return (
      <div className="task-list">
        {tasks.map((task) => (
          <TaskItem
            key={task.id}
            task={task}
            isSelected={selectedTaskId === task.id}
            onSelect={onSelectTask} 
            onToggleStatus={onToggleStatus} 
            onDeleteTask={onDeleteTask} 
            onEditTask={onEditTask}     
          />
        ))}
      </div>
    );
  }
}