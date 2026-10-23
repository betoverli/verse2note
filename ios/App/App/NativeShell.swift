import AuthenticationServices
import Capacitor
import UIKit
import WebKit

/// Loads the hosted site and registers the login plugin before the page runs.
class Verse2NoteBridgeViewController: CAPBridgeViewController {
    override func capacitorDidLoad() {
        bridge?.registerPluginInstance(NativeAuthPlugin())
        let source = """
        (function () {
          try {
            if (!('serviceWorker' in navigator)) return;
            var sw = navigator.serviceWorker;
            sw.register = function () {
              return Promise.resolve({
                unregister: function () { return Promise.resolve(true); },
                scope: '/'
              });
            };
            sw.getRegistrations().then(function (regs) {
              regs.forEach(function (reg) { reg.unregister(); });
            }).catch(function () {});
          } catch (e) {}
        })();
        """
        let script = WKUserScript(source: source, injectionTime: .atDocumentStart, forMainFrameOnly: true)
        webView?.configuration.userContentController.addUserScript(script)
    }
}

/// Opens Google/X login in the system browser and returns verse2note://auth?code=…
@objc(NativeAuthPlugin)
public class NativeAuthPlugin: CAPPlugin, CAPBridgedPlugin {
    public let identifier = "NativeAuthPlugin"
    public let jsName = "NativeAuth"
    public let pluginMethods: [CAPPluginMethod] = [
        CAPPluginMethod(name: "start", returnType: CAPPluginReturnPromise),
        CAPPluginMethod(name: "runtime", returnType: CAPPluginReturnPromise),
        CAPPluginMethod(name: "open", returnType: CAPPluginReturnPromise),
    ]

    private let anchor = AuthAnchor()
    private var session: ASWebAuthenticationSession?

    @objc func open(_ call: CAPPluginCall) {
        guard let raw = call.getString("url"), let url = URL(string: raw), let scheme = url.scheme?.lowercased() else {
            call.reject("URL em falta.")
            return
        }
        let allowed = [
            "https", "http", "mailto", "tel", "sms",
            "youversion", "bible", "olivetree", "accord", "e-sword", "mysword", "jwlibrary",
        ]
        guard allowed.contains(scheme) else {
            call.reject("Esquema não permitido.")
            return
        }
        DispatchQueue.main.async {
            UIApplication.shared.open(url, options: [:]) { ok in
                if ok {
                    call.resolve()
                } else {
                    call.reject("Não foi possível abrir.")
                }
            }
        }
    }

    @objc func runtime(_ call: CAPPluginCall) {
        call.resolve([
            "apnsSandbox": Self.apnsSandbox,
            "bundleId": Bundle.main.bundleIdentifier ?? "com.verse2note.app",
        ])
    }

    @objc func start(_ call: CAPPluginCall) {
        guard let raw = call.getString("url"), let url = URL(string: raw) else {
            call.reject("URL de login em falta.")
            return
        }
        guard url.scheme?.lowercased() == "https", url.path == "/auth/native-start" else {
            call.reject("URL de login não permitida.")
            return
        }
        let pageHost = bridge?.webView?.url?.host?.lowercased()
        let host = url.host?.lowercased()
        let allowedHost = host == "verse2note.com" || host == "www.verse2note.com" || (pageHost != nil && host == pageHost)
        guard allowedHost else {
            call.reject("URL de login não permitida.")
            return
        }

        DispatchQueue.main.async {
            if self.session != nil {
                call.reject("Login já está aberto.")
                return
            }
            let session = ASWebAuthenticationSession(url: url, callbackURLScheme: "verse2note") { [weak self] callback, error in
                self?.session = nil
                if let callback {
                    call.resolve(["url": callback.absoluteString])
                    return
                }
                let nsError = error as NSError?
                let cancelled = nsError?.domain == ASWebAuthenticationSessionError.errorDomain
                    && nsError?.code == ASWebAuthenticationSessionError.canceledLogin.rawValue
                call.reject(cancelled ? "cancelled" : (error?.localizedDescription ?? "failed"))
            }
            session.presentationContextProvider = self.anchor
            session.prefersEphemeralWebBrowserSession = true
            self.session = session
            if !session.start() {
                self.session = nil
                call.reject("Não foi possível abrir o login.")
            }
        }
    }

    private static var apnsSandbox: Bool {
        let raw = Bundle.main.object(forInfoDictionaryKey: "Verse2NoteApnsSandbox")
        if let value = raw as? Bool { return value }
        if let value = raw as? String {
            return value == "YES" || value == "true" || value == "1"
        }
        return false
    }
}

private final class AuthAnchor: NSObject, ASWebAuthenticationPresentationContextProviding {
    func presentationAnchor(for session: ASWebAuthenticationSession) -> ASPresentationAnchor {
        let scenes = UIApplication.shared.connectedScenes.compactMap { $0 as? UIWindowScene }
        let windows = scenes.flatMap { $0.windows }
        return windows.first { $0.isKeyWindow } ?? windows.first ?? ASPresentationAnchor()
    }
}
