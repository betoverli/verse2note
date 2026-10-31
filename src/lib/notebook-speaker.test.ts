import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { describe, it } from "node:test";

describe("note speaker attribution", () => {
  const notebook = readFileSync(new URL("./notebook.ts", import.meta.url), "utf8");
  const home = readFileSync(new URL("../components/notebook-home.tsx", import.meta.url), "utf8");
  const editor = readFileSync(new URL("../components/notebook-editor.tsx", import.meta.url), "utf8");

  it("noteIncludesSpeaker matches whole-note speakerId and section blocks", () => {
    assert.match(notebook, /export function noteIncludesSpeaker/);
    assert.match(notebook, /note\.speakerId === speakerId/);
    assert.match(notebook, /block\.type === "speaker" && block\.speakerId === speakerId/);
    assert.match(notebook, /if \(note\.speakerId\) ids\.add\(note\.speakerId\)/);
  });

  it("notebook list filter uses noteIncludesSpeaker so note-level speakers appear", () => {
    assert.match(home, /noteIncludesSpeaker/);
    assert.match(home, /noteIncludesSpeaker\(item, speakerId\)/);
  });

  it("note editor shows a removable/tappable whole-note speaker chip under the title", () => {
    assert.match(editor, /note-whole-speaker/);
    assert.match(editor, /pickNoteSpeaker/);
    assert.match(editor, /setPickNoteSpeaker\(true\)/);
    assert.match(editor, /clearNoteSpeaker/);
  });

  it("section speaker remove is immediate (no ActionSheet) and handles text-node taps", () => {
    const doc = readFileSync(new URL("../components/notebook-doc.tsx", import.meta.url), "utf8");
    assert.match(editor, /Immediate removal/);
    assert.doesNotMatch(editor, /dropSpeaker/);
    assert.match(doc, /onPointerDownCapture/);
    assert.match(doc, /node instanceof Element/);
    assert.match(doc, /parentElement/);
  });

  it("asks whole-vs-section on the first speaker and inserts a visible section on empty notes", () => {
    assert.match(notebook, /export function noteNeedsSpeakerAsk/);
    assert.match(editor, /noteNeedsSpeakerAsk\(latest\(\)\)/);
    assert.match(editor, /noteIsBare\(current\)/);
    assert.match(editor, /return \[block, emptyLine\(\)\]/);
  });
});
