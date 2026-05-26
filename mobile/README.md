# Tutor'IA — app mobile (Expo)

Conteneur Expo qui charge le frontend web en **plein écran** (WebView), pour tester sur téléphone avec **Expo Go** sans la barre d’adresse du navigateur.

Guide complet : [docs/MOBILE_EXPO.md](../docs/MOBILE_EXPO.md)

Projet en **Expo SDK 54** (compatible Expo Go du App Store / Play Store).

```bash
npm install
npm start          # tunnel ngrok (recommandé)
npm run start:lan  # même Wi‑Fi uniquement
```

Erreur Android `Failed to download remote update` → le téléphone ne joint pas le PC : utilisez `npm start` (tunnel) ou la PWA (Chrome → Vercel → Ajouter à l’écran d’accueil).
