import { create } from 'zustand'
import { supabase } from '../lib/supabase'

export const useAuthStore = create((set, get) => ({
  user: null,
  session: null,
  isLoading: true,
  error: null,

  setError: (error) => set({ error }),
  clearError: () => set({ error: null }),

  initAuth: () => {
    if (!supabase) {
      set({ isLoading: false })
      return
    }
    set({ isLoading: true })
    supabase.auth.getSession().then(({ data: { session } }) => {
      set({ session, user: session?.user ?? null, isLoading: false })
    })
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      set({ session, user: session?.user ?? null })
    })
    return () => subscription?.unsubscribe()
  },

  signIn: async (email, password) => {
    if (!supabase) {
      set({ error: 'Supabase non configuré.' })
      return { error: { message: 'Supabase non configuré.' } }
    }
    set({ error: null })
    const { data, error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) set({ error: error.message })
    return { data, error }
  },

  signUp: async (email, password, options = {}) => {
    if (!supabase) {
      set({ error: 'Supabase non configuré.' })
      return { error: { message: 'Supabase non configuré.' } }
    }
    set({ error: null })
    const { data, error } = await supabase.auth.signUp({ email, password, options })
    if (error) set({ error: error.message })
    return { data, error }
  },

  signOut: async () => {
    if (!supabase) return
    await supabase.auth.signOut()
    set({ user: null, session: null, error: null })
  },

  resetPasswordForEmail: async (email) => {
    if (!supabase) {
      set({ error: 'Supabase non configuré.' })
      return { error: { message: 'Supabase non configuré.' } }
    }
    set({ error: null })
    const { data, error } = await supabase.auth.resetPasswordForEmail(email.trim(), {
      redirectTo: `${window.location.origin}/reset-password`,
    })
    if (error) set({ error: error.message })
    return { data, error }
  },

  updatePassword: async (newPassword) => {
    if (!supabase) {
      set({ error: 'Supabase non configuré.' })
      return { error: { message: 'Supabase non configuré.' } }
    }
    set({ error: null })
    const { data, error } = await supabase.auth.updateUser({ password: newPassword })
    if (error) set({ error: error.message })
    return { data, error }
  },

  resendConfirmationEmail: async (email) => {
    if (!supabase) {
      set({ error: 'Supabase non configuré.' })
      return { error: { message: 'Supabase non configuré.' } }
    }
    set({ error: null })
    const { data, error } = await supabase.auth.resend({ type: 'signup', email: email || get().user?.email })
    if (error) set({ error: error.message })
    return { data, error }
  },
}))

export default useAuthStore
