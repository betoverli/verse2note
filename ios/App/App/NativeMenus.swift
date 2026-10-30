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
    private var appearance: UIUserInterfaceStyle = .unspecified
    private var keyWindowObserver: NSObjectProtocol?

    @objc func available(_ call: CAPPluginCall) {
        let major = ProcessInfo.processInfo.operatingSystemVersion.majorVersion
        call.resolve([
            "available": true,
            "glass": V2NGlassMaterial.sdkHasLiquidGlass(),
            "major": major as NSNumber,
        ])
    }

    @objc func dismiss(_ call: CAPPluginCall) {
        DispatchQueue.main.async {
            self.finish(cancelled: true)
            call.resolve()
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

        guard !items.isEmpty || style == "sheet" else {
            call.reject("Menu sem itens.")
            return
        }

        DispatchQueue.main.async {
            self.finish(cancelled: true)
            self.resolved = false
            self.activeCall = call
            call.keepAlive = true

            switch appearanceRaw {
            case "light": self.appearance = .light
            case "dark": self.appearance = .dark
            default: self.appearance = .unspecified
            }

            guard let root = self.presentationView() else {
                call.keepAlive = false
                self.activeCall = nil
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

            self.presentMenu(on: root, title: title, items: items, anchor: anchor)
        }
    }

    private func presentationView() -> UIView? {
        if let view = bridge?.viewController?.view { return view }
        if let view = bridge?.webView?.superview { return view }
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

        if let pop = sheet.popoverPresentationController {
            pop.sourceView = root
            pop.sourceRect = sanitizedAnchor(anchor, in: root)
            pop.permittedArrowDirections = [.up, .down]
        }

        guard let controller = bridge?.viewController else {
            finish(cancelled: true)
            return
        }
        controller.present(sheet, animated: true)
    }

    private func presentMenu(
        on root: UIView,
        title: String?,
        items: [NativeMenuItem],
        anchor: CGRect
    ) {
        clearAnchor()
        let rect = sanitizedAnchor(anchor, in: root)
        let button = MenuAnchorButton(frame: rect)
        button.backgroundColor = .clear
        button.isAccessibilityElement = false
        button.overrideUserInterfaceStyle = appearance
        button.showsMenuAsPrimaryAction = true
        button.menu = buildUIMenu(title: title, items: items)
        button.onMenuEnded = { [weak self] in
            self?.finish(cancelled: true)
        }
        root.addSubview(button)
        anchorButton = button
        watchMenuDismiss()

        // Pull-down menus open from a primary-action tap.
        DispatchQueue.main.async {
            button.sendActions(for: .touchUpInside)
        }
    }

    /// Pull-down menus live in their own window. When our window is key again
    /// without a selection, the person dismissed the menu.
    private func watchMenuDismiss() {
        if let keyWindowObserver {
            NotificationCenter.default.removeObserver(keyWindowObserver)
            self.keyWindowObserver = nil
        }
        var armed = false
        DispatchQueue.main.asyncAfter(deadline: .now() + 0.35) { armed = true }
        keyWindowObserver = NotificationCenter.default.addObserver(
            forName: UIWindow.didBecomeKeyNotification,
            object: nil,
            queue: .main
        ) { [weak self] note in
            guard let self, armed, !self.resolved else { return }
            guard let window = note.object as? UIWindow else { return }
            let ours = self.bridge?.viewController?.view.window
            guard window === ours else { return }
            DispatchQueue.main.asyncAfter(deadline: .now() + 0.05) { [weak self] in
                guard let self, !self.resolved else { return }
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

    private func sanitizedAnchor(_ anchor: CGRect, in root: UIView) -> CGRect {
        var rect = anchor
        if rect.width < 1 { rect.size.width = 44 }
        if rect.height < 1 { rect.size.height = 44 }
        let bounds = root.bounds
        rect.origin.x = min(max(0, rect.origin.x), max(0, bounds.width - rect.width))
        rect.origin.y = min(max(0, rect.origin.y), max(0, bounds.height - rect.height))
        return rect
    }

    private func finish(id: String? = nil, cancelled: Bool = false) {
        guard !resolved else {
            clearAnchor()
            return
        }
        resolved = true
        if id != nil {
            anchorButton?.markSelected()
        }
        let call = activeCall
        activeCall = nil
        clearAnchor()
        if let controller = bridge?.viewController, controller.presentedViewController is UIAlertController {
            controller.dismiss(animated: true)
        }
        guard let call else { return }
        call.keepAlive = false
        if let id {
            call.resolve(["id": id, "cancelled": false])
        } else {
            call.resolve(["cancelled": cancelled, "id": NSNull()])
        }
    }

    private func clearAnchor() {
        if let keyWindowObserver {
            NotificationCenter.default.removeObserver(keyWindowObserver)
            self.keyWindowObserver = nil
        }
        anchorButton?.onMenuEnded = nil
        anchorButton?.removeFromSuperview()
        anchorButton = nil
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

    private static func bool(_ value: Any?) -> Bool {
        if let value = value as? Bool { return value }
        if let number = value as? NSNumber { return number.boolValue }
        return false
    }

    private static func childObjects(_ value: Any?) -> [JSObject] {
        if let items = value as? [JSObject] { return items }
        guard let items = value as? [Any] else { return [] }
        return items.compactMap { item in
            if let object = item as? JSObject { return object }
            if let object = item as? [String: Any] { return object as JSObject }
            return nil
        }
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
    private var selected = false
    private var opened = false

    func markSelected() {
        selected = true
    }

    override func contextMenuInteraction(
        _ interaction: UIContextMenuInteraction,
        willDisplayMenuFor configuration: UIContextMenuConfiguration,
        animator: UIContextMenuInteractionAnimating?
    ) {
        opened = true
        super.contextMenuInteraction(interaction, willDisplayMenuFor: configuration, animator: animator)
    }

    override func contextMenuInteraction(
        _ interaction: UIContextMenuInteraction,
        willEndFor configuration: UIContextMenuConfiguration,
        animator: UIContextMenuInteractionAnimating?
    ) {
        super.contextMenuInteraction(interaction, willEndFor: configuration, animator: animator)
        guard opened else { return }
        opened = false
        if selected { return }
        // Pull-down menus may not always route through these overrides; the
        // deferred cancel below still covers a dismiss without a tap.
        DispatchQueue.main.async { [weak self] in
            guard let self, !self.selected else { return }
            self.onMenuEnded?()
        }
    }

    deinit {
        if !selected {
            onMenuEnded?()
        }
    }
}
