import Capacitor
import UIKit

/// Native chrome drawn above the WKWebView.
///
/// iOS 26, built with the iOS 26 SDK: the system bar materials are Liquid
/// Glass, and the + button is prominent glass.
/// iOS 15–25 (and any binary built with an older SDK): a real `UITabBar`
/// and `UINavigationBar` with the system chrome material. No CSS.
///
/// The bars are siblings of the web view. Each bar has one material: on
/// iOS 26 that is `UIGlassEffect`, otherwise the system chrome blur. The
/// page draws underneath, so the material refracts the list. An empty
/// reserved band behind the effect is what made the glass look painted on.
///
/// Search is a magnifying-glass button in the title row. Tapping it swaps
/// that row for a search field. It never adds a second strip.
///
/// The rubber-band stays on `.screen-body` and does not drag this chrome.
final class LiquidChromeOverlay: NSObject, UITabBarDelegate, UISearchBarDelegate {
    static weak var current: LiquidChromeOverlay?

    private weak var owner: UIViewController?
    private let host = ChromePassView()
    private let topPlate = UIVisualEffectView()
    private let tabPlate = UIVisualEffectView()
    private let navBar = UINavigationBar()
    private let searchBar = UISearchBar()
    private lazy var searchSlot = SearchSlot(bar: searchBar)
    private let tabBar = UITabBar()
    private let fab = UIButton(type: .custom)
    private let navItem = UINavigationItem(title: "")
    private lazy var searchItem: UIBarButtonItem = {
        UIBarButtonItem(
            image: UIImage(systemName: "magnifyingglass"),
            style: .plain,
            target: self,
            action: #selector(searchTapped)
        )
    }()
    private var model = LiquidChromeModel()
    private var tabIDs: [String] = []
    private var tabSignature = ""
    private var trailingSignature = ""
    private var trailingItem: UIBarButtonItem?
    private var rightSignature = ""
    private var backSignature = ""
    private var barIdentity = ""
    private var suppressTabs = false
    private var writingSearch = false
    private var searchOpen = false
    private var glass = false
    private var topVisible = false
    private var tabsWanted = false
    private var lastTop: CGFloat = -1
    private var lastBottom: CGFloat = -1
    private let accent = UIColor(red: 0, green: 122.0 / 255.0, blue: 1, alpha: 1)
    /// Title row only. Search does not add a row. Matches the web clearance.
    private let barHeight: CGFloat = 44
    private let tabBody: CGFloat = 49

