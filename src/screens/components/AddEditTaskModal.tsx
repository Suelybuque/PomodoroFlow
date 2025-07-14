// src/components/AddEditTaskModal.tsx
import React from 'react';
import Modal from './Modal';
import Button from './Button';
import { Input, Select } from './Input';
import { TASK_CATEGORIES, POMODORO_GOALS } from './constants'; // Ensure these are imported from constants

interface Task {
  id: string;
  name: string;
  category: string;
  pomodoroGoal: number;
  pomodorosCompleted: number;
  status: 'active' | 'completed';
}

interface AddEditTaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  editingTask: Task | null;
  newTaskName: string;
  setNewTaskName: (name: string) => void;
  newTaskCategory: string;
  setNewTaskCategory: (category: string) => void;
  newTaskPomodoroGoal: string;
  setNewTaskPomodoroGoal: (goal: string) => void;
  onSave: () => void;
}

const AddEditTaskModal: React.FC<AddEditTaskModalProps> = ({
  isOpen,
  onClose,
  editingTask,
  newTaskName,
  setNewTaskName,
  newTaskCategory,
  setNewTaskCategory,
  newTaskPomodoroGoal,
  setNewTaskPomodoroGoal,
  onSave,
}) => {
  const title = editingTask ? "Edit Task" : "Add New Task";
  const modalDescription = editingTask
    ? "Modify your task details."
    : "Create a new task to organize your productivity.";
  const saveButtonLabel = editingTask ? "Save Changes" : "Add Task";

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={title}
      footer={
        <>
          <Button variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button variant="primary" onClick={onSave}>
            {saveButtonLabel}
          </Button>
        </>
      }
    >
      <div className="add-task-modal-content">
        <p className="modal-description">{modalDescription}</p>
        <Input
          id="task-name"
          label="Task Name"
          type="text"
          value={newTaskName}
          onChange={(e) => setNewTaskName(e.target.value)}
          placeholder="e.g., Finish project report"
        />
        <Select
          id="task-category"
          label="Category"
          options={TASK_CATEGORIES}
          value={newTaskCategory}
          onChange={(e) => setNewTaskCategory(e.target.value)}
        />
        <Select
          id="pomodoro-goal"
          label="Pomodoro Goal"
          options={POMODORO_GOALS}
          value={newTaskPomodoroGoal}
          onChange={(e) => setNewTaskPomodoroGoal(e.target.value)}
        />
      </div>
    </Modal>
  );
};

export default AddEditTaskModal;