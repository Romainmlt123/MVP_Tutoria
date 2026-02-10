"""
Client Supabase pour le backend Tutor'IA.
Utilise la clé service_role pour les opérations serveur (quota, admin, etc.).
Ne jamais exposer SUPABASE_SERVICE_ROLE_KEY côté client.
"""

import os
from supabase import create_client, Client

_supabase: Client | None = None


def get_supabase() -> Client | None:
    """Retourne le client Supabase si les variables d'environnement sont définies."""
    global _supabase
    if _supabase is not None:
        return _supabase
    url = os.getenv("SUPABASE_URL")
    key = os.getenv("SUPABASE_SERVICE_ROLE_KEY") or os.getenv("SUPABASE_SERVICE_KEY")
    if not url or not key:
        return None
    _supabase = create_client(url, key)
    return _supabase
