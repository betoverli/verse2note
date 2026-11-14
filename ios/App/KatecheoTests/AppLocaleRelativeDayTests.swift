import XCTest
@testable import Katecheo

final class AppLocaleRelativeDayTests: XCTestCase {
    private var calendar: Calendar {
        var cal = Calendar(identifier: .gregorian)
        cal.timeZone = TimeZone(secondsFromGMT: 0)!
        return cal
    }

    private func date(_ yyyyMMdd: String) -> Date {
        let formatter = DateFormatter()
        formatter.calendar = Calendar(identifier: .gregorian)
        formatter.locale = Locale(identifier: "en_US_POSIX")
        formatter.timeZone = TimeZone(secondsFromGMT: 0)
        formatter.dateFormat = "yyyy-MM-dd"
        return formatter.date(from: yyyyMMdd)!
    }

    func testRelativeNoteDay_todayYesterdayWeekdayAndAbsolute() {
        let now = date("2026-11-14") // Saturday
        let pt = Locale(identifier: "pt_BR")
        let en = Locale(identifier: "en_US")
        let es = Locale(identifier: "es_ES")

        XCTAssertEqual(
            AppLocale.relativeNoteDay(from: now, now: now, calendar: calendar, locale: pt),
            String(localized: "Hoje")
        )
        XCTAssertEqual(
            AppLocale.relativeNoteDay(from: date("2026-11-13"), now: now, calendar: calendar, locale: en),
            String(localized: "Ontem")
        )

        let weekdayPt = AppLocale.relativeNoteDay(
            from: date("2026-11-11"), // Wednesday
            now: now,
            calendar: calendar,
            locale: pt
        )
        XCTAssertFalse(weekdayPt.contains("2026"), weekdayPt)
        XCTAssertTrue(weekdayPt.lowercased().contains("quart"), weekdayPt)

        let weekdayEn = AppLocale.relativeNoteDay(
            from: date("2026-11-11"),
            now: now,
            calendar: calendar,
            locale: en
        )
        XCTAssertTrue(weekdayEn.lowercased().contains("wednesday"), weekdayEn)

        let weekdayEs = AppLocale.relativeNoteDay(
            from: date("2026-11-11"),
            now: now,
            calendar: calendar,
            locale: es
        )
        XCTAssertTrue(weekdayEs.lowercased().contains("miércoles") || weekdayEs.lowercased().contains("miercoles"), weekdayEs)

        let sameYear = AppLocale.relativeNoteDay(
            from: date("2026-03-09"),
            now: now,
            calendar: calendar,
            locale: en
        )
        XCTAssertFalse(sameYear.contains("2026"), sameYear)
        XCTAssertTrue(sameYear.contains("9") || sameYear.contains("09"), sameYear)

        let older = AppLocale.relativeNoteDay(
            from: date("2025-10-29"),
            now: now,
            calendar: calendar,
            locale: pt
        )
        XCTAssertTrue(older.contains("2025"), older)
        XCTAssertTrue(older.contains("29"), older)
    }

    func testRelativeNoteDay_parsesStorageString() {
        let label = AppLocale.relativeNoteDay("2026-11-14", now: date("2026-11-14"), calendar: calendar)
        XCTAssertEqual(label, String(localized: "Hoje"))
    }

    func testRelativeNoteDay_storageDayIsCivilNotGMTInstant() {
        // "2026-11-14" must mean Nov 14 in the local calendar even west of GMT.
        var west = Calendar(identifier: .gregorian)
        west.timeZone = TimeZone(secondsFromGMT: -8 * 3600)!
        let now = west.date(from: DateComponents(year: 2026, month: 11, day: 14, hour: 15))!
        let label = AppLocale.relativeNoteDay("2026-11-14", now: now, calendar: west, locale: Locale(identifier: "en_US"))
        XCTAssertEqual(label, String(localized: "Hoje"))
    }
}
