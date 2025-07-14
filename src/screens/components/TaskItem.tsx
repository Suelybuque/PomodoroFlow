import React from "react";
import type { Task } from "./TaskList";
import Button from './Button'; // Assuming Button component is in the same components folder

interface TaskItemProps {
  task: Task;
  isSelected: boolean;
  onSelect: (taskId: string) => void;
  onToggleStatus: (taskId: string) => void;
  onDeleteTask: (taskId: string) => void;
  onEditTask: (task: Task) => void;
}

export default class TaskItem extends React.Component<TaskItemProps> {
  render() {
    const { task, isSelected, onSelect, onToggleStatus, onDeleteTask, onEditTask } = this.props;

    return (
      <div
        className={`task-item ${isSelected ? 'selected-task' : ''} ${task.status}`}
        onClick={task.status === 'active' ? () => onSelect(task.id) : undefined}
        style={{ cursor: task.status === 'active' ? 'pointer' : 'default' }}
      >
        <div className="task-left">
          <input
            type="checkbox"
            checked={task.status === 'completed'}
            onChange={() => onToggleStatus(task.id)}
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
          <Button
            variant="ghost"
            size="small"
            onClick={(e) => {
              e.stopPropagation();
              onEditTask(task);
            }}
            aria-label={`Edit task ${task.name}`}
            className="task-action-button"
          >
            <i className="fas fa-edit"></i> Edit {/* Added " Edit" text */}
          </Button>
          <Button
            variant="ghost"
            size="small"
            onClick={(e) => {
              e.stopPropagation();
              onDeleteTask(task.id);
            }}
            aria-label={`Delete task ${task.name}`}
            className="task-action-button"
          >
            <i className="fas fa-trash"></i> Delete {/* Added " Delete" text */}
          </Button>
        </div>
      </div>
    );
  }
}