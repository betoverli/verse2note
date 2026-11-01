import Foundation

/// URLSession client for `/api/native/v1` using the Keychain bearer.
/// Payloads are **NoteDocumentV1** (never HTML).
enum NativeAPIClient {
    static var baseURL: URL {
        if let raw = Bundle.main.object(forInfoDictionaryKey: "Verse2NoteAPIBase") as? String,
           let url = URL(string: raw), !raw.isEmpty
        {
            return url
        }
        return URL(string: "https://verse2note.com")!
    }

    enum APIError: Error, LocalizedError {
        case unauthorized
        case http(Int, String)
        case decoding
        case invalidResponse

        var errorDescription: String? {
            switch self {
            case .unauthorized: return "Sessão necessária."
            case .http(let code, let body): return "HTTP \(code): \(body)"
            case .decoding: return "Resposta inválida."
            case .invalidResponse: return "Sem resposta."
            }
        }
    }

    // MARK: - NoteDocumentV1 (wire)

    struct TextSpan: Codable, Equatable {
        var type: String
        var text: String?
        var marks: [String]?
        var bookId: String?
        var chapter: Int?
        var verseStart: Int?
        var verseEnd: Int?
        var href: String?
    }

    struct LineBlock: Codable, Equatable {
        var id: String
        var type: String
        var spans: [TextSpan]?
        var speakerId: String?
        var title: String?
        var collapsed: Bool?
        var blocks: [LineBlock]?
    }

    struct NoteBody: Codable, Equatable {
        var blocks: [LineBlock]
    }

    struct NoteDocument: Codable, Equatable {
        var schemaVersion: Int
        var id: String
        var title: String
        var happenedAt: String
        var tags: [String]
        var noteSpeakerId: String?
        var visibility: String
        var updatedAt: String
        var body: NoteBody

        var preview: String {
            var parts: [String] = []
            for block in body.blocks {
                if block.type == "speakerSection" {
                    for child in block.blocks ?? [] {
                        parts.append(spanText(child.spans))
                    }
                } else {
                    parts.append(spanText(block.spans))
                }
                if parts.joined().count > 160 { break }
            }
            let text = parts.joined(separator: " ").trimmingCharacters(in: .whitespacesAndNewlines)
            return text.isEmpty ? "Sem texto" : text
        }

        private func spanText(_ spans: [TextSpan]?) -> String {
            (spans ?? []).map { span in
                if span.type == "bibleRef" {
                    let book = span.bookId ?? "?"
                    let ch = span.chapter.map(String.init) ?? "?"
                    if let v = span.verseStart { return "\(book) \(ch):\(v)" }
                    return "\(book) \(ch)"
                }
                return span.text ?? ""
            }.joined()
        }
    }

    struct SpeakerDTO: Codable, Equatable {
        var id: String
        var name: String
        var color: String
        var updatedAt: String
    }

    struct NotesResponse: Decodable {
        let ok: Bool?
        let notes: [NoteDocument]?
        let error: String?
    }

    struct NoteResponse: Decodable {
        let ok: Bool?
        let note: NoteDocument?
        let speakers: [SpeakerDTO]?
        let error: String?
    }

    struct SpeakersResponse: Decodable {
        let ok: Bool?
        let speakers: [SpeakerDTO]?
        let error: String?
    }

    struct SessionResponse: Decodable {
        let ok: Bool?
        let user: SessionUser?
        let error: String?
    }

    struct SessionUser: Decodable {
        let id: String
        let email: String?
    }

    // MARK: - Requests

    private static func authorizedRequest(path: String, method: String, body: Data? = nil) throws -> URLRequest {
        guard let token = KeychainStore.bearerToken(), !token.isEmpty else {
            throw APIError.unauthorized
        }
        var url = baseURL
        for part in path.split(separator: "/") {
            url = url.appendingPathComponent(String(part))
        }
        var request = URLRequest(url: url)
        request.httpMethod = method
        request.setValue("Bearer \(token)", forHTTPHeaderField: "Authorization")
        request.setValue("application/json", forHTTPHeaderField: "Accept")
        if let body {
            request.httpBody = body
            request.setValue("application/json; charset=utf-8", forHTTPHeaderField: "Content-Type")
        }
        return request
    }

    private static func perform(_ request: URLRequest) async throws -> (Int, Data) {
        let (data, response) = try await URLSession.shared.data(for: request)
        let status = (response as? HTTPURLResponse)?.statusCode ?? 0
        return (status, data)
    }

    static var hasBearer: Bool {
        !(KeychainStore.bearerToken() ?? "").isEmpty
    }

    static func getSession() async throws -> SessionUser {
        let request = try authorizedRequest(path: "api/native/v1/session", method: "GET")
        let (status, data) = try await perform(request)
        if status == 401 { throw APIError.unauthorized }
        guard status >= 200, status < 300 else {
            throw APIError.http(status, String(data: data, encoding: .utf8) ?? "")
        }
        guard let decoded = try? JSONDecoder().decode(SessionResponse.self, from: data),
              let user = decoded.user
        else { throw APIError.decoding }
        return user
    }

