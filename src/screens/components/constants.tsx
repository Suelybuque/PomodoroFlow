// src/constants.ts

export const POMODORO_DURATION = 5;//25 * 60; // seconds
export const SHORT_BREAK_DURATION = 3;//5 * 60; // seconds
export const LONG_BREAK_DURATION =5; //15 * 60; // seconds
export const POMODOROS_BEFORE_LONG_BREAK = 4; // Number of pomodoros before a long break

export const TASK_CATEGORIES = [
  { value: 'work', label: 'Work' },
  { value: 'study', label: 'Study' },
  { value: 'personal', label: 'Personal' },
  { value: 'health', label: 'Health' },
];

export const POMODORO_GOALS = [
  { value: '1', label: '1 Pomodoro (25 min)' },
  { value: '2', label: '2 Pomodoros (50 min)' },
  { value: '3', label: '3 Pomodoros (75 min)' },
  { value: '4', label: '4 Pomodoros (100 min)' },
];

// Image paths
export const TIMER_ICON_PATH = "/images/timer-icon.png";
export const COFFEE_ICON_PATH = "/images/coffee-icon.png";