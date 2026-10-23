import type { CapacitorConfig } from "@capacitor/cli";

/**
 * The iOS app is a native shell. The WebView loads the hosted site so the
 * web server keeps serving browsers. Override the URL at sync time with
 * CAPACITOR_SERVER_URL (must be https for App Transport Security and for
 * the __Host- session cookies). http://verse2note.com already 308s to https.
 */
const serverUrl = (process.env.CAPACITOR_SERVER_URL || "https://verse2note.com").replace(/\/+$/, "");
const cleartext = serverUrl.startsWith("http://");

const config: CapacitorConfig = {
  appId: "com.verse2note.app",
  appName: "Verse2Note",
  webDir: "native/www",
  backgroundColor: "#121110",
  appendUserAgent: "Verse2NoteIOS",
  ios: {
    // The site already pads with env(safe-area-inset-*). Automatic insets
    // would add that padding a second time under the status bar.
    contentInset: "never",
    backgroundColor: "#121110",
    appendUserAgent: "Verse2NoteIOS",
    scheme: "verse2note",
  },
  server: {
    url: serverUrl,
    cleartext,
    errorPath: "offline.html",
    allowNavigation: [
      "verse2note.com",
      "*.verse2note.com",
      "auth.grok.me",
    ],
  },
  plugins: {
    // Sync non-HttpOnly cookies with WKWebView. The session cookie is
    // HttpOnly and is set by the HTTPS response itself. OAuth does not rely
    // on this: it finishes in ASWebAuthenticationSession and hands the app
    // a one-time code (see src/lib/native/auth.ts).
    CapacitorCookies: {
      enabled: true,
    },
    SplashScreen: {
      launchAutoHide: true,
      launchShowDuration: 800,
      backgroundColor: "#121110",
      showSpinner: false,
      splashFullScreen: true,
      splashImmersive: true,
    },
    StatusBar: {
      overlaysWebView: true,
      style: "DARK",
      backgroundColor: "#121110",
    },
    PushNotifications: {
      presentationOptions: ["badge", "sound", "alert"],
    },
  },
};

export default config;
