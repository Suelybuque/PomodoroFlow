/* eslint-disable react-refresh/only-export-components */
import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import {
  POMODORO_DURATION,
  SHORT_BREAK_DURATION,
  LONG_BREAK_DURATION,
  POMODOROS_BEFORE_LONG_BREAK, 
} from './components/constants';

interface TimerContextType {
  secondsLeft: number;
  setSecondsLeft: React.Dispatch<React.SetStateAction<number>>;
  isRunning: boolean;
  setIsRunning: React.Dispatch<React.SetStateAction<boolean>>;
  timerMode: 'pomodoro' | 'shortBreak' | 'longBreak';
  setTimerMode: React.Dispatch<React.SetStateAction<'pomodoro' | 'shortBreak' | 'longBreak'>>;
  pomodorosDoneInCycle: number; 
  setPomodorosDoneInCycle: React.Dispatch<React.SetStateAction<number>>; 
}

const TimerContext = createContext<TimerContextType | undefined>(undefined);

interface TimerProviderProps {
  children: React.ReactNode;
}

export const TimerProvider: React.FC<TimerProviderProps> = ({ children }) => {
  const [secondsLeft, setSecondsLeft] = useState(POMODORO_DURATION);
  const [isRunning, setIsRunning] = useState(false);
  const [timerMode, setTimerMode] = useState<'pomodoro' | 'shortBreak' | 'longBreak'>('pomodoro');
  const [pomodorosDoneInCycle, setPomodorosDoneInCycle] = useState(0);

  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const lastTickTimeRef = useRef<number>(Date.now()); 
  useEffect(() => {
  
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }

    if (isRunning) {
      lastTickTimeRef.current = Date.now(); 
      intervalRef.current = setInterval(() => {
        const now = Date.now();
        const elapsedMilliseconds = now - lastTickTimeRef.current;      
        const elapsedSeconds = Math.floor(elapsedMilliseconds / 1000);

        setSecondsLeft((prevSeconds) => {
          const newSeconds = prevSeconds - elapsedSeconds;

          if (newSeconds <= 0) {
         
            if (intervalRef.current) {
              clearInterval(intervalRef.current);
            }
            setIsRunning(false);

            if (timerMode === 'pomodoro') {
              const nextPomodoros = pomodorosDoneInCycle + 1;
              setPomodorosDoneInCycle(nextPomodoros); 

              if (nextPomodoros % POMODOROS_BEFORE_LONG_BREAK === 0) {
                setTimerMode('longBreak');
                setSecondsLeft(LONG_BREAK_DURATION);
              } else {
                setTimerMode('shortBreak');
                setSecondsLeft(SHORT_BREAK_DURATION);
              }
            } else { 
              setTimerMode('pomodoro');
              setSecondsLeft(POMODORO_DURATION);
            }
           

            return 0;
          }
          return newSeconds;
        });

        lastTickTimeRef.current = now; 
      }, 1000); 
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isRunning, timerMode, pomodorosDoneInCycle]); 
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible' && isRunning) {
        const now = Date.now();
        const timeInBackgroundMilliseconds = now - lastTickTimeRef.current;
        const timeInBackgroundSeconds = Math.floor(timeInBackgroundMilliseconds / 1000);

        setSecondsLeft((prevSeconds) => {
          const newSeconds = prevSeconds - timeInBackgroundSeconds;
          if (newSeconds <= 0) {
            if (intervalRef.current) {
              clearInterval(intervalRef.current);
            }
            setIsRunning(false);

            if (timerMode === 'pomodoro') {
              const nextPomodoros = pomodorosDoneInCycle + 1;
              setPomodorosDoneInCycle(nextPomodoros);

              if (nextPomodoros % POMODOROS_BEFORE_LONG_BREAK === 0) {
                setTimerMode('longBreak');
                setSecondsLeft(LONG_BREAK_DURATION);
              } else {
                setTimerMode('shortBreak');
                setSecondsLeft(SHORT_BREAK_DURATION);
              }
            } else {
              setTimerMode('pomodoro');
              setSecondsLeft(POMODORO_DURATION);
            }
            return 0;
          }
          return newSeconds;
        });
        lastTickTimeRef.current = now;
      }
    };


    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [isRunning, timerMode, pomodorosDoneInCycle]);

  return (
    <TimerContext.Provider
      value={{
        secondsLeft,
        setSecondsLeft,
        isRunning,
        setIsRunning,
        timerMode,
        setTimerMode,
        pomodorosDoneInCycle,
        setPomodorosDoneInCycle,
      }}
    >
      {children}
    </TimerContext.Provider>
  );
};

export const useTimerContext = () => {
  const context = useContext(TimerContext);
  if (context === undefined) {
    throw new Error('useTimerContext must be used within a TimerProvider');
  }
  return context;
};
