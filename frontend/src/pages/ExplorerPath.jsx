import { useCallback, useEffect, useMemo, useState } from 'react'
import { useLocation, useParams, useNavigate } from 'react-router-dom'
import { getChapter } from '../data/curriculum'
import useProfileStore from '../store/profileStore'
import useAuthStore from '../store/authStore'
import LevelMap from '../components/LevelMap'
import { usePathPagination } from '../hooks/usePathPagination'
import {
  getLevelStatus,
  loadProgression,
  progressionKey,
} from '../lib/explorer/progression'

export default function ExplorerPath() {
  const { subjectId, chapterId } = useParams()
  const navigate = useNavigate()
  const location = useLocation()
  const { profile } = useProfileStore()
  const { user } = useAuthStore()

  const grade = profile?.settings?.onboarding?.grade || '2nde'
  const chapter = getChapter(subjectId, grade, chapterId)

  const progKey = useMemo(
    () => progressionKey(user?.id, subjectId, chapterId),
    [user?.id, subjectId, chapterId]
  )

  const [progress, setProgress] = useState(() => loadProgression(progKey))

  useEffect(() => {
    setProgress(loadProgression(progKey))
  }, [progKey, location.key])

  const getLevelStatusForGrid = useCallback(
    (levelIndex) => getLevelStatus(levelIndex, progress),
    [progress]
  )

  const chapterSeed = useMemo(() => {
    let h = 0
    const s = `${subjectId}-${chapterId}`
    for (let i = 0; i < s.length; i += 1) h = (h * 31 + s.charCodeAt(i)) | 0
    return Math.abs(h) % 10000 || 1
  }, [subjectId, chapterId])

  const {
    containerRef,
    pageIndex,
    pageGrid,
    metrics,
    goNextPage,
    goPrevPage,
    handleTouchStart,
    handleTouchEnd,
    setPageIndex,
  } = usePathPagination({
    nodes: chapter?.nodes ?? [],
    getLevelStatus: getLevelStatusForGrid,
    seed: chapterSeed,
  })

  useEffect(() => {
    const returnPage = location.state?.returnPageIndex
    if (typeof returnPage === 'number' && returnPage >= 0) {
      setPageIndex(returnPage)
      window.history.replaceState({}, '', location.pathname)
    }
  }, [location.state?.returnPageIndex, location.pathname, setPageIndex])

  const handleLevelClick = useCallback(
    ({ node, cell }) => {
      if (cell.status === 'locked' || cell.levelIndex === undefined) return
      navigate(`/explorer/${subjectId}/chapter/${chapterId}/level/${cell.levelIndex}`, {
        state: { returnPageIndex: pageIndex },
      })
    },
    [navigate, subjectId, chapterId, pageIndex]
  )

  if (!chapter) {
    return (
      <div className="flex h-full min-h-0 flex-col items-center justify-center bg-gradient-to-b from-sky-100 to-white p-6">
        <p className="text-text-secondary text-center mb-6">Chapitre introuvable.</p>
        <button
          type="button"
          onClick={() => navigate('/explorer')}
          className="px-6 py-3 rounded-xl bg-primary text-white font-medium"
        >
          Retour aux îles
        </button>
      </div>
    )
  }

  const displayPage = pageIndex + 1

  return (
    <div className="relative flex h-full min-h-0 flex-col overflow-hidden bg-[#70ad42] font-display text-text-primary">
      <header className="pointer-events-none absolute left-0 right-0 top-0 z-20 flex items-start justify-between gap-2 px-3 pt-[max(0.75rem,env(safe-area-inset-top,0px))]">
        <button
          type="button"
          onClick={() => navigate('/explorer')}
          className="pointer-events-auto flex min-h-11 items-center gap-1.5 rounded-full bg-white/90 px-3 py-2 text-sm font-semibold text-text-secondary shadow-md backdrop-blur transition-colors hover:text-primary"
          aria-label="Retour aux îles"
        >
          <span className="material-symbols-outlined text-[20px]">arrow_back</span>
          <span className="hidden sm:inline">Îles</span>
        </button>

        <div className="pointer-events-auto flex max-w-[min(72vw,24rem)] flex-col items-end gap-1">
          <div className="rounded-2xl bg-white/90 px-4 py-2 text-right shadow-md backdrop-blur">
            <h1 className="truncate text-sm font-bold text-text-primary sm:text-base">{chapter.name}</h1>
            <p className="text-[11px] font-medium text-text-secondary sm:text-xs">
              Page {displayPage} · swipe ou molette
            </p>
          </div>
          <div
            className="flex flex-wrap justify-end gap-1.5 rounded-xl bg-white/85 px-2 py-1.5 text-[10px] font-medium shadow-sm backdrop-blur sm:text-[11px]"
            aria-label="Légende des niveaux"
          >
            <span className="inline-flex items-center gap-1 text-blue-700">
              <span className="h-2.5 w-2.5 rounded-sm bg-blue-500" /> Leçon
            </span>
            <span className="inline-flex items-center gap-1 text-green-700">
              <span className="h-2.5 w-2.5 rounded-sm bg-green-500" /> Exercice
            </span>
            <span className="inline-flex items-center gap-1 text-red-700">
              <span className="h-2.5 w-2.5 rounded-sm bg-red-500" /> Boss
            </span>
            <span className="inline-flex items-center gap-1 text-slate-500">
              <span className="h-2.5 w-2.5 rounded-sm bg-slate-400" /> Verrouillé
            </span>
          </div>
        </div>
      </header>

      <div
        ref={containerRef}
        className="relative min-h-0 flex-1 overflow-hidden"
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
      >
        <LevelMap
          grid={pageGrid}
          cellSize={metrics.cellSize}
          gridWidth={metrics.gridWidth}
          gridHeight={metrics.gridHeight}
          nodes={chapter.nodes}
          onLevelClick={handleLevelClick}
          onPrevPage={goPrevPage}
          onNextPage={goNextPage}
        />
      </div>
    </div>
  )
}
