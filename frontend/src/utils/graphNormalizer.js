/**
 * Normalise et valide les données de graphique venant du mode vocal (Realtime API)
 * pour qu'elles correspondent au format attendu par GraphPanel / JSXGraph.
 *
 * 2D: boundingBox, functions, elements.
 * 3D: is3D: true, boundingBox3D, surfaces, curves3D, elements3D.
 */

const DEFAULT_BOUNDING_BOX = [-10, 10, 10, -10]
const DEFAULT_BOUNDING_BOX_3D = [[-5, 5], [-5, 5], [-5, 5]]

function toNum(v) {
  if (typeof v === 'number' && !Number.isNaN(v)) return v
  const n = parseFloat(v)
  return typeof v === 'string' && !Number.isNaN(n) ? n : null
}

function ensureBoundingBox(bb) {
  if (!Array.isArray(bb) || bb.length < 4) return DEFAULT_BOUNDING_BOX
  const nums = bb.slice(0, 4).map(toNum)
  if (nums.some((n) => n == null)) return DEFAULT_BOUNDING_BOX
  const xmin = Math.min(nums[0], nums[2])
  const xmax = Math.max(nums[0], nums[2])
  const ymin = Math.min(nums[1], nums[3])
  const ymax = Math.max(nums[1], nums[3])
  return [xmin, ymax, xmax, ymin]
}

function normalizeFunction(fn) {
  if (!fn || typeof fn !== 'object') return null
  let expression = typeof fn.expression === 'string' ? fn.expression.trim() : null
  if (!expression) return null
  // Cohérence: ** en ^ (format attendu par GraphPanel)
  expression = expression.replace(/\*\*/g, '^')
  return {
    expression,
    color: typeof fn.color === 'string' ? fn.color : '#3B82F6',
    label: typeof fn.label === 'string' ? fn.label : undefined,
  }
}

function ensurePoint(p) {
  if (!Array.isArray(p) || p.length < 2) return null
  const x = toNum(p[0])
  const y = toNum(p[1])
  if (x == null || y == null) return null
  return [x, y]
}

function ensurePoint3D(p) {
  if (!Array.isArray(p) || p.length < 3) return null
  const x = toNum(p[0])
  const y = toNum(p[1])
  const z = toNum(p[2])
  if (x == null || y == null || z == null) return null
  return [x, y, z]
}

function ensureBoundingBox3D(bb) {
  if (!Array.isArray(bb) || bb.length < 3) return DEFAULT_BOUNDING_BOX_3D
  const out = []
  for (let i = 0; i < 3; i++) {
    const range = bb[i]
    if (!Array.isArray(range) || range.length < 2) return DEFAULT_BOUNDING_BOX_3D
    const a = toNum(range[0])
    const b = toNum(range[1])
    if (a == null || b == null) return DEFAULT_BOUNDING_BOX_3D
    out.push([Math.min(a, b), Math.max(a, b)])
  }
  return out
}

function normalizeSurface(s) {
  if (!s || typeof s !== 'object' || typeof s.expression !== 'string') return null
  const expression = s.expression.trim().replace(/\*\*/g, '^')
  const xRange = Array.isArray(s.xRange) && s.xRange.length >= 2
    ? [toNum(s.xRange[0]) ?? -3, toNum(s.xRange[1]) ?? 3]
    : [-3, 3]
  const yRange = Array.isArray(s.yRange) && s.yRange.length >= 2
    ? [toNum(s.yRange[0]) ?? -3, toNum(s.yRange[1]) ?? 3]
    : [-3, 3]
  return {
    expression,
    xRange,
    yRange,
    stepsU: Math.min(30, Math.max(10, toNum(s.stepsU) ?? toNum(s.steps) ?? 20)),
    stepsV: Math.min(30, Math.max(10, toNum(s.stepsV) ?? toNum(s.steps) ?? 20)),
    color: typeof s.color === 'string' ? s.color : '#3B82F6',
  }
}

