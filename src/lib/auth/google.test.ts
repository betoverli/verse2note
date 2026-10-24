import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  GOOGLE_CALLBACK_PATH,
  GOOGLE_CLIENT_ID_ENV,
  GOOGLE_CLIENT_SECRET_ENV,
  GOOGLE_PROVIDER_ID,
  googleOAuthFromEnv,
} from "./google.ts";
import { GROK_PROVIDERS } from "./providers.ts";

describe("googleOAuthFromEnv", () => {
  it("is configured only when both client id and secret are non-empty", () => {
    const configured = googleOAuthFromEnv({
      [GOOGLE_CLIENT_ID_ENV]: " test-client ",
      [GOOGLE_CLIENT_SECRET_ENV]: " test-secret ",
    });
    assert.deepEqual(configured, {
      configured: true,
      clientId: "test-client",
      clientSecret: "test-secret",
    });
  });

  it("stays off when either value is missing or blank", () => {
    assert.deepEqual(googleOAuthFromEnv({}), { configured: false });
    assert.deepEqual(
      googleOAuthFromEnv({ [GOOGLE_CLIENT_ID_ENV]: "id-only" }),
      { configured: false },
    );
    assert.deepEqual(
      googleOAuthFromEnv({ [GOOGLE_CLIENT_SECRET_ENV]: "secret-only" }),
      { configured: false },
    );
    assert.deepEqual(
      googleOAuthFromEnv({
        [GOOGLE_CLIENT_ID_ENV]: "   ",
        [GOOGLE_CLIENT_SECRET_ENV]: "secret",
      }),
      { configured: false },
    );
  });

  it("uses Better Auth's Google callback path, not the broker OAuth path", () => {
    assert.equal(GOOGLE_PROVIDER_ID, "google");
    assert.equal(GOOGLE_CALLBACK_PATH, "/api/auth/callback/google");
    assert.equal(GOOGLE_CALLBACK_PATH.includes("oauth2"), false);
    assert.equal(GOOGLE_CALLBACK_PATH.includes("grok"), false);
  });

  it("keeps legacy broker Google and does not register X", () => {
    assert.equal(
      GROK_PROVIDERS.some((provider) => provider.providerId === "grok-google"),
      true,
    );
    assert.equal(
      GROK_PROVIDERS.some(
        (provider) =>
          provider.idp === "twitter" ||
          provider.providerId === "grok-x" ||
          provider.providerId === "twitter",
      ),
      false,
    );
  });
});
