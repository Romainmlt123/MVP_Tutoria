import { create } from 'zustand'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8001'

export const useChatStore = create((set, get) => ({
  messages: [
    {
      id: 'welcome',
      role: 'assistant',
      content: `Bonjour ! 👋 Je suis **TutorIA**, ton assistant pédagogique.

**Exemples :** Trace f(x) = x² | Dessine un triangle 3-4-5 | Cercle trigonométrique`,
    }
  ],
  currentGraph: null,
  showGraphPanel: false,
  isLoading: false,

  addMessage: (message) => set((state) => ({
    messages: [...state.messages, { ...message, id: Date.now().toString() }]
  })),

  setCurrentGraph: (graph) => set({ currentGraph: graph, showGraphPanel: !!graph }),
  closeGraphPanel: () => set({ showGraphPanel: false }),
  clearMessages: () => set((state) => ({ messages: state.messages.filter(m => m.id === 'welcome') })),
  
  sendMessage: async (text) => {
    const { messages, addMessage, setCurrentGraph } = get()
    
    addMessage({ role: 'user', content: text })
    set({ isLoading: true })
    
    const history = messages
      .filter(m => m.id !== 'welcome')
      .map(m => ({ role: m.role, content: m.content }))
    history.push({ role: 'user', content: text })
    
    try {
      const res = await fetch(`${API_URL}/api/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: history })
      })
      
      if (!res.ok) throw new Error('Erreur serveur')
      
      const data = await res.json()
      addMessage({ role: 'assistant', content: data.content })
      
      if (data.graph) setCurrentGraph({ data: data.graph })
    } catch (err) {
      addMessage({ role: 'assistant', content: '❌ Erreur: ' + err.message })
    } finally {
      set({ isLoading: false })
    }
  }
}))

export default useChatStore