function normalizeCurve3D(c) {
  if (!c || typeof c !== 'object') return null
  const x = typeof (c.xExpr ?? c.x) === 'string' ? (c.xExpr ?? c.x).trim().replace(/\*\*/g, '^') : 'cos(t)'
  const y = typeof (c.yExpr ?? c.y) === 'string' ? (c.yExpr ?? c.y).trim().replace(/\*\*/g, '^') : 'sin(t)'
  const z = typeof (c.zExpr ?? c.z) === 'string' ? (c.zExpr ?? c.z).trim().replace(/\*\*/g, '^') : 't'
  const tRange = Array.isArray(c.tRange) && c.tRange.length >= 2
    ? [toNum(c.tRange[0]) ?? 0, toNum(c.tRange[1]) ?? 2 * Math.PI]
    : [0, 2 * Math.PI]
  return { xExpr: x, yExpr: y, zExpr: z, tRange, color: typeof c.color === 'string' ? c.color : '#EF4444' }
}

function normalizeElement3D(el) {
  if (!el || typeof el !== 'object' || typeof el.type !== 'string') return null
  const type = el.type.toLowerCase()

  switch (type) {
    case 'point3d': {
      const coords = el.coords ?? [el.x, el.y, el.z].filter((v) => v != null)
      const pt = ensurePoint3D(coords)
      if (!pt) return null
      return { type: 'point3d', coords: pt, label: el.label, color: el.color || '#3B82F6' }
    }
    case 'sphere': {
      const center = ensurePoint3D(el.center ?? [0, 0, 0])
      const radius = toNum(el.radius)
      if (!center || radius == null || radius <= 0) return null
      return { type: 'sphere', center, radius, color: el.color || '#3B82F6' }
    }
    case 'line3d': {
      const pts = el.points ?? (el.point1 && el.point2 ? [el.point1, el.point2] : null)
      if (!Array.isArray(pts) || pts.length < 2) return null
      const p1 = ensurePoint3D(pts[0])
      const p2 = ensurePoint3D(pts[1])
      if (!p1 || !p2) return null
      return { type: 'line3d', point1: p1, point2: p2, color: el.color || '#3B82F6' }
    }
    case 'polygon3d': {
      const vertices = Array.isArray(el.vertices) ? el.vertices.map(ensurePoint3D).filter(Boolean) : null
      if (!vertices || vertices.length < 3) return null
      return { type: 'polygon3d', vertices, labels: el.labels, color: el.color || '#3B82F6' }
    }
    case 'vector3d': {
      const from = ensurePoint3D(el.from ?? [0, 0, 0])
      const to = ensurePoint3D(el.to ?? [1, 1, 1])
      if (!from || !to) return null
      return { type: 'vector3d', from, to, label: el.label, color: el.color || '#EF4444' }
    }
    case 'plane3d': {
      const points = Array.isArray(el.points) ? el.points.map(ensurePoint3D).filter(Boolean) : null
      if (!points || points.length < 3) return null
      return { type: 'plane3d', points, color: el.color || '#8B5CF6' }
    }
    default:
      return null
  }
}

function normalizeElement(el) {
  if (!el || typeof el !== 'object' || typeof el.type !== 'string') return null
  const type = el.type.toLowerCase()

  switch (type) {
    case 'point': {
      const x = toNum(el.x)
      const y = toNum(el.y)
      if (x == null || y == null) return null
      return {
        type: 'point',
        x,
        y,
        label: typeof el.label === 'string' ? el.label : undefined,
        color: typeof el.color === 'string' ? el.color : '#3B82F6',
      }
    }
    case 'segment': {
      const points = Array.isArray(el.points) ? el.points.map(ensurePoint).filter(Boolean) : null
      if (!points || points.length !== 2) return null
      return {
        type: 'segment',
        points,
        labels: Array.isArray(el.labels) ? el.labels.slice(0, 2) : undefined,
        color: typeof el.color === 'string' ? el.color : '#3B82F6',
      }
    }
    case 'line': {
      const points = Array.isArray(el.points) ? el.points.map(ensurePoint).filter(Boolean) : null
      if (!points || points.length !== 2) return null
      return {
        type: 'line',
        points,
        color: typeof el.color === 'string' ? el.color : '#3B82F6',
      }
    }
    case 'polygon':
    case 'triangle': {
      const vertices = Array.isArray(el.vertices) ? el.vertices.map(ensurePoint).filter(Boolean) : null
      if (!vertices || vertices.length < 3) return null
      return {
        type: 'polygon',
        vertices,
        labels: Array.isArray(el.labels) ? el.labels.slice(0, vertices.length) : undefined,
        color: typeof el.color === 'string' ? el.color : '#3B82F6',
        fillColor: typeof el.fillColor === 'string' ? el.fillColor : undefined,
      }
    }
    case 'circle': {
      const center = ensurePoint(el.center)
      const radius = toNum(el.radius)
      if (!center || radius == null || radius <= 0) return null
      return {
        type: 'circle',
        center,
        radius,
        centerLabel: typeof el.centerLabel === 'string' ? el.centerLabel : undefined,
        color: typeof el.color === 'string' ? el.color : '#3B82F6',
      }
    }
    default:
      return null
  }
}

