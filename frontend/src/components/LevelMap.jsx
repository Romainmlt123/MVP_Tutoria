import { useEffect, useRef, useState } from 'react'

/** Tuiles servies depuis `frontend/public/images/tileset` */
const TILESET_BASE_PATH = '/images/tileset/'

const COLS = 5
const CENTER_COL = Math.floor(COLS / 2)
const FIRST_VALID_COL = 1
const LAST_VALID_COL = COLS - 2
const LEVEL_INTERVAL = 3
const RECENTER_ROWS = 4
const FALLBACK_SEGMENT_ROWS = 8
const TOP_REVEAL_THRESHOLD_PX = 140

const LEVEL_SUFFIX = {
  lesson: 'bleu',
  exercise: 'vert',
  boss: 'rouge',
}

const TILE_BY_OPENINGS = {
  'down,up': 'chemin_vertical',
  'left,right': 'chemin_horizontal',
  'down,right': 'coin_haut_gauche',
  'down,left': 'coin_haut_droit',
  'right,up': 'coin_bas_gauche',
  'left,up': 'coin_bas_droit',
}

/**
 * @typedef {'default'|'locked'|'completed'} LevelStatus
 * @typedef {{
 *   id: string,
 *   row: number,
 *   col: number,
 *   type: string,
 *   isLevel: boolean,
 *   levelId?: number,
 *   status?: LevelStatus,
 *   nodeIndex?: number,
 *   pathIndex?: number,
 * }} MapCell
 */

function tileUrl(type) {
  return `${TILESET_BASE_PATH}${encodeURIComponent(type)}.png`
}

function keyOf(row, col) {
  return `${row}:${col}`
}

function randomItem(items) {
  return items[Math.floor(Math.random() * items.length)]
}

function addStep(path, visited, row, col) {
  const key = keyOf(row, col)
  if (visited.has(key)) return false
  visited.add(key)
  path.push({ row, col })
  return true
}

function buildPath(rowCount) {
  const path = []
  const visited = new Set()
  let row = rowCount - 1
  let col = CENTER_COL
  let horizontalRun = 0
  const recenterRows = Math.min(RECENTER_ROWS, Math.max(1, rowCount - 3))

  addStep(path, visited, row, col)
  if (row > 0) {
    row -= 1
    addStep(path, visited, row, col)
  }

  while (row > 0) {
    const inRecenterZone = row <= recenterRows

    if (inRecenterZone && col !== CENTER_COL) {
      const nextCol = col < CENTER_COL ? col + 1 : col - 1
      if (addStep(path, visited, row, nextCol)) {
        col = nextCol
        horizontalRun += 1
        continue
      }
    }

    if (inRecenterZone || horizontalRun >= 2) {
      row -= 1
      addStep(path, visited, row, col)
      horizontalRun = 0
      continue
    }

    const choices = ['up', 'up', 'up']
    if (col > FIRST_VALID_COL && !visited.has(keyOf(row, col - 1))) choices.push('left')
    if (col < LAST_VALID_COL && !visited.has(keyOf(row, col + 1))) choices.push('right')

    const move = randomItem(choices)
    if (move === 'left') {
      col -= 1
      horizontalRun += 1
      addStep(path, visited, row, col)
    } else if (move === 'right') {
      col += 1
      horizontalRun += 1
      addStep(path, visited, row, col)
    } else {
      row -= 1
      horizontalRun = 0
      addStep(path, visited, row, col)
    }
  }

  return path
}

function directionBetween(from, to) {
  if (!from || !to) return null
  if (to.row === from.row - 1 && to.col === from.col) return 'up'
  if (to.row === from.row + 1 && to.col === from.col) return 'down'
  if (to.row === from.row && to.col === from.col - 1) return 'left'
  if (to.row === from.row && to.col === from.col + 1) return 'right'
  return null
}

