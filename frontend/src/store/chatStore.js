import { create } from 'zustand'
import { supabase } from '../lib/supabase'
import { normalizeGraphData } from '../utils/graphNormalizer'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000'

export const useChatStore = create((set, get) => ({
  conversations: [],
  currentConversationId: null,
  messages: [],
  currentGraph: null,
  showGraphPanel: false,
  graphVersion: 0,
  isLoading: false,
  error: null,
  conversationsLoading: false,

  setCurrentGraph: (graph) =>
    set((state) => ({
      currentGraph: graph,
      showGraphPanel: !!graph,
      graphVersion: (state.graphVersion || 0) + 1,
    })),

  closeGraphPanel: () => set({ showGraphPanel: false }),

  setError: (error) => set({ error }),
  clearError: () => set({ error: null }),

  fetchConversations: async (userId) => {
    if (!supabase || !userId) {
      set({ conversations: [] })
      return []
    }
    set({ conversationsLoading: true })
    const { data, error } = await supabase
      .from('conversations')
      .select('id, title, created_at, updated_at')
      .eq('user_id', userId)
      .order('updated_at', { ascending: false })
    set({ conversations: error ? [] : data ?? [], conversationsLoading: false })
    return error ? [] : data ?? []
  },

  createConversation: async (userId) => {
    if (!supabase || !userId) return null
    const { data, error } = await supabase
      .from('conversations')
      .insert({ user_id: userId, title: 'Nouvelle conversation' })
      .select('id, title, created_at, updated_at')
      .single()
    if (error) return null
    set((state) => ({
      conversations: [data, ...state.conversations],
      currentConversationId: data.id,
      messages: [],
    }))
    return data
  },

  loadConversation: async (conversationId) => {
    if (!supabase || !conversationId) {
      set({ currentConversationId: null, messages: [] })
      return
    }
    set({ currentConversationId: conversationId, isLoading: true, error: null })
    const { data, error } = await supabase
      .from('messages')
      .select('id, role, content, graph, created_at')
      .eq('conversation_id', conversationId)
      .order('created_at', { ascending: true })
    const list = error ? [] : data ?? []
    const normalized = list.map((m) => ({
      ...m,
      graph: m.graph ? normalizeGraphData(m.graph) : null,
    }))
    set({ messages: normalized, isLoading: false })
  },

  clearCurrentConversation: () =>
    set({ currentConversationId: null, messages: [], error: null }),

  addMessageLocal: (message) =>
    set((state) => ({
      messages: [
        ...state.messages,
        { ...message, id: message.id || `msg-${Date.now()}` },
      ],
    })),

  sendMessage: async (text, userId) => {
    const { messages, currentConversationId, addMessageLocal, setCurrentGraph, setError, createConversation, fetchConversations } = get()
    let conversationId = currentConversationId

    if (!supabase) {
      addMessageLocal({ role: 'user', content: text })
      set({ isLoading: true, error: null })
      const history = messages.map((m) => ({ role: m.role, content: m.content }))
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
        addMessageLocal({ role: 'assistant', content: data.content, graph: normalizedGraph })
        if (normalizedGraph) get().setCurrentGraph({ data: normalizedGraph })
      } catch (err) {
        setError(err.message)
        get().addMessageLocal({ role: 'assistant', content: `❌ Erreur : ${err.message}` })
      } finally {
        set({ isLoading: false })
      }
      return
    }

    if (!userId) {
      setError('Non connecté.')
      return
    }

    if (!conversationId) {
      const newConv = await createConversation(userId)
      conversationId = newConv?.id
      if (!conversationId) {
        setError('Impossible de créer la conversation.')
        return
      }
    }

    addMessageLocal({ role: 'user', content: text })
    set({ isLoading: true, error: null })

    const history = messages.map((m) => ({ role: m.role, content: m.content }))
    history.push({ role: 'user', content: text })

    const { error: insertUserErr } = await supabase
      .from('messages')
      .insert({ conversation_id: conversationId, role: 'user', content: text })
    if (insertUserErr) {
      set({ isLoading: false, error: insertUserErr.message })
      return
    }

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

      const { data: insertedMsg, error: insertAssistErr } = await supabase
        .from('messages')
        .insert({
          conversation_id: conversationId,
          role: 'assistant',
          content: data.content,
          graph: data.graph ?? null,
        })
        .select('id, role, content, graph, created_at')
        .single()

      if (insertAssistErr) {
        addMessageLocal({ role: 'assistant', content: data.content, graph: normalizedGraph })
      } else {
        addMessageLocal({
          ...insertedMsg,
          graph: insertedMsg?.graph ? normalizeGraphData(insertedMsg.graph) : null,
        })
      }

      if (normalizedGraph) setCurrentGraph({ data: normalizedGraph })

      const titleUpdate = messages.length === 0 ? (text.slice(0, 80) || 'Nouvelle conversation') : null
      if (titleUpdate) {
        await supabase
          .from('conversations')
          .update({ title: titleUpdate, updated_at: new Date().toISOString() })
          .eq('id', conversationId)
        await fetchConversations(userId)
      } else {
        await supabase
          .from('conversations')
          .update({ updated_at: new Date().toISOString() })
          .eq('id', conversationId)
        set((state) => ({
          conversations: state.conversations.map((c) =>
            c.id === conversationId ? { ...c, updated_at: new Date().toISOString() } : c
          ),
        }))
      }
    } catch (err) {
      setError(err.message)
      get().addMessageLocal({
        role: 'assistant',
        content: `❌ Erreur : ${err.message}`,
      })
    } finally {
      set({ isLoading: false })
    }
  },
}))

export default useChatStore
