/** @typedef {{ row: number, col: number }} PathCell */
/** @typedef {{
 *   id: string,
 *   row: number,
 *   col: number,
 *   type: string,
 *   isLevel: boolean,
 *   pathIndex?: number,
 *   levelIndex?: number,
 *   nodeIndex?: number,
 *   status?: 'locked' | 'unlocked' | 'completed',
 *   worldCol?: number,
 * }} MapCell */

export const MODULE_WIDTH = 16
export const LEVEL_INTERVAL = 3
export const RECENTER_COLS = 4

const TILE_BY_OPENINGS = {
  'down,up': 'chemin_vertical',
  'left,right': 'chemin_horizontal',
  'down,right': 'coin_haut_gauche',
  'down,left': 'coin_haut_droit',
  'right,up': 'coin_bas_gauche',
  'left,up': 'coin_bas_droit',
}

const LEVEL_SUFFIX = {
  lesson: 'bleu',
  exercise: 'vert',
  boss: 'rouge',
}

function keyOf(row, col) {
  return `${row}:${col}`
}

/** PRNG déterministe (mulberry32). */
export function createRng(seed) {
  let t = seed >>> 0
  return () => {
    t += 0x6d2b79f5
    let r = Math.imul(t ^ (t >>> 15), 1 | t)
    r ^= r + Math.imul(r ^ (r >>> 7), 61 | r)
    return ((r ^ (r >>> 14)) >>> 0) / 4294967296
  }
}

function pushStep(path, visited, row, col) {
  const key = keyOf(row, col)
  if (visited.has(key)) return false
  visited.add(key)
  path.push({ row, col })
  return true
}

/**
 * Génère un module horizontal : entrée (centerRow, 0), sortie (centerRow, width-1).
 * @param {{ width?: number, height: number, seed?: number }} options
 */
export function generateModule({ width = MODULE_WIDTH, height, seed = 0 }) {
  const rng = createRng(seed)
  const centerRow = Math.floor(height / 2)
  const firstValidRow = 1
  const lastValidRow = height - 2
  const path = []
  const visited = new Set()
  let col = 0
  let row = centerRow
  let verticalRun = 0
  const recenterCols = Math.min(RECENTER_COLS, Math.max(1, width - 3))

  pushStep(path, visited, row, col)
  if (col < width - 1) {
    col += 1
    pushStep(path, visited, row, col)
  }

  while (col < width - 1) {
    const inRecenterZone = col >= width - 1 - recenterCols

    if (inRecenterZone && row !== centerRow) {
      const nextRow = row < centerRow ? row + 1 : row - 1
      if (nextRow < firstValidRow || nextRow > lastValidRow) {
        col += 1
        pushStep(path, visited, row, col)
        verticalRun = 0
        continue
      }
      row = nextRow
      pushStep(path, visited, row, col)
      verticalRun += 1
      continue
    }

    if (inRecenterZone || verticalRun >= 2) {
      col += 1
      pushStep(path, visited, row, col)
      verticalRun = 0
      continue
    }

    const choices = ['right', 'right', 'right']
    if (row > firstValidRow && !visited.has(keyOf(row - 1, col))) choices.push('up')
    if (row < lastValidRow && !visited.has(keyOf(row + 1, col))) choices.push('down')

    const move = choices[Math.floor(rng() * choices.length)]
    if (move === 'up') {
      row -= 1
      verticalRun += 1
      pushStep(path, visited, row, col)
    } else if (move === 'down') {
      row += 1
      verticalRun += 1
      pushStep(path, visited, row, col)
    } else {
      col += 1
      verticalRun = 0
      pushStep(path, visited, row, col)
    }
  }

  const levelIndices = []
  for (let i = 0; i < path.length; i += 1) {
    if (i > 0 && i < path.length - 1 && i % LEVEL_INTERVAL === 0) {
      levelIndices.push(i)
    }
  }

  return { path, levelIndices, centerRow, width, height }
}

/** Concatène un module avec offset colonne (continuité centre → centre). */
export function extendPath(existingPath, modulePath, colOffset) {
  if (!modulePath.length) return existingPath
  const shifted = modulePath.map(({ row, col }) => ({ row, col: col + colOffset }))
  if (!existingPath.length) return shifted

  const last = existingPath[existingPath.length - 1]
  const first = shifted[0]
  if (last.row === first.row && last.col === first.col) {
    return [...existingPath, ...shifted.slice(1)]
  }
  return [...existingPath, ...shifted]
}

