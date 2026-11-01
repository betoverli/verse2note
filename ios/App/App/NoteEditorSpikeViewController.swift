import UIKit
import WebKit

/// Phase 0 miolo spike: WKWebView hosting `/native-editor` with a `v2n` bridge.
final class NoteEditorSpikeViewController: UIViewController, WKScriptMessageHandler, WKNavigationDelegate {
    private var webView: WKWebView!
    private let noteId: String?
    private let demo: Bool

    init(noteId: String? = nil, demo: Bool = true) {
        self.noteId = noteId
        self.demo = demo
        super.init(nibName: nil, bundle: nil)
    }

    @available(*, unavailable)
    required init?(coder: NSCoder) { fatalError("init(coder:) has not been implemented") }

    override func viewDidLoad() {
        super.viewDidLoad()
        view.backgroundColor = .black
        title = "Editor spike"
        navigationItem.leftBarButtonItem = UIBarButtonItem(
            barButtonSystemItem: .close,
            target: self,
            action: #selector(close)
        )

        let userContent = WKUserContentController()
        userContent.add(self, name: "v2n")
        let config = WKWebViewConfiguration()
        config.userContentController = userContent
        webView = WKWebView(frame: .zero, configuration: config)
        webView.navigationDelegate = self
        webView.translatesAutoresizingMaskIntoConstraints = false
        view.addSubview(webView)
        NSLayoutConstraint.activate([
            webView.topAnchor.constraint(equalTo: view.safeAreaLayoutGuide.topAnchor),
            webView.leadingAnchor.constraint(equalTo: view.leadingAnchor),
            webView.trailingAnchor.constraint(equalTo: view.trailingAnchor),
            webView.bottomAnchor.constraint(equalTo: view.bottomAnchor),
        ])

        var components = URLComponents(url: NativeAPIClient.baseURL.appendingPathComponent("native-editor"), resolvingAgainstBaseURL: false)!
        var items: [URLQueryItem] = []
        if demo { items.append(URLQueryItem(name: "demo", value: "1")) }
        if let noteId, !noteId.isEmpty { items.append(URLQueryItem(name: "noteId", value: noteId)) }
        components.queryItems = items.isEmpty ? nil : items
        if let url = components.url {
            webView.load(URLRequest(url: url))
        }
    }

    @objc private func close() {
        dismiss(animated: true)
    }

    func userContentController(_ userContentController: WKUserContentController, didReceive message: WKScriptMessage) {
        guard message.name == "v2n" else { return }
        print("[NoteEditorSpike] bridge \(message.body)")
    }

    deinit {
        webView?.configuration.userContentController.removeScriptMessageHandler(forName: "v2n")
    }
}
