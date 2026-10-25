import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { partitionScreenClass } from "./screen-class.ts";

describe("partitionScreenClass", () => {
  it("keeps the header gap on the shell and the tab-bar pad on the scroller", () => {
    const parts = partitionScreenClass(
      "mx-auto flex min-h-dvh w-full max-w-3xl flex-col gap-6 px-4 pt-0 pb-[calc(var(--tab-bar-height)+1.5rem)] sm:px-6",
    );
    assert.match(parts.main, /\bgap-6\b/);
    assert.doesNotMatch(parts.main, /\bpb-/);
    assert.match(parts.body, /\bgap-6\b/);
    assert.match(parts.body, /pb-\[calc\(var\(--tab-bar-height\)\+1\.5rem\)\]/);
    assert.match(parts.body, /\bscreen-pad-6\b/);
  });

  it("maps the other page gaps onto the iOS scroller padding", () => {
    assert.match(partitionScreenClass("flex flex-col gap-4 pb-8").body, /\bscreen-pad-4\b/);
    assert.match(partitionScreenClass("flex flex-col gap-8").body, /\bscreen-pad-8\b/);
    assert.doesNotMatch(partitionScreenClass("flex flex-col px-4").body, /screen-pad/);
  });
});
