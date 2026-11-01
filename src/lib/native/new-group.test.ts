import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { readFileSync } from "node:fs";
import { newGroupShouldOpenWeb, runNativeNewGroup } from "./new-group.ts";

describe("runNativeNewGroup", () => {
  it("always returns web-fallback so the iOS tap opens the ViewportSheet", async () => {
    const result = await runNativeNewGroup("pt");
    assert.equal(result.type, "web-fallback");
    assert.equal(newGroupShouldOpenWeb(result), true);
  });

  it("never returns cancelled for the entry tap (that was the TF88 silent no-op)", async () => {
    const result = await runNativeNewGroup("en");
    assert.notEqual(result.type, "cancelled");
  });
});

describe("new group call site", () => {
  const home = readFileSync(new URL("../../components/notebook-groups-home.tsx", import.meta.url), "utf8");

  it("opens the web create sheet on Novo grupo (FAB / button) instead of swallowing cancel", () => {
    assert.match(home, /openCreate/);
    assert.match(home, /runNativeNewGroup/);
    assert.match(home, /setCreate\(true\)/);
    assert.match(home, /useNativeFab\(t\(locale, "notebookGroupNew"\)/);
    // Cancelled must open web — never `if (cancelled) return`.
    assert.match(home, /result\.type === "web-fallback" \|\| result\.type === "cancelled"/);
    assert.doesNotMatch(home, /if \(result\.type === "cancelled"\) return/);
  });

  it("catches errors and still opens the web create sheet", () => {
    assert.match(home, /openCreate failed — web sheet/);
    assert.match(home, /catch \(error\)[\s\S]*setCreate\(true\)/);
  });
});
