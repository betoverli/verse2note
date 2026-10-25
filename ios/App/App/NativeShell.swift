import AuthenticationServices
import Capacitor
import UIKit
import WebKit

/// Loads the hosted site and registers the login and Liquid Glass plugins
/// before the page runs. The native bars are siblings of the web view.
class Verse2NoteBridgeViewController: CAPBridgeViewController {
    private let liquidChrome = LiquidChromeOverlay()

    override func capacitorDidLoad() {
        liquidChrome.attach(to: self)
        bridge?.registerPluginInstance(NativeAuthPlugin())
        bridge?.registerPluginInstance(LiquidChromePlugin())
        tuneDocumentScroll()
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

    override func viewDidLayoutSubviews() {
        super.viewDidLayoutSubviews()
        liquidChrome.layout()
    }

    override func viewDidAppear(_ animated: Bool) {
        super.viewDidAppear(animated)
        tuneDocumentScroll()
        liquidChrome.layout()
        // The hosted page loads after this, and WebKit can put bounce back
        // to Capacitor's default until the document has finished.
        for delay in [0.35, 1.2] {
            DispatchQueue.main.asyncAfter(deadline: .now() + delay) { [weak self] in
                self?.tuneDocumentScroll()
            }
        }
    }

    /// The page rubber-band lives on the middle scroller (`.screen-body`),
    /// not on this view. Bouncing the WKWebView scroll view translates the
    /// whole layer, so the top bar and the tab bar move with the pull.
    /// Capacitor's own default is `bounces = false`; re-apply it because a
    /// later layout pass can turn the flag back on. Horizontal bounce stays
    /// off so a row swipe does not rubber-band the page.
    private func tuneDocumentScroll() {
        guard let scroll = webView?.scrollView else { return }
        scroll.bounces = false
        scroll.alwaysBounceVertical = false
        scroll.alwaysBounceHorizontal = false
        scroll.isDirectionalLockEnabled = true
        scroll.decelerationRate = .normal
        // A safe-area content inset would shrink the page above the tab
        // pill and leave the controller's background as a band underneath.
        scroll.contentInsetAdjustmentBehavior = .never
        scroll.contentInset = .zero
        scroll.verticalScrollIndicatorInsets = .zero
        V2NGlassMaterial.prepareWebScrollView(scroll)
    }
}

/// Opens Google/X login in the system browser.
/// The return is an https callback when the build and the site both have the
/// Apple team association, including webcredentials (required before iOS will
/// present ASWebAuthenticationSession). Otherwise it is the verse2note scheme.
/// Either way the code is useless without the verifier kept in the app.
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
        var supportsHttpsCallback = false
        if #available(iOS 17.4, *) {
            supportsHttpsCallback = true
        }
        call.resolve([
            "apnsSandbox": Self.apnsSandbox,
            "bundleId": Bundle.main.bundleIdentifier ?? "com.verse2note.app",
            "supportsHttpsCallback": supportsHttpsCallback,
            "universalLinksBuild": Self.universalLinksBuild,
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

        let useHttps = call.getString("callback") == "https"
        DispatchQueue.main.async {
            self.anchor.windowProvider = { [weak self] in
                self?.bridge?.webView?.window
            }
            if self.session != nil {
                call.reject("Login já está aberto.")
                return
            }
            let finish: (URL?, Error?) -> Void = { [weak self] callback, error in
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
            let session: ASWebAuthenticationSession
            if useHttps {
                guard #available(iOS 17.4, *) else {
                    call.reject("Universal Link precisa do iOS 17.4.")
                    return
                }
                // https callback is tied to this app through the associated domain.
                let callback = ASWebAuthenticationSession.Callback.https(host: "verse2note.com", path: "/auth/native-return")
                session = ASWebAuthenticationSession(url: url, callback: callback, completionHandler: finish)
            } else {
                session = ASWebAuthenticationSession(url: url, callbackURLScheme: "verse2note", completionHandler: finish)
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
        flag("Verse2NoteApnsSandbox")
    }

    private static var universalLinksBuild: Bool {
        flag("Verse2NoteUniversalLinks")
    }

    private static func flag(_ key: String) -> Bool {
        let raw = Bundle.main.object(forInfoDictionaryKey: key)
        if let value = raw as? Bool { return value }
        if let value = raw as? String {
            return value == "YES" || value == "true" || value == "1"
        }
        return false
    }
}

private final class AuthAnchor: NSObject, ASWebAuthenticationPresentationContextProviding {
    var windowProvider: () -> UIWindow? = { nil }

    func presentationAnchor(for session: ASWebAuthenticationSession) -> ASPresentationAnchor {
        if let window = windowProvider(), window.windowScene != nil {
            return window
        }
        let scenes = UIApplication.shared.connectedScenes.compactMap { $0 as? UIWindowScene }
        let scene = scenes.first { $0.activationState == .foregroundActive } ?? scenes.first
        if let window = scene?.keyWindow {
            return window
        }
        if let window = scene?.windows.first(where: { $0.isKeyWindow && !$0.isHidden }) {
            return window
        }
        if let scene {
            return UIWindow(windowScene: scene)
        }
        return ASPresentationAnchor()
    }
}
