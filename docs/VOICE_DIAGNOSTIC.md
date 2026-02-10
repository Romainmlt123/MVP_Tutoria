# Diagnostic mode vocal TutorIA

## Ce qui a été vérifiée,c 

### 1. Backend et API
- **Script** : `python scripts/test_voice.py`
- **Résultat** : le backend répond, et l’endpoint `/api/realtime/connect` relaie correctement les appels à OpenAI (200 avec SDP ou 4xx en cas de rejet).
- **Conclusion** : le problème n’est pas côté serveur ni côté clé API.

### 2. Connexion WebRTC (test dans l’environnement Cursor)
- Navigation sur `/voice` → connexion automatique.
- Logs console : SDP reçu, track audio distant, data channel OPEN, `session.created` / `session.updated`.
- **Conclusion** : la chaîne frontend → backend → OpenAI → WebRTC fonctionne dans cet environnement.

## Si chez toi « rien ne se passe » quand tu parles

Le blocage est très probablement **côté micro / navigateur / OS**, pas côté code.

### À vérifier en priorité

1. **Autorisation micro dans le navigateur**
   - Sur la page `/voice`, clic sur l’icône cadenas (ou « i ») dans la barre d’adresse.
   - Vérifier que le **micro** est autorisé pour `http://localhost:5173` (ou ton URL).
   - Si c’est « Demander » ou « Bloquer », passer à « Autoriser » et recharger.

2. **Micro utilisé par une autre application**
   - Fermer Zoom, Teams, Discord, OBS, etc.
   - Sous Linux (PulseAudio / PipeWire) : vérifier dans les paramètres son qu’aucune app ne garde le micro en exclusivité.

3. **Dual boot / autre OS**
   - Tester depuis l’OS où tu utilises normalement le micro (ex. si le micro marche sous Windows, tester le mode vocal sous Windows).
   - Sous Linux : vérifier que le micro est bien détecté (paramètres son, `pavucontrol`, etc.).

4. **Navigateur et onglet**
   - Tester en **navigation privée** (pas d’extensions).
   - Tester un **autre navigateur** (Chrome, Firefox, Edge) pour voir si le comportement change.

### Ce que tu devrais voir dans la console (F12 → Console)

Quand tu **parles** puis **t’arrêtes** :
- `[Realtime] PAROLE DÉTECTÉE (speech_started)` quand tu commences à parler.
- `[Realtime] PAROLE TERMINÉE (speech_stopped)` quand tu t’arrêtes.
- Puis éventuellement : `response.created`, `response.output_item.added`, etc.

Si tu ne vois **jamais** `speech_started` / `speech_stopped` alors que tu parles :
- le navigateur ne capture pas le micro, ou
- le micro n’est pas envoyé correctement au serveur (problème WebRTC / réseau local), ou
- la détection de parole côté serveur (VAD) ne se déclenche pas (déjà assouplie dans la config).

### Test rapide du micro dans la console

Sur la page `/voice`, une fois connecté, ouvre la console (F12) et exécute :

```javascript
navigator.mediaDevices.getUserMedia({ audio: true })
  .then(stream => {
    console.log('Micro OK, nombre de pistes:', stream.getAudioTracks().length)
    stream.getTracks().forEach(t => t.stop())
  })
  .catch(err => console.error('Micro refusé ou indisponible:', err))
```

- Si tu vois « Micro OK » → le navigateur a bien accès au micro.
- Si tu vois une erreur → problème de permission ou de périphérique (driver, autre app, dual boot).

## Résumé

| Élément              | Statut        |
|----------------------|---------------|
| Backend + OpenAI      | OK (test script) |
| Connexion WebRTC      | OK (test Cursor)  |
| Détection parole (VAD) | À confirmer chez toi (logs `speech_started` / `speech_stopped`) |
| Micro / navigateur   | À vérifier (permissions, autre app, autre navigateur / OS) |

En résumé : le mode vocal fonctionne côté app et backend ; si rien ne se passe chez toi, c’est très probablement l’environnement (micro, navigateur, OS / dual boot). Suis les étapes ci‑dessus et regarde les logs console pour affiner.
