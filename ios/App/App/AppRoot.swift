import UIKit

/// Builds the window root for the current `NativeShellMode`.
enum AppRoot {
    static func makeRootViewController() -> UIViewController {
        switch NativeShellMode.current {
        case .capacitorSite:
            return Verse2NoteBridgeViewController()
        case .hybrid, .editorSpike:
            return NativeRootTabBarController()
        }
    }

    static func applyToKeyWindow(animated: Bool = true) {
        let scenes = UIApplication.shared.connectedScenes.compactMap { $0 as? UIWindowScene }
        let scene = scenes.first { $0.activationState == .foregroundActive } ?? scenes.first
        guard let window = scene?.windows.first(where: { $0.isKeyWindow }) ?? scene?.windows.first else {
            return
        }
        let next = makeRootViewController()
        if animated {
            UIView.transition(with: window, duration: 0.28, options: .transitionCrossDissolve, animations: {
                window.rootViewController = next
            })
        } else {
            window.rootViewController = next
        }
    }
}
