import assert from "node:assert/strict";
import { createHash, randomBytes } from "node:crypto";
import { describe, it } from "node:test";
import { appleAppSiteAssociation } from "./aasa.server.ts";
import { openSessionToken, resolveHandoffKey, sealSessionToken } from "./handoff-seal.server.ts";
import { pkceCookieHeader, readPkceCookie } from "./pkce-cookie.ts";
import { isPkceMaterial, newPkceVerifier, pkceChallenge, samePkce, verifierMatches } from "./pkce.ts";
import { isAllowedReturn, nativeReturnTo } from "./return-to.ts";

const token = "session-token-that-must-not-be-stored-raw";

describe("pkce", () => {
  it("matches the hash the server will store and rejects a different verifier", async () => {
    const verifier = newPkceVerifier();
    const challenge = await pkceChallenge(verifier);
    const expected = createHash("sha256").update(verifier).digest("base64url");
    assert.equal(challenge, expected);
    assert.equal(await verifierMatches(verifier, challenge), true);
    const wrong = `${verifier.slice(0, -1)}${verifier.endsWith("a") ? "b" : "a"}`;
    assert.equal(await verifierMatches(wrong, challenge), false);
    assert.equal(isPkceMaterial("short"), false);
    assert.equal(samePkce(challenge, expected), true);
  });
});

describe("return url", () => {
  it("uses the universal link or the scheme, and never the session token", () => {
    const code = "a".repeat(43);
    const https = nativeReturnTo("https", { code });
    const scheme = nativeReturnTo("scheme", { code });
    assert.equal(https, `https://verse2note.com/auth/native-return?code=${code}`);
    assert.equal(scheme, `verse2note://auth?code=${code}`);
    assert.equal(https.includes(token), false);
    assert.equal(isAllowedReturn(new URL(https), "https"), true);
    assert.equal(isAllowedReturn(new URL(https), "scheme"), false);
    assert.equal(isAllowedReturn(new URL(scheme), "scheme"), true);
    assert.equal(isAllowedReturn(new URL(nativeReturnTo("https", { error: true })), "https"), false);
  });
});

describe("pkce cookie", () => {
  it("round-trips the challenge and the return mode", async () => {
    const challenge = await pkceChallenge("b".repeat(43));
    const header = pkceCookieHeader(challenge, "https");
    assert.match(header, /HttpOnly/);
    assert.match(header, /Secure/);
    const parsed = readPkceCookie(`other=1; ${header.split(";")[0]}`);
    assert.deepEqual(parsed, { challenge, mode: "https" });
    assert.equal(readPkceCookie("nope=1"), null);
  });
});

describe("handoff seal", () => {
  it("encrypts the session token and refuses to invent a key", () => {
    assert.deepEqual(resolveHandoffKey({}), { ok: false, reason: "missing" });
    assert.equal(resolveHandoffKey({ handoff: "not-a-key", auth: "fallback-secret" }).ok, false);

    const authKey = resolveHandoffKey({ auth: "better-auth-secret" });
    assert.equal(authKey.ok, true);
    if (!authKey.ok) return;
    const sealed = sealSessionToken(token, authKey.key);
    assert.equal(sealed.includes(token), false);
    assert.equal(openSessionToken(sealed, authKey.key), token);
    assert.equal(openSessionToken(sealed, randomBytes(32)), null);
    const flipped = `${sealed.slice(0, -2)}${sealed.endsWith("a") ? "b" : "a"}`;
    assert.equal(openSessionToken(flipped, authKey.key), null);

    const hex = randomBytes(32).toString("hex");
    const dedicated = resolveHandoffKey({ handoff: hex, auth: "unused" });
    assert.equal(dedicated.ok && dedicated.source, "dedicated");
    if (!dedicated.ok) return;
    assert.equal(openSessionToken(sealSessionToken(token, dedicated.key), dedicated.key), token);
  });
});

describe("apple-app-site-association", () => {
  it("claims no app until the Team ID exists", () => {
    const empty = JSON.stringify(appleAppSiteAssociation(null));
    assert.equal(empty.includes("com.verse2note.app"), false);
    const live = appleAppSiteAssociation("AB12CD34EF");
    assert.deepEqual(live.applinks.details[0]?.appIDs, ["AB12CD34EF.com.verse2note.app"]);
    assert.equal(live.applinks.details[0]?.components[0]?.["/"], "/auth/native-return");
  });
});
