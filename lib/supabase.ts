import { createClient } from '@supabase/supabase-js'
import { createBrowserClient } from '@supabase/ssr'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

// Configuration stricte pour l'authentification
const authConfig = {
  auth: {
    persistSession: false,
    autoRefreshToken: false,
    detectSessionInUrl: true
  }
}

// Client pour le serveur
export const supabase = createClient(supabaseUrl, supabaseAnonKey, authConfig)

// Fonction pour créer un client browser avec la même configuration
export function createBrowserSupabaseClient() {
  return createBrowserClient(supabaseUrl, supabaseAnonKey, authConfig)
} 