    func attach(to controller: UIViewController) {
        owner = controller
        Self.current = self
        glass = V2NGlassMaterial.sdkHasLiquidGlass()

        host.backgroundColor = .clear
        host.isOpaque = false
        if host.superview == nil {
            controller.view.addSubview(host)
        }

        topPlate.isUserInteractionEnabled = false
        topPlate.isOpaque = false
        topPlate.backgroundColor = .clear
        tabPlate.isUserInteractionEnabled = false
        tabPlate.isOpaque = false
        tabPlate.backgroundColor = .clear
        applyMaterials()
        navBar.prefersLargeTitles = false
        navBar.tintColor = accent
        navBar.isTranslucent = true
        navBar.setItems([navItem], animated: false)

        searchBar.searchBarStyle = .minimal
        searchBar.backgroundImage = UIImage()
        searchBar.autocapitalizationType = .none
        searchBar.autocorrectionType = .no
        searchBar.spellCheckingType = .no
        searchBar.returnKeyType = .search
        searchBar.tintColor = accent
        searchBar.delegate = self

        tabBar.delegate = self
        tabBar.tintColor = accent
        tabBar.isTranslucent = true

        tabBar.isHidden = true
        tabPlate.isHidden = true
        navBar.isHidden = true
        topPlate.isHidden = true

        V2NGlassMaterial.applyFabStyle(to: fab)
        fab.addTarget(self, action: #selector(fabTapped), for: .touchUpInside)
        fab.isHidden = true
        if !glass {
            fab.layer.shadowColor = UIColor.black.cgColor
            fab.layer.shadowOpacity = 0.22
            fab.layer.shadowRadius = 10
            fab.layer.shadowOffset = CGSize(width: 0, height: 8)
        }

        for view in [topPlate, navBar, tabPlate, tabBar, fab] as [UIView] {
            host.addSubview(view)
        }
        layout()
    }

    func layout() {
        guard let view = owner?.view else { return }
        if view.subviews.last !== host {
            view.bringSubviewToFront(host)
        }
        host.frame = view.bounds
        let safe = view.safeAreaInsets
        let width = view.bounds.width

        let topHeight = topInset(safe.top)
        if topVisible {
            topPlate.isHidden = false
            topPlate.frame = CGRect(x: 0, y: 0, width: width, height: topHeight)
            navBar.isHidden = false
            navBar.frame = CGRect(x: 0, y: safe.top, width: width, height: barHeight)
        } else {
            topPlate.isHidden = true
            navBar.isHidden = true
        }

        let tabHeight = tabBody + safe.bottom
        let tabFrame = CGRect(x: 0, y: view.bounds.height - tabHeight, width: width, height: tabHeight)
        tabPlate.frame = tabFrame
        tabBar.frame = tabFrame
        tabPlate.isHidden = tabBar.isHidden || !glass

        let fabSize: CGFloat = 56
        let fabX = width - safe.right - 16 - fabSize
        let fabY = view.bounds.height - (tabsWanted ? tabHeight : safe.bottom) - 16 - fabSize
        fab.frame = CGRect(x: fabX, y: fabY, width: fabSize, height: fabSize)
        if !glass {
            fab.layer.shadowPath = UIBezierPath(ovalIn: fab.bounds).cgPath
        }

        let top = topInset(safe.top)
        let bottom = tabsWanted ? tabHeight : 0
        if top != lastTop || bottom != lastBottom {
            lastTop = top
            lastBottom = bottom
            LiquidChromePlugin.broadcastInsets(top: top, bottom: bottom, glass: glass)
        }
    }

    func apply(_ model: LiquidChromeModel) -> (top: CGFloat, bottom: CGFloat) {
        let style: UIUserInterfaceStyle = model.appearance == "light" ? .light : .dark
        host.overrideUserInterfaceStyle = style
        let identity = "\(model.topVisible)|\(model.title)|\(model.selectedTab)|\(model.back)|\(model.searchPlaceholder)"
        let screenChanged = identity != barIdentity
        barIdentity = identity
        self.model = model
        topVisible = model.topVisible
        tabsWanted = model.tabsVisible
        if searchOpen && (screenChanged || !model.searchVisible || !model.topVisible) {
            dismissSearch(notify: false)
        }

        applyTabs(model.tabs, selected: model.selectedTab)
        let drawTabs = model.tabsVisible && !model.keyboard
        tabBar.isHidden = !drawTabs
        tabPlate.isHidden = !drawTabs || !glass

        if searchBar.placeholder != model.searchPlaceholder {
            searchBar.placeholder = model.searchPlaceholder
        }
        // Don't push the field's text while the person is typing — assigning
        // it drops the cursor. The web echoes the same string back.
        if searchBar.text != model.searchText && !searchBar.isFirstResponder {
            writingSearch = true
            searchBar.text = model.searchText
            writingSearch = false
        }

        if searchOpen {
            presentSearch(focus: false)
        } else {
            showIdleBar()
        }

        fab.accessibilityLabel = model.fabLabel
        fab.isHidden = !model.fabVisible || model.keyboard

        owner?.view.layoutIfNeeded()
        layout()
        let safe = owner?.view.safeAreaInsets ?? .zero
        let top = topInset(safe.top)
        let bottom = tabsWanted ? tabBody + safe.bottom : 0
        return (top, bottom)
    }

    private func topInset(_ safeTop: CGFloat) -> CGFloat {
        topVisible ? safeTop + barHeight : 0
    }

    /// One material per bar. The navigation bar stays transparent and the
    /// plate behind it carries the glass or the classic blur, including the
    /// status-bar area. A second material on the bar itself stacks into a
    /// solid strip. The tab bar keeps the system material on older iOS and
    /// uses the same single plate on iOS 26.
    private func applyMaterials() {
        let clear = UINavigationBarAppearance()
        clear.configureWithTransparentBackground()
        clear.shadowColor = .clear
        clear.titleTextAttributes = [
            .font: UIFont.systemFont(ofSize: 17, weight: .semibold),
        ]
        navBar.standardAppearance = clear
        navBar.scrollEdgeAppearance = clear
        navBar.compactAppearance = clear
        if #available(iOS 15.0, *) {
            navBar.compactScrollEdgeAppearance = clear
        }

        let tabAppearance = UITabBarAppearance()
        if glass, let effect = V2NGlassMaterial.effect(withInteractive: true) {
            tabPlate.effect = effect
            tabAppearance.configureWithTransparentBackground()
            tabAppearance.shadowColor = .clear
        } else {
            tabPlate.effect = nil
            tabAppearance.configureWithDefaultBackground()
        }
        tabBar.standardAppearance = tabAppearance
        tabBar.scrollEdgeAppearance = tabAppearance

        if glass, let effect = V2NGlassMaterial.effect(withInteractive: false) {
            topPlate.effect = effect
        } else {
            topPlate.effect = UIBlurEffect(style: .systemChromeMaterial)
        }
    }

