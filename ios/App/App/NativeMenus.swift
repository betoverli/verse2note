import Capacitor
import UIKit

/// Native menus for the Capacitor iOS shell.
///
/// The website describes the items (title, SF Symbol, destructive, checked,
/// submenus). This plugin only draws them: a `UIMenu` anchored to the tapped
/// element's rect (Liquid Glass on iOS 26), or a `UIAlertController` action
/// sheet when a menu is not the right fit. Selection resolves a promise; the
/// web handles the result. Android and the browser never call this plugin.
@objc(NativeMenusPlugin)
public class NativeMenusPlugin: CAPPlugin, CAPBridgedPlugin {
    public let identifier = "NativeMenusPlugin"
    public let jsName = "NativeMenus"
    public let pluginMethods: [CAPPluginMethod] = [
        CAPPluginMethod(name: "available", returnType: CAPPluginReturnPromise),
        CAPPluginMethod(name: "present", returnType: CAPPluginReturnPromise),
        CAPPluginMethod(name: "dismiss", returnType: CAPPluginReturnPromise),
    ]

    private weak var hostView: UIView?
    private var anchorButton: MenuAnchorButton?
    private var activeCall: CAPPluginCall?
    private var resolved = false
    /// Identity of the in-flight `present` call. A deferred `dismiss` from an
    /// unmounted web ActionSheet (React remount) must not cancel a newer sheet
    /// — that was wiping the first-speaker chooser and the remove confirm.
    private var activeCallToken: ObjectIdentifier?
    private var appearance: UIUserInterfaceStyle = .unspecified
    private var keyWindowObserver: NSObjectProtocol?
    private var presentFallbackWork: DispatchWorkItem?

    @objc func available(_ call: CAPPluginCall) {
        let major = ProcessInfo.processInfo.operatingSystemVersion.majorVersion
        var data = JSObject()
        data["available"] = true
        data["glass"] = V2NGlassMaterial.sdkHasLiquidGlass()
        data["major"] = major
        call.resolve(data)
    }

    @objc func dismiss(_ call: CAPPluginCall) {
        DispatchQueue.main.async {
            guard let active = self.activeCall, !self.resolved else {
                call.resolve()
                return
            }
            let token = ObjectIdentifier(active)
            // Bounce once so a dismiss queued just before a new present lands
            // after that present has replaced activeCall — then we no-op.
            DispatchQueue.main.async {
                guard let current = self.activeCall,
                      ObjectIdentifier(current) == token,
                      !self.resolved
                else {
                    print("[NativeMenus] dismiss ignored stale token")
                    call.resolve()
                    return
                }
                self.finish(cancelled: true)
                call.resolve()
            }
        }
    }

    @objc func present(_ call: CAPPluginCall) {
        let style = (call.getString("style") ?? "menu").lowercased()
        let title = call.getString("title")
        let message = call.getString("message")
        let cancelLabel = call.getString("cancelLabel") ?? "Cancel"
        let appearanceRaw = call.getString("appearance") ?? ""
        let items = Self.parseItems(call.getArray("items", JSObject.self) ?? [])
        let anchor = Self.parseAnchor(call.getObject("anchor"))

        guard !items.isEmpty || style == "sheet" || style == "alert" || style == "prompt" else {
            call.reject("Menu sem itens.")
            return
        }

        DispatchQueue.main.async {
            self.finish(cancelled: true)
            self.resolved = false
            self.activeCall = call
            self.activeCallToken = ObjectIdentifier(call)
            call.keepAlive = true

            switch appearanceRaw {
            case "light": self.appearance = .light
            case "dark": self.appearance = .dark
            default: self.appearance = .unspecified
            }

            guard let root = self.presentationView() else {
                call.keepAlive = false
                self.activeCall = nil
                self.activeCallToken = nil
                call.reject("Janela nativa indisponível.")
                return
            }
            self.hostView = root

            if style == "sheet" {
                self.presentSheet(
                    on: root,
                    title: title,
                    message: message,
                    cancelLabel: cancelLabel,
                    items: items,
                    anchor: anchor
                )
                return
            }

            if style == "alert" || style == "prompt" {
                let placeholder = call.getString("placeholder") ?? ""
                let defaultValue = call.getString("defaultValue") ?? ""
                let okLabel = call.getString("okLabel") ?? items.first?.title ?? "OK"
                self.presentAlert(
                    on: root,
                    title: title,
                    message: message,
                    cancelLabel: cancelLabel,
                    okLabel: okLabel,
                    prompt: style == "prompt",
                    placeholder: placeholder,
                    defaultValue: defaultValue,
                    items: items,
                    anchor: anchor
                )
                return
            }

            self.presentMenu(
                on: root,
                title: title,
                cancelLabel: cancelLabel,
                items: items,
                anchor: anchor
            )
        }
    }

