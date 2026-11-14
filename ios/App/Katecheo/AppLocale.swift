import Foundation
import UIKit

/// Maps the iPhone / per-app language onto Katecheo API locale codes (`pt` / `en` / `es`).
enum AppLocale {
    /// API / prefs locale derived from `Locale.preferredLanguages` (system or per-app).
    static var apiCode: String {
        let preferred = Locale.preferredLanguages.first?.lowercased() ?? "pt-br"
        if preferred.hasPrefix("en") { return "en" }
        if preferred.hasPrefix("es") { return "es" }
        return "pt"
    }

    /// Human label for the current interface language (localized).
    static var interfaceLanguageLabel: String {
        switch apiCode {
        case "en":
            return String(localized: "English")
        case "es":
            return String(localized: "Español")
        default:
            return String(localized: "Português")
        }
    }

    /// Label for a Bible-reference (`copyLocale`) preference id.
    static func copyLocaleLabel(_ id: String) -> String {
        switch id {
        case "en":
            return String(localized: "English")
        case "es":
            return String(localized: "Español")
        default:
            return String(localized: "Português")
        }
    }

    /// Opens the system Settings page for this app (per-app language lives there).
    static func openSystemSettings() {
        guard let url = URL(string: UIApplication.openSettingsURLString) else { return }
        UIApplication.shared.open(url)
    }

    // MARK: - Locale-aware display formatters (data wire format stays POSIX / ISO)

    /// Parses `yyyy-MM-dd` (storage) and formats for the current locale.
    static func displayDay(_ yyyyMMdd: String) -> String {
        guard let date = dayStorageFormatter.date(from: yyyyMMdd) else { return yyyyMMdd }
        return dayDisplayFormatter.string(from: date)
    }

    /// Relative notebook-row date label (device locale): Hoje / Ontem / weekday /
    /// day+month this year / day+month+year when older.
    static func relativeNoteDay(_ yyyyMMdd: String, now: Date = Date(), calendar: Calendar = .current, locale: Locale = .current) -> String {
        guard let start = calendarDate(fromStorageDay: yyyyMMdd, calendar: calendar) else { return yyyyMMdd }
        return relativeNoteDay(from: start, now: now, calendar: calendar, locale: locale)
    }

    /// Bucketed relative day for a calendar date (unit-testable).
    /// `date` is treated as a civil calendar day in `calendar` (use noon or startOfDay).
    static func relativeNoteDay(from date: Date, now: Date = Date(), calendar: Calendar = .current, locale: Locale = .current) -> String {
        var cal = calendar
        cal.locale = locale
        let start = cal.startOfDay(for: date)
        let today = cal.startOfDay(for: now)
        let dayDelta = cal.dateComponents([.day], from: start, to: today).day ?? 0

        if dayDelta == 0 {
            return String(localized: "Hoje")
        }
        if dayDelta == 1 {
            return String(localized: "Ontem")
        }
        if dayDelta > 1, dayDelta < 7 {
            return capitalizedDisplay(weekdayFormatter(locale: locale).string(from: start), locale: locale)
        }

        let sameYear = cal.component(.year, from: start) == cal.component(.year, from: today)
        let formatter = sameYear ? monthDayFormatter(locale: locale) : fullDateFormatter(locale: locale)
        return capitalizedDisplay(formatter.string(from: start), locale: locale)
    }

    /// Interprets `yyyy-MM-dd` as a civil day in `calendar` (not a GMT instant).
    static func calendarDate(fromStorageDay yyyyMMdd: String, calendar: Calendar = .current) -> Date? {
        guard let utcDate = dayStorageFormatter.date(from: yyyyMMdd) else { return nil }
        var utcCal = Calendar(identifier: .gregorian)
        utcCal.timeZone = TimeZone(secondsFromGMT: 0)!
        let parts = DateComponents(
            year: utcCal.component(.year, from: utcDate),
            month: utcCal.component(.month, from: utcDate),
            day: utcCal.component(.day, from: utcDate)
        )
        return calendar.date(from: parts)
    }

    static func formatCount(_ value: Int) -> String {
        countFormatter.string(from: NSNumber(value: value)) ?? String(value)
    }

    private static func capitalizedDisplay(_ raw: String, locale: Locale) -> String {
        guard let first = raw.first else { return raw }
        return String(first).uppercased(with: locale) + raw.dropFirst()
    }

    private static func weekdayFormatter(locale: Locale) -> DateFormatter {
        let formatter = DateFormatter()
        formatter.calendar = Calendar.current
        formatter.locale = locale
        formatter.setLocalizedDateFormatFromTemplate("EEEE")
        return formatter
    }

    private static func monthDayFormatter(locale: Locale) -> DateFormatter {
        let formatter = DateFormatter()
        formatter.calendar = Calendar.current
        formatter.locale = locale
        formatter.setLocalizedDateFormatFromTemplate("MMMd")
        return formatter
    }

    private static func fullDateFormatter(locale: Locale) -> DateFormatter {
        let formatter = DateFormatter()
        formatter.calendar = Calendar.current
        formatter.locale = locale
        formatter.setLocalizedDateFormatFromTemplate("yMMMd")
        return formatter
    }

    private static let dayStorageFormatter: DateFormatter = {
        let formatter = DateFormatter()
        formatter.calendar = Calendar(identifier: .gregorian)
        formatter.locale = Locale(identifier: "en_US_POSIX")
        formatter.timeZone = TimeZone(secondsFromGMT: 0)
        formatter.dateFormat = "yyyy-MM-dd"
        return formatter
    }()

    private static let dayDisplayFormatter: DateFormatter = {
        let formatter = DateFormatter()
        formatter.calendar = Calendar.current
        formatter.locale = .current
        formatter.setLocalizedDateFormatFromTemplate("yMMMd")
        return formatter
    }()

    private static let countFormatter: NumberFormatter = {
        let formatter = NumberFormatter()
        formatter.locale = .current
        formatter.numberStyle = .decimal
        return formatter
    }()
}
