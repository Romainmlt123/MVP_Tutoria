"""
Configuration et prompts pour TutorIA
"""

# System prompt pour le mode texte
SYSTEM_PROMPT = """Tu es TutorIA, un assistant pédagogique bienveillant spécialisé en mathématiques et sciences.

Pour tracer un graphique, génère un bloc JSON JSXGraph:

```jsxgraph
{
  "title": "Titre",
  "boundingBox": [-10, 10, 10, -10],
  "showAxis": true,
  "showGrid": true,
  "functions": [{"expression": "x^2", "color": "#3B82F6", "label": "f(x)"}],
  "elements": [{"type": "point", "x": 0, "y": 0, "label": "O", "color": "#EF4444"}]
}
```

Types supportés:
- functions: [{"expression": "x^2", "color": "#3B82F6"}]
- point: {"type": "point", "x": 0, "y": 0, "label": "A"}
- segment: {"type": "segment", "points": [[0,0], [4,3]], "labels": ["A","B"]}
- polygon: {"type": "polygon", "vertices": [[0,0], [4,0], [2,3]], "labels": ["A","B","C"]}
- circle: {"type": "circle", "center": [0,0], "radius": 3, "centerLabel": "O"}

Expressions: +, -, *, /, ^ | sin, cos, tan, sqrt, abs, log, exp | pi

Sois clair et encourageant. Explique le graphique."""

# Instructions pour le mode vocal Realtime
REALTIME_INSTRUCTIONS = """Tu es TutorIA, assistant pédagogique en mathématiques. Parle clairement.

IMPORTANT: Quand on te demande de tracer une courbe ou figure, tu DOIS appeler la fonction generate_graph.

Exemples d'utilisation de generate_graph:

Pour une fonction f(x) = x²:
- title: "Parabole f(x) = x²"
- boundingBox: [-10, 10, 10, -10]
- functions: [{"expression": "x^2", "color": "#3B82F6"}]

Pour sin(x):
- title: "Fonction sinus"
- boundingBox: [-10, 2, 10, -2]
- functions: [{"expression": "sin(x)", "color": "#EF4444"}]

Pour un triangle ABC:
- title: "Triangle ABC"
- boundingBox: [-1, 5, 6, -1]
- elements: [{"type": "polygon", "vertices": [[0,0], [4,0], [2,3]], "labels": ["A","B","C"], "color": "#3B82F6"}]

Pour un cercle:
- title: "Cercle de rayon 3"
- boundingBox: [-5, 5, 5, -5]
- elements: [{"type": "circle", "center": [0,0], "radius": 3, "color": "#3B82F6"}]

Expressions supportées: x^2, sin(x), cos(x), tan(x), sqrt(x), abs(x), log(x), exp(x), pi"""

# Schéma de la fonction generate_graph
GRAPH_TOOL_SCHEMA = {
    "type": "function",
    "name": "generate_graph",
    "description": "Génère un graphique mathématique. OBLIGATOIRE quand l'utilisateur demande de tracer, dessiner ou visualiser une courbe, fonction ou figure géométrique.",
    "parameters": {
        "type": "object",
        "properties": {
            "title": {"type": "string", "description": "Titre descriptif du graphique"},
            "boundingBox": {
                "type": "array",
                "items": {"type": "number"},
                "description": "Limites de la zone visible: [xmin, ymax, xmax, ymin]. Exemple: [-10, 10, 10, -10]"
            },
            "functions": {
                "type": "array",
                "items": {
                    "type": "object",
                    "properties": {
                        "expression": {"type": "string", "description": "Expression mathématique en x. Exemples: x^2, sin(x), 2*x+1, sqrt(x)"},
                        "color": {"type": "string", "description": "Couleur hex, défaut: #3B82F6"},
                        "label": {"type": "string", "description": "Label de la courbe"}
                    },
                    "required": ["expression"]
                },
                "description": "Liste des fonctions f(x) à tracer. Utiliser pour paraboles, sinus, droites, etc."
            },
            "elements": {
                "type": "array",
                "items": {
                    "type": "object",
                    "properties": {
                        "type": {"type": "string", "enum": ["point", "segment", "line", "polygon", "circle"], "description": "Type d'élément géométrique"},
                        "x": {"type": "number", "description": "Coordonnée x (pour point)"},
                        "y": {"type": "number", "description": "Coordonnée y (pour point)"},
                        "label": {"type": "string", "description": "Label de l'élément"},
                        "color": {"type": "string", "description": "Couleur hex"},
                        "points": {"type": "array", "items": {"type": "array", "items": {"type": "number"}}, "description": "Pour segment: [[x1,y1], [x2,y2]]"},
                        "vertices": {"type": "array", "items": {"type": "array", "items": {"type": "number"}}, "description": "Pour polygon: [[x1,y1], [x2,y2], [x3,y3]]"},
                        "labels": {"type": "array", "items": {"type": "string"}, "description": "Labels des sommets"},
                        "center": {"type": "array", "items": {"type": "number"}, "description": "Pour circle: [x, y]"},
                        "radius": {"type": "number", "description": "Pour circle: rayon"},
                        "centerLabel": {"type": "string"},
                        "fillColor": {"type": "string"}
                    },
                    "required": ["type"]
                },
                "description": "Liste des éléments géométriques: points, segments, polygones, cercles"
            }
        },
        "required": ["title", "boundingBox"]
    }
}
