import { create } from 'zustand'
import { persist } from 'zustand/middleware'

const STORAGE_KEY = 'tutoria_openai_api_key'

export const useApiKeyStore = create(
  persist(
    (set) => ({
      openaiApiKey: '',
      setOpenaiApiKey: (key) => set({ openaiApiKey: key?.trim() || '' }),
      clearApiKey: () => set({ openaiApiKey: '' }),
    }),
    { name: 'tutoria-api-key', partialize: (s) => ({ openaiApiKey: s.openaiApiKey }) }
  )
)

export function getApiKeyHeaders() {
  const key = useApiKeyStore.getState().openaiApiKey?.trim()
  if (!key) return {}
  return { 'X-OpenAI-API-Key': key }
}
