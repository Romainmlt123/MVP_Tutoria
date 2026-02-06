import { create } from 'zustand'
import { normalizeGraphData } from '../utils/graphNormalizer'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000'

export const useChatStore = create((set, get) => ({
  messages: [],
  currentGraph: null,
  showGraphPanel: false,
  graphVersion: 0,
  isLoading: false,
  error: null,

  addMessage: (message) =>
    set((state) => ({
      messages: [
        ...state.messages,
        { ...message, id: message.id || `msg-${Date.now()}` },
      ],
    })),

  setCurrentGraph: (graph) =>
    set((state) => ({
      currentGraph: graph,
      showGraphPanel: !!graph,
      graphVersion: (state.graphVersion || 0) + 1,
    })),

  closeGraphPanel: () =>
    set({ showGraphPanel: false }),

  setLoading: (loading) => set({ isLoading: loading }),
  setError: (error) => set({ error }),

  clearMessages: () => set({ messages: [] }),

  sendMessage: async (text) => {
    const { messages, addMessage, setCurrentGraph, setLoading, setError } =
      get()
    addMessage({ role: 'user', content: text })
    set({ isLoading: true, error: null })

    const history = messages.map((m) => ({
      role: m.role,
      content: m.content,
    }))
    history.push({ role: 'user', content: text })

    try {
      const res = await fetch(`${API_URL}/api/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: history }),
      })

      if (!res.ok) {
        const err = await res.json().catch(() => ({}))
        throw new Error(err.detail || `Erreur ${res.status}`)
      }

      const data = await res.json()
      const normalizedGraph = data.graph ? normalizeGraphData(data.graph) : null
      addMessage({ role: 'assistant', content: data.content, graph: normalizedGraph })
      if (data.graph) setCurrentGraph({ data: normalizedGraph })
    } catch (err) {
      setError(err.message)
      get().addMessage({
        role: 'assistant',
        content: `❌ Erreur : ${err.message}`,
      })
    } finally {
      set({ isLoading: false })
    }
  },
}))

export default useChatStore
