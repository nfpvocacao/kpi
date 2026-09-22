import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://qodhmytsayifaduwgtwu.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFvZGhteXRzYXlpZmFkdXdndHd1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTAwODgyMzAsImV4cCI6MjEwNTY2NDIzMH0.5iqQwlIhqeglanWcLgZZ7kS9IqMQv3_GirJNccLZEa8';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
