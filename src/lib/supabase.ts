import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || ''
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_DEFAULT_KEY || ''

// Validate environment variables
if (!supabaseUrl) {
  throw new Error(
    'VITE_SUPABASE_URL is required. Please check your .env file.\n' +
    'Expected: VITE_SUPABASE_URL=https://your-project.supabase.co'
  )
}

if (!supabaseAnonKey) {
  throw new Error(
    'VITE_SUPABASE_PUBLISHABLE_DEFAULT_KEY is required. Please check your .env file.\n' +
    'Expected: VITE_SUPABASE_PUBLISHABLE_DEFAULT_KEY=your-publishable-key\n' +
    'Note: Use the "anon" or "public" key from Supabase dashboard, not the service_role key.'
  )
}

// Create Supabase client with default options
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
  },
  realtime: {
    params: {
      eventsPerSecond: 10,
    },
  },
})

// Test connection on initialization
if (supabaseUrl && supabaseAnonKey) {
  supabase.auth.getSession().catch((error) => {
    console.error('Supabase connection error:', error)
  })
}

