# Patchlog — Erreurs et résolutions

Ce document répertorie les erreurs rencontrées sur le projet Tutor'IA et la manière dont elles ont été résolues (même les plus petites).

---

## Mode vocal / WebRTC / API Realtime

### 1. Erreur SDP : `setRemoteDescription` avec du JSON au lieu du SDP brut

**Symptôme :** La connexion WebRTC échouait ; le backend renvoyait du JSON (`{"detail":"v=0\r\n..."}`) au lieu du SDP brut.

**Cause :** FastAPI renvoyait la réponse sous forme JSON ; WebRTC attend du texte brut (SDP).

**Résolution :**
- Backend : utiliser `PlainTextResponse` pour renvoyer uniquement le SDP (ou extraire le SDP et le renvoyer en texte brut).
- Frontend : si la réponse commence par `{`, extraire le SDP depuis `detail` / `sdp` / `answer` avant d’appeler `setRemoteDescription`.

---

### 2. 504 Gateway Timeout en mode vocal

**Symptôme :** Timeout côté proxy/serveur lors de l’appel à l’API Realtime.

**Cause :** Le frontend envoyait le SDP à `POST /api/realtime/connect` ; le backend construisait un body **multipart** (SDP + session) et appelait `realtime/calls` avec la **clé API serveur**. Ce flux proxy (multipart + clé serveur) provoquait des timeouts (504).

**Résolution :**
- Adopter le même flux que l’app de référence qui fonctionnait :
  1. Frontend : `POST /api/realtime/session` → récupération d’un **token éphémère** (`client_secret.value`).
  2. Frontend : `POST https://api.openai.com/v1/realtime/calls` **directement**, avec `Authorization: Bearer <client_secret.value>`, `Content-Type: application/sdp`, body = `offer.sdp` uniquement (pas de multipart).
- Ne plus utiliser `/api/realtime/connect` pour établir la connexion vocale (ou le garder pour un autre usage).

---

### 3. Schéma Realtime : `elements3D` — array sans `items`

**Symptôme :** Erreur API du type :  
`Invalid schema for function 'generate_graph': In context=('properties', 'elements3D', 'items', 'properties', 'points'), array schema missing items.`

**Cause :** Dans le schéma JSON de la fonction `generate_graph`, les champs **`points`** et **`vertices`** dans `elements3D.items.properties` étaient déclarés en `"type": "array"` sans propriété **`items`**, ce qui est invalide pour l’API OpenAI.

**Résolution :** Dans `backend/config.py`, ajouter pour ces champs :
- `"points": { "type": "array", "items": { "type": "array", "items": { "type": "number" } }, ... }`
- `"vertices": { "type": "array", "items": { "type": "array", "items": { "type": "number" } }, ... }`

---

### 4. Barres vocales : animation à l’envers (utilisateur vs IA)

**Symptôme :** Les barres s’animaient quand **l’utilisateur** parlait et s’arrêtaient quand **l’IA** parlait.

**Cause :** L’état `isSpeaking` était piloté par `input_audio_buffer.speech_started` / `speech_stopped` (parole **utilisateur**), et l’animation des barres était branchée sur ce même état.

**Résolution :**
- Introduire un état dédié **`isAssistantSpeaking`** dans `useRealtimeVoice` :
  - `true` sur `response.created`,
  - `false` sur `response.done` (et à la déconnexion).
- Utiliser **`assistantSpeaking`** (et non `status === 'speaking'`) pour décider si les barres s’animent dans `VoiceBars`.
- Conserver `isSpeaking` pour la parole utilisateur (libellés, debug, etc. si besoin).

---

## UI / Disposition

### 5. Graphique en mode vocal : layout « moche », tout déplacé

**Symptôme :** Dès qu’un graphique était généré en mode vocal, la mise en page était déséquilibrée (zone vocale et graphique mal répartis).

**Résolution :**
- **Sans graphique :** barres au **centre** de la page (comme l’orbe), avec texte et boutons.
- **Avec graphique :** le graphique occupe la **grande zone** ; la zone vocale (texte + barres + EN DIRECT + boutons) est en **bas à droite** ou, selon la maquette, le footer en 3 colonnes (micro | barres | quitter) avec les barres **uniquement dans le footer** quand un graphique est affiché.

---

### 6. Bouton Connecter / Raccrocher et barres mal placés

**Symptôme :** Les barres et les boutons Connecter / Raccrocher n’étaient pas au bon endroit par rapport à la maquette.

**Résolution :**
- Suivre la **maquette_version2** (dossier `Maquette_frontend/maquette_version2`) : footer en **3 colonnes** (grid) :
  - Gauche : micro + texte « En écoute... » / « IA en train de parler... »
  - Centre : les 5 barres (affichées seulement lorsqu’un graphique est affiché ; sinon les barres sont au centre de la page).
  - Droite : bouton Connecter / Raccrocher / Quitter le mode vocal.

---

### 7. Barres au centre uniquement quand il n’y a pas de graphique

**Symptôme :** Souhait d’avoir les barres au centre (comme l’orbe) quand il n’y a pas de graphique, et de **basculer** sur la disposition footer (barres dans le footer) **uniquement** quand l’IA génère un graphique.

