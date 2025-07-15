import { supabase } from "../lib/supabaseClient";

export async function logPomodoroSession({
  taskId,
  duration,
  type = 'pomodoro',
}: {
  taskId: string | null;
  duration: number;
  type?: 'pomodoro' | 'shortBreak' | 'longBreak';
}) {
  const { data, error } = await supabase
    .from('pomodoro_sessions')
    .insert([
      {
        task_id: taskId,
        duration,
        session_type: type,
      },
    ])
    .select();

  return { data, error };
}
