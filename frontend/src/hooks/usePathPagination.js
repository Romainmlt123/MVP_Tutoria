import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import {
  MODULE_WIDTH,
  extendPath,
  generateModule,
  pathToGrid,
  sliceGridForPage,
} from '../lib/explorer/pathGenerator'
import { findProgressCol, findProgressPageIndex } from '../lib/explorer/decorations'
import {
  computeStripMetrics,
  computeViewportGridMetrics,
} from '../lib/explorer/viewportGrid'

const INITIAL_MODULE_SEEDS = [1, 2, 3]
const WHEEL_DEBOUNCE_MS = 950
const EDGE_PAGE_THRESHOLD = 1
const STRIP_MODE_MQL = '(max-width: 1023px)'

/**
 * @param {{
 *   nodes?: Array<{ type: string }>,
 *   getLevelStatus?: (levelIndex: number) => 'locked' | 'unlocked' | 'completed',
 *   seed?: number,
 * }} options
 */
export function usePathPagination(options = {}) {
  const { nodes = [], getLevelStatus, seed = 1 } = options
  const containerRef = useRef(null)
  const stripScrollRef = useRef(null)
  const [pageIndex, setPageIndex] = useState(0)
  const [moduleSeeds, setModuleSeeds] = useState(INITIAL_MODULE_SEEDS)
  const [metrics, setMetrics] = useState(() =>
    computeViewportGridMetrics(320, 480)
  )
  const [isStripMode, setIsStripMode] = useState(false)
  const [scrollCenterCol, setScrollCenterCol] = useState(0)
  const [scrollTarget, setScrollTarget] = useState(null)
  const wheelLockRef = useRef(false)
  const touchStartXRef = useRef(0)
  const scrollLockedRef = useRef(false)
  const [pendingPage, setPendingPage] = useState(null)

  useEffect(() => {
    const mql = window.matchMedia(STRIP_MODE_MQL)
    const update = () => setIsStripMode(mql.matches)
    update()
    mql.addEventListener('change', update)
    return () => mql.removeEventListener('change', update)
  }, [])

  const worldPath = useMemo(() => {
    let path = []
    moduleSeeds.forEach((moduleSeed, index) => {
      const { path: modulePath } = generateModule({
        width: MODULE_WIDTH,
        height: metrics.rowCount || 5,
        seed: moduleSeed + seed * 100,
      })
      path = extendPath(path, modulePath, index * MODULE_WIDTH)
    })
    return path
  }, [moduleSeeds, metrics.rowCount, seed])

  const totalCols = useMemo(() => {
    if (!worldPath.length) return MODULE_WIDTH * moduleSeeds.length
    return worldPath[worldPath.length - 1].col + 1
  }, [worldPath, moduleSeeds.length])

  const fullGrid = useMemo(
    () =>
      pathToGrid(worldPath, metrics.rowCount || 5, totalCols, {
        nodes,
        getLevelStatus,
      }),
    [worldPath, metrics.rowCount, totalCols, nodes, getLevelStatus]
  )

  const maxPageIndex = Math.max(0, Math.ceil(totalCols / metrics.pageCols) - 1)

  const pageGrid = useMemo(() => {
    const startCol = pageIndex * metrics.pageCols
    return sliceGridForPage(fullGrid, startCol, metrics.pageCols)
  }, [fullGrid, pageIndex, metrics.pageCols])

  const progressPageIndex = useMemo(
    () => findProgressPageIndex(fullGrid, metrics.pageCols),
    [fullGrid, metrics.pageCols]
  )

  const progressCol = useMemo(() => findProgressCol(fullGrid), [fullGrid])

  const getPageGrid = useCallback(
    (index) => {
      const startCol = index * metrics.pageCols
      return sliceGridForPage(fullGrid, startCol, metrics.pageCols)
    },
    [fullGrid, metrics.pageCols]
  )

  const setScrollLocked = useCallback((locked) => {
    scrollLockedRef.current = locked
  }, [])

  const measure = useCallback(() => {
    const el = containerRef.current
    if (!el || el.clientWidth <= 0 || el.clientHeight <= 0) return null

    const strip = window.matchMedia(STRIP_MODE_MQL).matches
    if (strip) {
      const next = computeStripMetrics(el.clientHeight, totalCols)
      setMetrics(next)
      return next
    }

    const next = computeViewportGridMetrics(el.clientWidth, el.clientHeight)
    setMetrics(next)
    return next
  }, [totalCols])

  useEffect(() => {
    measure()
  }, [isStripMode, measure, totalCols])

  useEffect(() => {
    const el = containerRef.current
    if (!el || typeof ResizeObserver === 'undefined') return undefined
    const ro = new ResizeObserver(() => measure())
    ro.observe(el)
    return () => ro.disconnect()
  }, [measure])

  const pagesPerModule = Math.max(1, Math.ceil(MODULE_WIDTH / metrics.pageCols))

  const appendModule = useCallback(() => {
    setModuleSeeds((seeds) => {
      const last = seeds[seeds.length - 1] ?? seed
      return [...seeds, last + 997]
    })
  }, [seed])

  const prependModule = useCallback(() => {
    setModuleSeeds((seeds) => [seeds[0] - 997, ...seeds])
    setPageIndex((p) => p + pagesPerModule)
  }, [pagesPerModule])

  const goToPage = useCallback(
    (nextIndex) => {
      setPageIndex((current) => {
        const clamped = Math.max(0, Math.min(maxPageIndex, nextIndex))
        if (clamped >= maxPageIndex - EDGE_PAGE_THRESHOLD) appendModule()
        if (clamped <= EDGE_PAGE_THRESHOLD) prependModule()
        return clamped
      })
    },
    [maxPageIndex, appendModule, prependModule]
  )

  const goNextPage = useCallback(() => {
    if (scrollLockedRef.current) return
    setPageIndex((p) => {
      const next = Math.min(maxPageIndex, p + 1)
      if (next >= maxPageIndex - EDGE_PAGE_THRESHOLD) appendModule()
      return next
    })
  }, [maxPageIndex, appendModule])

  const goPrevPage = useCallback(() => {
    if (scrollLockedRef.current) return
    setPageIndex((p) => {
      const next = Math.max(0, p - 1)
      if (next <= EDGE_PAGE_THRESHOLD) prependModule()
      return next
    })
  }, [prependModule])

  const jumpToPage = useCallback(
    (targetPage) => {
      if (scrollLockedRef.current) return

      if (isStripMode) {
        const col = Math.min(progressCol, Math.max(0, targetPage * metrics.pageCols))
        setScrollTarget({ col, behavior: 'smooth', key: Date.now() })
        setScrollCenterCol(col)
        setPageIndex(targetPage)
        return
      }

      setPendingPage(Math.max(0, targetPage))
    },
    [isStripMode, progressCol, metrics.pageCols]
  )

  const jumpToProgress = useCallback(() => {
    if (isStripMode) {
      setScrollTarget({ col: progressCol, behavior: 'smooth', key: Date.now() })
      setScrollCenterCol(progressCol)
      setPageIndex(progressPageIndex)
      return
    }
    jumpToPage(progressPageIndex)
  }, [isStripMode, progressCol, progressPageIndex, jumpToPage])

  useEffect(() => {
    if (pendingPage === null || isStripMode) return

    if (pendingPage <= maxPageIndex) {
      setPageIndex(pendingPage)
      setPendingPage(null)
      return
    }

    appendModule()
  }, [pendingPage, maxPageIndex, appendModule, isStripMode])

  const handleStripScroll = useCallback(() => {
    const el = stripScrollRef.current
    if (!el || !metrics.cellSize) return

    const { scrollLeft, clientWidth } = el
    const centerCol = Math.floor((scrollLeft + clientWidth / 2) / metrics.cellSize)
    setScrollCenterCol(centerCol)
    setPageIndex(Math.max(0, Math.min(maxPageIndex, Math.floor(centerCol / metrics.pageCols))))

    const scrollRight = scrollLeft + clientWidth
    const totalWidth = totalCols * metrics.cellSize
    if (scrollRight >= totalWidth - clientWidth * 0.35) {
      appendModule()
    }
  }, [metrics.cellSize, metrics.pageCols, totalCols, maxPageIndex, appendModule])

  useEffect(() => {
    if (!isStripMode) return undefined

    const el = stripScrollRef.current
    if (!el) return undefined

    handleStripScroll()
    return undefined
  }, [isStripMode, metrics.gridWidth, handleStripScroll])

  useEffect(() => {
    const el = containerRef.current
    if (!el || isStripMode) return undefined

    const onWheel = (event) => {
      if (scrollLockedRef.current) return
      if (Math.abs(event.deltaY) <= Math.abs(event.deltaX)) return
      event.preventDefault()
      if (wheelLockRef.current) return
      wheelLockRef.current = true
      if (event.deltaY > 0) goNextPage()
      else goPrevPage()
      window.setTimeout(() => {
        wheelLockRef.current = false
      }, WHEEL_DEBOUNCE_MS)
    }

    el.addEventListener('wheel', onWheel, { passive: false })
    return () => el.removeEventListener('wheel', onWheel)
  }, [goNextPage, goPrevPage, isStripMode])

  const handleTouchStart = useCallback(
    (e) => {
      if (isStripMode) return
      touchStartXRef.current = e.touches[0].clientX
    },
    [isStripMode]
  )

  const handleTouchEnd = useCallback(
    (e) => {
      if (isStripMode || scrollLockedRef.current) return
      const dx = e.changedTouches[0].clientX - touchStartXRef.current
      if (dx < -50) goNextPage()
      else if (dx > 50) goPrevPage()
    },
    [isStripMode, goNextPage, goPrevPage]
  )

  const resetToStart = useCallback(() => {
    setPageIndex(0)
    setModuleSeeds(INITIAL_MODULE_SEEDS.map((s, i) => seed + i))
    if (isStripMode) {
      setScrollTarget({ col: 0, behavior: 'auto', key: Date.now() })
      setScrollCenterCol(0)
    }
  }, [seed, isStripMode])

  const isAwayFromProgress = isStripMode
    ? Math.abs(scrollCenterCol - progressCol) > Math.max(2, Math.floor(metrics.pageCols / 2))
    : pageIndex !== progressPageIndex

  return {
    containerRef,
    stripScrollRef,
    pageIndex,
    pageGrid,
    fullGrid,
    metrics,
    maxPageIndex,
    progressPageIndex,
    progressCol,
    isStripMode,
    isAwayFromProgress,
    scrollTarget,
    totalCols,
    getPageGrid,
    setScrollLocked,
    goNextPage,
    goPrevPage,
    goToPage,
    jumpToPage,
    jumpToProgress,
    handleStripScroll,
    handleTouchStart,
    handleTouchEnd,
    resetToStart,
    setPageIndex,
    setScrollTarget,
  }
}
