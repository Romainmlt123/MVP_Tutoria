import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import {
  MODULE_WIDTH,
  extendPath,
  generateModule,
  pathToGrid,
  sliceGridForPage,
} from '../lib/explorer/pathGenerator'
import { findProgressPageIndex } from '../lib/explorer/decorations'
import { computeViewportGridMetrics } from '../lib/explorer/viewportGrid'
const INITIAL_MODULE_SEEDS = [1, 2, 3]
const WHEEL_DEBOUNCE_MS = 950
const EDGE_PAGE_THRESHOLD = 1

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
  const [pageIndex, setPageIndex] = useState(0)
  const [moduleSeeds, setModuleSeeds] = useState(INITIAL_MODULE_SEEDS)
  const [metrics, setMetrics] = useState(() =>
    computeViewportGridMetrics(320, 480)
  )
  const wheelLockRef = useRef(false)
  const touchStartXRef = useRef(0)
  const scrollLockedRef = useRef(false)
  const [pendingPage, setPendingPage] = useState(null)

  const measure = useCallback(() => {
    const el = containerRef.current
    if (!el || el.clientWidth <= 0 || el.clientHeight <= 0) return null
    const next = computeViewportGridMetrics(el.clientWidth, el.clientHeight)
    setMetrics(next)
    return next
  }, [])

  useEffect(() => {
    measure()
    const el = containerRef.current
    if (!el || typeof ResizeObserver === 'undefined') return undefined
    const ro = new ResizeObserver(() => measure())
    ro.observe(el)
    return () => ro.disconnect()
  }, [measure])

  const worldPath = useMemo(() => {
    let path = []
    moduleSeeds.forEach((moduleSeed, index) => {
      const { path: modulePath } = generateModule({
        width: MODULE_WIDTH,
        height: metrics.rowCount,
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
      pathToGrid(worldPath, metrics.rowCount, totalCols, {
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

  const jumpToPage = useCallback((targetPage) => {
    if (scrollLockedRef.current) return
    setPendingPage(Math.max(0, targetPage))
  }, [])

  useEffect(() => {
    if (pendingPage === null) return

    if (pendingPage <= maxPageIndex) {
      setPageIndex(pendingPage)
      setPendingPage(null)
      return
    }

    appendModule()
  }, [pendingPage, maxPageIndex, appendModule])

  useEffect(() => {
    const el = containerRef.current
    if (!el) return undefined

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
  }, [goNextPage, goPrevPage])

  const handleTouchStart = useCallback((e) => {
    touchStartXRef.current = e.touches[0].clientX
  }, [])

  const handleTouchEnd = useCallback(
    (e) => {
      if (scrollLockedRef.current) return
      const dx = e.changedTouches[0].clientX - touchStartXRef.current
      if (dx < -50) goNextPage()
      else if (dx > 50) goPrevPage()
    },
    [goNextPage, goPrevPage]
  )

  const resetToStart = useCallback(() => {
    setPageIndex(0)
    setModuleSeeds(INITIAL_MODULE_SEEDS.map((s, i) => seed + i))
  }, [seed])

  return {
    containerRef,
    pageIndex,
    pageGrid,
    metrics,
    maxPageIndex,
    progressPageIndex,
    totalCols,
    getPageGrid,
    setScrollLocked,
    goNextPage,
    goPrevPage,
    goToPage,
    jumpToPage,
    handleTouchStart,
    handleTouchEnd,
    resetToStart,
    setPageIndex,
  }
}
