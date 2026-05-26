import { useEffect, useRef, useState } from 'react'
import { getGrassDecoration } from '../lib/explorer/decorations'

const TILESET_BASE_PATH = '/images/tileset/'

function tileUrl(type) {
  return `${TILESET_BASE_PATH}${encodeURIComponent(type)}.png`
}

function baseTileType(type) {
  if (type === 'herbe') return 'herbe'
  return type.replace(/_(bleu|vert|rouge|gris)$/, '') || type
}

/** Prolonge le bord visible : chemin horizontal ou herbe selon la ligne. */
function fillerTypeForEdge(cell) {
  const { type } = cell
  const base = baseTileType(type)
  if (base === 'herbe') return 'herbe'
  if (base === 'chemin_vertical') return 'herbe'

  const colorMatch = type.match(/_(bleu|vert|rouge|gris)$/)
  if (colorMatch) return `chemin_horizontal_${colorMatch[1]}`
  return 'chemin_horizontal'
}

function TileImage({ type, cellSize }) {
  return (
    <img
      src={tileUrl(type)}
      alt=""
      width={cellSize}
      height={cellSize}
      className="block h-full w-full select-none object-cover"
      draggable={false}
      loading="lazy"
    />
  )
}

function GrassDecoration({ decoration, cellSize }) {
  if (!decoration) return null

  const size = cellSize * decoration.scale

  return (
    <img
      src={tileUrl(decoration.type)}
      alt=""
      width={size}
      height={size}
      className="pointer-events-none absolute bottom-0 left-1/2 z-[1] max-w-none select-none object-contain object-bottom"
      style={{
        width: size,
        height: size,
        transform: `translateX(-50%) scaleX(${decoration.flip ? -1 : 1})`,
        imageRendering: 'pixelated',
      }}
      draggable={false}
      loading="lazy"
    />
  )
}

function GrassTile({ type, cellSize, decorationSeed, row, worldCol }) {
  const decoration =
    type === 'herbe' && decorationSeed != null && worldCol != null
      ? getGrassDecoration(decorationSeed, row, worldCol)
      : null

  return (
    <div className="relative overflow-visible">
      <TileImage type={type} cellSize={cellSize} />
      <GrassDecoration decoration={decoration} cellSize={cellSize} />
    </div>
  )
}

function SideStrip({ grid, cellSize, widthPx, side, decorationSeed, pageStartCol, pageCols }) {
  if (widthPx <= 0 || !grid?.length) return null

  const rowCount = grid.length
  const colCount = Math.max(1, Math.ceil(widthPx / cellSize))

  return (
    <div
      className="grid shrink-0"
      aria-hidden
      style={{
        width: widthPx,
        height: rowCount * cellSize,
        gridTemplateColumns: `repeat(${colCount}, ${cellSize}px)`,
        gridTemplateRows: `repeat(${rowCount}, ${cellSize}px)`,
        imageRendering: 'pixelated',
      }}
    >
      {grid.map((row, rowIndex) => {
        const edgeCell = side === 'left' ? row[0] : row[row.length - 1]
        const tileType = fillerTypeForEdge(edgeCell)
        return Array.from({ length: colCount }, (_, colIndex) => {
          const worldCol =
            side === 'left'
              ? pageStartCol - (colCount - colIndex)
              : pageStartCol + pageCols + colIndex

          return (
            <div key={`${side}-r${rowIndex}-c${colIndex}`} className="overflow-visible">
              <GrassTile
                type={tileType}
                cellSize={cellSize}
                decorationSeed={decorationSeed}
                row={rowIndex}
                worldCol={worldCol}
              />
            </div>
          )
        })
      })}
    </div>
  )
}

/**
 * @param {{
 *   grid: import('../lib/explorer/pathGenerator').MapCell[][],
 *   cellSize: number,
 *   decorationSeed?: number,
 *   pageStartCol?: number,
 *   nodes?: Array<{ type: string, title: string }>,
 *   onLevelClick?: (payload: {
 *     node: object,
 *     cell: import('../lib/explorer/pathGenerator').MapCell,
 *   }) => void,
 *   onPrevPage?: () => void,
 *   onNextPage?: () => void,
 *   showNavHints?: boolean,
 *   variant?: 'page' | 'strip',
 * }} props
 */
export default function LevelMap({
  grid,
  cellSize,
  gridWidth,
  gridHeight,
  decorationSeed,
  pageStartCol = 0,
  nodes = [],
  onLevelClick,
  onPrevPage,
  onNextPage,
  showNavHints = true,
  variant = 'page',
}) {
  const containerRef = useRef(null)
  const [sidePadPx, setSidePadPx] = useState(0)
  const isStrip = variant === 'strip'

  const rowCount = grid?.length ?? 0
  const colCount = grid?.[0]?.length ?? 0
  const centerRow = Math.floor(rowCount / 2)
  const width = gridWidth ?? colCount * cellSize
  const height = gridHeight ?? rowCount * cellSize

  useEffect(() => {
    if (isStrip) {
      setSidePadPx(0)
      return undefined
    }

    const el = containerRef.current
    if (!el) return undefined

    const update = () => {
      setSidePadPx(Math.max(0, (el.clientWidth - width) / 2))
    }
    update()
    const ro = new ResizeObserver(update)
    ro.observe(el)
    return () => ro.disconnect()
  }, [width, isStrip])

  if (!grid?.length || !grid[0]?.length) return null

  return (
    <div
      ref={containerRef}
      className={`relative flex h-full bg-[#70ad42] ${
        isStrip
          ? 'min-h-full w-full items-stretch justify-start overflow-visible'
          : 'w-full items-center justify-center overflow-hidden'
      }`}
      role="region"
      aria-label="Parcours de niveaux"
    >
      {showNavHints && !isStrip && (
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

      <div className={`relative z-10 flex shrink-0 items-stretch ${isStrip ? 'h-full' : ''}`}>
        {!isStrip && (
          <SideStrip
            grid={grid}
            cellSize={cellSize}
            widthPx={sidePadPx}
            side="left"
            decorationSeed={decorationSeed}
            pageStartCol={pageStartCol}
            pageCols={colCount}
          />
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
              const worldCol = isStrip ? cell.col : (cell.worldCol ?? pageStartCol + cell.col)

              if (!cell.isLevel) {
                return (
                  <div key={cell.id} className="relative overflow-visible" role="presentation">
                    <GrassTile
                      type={cell.type}
                      cellSize={cellSize}
                      decorationSeed={decorationSeed}
                      row={cell.row}
                      worldCol={worldCol}
                    />
                    {isStartCell && (
                      <span className="pointer-events-none absolute inset-0 z-[2] flex items-center justify-center text-white/80 lg:hidden">
                        <span className="material-symbols-outlined text-[28px] drop-shadow">chevron_left</span>
                      </span>
                    )}
                    {isEndCell && (
                      <span className="pointer-events-none absolute inset-0 z-[2] flex items-center justify-center text-white/80 lg:hidden">
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
                    <TileImage type={cell.type} cellSize={cellSize} />
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

        {!isStrip && (
          <SideStrip
            grid={grid}
            cellSize={cellSize}
            widthPx={sidePadPx}
            side="right"
            decorationSeed={decorationSeed}
            pageStartCol={pageStartCol}
            pageCols={colCount}
          />
        )}
      </div>
    </div>
  )
}
