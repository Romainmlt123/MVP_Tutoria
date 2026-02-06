#!/usr/bin/env python3
"""
TutorIA - Point d'entrée pour lancer le backend FastAPI.
Depuis la racine du repo : python main.py
"""

import os
import sys
from pathlib import Path

ROOT = Path(__file__).parent
sys.path.insert(0, str(ROOT))

if __name__ == "__main__":
    import uvicorn
    from dotenv import load_dotenv

    load_dotenv(ROOT / ".env")
    port = int(os.getenv("PORT", "8000"))
    host = os.getenv("HOST", "0.0.0.0")
    reload = os.getenv("DEBUG", "true").lower() == "true"

    if not os.getenv("OPENAI_API_KEY"):
        print("⚠️  OPENAI_API_KEY non définie. Définissez-la dans .env pour utiliser le chat et le mode vocal.")

    print(f"🚀 TutorIA API → http://{host}:{port}")
    print("   Docs → http://localhost:{}/docs".format(port))
    uvicorn.run(
        "backend.app:app",
        host=host,
        port=port,
        reload=reload,
    )
