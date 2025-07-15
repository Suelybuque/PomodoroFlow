
import { useEffect } from 'react';
import { supabase } from '../lib/supabaseClient';

interface UseOverworkEngineProps {
  pomodorosDoneInCycle: number;
  isRunning: boolean;
  timerMode: 'pomodoro' | 'shortBreak' | 'longBreak';
  setIsOverworkModalOpen: (value: boolean) => void;
}

export function useOverworkEngine({
  pomodorosDoneInCycle,
  isRunning,
  timerMode,
  setIsOverworkModalOpen,
}: UseOverworkEngineProps) {
  useEffect(() => {
    if (
      pomodorosDoneInCycle >= 4 &&
      timerMode === 'pomodoro' &&
      isRunning // only trigger when actively working
    ) {
      setIsOverworkModalOpen(true);

      supabase.from('overwork_logs').insert([
        {
          rule_code: '4-pomodoros-without-break',
          notes: 'User completed 4 pomodoros without a break',
        },
      ]);
    }
  }, [pomodorosDoneInCycle, timerMode, isRunning]);
}