**Résolution :**
- **Sans graphique :** zone principale = texte + libellé + **VoiceBars en `size="center"`** (grandes barres) + boutons ; footer sans barres au centre.
- **Avec graphique :** zone principale = GraphPanel (plein ou grande zone) ; footer = 3 colonnes avec **VoiceBars en `size="footer"`** au centre du footer.

---

## Graphiques / Chat

### 8. Graphiques en mode texte : intégration dans la réponse

**Symptôme :** En mode texte, les graphiques ouvraient un panneau latéral et modifiaient toute la mise en page.

**Résolution :**
- En mode **texte** : ne plus afficher de panneau latéral dédié.
- Attacher le graphique au **message** assistant : `addMessage({ role: 'assistant', content, graph: normalizedGraph })`.
- Dans `ChatMessage`, si `message.graph` existe, afficher un **GraphPanel inline** (prop `inline` + `graphData={{ data: message.graph }}`) sous le texte de la réponse.
- Normaliser le graph côté frontend avant stockage (`normalizeGraphData` dans le store ou à la réception).

---

### 9. Deuxième graphique qui ne se met pas à jour

**Symptôme :** Lorsqu’un second graphique était généré (texte ou vocal), l’affichage ne se mettait pas à jour correctement.

**Résolution :** Introduire une **version** du graphique (ex. `graphVersion` dans le store), incrémentée à chaque `setCurrentGraph`, et utiliser une **key** sur le composant d’affichage : `<GraphPanel key={graphVersion} />` (et équivalent pour l’inline en mode texte) pour forcer un nouveau montage à chaque nouveau graphique.

---

## Divers

### 10. Voix en double / changement de voix

**Symptôme :** Plusieurs pistes audio ou changement de voix entre les réponses.

**Résolution :**
- N’attacher qu’**une seule** piste audio au lecteur (flag `remoteAudioAttached` pour ignorer les tracks suivants).
- Fixer la voix côté session (ex. `"marin"`) et rappeler dans les instructions une voix constante et un ton neutre.
- Ne pas envoyer de `response.create` manuel sur `speech_stopped` si le serveur gère déjà la création de réponse (VAD + `create_response: true`).

---

### 11. Graphiques 3D incorrects (repère ok, courbes/surfaces faux)

**Symptôme :** En 3D, le repère s’affichait correctement mais les surfaces/courbes étaient incorrectes.

**Résolution :**
- Côté évaluation des expressions : utiliser des regex avec **`\b`** pour ne pas casser `Math.` (ex. `\bsin\(` au lieu de `sin(`).
- Surfaces : passer **`t=0`** en troisième argument si l’expression ne dépend que de x, y.
- Pas de `boundingBox3D` : le dériver des plages des surfaces (xRange, yRange) si besoin.
- Backend : préciser dans les instructions que les surfaces sont des fonctions de **x, y** uniquement et les courbes 3D des fonctions de **t** uniquement.

---

### 12. Messages d’erreur 502/503/504 peu lisibles

**Symptôme :** En cas de timeout ou erreur gateway, l’utilisateur voyait du HTML ou un message technique peu clair.

**Résolution :**
- Backend : attraper `httpx.TimeoutException`, augmenter le timeout si nécessaire (ex. 90 s), renvoyer un message court et lisible pour 502/503/504.
- Frontend : détecter les réponses contenant du HTML ou des chaînes comme "504", "Gateway time-out", et afficher un message utilisateur du type : « Le service vocal met trop de temps à répondre. Réessaie dans une minute. »

---

## Récapitulatif

| # | Domaine        | Problème principal                          | Solution en bref                                      |
|---|----------------|---------------------------------------------|-------------------------------------------------------|
| 1 | WebRTC         | SDP reçu en JSON                            | Réponse SDP brute + extraction côté frontend si JSON |
| 2 | Realtime       | 504 timeout                                 | Flux token éphémère + appel direct API OpenAI         |
| 3 | Schéma API     | `elements3D` points/vertices sans `items`    | Ajouter `items` dans le schéma (config.py)            |
| 4 | UI vocal       | Barres animées à l’envers                   | État `isAssistantSpeaking` (response.created/done)   |
| 5 | UI vocal       | Layout avec graphique                       | Grande zone graph + zone vocale en bas à droite       |
| 6 | UI vocal       | Barres/boutons mal placés                   | Footer 3 colonnes (maquette_version2)                 |
| 7 | UI vocal       | Barres toujours en footer                   | Barres au centre sans graph, en footer avec graph     |
| 8 | Chat           | Graphiques en panneau latéral               | Graph inline dans le message (message.graph)          |
| 9 | Graphiques     | 2ᵉ graphique pas à jour                     | graphVersion + key sur GraphPanel                     |
|10 | Vocal          | Voix double / changement                    | Une piste audio, voix fixe, pas de response.create    |
|11 | 3D             | Surfaces/courbes 3D faux                    | \b dans regex, t=0, boundingBox3D, instructions       |
|12 | Erreurs        | 502/503/504 illisibles                      | Messages courts backend + frontend                    |

---

*Dernière mise à jour : février 2026.*
