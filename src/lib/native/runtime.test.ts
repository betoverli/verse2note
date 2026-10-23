import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { classifyLink } from "./runtime.ts";

const page = "https://verse2note.com/app";

describe("classifyLink", () => {
  it("keeps the hosted site inside the WebView", () => {
    assert.equal(classifyLink("https://verse2note.com/reading/gospels-30", "", page), "stay");
    assert.equal(classifyLink("https://www.verse2note.com/login", "_blank", page), "stay");
    assert.equal(classifyLink("/profile", "_blank", page), "stay");
  });

  it("opens Bible apps through iOS", () => {
    assert.equal(classifyLink("youversion://bible?reference=JHN.3.16", "", page), "external");
    assert.equal(classifyLink("bible://John+3:16", "", page), "external");
    assert.equal(classifyLink("olivetree://bible/43.3.16", "", page), "external");
    assert.equal(classifyLink("https://www.bible.com/bible/111/JHN.3.16", "", page), "external");
    assert.equal(classifyLink("https://ref.ly/Jn3.16", "", page), "external");
    assert.equal(classifyLink("https://www.biblegateway.com/passage/?search=John+3:16", "", page), "external");
  });

  it("leaves ordinary same-window links alone and sends target=_blank out", () => {
    assert.equal(classifyLink("https://auth.grok.me/api/auth/oauth2/authorize", "", page), "stay");
    assert.equal(classifyLink("https://example.com/notes", "_blank", page), "external");
    assert.equal(classifyLink("mailto:hello@verse2note.com", "", page), "external");
    assert.equal(classifyLink("javascript:alert(1)", "", page), "stay");
  });
});
