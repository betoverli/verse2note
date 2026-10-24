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
  backgroundColor: "#000000",
  appendUserAgent: "Verse2NoteIOS",
  ios: {
    // The site already pads with env(safe-area-inset-*). Automatic insets
    // would add that padding a second time under the status bar.
    contentInset: "never",
    backgroundColor: "#000000",
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
    // HttpOnly (`__Host-`, Secure, SameSite=Lax, no Domain) and is set by
    // the HTTPS response itself. Google sign-in does not leave that cookie
    // in this WebView: it finishes in an ephemeral ASWebAuthenticationSession
    // and the app stores the bearer in localStorage. Email uses the cookie;
    // SceneDelegate flushes the jar when the app backgrounds.
    CapacitorCookies: {
      enabled: true,
    },
    SplashScreen: {
      launchAutoHide: true,
      launchShowDuration: 800,
      backgroundColor: "#000000",
      showSpinner: false,
      splashFullScreen: true,
      splashImmersive: true,
    },
    StatusBar: {
      overlaysWebView: true,
      style: "DARK",
      backgroundColor: "#000000",
    },
    PushNotifications: {
      presentationOptions: ["badge", "sound", "alert"],
    },
  },
};

export default config;