    private func applyTabs(_ tabs: [LiquidChromeTab], selected: String) {
        let signature = tabs.map { "\($0.id)|\($0.label)|\($0.symbol)" }.joined(separator: "\n")
        if signature != tabSignature {
            tabSignature = signature
            tabIDs = tabs.map(\.id)
            tabBar.items = tabs.enumerated().map { index, tab in
                let item = UITabBarItem(title: tab.label, image: UIImage(systemName: tab.symbol), tag: index)
                item.accessibilityIdentifier = tab.id
                return item
            }
        }
        suppressTabs = true
        if let index = tabIDs.firstIndex(of: selected), let items = tabBar.items, index < items.count {
            tabBar.selectedItem = items[index]
        }
        suppressTabs = false
    }

    private func showIdleBar() {
        if navItem.titleView != nil {
            navItem.titleView = nil
            rightSignature = ""
        }
        searchBar.showsCancelButton = false
        navItem.title = model.title
        let backKey = model.back ? model.backLabel : ""
        if backKey != backSignature || (model.back && navItem.leftBarButtonItem == nil) || (!model.back && navItem.leftBarButtonItem != nil) {
            backSignature = backKey
            if model.back {
                let back = UIBarButtonItem(
                    image: UIImage(systemName: "chevron.backward"),
                    style: .plain,
                    target: self,
                    action: #selector(backTapped)
                )
                back.accessibilityLabel = model.backLabel
                navItem.leftBarButtonItem = back
            } else {
                navItem.leftBarButtonItem = nil
            }
        }
        applyTrailing()
    }

    private func presentSearch(focus: Bool) {
        if navItem.titleView !== searchSlot {
            navItem.title = ""
            navItem.leftBarButtonItem = nil
            navItem.rightBarButtonItems = nil
            backSignature = ""
            rightSignature = ""
            searchBar.showsCancelButton = true
            searchBar.placeholder = model.searchPlaceholder
            navItem.titleView = searchSlot
        }
        if focus {
            searchBar.becomeFirstResponder()
        }
    }

    private func dismissSearch(notify: Bool) {
        let hadText = !(searchBar.text ?? "").isEmpty
        searchOpen = false
        searchBar.resignFirstResponder()
        if hadText {
            writingSearch = true
            searchBar.text = ""
            writingSearch = false
        }
        showIdleBar()
        if notify && hadText {
            LiquidChromePlugin.active?.notifyListeners("searchChanged", data: ["text": ""])
        }
    }

