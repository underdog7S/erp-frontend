import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.REACT_APP_SUPABASE_URL || 'https://xbemjxfunalbebxwoffz.supabase.co'
const supabaseAnonKey = process.env.REACT_APP_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhiZW1qeGZ1bmFsYmVieHdvZmZ6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTc3Nzc3NjAsImV4cCI6MjA3MzM1Mzc2MH0.UeU_hl-WE2R8UVpp1RYMaKJkGsNzEQHNSeNjQO-IGyk'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Supabase helper functions
export const supabaseAuth = {
  // Sign up with email and password
  signUp: async (email, password, userData = {}) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: userData
      }
    })
    return { data, error }
  },

  // Sign in with email and password
  signIn: async (email, password) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    })
    return { data, error }
  },

  // Sign out
  signOut: async () => {
    const { error } = await supabase.auth.signOut()
    return { error }
  },

  // Get current user
  getCurrentUser: async () => {
    const { data: { user }, error } = await supabase.auth.getUser()
    return { user, error }
  },

  // Listen to auth changes
  onAuthStateChange: (callback) => {
    return supabase.auth.onAuthStateChange(callback)
  }
}

// Supabase database helper functions
export const supabaseDB = {
  // Generic table operations
  select: async (table, query = '*', filters = {}) => {
    let queryBuilder = supabase.from(table).select(query)
    
    // Apply filters
    Object.entries(filters).forEach(([key, value]) => {
      queryBuilder = queryBuilder.eq(key, value)
    })
    
    const { data, error } = await queryBuilder
    return { data, error }
  },

  insert: async (table, data) => {
    const { data: result, error } = await supabase
      .from(table)
      .insert(data)
      .select()
    return { result, error }
  },

  update: async (table, id, data) => {
    const { data: result, error } = await supabase
      .from(table)
      .update(data)
      .eq('id', id)
      .select()
    return { result, error }
  },

  delete: async (table, id) => {
    const { error } = await supabase
      .from(table)
      .delete()
      .eq('id', id)
    return { error }
  },

  // Real-time subscriptions
  subscribe: (table, callback, filters = {}) => {
    let subscription = supabase
      .channel(`${table}_changes`)
      .on('postgres_changes', 
        { 
          event: '*', 
          schema: 'public', 
          table: table,
          filter: filters
        }, 
        callback
      )
      .subscribe()
    
    return subscription
  }
}

export default supabase
