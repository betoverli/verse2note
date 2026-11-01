import Foundation
import Security

/// Small Keychain helper for the Better Auth bearer used by `/api/native/v1`.
enum KeychainStore {
    static let bearerService = "com.verse2note.app.auth"
    static let bearerAccount = "bearer-token"

    @discardableResult
    static func setBearerToken(_ token: String?) -> Bool {
        deleteBearerToken()
        guard let token, !token.isEmpty, let data = token.data(using: .utf8) else {
            return token == nil || token?.isEmpty == true
        }
        let query: [String: Any] = [
            kSecClass as String: kSecClassGenericPassword,
            kSecAttrService as String: bearerService,
            kSecAttrAccount as String: bearerAccount,
            kSecValueData as String: data,
            kSecAttrAccessible as String: kSecAttrAccessibleAfterFirstUnlockThisDeviceOnly,
        ]
        let status = SecItemAdd(query as CFDictionary, nil)
        return status == errSecSuccess
    }

    static func bearerToken() -> String? {
        let query: [String: Any] = [
            kSecClass as String: kSecClassGenericPassword,
            kSecAttrService as String: bearerService,
            kSecAttrAccount as String: bearerAccount,
            kSecReturnData as String: true,
            kSecMatchLimit as String: kSecMatchLimitOne,
        ]
        var item: CFTypeRef?
        let status = SecItemCopyMatching(query as CFDictionary, &item)
        guard status == errSecSuccess, let data = item as? Data else { return nil }
        return String(data: data, encoding: .utf8)
    }

    @discardableResult
    static func deleteBearerToken() -> Bool {
        let query: [String: Any] = [
            kSecClass as String: kSecClassGenericPassword,
            kSecAttrService as String: bearerService,
            kSecAttrAccount as String: bearerAccount,
        ]
        let status = SecItemDelete(query as CFDictionary)
        return status == errSecSuccess || status == errSecItemNotFound
    }
}
