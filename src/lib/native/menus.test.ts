import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { readFileSync } from "node:fs";
import { rectFromElement, rectFromPoint } from "./menus.ts";

describe("rectFromElement", () => {
  it("falls back to a centered 44pt target without an element", () => {
    const rect = rectFromElement(null);
    assert.equal(rect.width, 44);
    assert.equal(rect.height, 44);
  });

  it("reads getBoundingClientRect when present", () => {
    const el = {
      getBoundingClientRect() {
        return { left: 10, top: 20, width: 100, height: 40 };
      },
    };
    assert.deepEqual(rectFromElement(el as Element), { x: 10, y: 20, width: 100, height: 40 });
  });
});

describe("rectFromPoint", () => {
  it("centers a hit target on the point", () => {
    assert.deepEqual(rectFromPoint(100, 200, 40), { x: 80, y: 180, width: 40, height: 40 });
  });
});

describe("native menus wiring", () => {
  const shell = readFileSync(new URL("../../../ios/App/App/NativeShell.swift", import.meta.url), "utf8");
  const plugin = readFileSync(new URL("../../../ios/App/App/NativeMenus.swift", import.meta.url), "utf8");
  const storyboard = readFileSync(new URL("../../../ios/App/App/Base.lproj/Main.storyboard", import.meta.url), "utf8");
  const pbx = readFileSync(new URL("../../../ios/App/App.xcodeproj/project.pbxproj", import.meta.url), "utf8");
  const wrapper = readFileSync(new URL("./menus.ts", import.meta.url), "utf8");
  const notebook = readFileSync(new URL("../../components/notebook-editor.tsx", import.meta.url), "utf8");
  const sheet = readFileSync(new URL("../../components/viewport-sheet.tsx", import.meta.url), "utf8");

  it("registers NativeMenus next to LiquidChrome and NativeAuth", () => {
    assert.match(shell, /registerPluginInstance\(NativeMenusPlugin\(\)\)/);
    assert.match(plugin, /jsName = "NativeMenus"/);
    assert.match(plugin, /UIMenu/);
    assert.match(plugin, /UIAlertController/);
    assert.match(pbx, /NativeMenus\.swift in Sources/);
  });

  it("points Main.storyboard at Verse2NoteBridgeViewController", () => {
    assert.match(storyboard, /customClass="Verse2NoteBridgeViewController"/);
    assert.doesNotMatch(storyboard, /customClass="CAPBridgeViewController"/);
  });

  it("presents UIMenu via performPrimaryAction with action-sheet fallback", () => {
    assert.match(plugin, /performPrimaryAction/);
    assert.match(plugin, /showsMenuAsPrimaryAction = true/);
    assert.match(plugin, /scheduleMenuPresentFallback/);
    assert.doesNotMatch(plugin, /sendActions\(for: \.touchUpInside\)/);
    assert.match(plugin, /failPresent/);
  });

  it("builds JSObject without casting [String: Any]", () => {
    assert.match(plugin, /JSTypes\.coerceDictionaryToJSObject/);
    assert.doesNotMatch(plugin, /as JSObject/);
    assert.match(plugin, /didChooseItem/);
    assert.doesNotMatch(plugin, /private var selected\b/);
  });

  it("TS wrapper marks failures and call sites fall back to web UI", () => {
    assert.match(wrapper, /failed\?:\s*boolean/);
    assert.match(wrapper, /PRESENT_HANG_TIMEOUT_MS/);
    assert.match(wrapper, /failed:\s*true/);
    assert.match(wrapper, /\[NativeMenus\] present failed/);
    assert.match(sheet, /result\.failed/);
    assert.match(sheet, /setMode\("web"\)/);
  });

  it("uses a barely-visible interactive anchor and 400ms alert fallback", () => {
    assert.match(plugin, /alpha = 0\.01/);
    assert.match(plugin, /isUserInteractionEnabled = true/);
    assert.match(plugin, /deadline: \.now\(\) \+ 0\.40/);
    assert.match(plugin, /\[NativeMenus\]/);
  });
});

describe("native FAB compose menu", () => {
  const chrome = readFileSync(new URL("../../../ios/App/App/LiquidChrome.swift", import.meta.url), "utf8");
  const home = readFileSync(new URL("../../components/notebook-home.tsx", import.meta.url), "utf8");
  const bridge = readFileSync(new URL("../../components/native-chrome.tsx", import.meta.url), "utf8");

  it("attaches UIMenu to the Liquid Glass FAB instead of round-tripping", () => {
    assert.match(chrome, /applyFabMenu/);
    assert.match(chrome, /showsMenuAsPrimaryAction = true/);
    assert.match(chrome, /fabMenuSelect/);
    assert.match(bridge, /fabMenuSelect/);
    assert.match(bridge, /fabMenu:/);
  });

  it("offers Nova nota + Importar from the notebook + button", () => {
    assert.match(home, /COMPOSE_IMPORT/);
    assert.match(home, /notebookImport/);
    assert.match(home, /menu:\s*composeMenu/);
    assert.match(home, /ActionSheet/);
  });
});

describe("native note … trailing UIMenu", () => {
  const chrome = readFileSync(new URL("../../../ios/App/App/LiquidChrome.swift", import.meta.url), "utf8");
  const bridge = readFileSync(new URL("../../components/native-chrome.tsx", import.meta.url), "utf8");
  const header = readFileSync(new URL("../../components/app-header.tsx", import.meta.url), "utf8");
  const store = readFileSync(new URL("./chrome-store.ts", import.meta.url), "utf8");
  const note = readFileSync(new URL("../../components/notebook-editor.tsx", import.meta.url), "utf8");
  const css = readFileSync(new URL("../../styles.css", import.meta.url), "utf8");

  it("attaches UIMenu to the Liquid Glass trailing … button like the FAB", () => {
    assert.match(chrome, /applyTrailingMenu/);
    assert.match(chrome, /trailingMenuSelect/);
    assert.match(chrome, /trailingMenu/);
    assert.match(bridge, /trailingMenuSelect/);
    assert.match(bridge, /trailingMenu:/);
    assert.match(store, /trailingMenu\?:/);
    assert.match(header, /trailingMenu/);
    assert.match(header, /onTrailingMenuSelect/);
  });

  it("note editor supplies … items via chrome and keeps a web ActionSheet fallback", () => {
    assert.match(note, /nativeSymbol=\{readOnly \? undefined : "ellipsis"\}/);
    assert.match(note, /trailingMenu=/);
    assert.match(note, /NOTE_MORE_SETTINGS/);
    assert.match(note, /NOTE_MORE_SPEAKERS/);
    assert.match(note, /setMoreSheet\(true\)/);
    assert.doesNotMatch(note, /presentNativeMenu/);
    assert.doesNotMatch(note, /nativeBar=\{false\}/);
  });

  it("collapses note HTML chrome under native-top so the tap hits the native button", () => {
    assert.match(css, /html\.native-ios\.native-top main\.note-screen > \.note-chrome/);
    assert.match(css, /html\.native-ios\.native-top main\.note-screen > \.screen-body/);
  });
});
