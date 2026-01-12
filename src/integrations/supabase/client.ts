import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://vtegpmfvgbarjcvmrltd.supabase.co'
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZ0ZWdwbWZ2Z2Jhcmpjdm1ybHRkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjgyMjQ0OTIsImV4cCI6MjA4MzgwMDQ5Mn0.9grMPmPHqL6UN_ZDMX9cwVf1p_x8zOEeabWhTE15bf8'

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
  },
})