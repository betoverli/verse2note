import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  APPLE_CLIENT_ID_ENV,
  APPLE_CLIENT_SECRET_ENV,
  APPLE_PROVIDER_ID,
  appleOAuthFromEnv,
} from "./apple.ts";

describe("appleOAuthFromEnv", () => {
  it("is configured only when both client id and secret are non-empty", () => {
    const configured = appleOAuthFromEnv({
      [APPLE_CLIENT_ID_ENV]: " com.verse2note.app ",
      [APPLE_CLIENT_SECRET_ENV]: " apple-secret ",
    });
    assert.deepEqual(configured, {
      configured: true,
      clientId: "com.verse2note.app",
      clientSecret: "apple-secret",
    });
    assert.equal(APPLE_PROVIDER_ID, "apple");
  });

  it("stays off when either value is missing or blank", () => {
    assert.deepEqual(appleOAuthFromEnv({}), { configured: false });
    assert.deepEqual(appleOAuthFromEnv({ [APPLE_CLIENT_ID_ENV]: "id-only" }), { configured: false });
    assert.deepEqual(appleOAuthFromEnv({ [APPLE_CLIENT_SECRET_ENV]: "secret-only" }), {
      configured: false,
    });
  });
});
