import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { apnsPayload } from "./apns-payload.ts";

describe("apnsPayload", () => {
  it("keeps the in-app path and drops an off-site href", () => {
    const ok = apnsPayload({ title: "Leitura", body: "Dia 2", href: "/reading/gospels-30" });
    assert.equal(ok.href, "/reading/gospels-30");
    assert.equal(ok.aps.alert.title, "Leitura");
    const blocked = apnsPayload({ title: "x", body: "y", href: "https://evil.example/phish" });
    assert.equal(blocked.href, "/app");
  });
});
