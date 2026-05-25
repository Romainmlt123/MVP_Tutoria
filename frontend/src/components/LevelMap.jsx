const TILESET_BASE_PATH = '/images/tileset/'

function tileUrl(type) {
  return `${TILESET_BASE_PATH}${encodeURIComponent(type)}.png`
}

/**
 * @param {{
 *   grid: import('../lib/explorer/pathGenerator').MapCell[][],
 *   cellSize: number,
 *   nodes?: Array<{ type: string, title: string }>,
 *   onLevelClick?: (payload: {
 *     node: object,
 *     cell: import('../lib/explorer/pathGenerator').MapCell,
 *   }) => void,
 *   onPrevPage?: () => void,
 *   onNextPage?: () => void,
 *   showNavHints?: boolean,
 * }} props
 */
export default function LevelMap({
  grid,
  cellSize,
  gridWidth,
  gridHeight,
  nodes = [],
  onLevelClick,
  onPrevPage,
  onNextPage,
  showNavHints = true,
}) {
  if (!grid?.length || !grid[0]?.length) return null

  const rowCount = grid.length
  const colCount = grid[0].length
  const centerRow = Math.floor(rowCount / 2)
  const width = gridWidth ?? colCount * cellSize
  const height = gridHeight ?? rowCount * cellSize

  return (
    <div
      className="relative flex h-full w-full items-center justify-center overflow-hidden bg-[#70ad42]"
      role="region"
      aria-label="Parcours de niveaux"
    >
      {showNavHints && (
        <>
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
        </>
      )}

      <div
        role="grid"
        aria-rowcount={rowCount}
        aria-colcount={colCount}
        className="grid shrink-0"
        style={{
          gridTemplateColumns: `repeat(${colCount}, ${cellSize}px)`,
          gridTemplateRows: `repeat(${rowCount}, ${cellSize}px)`,
          width,
          height,
          imageRendering: 'pixelated',
        }}
      >
        {grid.map((row, rowIndex) =>
          row.map((cell) => {
            const isStartCell = rowIndex === centerRow && cell.col === 0
            const isEndCell = rowIndex === centerRow && cell.col === colCount - 1

            const img = (
              <img
                src={tileUrl(cell.type)}
                alt=""
                width={cellSize}
                height={cellSize}
                className="block h-full w-full select-none object-cover"
                draggable={false}
                loading="lazy"
              />
            )

            if (!cell.isLevel) {
              return (
                <div
                  key={cell.id}
                  className="relative overflow-hidden"
                  role="presentation"
                >
                  {img}
                  {isStartCell && (
                    <span className="pointer-events-none absolute inset-0 flex items-center justify-center text-white/80 lg:hidden">
                      <span className="material-symbols-outlined text-[28px] drop-shadow">chevron_left</span>
                    </span>
                  )}
                  {isEndCell && (
                    <span className="pointer-events-none absolute inset-0 flex items-center justify-center text-white/80 lg:hidden">
                      <span className="material-symbols-outlined text-[28px] drop-shadow">chevron_right</span>
                    </span>
                  )}
                </div>
              )
            }

            const locked = cell.status === 'locked'
            const node = nodes[cell.nodeIndex]

            return (
              <div key={cell.id} className="relative overflow-hidden">
                <button
                  type="button"
                  disabled={locked || !node}
                  onClick={() => {
                    if (!locked && node) onLevelClick?.({ node, cell })
                  }}
                  className={`block p-0 transition-transform focus:outline-none focus-visible:z-10 focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 ${
                    locked
                      ? 'cursor-not-allowed opacity-90'
                      : 'cursor-pointer hover:z-10 hover:scale-[1.04] active:scale-95'
                  } ${cell.status === 'completed' ? 'ring-2 ring-inset ring-white/50' : ''}`}
                  style={{ width: cellSize, height: cellSize }}
                  aria-label={
                    locked
                      ? 'Niveau verrouillé'
                      : cell.status === 'completed'
                        ? `${node?.title ?? 'Niveau'} — terminé`
                        : `${node?.title ?? 'Niveau'} — ouvrir`
                  }
                >
                  {img}
                </button>
                {cell.status === 'completed' && (
                  <span className="pointer-events-none absolute right-0.5 top-0.5 flex h-5 w-5 items-center justify-center rounded-full bg-white/90 text-[14px] text-primary shadow">
                    <span
                      className="material-symbols-outlined text-[16px]"
                      style={{ fontVariationSettings: "'FILL' 1" }}
                    >
                      check
                    </span>
                  </span>
                )}
              </div>
            )
          })
        )}
      </div>
    </div>
  )
}