function openingsForPathIndex(path, pathIndex) {
  const openings = new Set()
  const cell = path[pathIndex]
  const previousDirection = directionBetween(cell, path[pathIndex - 1])
  const nextDirection = directionBetween(cell, path[pathIndex + 1])

  if (previousDirection) openings.add(previousDirection)
  if (nextDirection) openings.add(nextDirection)
  if (pathIndex === 0) openings.add('down')
  if (pathIndex === path.length - 1) openings.add('up')

  return [...openings].sort().join(',')
}

function baseTileForCell(path, pathIndex) {
  const openingKey = openingsForPathIndex(path, pathIndex)
  return TILE_BY_OPENINGS[openingKey] || 'chemin_vertical'
}

function levelTile(baseTile, node, locked) {
  const suffix = locked ? 'gris' : LEVEL_SUFFIX[node?.type] || 'bleu'
  return `${baseTile}_${suffix}`
}

function buildFreshMap(nodes, rowCount = FALLBACK_SEGMENT_ROWS) {
  const path = buildPath(rowCount)
  const pathIndexByKey = new Map(path.map((cell, index) => [keyOf(cell.row, cell.col), index]))
  const levelSlots = path.filter((_, index) => index > 0 && index < path.length - 1 && index % LEVEL_INTERVAL === 0)
  const levelSlotByPathIndex = new Map(levelSlots.map((cell, index) => [pathIndexByKey.get(keyOf(cell.row, cell.col)), index]))

  /** @type {MapCell[][]} */
  const rows = Array.from({ length: rowCount }, (_, row) =>
    Array.from({ length: COLS }, (_, col) => {
      const id = `r${row}-c${col}`
      const pathIndex = pathIndexByKey.get(keyOf(row, col))
      if (pathIndex === undefined) {
        return { id, row, col, type: 'herbe', isLevel: false }
      }

      const baseTile = baseTileForCell(path, pathIndex)
      const levelSlot = levelSlotByPathIndex.get(pathIndex)
      if (levelSlot === undefined || nodes.length === 0) {
        return { id, row, col, type: baseTile, isLevel: false, pathIndex }
      }

      const nodeIndex = levelSlot % nodes.length
      const locked = levelSlot >= nodes.length
      return {
        id,
        row,
        col,
        pathIndex,
        type: levelTile(baseTile, nodes[nodeIndex], locked),
        isLevel: true,
        levelId: levelSlot + 1,
        status: locked ? 'locked' : 'default',
        nodeIndex,
      }
    })
  )

  return rows
}

/**
 * Réinitialiser la carte depuis le parent avec une `key` stable (ex. `${subjectId}-${chapterId}`).
 *
 * @param {{
 *   nodes?: Array<{ type: string, title: string, promptContext: string }>,
 *   onLevelClick?: (node: object, cell: MapCell) => void,
 * }} props
 */
