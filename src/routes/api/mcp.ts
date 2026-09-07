import { createFileRoute } from "@tanstack/react-router";
import { BIBLE_APPS } from "@/lib/bible/apps";
import { resolveCollections } from "@/lib/bible/collections-api";
import { collectRefs, corsJson, corsPreflight, resolveLinks } from "@/lib/bible/link-api";

type Rpc = {
  jsonrpc?: string;
  id?: string | number | null;
  method?: string;
  params?: Record<string, unknown>;
};

const APPS = BIBLE_APPS.map((app) => app.id).join(", ");

const LINK_TOOL = {
  name: "verse2note_link",
  description:
    "Turn Bible references into deep links for YouVersion, Logos, Tecarta and other Bible apps. Returns markdown ready to paste.",
  inputSchema: {
    type: "object",
    properties: {
      ref: { type: "string", description: "One reference, e.g. João 3:16 or John 3:16." },
      refs: {
        type: "array",
        items: { type: "string" },
        description: "Several references at once.",
      },
      app: { type: "string", description: `Bible app id. One of: ${APPS}.` },
      translation: { type: "string", description: "Translation id, e.g. nvi-pt, niv, rvr1960." },
      locale: { type: "string", enum: ["pt", "en", "es"] },
      native: { type: "boolean", description: "Prefer the native app URL scheme when available." },
    },
  },
};

const COLLECTION_TOOL = {
  name: "verse2note_collection",
  description:
    "Browse Verse2Note themed collections (160 lists of references). List categories, search themes, or return a theme as paste-ready markdown links. Does not return full verse text.",
  inputSchema: {
    type: "object",
    properties: {
      q: { type: "string", description: "Search themes and categories, e.g. oração, anxiety, doctrina." },
      id: { type: "string", description: "Theme id, e.g. salvation, prayer. Returns linked markdown for the whole list." },
      category: {
        type: "string",
        description:
          "Category id: doctrine, jesus, personal, church-life, home, seasons, society, character, spirit, last-things, stories, emotions, work-money, worship-prayer.",
      },
      app: { type: "string", description: `Bible app id when fetching a theme. One of: ${APPS}.` },
      translation: { type: "string" },
      locale: { type: "string", enum: ["pt", "en", "es"] },
      native: { type: "boolean" },
    },
  },
};

const TOOLS = [LINK_TOOL, COLLECTION_TOOL];

function rpcResult(id: Rpc["id"], result: unknown) {
  return corsJson({ jsonrpc: "2.0", id: id ?? null, result });
}

function rpcError(id: Rpc["id"], message: string, code = -32600) {
  return corsJson({ jsonrpc: "2.0", id: id ?? null, error: { code, message } }, 400);
}

function asArgs(params: Record<string, unknown>): Record<string, unknown> {
  return (params.arguments ?? params) as Record<string, unknown>;
}

async function handleRpc(msg: Rpc): Promise<Response> {
  const method = msg.method ?? "";
  if (method === "initialize") {
    return rpcResult(msg.id, {
      protocolVersion: "2024-11-05",
      capabilities: { tools: {} },
      serverInfo: { name: "verse2note", version: "1.1.0" },
      instructions:
        "Use verse2note_link for a specific reference. Use verse2note_collection to search themes or fetch a whole list as markdown links. Default app is youversion. Do not invent URLs.",
    });
  }
  if (method === "notifications/initialized" || method === "initialized") {
    return new Response(null, { status: 204 });
  }
  if (method === "tools/list" || method === "list_tools") {
    return rpcResult(msg.id, { tools: TOOLS });
  }
  if (method === "ping") {
    return rpcResult(msg.id, {});
  }
  if (method === "tools/call" || method === "call_tool") {
    const params = msg.params ?? {};
    const name = typeof params.name === "string" ? params.name : LINK_TOOL.name;
    const args = asArgs(params);

    if (name === COLLECTION_TOOL.name) {
      const resolved = resolveCollections({
        q: typeof args.q === "string" ? args.q : undefined,
        id: typeof args.id === "string" ? args.id : undefined,
        category: typeof args.category === "string" ? args.category : undefined,
        app: typeof args.app === "string" ? args.app : undefined,
        translation: typeof args.translation === "string" ? args.translation : undefined,
        locale: typeof args.locale === "string" ? args.locale : undefined,
        native: args.native === true,
      });
      if (!resolved.ok) {
        return rpcResult(msg.id, { isError: true, content: [{ type: "text", text: resolved.error }] });
      }
      const text =
        "markdown" in resolved && resolved.markdown
          ? resolved.markdown
          : JSON.stringify(resolved, null, 2);
      return rpcResult(msg.id, {
        content: [{ type: "text", text }],
        structuredContent: resolved,
      });
    }

    if (name !== LINK_TOOL.name) return rpcError(msg.id, `Unknown tool "${name}".`, -32601);
    const refs = collectRefs([
      typeof args.ref === "string" ? args.ref : undefined,
      Array.isArray(args.refs) ? args.refs.map(String) : typeof args.refs === "string" ? args.refs : undefined,
    ]);
    const resolved = resolveLinks({
      refs,
      app: typeof args.app === "string" ? args.app : undefined,
      translation: typeof args.translation === "string" ? args.translation : undefined,
      locale: typeof args.locale === "string" ? args.locale : undefined,
      native: args.native === true,
    });
    if (!resolved.ok) {
      return rpcResult(msg.id, {
        isError: true,
        content: [{ type: "text", text: resolved.error }],
      });
    }
    return rpcResult(msg.id, {
      content: [{ type: "text", text: resolved.markdown }],
      structuredContent: resolved,
    });
  }
  if (!method) return rpcError(msg.id, "Missing method.");
  return rpcError(msg.id, `Unknown method "${method}".`, -32601);
}

export const Route = createFileRoute("/api/mcp")({
  server: {
    handlers: {
      OPTIONS: async () => corsPreflight(),
      GET: async () =>
        corsJson({
          name: "verse2note",
          transport: "json-rpc",
          protocolVersion: "2024-11-05",
          endpoint: "/api/mcp",
          tools: TOOLS.map((tool) => tool.name),
        }),
      POST: async ({ request }) => {
        let body: Rpc;
        try {
          body = (await request.json()) as Rpc;
        } catch {
          return rpcError(null, "Body must be JSON-RPC.");
        }
        return handleRpc(body);
      },
    },
  },
});
