import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://fujqlxsyxmcdjpdnzmnk.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZ1anFseHN5eG1jZGpwZG56bW5rIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTIyNTc1NTUsImV4cCI6MjA2NzgzMzU1NX0.v8A-zwin1c_Smy9jnH6erGPmEkUBa_S8yNfbYzrUBE0';

export const supabase = createClient(supabaseUrl, supabaseKey);