    /// Prefer the WKWebView's superview so the anchor lines up with CSS rects.
    private func presentationView() -> UIView? {
        if let host = bridge?.webView?.superview { return host }
        if let view = bridge?.viewController?.view { return view }
        return bridge?.webView
    }

    private func presentSheet(
        on root: UIView,
        title: String?,
        message: String?,
        cancelLabel: String,
        items: [NativeMenuItem],
        anchor: CGRect
    ) {
        let sheet = UIAlertController(title: title, message: message, preferredStyle: .actionSheet)
        sheet.overrideUserInterfaceStyle = appearance

        for item in items {
            let style: UIAlertAction.Style = item.destructive ? .destructive : .default
            let action = UIAlertAction(title: item.title, style: style) { [weak self] _ in
                self?.finish(id: item.id)
            }
            action.isEnabled = !item.disabled
            if item.checked {
                action.setValue(true, forKey: "checked")
            }
            if !item.symbol.isEmpty, let image = UIImage(systemName: item.symbol) {
                action.setValue(image, forKey: "image")
            }
            sheet.addAction(action)
            for child in item.children {
                let childStyle: UIAlertAction.Style = child.destructive ? .destructive : .default
                let childAction = UIAlertAction(title: child.title, style: childStyle) { [weak self] _ in
                    self?.finish(id: child.id)
                }
                childAction.isEnabled = !child.disabled
                if child.checked {
                    childAction.setValue(true, forKey: "checked")
                }
                if !child.symbol.isEmpty, let image = UIImage(systemName: child.symbol) {
                    childAction.setValue(image, forKey: "image")
                }
                sheet.addAction(childAction)
            }
        }

        let cancel = UIAlertAction(title: cancelLabel, style: .cancel) { [weak self] _ in
            self?.finish(cancelled: true)
        }
        sheet.addAction(cancel)

        let sourceRect = anchorRect(anchor, in: root)
        if let pop = sheet.popoverPresentationController {
            pop.sourceView = root
            pop.sourceRect = sourceRect
            pop.permittedArrowDirections = [.up, .down]
        }

        guard let controller = bridge?.viewController else {
            failPresent("Controlador nativo indisponível.")
            return
        }
        controller.present(sheet, animated: true)
    }

    /// Centered `UIAlertController` — confirm/alert, or a single text-field prompt.
    private func presentAlert(
        on root: UIView,
        title: String?,
        message: String?,
        cancelLabel: String,
        okLabel: String,
        prompt: Bool,
        placeholder: String,
        defaultValue: String,
        items: [NativeMenuItem],
        anchor: CGRect
    ) {
        let alert = UIAlertController(title: title, message: message, preferredStyle: .alert)
        alert.overrideUserInterfaceStyle = appearance

        if prompt {
            alert.addTextField { field in
                field.placeholder = placeholder
                field.text = defaultValue
                field.clearButtonMode = .whileEditing
                field.autocapitalizationType = .sentences
                field.returnKeyType = .done
            }
            let ok = UIAlertAction(title: okLabel, style: .default) { [weak self, weak alert] _ in
                let text = alert?.textFields?.first?.text ?? ""
                self?.finish(id: "ok", value: text)
            }
            alert.addAction(ok)
        } else if items.isEmpty {
            let ok = UIAlertAction(title: okLabel, style: .default) { [weak self] _ in
                self?.finish(id: "ok")
            }
            alert.addAction(ok)
        } else {
            for item in items {
                let style: UIAlertAction.Style = item.destructive ? .destructive : .default
                let action = UIAlertAction(title: item.title, style: style) { [weak self] _ in
                    self?.finish(id: item.id)
                }
                action.isEnabled = !item.disabled
                alert.addAction(action)
            }
        }

        let cancel = UIAlertAction(title: cancelLabel, style: .cancel) { [weak self] _ in
            self?.finish(cancelled: true)
        }
        alert.addAction(cancel)

        // iPad still needs a source for .alert when presented as a popover in some embeds.
        if let pop = alert.popoverPresentationController {
            pop.sourceView = root
            pop.sourceRect = anchorRect(anchor, in: root)
        }

        guard let controller = bridge?.viewController else {
            failPresent("Controlador nativo indisponível.")
            return
        }
        controller.present(alert, animated: true)
    }

