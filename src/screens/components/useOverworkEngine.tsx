
import { useEffect, useState, useRef } from 'react';
import { supabase } from '../lib/supabaseClient';

interface UseOverworkEngineProps {
  pomodorosDoneInCycle: number;
  isRunning: boolean;
  timerMode: 'pomodoro' | 'shortBreak' | 'longBreak';
  onFatigueDetected: (
    ruleCode: 'pomodoro-cycle' | 'long-session-over-2-hours'
  ) => void; 
}

const POMODOROS_BEFORE_LONG_BREAK = 4;

export function useOverworkEngine({
  pomodorosDoneInCycle,
  isRunning,
  timerMode,
  onFatigueDetected,
}: UseOverworkEngineProps) {
  const [continuousFocusSeconds, setContinuousFocusSeconds] = useState(0);
  const lastPomodoroCycleNotified = useRef(0);

  // Track continuous Pomodoro focus time
  useEffect(() => {
    if (timerMode === 'pomodoro' && isRunning) {
      const interval = setInterval(() => {
        setContinuousFocusSeconds((prev) => prev + 1);
      }, 1000);

      return () => clearInterval(interval);
    } else {
      setContinuousFocusSeconds(0);
    }
  }, [timerMode, isRunning]);

  //  Long session fatigue (2h = 7200s)
  useEffect(() => {
    if (continuousFocusSeconds >= 7200) {
      onFatigueDetected('long-session-over-2-hours');

      supabase.from('overwork_logs').insert([
        {
          rule_code: 'long-session-over-2-hours',
          notes: 'User focused more than 2 hours continuously',
        },
      ]);

      setContinuousFocusSeconds(0);
    }
  }, [continuousFocusSeconds, onFatigueDetected]);

  

  //  Pomodoro cycle fatigue
  useEffect(() => {
    if (
      pomodorosDoneInCycle > 0 &&
      pomodorosDoneInCycle % POMODOROS_BEFORE_LONG_BREAK === 0 &&
      pomodorosDoneInCycle > lastPomodoroCycleNotified.current
    ) {
      console.log(`Pomodoro cycle fatigue detected: ${pomodorosDoneInCycle} pomodoros.`); // Debug log
      onFatigueDetected('pomodoro-cycle');

      supabase.from('overwork_logs').insert([
        {
          rule_code: 'pomodoro-cycle',
          notes: `User completed ${pomodorosDoneInCycle} pomodoros in a cycle.`,
        },
      ]);
      lastPomodoroCycleNotified.current = pomodorosDoneInCycle;
    } else if (pomodorosDoneInCycle === 0) {
      lastPomodoroCycleNotified.current = 0;
    }
  }, [pomodorosDoneInCycle, onFatigueDetected]);
}
