import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { bearerFromStores, sanitizeBearerToken } from "./bearer-store.ts";

describe("native bearer persistence", () => {
  it("keeps the iOS token in local storage and ignores a missing session copy", () => {
    assert.deepEqual(bearerFromStores(true, "signed.token", null), {
      token: "signed.token",
      promote: false,
    });
  });

  it("promotes a session token the first time the app is still alive", () => {
    assert.deepEqual(bearerFromStores(true, null, "signed.token"), {
      token: "signed.token",
      promote: true,
    });
  });

  it("does not persist the website or preview token outside session storage", () => {
    assert.deepEqual(bearerFromStores(false, "local-should-not-win", "preview.token"), {
      token: "preview.token",
      promote: false,
    });
    assert.deepEqual(bearerFromStores(false, "local-should-not-win", null), {
      token: null,
      promote: false,
    });
  });

  it("rejects empty and oversized tokens", () => {
    assert.equal(sanitizeBearerToken("  "), null);
    assert.equal(sanitizeBearerToken("a".repeat(4001)), null);
    assert.equal(sanitizeBearerToken("ok.token"), "ok.token");
  });
});
