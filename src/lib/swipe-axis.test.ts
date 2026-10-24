import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { lockSwipe } from "./swipe-axis.ts";

describe("lockSwipe", () => {
  it("waits until the finger leaves the slop", () => {
    assert.equal(lockSwipe(0, 0), null);
    assert.equal(lockSwipe(4, 3), null);
    assert.equal(lockSwipe(-9, 8), null);
  });

  it("lets a vertical or diagonal drag scroll the list", () => {
    assert.equal(lockSwipe(6, 20), "v");
    assert.equal(lockSwipe(12, 10), "v");
    assert.equal(lockSwipe(8, -30), "v");
    assert.equal(lockSwipe(17, 10), "v");
  });

  it("claims a clearly horizontal swipe for the row actions", () => {
    assert.equal(lockSwipe(20, 6), "h");
    assert.equal(lockSwipe(20, 10), "h");
    assert.equal(lockSwipe(-30, 8), "h");
  });
});