    private func presentMenu(
        on root: UIView,
        title: String?,
        cancelLabel: String,
        items: [NativeMenuItem],
        anchor: CGRect
    ) {
        clearAnchor()
        let rect = anchorRect(anchor, in: root)

        // Pre-iOS 17.4: UIButton.performPrimaryAction is unavailable, and a
        // synthetic touchUpInside does not open a pull-down UIMenu.
        if #unavailable(iOS 17.4) {
            presentSheet(
                on: root,
                title: title,
                message: nil,
                cancelLabel: cancelLabel,
                items: items,
                anchor: anchor
            )
            return
        }

        let button = MenuAnchorButton(frame: rect)
        // alpha 0 / isHidden / zero-size hosts do NOT present via
        // performPrimaryAction (iOS 17.4+). Keep a barely-visible, interactive
        // hit target in the window.
        button.backgroundColor = .clear
        button.alpha = 0.01
        button.isHidden = false
        button.isUserInteractionEnabled = true
        button.isAccessibilityElement = false
        button.overrideUserInterfaceStyle = appearance
        button.showsMenuAsPrimaryAction = true
        button.menu = buildUIMenu(title: title, items: items)
        button.onMenuEnded = { [weak self] in
            self?.finish(cancelled: true)
        }
        root.addSubview(button)
        // Keep the invisible host alive for the menu lifetime; do not let
        // Auto Layout collapse it.
        button.translatesAutoresizingMaskIntoConstraints = true
        anchorButton = button
        watchMenuDismiss()
        print("[NativeMenus] presentMenu anchor=\(rect) items=\(items.count) inWindow=\(button.window != nil)")

