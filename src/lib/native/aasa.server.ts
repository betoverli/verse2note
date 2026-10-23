import { UNIVERSAL_RETURN_PATH } from "./return-to.ts";

const BUNDLE_ID = "com.verse2note.app";

/** Team ID from the server env. Empty until the Apple Developer account exists. */
export function configuredTeamId(): string | null {
  const id = process.env.APPLE_TEAM_ID?.trim() ?? "";
  return /^[A-Z0-9]{10}$/.test(id) ? id : null;
}

/**
 * apple-app-site-association. With no Team ID the file is valid and claims
 * no app, so the custom-scheme return keeps working. After APPLE_TEAM_ID is
 * set, only that team's app receives /auth/native-return.
 */
export function appleAppSiteAssociation(teamId: string | null): {
  applinks: { details: Array<{ appIDs: string[]; components: Array<Record<string, unknown>> }> };
} {
  if (!teamId) return { applinks: { details: [] } };
  return {
    applinks: {
      details: [
        {
          appIDs: [`${teamId}.${BUNDLE_ID}`],
          components: [
            {
              "/": UNIVERSAL_RETURN_PATH,
              comment: "Native login return. Bound to this app by the Team ID.",
            },
          ],
        },
      ],
    },
  };
}