/**
 * Normalise un objet graphique brut (ex. sortie du Realtime API) vers le format GraphPanel.
 * Retourne l'objet normalisé ou null si les données sont invalides.
 */
export function normalizeGraphData(raw) {
  if (!raw || typeof raw !== 'object') return null

  const boundingBox = ensureBoundingBox(raw.boundingBox)
  const title = typeof raw.title === 'string' && raw.title.trim() ? raw.title.trim() : 'Graphique'

  const functions = []
  if (Array.isArray(raw.functions)) {
    raw.functions.forEach((fn) => {
      const n = normalizeFunction(fn)
      if (n) functions.push(n)
    })
  }

  const elements = []
  if (Array.isArray(raw.elements)) {
    raw.elements.forEach((el) => {
      const n = normalizeElement(el)
      if (n) elements.push(n)
    })
  }

  const result = {
    title,
    boundingBox,
    showAxis: raw.showAxis !== false,
    showGrid: raw.showGrid !== false,
  }
  if (functions.length) result.functions = functions
  if (elements.length) result.elements = elements

  // Graphique 3D
  if (raw.is3D === true) {
    result.is3D = true
    const surfaces = []
    if (Array.isArray(raw.surfaces)) {
      raw.surfaces.forEach((s) => {
        const n = normalizeSurface(s)
        if (n) surfaces.push(n)
      })
    }
    if (surfaces.length) result.surfaces = surfaces
    const curves3D = []
    if (Array.isArray(raw.curves3D) || Array.isArray(raw.curves3d)) {
      ;(raw.curves3D ?? raw.curves3d).forEach((c) => {
        const n = normalizeCurve3D(c)
        if (n) curves3D.push(n)
      })
    }
    if (curves3D.length) result.curves3D = curves3D
    const elements3D = []
    if (Array.isArray(raw.elements3D) || Array.isArray(raw.elements3d)) {
      ;(raw.elements3D ?? raw.elements3d).forEach((el) => {
        const n = normalizeElement3D(el)
        if (n) elements3D.push(n)
      })
    }
    if (elements3D.length) result.elements3D = elements3D

    result.showPlanes = raw.showPlanes !== false
    let box3D = raw.boundingBox3D && raw.boundingBox3D.length >= 3
      ? ensureBoundingBox3D(raw.boundingBox3D)
      : DEFAULT_BOUNDING_BOX_3D
    if (surfaces.length && (!raw.boundingBox3D || raw.boundingBox3D.length < 3)) {
      const s = result.surfaces[0]
      const xR = s.xRange
      const yR = s.yRange
      box3D = [
        [Math.min(xR[0], xR[1]), Math.max(xR[0], xR[1])],
        [Math.min(yR[0], yR[1]), Math.max(yR[0], yR[1])],
        [0, 10]
      ]
    }
    if (curves3D.length && (!raw.boundingBox3D || raw.boundingBox3D.length < 3) && !surfaces.length) {
      const tR = result.curves3D[0].tRange
      const span = Math.max(1, (tR[1] - tR[0]) * 0.5)
      box3D = [[-span, span], [-span, span], [-span, span]]
    }
    result.boundingBox3D = box3D
  }

  return result
}
