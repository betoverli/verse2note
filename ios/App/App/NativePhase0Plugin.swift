import Capacitor
import Foundation
import UIKit

/// Phase 0 Capacitor bridge: Keychain bearer, shell mode flag, API smoke, editor spike.
@objc(NativePhase0Plugin)
public class NativePhase0Plugin: CAPPlugin, CAPBridgedPlugin {
    public let identifier = "NativePhase0Plugin"
    public let jsName = "NativePhase0"
    public let pluginMethods: [CAPPluginMethod] = [
        CAPPluginMethod(name: "getShellMode", returnType: CAPPluginReturnPromise),
        CAPPluginMethod(name: "setShellMode", returnType: CAPPluginReturnPromise),
        CAPPluginMethod(name: "syncBearer", returnType: CAPPluginReturnPromise),
        CAPPluginMethod(name: "getBearerPresent", returnType: CAPPluginReturnPromise),
        CAPPluginMethod(name: "fetchNotes", returnType: CAPPluginReturnPromise),
        CAPPluginMethod(name: "openEditorSpike", returnType: CAPPluginReturnPromise),
    ]

    @objc func getShellMode(_ call: CAPPluginCall) {
        call.resolve(["mode": NativeShellMode.current.rawValue])
    }

    @objc func setShellMode(_ call: CAPPluginCall) {
        let raw = call.getString("mode") ?? NativeShellMode.capacitorSite.rawValue
        let mode = NativeShellMode(rawValue: raw) ?? .capacitorSite
        NativeShellMode.setCurrent(mode)
        call.resolve(["mode": mode.rawValue])
    }

    @objc func syncBearer(_ call: CAPPluginCall) {
        let token = call.getString("token")
        let ok = KeychainStore.setBearerToken(token)
        call.resolve(["ok": ok])
    }

    @objc func getBearerPresent(_ call: CAPPluginCall) {
        let present = !(KeychainStore.bearerToken() ?? "").isEmpty
        call.resolve(["present": present])
    }

    @objc func fetchNotes(_ call: CAPPluginCall) {
        Task {
            do {
                let result = try await NativeAPIClient.getNotes()
                let count = NativeAPIClient.parseNotesCount(result.body)
                if result.status >= 200 && result.status < 300 {
                    call.resolve(["ok": true, "count": count ?? 0, "status": result.status])
                } else {
                    let err = String(data: result.body, encoding: .utf8) ?? "http_\(result.status)"
                    call.resolve(["ok": false, "status": result.status, "error": err])
                }
            } catch {
                call.resolve(["ok": false, "error": error.localizedDescription])
            }
        }
    }

    @objc func openEditorSpike(_ call: CAPPluginCall) {
        let noteId = call.getString("noteId")
        let demo = call.getBool("demo") ?? (noteId == nil || noteId?.isEmpty == true)
        DispatchQueue.main.async {
            guard let presenter = self.bridge?.viewController else {
                call.reject("No view controller")
                return
            }
            let spike = NoteEditorSpikeViewController(noteId: noteId, demo: demo)
            let nav = UINavigationController(rootViewController: spike)
            nav.modalPresentationStyle = .fullScreen
            presenter.present(nav, animated: true) {
                call.resolve(["ok": true])
            }
        }
    }
}
