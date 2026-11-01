import Foundation

/// Shell mode for the migration. Phase 1 defaults to **hybrid** (native notebook).
enum NativeShellMode: String {
    /// Full Capacitor site (hidden fallback).
    case capacitorSite
    /// Native notebook list + note chrome; miolo WKWebView. **Default in Phase 1.**
    case hybrid
    /// Phase 0 editor spike only (debug).
    case editorSpike

    static let defaultsKey = "verse2note.nativeShellMode"
    static let infoPlistKey = "Verse2NoteNativeShellMode"
    static let didChangeNotification = Notification.Name("verse2note.nativeShellModeDidChange")

    static var current: NativeShellMode {
        if let raw = UserDefaults.standard.string(forKey: defaultsKey),
           let mode = NativeShellMode(rawValue: raw)
        {
            return mode
        }
        if let raw = Bundle.main.object(forInfoDictionaryKey: infoPlistKey) as? String,
           let mode = NativeShellMode(rawValue: raw)
        {
            return mode
        }
        return .hybrid
    }

    static func setCurrent(_ mode: NativeShellMode, notify: Bool = true) {
        UserDefaults.standard.set(mode.rawValue, forKey: defaultsKey)
        print("[NativeShellMode] \(mode.rawValue)")
        if notify {
            NotificationCenter.default.post(name: didChangeNotification, object: mode.rawValue)
        }
    }
}
