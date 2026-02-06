import { useEffect, useRef, useState } from 'react'
import { FaTimes, FaDownload, FaRedo, FaCube } from 'react-icons/fa'
import useChatStore from '../store/chatStore'
import JXG from 'jsxgraph'

const GraphPanel = () => {
  const { currentGraph, closeGraphPanel } = useChatStore()
  const boardRef = useRef(null)
  const view3DRef = useRef(null)
  const containerRef = useRef(null)
  const [error, setError] = useState(null)
  const [is3D, setIs3D] = useState(false)

  // Évaluer une expression mathématique 2D
  const evalMathExpression = (expr, x) => {
    let safeExpr = expr
      .replace(/\^/g, '**')
      .replace(/sin\(/g, 'Math.sin(')
      .replace(/cos\(/g, 'Math.cos(')
      .replace(/tan\(/g, 'Math.tan(')
      .replace(/sqrt\(/g, 'Math.sqrt(')
      .replace(/abs\(/g, 'Math.abs(')
      .replace(/log\(/g, 'Math.log(')
      .replace(/ln\(/g, 'Math.log(')
      .replace(/exp\(/g, 'Math.exp(')
      .replace(/pi/gi, 'Math.PI')
    
    const fn = new Function('x', `return ${safeExpr}`)
    return fn(x)
  }

  // Évaluer une expression mathématique 3D (avec x, y et optionnel t)
  const evalMathExpression3D = (expr, x, y, t = 0) => {
    let safeExpr = String(expr)
      .replace(/\^/g, '**')
      .replace(/sin\(/g, 'Math.sin(')
      .replace(/cos\(/g, 'Math.cos(')
      .replace(/tan\(/g, 'Math.tan(')
      .replace(/sqrt\(/g, 'Math.sqrt(')
      .replace(/abs\(/g, 'Math.abs(')
      .replace(/log\(/g, 'Math.log(')
      .replace(/ln\(/g, 'Math.log(')
      .replace(/exp\(/g, 'Math.exp(')
      .replace(/pi/gi, 'Math.PI')
    
    const fn = new Function('x', 'y', 't', `return ${safeExpr}`)
    return fn(x, y, t)
  }

  useEffect(() => {
    if (!currentGraph || !containerRef.current) return

    // Nettoyer l'ancien board
    if (boardRef.current) {
      JXG.JSXGraph.freeBoard(boardRef.current)
      boardRef.current = null
      view3DRef.current = null
    }

    setError(null)

    try {
      // currentGraph peut être { data: {...} } ou directement les données
      const graphData = currentGraph.data || currentGraph
      const is3DGraph = graphData.is3D === true
      setIs3D(is3DGraph)

      if (is3DGraph) {
        // ============ MODE 3D ============
        render3DGraph(graphData)
      } else {
        // ============ MODE 2D ============
        render2DGraph(graphData)
      }

    } catch (e) {
      console.error('Erreur JSXGraph:', e)
      setError('Erreur lors de la création du graphique')
    }

    return () => {
      if (boardRef.current) {
        JXG.JSXGraph.freeBoard(boardRef.current)
        boardRef.current = null
        view3DRef.current = null
      }
    }
  }, [currentGraph])

  // Rendu graphique 3D
  const render3DGraph = (graphData) => {
    const boundingBox = graphData.boundingBox || [-10, 10, 10, -10]
    
    // Créer le board pour la vue 3D
    const board = JXG.JSXGraph.initBoard(containerRef.current.id, {
      boundingbox: boundingBox,
      axis: false,
      showCopyright: false,
      showNavigation: false,
      pan: { enabled: false },
      zoom: { enabled: false }
    })
    boardRef.current = board

    // Configuration de la vue 3D
    const box3D = graphData.boundingBox3D || [[-5, 5], [-5, 5], [-5, 5]]
    
    const view = board.create('view3d', [
      [-6, -3],  // Position du coin inférieur gauche
      [8, 8],    // Dimensions [width, height]
      box3D      // Boîte englobante [[xMin, xMax], [yMin, yMax], [zMin, zMax]]
    ], {
      xPlaneRear: { visible: graphData.showPlanes !== false, fillOpacity: 0.1 },
      yPlaneRear: { visible: graphData.showPlanes !== false, fillOpacity: 0.1 },
      zPlaneRear: { visible: graphData.showPlanes !== false, fillOpacity: 0.1 },
      xAxis: { strokeColor: '#EF4444', strokeWidth: 2 },
      yAxis: { strokeColor: '#10B981', strokeWidth: 2 },
      zAxis: { strokeColor: '#3B82F6', strokeWidth: 2 }
    })
    view3DRef.current = view

    // Rendre les éléments 3D (supporte elements ou elements3D)
    const elements3D = graphData.elements3D || graphData.elements || []
    elements3D.forEach(element => {
      try {
        render3DElement(view, element)
      } catch (e) {
        console.error('Erreur rendu élément 3D:', element, e)
      }
    })

    // Rendre les surfaces 3D
    if (graphData.surfaces) {
      graphData.surfaces.forEach(surface => {
        try {
          renderSurface(view, surface)
        } catch (e) {
          console.error('Erreur rendu surface:', surface, e)
        }
      })
    }

    // Rendre les courbes paramétriques 3D (supporte curves3d ou curves3D)
    const curves3D = graphData.curves3d || graphData.curves3D || []
    curves3D.forEach(curve => {
      try {
        renderCurve3D(view, curve)
      } catch (e) {
        console.error('Erreur rendu courbe 3D:', curve, e)
      }
    })
  }

  // Rendu d'un élément 3D
  const render3DElement = (view, element) => {
    const { type, ...props } = element

    switch (type) {
      case 'point3d': {
        // Coordonnées: soit coords: [x,y,z] soit x, y, z séparés
        const coords = props.coords || [props.x || 0, props.y || 0, props.z || 0]
        view.create('point3d', coords, {
          name: props.label || '',
          size: props.size || 4,
          color: props.color || '#3B82F6'
        })
        break
      }

      case 'line3d': {
        // Ligne entre deux points 3D
        const pt1 = props.point1 || (props.points && props.points[0]) || [0,0,0]
        const pt2 = props.point2 || (props.points && props.points[1]) || [1,1,1]
        const p1 = view.create('point3d', pt1, { visible: false, withLabel: false })
        const p2 = view.create('point3d', pt2, { visible: false, withLabel: false })
        view.create('line3d', [p1, p2], {
          strokeColor: props.color || '#3B82F6',
          strokeWidth: props.strokeWidth || 2
        })
        break
      }

      case 'polygon3d': {
        if (props.vertices && props.vertices.length >= 3) {
          const points = props.vertices.map((v, i) => 
            view.create('point3d', v, {
              name: props.labels?.[i] || '',
              visible: props.showPoints !== false,
              size: 3,
              color: props.color || '#3B82F6'
            })
          )
          view.create('polygon3d', points, {
            fillColor: props.fillColor || '#3B82F640',
            fillOpacity: props.fillOpacity || 0.3,
            strokeColor: props.color || '#3B82F6',
            strokeWidth: props.strokeWidth || 2
          })
        }
        break
      }

      case 'vector3d': {
        // Vecteur avec flèche
        const from = props.from || [0,0,0]
        const to = props.to || [1,1,1]
        const origin = view.create('point3d', from, { visible: false, withLabel: false })
        const end = view.create('point3d', to, { visible: false, withLabel: false })
        view.create('line3d', [origin, end], {
          strokeColor: props.color || '#EF4444',
          strokeWidth: props.strokeWidth || 3,
          straightFirst: false,
          straightLast: false,
          lastArrow: { type: 2, size: 8 }
        })
        // Label du vecteur
        if (props.label) {
          const midX = (from[0] + to[0]) / 2
          const midY = (from[1] + to[1]) / 2
          const midZ = (from[2] + to[2]) / 2
          view.create('point3d', [midX + 0.2, midY + 0.2, midZ + 0.2], {
            name: props.label,
            size: 0,
            withLabel: true,
            label: { color: props.color || '#EF4444' }
          })
        }
        break
      }

      case 'sphere': {
        // Sphère centrée sur un point avec un rayon
        const center = props.center || [0,0,0]
        const radius = props.radius || 1
        const centerPt = view.create('point3d', center, { 
          visible: props.showCenter || false,
          name: props.centerLabel || '',
          size: 3
        })
        view.create('sphere3d', [centerPt, radius], {
          strokeColor: props.color || '#3B82F6',
          strokeWidth: 1,
          fillColor: props.fillColor || '#3B82F6',
          fillOpacity: props.fillOpacity || 0.3,
          gradient: 'radial'
        })
        break
      }

      case 'plane3d': {
        // Plan défini par 3 points
        if (props.points && props.points.length >= 3) {
          const p1 = view.create('point3d', props.points[0], { visible: false })
          const p2 = view.create('point3d', props.points[1], { visible: false })
          const p3 = view.create('point3d', props.points[2], { visible: false })
          view.create('plane3d', [p1, p2, p3], {
            strokeColor: props.color || '#8B5CF6',
            fillColor: props.fillColor || '#8B5CF6',
            fillOpacity: props.fillOpacity || 0.2
          })
        }
        break
      }
    }
  }

  // Rendu d'une surface z = f(x,y)
  const renderSurface = (view, surface) => {
    const xRange = surface.xRange || [-3, 3]
    const yRange = surface.yRange || [-3, 3]
    const stepsU = surface.stepsU || surface.steps || 20
    const stepsV = surface.stepsV || surface.steps || 20

    view.create('functiongraph3d', [
      (x, y) => {
        try {
          return evalMathExpression3D(surface.expression, x, y)
        } catch (e) {
          console.error('Erreur évaluation surface:', e)
          return 0
        }
      },
      xRange,
      yRange
    ], {
      strokeColor: surface.color || '#3B82F6',
      strokeWidth: 0.5,
      stepsU: stepsU,
      stepsV: stepsV,
      fillColor: surface.fillColor || surface.color || '#3B82F6',
      fillOpacity: surface.fillOpacity || 0.6
    })
  }

  // Rendu d'une courbe paramétrique 3D
  const renderCurve3D = (view, curve) => {
    const tMin = curve.tRange ? curve.tRange[0] : 0
    const tMax = curve.tRange ? curve.tRange[1] : (2 * Math.PI)

    // Fonctions pour x(t), y(t), z(t)
    const xExpr = curve.xExpr || curve.x || 'cos(t)'
    const yExpr = curve.yExpr || curve.y || 'sin(t)'
    const zExpr = curve.zExpr || curve.z || 't'

    view.create('curve3d', [
      (t) => {
        try {
          return evalMathExpression3D(xExpr, 0, 0, t)
        } catch { return 0 }
      },
      (t) => {
        try {
          return evalMathExpression3D(yExpr, 0, 0, t)
        } catch { return 0 }
      },
      (t) => {
        try {
          return evalMathExpression3D(zExpr, 0, 0, t)
        } catch { return 0 }
      },
      [tMin, tMax]
    ], {
      strokeColor: curve.color || '#EF4444',
      strokeWidth: curve.strokeWidth || 3
    })
  }

  // Rendu graphique 2D (code existant)
  const render2DGraph = (graphData) => {
    const boundingBox = graphData.boundingBox || [-10, 10, 10, -10]
    const showAxis = graphData.showAxis !== false
    const showGrid = graphData.showGrid !== false

    const board = JXG.JSXGraph.initBoard(containerRef.current.id, {
      boundingbox: boundingBox,
      axis: showAxis,
      grid: showGrid,
      showCopyright: false,
      showNavigation: true,
      pan: { enabled: true },
      zoom: { enabled: true, wheel: true }
    })

    boardRef.current = board

    // Rendre les éléments 2D
    if (graphData.elements) {
      graphData.elements.forEach(element => {
        try {
          renderElement(board, element)
        } catch (e) {
          console.error('Erreur rendu élément:', element, e)
        }
      })
    }

    // Rendre les fonctions 2D
    if (graphData.functions) {
      graphData.functions.forEach(fn => {
        try {
          board.create('functiongraph', [
            x => {
              try {
                return evalMathExpression(fn.expression, x)
              } catch {
                return NaN
              }
            },
            fn.xMin || boundingBox[0],
            fn.xMax || boundingBox[2]
          ], {
            strokeColor: fn.color || '#3B82F6',
            strokeWidth: fn.strokeWidth || 2,
            name: fn.label || ''
          })
        } catch (e) {
          console.error('Erreur fonction:', fn, e)
        }
      })
    }
  }

  // Fonction pour rendre un élément
  const renderElement = (board, element) => {
    const { type, ...props } = element

    switch (type) {
      case 'point': {
        board.create('point', [props.x, props.y], {
          name: props.label || '',
          size: props.size || 4,
          fillColor: props.color || '#3B82F6',
          strokeColor: props.color || '#3B82F6',
          fixed: props.fixed !== false
        })
        break
      }

      case 'line': {
        if (props.points) {
          const p1 = board.create('point', props.points[0], { visible: false, fixed: true })
          const p2 = board.create('point', props.points[1], { visible: false, fixed: true })
          board.create('line', [p1, p2], {
            strokeColor: props.color || '#3B82F6',
            strokeWidth: props.strokeWidth || 2,
            dash: props.dash ? 2 : 0
          })
        }
        break
      }

      case 'segment': {
        if (props.points) {
          const showPoints = props.showPoints !== false && props.labels
          const p1 = board.create('point', props.points[0], { 
            visible: showPoints,
            name: props.labels?.[0] || '',
            fixed: true,
            fillColor: props.color || '#3B82F6',
            strokeColor: props.color || '#3B82F6'
          })
          const p2 = board.create('point', props.points[1], { 
            visible: showPoints,
            name: props.labels?.[1] || '',
            fixed: true,
            fillColor: props.color || '#3B82F6',
            strokeColor: props.color || '#3B82F6'
          })
          const seg = board.create('segment', [p1, p2], {
            strokeColor: props.color || '#3B82F6',
            strokeWidth: props.strokeWidth || 2
          })
          
          // Ajouter un label au milieu du segment si spécifié
          if (props.label) {
            const midX = (props.points[0][0] + props.points[1][0]) / 2
            const midY = (props.points[0][1] + props.points[1][1]) / 2
            board.create('text', [midX + 0.2, midY + 0.2, props.label], {
              fontSize: 12,
              color: props.color || '#3B82F6'
            })
          }
        }
        break
      }

      case 'polygon':
      case 'triangle': {
        if (props.vertices) {
          const points = props.vertices.map((v, i) => 
            board.create('point', v, {
              name: props.labels?.[i] || '',
              fillColor: props.color || '#3B82F6',
              strokeColor: props.color || '#3B82F6',
              size: 4,
              fixed: true
            })
          )
          board.create('polygon', points, {
            fillColor: props.fillColor || '#3B82F615',
            borders: {
              strokeColor: props.color || '#3B82F6',
              strokeWidth: props.strokeWidth || 2
            }
          })
        }
        break
      }

      case 'circle': {
        if (props.center && props.radius) {
          const center = board.create('point', props.center, {
            name: props.centerLabel || '',
            fillColor: props.color || '#3B82F6',
            strokeColor: props.color || '#3B82F6',
            fixed: true
          })
          board.create('circle', [center, props.radius], {
            strokeColor: props.color || '#3B82F6',
            strokeWidth: props.strokeWidth || 2,
            fillColor: props.fillColor || 'transparent'
          })
        }
        break
      }

      case 'arc': {
        if (props.center && props.radius) {
          const startAngle = (props.startAngle || 0) * Math.PI / 180
          const endAngle = (props.endAngle || 90) * Math.PI / 180
          const center = board.create('point', props.center, { visible: false, fixed: true })
          const p1 = board.create('point', [
            props.center[0] + props.radius * Math.cos(startAngle),
            props.center[1] + props.radius * Math.sin(startAngle)
          ], { visible: false, fixed: true })
          const p2 = board.create('point', [
            props.center[0] + props.radius * Math.cos(endAngle),
            props.center[1] + props.radius * Math.sin(endAngle)
          ], { visible: false, fixed: true })
          board.create('arc', [center, p1, p2], {
            strokeColor: props.color || '#8B5CF6',
            strokeWidth: props.strokeWidth || 2
          })
        }
        break
      }

      case 'angle': {
        if (props.points && props.points.length === 3) {
          const points = props.points.map(p => 
            board.create('point', p, { visible: false, fixed: true })
          )
          board.create('angle', points, {
            radius: props.radius || 0.5,
            fillColor: props.fillColor || '#3B82F620',
            strokeColor: props.color || '#3B82F6',
            name: props.label || '',
            withLabel: !!props.label
          })
        }
        break
      }

      case 'rightangle': {
        if (props.points && props.points.length === 3) {
          const size = props.size || 0.3
          const [p1, vertex, p2] = props.points
          
          // Calculer les vecteurs unitaires
          const v1 = [p1[0] - vertex[0], p1[1] - vertex[1]]
          const v2 = [p2[0] - vertex[0], p2[1] - vertex[1]]
          const len1 = Math.sqrt(v1[0]*v1[0] + v1[1]*v1[1])
          const len2 = Math.sqrt(v2[0]*v2[0] + v2[1]*v2[1])
          const u1 = [v1[0]/len1 * size, v1[1]/len1 * size]
          const u2 = [v2[0]/len2 * size, v2[1]/len2 * size]
          
          // Points du carré d'angle droit
          const corner1 = [vertex[0] + u1[0], vertex[1] + u1[1]]
          const corner2 = [vertex[0] + u1[0] + u2[0], vertex[1] + u1[1] + u2[1]]
          const corner3 = [vertex[0] + u2[0], vertex[1] + u2[1]]
          
          // Créer le carré
          const pts = [corner1, corner2, corner3].map(p => 
            board.create('point', p, { visible: false, fixed: true })
          )
          const vertexPt = board.create('point', vertex, { visible: false, fixed: true })
          
          board.create('polygon', [vertexPt, pts[0], pts[1], pts[2]], {
            fillColor: '#3B82F620',
            borders: {
              strokeColor: '#3B82F6',
              strokeWidth: 1
            }
          })
        }
        break
      }

      case 'text': {
        board.create('text', [props.x, props.y, props.content], {
          fontSize: props.fontSize || 14,
          strokeColor: props.color || '#1F2937',
          cssStyle: 'font-family: Inter, sans-serif'
        })
        break
      }

      case 'vector': {
        if (props.from && props.to) {
          const p1 = board.create('point', props.from, { visible: false, fixed: true })
          const p2 = board.create('point', props.to, { visible: false, fixed: true })
          board.create('arrow', [p1, p2], {
            strokeColor: props.color || '#EF4444',
            strokeWidth: props.strokeWidth || 2
          })
          if (props.label) {
            const midX = (props.from[0] + props.to[0]) / 2
            const midY = (props.from[1] + props.to[1]) / 2
            board.create('text', [midX + 0.2, midY + 0.2, props.label], {
              fontSize: 12,
              color: props.color || '#EF4444'
            })
          }
        }
        break
      }

      case 'parallel': {
        if (props.line && props.point) {
          const l1 = board.create('point', props.line[0], { visible: false, fixed: true })
          const l2 = board.create('point', props.line[1], { visible: false, fixed: true })
          const line = board.create('line', [l1, l2], { visible: false })
          const pt = board.create('point', props.point, { visible: false, fixed: true })
          board.create('parallel', [line, pt], {
            strokeColor: props.color || '#10B981',
            strokeWidth: props.strokeWidth || 2,
            dash: props.dash ? 2 : 0
          })
        }
        break
      }

      case 'perpendicular': {
        if (props.line && props.point) {
          const l1 = board.create('point', props.line[0], { visible: false, fixed: true })
          const l2 = board.create('point', props.line[1], { visible: false, fixed: true })
          const line = board.create('line', [l1, l2], { visible: false })
          const pt = board.create('point', props.point, { 
            visible: props.showPoint !== false,
            name: props.pointLabel || '',
            fixed: true
          })
          board.create('perpendicular', [line, pt], {
            strokeColor: props.color || '#EF4444',
            strokeWidth: props.strokeWidth || 2
          })
        }
        break
      }

      case 'midpoint': {
        if (props.points) {
          const p1 = board.create('point', props.points[0], { visible: false, fixed: true })
          const p2 = board.create('point', props.points[1], { visible: false, fixed: true })
          board.create('midpoint', [p1, p2], {
            name: props.label || 'M',
            fillColor: props.color || '#8B5CF6',
            strokeColor: props.color || '#8B5CF6',
            size: 4,
            fixed: true
          })
        }
        break
      }

      case 'height': {
        if (props.vertex && props.base) {
          const vertex = board.create('point', props.vertex, { visible: false, fixed: true })
          const b1 = board.create('point', props.base[0], { visible: false, fixed: true })
          const b2 = board.create('point', props.base[1], { visible: false, fixed: true })
          const baseLine = board.create('line', [b1, b2], { visible: false })
          
          // Projection orthogonale
          const foot = board.create('perpendicularpoint', [vertex, baseLine], {
            name: props.label || 'H',
            fillColor: props.color || '#EF4444',
            strokeColor: props.color || '#EF4444',
            size: 4,
            fixed: true
          })
          
          // Segment de la hauteur
          board.create('segment', [vertex, foot], {
            strokeColor: props.color || '#EF4444',
            strokeWidth: props.strokeWidth || 2,
            dash: 2
          })
        }
        break
      }

      case 'median': {
        if (props.vertex && props.opposite) {
          const vertex = board.create('point', props.vertex, { visible: false, fixed: true })
          const o1 = board.create('point', props.opposite[0], { visible: false, fixed: true })
          const o2 = board.create('point', props.opposite[1], { visible: false, fixed: true })
          const mid = board.create('midpoint', [o1, o2], {
            name: props.label || 'M',
            fillColor: props.color || '#F59E0B',
            strokeColor: props.color || '#F59E0B',
            size: 3,
            fixed: true
          })
          board.create('segment', [vertex, mid], {
            strokeColor: props.color || '#F59E0B',
            strokeWidth: props.strokeWidth || 2
          })
        }
        break
      }

      case 'projection': {
        if (props.point && props.line) {
          const pt = board.create('point', props.point, { 
            visible: true,
            fillColor: props.color || '#10B981',
            strokeColor: props.color || '#10B981',
            fixed: true
          })
          const l1 = board.create('point', props.line[0], { visible: false, fixed: true })
          const l2 = board.create('point', props.line[1], { visible: false, fixed: true })
          const line = board.create('line', [l1, l2], { visible: false })
          
          const proj = board.create('perpendicularpoint', [pt, line], {
            name: props.label || "P'",
            fillColor: props.color || '#10B981',
            strokeColor: props.color || '#10B981',
            size: 4,
            fixed: true
          })
          
          if (props.showDash !== false) {
            board.create('segment', [pt, proj], {
              strokeColor: props.color || '#10B981',
              strokeWidth: 1,
              dash: 2
            })
          }
        }
        break
      }

      case 'measure': {
        if (props.points) {
          const offset = props.offset || 0.3
          const [p1, p2] = props.points
          
          // Direction perpendiculaire
          const dx = p2[0] - p1[0]
          const dy = p2[1] - p1[1]
          const len = Math.sqrt(dx*dx + dy*dy)
          const nx = -dy/len * offset
          const ny = dx/len * offset
          
          // Points décalés
          const o1 = [p1[0] + nx, p1[1] + ny]
          const o2 = [p2[0] + nx, p2[1] + ny]
          
          const pt1 = board.create('point', o1, { visible: false, fixed: true })
          const pt2 = board.create('point', o2, { visible: false, fixed: true })
          
          board.create('segment', [pt1, pt2], {
            strokeColor: props.color || '#6B7280',
            strokeWidth: 1
          })
          
          // Petites lignes aux extrémités
          const tickSize = 0.15
          board.create('segment', [
            [o1[0] - nx*tickSize/offset, o1[1] - ny*tickSize/offset],
            [o1[0] + nx*tickSize/offset, o1[1] + ny*tickSize/offset]
          ].map(p => board.create('point', p, { visible: false, fixed: true })), {
            strokeColor: props.color || '#6B7280',
            strokeWidth: 1
          })
          
          // Label
          if (props.label) {
            const midX = (o1[0] + o2[0]) / 2
            const midY = (o1[1] + o2[1]) / 2
            board.create('text', [midX + nx*0.5, midY + ny*0.5, props.label], {
              fontSize: 11,
              strokeColor: props.color || '#6B7280'
            })
          }
        }
        break
      }

      default:
        console.warn('Type d\'élément non supporté:', type)
    }
  }

  const handleDownload = () => {
    if (boardRef.current) {
      const svg = boardRef.current.renderer.svgRoot
      const svgData = new XMLSerializer().serializeToString(svg)
      const blob = new Blob([svgData], { type: 'image/svg+xml' })
      const url = URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = 'tutoria_graph.svg'
      link.click()
      URL.revokeObjectURL(url)
    }
  }

  const handleReset = () => {
    if (boardRef.current && currentGraph) {
      boardRef.current.setBoundingBox(
        currentGraph.boundingBox || [-10, 10, 10, -10],
        true
      )
    }
  }

  return (
    <div className="w-[500px] bg-white border-l border-slate-200 flex flex-col flex-shrink-0">
      {/* Header */}
      <div className="px-4 py-3 border-b border-slate-200 flex items-center justify-between">
        <h3 className="font-semibold text-slate-800 flex items-center gap-2">
          <span className="text-primary-500">📊</span>
          Visualisation Interactive
        </h3>
        <button
          onClick={closeGraphPanel}
          className="w-8 h-8 flex items-center justify-center rounded-lg text-slate-500 hover:bg-slate-100 transition-all"
        >
          <FaTimes />
        </button>
      </div>

      {/* Titre du graphique */}
      {currentGraph?.title && (
        <div className="px-4 py-2 bg-gradient-to-r from-blue-50 to-indigo-50 border-b border-slate-200">
          <div className="flex items-center gap-2">
            <p className="text-sm font-semibold text-slate-800">{currentGraph.title}</p>
            {is3D && (
              <span className="px-2 py-0.5 text-xs font-bold bg-gradient-to-r from-purple-500 to-indigo-500 text-white rounded-full">
                3D
              </span>
            )}
          </div>
          {currentGraph.description && (
            <p className="text-xs text-slate-600 mt-0.5">{currentGraph.description}</p>
          )}
        </div>
      )}

      {/* Zone du graphique JSXGraph */}
      <div className="flex-1 p-4 flex items-center justify-center overflow-hidden bg-slate-50">
        {error ? (
          <div className="text-red-500 text-center">
            <p>{error}</p>
          </div>
        ) : (
          <div
            id="jsxgraph-container"
            ref={containerRef}
            className="w-full h-full min-h-[400px] rounded-lg border border-slate-200 bg-white shadow-sm"
          />
        )}
      </div>

      {/* Instructions */}
      <div className="px-4 py-2 bg-blue-50 border-t border-blue-100">
        <p className="text-xs text-blue-600">
          {is3D 
            ? "💡 Clic + Glisser = Rotation 3D | Molette = Zoom | Shift + Glisser = Déplacer"
            : "💡 Molette = Zoom | Clic + Glisser = Déplacer | Double-clic = Réinitialiser"
          }
        </p>
      </div>

      {/* Actions */}
      <div className="p-4 border-t border-slate-200 flex gap-2">
        <button
          onClick={handleReset}
          className="flex-1 py-2.5 px-4 bg-slate-100 text-slate-600 rounded-lg font-medium flex items-center justify-center gap-2 hover:bg-slate-200 transition-all"
        >
          <FaRedo className="text-sm" />
          Réinitialiser
        </button>
        <button
          onClick={handleDownload}
          className="flex-1 py-2.5 px-4 bg-primary-500 text-white rounded-lg font-medium flex items-center justify-center gap-2 hover:bg-primary-600 transition-all"
        >
          <FaDownload className="text-sm" />
          Télécharger
        </button>
      </div>
    </div>
  )
}

export default GraphPanel
