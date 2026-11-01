import Foundation

/// Minimal URLSession client for `/api/native/v1` using the Keychain bearer.
enum NativeAPIClient {
    static var baseURL: URL {
        if let raw = Bundle.main.object(forInfoDictionaryKey: "Verse2NoteAPIBase") as? String,
           let url = URL(string: raw), !raw.isEmpty
        {
            return url
        }
        return URL(string: "https://verse2note.com")!
    }

    struct NotesResponse: Decodable {
        let ok: Bool?
        let notes: [NoteDTO]?
        let error: String?
    }

    struct NoteDTO: Decodable {
        let id: String
        let title: String?
    }

    static func getNotes() async throws -> (status: Int, body: Data) {
        guard let token = KeychainStore.bearerToken(), !token.isEmpty else {
            throw URLError(.userAuthenticationRequired)
        }
        var request = URLRequest(url: baseURL.appendingPathComponent("api/native/v1/notes"))
        request.httpMethod = "GET"
        request.setValue("Bearer \(token)", forHTTPHeaderField: "Authorization")
        request.setValue("application/json", forHTTPHeaderField: "Accept")
        let (data, response) = try await URLSession.shared.data(for: request)
        let status = (response as? HTTPURLResponse)?.statusCode ?? 0
        return (status, data)
    }

    static func parseNotesCount(_ data: Data) -> Int? {
        guard let decoded = try? JSONDecoder().decode(NotesResponse.self, from: data) else { return nil }
        return decoded.notes?.count
    }
}
