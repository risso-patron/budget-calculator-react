import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://ufawiykqgmijuryztrcw.supabase.co'
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVmYXdpeWtxZ21panVyeXp0cmN3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzE5MDY2NzcsImV4cCI6MjA0NzQ4MjY3N30.KgxuoMZr-y7gjBMO0L1IZ4rkZTdO-sV7z8VzQ2dOBIo'

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn('⚠️ Variables de entorno de Supabase no encontradas, usando valores por defecto')
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true
  }
})
