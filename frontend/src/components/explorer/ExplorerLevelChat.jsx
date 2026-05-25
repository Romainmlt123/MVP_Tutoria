import { useCallback, useEffect, useState } from 'react'
import ChatPanelCore from './ChatPanelCore'
import useChatStore from '../../store/chatStore'
import useAuthStore from '../../store/authStore'
import {
  getLevelConversationId,
  markLevelCompleted,
  setLevelConversation,
} from '../../lib/explorer/progression'

const TYPE_LABELS = {
  lesson: 'Leçon',
  exercise: 'Exercice',
  boss: 'Boss',
}

const TYPE_ICONS = {
  lesson: 'menu_book',
  exercise: 'edit_note',
  boss: 'flag',
}

/**
 * @param {{
 *   open: boolean,
 *   node: { type: string, title: string },
 *   levelIndex: number,
 *   sessionContext: string,
 *   progressionKey: string,
 *   onClose: () => void,
 *   onLevelCompleted?: (levelIndex: number) => void,
 * }} props
 */
export default function ExplorerLevelChat({
  open,
  node,
  levelIndex,
  sessionContext,
  progressionKey,
  onClose,
  onLevelCompleted,
}) {
  const { user } = useAuthStore()
  const {
    messages,
    isLoading,
    error,
    sendMessage,
    setSessionContext,
    clearSessionContext,
    clearCurrentConversation,
    loadConversation,
    currentConversationId,
  } = useChatStore()

  const [initialMessage, setInitialMessage] = useState(null)
  const [ready, setReady] = useState(false)

  useEffect(() => {
    if (!open || !node) {
      setReady(false)
      return
    }

    let cancelled = false

    const init = async () => {
      setSessionContext(sessionContext)
      clearCurrentConversation()

      const savedId = getLevelConversationId(progressionKey, levelIndex)
      if (savedId && user?.id) {
        await loadConversation(savedId)
      } else {
        clearCurrentConversation()
        setInitialMessage("J'aimerais travailler ce point. Peux-tu m'expliquer ?")
      }

      if (!cancelled) setReady(true)
    }

    init()
    return () => {
      cancelled = true
    }
  }, [
    open,
    node,
    levelIndex,
    sessionContext,
    progressionKey,
    user?.id,
    setSessionContext,
    clearCurrentConversation,
    loadConversation,
  ])

  const handleClose = useCallback(() => {
    clearSessionContext()
    clearCurrentConversation()
    onClose()
  }, [clearSessionContext, clearCurrentConversation, onClose])

  useEffect(() => {
    if (!open || !currentConversationId || !progressionKey) return
    setLevelConversation(progressionKey, levelIndex, currentConversationId)
  }, [open, currentConversationId, progressionKey, levelIndex])

  const handleSend = useCallback(
    (text) => {
      if (user?.id) sendMessage(text, user.id)
    },
    [sendMessage, user?.id]
  )

  const handleComplete = useCallback(() => {
    markLevelCompleted(progressionKey, levelIndex)
    onLevelCompleted?.(levelIndex)
    handleClose()
  }, [progressionKey, levelIndex, onLevelCompleted, handleClose])

  if (!open || !node) return null

  const typeLabel = TYPE_LABELS[node.type] || node.type
  const typeIcon = TYPE_ICONS[node.type] || 'school'

  return (
    <div
      className={`fixed inset-0 z-[60] flex flex-col bg-gradient-to-b from-slate-50 via-white to-primary/[0.04] font-display text-text-primary transition-transform duration-300 ease-out ${
        open ? 'translate-x-0' : 'translate-x-full pointer-events-none'
      }`}
      style={{
        paddingTop: 'env(safe-area-inset-top, 0px)',
        paddingBottom: 'env(safe-area-inset-bottom, 0px)',
      }}
      role="dialog"
      aria-modal="true"
      aria-label={`Tutor'IA — ${node.title}`}
    >
      <header className="flex shrink-0 items-center gap-3 border-b border-border/80 bg-white/90 px-3 py-3 backdrop-blur-sm sm:px-4">
        <button
          type="button"
          onClick={handleClose}
          className="flex min-h-11 min-w-11 items-center justify-center rounded-xl text-text-secondary transition-colors hover:bg-primary/5 hover:text-primary"
          aria-label="Retour au parcours"
        >
          <span className="material-symbols-outlined text-[24px]">arrow_back</span>
        </button>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wide text-primary">
            <span className="material-symbols-outlined text-[16px]">{typeIcon}</span>
            {typeLabel}
          </div>
          <h2 className="truncate text-base font-bold text-text-primary sm:text-lg">{node.title}</h2>
        </div>
        <button
          type="button"
          onClick={handleComplete}
          className="shrink-0 rounded-xl bg-primary px-3 py-2 text-xs font-semibold text-white shadow-sm transition hover:opacity-90 sm:text-sm"
        >
          Terminé
        </button>
      </header>

      {ready ? (
        <ChatPanelCore
          messages={messages}
          isLoading={isLoading}
          error={error}
          onSend={handleSend}
          initialMessage={initialMessage}
          onInitialMessageConsumed={() => setInitialMessage(null)}
          className="flex-1"
        />
      ) : (
        <div className="flex flex-1 items-center justify-center text-text-secondary">
          <span className="material-symbols-outlined animate-spin text-[28px]">progress_activity</span>
        </div>
      )}
    </div>
  )
}
