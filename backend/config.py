"""
Configuration et prompts pour TutorIA (chat texte + Realtime vocal).
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

Types 2D: functions, point, segment, polygon, circle.
Graphiques 3D: "is3D": true + "boundingBox3D": [[xMin,xMax],[yMin,yMax],[zMin,zMax]].
- Surface z=f(x,y): l'expression doit utiliser UNIQUEMENT x et y. "surfaces": [{"expression": "x^2+y^2", "xRange": [-2,2], "yRange": [-2,2]}]
- Courbe paramétrique: x, y, z en variable t UNIQUEMENT. "curves3D": [{"x": "cos(t)", "y": "sin(t)", "z": "t", "tRange": [0, 6.28]}]
- Sphère: "elements3D": [{"type": "sphere", "center": [0,0,0], "radius": 1}]
- Point 3D: {"type": "point3d", "coords": [1,1,1]}

Expressions: +, -, *, /, ^ | sin, cos, tan, sqrt, abs, log, exp | pi

Sois clair et encourageant. Explique le graphique."""

# Instructions pour le mode vocal Realtime (voix fixée en session, pas de "changement de ton")
REALTIME_INSTRUCTIONS = """Tu es TutorIA, assistant pédagogique en mathématiques. Parle clairement. Garde une voix constante et un ton neutre tout au long de la conversation.

IMPORTANT: Quand on te demande de tracer une courbe ou figure, tu DOIS appeler la fonction generate_graph avec un JSON STRICT.

RÈGLES OBLIGATOIRES pour generate_graph:
1. boundingBox est TOUJOURS [xmin, ymax, xmax, ymin] — exactement 4 nombres dans cet ordre. Exemple: [-10, 10, 10, -10].
2. Pour les fonctions f(x), utilise "expression" avec ^ pour les puissances (pas **): x^2, x^3, pas x**2.
3. Expressions supportées: x^2, sin(x), cos(x), tan(x), sqrt(x), abs(x), log(x), exp(x), pi.
4. title et boundingBox sont OBLIGATOIRES. Pour une courbe, fournis "functions". Pour des figures (cercle, triangle), fournis "elements".

Exemples EXACTS à reproduire:

Parabole y = x²:
{"title": "Parabole f(x) = x²", "boundingBox": [-10, 10, 10, -10], "functions": [{"expression": "x^2", "color": "#3B82F6"}]}

Sinus:
{"title": "Fonction sinus", "boundingBox": [-10, 2, 10, -2], "functions": [{"expression": "sin(x)", "color": "#EF4444"}]}

Droite y = 2x+1:
{"title": "Droite y = 2x+1", "boundingBox": [-5, 15, 5, -5], "functions": [{"expression": "2*x+1", "color": "#3B82F6"}]}

Triangle ABC:
{"title": "Triangle ABC", "boundingBox": [-1, 5, 6, -1], "elements": [{"type": "polygon", "vertices": [[0,0], [4,0], [2,3]], "labels": ["A","B","C"], "color": "#3B82F6"}]}

Cercle de centre (0,0) rayon 3:
{"title": "Cercle de rayon 3", "boundingBox": [-5, 5, 5, -5], "elements": [{"type": "circle", "center": [0,0], "radius": 3, "color": "#3B82F6"}]}

Graphiques 3D — RÈGLES STRICTES:
- Surfaces z=f(x,y): l'expression doit utiliser UNIQUEMENT les variables x et y (ex: x^2+y^2, sin(x)*cos(y)). Fournir xRange et yRange (ex: [-2,2]).
- Courbes paramétriques: x, y, z doivent être des expressions en UNIQUEMENT la variable t (ex: cos(t), sin(t), t). Fournir tRange (ex: [0, 6.28]).
- boundingBox3D = [[xMin,xMax],[yMin,yMax],[zMin,zMax]] pour le repère 3D.

Exemples EXACTS 3D:
Paraboloïde z = x²+y²:
{"title": "Paraboloïde z=x²+y²", "is3D": true, "boundingBox": [-5,5,5,-5], "boundingBox3D": [[-2,2],[-2,2],[0,8]], "surfaces": [{"expression": "x^2+y^2", "xRange": [-2,2], "yRange": [-2,2], "color": "#3B82F6"}]}
Plan z = 2x+y:
{"title": "Plan z=2x+y", "is3D": true, "boundingBox": [-5,5,5,-5], "boundingBox3D": [[-2,2],[-2,2],[-5,5]], "surfaces": [{"expression": "2*x+y", "xRange": [-2,2], "yRange": [-2,2], "color": "#10B981"}]}
Hélice:
{"title": "Hélice", "is3D": true, "boundingBox": [-5,5,5,-5], "boundingBox3D": [[-1.5,1.5],[-1.5,1.5],[-4,4]], "curves3D": [{"x": "cos(t)", "y": "sin(t)", "z": "t", "tRange": [0, 6.28], "color": "#EF4444"}]}
Sphère:
{"title": "Sphère", "is3D": true, "boundingBox": [-5,5,5,-5], "boundingBox3D": [[-2,2],[-2,2],[-2,2]], "elements3D": [{"type": "sphere", "center": [0,0,0], "radius": 1.5, "color": "#3B82F6"}]}"""

