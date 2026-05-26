# Tester Tutor'IA sur téléphone avec Expo

Le frontend principal reste une **app web React/Vite** (`frontend/`).  
Le dossier `mobile/` ajoute un **conteneur Expo** qui affiche cette app en **plein écran** (sans barre d’adresse du navigateur), via une WebView.

Ce n’est **pas** une réécriture React Native : c’est le moyen le plus rapide de valider le rendu mobile « comme une app » avec Expo Go.

## Prérequis

- [Expo Go](https://expo.dev/go) sur le téléphone — **version App Store / Play Store** (SDK **54**)
- Ce projet `mobile/` est en **Expo SDK 54** pour rester compatible avec cette Expo Go
- Node.js 20+
- PC et téléphone sur le **même réseau Wi‑Fi** (sauf si vous utilisez `--tunnel`)

> **Important :** un projet créé en SDK 56 ne fonctionne pas avec l’Expo Go du store : erreur vague du type *« Something went wrong »* au scan du QR. C’est corrigé ici en SDK 54.

## 1. Développement local (recommandé) — `npm start`

```bash
cd mobile
npm install
npm start
```

Une seule commande :

1. Démarre **Vite** (`frontend/`, accessible sur le réseau local)
2. Détecte l’**IP LAN** du PC et écrit `mobile/.env`
3. Lance **Expo** en **LAN** avec la WebView vers `http://VOTRE_IP:PORT` (port Vite détecté automatiquement, ex. 5173 ou 5174)

Scannez le QR **LAN** dans le terminal. Vous voyez la **dernière version** du frontend (hot reload Vite).

Tunnel ngrok (si le LAN échoue) : `EXPO_TUNNEL=1 npm start`

**Même Wi‑Fi** pour le téléphone et le PC. Une bandeau violet `DEV · http://…` confirme le mode local.

**API backend :** dans `frontend/.env`, utilisez l’IP du PC pour `VITE_API_URL` (pas `localhost`), sinon login/API échouent sur le téléphone.

## 2. Tester la version déployée (Vercel)

```bash
cd mobile
npm run start:prod
```

Charge `https://mvp-tutoria.vercel.app` (ce qui est en ligne sur GitHub/Vercel).

Expo seul (sans Vite) : `npm run start:expo`

## 3. Mode vocal (WebRTC)

Le mode vocal utilise le micro dans la WebView. Les permissions micro sont déclarées dans `app.config.js`.  
Si le micro ne répond pas sur un appareil, testez d’abord sur la version Vercel dans Expo Go, puis en build natif (`eas build`) si besoin.

## Variables

| Variable | Rôle |
|----------|------|
| `EXPO_PUBLIC_APP_URL` | URL du site React à charger (prod ou dev LAN) |

## Dépannage

### `Failed to download remote update` (Android)

Le téléphone **ne peut pas télécharger le bundle** depuis votre PC (Metro). Ce n’est pas un bug de Tutor’IA : c’est un problème **réseau** entre le téléphone et `exp://IP:8081`.

**Solution recommandée — mode LAN** (par défaut avec `npm start`) :

```bash
cd mobile
npm start
```

Scannez le QR **LAN**. PC et téléphone sur le même Wi‑Fi.

**Si Android affiche *Failed to download remote update* :**

Souvent le PC a une IP type **`10.188.x.x`** (Wi‑Fi université, VPN, box isolée) : le téléphone **ne voit pas** le PC, même sur le « même Wi‑Fi ».

| Priorité | Solution |
|----------|----------|
| 1 | **Hotspot du téléphone** : partage de connexion ON → PC connecté au Wi‑Fi du téléphone → `npm start` → QR **LAN** |
| 2 | **USB Android** : débogage USB + câble → `npm run start:usb` → dans Expo Go saisir `exp://127.0.0.1:8081` |
| 3 | **Pare-feu** : `sudo ufw allow 8081/tcp` et `sudo ufw allow 5173/tcp` puis `npm start` |
| 4 | **Sans Expo** (UI web seulement) : Chrome sur le téléphone → `http://IP_DU_PC:5173` (après hotspot) ou Vercel en PWA |

Le tunnel Expo (`EXPO_TUNNEL=1`) est souvent **cassé** côté ngrok (`reading 'body')`) — ne pas insister dessus.

**Tester l’UI sans Expo Go :**

```bash
# Terminal 1
cd frontend && npm run dev:lan
# Téléphone (même réseau que le PC, idéalement hotspot) :
# Chrome → http://IP_AFFICHÉE_PAR_VITE:5173
```

### « Something went wrong » au scan du QR

| Cause | Solution |
|--------|----------|
| **Expo Go trop ancien / mauvais SDK** | Mettre à jour Expo Go depuis le store. Le projet est en **SDK 54**. |
| **Téléphone et PC pas sur le même réseau** | `npm start` (tunnel) ou hotspot + `npm run start:lan` |
| **IP type `10.188.x.x` (VPN / réseau d’entreprise)** | Le téléphone ne voit pas cette IP → **obligatoire : tunnel** ou PWA |
| **Pare-feu Linux** | `sudo ufw allow 8081/tcp` |
| **iOS — réseau local** | Réglages → Expo Go → autoriser **Réseau local** |

### `ERROR … installing React Native DevTools` + `chrome-sandbox` (Linux)

Message typique :

```text
The SUID sandbox helper binary was found, but is not configured correctly…
chrome-sandbox is owned by root and has mode 4755
```

**Ce n’est en général pas bloquant** : Metro tourne, le QR code s’affiche, **Expo Go fonctionne** sur le téléphone. L’erreur concerne seulement l’outil de debug **sur le PC** (touche `j` dans le terminal).

**Pour tester l’app** : ignorez l’erreur et scannez le QR code.

**Pour corriger le debug desktop** (optionnel) :

```bash
SANDBOX="$HOME/.cache/dotslash/af/5aa55d5d0401a9f3a438c9deb082205f28e353/React Native DevTools-linux-x64/chrome-sandbox"
sudo chown root:root "$SANDBOX"
sudo chmod 4755 "$SANDBOX"
```

Puis relancez `npm start` dans `mobile/`. Ne pas appuyer sur `j` si vous n’avez pas besoin du debugger.

## Limites

- **Pas de offline** : l’app a besoin du réseau (sauf si vous servez un build statique embarqué, non configuré ici).
- **Performances** : identiques au navigateur mobile intégré (WebView), pas au natif pur.
- **Store** : pour publier sur l’App Store / Play Store, utilisez [EAS Build](https://docs.expo.dev/build/introduction/) à partir de `mobile/`.

## Alternative sans Expo

- **PWA** : ajouter un manifest + « Ajouter à l’écran d’accueil » (Chrome/Safari).
- **Capacitor** : empaqueter le build `frontend/dist` dans une coque native (proche d’Expo WebView, mais sans Expo Go).
