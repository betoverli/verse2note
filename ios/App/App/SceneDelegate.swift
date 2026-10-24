import UIKit
import Capacitor
import WebKit

class SceneDelegate: UIResponder, UIWindowSceneDelegate {
    var window: UIWindow?

    func scene(_ scene: UIScene, willConnectTo session: UISceneSession, options connectionOptions: UIScene.ConnectionOptions) {
        guard let windowScene = scene as? UIWindowScene else { return }

        window = UIWindow(windowScene: windowScene)
        window?.rootViewController = Verse2NoteBridgeViewController()
        window?.makeKeyAndVisible()

        SceneDelegateProxy.shared.scene(scene, willConnectTo: session, options: connectionOptions)
    }

    func scene(_ scene: UIScene, openURLContexts URLContexts: Set<UIOpenURLContext>) {
        SceneDelegateProxy.shared.scene(scene, openURLContexts: URLContexts)
    }

    func scene(_ scene: UIScene, continue userActivity: NSUserActivity) {
        SceneDelegateProxy.shared.scene(scene, continue: userActivity)
    }

    func sceneWillResignActive(_ scene: UIScene) {
        flushWebViewCookies()
    }

    func sceneDidEnterBackground(_ scene: UIScene) {
        flushWebViewCookies()
    }
}

/// WKWebView writes cookies asynchronously. Reading the store is what pushes
/// that write to disk, so an HttpOnly session cookie is still there after the
/// process is killed. `__Host-` cookies cannot be recreated from JavaScript.
private func flushWebViewCookies() {
    WKWebsiteDataStore.default().httpCookieStore.getAllCookies { _ in }
}
