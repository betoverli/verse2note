---
name: verse2note
description: >
  Generate rich-text Bible reference deep links for YouVersion, Logos, Tecarta
  and other Bible apps. Use when the user wants to link verses, copy João 3:16 /
  John 3:16 / Juan 3:16, or paste Scripture references into notes, chat, or a doc.
---

# Verse2Note

Verse2Note is a verse picker, not a Bible. It does not return verse text. It returns
the **passage name already linked** to the user's Bible app.

If you fetched this file from `{origin}/skill.md`, the API is `{origin}/api/link`.

## Call the API

```
GET {origin}/api/link?ref=John+3:16&app=youversion&locale=en
GET {origin}/api/link?refs=João+3:16|Romanos+8:28&app=youversion&locale=pt
POST {origin}/api/link
Content-Type: application/json
{ "refs": ["John 3:16", "Romans 8:28"], "app": "youversion", "locale": "en" }
```

Response `markdown` is what you paste. Example: `[John 3:16](https://www.bible.com/bible/111/JHN.3.16)`.

## Parameters

| Name | Default | Notes |
|---|---|---|
| `ref` / `refs` | required | Book + chapter + verse. PT/EN/ES names and abbreviations. |
| `app` | `youversion` | youversion, tecarta, logos, olive-tree, bible-gateway, blue-letter, esv, biblia-online, bible-hub, accordance, e-sword, mysword, jw-library |
| `translation` | locale default | nvi-pt, niv, rvr1960, esv, kjv, … |
| `locale` | pt | pt, en, es — labels in that language |
| `native` | false | `true` uses the app URL scheme when the app has one |

## MCP

JSON-RPC at `POST {origin}/api/mcp`. Tool: `verse2note_link` with the same fields.

```
{"jsonrpc":"2.0","id":1,"method":"tools/call","params":{"name":"verse2note_link","arguments":{"ref":"John 3:16","app":"youversion","locale":"en"}}}
```

## Rules

- Never invent a bible.com / Logos URL. Always call the API.
- Several references in one meeting → one `refs` call, paste `markdown`.
- If the user names a Bible app, pass `app`. If they name a translation, pass `translation`.
- Do not fetch or quote verse text unless the user already provided it.
