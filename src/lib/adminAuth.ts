export const ADMIN_COOKIE = "admin_session";
export const COOKIE_MAX_AGE = 60 * 60 * 24 * 7; // 7 days

function toHex(buffer: ArrayBuffer): string {
  return Array.from(new Uint8Array(buffer))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

async function hmacHex(secret: string, message: string): Promise<string> {
  const enc = new TextEncoder();
  const key = await crypto.subtle.importKey(
    "raw",
    enc.encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );
  const signature = await crypto.subtle.sign(
    "HMAC",
    key,
    enc.encode(message)
  );
  return toHex(signature);
}

function timingSafeEqualString(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let mismatch = 0;
  for (let i = 0; i < a.length; i++) {
    mismatch |= a.charCodeAt(i) ^ b.charCodeAt(i);
  }
  return mismatch === 0;
}

export async function getExpectedAdminToken(): Promise<string | null> {
  const password = process.env.ADMIN_PASSWORD;
  if (!password) return null;
  return hmacHex(password, "bsites-admin-session");
}

export function verifyAdminPassword(password: string): boolean {
  const expected = process.env.ADMIN_PASSWORD;
  if (!expected) return false;
  return timingSafeEqualString(password, expected);
}

export async function isValidAdminToken(
  token: string | undefined | null
): Promise<boolean> {
  if (!token) return false;
  const expected = await getExpectedAdminToken();
  if (!expected) return false;
  return timingSafeEqualString(token, expected);
}

export function adminCookieOptions(token: string) {
  return {
    name: ADMIN_COOKIE,
    value: token,
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax" as const,
    path: "/",
    maxAge: COOKIE_MAX_AGE,
  };
}
