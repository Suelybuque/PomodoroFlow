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
  onDeleteTask: (id: string) => void; // <--- NEW PROP
  onEditTask: (task: Task) => void; // <--- NEW PROP
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
            onSelect={onSelectTask} // Pass the function directly
            onToggleStatus={onToggleStatus} // Pass the function directly
            onDeleteTask={onDeleteTask} // <--- Pass the new prop
            onEditTask={onEditTask}     // <--- Pass the new prop
          />
        ))}
      </div>
    );
  }
}