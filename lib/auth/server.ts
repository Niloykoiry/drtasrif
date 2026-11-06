import "server-only";

import { createNeonAuth } from "@neondatabase/auth/next/server";

type NeonAuthInstance = ReturnType<typeof createNeonAuth>;

let instance: NeonAuthInstance | undefined;

export function getAuth(): NeonAuthInstance {
  if (instance) return instance;

  const baseUrl = process.env.NEON_AUTH_BASE_URL;
  const cookieSecret = process.env.NEON_AUTH_COOKIE_SECRET;

  if (!baseUrl || !cookieSecret) {
    throw new Error(
      "Neon Auth is not configured. Set NEON_AUTH_BASE_URL and NEON_AUTH_COOKIE_SECRET.",
    );
  }

  instance = createNeonAuth({
    baseUrl,
    cookies: { secret: cookieSecret },
  });

  return instance;
}