    static func listNotes() async throws -> [NoteDocument] {
        let request = try authorizedRequest(path: "api/native/v1/notes", method: "GET")
        let (status, data) = try await perform(request)
        if status == 401 { throw APIError.unauthorized }
        guard status >= 200, status < 300 else {
            throw APIError.http(status, String(data: data, encoding: .utf8) ?? "")
        }
        guard let decoded = try? JSONDecoder().decode(NotesResponse.self, from: data),
              let notes = decoded.notes
        else { throw APIError.decoding }
        LocalNoteCache.saveNotes(notes)
        return notes
    }

    static func getNote(id: String) async throws -> (note: NoteDocument, speakers: [SpeakerDTO]) {
        let request = try authorizedRequest(path: "api/native/v1/notes/\(id)", method: "GET")
        let (status, data) = try await perform(request)
        if status == 401 { throw APIError.unauthorized }
        guard status >= 200, status < 300 else {
            throw APIError.http(status, String(data: data, encoding: .utf8) ?? "")
        }
        guard let decoded = try? JSONDecoder().decode(NoteResponse.self, from: data),
              let note = decoded.note
        else { throw APIError.decoding }
        LocalNoteCache.upsertNote(note)
        return (note, decoded.speakers ?? [])
    }

    static func upsertNote(_ note: NoteDocument) async throws -> NoteDocument {
        var payload = note
        payload.schemaVersion = 1
        payload.updatedAt = ISO8601DateFormatter().string(from: Date())
        let body = try JSONEncoder().encode(payload)
        let request = try authorizedRequest(path: "api/native/v1/notes", method: "POST", body: body)
        let (status, data) = try await perform(request)
        if status == 401 { throw APIError.unauthorized }
        guard status >= 200, status < 300 else {
            throw APIError.http(status, String(data: data, encoding: .utf8) ?? "")
        }
        guard let decoded = try? JSONDecoder().decode(NoteResponse.self, from: data),
              let saved = decoded.note
        else { throw APIError.decoding }
        LocalNoteCache.upsertNote(saved)
        return saved
    }

    static func deleteNote(id: String) async throws {
        let request = try authorizedRequest(path: "api/native/v1/notes/\(id)", method: "DELETE")
        let (status, data) = try await perform(request)
        if status == 401 { throw APIError.unauthorized }
        guard status >= 200, status < 300 else {
            throw APIError.http(status, String(data: data, encoding: .utf8) ?? "")
        }
        LocalNoteCache.removeNote(id: id)
    }

    static func listSpeakers() async throws -> [SpeakerDTO] {
        let request = try authorizedRequest(path: "api/native/v1/speakers", method: "GET")
        let (status, data) = try await perform(request)
        if status == 401 { throw APIError.unauthorized }
        guard status >= 200, status < 300 else {
            throw APIError.http(status, String(data: data, encoding: .utf8) ?? "")
        }
        guard let decoded = try? JSONDecoder().decode(SpeakersResponse.self, from: data),
              let speakers = decoded.speakers
        else { throw APIError.decoding }
        LocalNoteCache.saveSpeakers(speakers)
        return speakers
    }

    static func upsertSpeaker(_ speaker: SpeakerDTO) async throws {
        let body = try JSONEncoder().encode(speaker)
        let request = try authorizedRequest(path: "api/native/v1/speakers", method: "POST", body: body)
        let (status, data) = try await perform(request)
        if status == 401 { throw APIError.unauthorized }
        guard status >= 200, status < 300 else {
            throw APIError.http(status, String(data: data, encoding: .utf8) ?? "")
        }
    }

    static func deleteSpeaker(id: String) async throws {
        let request = try authorizedRequest(path: "api/native/v1/speakers/\(id)", method: "DELETE")
        let (status, data) = try await perform(request)
        if status == 401 { throw APIError.unauthorized }
        guard status >= 200, status < 300 else {
            throw APIError.http(status, String(data: data, encoding: .utf8) ?? "")
        }
    }

    static func emptyNote(id: String = UUID().uuidString.replacingOccurrences(of: "-", with: "")) -> NoteDocument {
        let day = ISO8601DateFormatter()
        day.formatOptions = [.withFullDate]
        let now = ISO8601DateFormatter().string(from: Date())
        return NoteDocument(
            schemaVersion: 1,
            id: id,
            title: "",
            happenedAt: day.string(from: Date()),
            tags: [],
            noteSpeakerId: nil,
            visibility: "private",
            updatedAt: now,
            body: NoteBody(blocks: [
                LineBlock(id: UUID().uuidString.replacingOccurrences(of: "-", with: ""), type: "paragraph", spans: [], speakerId: nil, title: nil, collapsed: nil, blocks: nil),
            ])
        )
    }

    // Phase 0 smoke helpers
    static func getNotes() async throws -> (status: Int, body: Data) {
        let request = try authorizedRequest(path: "api/native/v1/notes", method: "GET")
        return try await perform(request)
    }

    static func parseNotesCount(_ data: Data) -> Int? {
        guard let decoded = try? JSONDecoder().decode(NotesResponse.self, from: data) else { return nil }
        return decoded.notes?.count
    }
}
