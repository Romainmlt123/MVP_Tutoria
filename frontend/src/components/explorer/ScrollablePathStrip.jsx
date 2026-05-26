import { useEffect } from 'react'
import LevelMap from '../LevelMap'

/**
 * Parcours en bande horizontale (scroll libre au doigt sur mobile).
 */
export default function ScrollablePathStrip({
  scrollRef,
  fullGrid,
  metrics,
  scrollTarget,
  onScroll,
  ...levelMapProps
}) {
  useEffect(() => {
    const el = scrollRef?.current
    if (!el || scrollTarget == null) return

    const cellSize = metrics.cellSize
    const targetLeft = Math.max(
      0,
      scrollTarget.col * cellSize - el.clientWidth / 2 + cellSize / 2
    )
    el.scrollTo({
      left: targetLeft,
      behavior: scrollTarget.behavior ?? 'smooth',
    })
  }, [scrollTarget, scrollRef, metrics.cellSize])

  if (!fullGrid?.length || !fullGrid[0]?.length) return null

  return (
    <div
      ref={scrollRef}
      className="h-full w-full overflow-x-auto overflow-y-hidden overscroll-x-contain touch-pan-x"
      style={{ WebkitOverflowScrolling: 'touch' }}
      onScroll={onScroll}
      role="region"
      aria-label="Parcours — faire glisser horizontalement"
    >
      <div
        className="h-full shrink-0"
        style={{
          width: metrics.gridWidth,
          minWidth: metrics.gridWidth,
          height: metrics.gridHeight,
        }}
      >
        <LevelMap
          {...levelMapProps}
          variant="strip"
          grid={fullGrid}
          cellSize={metrics.cellSize}
          gridWidth={metrics.gridWidth}
          gridHeight={metrics.gridHeight}
          pageStartCol={0}
          showNavHints={false}
        />
      </div>
    </div>
  )
}