        // performPrimaryAction is the public API that presents a UIMenu when
        // showsMenuAsPrimaryAction is true (a synthetic touchUpInside does not).
        // Prefer attaching UIMenu to a real chrome button (FAB / trailing …)
        // so the user's own tap presents — this path is a safety net only.
        DispatchQueue.main.async { [weak self, weak button] in
            guard let self, let button, button === self.anchorButton, !self.resolved else { return }
            let ready =
                button.window != nil
                && !button.isHidden
                && button.alpha > 0
                && button.isUserInteractionEnabled
                && button.bounds.width > 0
                && button.bounds.height > 0
            print("[NativeMenus] performPrimaryAction ready=\(ready) window=\(button.window != nil)")
            if #available(iOS 17.4, *), ready {
                button.performPrimaryAction()
            }
            self.scheduleMenuPresentFallback(
                root: root,
                title: title,
                cancelLabel: cancelLabel,
                items: items,
                anchor: anchor
            )
        }
    }

    /// If the pull-down menu never appears within ~400ms, fall back to a
    /// UIAlertController action sheet so the Capacitor promise cannot hang.
    private func scheduleMenuPresentFallback(
        root: UIView,
        title: String?,
        cancelLabel: String,
        items: [NativeMenuItem],
        anchor: CGRect
    ) {
        presentFallbackWork?.cancel()
        let work = DispatchWorkItem { [weak self] in
            guard let self, !self.resolved else { return }
            guard let button = self.anchorButton, !button.didPresentMenu else { return }
            print("[NativeMenus] UIMenu not confirmed — falling back to UIAlertController")
            self.presentFallbackWork = nil
            self.clearAnchorKeepingCall()
            self.presentSheet(
                on: root,
                title: title,
                message: nil,
                cancelLabel: cancelLabel,
                items: items,
                anchor: anchor
            )
        }
        presentFallbackWork = work
        DispatchQueue.main.asyncAfter(deadline: .now() + 0.40, execute: work)
    }

    /// Pull-down menus live in their own window. Mark presentation when that
    /// window becomes key; when ours is key again without a selection, dismiss.
    private func watchMenuDismiss() {
        if let keyWindowObserver {
            NotificationCenter.default.removeObserver(keyWindowObserver)
            self.keyWindowObserver = nil
        }
        var dismissArmed = false
        DispatchQueue.main.asyncAfter(deadline: .now() + 0.35) { dismissArmed = true }
        keyWindowObserver = NotificationCenter.default.addObserver(
            forName: UIWindow.didBecomeKeyNotification,
            object: nil,
            queue: .main
        ) { [weak self] note in
            guard let self, !self.resolved else { return }
            guard let window = note.object as? UIWindow else { return }
            let ours = self.bridge?.viewController?.view.window
            if window !== ours {
                // A menu / popover window took key — presentation succeeded.
                self.anchorButton?.markPresented()
                self.presentFallbackWork?.cancel()
                self.presentFallbackWork = nil
                return
            }
            guard dismissArmed else { return }
            DispatchQueue.main.asyncAfter(deadline: .now() + 0.05) { [weak self] in
                guard let self, !self.resolved else { return }
                // Only treat as dismiss once a menu was actually shown; otherwise
                // the presentation-fallback sheet still owns the call.
                guard self.anchorButton?.didPresentMenu == true else { return }
                self.finish(cancelled: true)
            }
        }
    }

    private func buildUIMenu(title: String?, items: [NativeMenuItem]) -> UIMenu {
        let children: [UIMenuElement] = items.map { item in
            if !item.children.isEmpty {
                let nested = item.children.map { child in self.action(for: child) }
                return UIMenu(
                    title: item.title,
                    image: symbolImage(item.symbol),
                    options: [],
                    children: nested
                )
            }
            return action(for: item)
        }
        if let title, !title.isEmpty {
            return UIMenu(title: title, children: children)
        }
        return UIMenu(title: "", children: children)
    }

    private func action(for item: NativeMenuItem) -> UIAction {
        var attributes: UIMenuElement.Attributes = []
        if item.destructive { attributes.insert(.destructive) }
        if item.disabled { attributes.insert(.disabled) }
        let state: UIMenuElement.State = item.checked ? .on : .off
        return UIAction(
            title: item.title,
            image: symbolImage(item.symbol),
            identifier: UIAction.Identifier(item.id),
            attributes: attributes,
            state: state
        ) { [weak self] _ in
            self?.finish(id: item.id)
        }
    }

    private func symbolImage(_ name: String) -> UIImage? {
        guard !name.isEmpty else { return nil }
        return UIImage(systemName: name)
    }

    /// CSS viewport rect → host view coordinates (WKWebView when available).
    private func anchorRect(_ anchor: CGRect, in root: UIView) -> CGRect {
        var rect = anchor
        if rect.width < 1 { rect.size.width = 44 }
        if rect.height < 1 { rect.size.height = 44 }
        if let webView = bridge?.webView {
            rect = webView.convert(rect, to: root)
        }
        let bounds = root.bounds
        rect.origin.x = min(max(0, rect.origin.x), max(0, bounds.width - rect.width))
        rect.origin.y = min(max(0, rect.origin.y), max(0, bounds.height - rect.height))
        return rect
    }

    private func finish(id: String? = nil, cancelled: Bool = false, value: String? = nil) {
        guard !resolved else {
            clearAnchor()
            return
        }
        resolved = true
        presentFallbackWork?.cancel()
        presentFallbackWork = nil
        if id != nil {
            anchorButton?.markSelected()
        }
        let call = activeCall
        activeCall = nil
        activeCallToken = nil
        clearAnchor()
        if let controller = bridge?.viewController, controller.presentedViewController is UIAlertController {
            controller.dismiss(animated: true)
        }
        guard let call else { return }
        call.keepAlive = false
        var data = JSObject()
        if let id {
            data["id"] = id
            data["cancelled"] = false
        } else {
            data["id"] = NSNull()
            data["cancelled"] = cancelled
        }
        if let value {
            data["value"] = value
        }
        call.resolve(data)
    }

    private func failPresent(_ message: String) {
        guard !resolved else {
            clearAnchor()
            return
        }
        resolved = true
        presentFallbackWork?.cancel()
        presentFallbackWork = nil
        let call = activeCall
        activeCall = nil
        activeCallToken = nil
        clearAnchor()
        guard let call else { return }
        call.keepAlive = false
        call.reject(message)
    }

    private func clearAnchorKeepingCall() {
        presentFallbackWork?.cancel()
        presentFallbackWork = nil
        if let keyWindowObserver {
            NotificationCenter.default.removeObserver(keyWindowObserver)
            self.keyWindowObserver = nil
        }
        anchorButton?.onMenuEnded = nil
        anchorButton?.removeFromSuperview()
        anchorButton = nil
    }

    private func clearAnchor() {
        clearAnchorKeepingCall()
    }

    private static func parseAnchor(_ object: JSObject?) -> CGRect {
        guard let object else {
            return CGRect(x: UIScreen.main.bounds.midX - 22, y: UIScreen.main.bounds.midY - 22, width: 44, height: 44)
        }
        let x = cgFloat(object["x"]) ?? 0
        let y = cgFloat(object["y"]) ?? 0
        let width = cgFloat(object["width"]) ?? 44
        let height = cgFloat(object["height"]) ?? 44
        return CGRect(x: x, y: y, width: width, height: height)
    }

    private static func cgFloat(_ value: Any?) -> CGFloat? {
        if let number = value as? NSNumber { return CGFloat(truncating: number) }
        if let number = value as? Double { return CGFloat(number) }
        if let number = value as? Int { return CGFloat(number) }
        return nil
    }

    private static func parseItems(_ raw: [JSObject]) -> [NativeMenuItem] {
        raw.compactMap { parseItem($0) }
    }

    private static func parseItem(_ raw: JSObject) -> NativeMenuItem? {
        let id = raw["id"] as? String ?? ""
        let title = raw["title"] as? String ?? ""
        if id.isEmpty || title.isEmpty { return nil }
        return NativeMenuItem(
            id: id,
            title: title,
            symbol: raw["symbol"] as? String ?? "",
            destructive: bool(raw["destructive"]),
            checked: bool(raw["checked"]),
            disabled: bool(raw["disabled"]),
            children: childObjects(raw["children"]).compactMap { parseItem($0) }
        )
    }

    private static func bool(_ value: JSValue?) -> Bool {
        if let value = value as? Bool { return value }
        if let number = value as? NSNumber { return number.boolValue }
        return false
    }

    /// Nested menu children arrive as a JS array of objects. Foundation class
    /// clusters cannot be cast straight to `JSObject` (`[String: JSValue]`);
    /// coerce each dictionary through Capacitor's helper instead.
    private static func childObjects(_ value: JSValue?) -> [JSObject] {
        guard let value else { return [] }
        if let items = value as? [JSObject] {
            return items
        }
        if let items = value as? JSArray {
            return items.compactMap { jsObject(from: $0) }
        }
        if let items = value as? [Any] {
            return items.compactMap { jsObject(from: $0) }
        }
        if let items = value as? NSArray {
            return items.compactMap { jsObject(from: $0) }
        }
        return []
    }

    private static func jsObject(from value: Any?) -> JSObject? {
        guard let value else { return nil }
        if let object = value as? JSObject {
            return object
        }
        if let object = JSTypes.coerceDictionaryToJSObject(value as? NSDictionary) {
            return object
        }
        if let object = JSTypes.coerceDictionaryToJSObject(value as? [AnyHashable: Any]) {
            return object
        }
        return nil
    }
}

