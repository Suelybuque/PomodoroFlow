import React, { useEffect, useCallback } from 'react';
import Button from './Button'; // Assuming Button component is available

interface TimerProps {
  secondsLeft: number;
  setSecondsLeft: React.Dispatch<React.SetStateAction<number>>;
  isRunning: boolean;
  setIsRunning: React.Dispatch<React.SetStateAction<boolean>>;
  timerMode: 'pomodoro' | 'shortBreak' | 'longBreak';
  onTimerEnd: () => void; // Callback to notify Dashboard when a timer phase ends
  resetToDuration: number; // The default duration to reset the timer to (e.g., POMODORO_DURATION)
  currentTaskName: string; // Name of the currently selected task
}

const Timer: React.FC<TimerProps> = ({
  secondsLeft,
  setSecondsLeft,
  isRunning,
  setIsRunning,
  timerMode,
  onTimerEnd,
  resetToDuration,
  currentTaskName,
}) => {
  // Timer countdown effect
  useEffect(() => {
    if (!isRunning) return;

    if (secondsLeft === 0) {
      setIsRunning(false); // Pause timer when a phase ends
      onTimerEnd(); // Notify Dashboard that a phase has ended
      return;
    }

    const timerId = setInterval(() => {
      setSecondsLeft((time) => time - 1);
    }, 1000);

    return () => clearInterval(timerId); // Clean up interval
  }, [isRunning, secondsLeft, onTimerEnd, setSecondsLeft, setIsRunning]);

  // Format seconds to mm:ss
  const formatTime = (secs: number) => {
    const minutes = Math.floor(secs / 60);
    const seconds = secs % 60;
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };

  // Helper to get current timer label
  const getTimerLabel = useCallback(() => {
    switch (timerMode) {
      case 'pomodoro':
        return 'Focus Time';
      case 'shortBreak':
        return 'Short Break';
      case 'longBreak':
        return 'Long Break';
      default:
        return 'Timer';
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
            setSecondsLeft(resetToDuration); // Reset to the initial Pomodoro duration
          }}
        >
          Reset
        </Button>
      </div>
      <div className="selected-task-info" style={{ marginTop: 10 }}>
        <strong>Current Task: </strong>{' '}
        {currentTaskName}
      </div>
    </>
  );
};

export default Timer;