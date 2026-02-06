#!/usr/bin/env python3
"""
TutorIA - Point d'entrée principal
Lance le serveur FastAPI avec uvicorn
"""

import os
import sys
from pathlib import Path

# Ajouter le répertoire racine au path
ROOT_DIR = Path(__file__).parent
sys.path.insert(0, str(ROOT_DIR))

import uvicorn
from dotenv import load_dotenv

# Charger les variables d'environnement
load_dotenv()


def main():
    """Point d'entrée principal."""
    
    # Configuration
    host = os.getenv("HOST", "0.0.0.0")
    port = int(os.getenv("PORT", 8000))
    debug = os.getenv("DEBUG", "true").lower() == "true"
    
    # Vérifier la clé API
    api_key = os.getenv("OPENAI_API_KEY")
    if not api_key or api_key == "your_openai_api_key_here":
        print("\n" + "=" * 60)
        print("⚠️  ATTENTION: Clé API OpenAI non configurée!")
        print("=" * 60)
        print("\nPour utiliser TutorIA, vous devez configurer votre clé API:")
        print("1. Copiez le fichier .env.example vers .env")
        print("2. Éditez .env et ajoutez votre clé OPENAI_API_KEY")
        print("\nL'application va démarrer mais certaines fonctionnalités")
        print("ne seront pas disponibles sans clé API valide.")
        print("=" * 60 + "\n")
    
    # Créer les dossiers nécessaires
    (ROOT_DIR / "static" / "graphs").mkdir(parents=True, exist_ok=True)
    
    print(f"""
╔══════════════════════════════════════════════════════════════╗
║                                                              ║
║   🎓 TutorIA - Assistant Éducatif Intelligent               ║
║                                                              ║
║   Serveur démarré sur: http://{host}:{port}                    ║
║                                                              ║
║   Fonctionnalités:                                           ║
║   • Chat texte avec génération de graphiques                 ║
║   • Mode vocal avec API OpenAI Realtime                      ║
║   • Figures géométriques et courbes mathématiques            ║
║                                                              ║
╚══════════════════════════════════════════════════════════════╝
    """)
    
    # Lancer le serveur
    uvicorn.run(
        "backend.app:app",
        host=host,
        port=port,
        reload=debug,
        log_level="info" if debug else "warning"
    )


if __name__ == "__main__":
    main()
