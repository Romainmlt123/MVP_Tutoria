import { useCallback, useRef, useState } from 'react'

/** Tuiles servies depuis `frontend/public/images/tileset` */
const TILESET_BASE_PATH = '/images/tileset/'

const COLS = 4
const CELL_PX = 100

/** Cases de chemin entre deux tuiles « niveau » (après placement du premier niveau) */
const LEVEL_INTERVAL = 5

/** Lignes ajoutées à chaque passage proche du bas */
const ROWS_PER_APPEND = 4

const SCROLL_THRESHOLD_PX = 240

const LEVEL_SUFFIX = {
  lesson: 'bleu',
  exercise: 'vert',
  boss: 'rouge',
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
 * }} MapCell
 */

function tileUrl(type) {
  return `${TILESET_BASE_PATH}${encodeURIComponent(type)}.png`
}

function plainPathTile(axis) {
  return axis === 'v' ? 'chemin_vertical' : 'chemin_horizontal'
}

function levelPathTile(axis, node, locked) {
  if (locked) {
    return axis === 'v' ? 'chemin_vertical_gris' : 'chemin_horizontal_gris'
  }
  const suf = LEVEL_SUFFIX[node?.type] || 'bleu'
  return axis === 'v' ? `chemin_vertical_${suf}` : `chemin_horizontal_${suf}`
}

/**
 * Zigzag 4 colonnes (forme en S) :
 * - Ligne paire : entrée col0 (vertical sauf ligne 0), horizontales col1–2, sortie col3 (vertical).
 * - Ligne impaire : entrée col3, horizontales col2–1, sortie col0 (vertical).
 */
function visitOrderForRow(row) {
  return row % 2 === 0 ? [0, 1, 2, 3] : [3, 2, 1, 0]
}

function axisForCell(row, col) {
  const even = row % 2 === 0
  if (even) {
    if (col === 0 || col === 3) return 'v'
    return 'h'
  }
  if (col === 3 || col === 0) return 'v'
  return 'h'
}

function buildCellMapForRow(row, visitOrder, nodes, gen) {
  /** @type {Map<number, MapCell>} */
  const byCol = new Map()

  for (const col of visitOrder) {
    const axis = axisForCell(row, col)
    gen.pathCellsEmitted += 1

    let isLevel = false
    let nodeIndex
    let status = 'default'

    const totalSlots = Math.max(nodes.length * 6, 24)
    const canPlaceLevel =
      nodes.length > 0 &&
      gen.levelPlacedCount < totalSlots &&
      (gen.pathCellsEmitted === 1 ||
        (gen.pathCellsEmitted > 1 && (gen.pathCellsEmitted - 1) % LEVEL_INTERVAL === 0))

    if (canPlaceLevel) {
      isLevel = true
      nodeIndex = gen.levelPlacedCount % nodes.length
      if (gen.levelPlacedCount >= nodes.length) {
        status = 'locked'
      }
      gen.levelPlacedCount += 1
    }

    let type
    if (isLevel && nodes[nodeIndex]) {
      type = levelPathTile(axis, nodes[nodeIndex], status === 'locked')
    } else {
      type = plainPathTile(axis)
    }

    byCol.set(col, {
      id: `r${row}-c${col}`,
      row,
      col,
      type,
      isLevel,
      levelId: isLevel ? gen.levelPlacedCount : undefined,
      status: isLevel ? status : undefined,
      nodeIndex: isLevel ? nodeIndex : undefined,
    })
  }

  return byCol
}

function createGeneratorState() {
  return {
    nextRow: 0,
    pathCellsEmitted: 0,
    levelPlacedCount: 0,
  }
}

/**
 * @param {number} count
 * @param {Array<{ type: string }>} nodes
 * @param {ReturnType<typeof createGeneratorState>} gen
 * @param {number} startRow
 * @returns {MapCell[][]}
 */
function generateRows(count, nodes, gen, startRow) {
  const rows = []
  for (let i = 0; i < count; i++) {
    const row = startRow + i
    const visitOrder = visitOrderForRow(row)
    const byCol = buildCellMapForRow(row, visitOrder, nodes, gen)

    const line = []
    for (let c = 0; c < COLS; c++) {
      line.push(byCol.get(c))
    }
    rows.push(line)
    gen.nextRow = row + 1
  }
  return rows
}

function buildFreshMap(nodes, initialRows = 12) {
  const gen = createGeneratorState()
  const rows = generateRows(initialRows, nodes, gen, 0)
  return { rows, gen }
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
  const [pack, setPack] = useState(() => buildFreshMap(nodes))
  const mapRows = pack.rows

  const scrollRef = useRef(null)
  const appendingRef = useRef(false)

  const appendMoreRows = useCallback(() => {
    if (appendingRef.current) return
    appendingRef.current = true
    setPack((prev) => {
      const startRow = prev.gen.nextRow
      const chunk = generateRows(ROWS_PER_APPEND, nodes, prev.gen, startRow)
      return { ...prev, rows: [...prev.rows, ...chunk] }
    })
    requestAnimationFrame(() => {
      appendingRef.current = false
    })
  }, [nodes])

  const onScroll = useCallback(() => {
    const el = scrollRef.current
    if (!el) return
    const nearBottom = el.scrollHeight - el.scrollTop - el.clientHeight < SCROLL_THRESHOLD_PX
    if (nearBottom) appendMoreRows()
  }, [appendMoreRows])

  const flatCells = mapRows.flat()

  return (
    <div
      ref={scrollRef}
      onScroll={onScroll}
      className="w-full max-w-[100vw] overflow-x-hidden overflow-y-auto rounded-xl border border-border bg-[#b8d9a8]"
      style={{ maxHeight: 'min(72dvh, 72vh, 680px)' }}
    >
      <div
        role="grid"
        aria-colCount={COLS}
        aria-rowCount={mapRows.length}
        className="grid w-full max-w-full grid-cols-4 gap-0 mx-auto sm:max-w-[400px]"
      >
        {flatCells.map((cell) => {
          const img = (
            <img
              src={tileUrl(cell.type)}
              alt=""
              width={CELL_PX}
              height={CELL_PX}
              className="block aspect-square w-full max-h-[100px] select-none object-cover"
              draggable={false}
              loading="lazy"
            />
          )

          if (!cell.isLevel) {
            return (
              <div key={cell.id} className="relative overflow-hidden" role="presentation">
                {img}
              </div>
            )
          }

          const locked = cell.status === 'locked'
          const node = nodes[cell.nodeIndex]

          return (
            <button
              key={cell.id}
              type="button"
              disabled={locked || !node}
              onClick={() => {
                if (!locked && node) onLevelClick?.(node, cell)
              }}
              className={`relative overflow-hidden p-0 transition-transform focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 ${
                locked ? 'cursor-not-allowed opacity-55' : 'cursor-pointer hover:z-10 hover:scale-[1.03] active:scale-95'
              }`}
              aria-label={locked ? 'Niveau verrouillé' : `${node?.title ?? 'Niveau'} — ouvrir`}
            >
              {img}
            </button>
          )
        })}
      </div>
    </div>
  )
}
