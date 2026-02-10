import { useState, useCallback, useEffect } from 'react'
import { Link } from 'react-router-dom'
import ChatHistory from '../components/ChatHistory'
import ChatMessage from '../components/ChatMessage'
import ChatInput from '../components/ChatInput'
import useChatStore from '../store/chatStore'
import useAuthStore from '../store/authStore'

export default function Chat() {
  const { user } = useAuthStore()
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
  } = useChatStore()

  useEffect(() => {
    if (user?.id) fetchConversations(user.id)
  }, [user?.id, fetchConversations])

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

  return (
    <div className="flex h-full w-full bg-background font-display text-text-primary antialiased overflow-hidden relative">
      {/* Fond assombri uniquement sur la zone chat (pas sur la nav) */}
      <div
        className={`fixed left-20 right-0 top-0 bottom-0 z-20 bg-black/30 transition-opacity duration-300 lg:left-64 ${
          historyOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        }`}
        aria-hidden="true"
        onClick={() => setHistoryOpen(false)}
      />
      <div
        className={`fixed left-20 top-0 bottom-0 z-30 w-[280px] transform transition-transform duration-300 ease-out lg:left-64 ${
          historyOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
        aria-modal="true"
        aria-label="Historique des conversations"
      >
        <ChatHistory
          conversations={conversations}
          currentConversationId={currentConversationId}
          onSelectConversation={handleSelectConversation}
          onNewChat={handleNewChat}
          onClose={() => setHistoryOpen(false)}
        />
      </div>

      <main className="flex-1 flex flex-col relative h-full min-w-0 bg-background flex overflow-hidden">
        {/* Mode */}
        <header className="h-20 flex items-center justify-center shrink-0 z-10 relative">
          <button
            type="button"
            onClick={() => setHistoryOpen((o) => !o)}
            className="absolute left-4 top-1/2 -translate-y-1/2 p-2 rounded-lg text-text-muted hover:text-primary hover:bg-primary/5 transition-colors"
            aria-label={historyOpen ? 'Fermer l\'historique' : 'Ouvrir l\'historique des conversations'}
            aria-expanded={historyOpen}
          >
            <span className="material-symbols-outlined text-[24px]" aria-hidden="true">menu</span>
          </button>
          <div className="bg-surface border border-border p-1 rounded-full flex shadow-sm" role="tablist" aria-label="Mode de conversation">
            <button role="tab" aria-selected="true" className="px-6 py-1.5 rounded-full bg-gradient-to-r from-primary to-accent-purple text-white text-sm font-medium shadow-sm transition-all flex items-center gap-2">
              <span className="material-symbols-outlined text-[16px]" aria-hidden="true">chat</span>
              Texte
            </button>
            <Link
              to="/voice"
              role="tab"
              aria-selected="false"
              className="px-6 py-1.5 rounded-full text-text-secondary hover:text-primary text-sm font-medium transition-all flex items-center gap-2"
            >
              <span className="material-symbols-outlined text-[16px]" aria-hidden="true">mic</span>
              Vocal
            </Link>
          </div>
          <div className="absolute right-8 top-1/2 -translate-y-1/2 flex items-center gap-2">
            <button className="p-2 text-text-muted hover:text-primary hover:bg-primary/5 rounded-lg transition-colors" aria-label="Partager la conversation">
              <span className="material-symbols-outlined text-[20px]" aria-hidden="true">ios_share</span>
            </button>
          </div>
        </header>

        {/* Zone de chat */}
        <div className="flex-1 overflow-y-auto px-4 py-6 scroll-smooth z-10 min-w-0">
          <div className="max-w-3xl mx-auto flex flex-col gap-8 pb-32">
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
            {isLoading && (
              <div className="flex items-center gap-2 text-text-secondary text-sm">
                <span className="material-symbols-outlined animate-spin text-[20px]">progress_activity</span>
                Tutor&apos;IA réfléchit...
              </div>
            )}
          </div>
        </div>

        <ChatInput onSend={handleSend} disabled={isLoading} />
      </main>
    </div>
  )
}
