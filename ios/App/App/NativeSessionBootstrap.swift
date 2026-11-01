import Foundation
import WebKit

/// Silent cookie → Keychain bearer migration for users who signed in via classic Cap.
enum NativeSessionBootstrap {
    static let sessionCookieName = "__Host-grok-auth.session_token"
    static let migratedFlagKey = "verse2note.cookieBearerMigrated.v1"

    /// Read WKWebView cookies for verse2note.com and adopt the session token as bearer.
    static func migrateCookieToKeychainIfNeeded() async -> Bool {
        if NativeAPIClient.hasBearer { return true }

        let token = await readSessionCookieToken()
        guard let token, !token.isEmpty else { return false }
        let ok = KeychainStore.setBearerToken(token)
        if ok {
            UserDefaults.standard.set(true, forKey: migratedFlagKey)
            print("[NativeAuth] migrated web session cookie → Keychain bearer")
        }
        return ok
    }

    static func readSessionCookieToken() async -> String? {
        await withCheckedContinuation { continuation in
            WKWebsiteDataStore.default().httpCookieStore.getAllCookies { cookies in
                let candidates = cookies.filter { cookie in
                    cookie.name == sessionCookieName &&
                        (cookie.domain.contains("verse2note.com") || cookie.domain.hasPrefix("."))
                }
                // Prefer non-expired, longest value (signed tokens).
                let best = candidates
                    .filter { $0.expiresDate == nil || ($0.expiresDate ?? .distantPast) > Date() }
                    .max(by: { $0.value.count < $1.value.count })
                var value = best?.value
                if let raw = value, raw.contains("%") {
                    value = raw.removingPercentEncoding ?? raw
                }
                continuation.resume(returning: value)
            }
        }
    }
}