# Schéma de la fonction generate_graph (Realtime API)
GRAPH_TOOL_SCHEMA = {
    "type": "function",
    "name": "generate_graph",
    "description": "Génère un graphique 2D ou 3D. OBLIGATOIRE pour tracer une courbe, fonction ou figure. 2D: boundingBox + functions/elements. 3D: is3D=true + boundingBox3D + surfaces/curves3D/elements3D. Utiliser ^ pour les puissances (x^2).",
    "parameters": {
        "type": "object",
        "properties": {
            "title": {"type": "string", "description": "Titre descriptif du graphique (obligatoire)"},
            "boundingBox": {
                "type": "array",
                "items": {"type": "number"},
                "minItems": 4,
                "maxItems": 4,
                "description": "OBLIGATOIRE. [xmin, ymax, xmax, ymin] — ex: [-10, 10, 10, -10]"
            },
            "is3D": {"type": "boolean", "description": "Si true, le graphique est en 3D. Alors fournir boundingBox3D et surfaces ou curves3D ou elements3D."},
            "boundingBox3D": {
                "type": "array",
                "items": {"type": "array", "items": {"type": "number"}, "minItems": 2, "maxItems": 2},
                "minItems": 3,
                "maxItems": 3,
                "description": "Pour 3D: [[xMin,xMax],[yMin,yMax],[zMin,zMax]] — ex: [[-2,2],[-2,2],[-2,2]]"
            },
            "surfaces": {
                "type": "array",
                "items": {
                    "type": "object",
                    "properties": {
                        "expression": {"type": "string", "description": "z = f(x,y) avec x, y. Ex: x^2+y^2, sin(x)*cos(y)"},
                        "xRange": {"type": "array", "items": {"type": "number"}, "description": "[xMin, xMax]"},
                        "yRange": {"type": "array", "items": {"type": "number"}, "description": "[yMin, yMax]"},
                        "color": {"type": "string"}
                    },
                    "required": ["expression"]
                },
                "description": "Surfaces 3D z=f(x,y). Pour is3D uniquement."
            },
            "curves3D": {
                "type": "array",
                "items": {
                    "type": "object",
                    "properties": {
                        "x": {"type": "string", "description": "Expression x(t). Ex: cos(t)"},
                        "y": {"type": "string", "description": "Expression y(t). Ex: sin(t)"},
                        "z": {"type": "string", "description": "Expression z(t). Ex: t"},
                        "tRange": {"type": "array", "items": {"type": "number"}, "description": "[tMin, tMax]"},
                        "color": {"type": "string"}
                    },
                    "required": ["x", "y", "z"]
                },
                "description": "Courbes paramétriques 3D (x(t), y(t), z(t)). Pour is3D."
            },
            "elements3D": {
                "type": "array",
                "items": {
                    "type": "object",
                    "properties": {
                        "type": {"type": "string", "enum": ["point3d", "line3d", "sphere", "polygon3d", "vector3d", "plane3d"]},
                        "coords": {"type": "array", "items": {"type": "number"}, "description": "Pour point3d: [x,y,z]"},
                        "center": {"type": "array", "items": {"type": "number"}, "description": "Pour sphere: [x,y,z]"},
                        "radius": {"type": "number", "description": "Pour sphere: rayon"},
                        "points": {"type": "array", "items": {"type": "array", "items": {"type": "number"}}, "description": "Pour line3d: [[x1,y1,z1],[x2,y2,z2]]"},
                        "vertices": {"type": "array", "items": {"type": "array", "items": {"type": "number"}}, "description": "Pour polygon3d: [[x,y,z], ...]"},
                        "from": {"type": "array", "items": {"type": "number"}},
                        "to": {"type": "array", "items": {"type": "number"}},
                        "color": {"type": "string"}
                    },
                    "required": ["type"]
                },
                "description": "Éléments 3D: point3d, sphere, line3d, polygon3d, vector3d. Pour is3D."
            },
            "functions": {
                "type": "array",
                "items": {
                    "type": "object",
                    "properties": {
                        "expression": {"type": "string", "description": "Expression en x avec ^ pour les puissances: x^2, sin(x), 2*x+1, sqrt(x)"},
                        "color": {"type": "string", "description": "Couleur hex, ex: #3B82F6"},
                        "label": {"type": "string", "description": "Label de la courbe"}
                    },
                    "required": ["expression"]
                },
                "description": "Fonctions f(x) à tracer. Pour courbes/fonctions uniquement."
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
