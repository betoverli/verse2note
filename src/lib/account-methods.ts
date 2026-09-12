import { createServerFn } from "@tanstack/react-start";
import { authMiddleware } from "@/lib/auth/middleware";

export const addEmailPassword = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator((data: { newPassword: string }) => {
    const password = typeof data.newPassword === "string" ? data.newPassword : "";
    if (password.length < 8 || password.length > 128) throw new Error("password");
    return { newPassword: password };
  })
  .handler(async ({ context, data }) => {
    const { auth } = await import("@/lib/auth/server");
    const ctx = await auth.$context;
    const accounts = await ctx.internalAdapter.findAccounts(context.userId);
    if (accounts.some((item) => item.providerId === "credential" && item.password)) {
      return { ok: false as const, error: "set" as const };
    }
    const password = await ctx.password.hash(data.newPassword);
    await ctx.internalAdapter.linkAccount({
      userId: context.userId,
      providerId: "credential",
      accountId: context.userId,
      password,
    });
    return { ok: true as const };
  });
