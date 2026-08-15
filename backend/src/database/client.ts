import 'dotenv/config';
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';

declare global {
  // eslint-disable-next-line no-var
  var __prisma: PrismaClient | undefined;
}

function createPrismaClient() {
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    // Supabase requires SSL in ALL environments (dev + prod)
    ssl: { rejectUnauthorized: false },
    // Cap pool size to avoid exhausting Supabase free-tier (20 conn limit)
    max: 5,
    idleTimeoutMillis: 30_000,
    connectionTimeoutMillis: 10_000,
  });
  const adapter = new PrismaPg(pool);
  return new PrismaClient({
    adapter,
    log: process.env.NODE_ENV === 'development' ? ['error', 'warn'] : ['error'],
  });
}

export const prisma = globalThis.__prisma || createPrismaClient();

if (process.env.NODE_ENV !== 'production') {
  globalThis.__prisma = prisma;
}
