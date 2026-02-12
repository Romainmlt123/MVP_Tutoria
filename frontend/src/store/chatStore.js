import { create } from 'zustand'
import { supabase } from '../lib/supabase'
import { normalizeGraphData } from '../utils/graphNormalizer'
import { buildUserContextForPrompt } from '../utils/onboardingContext'
import useProfileStore from './profileStore'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000'

function getUserContext() {
  return buildUserContextForPrompt(useProfileStore.getState().profile)
}

async function consumeStream(response, onChunk, onDone) {
  const reader = response.body.getReader()
  const decoder = new TextDecoder()
  let buffer = ''
  let fullContent = ''
  try {
    while (true) {
      const { done, value } = await reader.read()
      if (done) break
      buffer += decoder.decode(value, { stream: true })
      let idx
      while ((idx = buffer.indexOf('\n\n')) !== -1) {
        const event = buffer.slice(0, idx)
        buffer = buffer.slice(idx + 2)
        if (event.startsWith('data: ')) {
          try {
            const data = JSON.parse(event.slice(6))
            if (data.error) {
              onDone({ error: data.error })
              return
            }
            if (data.content) {
              fullContent += data.content
              onChunk(fullContent)
            }
            if (data.done) {
              onDone({ graph: data.graph, suggested_title: data.suggested_title })
              return
            }
          } catch (_) {}
        }
      }
    }
    if (buffer.startsWith('data: ')) {
      try {
        const data = JSON.parse(buffer.slice(6))
        if (data.content) {
          fullContent += data.content
          onChunk(fullContent)
        }
        if (data.done) onDone({ graph: data.graph, suggested_title: data.suggested_title })
      } catch (_) {}
    }
  } finally {
    reader.releaseLock()
  }
}

export const useChatStore = create((set, get) => ({
  conversations: [],
  currentConversationId: null,
  messages: [],
  currentGraph: null,
  showGraphPanel: false,
  graphVersion: 0,
  whiteboardContent: [],
  showWhiteboard: false,

  setWhiteboardContent: (content, action = 'append') =>
    set((state) => {
      let next = []
      if (action === 'replace') next = Array.isArray(content) ? content : [content]
      else if (action === 'clear') next = []
      else next = [...state.whiteboardContent, content].filter(Boolean)
      return { whiteboardContent: next, showWhiteboard: next.length > 0 }
    }),
  clearWhiteboard: () => set({ whiteboardContent: [], showWhiteboard: false }),
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

  updateMessageContent: (messageId, content) =>
    set((state) => ({
      messages: state.messages.map((m) =>
        m.id === messageId ? { ...m, content } : m
      ),
    })),

  sendMessage: async (text, userId) => {
    const {
      messages,
      currentConversationId,
      addMessageLocal,
      updateMessageContent,
      setCurrentGraph,
      setError,
      createConversation,
      fetchConversations,
    } = get()
    let conversationId = currentConversationId

    const history = messages.map((m) => ({ role: m.role, content: m.content }))
    history.push({ role: 'user', content: text })

    const streamAssistant = async () => {
      const assistantId = `msg-stream-${Date.now()}`
      addMessageLocal({ role: 'assistant', id: assistantId, content: '' })

      const res = await fetch(`${API_URL}/api/chat/stream`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: history, user_context: getUserContext() }),
      })

      if (!res.ok) {
        const err = await res.json().catch(() => ({}))
        throw new Error(err.detail || err.error || `Erreur ${res.status}`)
      }

      return new Promise((resolve, reject) => {
        consumeStream(
          res,
          (content) => updateMessageContent(assistantId, content),
          async (meta) => {
            if (meta?.error) {
              setError(meta.error)
              updateMessageContent(assistantId, `❌ Erreur : ${meta.error}`)
              reject(new Error(meta.error))
              return
            }
            const normalizedGraph = meta?.graph ? normalizeGraphData(meta.graph) : null
            if (normalizedGraph) setCurrentGraph({ data: normalizedGraph })
            resolve({ graph: meta?.graph, suggested_title: meta?.suggested_title })
          }
        ).catch(reject)
      })
    }

    if (!supabase) {
      addMessageLocal({ role: 'user', content: text })
      set({ isLoading: true, error: null })
      try {
        await streamAssistant()
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

    const { error: insertUserErr } = await supabase
      .from('messages')
      .insert({ conversation_id: conversationId, role: 'user', content: text })
    if (insertUserErr) {
      set({ isLoading: false, error: insertUserErr.message })
      return
    }

    try {
      const meta = await streamAssistant()
      const fullContent = get().messages.find((m) => m.id?.startsWith('msg-stream-'))?.content ?? ''
      const normalizedGraph = meta?.graph ? normalizeGraphData(meta.graph) : null

      const { data: insertedMsg, error: insertAssistErr } = await supabase
        .from('messages')
        .insert({
          conversation_id: conversationId,
          role: 'assistant',
          content: fullContent,
          graph: meta?.graph ?? null,
        })
        .select('id, role, content, graph, created_at')
        .single()

      const finalMsg = insertAssistErr
        ? { id: `msg-${Date.now()}`, role: 'assistant', content: fullContent, graph: normalizedGraph }
        : { ...insertedMsg, graph: normalizedGraph }

      set((state) => ({
        messages: state.messages.map((m) =>
          m.id?.startsWith('msg-stream-') ? finalMsg : m
        ),
      }))

      if (normalizedGraph) setCurrentGraph({ data: normalizedGraph })

      const titleUpdate = messages.length === 0
        ? (meta?.suggested_title || text.slice(0, 80) || 'Nouvelle conversation')
        : null
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
