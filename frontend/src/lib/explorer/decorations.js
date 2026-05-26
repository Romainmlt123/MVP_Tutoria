import { createRng } from './pathGenerator'

const DECORATIONS = [
  { type: 'arbre1 1', scale: 1.45 },
  { type: 'arbre2 1', scale: 1.35 },
  { type: 'arbre3 1', scale: 1.4 },
  { type: 'buisson 1', scale: 0.95 },
  { type: 'buisson2', scale: 0.9 },
]

const GRASS_DECORATION_CHANCE = 0.24

/**
 * Décor pseudo-aléatoire stable pour une tuile herbe (row + col monde).
 * @param {number} seed
 * @param {number} row
 * @param {number} worldCol
 * @returns {{ type: string, scale: number, flip: boolean } | null}
 */
export function getGrassDecoration(seed, row, worldCol) {
  const rng = createRng(((seed * 131 + row * 17 + worldCol * 31) >>> 0) + 1)
  if (rng() > GRASS_DECORATION_CHANCE) return null

  const pick = DECORATIONS[Math.floor(rng() * DECORATIONS.length)]
  return {
    type: pick.type,
    scale: pick.scale,
    flip: rng() > 0.5,
  }
}

/** Colonne du point débloqué le plus à droite. */
export function findProgressCol(fullGrid) {
  let maxCol = -1
  for (const row of fullGrid) {
    for (const cell of row) {
      if (cell.isLevel && cell.status !== 'locked' && cell.col > maxCol) {
        maxCol = cell.col
      }
    }
  }
  return Math.max(0, maxCol)
}

/** Page contenant le point débloqué le plus à droite. */
export function findProgressPageIndex(fullGrid, pageCols) {
  let maxCol = -1
  for (const row of fullGrid) {
    for (const cell of row) {
      if (cell.isLevel && cell.status !== 'locked' && cell.col > maxCol) {
        maxCol = cell.col
      }
    }
  }
  if (maxCol < 0) return 0
  return Math.floor(maxCol / pageCols)
}
