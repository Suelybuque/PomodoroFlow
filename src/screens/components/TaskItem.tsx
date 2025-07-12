import React from "react";
import type { Task } from "./TaskList";

interface TaskItemProps {
  task: Task;
  isSelected: boolean;
  onSelect: () => void;
  onToggleStatus: () => void;
}

export default class TaskItem extends React.Component<TaskItemProps> {
  render() {
    const { task, isSelected, onSelect, onToggleStatus } = this.props;

    return (
      <div
        className={`task-item ${isSelected ? 'selected-task' : ''}`}
        onClick={task.status === 'active' ? onSelect : undefined}
        style={{ cursor: task.status === 'active' ? 'pointer' : 'default' }}
      >
        <div className="task-left">
          <input
            type="checkbox"
            checked={task.status === 'completed'}
            onChange={onToggleStatus}
            aria-label={`Mark "${task.name}" as ${task.status === 'completed' ? 'active' : 'completed'}`}
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
    );
  }
}
