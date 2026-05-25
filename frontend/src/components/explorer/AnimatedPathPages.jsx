import { useEffect, useRef, useState } from 'react'
import LevelMap from '../LevelMap'

export const PAGE_TRANSITION_MS = 900

function PagePanel({ grid, pageIndex, pageCols, ...levelMapProps }) {
  return (
    <div className="h-full w-1/2 shrink-0">
      <LevelMap
        {...levelMapProps}
        grid={grid}
        pageStartCol={pageIndex * pageCols}
        showNavHints={false}
      />
    </div>
  )
}

/**
 * Transition horizontale lente entre deux pages du parcours.
 */
export default function AnimatedPathPages({
  pageIndex,
  getPageGrid,
  pageCols,
  setScrollLocked,
  onPrevPage,
  onNextPage,
  ...levelMapProps
}) {
  const [settledIndex, setSettledIndex] = useState(pageIndex)
  const [transition, setTransition] = useState(null)
  const [offsetPercent, setOffsetPercent] = useState(0)
  const animatingRef = useRef(false)

  useEffect(() => {
    if (pageIndex === settledIndex || animatingRef.current) return

    animatingRef.current = true
    const direction = pageIndex > settledIndex ? 1 : -1
    setTransition({ from: settledIndex, to: pageIndex, direction })
    setScrollLocked?.(true)

    setOffsetPercent(direction === 1 ? 0 : -50)

    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        setOffsetPercent(direction === 1 ? -50 : 0)
      })
    })
  }, [pageIndex, settledIndex, setScrollLocked])

  const handleTransitionEnd = (event) => {
    if (event.propertyName !== 'transform' || !transition) return

    setSettledIndex(transition.to)
    setTransition(null)
    setOffsetPercent(0)
    animatingRef.current = false
    setScrollLocked?.(false)
  }

  if (!transition) {
    const grid = getPageGrid(settledIndex)
    if (!grid?.length) return null

    return (
      <LevelMap
        {...levelMapProps}
        grid={grid}
        pageStartCol={settledIndex * pageCols}
        onPrevPage={onPrevPage}
        onNextPage={onNextPage}
        showNavHints
      />
    )
  }

  const fromGrid = getPageGrid(transition.from)
  const toGrid = getPageGrid(transition.to)
  if (!fromGrid?.length || !toGrid?.length) return null

  const isNext = transition.direction === 1

  return (
    <div className="relative h-full w-full overflow-hidden bg-[#70ad42]">
      <button
        type="button"
        onClick={onPrevPage}
        className="absolute left-2 top-1/2 z-20 hidden h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full bg-black/25 text-white shadow-md backdrop-blur-sm transition hover:bg-black/35 lg:flex"
        aria-label="Page précédente"
      >
        <span className="material-symbols-outlined text-[36px]">chevron_left</span>
      </button>
      <button
        type="button"
        onClick={onNextPage}
        className="absolute right-2 top-1/2 z-20 hidden h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full bg-black/25 text-white shadow-md backdrop-blur-sm transition hover:bg-black/35 lg:flex"
        aria-label="Page suivante"
      >
        <span className="material-symbols-outlined text-[36px]">chevron_right</span>
      </button>

      <div
        className="flex h-full"
        style={{
          width: '200%',
          transform: `translateX(${offsetPercent}%)`,
          transition: `transform ${PAGE_TRANSITION_MS}ms cubic-bezier(0.45, 0.05, 0.25, 1)`,
        }}
        onTransitionEnd={handleTransitionEnd}
      >
        {isNext ? (
          <>
            <PagePanel grid={fromGrid} pageIndex={transition.from} pageCols={pageCols} {...levelMapProps} />
            <PagePanel grid={toGrid} pageIndex={transition.to} pageCols={pageCols} {...levelMapProps} />
          </>
        ) : (
          <>
            <PagePanel grid={toGrid} pageIndex={transition.to} pageCols={pageCols} {...levelMapProps} />
            <PagePanel grid={fromGrid} pageIndex={transition.from} pageCols={pageCols} {...levelMapProps} />
          </>
        )}
      </div>
    </div>
  )
}
