/** Grille visible identique sur mobile, tablette et desktop. */
export const VISIBLE_PAGE_COLS = 7
export const VISIBLE_PAGE_ROWS = 5

/**
 * Calcule la taille d'une tuile et les dimensions de la grille pour tenir dans le conteneur.
 * @param {number} width
 * @param {number} height
 */
export function computeViewportGridMetrics(width, height) {
  if (width <= 0 || height <= 0) {
    return {
      pageCols: VISIBLE_PAGE_COLS,
      rowCount: VISIBLE_PAGE_ROWS,
      cellSize: 64,
      gridWidth: VISIBLE_PAGE_COLS * 64,
      gridHeight: VISIBLE_PAGE_ROWS * 64,
      viewportWidth: width,
      viewportHeight: height,
      isStrip: false,
    }
  }

  const cellSizeByWidth = width / VISIBLE_PAGE_COLS
  const cellSizeByHeight = height / VISIBLE_PAGE_ROWS
  const cellSize = Math.min(cellSizeByWidth, cellSizeByHeight)

  return {
    pageCols: VISIBLE_PAGE_COLS,
    rowCount: VISIBLE_PAGE_ROWS,
    cellSize,
    gridWidth: VISIBLE_PAGE_COLS * cellSize,
    gridHeight: VISIBLE_PAGE_ROWS * cellSize,
    viewportWidth: width,
    viewportHeight: height,
    isStrip: false,
  }
}

/** Mobile : tuiles à hauteur pleine, parcours scrollable en largeur. */
export function computeStripMetrics(viewportHeight, totalCols) {
  const rowCount = VISIBLE_PAGE_ROWS
  const cellSize = viewportHeight > 0 ? viewportHeight / rowCount : 64
  const cols = Math.max(1, totalCols)

  return {
    pageCols: VISIBLE_PAGE_COLS,
    rowCount,
    cellSize,
    gridWidth: cols * cellSize,
    gridHeight: rowCount * cellSize,
    viewportWidth: 0,
    viewportHeight: viewportHeight,
    isStrip: true,
  }
}
