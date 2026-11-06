import { config } from "dotenv";
import { createAuthClient } from "@neondatabase/auth";
import { BetterAuthVanillaAdapter } from "@neondatabase/auth/vanilla/adapters";
import { PrismaClient } from "@prisma/client";

config({ path: ".env.local" });
config();

const db = new PrismaClient();

async function provisionAdmin() {
  const email = process.env.ADMIN_EMAIL?.trim().toLowerCase();
  const password = process.env.ADMIN_INITIAL_PASSWORD;
  const authBaseUrl = process.env.NEON_AUTH_BASE_URL;

  if (!email || !password || !authBaseUrl) {
    throw new Error(
      "Set ADMIN_EMAIL, ADMIN_INITIAL_PASSWORD, and NEON_AUTH_BASE_URL before provisioning.",
    );
  }
  if (password.length < 8) {
    throw new Error("ADMIN_INITIAL_PASSWORD must contain at least 8 characters.");
  }

  await db.adminUser.upsert({
    where: { email },
    create: { email, isActive: true },
    update: { isActive: true },
  });

  const auth = createAuthClient(authBaseUrl, {
    adapter: BetterAuthVanillaAdapter({
      fetchOptions: { headers: { origin: "http://localhost:3000" } },
    }),
  });
  const { error } = await auth.signUp.email({
    email,
    password,
    name: "Dr. Tasrif Ahmed",
    callbackURL: "http://localhost:3000/admin",
  });
  if (error) {
    throw new Error(`Neon Auth could not create the administrator: ${error.message}`);
  }
}

provisionAdmin()
  .then(() => {
    console.log("Administrator account provisioned.");
  })
  .catch((error: unknown) => {
    console.error("Administrator provisioning failed", error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await db.$disconnect();
  });
