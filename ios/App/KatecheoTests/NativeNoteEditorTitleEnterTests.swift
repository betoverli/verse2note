import XCTest
@testable import Katecheo

@MainActor
final class NativeNoteEditorTitleEnterTests: XCTestCase {
    private var editor: NativeNoteEditorView!

    override func setUp() async throws {
        try await super.setUp()
        editor = NativeNoteEditorView(frame: CGRect(x: 0, y: 0, width: 390, height: 720))
        editor.testing_prepare(size: CGSize(width: 390, height: 720))
    }

    override func tearDown() async throws {
        editor = nil
        try await super.tearDown()
    }

    private func blankNote(title: String) -> NativeAPIClient.NoteDocument {
        var note = NativeAPIClient.emptyNote(id: "note-title-enter")
        note.title = title
        note.body.blocks = [
            NativeAPIClient.LineBlock(
                id: "p1",
                type: "paragraph",
                spans: [],
                speakerId: nil,
                title: nil,
                collapsed: nil,
                checked: nil,
                blocks: nil
            ),
        ]
        return note
    }

    func testEnterInMiddleOfTitle_movesToBodyWithoutDemotingTitleText() {
        editor.pushNote(blankNote(title: "Hello World"), speakers: [])
        // Caret after "Hello" (ZWSP may exist; find the space).
        let storage = editor.testing_textStorage().string as NSString
        let space = storage.range(of: " ")
        XCTAssertNotEqual(space.location, NSNotFound)
        editor.testing_setSelectedRange(NSRange(location: space.location, length: 0))
        editor.testing_insertText("\n")

        let doc = NoteDocumentCodec.document(
            from: editor.testing_textStorage(),
            base: blankNote(title: "Hello World")
        )
        XCTAssertEqual(doc.title, "Hello World", "title text must stay intact")
        let titlePara = (editor.testing_textStorage().string as NSString)
            .paragraphRange(for: NSRange(location: 0, length: 0))
        XCTAssertGreaterThanOrEqual(editor.testing_selectedRange().location, NSMaxRange(titlePara))
        let titleAttrs = editor.testing_textStorage().attributes(at: 0, effectiveRange: nil)
        XCTAssertEqual(titleAttrs[NoteDocumentCodec.blockIdKey] as? String, "title")
        XCTAssertEqual(titleAttrs[NoteDocumentCodec.blockTypeKey] as? String, "heading")
    }

    func testEnterAtStartOfTitle_movesToBodyAndKeepsTitleParagraph() {
        editor.pushNote(blankNote(title: "Culto"), speakers: [])
        editor.testing_setSelectedRange(NSRange(location: 0, length: 0))
        editor.testing_insertText("\n")

        let doc = NoteDocumentCodec.document(
            from: editor.testing_textStorage(),
            base: blankNote(title: "Culto")
        )
        XCTAssertEqual(doc.title, "Culto")
        let titlePara = (editor.testing_textStorage().string as NSString)
            .paragraphRange(for: NSRange(location: 0, length: 0))
        XCTAssertGreaterThanOrEqual(editor.testing_selectedRange().location, NSMaxRange(titlePara))
    }

    func testPlaceholders_alignWithTextContentLeading() {
        editor.pushNote(blankNote(title: ""), speakers: [])
        editor.layoutIfNeeded()
        let leading = editor.testing_textContentLeading()
        let titleFrame = editor.testing_titlePlaceholderFrame()
        let bodyFrame = editor.testing_bodyPlaceholderFrame()
        let tagsFrame = editor.testing_tagsStripFrame()

        XCTAssertEqual(titleFrame.minX, leading, accuracy: 0.5)
        XCTAssertEqual(bodyFrame.minX, leading, accuracy: 0.5)
        XCTAssertEqual(tagsFrame.minX, leading, accuracy: 0.5)
        XCTAssertGreaterThan(bodyFrame.minY, titleFrame.maxY)
    }
}
