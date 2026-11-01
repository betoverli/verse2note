import Foundation

/// Phase 0 feature flag. Default keeps the current Capacitor full-site UI.
enum NativeShellMode: String {
    case capacitorSite
    case hybrid
    case editorSpike

    static let defaultsKey = "verse2note.nativeShellMode"
    static let infoPlistKey = "Verse2NoteNativeShellMode"

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
        return .capacitorSite
    }

    static func setCurrent(_ mode: NativeShellMode) {
        UserDefaults.standard.set(mode.rawValue, forKey: defaultsKey)
        print("[NativeShellMode] \(mode.rawValue)")
    }
}
