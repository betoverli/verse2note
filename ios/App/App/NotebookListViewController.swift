import UIKit

/// Phase 1 native notebook list: search, swipe share/delete, compose.
final class NotebookListViewController: UIViewController, UITableViewDelegate, UITableViewDataSource, UISearchResultsUpdating {
    private let tableView = UITableView(frame: .zero, style: .insetGrouped)
    private let refresh = UIRefreshControl()
    private var notes: [NativeAPIClient.NoteDocument] = []
    private var filtered: [NativeAPIClient.NoteDocument] = []
    private var speakers: [NativeAPIClient.SpeakerDTO] = []
    private let search = UISearchController(searchResultsController: nil)
    private let emptyLabel = UILabel()
    private let signInButton = UIButton(type: .system)
    private var statusBanner = UILabel()

    override func viewDidLoad() {
        super.viewDidLoad()
        view.backgroundColor = .systemBackground
        title = "Caderno"
        navigationController?.navigationBar.prefersLargeTitles = true
        navigationItem.largeTitleDisplayMode = .always

        navigationItem.rightBarButtonItems = [
            UIBarButtonItem(barButtonSystemItem: .add, target: self, action: #selector(composeNote)),
            UIBarButtonItem(image: UIImage(systemName: "ellipsis.circle"), style: .plain, target: self, action: #selector(moreMenu)),
        ]

        search.searchResultsUpdater = self
        search.obscuresBackgroundDuringPresentation = false
        search.searchBar.placeholder = "Pesquisar notas"
        navigationItem.searchController = search
        definesPresentationContext = true

        tableView.translatesAutoresizingMaskIntoConstraints = false
        tableView.delegate = self
        tableView.dataSource = self
        tableView.register(SubtitleNoteCell.self, forCellReuseIdentifier: SubtitleNoteCell.reuseId)
        tableView.rowHeight = UITableView.automaticDimension
        tableView.estimatedRowHeight = 72
        refresh.addTarget(self, action: #selector(reload), for: .valueChanged)
        tableView.refreshControl = refresh
        view.addSubview(tableView)

        emptyLabel.translatesAutoresizingMaskIntoConstraints = false
        emptyLabel.textAlignment = .center
        emptyLabel.textColor = .secondaryLabel
        emptyLabel.numberOfLines = 0
        emptyLabel.font = .preferredFont(forTextStyle: .body)
        emptyLabel.isHidden = true
        view.addSubview(emptyLabel)

        signInButton.translatesAutoresizingMaskIntoConstraints = false
        signInButton.setTitle("Entrar", for: .normal)
        signInButton.titleLabel?.font = .preferredFont(forTextStyle: .headline)
        signInButton.addTarget(self, action: #selector(presentSignInTapped), for: .touchUpInside)
        signInButton.isHidden = true
        view.addSubview(signInButton)

        statusBanner.translatesAutoresizingMaskIntoConstraints = false
        statusBanner.font = .preferredFont(forTextStyle: .caption1)
        statusBanner.textColor = .secondaryLabel
        statusBanner.textAlignment = .center
        statusBanner.numberOfLines = 2
        view.addSubview(statusBanner)

        NSLayoutConstraint.activate([
            statusBanner.topAnchor.constraint(equalTo: view.safeAreaLayoutGuide.topAnchor, constant: 4),
            statusBanner.leadingAnchor.constraint(equalTo: view.layoutMarginsGuide.leadingAnchor),
            statusBanner.trailingAnchor.constraint(equalTo: view.layoutMarginsGuide.trailingAnchor),

            tableView.topAnchor.constraint(equalTo: statusBanner.bottomAnchor, constant: 4),
            tableView.leadingAnchor.constraint(equalTo: view.leadingAnchor),
            tableView.trailingAnchor.constraint(equalTo: view.trailingAnchor),
            tableView.bottomAnchor.constraint(equalTo: view.bottomAnchor),

            emptyLabel.centerXAnchor.constraint(equalTo: view.centerXAnchor),
            emptyLabel.centerYAnchor.constraint(equalTo: view.centerYAnchor, constant: -24),
            emptyLabel.leadingAnchor.constraint(equalTo: view.layoutMarginsGuide.leadingAnchor),
            emptyLabel.trailingAnchor.constraint(equalTo: view.layoutMarginsGuide.trailingAnchor),

            signInButton.topAnchor.constraint(equalTo: emptyLabel.bottomAnchor, constant: 16),
            signInButton.centerXAnchor.constraint(equalTo: view.centerXAnchor),
        ])

        notes = LocalNoteCache.loadNotes()
        speakers = LocalNoteCache.loadSpeakers()
        applyFilter()

        NotificationCenter.default.addObserver(
            self,
            selector: #selector(reload),
            name: .nativeSessionDidChange,
            object: nil
        )
    }

    override func viewWillAppear(_ animated: Bool) {
        super.viewWillAppear(animated)
        Task { @MainActor in
            if !NativeAPIClient.hasBearer {
                _ = await NativeSessionBootstrap.migrateCookieToKeychainIfNeeded()
            }
            reload()
        }
    }

    @objc private func reload() {
        Task { @MainActor in
            defer { refresh.endRefreshing() }
            guard NativeAPIClient.hasBearer else {
                notes = LocalNoteCache.loadNotes()
                applyFilter()
                statusBanner.text = notes.isEmpty ? "Inicia sessão para sincronizar o caderno." : "Offline / sem sessão — cache local."
                signInButton.isHidden = false
                emptyLabel.text = notes.isEmpty ? "Nenhuma nota ainda.\nEntra para ver o teu caderno." : nil
                emptyLabel.isHidden = !notes.isEmpty
                // Fresh install / no session: present native sign-in once.
                if notes.isEmpty, presentedViewController == nil {
                    showSignIn(auto: true)
                }
                return
            }
            signInButton.isHidden = true
            do {
                async let remoteNotes = NativeAPIClient.listNotes()
                async let remoteSpeakers = NativeAPIClient.listSpeakers()
                notes = try await remoteNotes
                speakers = try await remoteSpeakers
                statusBanner.text = "\(notes.count) notas · sincronizado"
                applyFilter()
            } catch NativeAPIClient.APIError.unauthorized {
                statusBanner.text = "Sessão expirada."
                signInButton.isHidden = false
                notes = LocalNoteCache.loadNotes()
                applyFilter()
            } catch {
                notes = LocalNoteCache.loadNotes()
                statusBanner.text = "Sem rede — a mostrar cache. \(error.localizedDescription)"
                applyFilter()
            }
        }
    }

    private func applyFilter() {
        let q = (search.searchBar.text ?? "").trimmingCharacters(in: .whitespacesAndNewlines).lowercased()
        if q.isEmpty {
            filtered = notes
        } else {
            filtered = notes.filter { note in
                if note.title.lowercased().contains(q) { return true }
                if note.tags.contains(where: { $0.lowercased().contains(q) }) { return true }
                if note.happenedAt.contains(q) { return true }
                if note.preview.lowercased().contains(q) { return true }
                return false
            }
        }
        if filtered.isEmpty {
            if !NativeAPIClient.hasBearer && notes.isEmpty {
                emptyLabel.text = "Nenhuma nota ainda.\nEntra para ver o teu caderno."
                emptyLabel.isHidden = false
            } else if NativeAPIClient.hasBearer || !notes.isEmpty {
                emptyLabel.text = q.isEmpty ? "Nenhuma nota ainda." : "Nenhum resultado."
                emptyLabel.isHidden = false
            }
        } else {
            emptyLabel.isHidden = true
        }
        tableView.reloadData()
    }

    func updateSearchResults(for searchController: UISearchController) {
        applyFilter()
    }

    func tableView(_ tableView: UITableView, numberOfRowsInSection section: Int) -> Int {
        filtered.count
    }

    func tableView(_ tableView: UITableView, cellForRowAt indexPath: IndexPath) -> UITableViewCell {
        let cell = tableView.dequeueReusableCell(withIdentifier: SubtitleNoteCell.reuseId, for: indexPath) as! SubtitleNoteCell
        let note = filtered[indexPath.row]
        let title = note.title.trimmingCharacters(in: .whitespacesAndNewlines).isEmpty ? "Reunião" : note.title
        cell.configure(title: title, subtitle: "\(note.happenedAt) · \(note.preview)", tags: note.tags)
        return cell
    }

    func tableView(_ tableView: UITableView, didSelectRowAt indexPath: IndexPath) {
        tableView.deselectRow(at: indexPath, animated: true)
        let note = filtered[indexPath.row]
        let detail = NoteDetailViewController(noteId: note.id, initial: note)
        navigationController?.pushViewController(detail, animated: true)
    }

    func tableView(
        _ tableView: UITableView,
        trailingSwipeActionsConfigurationForRowAt indexPath: IndexPath
    ) -> UISwipeActionsConfiguration? {
        let note = filtered[indexPath.row]
        let delete = UIContextualAction(style: .destructive, title: "Apagar") { [weak self] _, _, done in
            self?.confirmDelete(note) { done($0) }
        }
        delete.image = UIImage(systemName: "trash")
        return UISwipeActionsConfiguration(actions: [delete])
    }

    func tableView(
        _ tableView: UITableView,
        leadingSwipeActionsConfigurationForRowAt indexPath: IndexPath
    ) -> UISwipeActionsConfiguration? {
        let note = filtered[indexPath.row]
        let share = UIContextualAction(style: .normal, title: "Partilhar") { [weak self] _, view, done in
            self?.share(note, from: view)
            done(true)
        }
        share.image = UIImage(systemName: "square.and.arrow.up")
        share.backgroundColor = .systemBlue
        return UISwipeActionsConfiguration(actions: [share])
    }

    private func confirmDelete(_ note: NativeAPIClient.NoteDocument, completion: @escaping (Bool) -> Void) {
        let alert = UIAlertController(title: nil, message: "Apagar esta nota?", preferredStyle: .actionSheet)
        alert.addAction(UIAlertAction(title: "Cancelar", style: .cancel) { _ in completion(false) })
        alert.addAction(UIAlertAction(title: "Apagar nota", style: .destructive) { [weak self] _ in
            Task { @MainActor in
                do {
                    if NativeAPIClient.hasBearer {
                        try await NativeAPIClient.deleteNote(id: note.id)
                    } else {
                        LocalNoteCache.removeNote(id: note.id)
                    }
                    self?.notes.removeAll { $0.id == note.id }
                    self?.applyFilter()
                    completion(true)
                } catch {
                    completion(false)
                    let err = UIAlertController(title: "Erro", message: error.localizedDescription, preferredStyle: .alert)
                    err.addAction(UIAlertAction(title: "OK", style: .default))
                    self?.present(err, animated: true)
                }
            }
        })
        if let pop = alert.popoverPresentationController {
            pop.sourceView = tableView
            pop.sourceRect = tableView.bounds
        }
        present(alert, animated: true)
    }

    private func share(_ note: NativeAPIClient.NoteDocument, from source: UIView) {
        let title = note.title.trimmingCharacters(in: .whitespacesAndNewlines).isEmpty ? "Reunião" : note.title
        let text = note.preview
        let url = NativeAPIClient.baseURL.appendingPathComponent("n/\(note.id)")
        let vc = UIActivityViewController(activityItems: [title, text, url], applicationActivities: nil)
        if let pop = vc.popoverPresentationController {
            pop.sourceView = source
            pop.sourceRect = source.bounds
        }
        present(vc, animated: true)
    }

    @objc private func composeNote() {
        Task { @MainActor in
            guard NativeAPIClient.hasBearer else {
                showSignIn(auto: false)
                return
            }
            do {
                let created = try await NativeAPIClient.upsertNote(NativeAPIClient.emptyNote())
                notes.insert(created, at: 0)
                applyFilter()
                let detail = NoteDetailViewController(noteId: created.id, initial: created)
                navigationController?.pushViewController(detail, animated: true)
            } catch {
                let err = UIAlertController(title: "Não foi possível criar", message: error.localizedDescription, preferredStyle: .alert)
                err.addAction(UIAlertAction(title: "OK", style: .default))
                present(err, animated: true)
            }
        }
    }

    @objc private func moreMenu() {
        let sheet = UIAlertController(title: nil, message: nil, preferredStyle: .actionSheet)
        sheet.addAction(UIAlertAction(title: "Atualizar", style: .default) { [weak self] _ in self?.reload() })
        sheet.addAction(UIAlertAction(title: "Speakers…", style: .default) { [weak self] _ in
            let picker = SpeakerPickerViewController(mode: .manage, onManaged: { [weak self] in
                self?.reload()
            })
            let nav = UINavigationController(rootViewController: picker)
            self?.present(nav, animated: true)
        })
        if NativeAPIClient.hasBearer {
            sheet.addAction(UIAlertAction(title: "Terminar sessão", style: .destructive) { [weak self] _ in
                Task { @MainActor in
                    await NativeLoginService.shared.signOut()
                    self?.notes = LocalNoteCache.loadNotes()
                    self?.applyFilter()
                    self?.showSignIn(auto: false)
                }
            })
        } else {
            sheet.addAction(UIAlertAction(title: "Entrar", style: .default) { [weak self] _ in
                self?.showSignIn(auto: false)
            })
        }
        // Hidden fallback — not the primary path.
        sheet.addAction(UIAlertAction(title: "Site clássico (Capacitor)", style: .default) { _ in
            NativeShellMode.setCurrent(.capacitorSite)
            AppRoot.applyToKeyWindow()
        })
        sheet.addAction(UIAlertAction(title: "Cancelar", style: .cancel))
        if let pop = sheet.popoverPresentationController {
            pop.barButtonItem = navigationItem.rightBarButtonItems?.last
        }
        present(sheet, animated: true)
    }

    /// Button / selector entry — must not overload `showSignIn(auto:)` (Swift `#selector` ambiguity).
    @objc private func presentSignInTapped() {
        showSignIn(auto: false)
    }

    private var didAutoPresentSignIn = false

    private func showSignIn(auto: Bool) {
        if auto {
            if didAutoPresentSignIn { return }
            didAutoPresentSignIn = true
        }
        if presentedViewController is UINavigationController,
           (presentedViewController as? UINavigationController)?.viewControllers.first is NativeSignInViewController
        {
            return
        }
        let signIn = NativeSignInViewController()
        signIn.onSignedIn = { [weak self] in
            NotificationCenter.default.post(name: .nativeSessionDidChange, object: nil)
            self?.reload()
        }
        let nav = UINavigationController(rootViewController: signIn)
        nav.modalPresentationStyle = .fullScreen
        present(nav, animated: true)
    }
}

private final class SubtitleNoteCell: UITableViewCell {
    static let reuseId = "SubtitleNoteCell"

    override init(style: UITableViewCell.CellStyle, reuseIdentifier: String?) {
        super.init(style: .subtitle, reuseIdentifier: reuseIdentifier)
        textLabel?.numberOfLines = 1
        detailTextLabel?.numberOfLines = 2
        detailTextLabel?.textColor = .secondaryLabel
        accessoryType = .disclosureIndicator
    }

    @available(*, unavailable)
    required init?(coder: NSCoder) { fatalError("init(coder:) has not been implemented") }

    func configure(title: String, subtitle: String, tags: [String]) {
        textLabel?.text = title
        let tagSuffix = tags.isEmpty ? "" : "  ·  " + tags.map { "#\($0)" }.joined(separator: " ")
        detailTextLabel?.text = subtitle + tagSuffix
    }
}
