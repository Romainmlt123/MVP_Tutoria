import { useCallback, useEffect, useMemo, useState } from 'react'
import { useNavigate, useParams, useLocation } from 'react-router-dom'
import ChatPanelCore from '../components/explorer/ChatPanelCore'
import useAuthStore from '../store/authStore'
import useProfileStore from '../store/profileStore'
import useChatStore from '../store/chatStore'
import { getChapter } from '../data/curriculum'
import { buildExplorerPointContext, POINT_TYPE_LABELS } from '../lib/explorer/explorerContext'
import {
  getLevelConversationId,
  getLevelStatus,
  loadProgression,
  markLevelCompleted,
  progressionKey,
  setLevelConversation,
} from '../lib/explorer/progression'

const TYPE_ICONS = {
  lesson: 'menu_book',
  exercise: 'edit_note',
  boss: 'flag',
}

export default function ExplorerLevelDiscuss() {
  const { subjectId, chapterId, levelIndex: levelIndexParam } = useParams()
  const navigate = useNavigate()
  const location = useLocation()
  const { user } = useAuthStore()
  const { profile } = useProfileStore()

  const levelIndex = Number.parseInt(levelIndexParam, 10)
  const grade = profile?.settings?.onboarding?.grade || '2nde'
  const chapter = getChapter(subjectId, grade, chapterId)

  const progKey = useMemo(
    () => progressionKey(user?.id, subjectId, chapterId),
    [user?.id, subjectId, chapterId]
  )

  const node = useMemo(() => {
    if (!chapter?.nodes?.length || Number.isNaN(levelIndex)) return null
    return chapter.nodes[levelIndex % chapter.nodes.length]
  }, [chapter, levelIndex])

  const status = useMemo(() => {
    const progress = loadProgression(progKey)
    return getLevelStatus(levelIndex, progress)
  }, [progKey, levelIndex])

  const pathBack = `/explorer/${subjectId}/chapter/${chapterId}`

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

  const sessionContext = useMemo(() => {
    if (!node || !chapter || Number.isNaN(levelIndex)) return ''
    return buildExplorerPointContext({
      node,
      chapter,
      subjectId,
      grade,
      levelIndex,
    })
  }, [node, chapter, subjectId, grade, levelIndex])

  useEffect(() => {
    if (!node || !chapter || Number.isNaN(levelIndex)) return undefined
    if (status === 'locked') {
      navigate(pathBack, { replace: true })
      return undefined
    }

    let cancelled = false

    const init = async () => {
      setSessionContext(sessionContext)
      clearCurrentConversation()

      const savedId = getLevelConversationId(progKey, levelIndex)
      if (savedId && user?.id) {
        await loadConversation(savedId)
      } else {
        clearCurrentConversation()
        const firstName = (profile?.settings?.onboarding?.firstName || '').trim()
        const greeting = firstName
          ? `${firstName}, j'aimerais travailler ce point. Peux-tu m'expliquer ?`
          : "J'aimerais travailler ce point. Peux-tu m'expliquer ?"
        setInitialMessage(greeting)
      }

      if (!cancelled) setReady(true)
    }

    init()

    return () => {
      cancelled = true
      clearSessionContext()
    }
  }, [
    node,
    chapter,
    levelIndex,
    status,
    sessionContext,
    progKey,
    user?.id,
    profile,
    pathBack,
    navigate,
    setSessionContext,
    clearSessionContext,
    clearCurrentConversation,
    loadConversation,
  ])

  useEffect(() => {
    if (!currentConversationId || !progKey || Number.isNaN(levelIndex)) return
    setLevelConversation(progKey, levelIndex, currentConversationId)
  }, [currentConversationId, progKey, levelIndex])

  const handleSend = useCallback(
    (text) => {
      if (user?.id) sendMessage(text, user.id)
    },
    [sendMessage, user?.id]
  )

  const returnPageIndex = location.state?.returnPageIndex

  const handleBack = useCallback(() => {
    clearSessionContext()
    clearCurrentConversation()
    navigate(pathBack, {
      state: typeof returnPageIndex === 'number' ? { returnPageIndex } : undefined,
    })
  }, [clearSessionContext, clearCurrentConversation, navigate, pathBack, returnPageIndex])

  const handleComplete = useCallback(() => {
    markLevelCompleted(progKey, levelIndex)
    clearSessionContext()
    clearCurrentConversation()
    navigate(pathBack, {
      state: typeof returnPageIndex === 'number' ? { returnPageIndex } : undefined,
    })
  }, [progKey, levelIndex, clearSessionContext, clearCurrentConversation, navigate, pathBack, returnPageIndex])

  if (!chapter || !node || Number.isNaN(levelIndex)) {
    return (
      <div className="flex h-full flex-col items-center justify-center gap-4 p-6">
        <p className="text-text-secondary text-center">Point introuvable.</p>
        <button
          type="button"
          onClick={() => navigate('/explorer')}
          className="rounded-xl bg-primary px-6 py-3 font-medium text-white"
        >
          Retour aux îles
        </button>
      </div>
    )
  }

  const typeLabel = POINT_TYPE_LABELS[node.type] || node.type
  const typeIcon = TYPE_ICONS[node.type] || 'school'

  return (
    <div className="flex h-full min-h-0 flex-col overflow-hidden bg-gradient-to-b from-slate-50 via-white to-primary/[0.04] font-display text-text-primary">
      <header className="flex shrink-0 items-center gap-3 border-b border-border/80 bg-white/90 px-3 py-3 backdrop-blur-sm sm:px-4">
        <button
          type="button"
          onClick={handleBack}
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
          <h1 className="truncate text-base font-bold text-text-primary sm:text-lg">{node.title}</h1>
          <p className="truncate text-[11px] text-text-secondary sm:text-xs">{chapter.name}</p>
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
