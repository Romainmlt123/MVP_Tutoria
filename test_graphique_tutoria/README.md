# TutorIA - Application Éducative avec IA

Une application éducative interactive utilisant l'API OpenAI Realtime pour aider les élèves à apprendre avec des graphiques et figures géométriques générés dynamiquement.

## 🎯 Fonctionnalités

- **Chat vocal en temps réel** avec l'API OpenAI Realtime
- **Génération de graphiques mathématiques** (fonctions, courbes, statistiques)
- **Figures géométriques interactives** (triangles, cercles, polygones)
- **Visualisation de concepts** adaptée aux questions des élèves
- **Interface intuitive** pour les étudiants

## 🚀 Installation

### 1. Cloner et configurer

```bash
cd test_graphique_tutoria
cp .env.example .env
# Éditez .env avec votre clé API OpenAI
```

### 2. Installer les dépendances

```bash
pip install -r requirements.txt
```

### 3. Lancer l'application

```bash
python main.py
```

Ou avec uvicorn :
```bash
uvicorn backend.app:app --reload --host 0.0.0.0 --port 8000
```

### 4. Accéder à l'application

Ouvrez votre navigateur à l'adresse : `http://localhost:8000`

## 📁 Structure du Projet

```
test_graphique_tutoria/
├── backend/
│   ├── __init__.py
│   ├── app.py              # Application FastAPI principale
│   ├── openai_realtime.py  # Intégration OpenAI Realtime API
│   └── graph_generator.py  # Module de génération de graphiques
├── frontend/
│   ├── index.html          # Interface utilisateur
│   ├── styles.css          # Styles CSS
│   └── app.js              # Logique JavaScript
├── static/
│   └── graphs/             # Graphiques générés
├── main.py                 # Point d'entrée
├── requirements.txt        # Dépendances Python
└── .env.example           # Configuration exemple
```

## 🎨 Types de Graphiques Supportés

### Mathématiques
- Fonctions (linéaires, quadratiques, trigonométriques)
- Systèmes d'équations
- Dérivées et intégrales

### Géométrie
- Triangles (avec calculs d'angles, aires)
- Cercles (rayon, diamètre, circonférence)
- Polygones réguliers
- Transformations géométriques

### Statistiques
- Histogrammes
- Diagrammes en barres
- Courbes de distribution

## 💡 Exemples d'utilisation

L'élève peut demander :
- "Montre-moi la courbe de f(x) = x² - 4x + 3"
- "Dessine un triangle rectangle avec les côtés 3, 4, 5"
- "Trace le cercle trigonométrique avec sin et cos"
- "Affiche un histogramme de ces données : 2, 4, 4, 5, 5, 5, 6, 7"

## 🔧 Configuration

### Variables d'environnement

| Variable | Description | Défaut |
|----------|-------------|--------|
| `OPENAI_API_KEY` | Clé API OpenAI | - |
| `HOST` | Adresse du serveur | 0.0.0.0 |
| `PORT` | Port du serveur | 8000 |
| `DEBUG` | Mode debug | true |

## 📝 Licence

MIT License - Projet éducatif
