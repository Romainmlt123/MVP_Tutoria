import { create } from 'zustand'
import { supabase } from '../lib/supabase'

const DECK_COLORS = ['blue', 'purple', 'green', 'orange', 'red', 'pink', 'teal']
const DECK_ICONS = ['calculate', 'menu_book', 'biotech', 'history_edu', 'science', 'language', 'style']

export const useFlashcardStore = create((set, get) => ({
  decks: [],
  cards: {},
  stats: null,
  decksLoading: false,
  cardsLoading: false,
  statsLoading: false,
  error: null,

  setError: (error) => set({ error }),
  clearError: () => set({ error: null }),

  fetchDecks: async (userId) => {
    if (!supabase || !userId) {
      set({ decks: [], decksLoading: false })
      return []
    }
    set({ decksLoading: true, error: null })
    const { data: decksData, error } = await supabase
      .from('flashcard_decks')
      .select('*')
      .or(`user_id.eq.${userId},user_id.is.null`)
      .order('updated_at', { ascending: false })
    const decks = error ? [] : decksData ?? []
    if (decks.length > 0) {
      const deckIds = decks.map((d) => d.id)
      const { data: cardsData } = await supabase
        .from('flashcard_cards')
        .select('deck_id')
        .in('deck_id', deckIds)
      const countByDeck = {}
      deckIds.forEach((id) => { countByDeck[id] = 0 })
      ;(cardsData ?? []).forEach((r) => { countByDeck[r.deck_id] = (countByDeck[r.deck_id] ?? 0) + 1 })
      set({ decks: decks.map((d) => ({ ...d, cardCount: countByDeck[d.id] ?? 0 })), decksLoading: false })
      return decks.map((d) => ({ ...d, cardCount: countByDeck[d.id] ?? 0 }))
    }
    set({ decks, decksLoading: false })
    return decks
  },

  fetchCards: async (deckId) => {
    if (!supabase || !deckId) {
      set((s) => ({ cards: { ...s.cards, [deckId]: [] }, cardsLoading: false }))
      return []
    }
    set((s) => ({ cardsLoading: true, cards: { ...s.cards, [deckId]: [] } }))
    const { data, error } = await supabase
      .from('flashcard_cards')
      .select('*')
      .eq('deck_id', deckId)
      .order('created_at', { ascending: true })
    set((s) => ({
      cards: { ...s.cards, [deckId]: error ? [] : data ?? [] },
      cardsLoading: false,
    }))
    return error ? [] : data ?? []
  },

  createDeck: async (userId, { name, icon = 'style', color = 'blue' }) => {
    if (!supabase || !userId) return null
    set({ error: null })
    const { data, error } = await supabase
      .from('flashcard_decks')
      .insert({ user_id: userId, name: name || 'Nouveau dossier', icon, color })
      .select()
      .single()
    if (error) {
      set({ error: error.message })
      return null
    }
    set((s) => ({ decks: [data, ...s.decks] }))
    return data
  },

  updateDeck: async (deckId, updates) => {
    if (!supabase || !deckId) return { error: { message: 'Invalid' } }
    set({ error: null })
    const payload = { ...updates, updated_at: new Date().toISOString() }
    const { data, error } = await supabase
      .from('flashcard_decks')
      .update(payload)
      .eq('id', deckId)
      .select()
      .single()
    if (!error) {
      set((s) => ({
        decks: s.decks.map((d) => (d.id === deckId ? data : d)),
      }))
    }
    return { data, error }
  },

  deleteDeck: async (deckId) => {
    if (!supabase || !deckId) return { error: { message: 'Invalid' } }
    set({ error: null })
    const { error } = await supabase.from('flashcard_decks').delete().eq('id', deckId)
    if (!error) {
      set((s) => ({
        decks: s.decks.filter((d) => d.id !== deckId),
        cards: { ...s.cards, [deckId]: undefined },
      }))
    }
    return { error }
  },

  createCard: async (deckId, { front, back, choices, correct_index }) => {
    if (!supabase || !deckId) return null
    set({ error: null })
    const payload = { deck_id: deckId, front: front || '', back: back || '' }
    if (Array.isArray(choices) && choices.length === 4) {
      payload.choices = choices
      if (typeof correct_index === 'number' && correct_index >= 0 && correct_index <= 3) payload.correct_index = correct_index
    }
    const { data, error } = await supabase
      .from('flashcard_cards')
      .insert(payload)
      .select()
      .single()
    if (error) {
      set({ error: error.message })
      return null
    }
    set((s) => ({
      cards: {
        ...s.cards,
        [deckId]: [...(s.cards[deckId] ?? []), data],
      },
    }))
    return data
  },

  updateCard: async (cardId, deckId, { front, back, choices, correct_index }) => {
    if (!supabase || !cardId) return { error: { message: 'Invalid' } }
    set({ error: null })
    const payload = { front: front ?? '', back: back ?? '' }
    if (Array.isArray(choices) && choices.length === 4) {
      payload.choices = choices
      payload.correct_index = typeof correct_index === 'number' && correct_index >= 0 && correct_index <= 3 ? correct_index : null
    } else {
      payload.choices = null
      payload.correct_index = null
    }
    const { data, error } = await supabase
      .from('flashcard_cards')
      .update(payload)
      .eq('id', cardId)
      .select()
      .single()
    if (!error && deckId) {
      set((s) => ({
        cards: {
          ...s.cards,
          [deckId]: (s.cards[deckId] ?? []).map((c) => (c.id === cardId ? data : c)),
        },
      }))
    }
    return { data, error }
  },

  deleteCard: async (cardId, deckId) => {
    if (!supabase || !cardId) return { error: { message: 'Invalid' } }
    set({ error: null })
    const { error } = await supabase.from('flashcard_cards').delete().eq('id', cardId)
    if (!error && deckId) {
      set((s) => ({
        cards: {
          ...s.cards,
          [deckId]: (s.cards[deckId] ?? []).filter((c) => c.id !== cardId),
        },
      }))
    }
    return { error }
  },

  recordReview: async (userId, cardId, correct) => {
    if (!supabase || !userId || !cardId) return { error: { message: 'Invalid' } }
    const { error } = await supabase
      .from('flashcard_reviews')
      .insert({ user_id: userId, card_id: cardId, correct: !!correct })
    if (!error) {
      const { stats } = get()
          if (stats) {
            set({
              stats: {
                ...stats,
                totalReviews: (stats.totalReviews ?? 0) + 1,
                correctReviews: (stats.correctReviews ?? 0) + (correct ? 1 : 0),
              },
            })
          }
    }
    return { error }
  },

  fetchStats: async (userId) => {
    if (!supabase || !userId) {
      set({ stats: null, statsLoading: false })
      return null
    }
    set({ statsLoading: true })
    const { data: reviews, error } = await supabase
      .from('flashcard_reviews')
      .select('id, card_id, reviewed_at, correct')
      .eq('user_id', userId)
    if (error) {
      set({ stats: null, statsLoading: false })
      return null
    }
    const list = reviews ?? []
    const now = new Date()
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
    const correctCount = list.filter((r) => r.correct).length
    const totalCount = list.length
    const accuracy = totalCount > 0 ? Math.round((correctCount / totalCount) * 100) : 0
    const last30 = list.filter((r) => new Date(r.reviewed_at) >= new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000))
    const accuracy30 = last30.length > 0 ? Math.round((last30.filter((r) => r.correct).length / last30.length) * 100) : 0
    let streak = 0
    for (let d = 0; d < 365; d++) {
      const dayStart = new Date(today)
      dayStart.setDate(dayStart.getDate() - d)
      const dayEnd = new Date(dayStart)
      dayEnd.setDate(dayEnd.getDate() + 1)
      const hasReview = list.some(
        (r) => new Date(r.reviewed_at) >= dayStart && new Date(r.reviewed_at) < dayEnd
      )
      if (hasReview) streak++
      else if (d > 0) break
    }
    const masteredThreshold = 3
    const cardCorrectCount = {}
    list.forEach((r) => {
      cardCorrectCount[r.card_id] = (cardCorrectCount[r.card_id] ?? 0) + (r.correct ? 1 : 0)
    })
    const totalMastered = Object.values(cardCorrectCount).filter((c) => c >= masteredThreshold).length
    const weekDayLabels = ['Dim', 'Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam']
    const weeklyActivity = []
    for (let i = 6; i >= 0; i--) {
      const dayStart = new Date(today)
      dayStart.setDate(dayStart.getDate() - i)
      const dayEnd = new Date(dayStart)
      dayEnd.setDate(dayEnd.getDate() + 1)
      const count = list.filter(
        (r) => new Date(r.reviewed_at) >= dayStart && new Date(r.reviewed_at) < dayEnd
      ).length
      weeklyActivity.push({ label: weekDayLabels[dayStart.getDay()], value: count })
    }
    const stats = {
      currentStreak: streak,
      totalMastered,
      accuracy: accuracy30,
      totalReviews: totalCount,
      correctReviews: correctCount,
      weeklyActivity,
    }
    set({ stats, statsLoading: false })
    return stats
  },

  getCardsForDeck: (deckId) => get().cards[deckId] ?? [],
  getDeckById: (deckId) => get().decks.find((d) => d.id === deckId),

  DECK_COLORS,
  DECK_ICONS,
}))

export default useFlashcardStore
