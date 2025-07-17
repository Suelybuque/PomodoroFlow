// Timer.tsx
import React, { useCallback } from 'react';
import { useTimerContext } from '../TimerContext'; // Import useTimerContext
import Button from './Button';

interface TimerProps {
  resetToDuration: number; // Still needed for the reset button
  currentTaskName: string;
}

const Timer: React.FC<TimerProps> = ({
  resetToDuration,
  currentTaskName,
}) => {
  // Get all necessary state and setters from the context
  const {
    secondsLeft,
    setSecondsLeft,
    isRunning,
    setIsRunning,
    timerMode,
    setTimerMode,
  } = useTimerContext(); // Use the context hook

  const formatTime = (secs: number) => {
    const minutes = Math.floor(secs / 60);
    const seconds = secs % 60;
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };

  const getTimerLabel = useCallback(() => {
    switch (timerMode) {
      case 'pomodoro': return 'Focus Time';
      case 'shortBreak': return 'Short Break';
      case 'longBreak': return 'Long Break';
      default: return 'Timer';
    }
  }, [timerMode]);

  return (
    <>
      <div className="timer-display">
        <span className="time">{formatTime(secondsLeft)}</span>
        <span className="focus-time-label">{getTimerLabel()}</span>
      </div>
      <div className="timer-controls">
        <Button variant="primary" onClick={() => setIsRunning((r) => !r)}>
          {isRunning ? 'Pause' : 'Start'}
        </Button>
        <Button
          variant="secondary"
          onClick={() => {
            setIsRunning(false);
            setSecondsLeft(resetToDuration); // Reset to the initial duration of the current mode
            setTimerMode('pomodoro'); // Always reset to pomodoro mode on manual reset
          }}
        >
          Reset
        </Button>
      </div>
      <div className="current-task-display">
        <span className="current-task-label">Current Task:</span>
        <span className="current-task-name">{currentTaskName}</span>
      </div>
    </>
  );
};

export default Timer;