export default function LevelMap({ nodes = [], onLevelClick }) {
  const [mapRows, setMapRows] = useState(() => buildFreshMap(nodes))
  const scrollRef = useRef(null)
  const revealPendingRef = useRef(false)
  const scrollRevealRef = useRef(null)

  useEffect(() => {
    const el = scrollRef.current
    if (!el) return
    setMapRows(buildFreshMap(nodes, getVisibleSegmentRows()))
    requestAnimationFrame(() => {
      el.scrollTop = el.scrollHeight
    })
  }, [nodes])

  const getVisibleSegmentRows = () => {
    const el = scrollRef.current
    if (!el) return FALLBACK_SEGMENT_ROWS
    const gridWidth = Math.min(el.clientWidth, 500)
    const cellSize = gridWidth / COLS
    return Math.max(6, Math.floor(el.clientHeight / cellSize))
  }

  const scrollToMapEdge = (edge) => {
    const el = scrollRef.current
    if (!el) return
    el.scrollTo({
      top: edge === 'top' ? 0 : el.scrollHeight,
      behavior: 'smooth',
    })
  }

  useEffect(() => {
    if (!revealPendingRef.current) return
    requestAnimationFrame(() => {
      scrollToMapEdge('top')
      revealPendingRef.current = false
    })
  }, [mapRows])

  const revealNewPathAbove = () => {
    revealPendingRef.current = true
    setMapRows((prev) => [...buildFreshMap(nodes, getVisibleSegmentRows()), ...prev])
  }

  const prependPathAbove = () => {
    const el = scrollRef.current
    if (!el || scrollRevealRef.current) return
    scrollRevealRef.current = {
      previousHeight: el.scrollHeight,
      rows: getVisibleSegmentRows(),
    }
    setMapRows((prev) => [...buildFreshMap(nodes, scrollRevealRef.current.rows), ...prev])
  }

  useEffect(() => {
    const pending = scrollRevealRef.current
    const el = scrollRef.current
    if (!pending || !el) return
    requestAnimationFrame(() => {
      const addedHeight = el.scrollHeight - pending.previousHeight
      el.scrollTop += addedHeight
      scrollRevealRef.current = null
    })
  }, [mapRows])

  const handleScroll = () => {
    const el = scrollRef.current
    if (!el || revealPendingRef.current) return
    if (el.scrollTop < TOP_REVEAL_THRESHOLD_PX) {
      prependPathAbove()
    }
  }

  return (
    <div
      ref={scrollRef}
      onScroll={handleScroll}
      className="h-full w-full overflow-x-hidden overflow-y-auto bg-[#70ad42] overscroll-y-contain"
      aria-label="Parcours de niveaux"
    >
      <div
        role="grid"
        aria-colcount={COLS}
        aria-rowcount={mapRows.length}
        className="mx-auto grid w-full max-w-[500px] gap-0 pb-[calc(5.5rem+env(safe-area-inset-bottom,0px))]"
        style={{ gridTemplateColumns: `repeat(${COLS}, minmax(0, 1fr))` }}
      >
        {mapRows.map((row, rowIndex) =>
          row.map((cell, colIndex) => {
            const cellKey = `${rowIndex}-${colIndex}-${cell.id}`
            const isStartCell = rowIndex === mapRows.length - 1 && colIndex === CENTER_COL
            const isEndCell = rowIndex === 0 && colIndex === CENTER_COL
          const scrollArrow = (isStartCell || isEndCell) && (
            <button
              type="button"
              onClick={(event) => {
                event.stopPropagation()
                if (isEndCell) revealNewPathAbove()
                else scrollToMapEdge('bottom')
              }}
              className="absolute inset-0 z-20 hidden items-center justify-center text-white drop-shadow-[0_2px_4px_rgba(0,0,0,0.45)] transition-transform hover:scale-110 lg:flex"
              aria-label={isStartCell ? 'Descendre dans le parcours' : 'Monter dans le parcours'}
            >
              <span className="material-symbols-outlined rounded-full bg-black/20 text-[48px] backdrop-blur-sm">
                {isStartCell ? 'keyboard_arrow_down' : 'keyboard_arrow_up'}
              </span>
            </button>
          )

          const img = (
            <img
              src={tileUrl(cell.type)}
              alt=""
              width="100"
              height="100"
              className="block aspect-square w-full select-none object-cover"
              draggable={false}
              loading="lazy"
            />
          )

          if (!cell.isLevel) {
            return (
              <div key={cellKey} className="relative overflow-hidden" role="presentation">
                {img}
                {scrollArrow}
              </div>
            )
          }

          const locked = cell.status === 'locked'
          const node = nodes[cell.nodeIndex]

          return (
            <div key={cellKey} className="relative overflow-hidden">
              <button
                type="button"
                disabled={locked || !node}
                onClick={() => {
                  if (!locked && node) onLevelClick?.(node, cell)
                }}
                className={`relative block w-full p-0 transition-transform focus:outline-none focus-visible:z-10 focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 ${
                  locked ? 'cursor-not-allowed' : 'cursor-pointer hover:z-10 hover:scale-[1.03] active:scale-95'
                }`}
                aria-label={locked ? 'Niveau verrouillé' : `${node?.title ?? 'Niveau'} - ouvrir`}
              >
                {img}
              </button>
              {scrollArrow}
            </div>
          )
        }))}
      </div>
    </div>
  )
}
