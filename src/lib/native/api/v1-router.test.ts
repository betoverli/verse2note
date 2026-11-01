import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { matchNativeV1Route, methodAllowed } from "./v1-router.ts";

describe("matchNativeV1Route", () => {
  it("maps the catalog and session", () => {
    assert.deepEqual(matchNativeV1Route(""), { kind: "catalog" });
    assert.deepEqual(matchNativeV1Route("/"), { kind: "catalog" });
    assert.deepEqual(matchNativeV1Route("session"), { kind: "session" });
  });

  it("maps notes collection and item", () => {
    assert.deepEqual(matchNativeV1Route("notes"), { kind: "notes" });
    assert.deepEqual(matchNativeV1Route("notes/abc123"), { kind: "notes", noteId: "abc123" });
  });

  it("maps speakers and apns device", () => {
    assert.deepEqual(matchNativeV1Route("speakers"), { kind: "speakers" });
    assert.deepEqual(matchNativeV1Route("speakers/s1"), { kind: "speakers", speakerId: "s1" });
    assert.deepEqual(matchNativeV1Route("devices/apns"), { kind: "devices-apns" });
  });

  it("rejects unknown paths", () => {
    assert.equal(matchNativeV1Route("groups").kind, "not-found");
    assert.equal(matchNativeV1Route("notes/a/b").kind, "not-found");
  });
});

describe("methodAllowed", () => {
  it("allows GET session and CRUD notes", () => {
    assert.equal(methodAllowed({ kind: "session" }, "GET"), true);
    assert.equal(methodAllowed({ kind: "session" }, "POST"), false);
    assert.equal(methodAllowed({ kind: "notes" }, "GET"), true);
    assert.equal(methodAllowed({ kind: "notes" }, "POST"), true);
    assert.equal(methodAllowed({ kind: "notes", noteId: "x" }, "PATCH"), true);
    assert.equal(methodAllowed({ kind: "notes", noteId: "x" }, "DELETE"), true);
    assert.equal(methodAllowed({ kind: "notes", noteId: "x" }, "POST"), false);
  });

  it("allows OPTIONS everywhere matched", () => {
    assert.equal(methodAllowed({ kind: "catalog" }, "OPTIONS"), true);
    assert.equal(methodAllowed({ kind: "devices-apns" }, "OPTIONS"), true);
  });
});
