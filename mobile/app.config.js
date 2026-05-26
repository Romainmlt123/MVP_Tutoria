const DEFAULT_APP_URL = 'https://mvp-tutoria.vercel.app';

export default ({ config }) => ({
  ...config,
  name: "Tutor'IA",
  slug: 'tutoria-mobile',
  version: '1.0.0',
  orientation: 'portrait',
  userInterfaceStyle: 'light',
  ios: {
    ...config.ios,
    supportsTablet: true,
    bundleIdentifier: 'fr.tutoria.app',
    infoPlist: {
      NSMicrophoneUsageDescription:
        "Tutor'IA utilise le micro pour le mode vocal et les conversations avec l'IA.",
      NSCameraUsageDescription:
        "Tutor'IA peut utiliser la caméra pour certaines fonctionnalités web.",
      NSAppTransportSecurity: {
        NSAllowsLocalNetworking: true,
      },
    },
  },
  android: {
    ...config.android,
    package: 'fr.tutoria.app',
    usesCleartextTraffic: true,
    permissions: [
      'INTERNET',
      'RECORD_AUDIO',
      'MODIFY_AUDIO_SETTINGS',
    ],
  },
  updates: {
    enabled: false,
  },
  extra: {
    ...config.extra,
    appUrl: process.env.EXPO_PUBLIC_APP_URL ?? DEFAULT_APP_URL,
  },
});
