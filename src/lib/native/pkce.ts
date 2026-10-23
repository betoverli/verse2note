/**
 * PKCE-style binding for the native login code. The app keeps the verifier
 * and sends only the hash to the server. A code copied from the return URL
 * is useless without the verifier.
 */

const MATERIAL = /^[A-Za-z0-9_-]{43,128}$/;

export function isPkceMaterial(value: string): boolean {
  return MATERIAL.test(value);
}

function bytesToBase64Url(bytes: Uint8Array): string {
  let binary = "";
  for (const byte of bytes) binary += String.fromCharCode(byte);
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/g, "");
}

export function newPkceVerifier(): string {
  const bytes = new Uint8Array(32);
  crypto.getRandomValues(bytes);
  return bytesToBase64Url(bytes);
}

export async function pkceChallenge(verifier: string): Promise<string> {
  const digest = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(verifier));
  return bytesToBase64Url(new Uint8Array(digest));
}

export function samePkce(left: string, right: string): boolean {
  const a = new TextEncoder().encode(left);
  const b = new TextEncoder().encode(right);
  const length = Math.max(a.length, b.length);
  let diff = a.length === b.length ? 0 : 1;
  for (let i = 0; i < length; i += 1) diff |= (a[i] ?? 0) ^ (b[i] ?? 0);
  return diff === 0;
}

export async function verifierMatches(verifier: string, challenge: string): Promise<boolean> {
  if (!isPkceMaterial(verifier) || !isPkceMaterial(challenge)) return false;
  const got = await pkceChallenge(verifier);
  return samePkce(got, challenge);
}
