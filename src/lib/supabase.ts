import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://rpnpowljtfubqgfmkapg.supabase.co'
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJwbnBvd2xqdGZ1YnFnZm1rYXBnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTc3NjMxNjcsImV4cCI6MjA3MzMzOTE2N30.iV3XkkmOS_e9KAJGDUEkTNMGkNMFF2y_QC96Dez-GMg'

// Use environment variables for proper Supabase connection
export const supabase = createClient(supabaseUrl, supabaseAnonKey)

export interface User {
  id: string;
  username: string;
  password: string;
  name: string;
  role: 'employee' | 'admin';
  created_at: string;
}

export interface Stamp {
  id: string;
  user_id: string;
  type: 'in' | 'out';
  timestamp: string;
  location?: string;
  created_at: string;
}