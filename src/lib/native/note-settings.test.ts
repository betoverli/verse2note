import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { readFileSync } from "node:fs";
import { noteSettingsShouldOpenWeb, runNativeNoteSettings } from "./note-settings.ts";

const emptyNote = {
  id: "n1",
  title: "",
  happenedAt: "2026-01-01",
  tags: [] as string[],
  speakerId: null as string | null,
  blocks: [],
  updatedAt: new Date().toISOString(),
};

describe("runNativeNoteSettings", () => {
  it("always returns web-fallback so the iOS tap opens the ViewportSheet", async () => {
    const action = await runNativeNoteSettings({ locale: "pt", note: emptyNote as never });
    assert.equal(action.type, "web-fallback");
    assert.equal(noteSettingsShouldOpenWeb(action), true);
  });

  it("never returns cancelled for the entry tap (that was the TF88 silent no-op)", async () => {
    const action = await runNativeNoteSettings({ locale: "en", note: emptyNote as never });
    assert.notEqual(action.type, "cancelled");
  });
});

describe("note settings call site", () => {
  const editor = readFileSync(new URL("../../components/notebook-editor.tsx", import.meta.url), "utf8");

  it("opens the web meta sheet on Settings from the … menu (no NativeMenus.present)", () => {
    assert.match(editor, /NOTE_MORE_SETTINGS/);
    assert.match(editor, /openNoteSettings/);
    assert.match(editor, /setMetaSheet\(true\)/);
    assert.doesNotMatch(editor, /openNativeNoteSettings/);
    assert.doesNotMatch(editor, /presentNativeMenu/);
    // Cancelled must not be a silent return — tap still opens web.
    assert.match(editor, /action\.type === "web-fallback" \|\| action\.type === "cancelled"/);
  });

  it("catches errors and still opens the web settings sheet", () => {
    assert.match(editor, /openNoteSettings failed — web sheet/);
    assert.match(editor, /catch \(error\)[\s\S]*setMetaSheet\(true\)/);
  });
});
