import { useState, useCallback, useEffect, useRef } from 'react'
import { Link, useLocation } from 'react-router-dom'
import ChatHistory from '../components/ChatHistory'
import ChatMessage from '../components/ChatMessage'
import ChatInput from '../components/ChatInput'
import useChatStore from '../store/chatStore'
import useAuthStore from '../store/authStore'

export default function Chat() {
  const { user } = useAuthStore()
  const location = useLocation()
  const [historyOpen, setHistoryOpen] = useState(false)
  const {
    conversations,
    currentConversationId,
    messages,
    sendMessage,
    isLoading,
    error,
    clearCurrentConversation,
    fetchConversations,
    loadConversation,
    setSessionContext,
  } = useChatStore()

  const [initialMessage, setInitialMessage] = useState(null)

  useEffect(() => {
    if (user?.id) fetchConversations(user.id)
  }, [user?.id, fetchConversations])

  // Ouvrir une conversation depuis la Home (état passé au lien)
  useEffect(() => {
    const openId = location.state?.openConversationId
    if (openId && user?.id) loadConversation(openId)
  }, [location.state?.openConversationId, user?.id, loadConversation])

  // Contexte Explorer : ouvrir le chat avec un contexte pré-rempli
  useEffect(() => {
    const explorerContext = location.state?.explorerContext
    if (explorerContext) {
      setSessionContext(explorerContext)
      clearCurrentConversation()
      setInitialMessage("J'aimerais apprendre ce chapitre. Peux-tu m'expliquer ?")
      window.history.replaceState({}, '', location.pathname)
    }
  }, [location.state?.explorerContext, setSessionContext, clearCurrentConversation])

  const handleSend = useCallback(
    (text) => {
      if (user?.id) sendMessage(text, user.id)
    },
    [sendMessage, user?.id]
  )

  const handleNewChat = useCallback(() => {
    clearCurrentConversation()
    setHistoryOpen(false)
  }, [clearCurrentConversation])

  const handleSelectConversation = useCallback(
    (id) => {
      loadConversation(id)
      setHistoryOpen(false)
    },
    [loadConversation]
  )

  const scrollRef = useRef(null)
  useEffect(() => {
    if (isLoading && scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [messages, isLoading])

  return (
    <div className="flex h-full min-h-0 w-full flex-col bg-gradient-to-b from-slate-50 via-white to-primary/[0.04] font-display text-text-primary antialiased overflow-hidden relative">
      {/* Overlay + tiroir : uniquement sur mobile (sur desktop l'historique est dans la sidebar) */}
      <div
        className={`fixed left-0 right-0 top-0 z-20 bg-black/30 transition-opacity duration-300 lg:hidden bottom-[calc(5rem+env(safe-area-inset-bottom,0px))] ${
          historyOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        }`}
        aria-hidden="true"
        onClick={() => setHistoryOpen(false)}
      />
      <div
        className={`fixed left-0 top-0 z-30 w-full max-w-[min(100%,320px)] transform transition-transform duration-300 ease-out lg:hidden bottom-[calc(5rem+env(safe-area-inset-bottom,0px))] ${
          historyOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
        aria-modal="true"
        aria-label="Historique des conversations (mobile)"
      >
        <ChatHistory
          conversations={conversations}
          currentConversationId={currentConversationId}
          onSelectConversation={handleSelectConversation}
          onNewChat={handleNewChat}
          onClose={() => setHistoryOpen(false)}
        />
      </div>

      <main className="flex min-h-0 flex-1 flex-col relative h-full min-w-0 overflow-hidden">
        {/* Mode */}
        <header className="min-h-[4.5rem] h-auto py-2 flex items-center justify-center shrink-0 z-10 relative px-2">
          <button
            type="button"
            onClick={() => setHistoryOpen((o) => !o)}
            className="absolute left-2 sm:left-4 top-1/2 -translate-y-1/2 p-2.5 min-h-[44px] min-w-[44px] rounded-lg text-text-muted hover:text-primary hover:bg-primary/5 transition-colors lg:hidden touch-manipulation"
            aria-label={historyOpen ? 'Fermer l\'historique' : 'Ouvrir l\'historique des conversations'}
            aria-expanded={historyOpen}
          >
            <span className="material-symbols-outlined text-[24px]" aria-hidden="true">menu</span>
          </button>
          <div
            className="inline-flex bg-surface/95 border border-border p-0.5 rounded-2xl shadow-sm max-w-[min(100%,300px)] backdrop-blur-sm"
            role="tablist"
            aria-label="Mode de conversation"
          >
            <span
              role="tab"
              aria-selected="true"
              className="px-4 sm:px-5 py-2 min-h-[40px] rounded-[0.875rem] bg-gradient-to-r from-primary to-accent-purple text-white text-xs sm:text-sm font-semibold shadow-inner flex items-center justify-center gap-1.5 select-none"
            >
              <span className="material-symbols-outlined text-[18px]" aria-hidden="true">
                chat
              </span>
              Texte
            </span>
            <Link
              to="/voice"
              role="tab"
              aria-selected="false"
              className="px-4 sm:px-5 py-2 min-h-[40px] rounded-[0.875rem] text-text-secondary hover:text-primary hover:bg-primary/5 text-xs sm:text-sm font-medium transition-colors flex items-center justify-center gap-1.5 touch-manipulation"
            >
              <span className="material-symbols-outlined text-[18px]" aria-hidden="true">
                mic
              </span>
              Vocal
            </Link>
          </div>
          <div className="absolute right-2 sm:right-8 top-1/2 -translate-y-1/2 flex items-center gap-1">
            <button type="button" className="p-2.5 min-h-[44px] min-w-[44px] text-text-muted hover:text-primary hover:bg-primary/5 rounded-lg transition-colors touch-manipulation" aria-label="Partager la conversation">
              <span className="material-symbols-outlined text-[20px]" aria-hidden="true">ios_share</span>
            </button>
          </div>
        </header>

        {/* Zone de chat */}
        <div ref={scrollRef} className="flex-1 min-h-0 overflow-y-auto px-3 sm:px-4 py-4 sm:py-6 scroll-smooth z-10 min-w-0 bg-transparent overscroll-y-contain">
          <div className="max-w-3xl mx-auto flex flex-col gap-6 sm:gap-8 pb-40 sm:pb-44 lg:pb-36">
            {error && (
              <div className="rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-red-700 text-sm flex items-center gap-2">
                <span className="material-symbols-outlined text-[20px]">error</span>
                {error}
              </div>
            )}
            {messages.length > 0 && (
              <div className="flex justify-center">
                <span className="text-xs font-medium text-text-muted bg-surface px-3 py-1 rounded-full border border-border shadow-sm">
                  {new Date().toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' })}
                </span>
              </div>
            )}
            {messages.map((msg) => (
              <ChatMessage key={msg.id} message={msg} />
            ))}
            {isLoading && (messages.length === 0 || messages[messages.length - 1].role === 'user') && (
              <div className="flex items-center gap-2 text-text-secondary text-sm">
                <span className="material-symbols-outlined animate-spin text-[20px]">progress_activity</span>
                Tutor&apos;IA réfléchit...
              </div>
            )}
          </div>
        </div>

        <ChatInput
          onSend={handleSend}
          disabled={isLoading}
          initialMessage={initialMessage}
          onInitialMessageConsumed={() => setInitialMessage(null)}
        />
      </main>
    </div>
  )
}
