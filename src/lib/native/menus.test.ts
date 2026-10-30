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
  const pbx = readFileSync(new URL("../../../ios/App/App.xcodeproj/project.pbxproj", import.meta.url), "utf8");

  it("registers NativeMenus next to LiquidChrome and NativeAuth", () => {
    assert.match(shell, /registerPluginInstance\(NativeMenusPlugin\(\)\)/);
    assert.match(plugin, /jsName = "NativeMenus"/);
    assert.match(plugin, /UIMenu/);
    assert.match(plugin, /UIAlertController/);
    assert.match(pbx, /NativeMenus\.swift in Sources/);
  });

  it("builds JSObject without casting [String: Any]", () => {
    assert.match(plugin, /JSTypes\.coerceDictionaryToJSObject/);
    assert.doesNotMatch(plugin, /as JSObject/);
    assert.match(plugin, /didChooseItem/);
    assert.doesNotMatch(plugin, /private var selected\b/);
  });
});