    private func applyTrailing() {
        let signature = "\(model.trailingVisible)|\(model.trailingSymbol)|\(model.trailingBadge)|\(model.trailingLabel)|\(model.searchVisible)|\(model.searchPlaceholder)"
        if signature == rightSignature {
            return
        }
        rightSignature = signature
        var items: [UIBarButtonItem] = []
        if let trailing = trailingButton() {
            items.append(trailing)
        }
        if model.searchVisible && model.topVisible {
            let label = model.searchPlaceholder.isEmpty ? "Buscar" : model.searchPlaceholder
            searchItem.accessibilityLabel = label
            items.append(searchItem)
        }
        navItem.rightBarButtonItems = items.isEmpty ? nil : items
    }

    private func trailingButton() -> UIBarButtonItem? {
        guard model.trailingVisible, !model.trailingSymbol.isEmpty else {
            trailingSignature = ""
            trailingItem = nil
            return nil
        }
        let signature = "\(model.trailingSymbol)|\(model.trailingBadge)|\(model.trailingLabel)"
        if signature == trailingSignature, let trailingItem {
            return trailingItem
        }
        trailingSignature = signature
        let button = UIButton(type: .system)
        let image = UIImage(systemName: model.trailingSymbol, withConfiguration: UIImage.SymbolConfiguration(pointSize: 20, weight: .regular))
        button.setImage(image, for: .normal)
        button.tintColor = accent
        button.accessibilityLabel = model.trailingLabel
        button.frame = CGRect(x: 0, y: 0, width: 44, height: 44)
        button.addTarget(self, action: #selector(trailingTapped), for: .touchUpInside)
        if !model.trailingBadge.isEmpty {
            let pill = UILabel()
            pill.text = model.trailingBadge
            pill.font = .systemFont(ofSize: 11, weight: .bold)
            pill.textColor = .white
            pill.backgroundColor = .systemRed
            pill.textAlignment = .center
            pill.layer.cornerRadius = 8
            pill.clipsToBounds = true
            let width = max(16, pill.intrinsicContentSize.width + 8)
            pill.frame = CGRect(x: 44 - width - 2, y: 6, width: width, height: 16)
            pill.isAccessibilityElement = false
            button.addSubview(pill)
        }
        let item = UIBarButtonItem(customView: button)
        trailingItem = item
        return item
    }

    func tabBar(_ tabBar: UITabBar, didSelect item: UITabBarItem) {
        if suppressTabs { return }
        guard item.tag >= 0, item.tag < tabIDs.count else { return }
        LiquidChromePlugin.active?.notifyListeners("tabSelected", data: ["id": tabIDs[item.tag]])
    }

    func searchBar(_ searchBar: UISearchBar, textDidChange searchText: String) {
        if writingSearch { return }
        LiquidChromePlugin.active?.notifyListeners("searchChanged", data: ["text": searchText])
    }

    func searchBarSearchButtonClicked(_ searchBar: UISearchBar) {
        searchBar.resignFirstResponder()
    }

    func searchBarCancelButtonClicked(_ searchBar: UISearchBar) {
        dismissSearch(notify: true)
    }

    @objc private func searchTapped() {
        guard model.searchVisible, !searchOpen else { return }
        searchOpen = true
        presentSearch(focus: true)
    }

    @objc private func backTapped() {
        LiquidChromePlugin.active?.notifyListeners("back", data: [:])
    }

    @objc private func trailingTapped() {
        LiquidChromePlugin.active?.notifyListeners("trailingTap", data: [:])
    }

    @objc private func fabTapped() {
        LiquidChromePlugin.active?.notifyListeners("fabTap", data: [:])
    }
}

private final class ChromePassView: UIView {
    override func hitTest(_ point: CGPoint, with event: UIEvent?) -> UIView? {
        let hit = super.hitTest(point, with: event)
        if hit == nil || hit === self { return nil }
        return hit
    }
}

/// Asks the navigation bar for the full width between the side buttons so
/// the search field can replace the title without growing the bar.
private final class SearchSlot: UIView {
    let bar: UISearchBar

    init(bar: UISearchBar) {
        self.bar = bar
        super.init(frame: CGRect(x: 0, y: 0, width: 240, height: 44))
        addSubview(bar)
    }

    required init?(coder: NSCoder) { return nil }

    override var intrinsicContentSize: CGSize {
        CGSize(width: UIView.layoutFittingExpandedSize.width, height: 44)
    }

