# Verse2Note

Picker de referências bíblicas. Escolha livro, capítulo e versos; copie um texto rico com deep link para o app de Bíblia (YouVersion, Logos, Tecarta e outros). Coleções por tema. Planos de leitura de capítulos inteiros.

Live: [verse2note.com](https://verse2note.com)

Português, English, Español. PWA offline. Sem conta.

## Local

```bash
npm install
npm run dev
```

Abre em `http://localhost:8080`.

## Stack

TanStack Start, React, Tailwind v4. Persistência no aparelho (`localStorage`).

## API / agentes

- Docs: [/for-ai](https://verse2note.com/for-ai)
- `GET /api/link?ref=João+3:16`
- `GET /api/collections?id=salvation`
- `GET /api/plans?id=gospels-30&day=1`
- Skill: [/skill.md](https://verse2note.com/skill.md)
- MCP: `POST /api/mcp` (`verse2note_link`, `verse2note_collection`, `verse2note_plan`)
- LLMs: [/llms.txt](https://verse2note.com/llms.txt)
- Sitemap: [/sitemap.xml](https://verse2note.com/sitemap.xml)