export function buildWorldPath(moduleCount, height, seedStart = 1) {
  let path = []
  for (let i = 0; i < moduleCount; i += 1) {
    const { path: modulePath } = generateModule({
      width: MODULE_WIDTH,
      height,
      seed: seedStart + i * 997,
    })
    path = extendPath(path, modulePath, i * MODULE_WIDTH)
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

export function openingsForPathIndex(path, pathIndex) {
  const openings = new Set()
  const cell = path[pathIndex]
  const prevDir = directionBetween(cell, path[pathIndex - 1])
  const nextDir = directionBetween(cell, path[pathIndex + 1])
  if (prevDir) openings.add(prevDir)
  if (nextDir) openings.add(nextDir)
  if (pathIndex === 0) openings.add('left')
  if (pathIndex === path.length - 1) openings.add('right')
  return [...openings].sort().join(',')
}

export function getTileType(path, pathIndex) {
  const openingKey = openingsForPathIndex(path, pathIndex)
  const tile = TILE_BY_OPENINGS[openingKey]
  if (tile) return tile
  const openings = openingKey.split(',').filter(Boolean)
  if (openings.includes('left') || openings.includes('right')) return 'chemin_horizontal'
  return 'chemin_vertical'
}

function levelTile(baseTile, nodeType, status) {
  if (status === 'locked') return `${baseTile}_gris`
  if (status === 'completed') {
    const suffix = LEVEL_SUFFIX[nodeType] || 'bleu'
    return `${baseTile}_${suffix}`
  }
  const suffix = LEVEL_SUFFIX[nodeType] || 'bleu'
  return `${baseTile}_${suffix}`
}

/**
 * @param {PathCell[]} path
 * @param {number} rows
 * @param {number} cols
 * @param {{
 *   nodes?: Array<{ type: string }>,
 *   getLevelStatus?: (levelIndex: number) => 'locked' | 'unlocked' | 'completed',
 * }} options
 * @returns {MapCell[][]}
 */
export function pathToGrid(path, rows, cols, options = {}) {
  const { nodes = [], getLevelStatus = () => 'unlocked' } = options
  const pathIndexByKey = new Map(path.map((cell, index) => [keyOf(cell.row, cell.col), index]))

  const levelPathIndexToLevelIndex = new Map()
  let levelCounter = 0
  for (let i = 0; i < path.length; i += 1) {
    if (i > 0 && i < path.length - 1 && i % LEVEL_INTERVAL === 0) {
      levelPathIndexToLevelIndex.set(i, levelCounter)
      levelCounter += 1
    }
  }

  return Array.from({ length: rows }, (_, row) =>
    Array.from({ length: cols }, (_, col) => {
      const id = `r${row}-c${col}`
      const pathIndex = pathIndexByKey.get(keyOf(row, col))
      if (pathIndex === undefined) {
        return { id, row, col, type: 'herbe', isLevel: false }
      }

      const baseTile = getTileType(path, pathIndex)
      const levelIndex = levelPathIndexToLevelIndex.get(pathIndex)

      if (levelIndex === undefined || nodes.length === 0) {
        return { id, row, col, type: baseTile, isLevel: false, pathIndex }
      }

      const status = getLevelStatus(levelIndex)
      const nodeIndex = levelIndex % nodes.length
      const node = nodes[nodeIndex]

      return {
        id,
        row,
        col,
        pathIndex,
        type: levelTile(baseTile, node?.type, status),
        isLevel: true,
        levelIndex,
        nodeIndex,
        status,
      }
    })
  )
}

/** Extrait la grille visible pour une page [startCol, startCol + pageCols). */
export function sliceGridForPage(fullGrid, startCol, pageCols) {
  return fullGrid.map((row) =>
    row.slice(startCol, startCol + pageCols).map((cell, localCol) => ({
      ...cell,
      worldCol: cell.col,
      id: `r${cell.row}-c${localCol}`,
      col: localCol,
    }))
  )
}

/** Validation pour tests. */
export function validatePath(path, { height, moduleWidth = MODULE_WIDTH } = {}) {
  const errors = []
  const centerRow = Math.floor(height / 2)
  const visited = new Set()

  if (!path.length) {
    errors.push('empty path')
    return { valid: false, errors }
  }

  if (path[0].row !== centerRow) errors.push('start not centered')
  if (path[path.length - 1].row !== centerRow) errors.push('end not centered')

  for (let i = 0; i < path.length; i += 1) {
    const { row, col } = path[i]
    const key = keyOf(row, col)
    if (visited.has(key)) errors.push(`duplicate at ${key}`)
    visited.add(key)

    if (row === 0 || row === height - 1) errors.push(`path on grass margin at ${key}`)

    if (i > 0) {
      const prev = path[i - 1]
      const dist = Math.abs(prev.row - row) + Math.abs(prev.col - col)
      if (dist !== 1) errors.push(`not 4-connected between ${i - 1} and ${i}`)
    }
  }

  for (let m = 1; m < Math.ceil((path[path.length - 1].col + 1) / moduleWidth); m += 1) {
    const boundaryCol = m * moduleWidth
    const left = path.find((c) => c.col === boundaryCol - 1)
    const right = path.find((c) => c.col === boundaryCol)
    if (left && right && (left.row !== right.row || left.row !== centerRow)) {
      errors.push(`module seam break at col ${boundaryCol}`)
    }
  }

  return { valid: errors.length === 0, errors }
}
