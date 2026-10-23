import { createServerFn } from "@tanstack/react-start";
import { authMiddleware } from "@/lib/auth/middleware";

export const mintNativeHandoff = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .handler(async ({ context }) => {
    const { mintHandoff } = await import("./handoff.server");
    return mintHandoff(context.userId);
  });

export const abortNativeReturn = createServerFn({ method: "POST" }).handler(async () => {
  const { errorReturn } = await import("./handoff.server");
  return errorReturn();
});

export const claimNativeHandoff = createServerFn({ method: "POST" })
  .validator((data: { code?: string; verifier?: string }) => ({
    code: typeof data?.code === "string" ? data.code : "",
    verifier: typeof data?.verifier === "string" ? data.verifier : "",
  }))
  .handler(async ({ data }) => {
    const { claimHandoff } = await import("./handoff.server");
    return claimHandoff(data.code, data.verifier);
  });