private struct NativeMenuItem {
    var id: String
    var title: String
    var symbol: String
    var destructive: Bool
    var checked: Bool
    var disabled: Bool
    var children: [NativeMenuItem]
}

/// Invisible hit target that hosts a pull-down `UIMenu` and reports dismissal.
private final class MenuAnchorButton: UIButton {
    var onMenuEnded: (() -> Void)?
    /// Do not name this `selected` — that collides with `UIControl.isSelected` /
    /// the ObjC `selected` property and fails to compile.
    private var didChooseItem = false
    private(set) var didPresentMenu = false

    func markSelected() {
        didChooseItem = true
    }

    func markPresented() {
        didPresentMenu = true
    }

    override func contextMenuInteraction(
        _ interaction: UIContextMenuInteraction,
        willDisplayMenuFor configuration: UIContextMenuConfiguration,
        animator: UIContextMenuInteractionAnimating?
    ) {
        didPresentMenu = true
        super.contextMenuInteraction(interaction, willDisplayMenuFor: configuration, animator: animator)
    }

    override func contextMenuInteraction(
        _ interaction: UIContextMenuInteraction,
        willEndFor configuration: UIContextMenuConfiguration,
        animator: UIContextMenuInteractionAnimating?
    ) {
        super.contextMenuInteraction(interaction, willEndFor: configuration, animator: animator)
        guard didPresentMenu else { return }
        if didChooseItem { return }
        // Pull-down menus may not always route through these overrides; the
        // deferred cancel below still covers a dismiss without a tap.
        DispatchQueue.main.async { [weak self] in
            guard let self, !self.didChooseItem else { return }
            self.onMenuEnded?()
        }
    }

    deinit {
        if !didChooseItem {
            onMenuEnded?()
        }
    }
}
