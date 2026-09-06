// Fail-fast environment validation (server-side only).
// Imported once from lib/auth.ts and lib/db.ts so every server entry validates env.

const REQUIRED = ["DATABASE_URL", "NEXTAUTH_SECRET"] as const;

function validateEnv() {
  const missing = REQUIRED.filter((k) => !process.env[k]);
  if (missing.length > 0) {
    throw new Error(
      `[env] Missing required env vars: ${missing.join(", ")}. Copy .env.example to .env and fill values.`
    );
  }
  if ((process.env.NEXTAUTH_SECRET ?? "").length < 16) {
    throw new Error("[env] NEXTAUTH_SECRET must be at least 16 characters (use a long random string).");
  }
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
  try {
    new URL(siteUrl);
  } catch {
    throw new Error(`[env] NEXT_PUBLIC_SITE_URL is not a valid URL: "${siteUrl}"`);
  }
}

let checked = false;
if (!checked) {
  validateEnv();
  checked = true;
}

export const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000").replace(/\/$/, "");
export const IS_PROD = process.env.NODE_ENV === "production";
export const ZARINPAL_MERCHANT = process.env.ZARINPAL_MERCHANT_ID ?? "";
