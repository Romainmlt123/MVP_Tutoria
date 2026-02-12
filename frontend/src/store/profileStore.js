import { create } from 'zustand'
import { supabase } from '../lib/supabase'

export const useProfileStore = create((set, get) => ({
  profile: null,
  isLoading: false,
  error: null,

  fetchProfile: async (userId) => {
    if (!supabase || !userId) {
      set({ profile: null, isLoading: false })
      return null
    }
    set({ isLoading: true, error: null })
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single()
    set({ profile: error ? null : data, error: error?.message ?? null, isLoading: false })
    return error ? null : data
  },

  updateProfile: async (userId, updates) => {
    if (!supabase || !userId) return { error: { message: 'Non autorisé' } }
    set({ error: null })
    const { data, error } = await supabase
      .from('profiles')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', userId)
      .select()
      .single()
    if (!error) set({ profile: data })
    return { data, error }
  },

  /** Sauvegarde l'onboarding en fusionnant avec settings existants. Met à jour display_name. */
  updateOnboarding: async (userId, onboardingData) => {
    if (!supabase || !userId) return { error: { message: 'Non autorisé' } }
    const { profile } = get()
    const settings = { ...(profile?.settings || {}), onboarding: onboardingData }
    const displayName = [onboardingData.firstName, onboardingData.lastName].filter(Boolean).join(' ') || profile?.display_name
    return get().updateProfile(userId, { settings, display_name: displayName || undefined })
  },

  clearProfile: () => set({ profile: null, error: null }),
}))

export default useProfileStore
