import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { describe, it } from "node:test";

const root = new URL("../../../", import.meta.url);

function read(rel: string) {
  return readFileSync(new URL(rel, root), "utf8");
}

describe("Phase 1 native notebook shell", () => {
  it("defaults NativeShellMode to hybrid", () => {
    const mode = read("ios/App/App/NativeShellMode.swift");
    assert.match(mode, /return \.hybrid/);
    assert.match(mode, /case hybrid/);
    assert.match(mode, /case capacitorSite/);
  });

  it("SceneDelegate roots through AppRoot (not Cap-only)", () => {
    const scene = read("ios/App/App/SceneDelegate.swift");
    assert.match(scene, /AppRoot\.makeRootViewController/);
    assert.match(scene, /NativeShellMode\.didChangeNotification/);
  });

  it("ships native list + note chrome + miolo bridge files", () => {
    for (const file of [
      "ios/App/App/NotebookListViewController.swift",
      "ios/App/App/NoteDetailViewController.swift",
      "ios/App/App/NoteSettingsViewController.swift",
      "ios/App/App/SpeakerPickerViewController.swift",
      "ios/App/App/NativeRootTabBarController.swift",
      "ios/App/App/LocalNoteCache.swift",
    ]) {
      const body = read(file);
      assert.ok(body.length > 100, file);
    }
    const list = read("ios/App/App/NotebookListViewController.swift");
    assert.match(list, /trailingSwipeActionsConfigurationForRowAt/);
    assert.match(list, /leadingSwipeActionsConfigurationForRowAt/);
    assert.match(list, /UISearchResultsUpdating/);
    assert.match(list, /UIActivityViewController/);
    assert.match(list, /Site clássico/);
    const detail = read("ios/App/App/NoteDetailViewController.swift");
    assert.match(detail, /WKScriptMessageHandler/);
    assert.match(detail, /native-editor/);
    assert.match(detail, /NoteDocument/);
  });

  it("keeps Capacitor fallback reachable without making it default", () => {
    const rootTab = read("ios/App/App/ComingSoonTabViewController.swift");
    assert.match(rootTab, /capacitorSite/);
    const mode = read("ios/App/App/NativeShellMode.swift");
    assert.doesNotMatch(mode, /return \.capacitorSite/);
  });

  it("Xcode project includes Phase 1 sources", () => {
    const project = read("ios/App/App.xcodeproj/project.pbxproj");
    for (const name of [
      "NotebookListViewController.swift in Sources",
      "NoteDetailViewController.swift in Sources",
      "AppRoot.swift in Sources",
      "NativeRootTabBarController.swift in Sources",
    ]) {
      assert.match(project, new RegExp(name.replace(/\./g, "\\.")));
    }
  });
});
