import UIKit

/// Placeholder tab until Phases 2–4. Offers classic Capacitor fallback + site path.
final class ComingSoonTabViewController: UIViewController {
    private let titleText: String
    private let systemImage: String
    private let sitePath: String

    init(titleText: String, systemImage: String, sitePath: String) {
        self.titleText = titleText
        self.systemImage = systemImage
        self.sitePath = sitePath
        super.init(nibName: nil, bundle: nil)
    }

    @available(*, unavailable)
    required init?(coder: NSCoder) { fatalError("init(coder:) has not been implemented") }

    override func viewDidLoad() {
        super.viewDidLoad()
        view.backgroundColor = .systemBackground
        title = titleText
        navigationItem.largeTitleDisplayMode = .always
        navigationController?.navigationBar.prefersLargeTitles = true

        let stack = UIStackView()
        stack.axis = .vertical
        stack.alignment = .center
        stack.spacing = 16
        stack.translatesAutoresizingMaskIntoConstraints = false

        let icon = UIImageView(image: UIImage(systemName: systemImage))
        icon.tintColor = .secondaryLabel
        icon.contentMode = .scaleAspectFit
        icon.translatesAutoresizingMaskIntoConstraints = false
        NSLayoutConstraint.activate([
            icon.widthAnchor.constraint(equalToConstant: 48),
            icon.heightAnchor.constraint(equalToConstant: 48),
        ])

        let label = UILabel()
        label.text = "Em breve nativo.\nPor enquanto use o site clássico."
        label.numberOfLines = 0
        label.textAlignment = .center
        label.textColor = .secondaryLabel
        label.font = .preferredFont(forTextStyle: .body)

        let openSite = UIButton(type: .system)
        openSite.setTitle("Abrir \(titleText) no site", for: .normal)
        openSite.addTarget(self, action: #selector(openClassic), for: .touchUpInside)

        let fallback = UIButton(type: .system)
        fallback.setTitle("Usar app clássico (Capacitor)", for: .normal)
        fallback.titleLabel?.font = .preferredFont(forTextStyle: .footnote)
        fallback.addTarget(self, action: #selector(switchToCapacitor), for: .touchUpInside)

        stack.addArrangedSubview(icon)
        stack.addArrangedSubview(label)
        stack.addArrangedSubview(openSite)
        stack.addArrangedSubview(fallback)
        view.addSubview(stack)
        NSLayoutConstraint.activate([
            stack.centerXAnchor.constraint(equalTo: view.centerXAnchor),
            stack.centerYAnchor.constraint(equalTo: view.centerYAnchor),
            stack.leadingAnchor.constraint(greaterThanOrEqualTo: view.layoutMarginsGuide.leadingAnchor),
            stack.trailingAnchor.constraint(lessThanOrEqualTo: view.layoutMarginsGuide.trailingAnchor),
        ])
    }

    @objc private func openClassic() {
        let bridge = Verse2NoteBridgeViewController()
        bridge.modalPresentationStyle = .fullScreen
        present(bridge, animated: true) {
            // After Cap loads, the user can navigate; closing returns to native tabs.
            let close = UIBarButtonItem(barButtonSystemItem: .close, target: self, action: #selector(self.dismissClassic))
            // Cap bridge owns its chrome; add a floating close via overlay.
            let button = UIButton(type: .close)
            button.translatesAutoresizingMaskIntoConstraints = false
            button.addTarget(self, action: #selector(self.dismissClassic), for: .touchUpInside)
            bridge.view.addSubview(button)
            NSLayoutConstraint.activate([
                button.topAnchor.constraint(equalTo: bridge.view.safeAreaLayoutGuide.topAnchor, constant: 8),
                button.trailingAnchor.constraint(equalTo: bridge.view.safeAreaLayoutGuide.trailingAnchor, constant: -12),
            ])
            _ = close
            _ = self.sitePath
        }
    }

    @objc private func dismissClassic() {
        dismiss(animated: true)
    }

    @objc private func switchToCapacitor() {
        let alert = UIAlertController(
            title: "App clássico",
            message: "Volta à interface Capacitor completa. Para regressar ao Caderno nativo, abre /native-phase0 no site e escolhe hybrid.",
            preferredStyle: .alert
        )
        alert.addAction(UIAlertAction(title: "Cancelar", style: .cancel))
        alert.addAction(UIAlertAction(title: "Usar clássico", style: .default) { _ in
            NativeShellMode.setCurrent(.capacitorSite)
            AppRoot.applyToKeyWindow()
        })
        present(alert, animated: true)
    }
}
