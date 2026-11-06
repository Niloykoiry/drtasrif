import "server-only";

import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as typeof globalThis & {
  prisma?: PrismaClient;
};

const existingPrisma = globalForPrisma.prisma;
const hasCurrentSchema = typeof existingPrisma?.beforeAfterCase !== "undefined";

export const db =
  hasCurrentSchema && existingPrisma
    ? existingPrisma
    : new PrismaClient({
        log:
          process.env.NODE_ENV === "development"
            ? ["error", "warn"]
            : ["error"],
      });

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = db;