    override func layoutSubviews() {
        super.layoutSubviews()
        bar.frame = bounds
    }
}

struct LiquidChromeTab {
    var id: String
    var label: String
    var symbol: String
}

struct LiquidChromeModel {
    var tabsVisible = false
    var tabs: [LiquidChromeTab] = []
    var selectedTab = ""
    var topVisible = false
    var title = ""
    var back = false
    var backLabel = ""
    var searchVisible = false
    var searchText = ""
    var searchPlaceholder = ""
    var trailingVisible = false
    var trailingSymbol = ""
    var trailingBadge = ""
    var trailingLabel = ""
    var fabVisible = false
    var fabLabel = ""
    var keyboard = false
    var appearance = "dark"
}

@objc(LiquidChromePlugin)
public class LiquidChromePlugin: CAPPlugin, CAPBridgedPlugin {
    public let identifier = "LiquidChromePlugin"
    public let jsName = "LiquidChrome"
    public let pluginMethods: [CAPPluginMethod] = [
        CAPPluginMethod(name: "info", returnType: CAPPluginReturnPromise),
        CAPPluginMethod(name: "setChrome", returnType: CAPPluginReturnPromise),
    ]

    static weak var active: LiquidChromePlugin?

    @objc public override func load() {
        Self.active = self
    }

    static func broadcastInsets(top: CGFloat, bottom: CGFloat, glass: Bool) {
        let data: [String: Any] = [
            "top": top as NSNumber,
            "bottom": bottom as NSNumber,
            "glass": glass,
        ]
        active?.notifyListeners("insets", data: data)
    }

    @objc func info(_ call: CAPPluginCall) {
        let major = ProcessInfo.processInfo.operatingSystemVersion.majorVersion
        let glass = V2NGlassMaterial.sdkHasLiquidGlass()
        call.resolve([
            "available": true,
            "glass": glass,
            "major": major as NSNumber,
        ])
    }

    @objc func setChrome(_ call: CAPPluginCall) {
        let model = Self.model(from: call)
        DispatchQueue.main.async {
            guard let overlay = LiquidChromeOverlay.current else {
                call.reject("Chrome nativo ainda não está no ecrã.")
                return
            }
            let insets = overlay.apply(model)
            let data: [String: Any] = [
                "top": insets.top as NSNumber,
                "bottom": insets.bottom as NSNumber,
                "glass": V2NGlassMaterial.sdkHasLiquidGlass(),
            ]
            call.resolve(data)
        }
    }

    private static func model(from call: CAPPluginCall) -> LiquidChromeModel {
        var model = LiquidChromeModel()
        model.tabsVisible = call.getBool("tabsVisible") ?? false
        model.selectedTab = call.getString("selectedTab") ?? ""
        model.topVisible = call.getBool("topVisible") ?? false
        model.title = call.getString("title") ?? ""
        model.back = call.getBool("back") ?? false
        model.backLabel = call.getString("backLabel") ?? ""
        model.searchVisible = call.getBool("searchVisible") ?? false
        model.searchText = call.getString("searchText") ?? ""
        model.searchPlaceholder = call.getString("searchPlaceholder") ?? ""
        model.trailingVisible = call.getBool("trailingVisible") ?? false
        model.trailingSymbol = call.getString("trailingSymbol") ?? ""
        model.trailingBadge = call.getString("trailingBadge") ?? ""
        model.trailingLabel = call.getString("trailingLabel") ?? ""
        model.fabVisible = call.getBool("fabVisible") ?? false
        model.fabLabel = call.getString("fabLabel") ?? ""
        model.keyboard = call.getBool("keyboard") ?? false
        model.appearance = call.getString("appearance") ?? "dark"
        model.tabs = (call.getArray("tabs", JSObject.self) ?? []).compactMap { item in
            let id = item["id"] as? String ?? ""
            if id.isEmpty { return nil }
            return LiquidChromeTab(
                id: id,
                label: item["label"] as? String ?? "",
                symbol: item["symbol"] as? String ?? "circle"
            )
        }
        return model
    }
}
