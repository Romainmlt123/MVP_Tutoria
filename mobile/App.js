import { useMemo } from 'react';
import {
  ActivityIndicator,
  Platform,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import Constants from 'expo-constants';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { WebView } from 'react-native-webview';

const DEFAULT_APP_URL = 'https://mvp-tutoria.vercel.app';

function resolveAppUrl() {
  const fromEnv = process.env.EXPO_PUBLIC_APP_URL?.trim();
  if (fromEnv) return fromEnv;

  const fromExtra = Constants.expoConfig?.extra?.appUrl?.trim();
  if (fromExtra) return fromExtra;

  return DEFAULT_APP_URL;
}

function isLocalDevUrl(url) {
  return /^https?:\/\/(localhost|127\.0\.0\.1|10\.\d+\.\d+\.\d+|192\.168\.\d+\.\d+|172\.(1[6-9]|2\d|3[01])\.\d+\.\d+)/i.test(
    url
  );
}

export default function App() {
  const appUrl = useMemo(() => resolveAppUrl(), []);
  const localDev = isLocalDevUrl(appUrl);

  return (
    <SafeAreaProvider>
      <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
        <StatusBar style="dark" />
        {__DEV__ && localDev && (
          <View style={styles.devBar}>
            <Text style={styles.devLabel} numberOfLines={1}>
              DEV · {appUrl}
            </Text>
          </View>
        )}
        <WebView
          key={appUrl}
          source={{ uri: appUrl }}
          style={styles.webview}
          startInLoadingState
          cacheEnabled={!localDev}
          renderLoading={() => (
            <View style={styles.loading}>
              <ActivityIndicator size="large" color="#6C5CE7" />
            </View>
          )}
          javaScriptEnabled
          domStorageEnabled
          sharedCookiesEnabled
          thirdPartyCookiesEnabled
          allowsInlineMediaPlayback
          mediaPlaybackRequiresUserAction={false}
          allowsBackForwardNavigationGestures
          originWhitelist={['*']}
          setSupportMultipleWindows={false}
          allowsFullscreenVideo={Platform.OS === 'ios'}
          userAgent={
            Platform.OS === 'ios'
              ? undefined
              : 'Mozilla/5.0 (Linux; Android 14) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Mobile Safari/537.36 TutoriaExpo/1.0'
          }
        />
      </SafeAreaView>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  devBar: {
    backgroundColor: '#6C5CE7',
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  devLabel: {
    color: '#fff',
    fontSize: 11,
    fontWeight: '600',
    textAlign: 'center',
  },
  webview: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  loading: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#ffffff',
  },
});
