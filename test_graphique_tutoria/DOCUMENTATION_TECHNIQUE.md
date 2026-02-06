# 📚 TutorIA - Documentation Technique Complète

## Table des Matières

1. [Vue d'ensemble du projet](#vue-densemble-du-projet)
2. [Stack Technologique](#stack-technologique)
3. [Architecture du Projet](#architecture-du-projet)
4. [Backend FastAPI](#backend-fastapi)
5. [Configuration OpenAI API](#configuration-openai-api)
6. [Frontend React](#frontend-react)
7. [Système de Graphiques JSXGraph](#système-de-graphiques-jsxgraph)
8. [Graphiques 3D](#graphiques-3d)
9. [Communication WebSocket](#communication-websocket)
10. [🎤 Mode Vocal Realtime API](#mode-vocal-realtime-api)
11. [Problèmes Rencontrés et Solutions](#problèmes-rencontrés-et-solutions)
12. [Démarrage du Projet](#démarrage-du-projet)

---

## Vue d'ensemble du projet

**TutorIA** est une application éducative interactive utilisant l'intelligence artificielle pour aider les élèves à apprendre les mathématiques et les sciences. L'application génère des graphiques et figures géométriques dynamiques en réponse aux questions des utilisateurs.

### Fonctionnalités principales :
- Chat en temps réel avec IA (GPT-4o)
- **🎤 Mode Vocal Temps Réel** avec OpenAI Realtime API (WebRTC)
- Génération de graphiques 2D interactifs (fonctions, géométrie, statistiques)
- Génération de graphiques 3D (surfaces, sphères, vecteurs, courbes paramétriques)
- Rendu côté client avec JSXGraph pour une interactivité maximale

---

## Stack Technologique

### Backend
| Technologie | Version | Rôle |
|-------------|---------|------|
| **Python** | 3.12 | Langage serveur |
| **FastAPI** | 0.109.0 | Framework web asynchrone |
| **Uvicorn** | 0.27.0 | Serveur ASGI |
| **OpenAI** | 2.16.0+ | API GPT-4o + Realtime API |
| **httpx** | 0.26.0+ | Client HTTP asynchrone |
| **WebSockets** | 12.0 | Communication temps réel |

### Frontend
| Technologie | Version | Rôle |
|-------------|---------|------|
| **React** | 18.2.0 | Bibliothèque UI |
| **Vite** | 5.0.12 | Build tool & dev server |
| **Tailwind CSS** | 3.4.1 | Styling utilitaire |
| **Zustand** | 4.5.0 | State management |
| **JSXGraph** | 1.12.2 | Rendu graphiques mathématiques |
| **WebRTC** | Native | Communication vocale temps réel |

---

## Architecture du Projet

```
test_graphique_tutoria/
├── backend/
│   ├── app.py                 # Serveur FastAPI principal
│   ├── graph_generator.py     # Générateur de graphiques (legacy)
│   └── openai_realtime.py     # Module API Realtime (optionnel)
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── ChatPanel.jsx      # Interface de chat
│   │   │   ├── GraphPanel.jsx     # Rendu JSXGraph 2D/3D
│   │   │   └── Header.jsx         # En-tête
│   │   ├── hooks/
│   │   │   └── useWebSocket.js    # Hook WebSocket
│   │   ├── store/
│   │   │   └── chatStore.js       # État global Zustand
│   │   ├── App.jsx
│   │   └── main.jsx
│   ├── package.json
│   ├── tailwind.config.js
│   └── vite.config.js
├── static/
│   └── graphs/                # Graphiques générés (legacy)
├── .env                       # Variables d'environnement
├── requirements.txt           # Dépendances Python
└── start.sh                   # Script de démarrage
```

---

## Backend FastAPI

### Configuration principale (`backend/app.py`)

```python
from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv
from openai import OpenAI

load_dotenv()

app = FastAPI(
    title="TutorIA - Assistant Éducatif",
    description="Application éducative avec IA et génération de graphiques",
    version="1.0.0"
)

# CORS - Important pour permettre les requêtes cross-origin
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # En production, spécifier les domaines autorisés
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
```

### Endpoint WebSocket pour le Chat

Le cœur de l'application est l'endpoint WebSocket qui gère la communication bidirectionnelle :

```python
@app.websocket("/ws/chat/{session_id}")
async def websocket_chat(websocket: WebSocket, session_id: str):
    """WebSocket simplifié pour le chat texte uniquement."""
    await websocket.accept()
    
    from openai import OpenAI
    client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))
    
    # Historique des messages pour le contexte
    messages = [
        {
            "role": "system",
            "content": """Tu es TutorIA, un assistant pédagogique...
            
IMPORTANT: Quand tu dois générer un graphique, réponds avec un bloc JSON:

```jsxgraph
{
  "title": "Titre du graphique",
  "boundingBox": [xMin, yMax, xMax, yMin],
  "elements": [...],
  "functions": [...]
}
```"""
        }
    ]
    
    await websocket.send_json({
        "type": "connected",
        "message": "Bienvenue sur TutorIA!"
    })
    
    try:
        while True:
            data = await websocket.receive_json()
            
            if data.get("type") == "text":
                user_text = data.get("text", "")
                messages.append({"role": "user", "content": user_text})
                
                # Appel à l'API OpenAI
                response = client.chat.completions.create(
                    model="gpt-4o",
                    messages=messages,
                    temperature=0.7,
                    max_tokens=2000
                )
                
                assistant_message = response.choices[0].message.content
                messages.append({"role": "assistant", "content": assistant_message})
                
                # Extraction du bloc JSXGraph si présent
                if '```jsxgraph' in assistant_message:
                    # Parser le JSON et l'envoyer comme graphique
                    start = assistant_message.find('```jsxgraph')
                    end = assistant_message.find('```', start + 11)
                    json_str = assistant_message[start + 11:end].strip()
                    graph_data = json.loads(json_str)
                    
                    await websocket.send_json({
                        "type": "graph",
                        "data": graph_data
                    })
                
                # Envoyer la réponse texte
                await websocket.send_json({
                    "type": "assistant_message",
                    "content": assistant_message
                })
                
    except WebSocketDisconnect:
        print(f"Session {session_id} déconnectée")
```

---

## Configuration OpenAI API

### Fichier `.env`

```env
OPENAI_API_KEY=sk-votre-clé-api-ici
```

### ⚠️ Problème Fréquent : Version du package OpenAI

**Erreur rencontrée :**
```
TypeError: Client.__init__() got an unexpected keyword argument 'proxies'
```

**Cause :** Version trop ancienne du package `openai` (< 1.0.0)

**Solution :** Mettre à jour vers la version 2.x :
```bash
pip install openai>=2.16.0
```

Le fichier `requirements.txt` initial avait `openai==1.12.0`, ce qui causait des incompatibilités.

### Utilisation correcte de l'API OpenAI (v2.x)

```python
from openai import OpenAI

# Créer le client (plus besoin de proxies ou configuration complexe)
client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))

# Appel simple
response = client.chat.completions.create(
    model="gpt-4o",
    messages=[
        {"role": "system", "content": "Tu es un assistant..."},
        {"role": "user", "content": "Question de l'utilisateur"}
    ],
    temperature=0.7,
    max_tokens=2000
)

# Accès à la réponse
texte = response.choices[0].message.content
```

---

## Frontend React

### State Management avec Zustand (`store/chatStore.js`)

Zustand offre un état global simple et performant :

```javascript
import { create } from 'zustand'

const generateSessionId = () => {
  return 'session_' + Math.random().toString(36).substr(2, 9)
}

export const useChatStore = create((set, get) => ({
  // État
  sessionId: generateSessionId(),
  messages: [],
  isConnected: false,
  isLoading: false,
  currentGraph: null,      // Données du graphique actuel
  showGraphPanel: false,   // Afficher/masquer le panneau graphique
  socket: null,            // Référence WebSocket

  // Actions
  setConnected: (connected) => set({ isConnected: connected }),
  setLoading: (loading) => set({ isLoading: loading }),
  
  addMessage: (message) => set((state) => ({
    messages: [...state.messages, {
      ...message,
      id: Date.now().toString(),
      timestamp: new Date(),
    }]
  })),

  setCurrentGraph: (graph) => set({ 
    currentGraph: graph, 
    showGraphPanel: !!graph 
  }),

  // Important: stocker la référence du socket
  setSocket: (socket) => set({ socket }),

  // Envoyer un message
  sendMessage: (text) => {
    const { socket, isConnected } = get()
    if (!text.trim() || !isConnected || !socket) return false

    get().addMessage({ role: 'user', content: text })
    set({ isLoading: true })

    socket.send(JSON.stringify({ type: 'text', text }))
    return true
  },
}))

export default useChatStore
```

### Hook WebSocket (`hooks/useWebSocket.js`)

Gestion de la connexion WebSocket avec reconnexion automatique :

```javascript
import { useEffect, useRef, useCallback } from 'react'
import useChatStore from '../store/chatStore'

const useWebSocket = () => {
  const socketRef = useRef(null)
  const reconnectAttempts = useRef(0)
  const maxReconnectAttempts = 5

  const { 
    sessionId, 
    setConnected, 
    addMessage, 
    setCurrentGraph,
    setLoading,
    setSocket  // Important !
  } = useChatStore()

  const connect = useCallback(() => {
    if (socketRef.current?.readyState === WebSocket.OPEN) return

    // Construction de l'URL WebSocket
    const wsProtocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:'
    const wsHost = window.location.hostname
    const wsPort = '8001'  // Port du backend
    const wsUrl = `${wsProtocol}//${wsHost}:${wsPort}/ws/chat/${sessionId}`

    socketRef.current = new WebSocket(wsUrl)

    socketRef.current.onopen = () => {
      console.log('✅ WebSocket connecté')
      setConnected(true)
      setSocket(socketRef.current)  // Passer le socket au store !
      reconnectAttempts.current = 0
    }

    socketRef.current.onmessage = (event) => {
      const data = JSON.parse(event.data)

      if (data.type === 'assistant_message' || data.type === 'response') {
        setLoading(false)
        addMessage({
          role: 'assistant',
          content: data.content || data.text,
        })
      } else if (data.type === 'graph') {
        // Réception des données graphique
        setCurrentGraph(data.data || data)
      }
    }

    socketRef.current.onclose = () => {
      setConnected(false)
      setSocket(null)
      
      // Reconnexion avec backoff exponentiel
      if (reconnectAttempts.current < maxReconnectAttempts) {
        const delay = Math.min(1000 * Math.pow(2, reconnectAttempts.current), 10000)
        setTimeout(() => {
          reconnectAttempts.current++
          connect()
        }, delay)
      }
    }
  }, [sessionId, setConnected, addMessage, setCurrentGraph, setLoading, setSocket])

  useEffect(() => {
    connect()
    return () => socketRef.current?.close()
  }, [connect])

  return { connect, disconnect: () => socketRef.current?.close() }
}

export default useWebSocket
```

---

## Système de Graphiques JSXGraph

### Pourquoi JSXGraph ?

1. **Rendu côté client** : Pas besoin de générer des images sur le serveur
2. **Interactivité** : Zoom, déplacement, manipulation des éléments
3. **Support 2D et 3D** : Graphiques mathématiques complets
4. **Léger** : ~200KB minifié

### Installation

```bash
npm install jsxgraph
```

### Composant GraphPanel (`components/GraphPanel.jsx`)

```jsx
import { useEffect, useRef, useState } from 'react'
import useChatStore from '../store/chatStore'
import JXG from 'jsxgraph'

const GraphPanel = () => {
  const { currentGraph, closeGraphPanel } = useChatStore()
  const boardRef = useRef(null)
  const containerRef = useRef(null)
  const [is3D, setIs3D] = useState(false)

  // Évaluer une expression mathématique (ex: "x^2 + 2*x")
  const evalMathExpression = (expr, x) => {
    let safeExpr = expr
      .replace(/\^/g, '**')           // x^2 → x**2
      .replace(/sin\(/g, 'Math.sin(')
      .replace(/cos\(/g, 'Math.cos(')
      .replace(/tan\(/g, 'Math.tan(')
      .replace(/sqrt\(/g, 'Math.sqrt(')
      .replace(/abs\(/g, 'Math.abs(')
      .replace(/log\(/g, 'Math.log(')
      .replace(/exp\(/g, 'Math.exp(')
      .replace(/pi/gi, 'Math.PI')
    
    const fn = new Function('x', `return ${safeExpr}`)
    return fn(x)
  }

  useEffect(() => {
    if (!currentGraph || !containerRef.current) return

    // Nettoyer l'ancien graphique
    if (boardRef.current) {
      JXG.JSXGraph.freeBoard(boardRef.current)
      boardRef.current = null
    }

    const graphData = currentGraph
    const is3DGraph = graphData.is3D === true
    setIs3D(is3DGraph)

    if (is3DGraph) {
      render3DGraph(graphData)
    } else {
      render2DGraph(graphData)
    }

    return () => {
      if (boardRef.current) {
        JXG.JSXGraph.freeBoard(boardRef.current)
      }
    }
  }, [currentGraph])

  // Rendu 2D
  const render2DGraph = (graphData) => {
    const boundingBox = graphData.boundingBox || [-10, 10, 10, -10]
    
    const board = JXG.JSXGraph.initBoard(containerRef.current.id, {
      boundingbox: boundingBox,
      axis: graphData.showAxis !== false,
      grid: graphData.showGrid !== false,
      showCopyright: false,
      showNavigation: true,
      pan: { enabled: true },
      zoom: { enabled: true, wheel: true }
    })

    boardRef.current = board

    // Rendre les éléments (points, segments, cercles, etc.)
    if (graphData.elements) {
      graphData.elements.forEach(element => {
        renderElement(board, element)
      })
    }

    // Rendre les fonctions mathématiques
    if (graphData.functions) {
      graphData.functions.forEach(fn => {
        board.create('functiongraph', [
          x => evalMathExpression(fn.expression, x),
          fn.xMin || boundingBox[0],
          fn.xMax || boundingBox[2]
        ], {
          strokeColor: fn.color || '#3B82F6',
          strokeWidth: fn.strokeWidth || 2,
          name: fn.label || ''
        })
      })
    }
  }

  // Rendre un élément 2D
  const renderElement = (board, element) => {
    const { type, ...props } = element

    switch (type) {
      case 'point':
        board.create('point', [props.x, props.y], {
          name: props.label || '',
          size: props.size || 4,
          fillColor: props.color || '#3B82F6'
        })
        break

      case 'segment':
        if (props.points) {
          const p1 = board.create('point', props.points[0], { visible: false })
          const p2 = board.create('point', props.points[1], { visible: false })
          board.create('segment', [p1, p2], {
            strokeColor: props.color || '#3B82F6',
            strokeWidth: props.strokeWidth || 2
          })
        }
        break

      case 'polygon':
        if (props.vertices) {
          const points = props.vertices.map((v, i) => 
            board.create('point', v, {
              name: props.labels?.[i] || '',
              fillColor: props.color || '#3B82F6'
            })
          )
          board.create('polygon', points, {
            fillColor: props.fillColor || '#3B82F620',
            borders: { strokeColor: props.color || '#3B82F6' }
          })
        }
        break

      case 'circle':
        const center = board.create('point', props.center || [0, 0], {
          name: props.centerLabel || '',
          visible: props.showCenter !== false
        })
        board.create('circle', [center, props.radius || 1], {
          strokeColor: props.color || '#3B82F6',
          fillColor: props.fillColor || 'transparent'
        })
        break

      case 'rightangle':
        // Angle droit avec marque carrée
        if (props.points && props.points.length === 3) {
          const [A, vertex, B] = props.points
          const pA = board.create('point', A, { visible: false })
          const pV = board.create('point', vertex, { visible: false })
          const pB = board.create('point', B, { visible: false })
          board.create('angle', [pA, pV, pB], {
            type: 'square',
            orthoType: 'square',
            radius: props.size || 0.5,
            fillColor: '#3B82F620'
          })
        }
        break

      // ... autres types (line, arc, angle, vector, text, etc.)
    }
  }

  return (
    <div className="w-[500px] bg-white border-l flex flex-col">
      <div className="px-4 py-3 border-b flex items-center justify-between">
        <h3 className="font-semibold flex items-center gap-2">
          📊 Visualisation {is3D && <span className="text-xs bg-purple-500 text-white px-2 rounded-full">3D</span>}
        </h3>
        <button onClick={closeGraphPanel}>✕</button>
      </div>
      
      <div className="flex-1 p-4">
        <div
          id="jsxgraph-container"
          ref={containerRef}
          className="w-full h-full min-h-[400px] rounded-lg border"
        />
      </div>
    </div>
  )
}

export default GraphPanel
```

---

## Graphiques 3D

### Configuration de la vue 3D

```javascript
const render3DGraph = (graphData) => {
  // Créer le board 2D qui contiendra la vue 3D
  const board = JXG.JSXGraph.initBoard(containerRef.current.id, {
    boundingbox: [-10, 10, 10, -10],
    axis: false,
    showCopyright: false,
    pan: { enabled: false },
    zoom: { enabled: false }
  })
  boardRef.current = board

  // Configuration de la boîte 3D
  const box3D = graphData.boundingBox3D || [[-5, 5], [-5, 5], [-5, 5]]
  
  // Créer la vue 3D
  const view = board.create('view3d', [
    [-6, -3],    // Position dans le board 2D
    [8, 8],      // Dimensions
    box3D        // [[xMin, xMax], [yMin, yMax], [zMin, zMax]]
  ], {
    xPlaneRear: { visible: true, fillOpacity: 0.1 },
    yPlaneRear: { visible: true, fillOpacity: 0.1 },
    zPlaneRear: { visible: true, fillOpacity: 0.1 },
    xAxis: { strokeColor: '#EF4444', strokeWidth: 2 },  // Rouge
    yAxis: { strokeColor: '#10B981', strokeWidth: 2 },  // Vert
    zAxis: { strokeColor: '#3B82F6', strokeWidth: 2 }   // Bleu
  })
  view3DRef.current = view

  // Rendre les éléments 3D
  const elements3D = graphData.elements3D || graphData.elements || []
  elements3D.forEach(element => render3DElement(view, element))

  // Rendre les surfaces z = f(x,y)
  if (graphData.surfaces) {
    graphData.surfaces.forEach(surface => renderSurface(view, surface))
  }

  // Rendre les courbes paramétriques 3D
  const curves3D = graphData.curves3d || graphData.curves3D || []
  curves3D.forEach(curve => renderCurve3D(view, curve))
}
```

### Éléments 3D supportés

```javascript
const render3DElement = (view, element) => {
  const { type, ...props } = element

  switch (type) {
    case 'point3d':
      const coords = props.coords || [props.x || 0, props.y || 0, props.z || 0]
      view.create('point3d', coords, {
        name: props.label || '',
        size: props.size || 4,
        color: props.color || '#3B82F6'
      })
      break

    case 'line3d':
      const pt1 = props.point1 || [0, 0, 0]
      const pt2 = props.point2 || [1, 1, 1]
      const p1 = view.create('point3d', pt1, { visible: false })
      const p2 = view.create('point3d', pt2, { visible: false })
      view.create('line3d', [p1, p2], {
        strokeColor: props.color || '#3B82F6',
        strokeWidth: props.strokeWidth || 2
      })
      break

    case 'vector3d':
      const from = props.from || [0, 0, 0]
      const to = props.to || [1, 1, 1]
      const origin = view.create('point3d', from, { visible: false })
      const end = view.create('point3d', to, { visible: false })
      view.create('line3d', [origin, end], {
        strokeColor: props.color || '#EF4444',
        strokeWidth: props.strokeWidth || 3,
        straightFirst: false,
        straightLast: false,
        lastArrow: { type: 2, size: 8 }
      })
      break

    case 'sphere':
      const center = props.center || [0, 0, 0]
      const radius = props.radius || 1
      const centerPt = view.create('point3d', center, { 
        visible: props.showCenter || false,
        name: props.centerLabel || ''
      })
      view.create('sphere3d', [centerPt, radius], {
        strokeColor: props.color || '#3B82F6',
        fillColor: props.fillColor || '#3B82F6',
        fillOpacity: props.fillOpacity || 0.3
      })
      break

    case 'polygon3d':
      if (props.vertices && props.vertices.length >= 3) {
        const points = props.vertices.map((v, i) => 
          view.create('point3d', v, {
            name: props.labels?.[i] || '',
            visible: props.showPoints !== false
          })
        )
        view.create('polygon3d', points, {
          fillColor: props.fillColor || '#3B82F640',
          fillOpacity: props.fillOpacity || 0.3,
          strokeColor: props.color || '#3B82F6'
        })
      }
      break

    case 'plane3d':
      if (props.points && props.points.length >= 3) {
        const p1 = view.create('point3d', props.points[0], { visible: false })
        const p2 = view.create('point3d', props.points[1], { visible: false })
        const p3 = view.create('point3d', props.points[2], { visible: false })
        view.create('plane3d', [p1, p2, p3], {
          fillColor: props.fillColor || '#8B5CF6',
          fillOpacity: props.fillOpacity || 0.2
        })
      }
      break
  }
}
```

### Surfaces 3D (z = f(x,y))

```javascript
// Évaluer une expression 3D avec x, y et t
const evalMathExpression3D = (expr, x, y, t = 0) => {
  let safeExpr = String(expr)
    .replace(/\^/g, '**')
    .replace(/sin\(/g, 'Math.sin(')
    .replace(/cos\(/g, 'Math.cos(')
    .replace(/sqrt\(/g, 'Math.sqrt(')
    .replace(/exp\(/g, 'Math.exp(')
    .replace(/pi/gi, 'Math.PI')
  
  const fn = new Function('x', 'y', 't', `return ${safeExpr}`)
  return fn(x, y, t)
}

const renderSurface = (view, surface) => {
  const xRange = surface.xRange || [-3, 3]
  const yRange = surface.yRange || [-3, 3]
  const stepsU = surface.stepsU || 20
  const stepsV = surface.stepsV || 20

  view.create('functiongraph3d', [
    (x, y) => evalMathExpression3D(surface.expression, x, y),
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
```

### Courbes Paramétriques 3D

```javascript
const renderCurve3D = (view, curve) => {
  const tMin = curve.tRange ? curve.tRange[0] : 0
  const tMax = curve.tRange ? curve.tRange[1] : (2 * Math.PI)

  const xExpr = curve.xExpr || 'cos(t)'
  const yExpr = curve.yExpr || 'sin(t)'
  const zExpr = curve.zExpr || 't'

  view.create('curve3d', [
    (t) => evalMathExpression3D(xExpr, 0, 0, t),
    (t) => evalMathExpression3D(yExpr, 0, 0, t),
    (t) => evalMathExpression3D(zExpr, 0, 0, t),
    [tMin, tMax]
  ], {
    strokeColor: curve.color || '#EF4444',
    strokeWidth: curve.strokeWidth || 3
  })
}
```

---

## Communication WebSocket

### Flux de données

```
┌─────────────────┐    WebSocket     ┌─────────────────┐     API      ┌──────────┐
│                 │ ──────────────►  │                 │ ──────────►  │          │
│   Frontend      │   JSON message   │   Backend       │   Chat       │  OpenAI  │
│   (React)       │ ◄──────────────  │   (FastAPI)     │ ◄──────────  │  GPT-4o  │
│                 │   JSON response  │                 │   Response   │          │
└─────────────────┘                  └─────────────────┘              └──────────┘
```

### Format des messages

**Client → Serveur (envoi de message)**
```json
{
  "type": "text",
  "text": "Trace la fonction f(x) = x²"
}
```

**Serveur → Client (réponse texte)**
```json
{
  "type": "assistant_message",
  "content": "Voici la représentation de f(x) = x²..."
}
```

**Serveur → Client (données graphique)**
```json
{
  "type": "graph",
  "data": {
    "title": "Fonction f(x) = x²",
    "boundingBox": [-5, 10, 5, -2],
    "showAxis": true,
    "showGrid": true,
    "functions": [
      {
        "expression": "x^2",
        "color": "#3B82F6",
        "label": "f(x) = x²"
      }
    ]
  }
}
```

---

## Problèmes Rencontrés et Solutions

### 1. Conflit de port

**Problème :** Le port 8000 était déjà utilisé par un autre service.

**Solution :** Changer le port du backend vers 8001.

```bash
uvicorn app:app --host 0.0.0.0 --port 8001 --reload
```

Et mettre à jour le frontend pour pointer vers ce port :
```javascript
const wsPort = '8001'
const wsUrl = `${wsProtocol}//${wsHost}:${wsPort}/ws/chat/${sessionId}`
```

---

### 2. Erreur OpenAI "proxies"

**Problème :**
```
TypeError: Client.__init__() got an unexpected keyword argument 'proxies'
```

**Cause :** Version obsolète du package `openai` (< 2.0)

**Solution :**
```bash
pip install --upgrade openai>=2.16.0
```

---

### 3. Boutons du chat ne fonctionnent pas

**Problème :** Les messages s'affichent mais le `sendMessage` ne fonctionne pas car le socket est `null` dans le store.

**Cause :** Le WebSocket était créé dans le hook mais pas partagé avec le store Zustand.

**Solution :** Ajouter `setSocket` au store et l'appeler quand la connexion est établie :

```javascript
// Dans chatStore.js
setSocket: (socket) => set({ socket }),

// Dans useWebSocket.js
socketRef.current.onopen = () => {
  setConnected(true)
  setSocket(socketRef.current)  // <- Important !
}
```

---

### 4. Graphiques non interactifs (images statiques)

**Problème :** Les graphiques générés par matplotlib sur le serveur étaient des images statiques sans interactivité.

**Solution :** Migration vers JSXGraph pour un rendu côté client :
- Le serveur envoie des données JSON structurées
- Le frontend interprète ces données et crée le graphique dynamiquement
- L'utilisateur peut zoomer, déplacer, manipuler les éléments

---

### 5. Éléments 3D non rendus

**Problème :** Le repère 3D s'affichait mais pas les éléments (sphères, vecteurs, etc.)

**Causes multiples :**
1. Mauvaise syntaxe de l'API JSXGraph 3D
2. Propriétés incorrectes (ex: `opacity` vs `fillOpacity`)
3. Coordonnées mal formatées

**Solutions :**
```javascript
// Avant (incorrect)
view.create('point3d', [props.x, props.y, props.z], {...})

// Après (correct)
const coords = props.coords || [props.x || 0, props.y || 0, props.z || 0]
view.create('point3d', coords, {...})

// Sphère - avant
view.create('sphere3d', [center, props.radius], {
  fillOpacity: props.opacity  // Incorrect
})

// Sphère - après
view.create('sphere3d', [centerPt, radius], {
  fillOpacity: props.fillOpacity || 0.3  // Correct
})
```

---

### 6. Quota API OpenAI dépassé

**Problème :**
```
Error: You exceeded your current quota, please check your plan and billing details.
```

**Solution :** Ajouter des crédits sur le compte OpenAI ou attendre le renouvellement du quota.

---

## Démarrage du Projet

### Prérequis
- Python 3.10+
- Node.js 18+
- Compte OpenAI avec crédits API

### Installation

```bash
# Cloner ou créer le dossier
cd test_graphique_tutoria

# Backend
python -m venv venv
source venv/bin/activate
pip install -r requirements.txt

# Configurer l'API key
echo "OPENAI_API_KEY=sk-votre-clé" > .env

# Frontend
cd frontend
npm install
```

### Démarrage

**Terminal 1 - Backend :**
```bash
cd test_graphique_tutoria
source venv/bin/activate
cd backend
uvicorn app:app --host 0.0.0.0 --port 8001 --reload
```

**Terminal 2 - Frontend :**
```bash
cd test_graphique_tutoria/frontend
npm run dev
```

### Accès
- Frontend : http://localhost:5173
- Backend API : http://localhost:8001
- Documentation API : http://localhost:8001/docs

---

## Exemples de Prompts pour l'IA

### Graphiques 2D
- "Trace la fonction f(x) = sin(x) entre -2π et 2π"
- "Dessine un triangle rectangle avec les côtés 3, 4, 5 et montre le théorème de Pythagore"
- "Illustre le théorème de Thalès avec un exemple"
- "Crée le cercle trigonométrique avec un angle de 45°"

### Graphiques 3D
- "Trace la surface z = x² + y²"
- "Dessine une sphère de rayon 2 avec les vecteurs unitaires i, j, k"
- "Montre une hélice en 3D"
- "Représente un plan passant par l'origine"

---

## Conclusion

Ce projet démontre l'intégration de plusieurs technologies modernes pour créer une application éducative interactive. Les points clés sont :

1. **Architecture découplée** : Backend FastAPI + Frontend React
2. **Communication temps réel** : WebSocket pour des réponses instantanées
3. **IA générative** : GPT-4o pour comprendre les questions et générer les données graphiques
4. **Rendu interactif** : JSXGraph pour des graphiques manipulables
5. **Support 2D et 3D** : Large gamme de visualisations mathématiques

Le système est extensible et peut être enrichi avec de nouveaux types d'éléments graphiques, des animations, ou même l'API Realtime d'OpenAI pour la voix.
