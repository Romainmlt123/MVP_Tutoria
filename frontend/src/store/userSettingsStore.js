import { create } from 'zustand'
import { supabase } from '../lib/supabase'

const defaultAiPrefs = {
  persona: 'encouraging',
  speechRate: 1.2,
  interruptMode: false,
  autoPlay: true,
}

export const useUserSettingsStore = create((set, get) => ({
  settings: null,
  isLoading: false,
  error: null,

  fetchSettings: async (userId) => {
    if (!supabase || !userId) {
      set({ settings: null, isLoading: false })
      return null
    }
    set({ isLoading: true, error: null })
    const { data, error } = await supabase
      .from('user_settings')
      .select('*')
      .eq('user_id', userId)
      .maybeSingle()
    if (error) {
      set({ settings: null, error: error.message, isLoading: false })
      return null
    }
    if (!data) {
      set({ settings: null, isLoading: false })
      return null
    }
    set({ settings: data, error: null, isLoading: false })
    return data
  },

  upsertSettings: async (userId, updates) => {
    if (!supabase || !userId) return { error: { message: 'Non autorisé' } }
    set({ error: null })
    const payload = {
      user_id: userId,
      updated_at: new Date().toISOString(),
      ...updates,
    }
    const { data, error } = await supabase
      .from('user_settings')
      .upsert(payload, { onConflict: 'user_id' })
      .select()
      .single()
    if (!error) set({ settings: data })
    return { data, error }
  },

  getAiPrefs: () => {
    const { settings } = get()
    const extra = settings?.extra ?? {}
    return {
      persona: extra.persona ?? defaultAiPrefs.persona,
      speechRate: extra.speechRate ?? defaultAiPrefs.speechRate,
      interruptMode: extra.interruptMode ?? defaultAiPrefs.interruptMode,
      autoPlay: extra.autoPlay ?? defaultAiPrefs.autoPlay,
    }
  },

  clearSettings: () => set({ settings: null, error: null }),
}))

export default useUserSettingsStore
