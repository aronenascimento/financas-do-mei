import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://ajoqivzatmjwuymsxzqz.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFqb3FpdnphdG1qd3V5bXN4enF6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjgyNDY3NDMsImV4cCI6MjA4MzgyMjc0M30.P4GNdGYpwXpfBmB3gAnzNdxmqLzbtYPfpc9gdm1JRpw';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    storage: localStorage,
    persistSession: true,
    autoRefreshToken: true,
  },
});
