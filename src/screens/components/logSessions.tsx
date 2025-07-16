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
  const {
    data: { session },
    error: sessionError,
  } = await supabase.auth.getSession();

  if (sessionError || !session?.user) {
    console.error("No active user session.");
    return { data: null, error: new Error("User not logged in") };
  }

  const userId = session.user.id;

  const { data, error } = await supabase
    .from("pomodoro_sessions")
    .insert([
      {
        task_id: taskId,
        duration,
        session_type: type,
        user_id: userId, // ✅ associate session with logged-in user
      },
    ])
    .select();

  return { data, error };
}
