import { createFileRoute } from "@tanstack/react-router";
import { BIBLE_APPS } from "@/lib/bible/apps";
import { collectRefs, corsJson, corsPreflight, resolveLinks } from "@/lib/bible/link-api";

type Rpc = {
  jsonrpc?: string;
  id?: string | number | null;
  method?: string;
  params?: Record<string, unknown>;
};

const TOOL = {
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
      app: {
        type: "string",
        description: `Bible app id. One of: ${BIBLE_APPS.map((app) => app.id).join(", ")}.`,
      },
      translation: { type: "string", description: "Translation id, e.g. nvi-pt, niv, rvr1960." },
      locale: { type: "string", enum: ["pt", "en", "es"] },
      native: { type: "boolean", description: "Prefer the native app URL scheme when available." },
    },
  },
};

function rpcResult(id: Rpc["id"], result: unknown) {
  return corsJson({ jsonrpc: "2.0", id: id ?? null, result });
}

function rpcError(id: Rpc["id"], message: string, code = -32600) {
  return corsJson({ jsonrpc: "2.0", id: id ?? null, error: { code, message } }, 400);
}

async function handleRpc(msg: Rpc): Promise<Response> {
  const method = msg.method ?? "";
  if (method === "initialize") {
    return rpcResult(msg.id, {
      protocolVersion: "2024-11-05",
      capabilities: { tools: {} },
      serverInfo: { name: "verse2note", version: "1.0.0" },
      instructions:
        "Use verse2note_link to turn Bible book/chapter/verse into a deep link. Default app is youversion.",
    });
  }
  if (method === "notifications/initialized" || method === "initialized") {
    return new Response(null, { status: 204 });
  }
  if (method === "tools/list" || method === "list_tools") {
    return rpcResult(msg.id, { tools: [TOOL] });
  }
  if (method === "ping") {
    return rpcResult(msg.id, {});
  }
  if (method === "tools/call" || method === "call_tool") {
    const params = msg.params ?? {};
    const name = typeof params.name === "string" ? params.name : TOOL.name;
    if (name !== TOOL.name) return rpcError(msg.id, `Unknown tool "${name}".`, -32601);
    const args = (params.arguments ?? params) as Record<string, unknown>;
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
          tools: [TOOL.name],
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
