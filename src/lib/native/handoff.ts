import { createServerFn } from "@tanstack/react-start";
import { authMiddleware } from "@/lib/auth/middleware";

export const mintNativeHandoff = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .handler(async ({ context }) => {
    const { mintHandoff } = await import("./handoff.server");
    return mintHandoff(context.userId);
  });

export const claimNativeHandoff = createServerFn({ method: "POST" })
  .validator((data: { code?: string }) => ({
    code: typeof data?.code === "string" ? data.code : "",
  }))
  .handler(async ({ data }) => {
    const { claimHandoff } = await import("./handoff.server");
    return claimHandoff(data.code);
  });
