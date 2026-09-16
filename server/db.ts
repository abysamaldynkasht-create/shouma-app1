import { Pool, types } from 'pg';
import { drizzle } from 'drizzle-orm/node-postgres';
import * as schema from '../shared/schema';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';

// Initial load of standard dotenv with override so local .env takes precedence
dotenv.config({ override: true });

// Fallback to load .evn if DATABASE_URL is missing
if (!process.env.DATABASE_URL) {
  const evnPath = path.resolve(process.cwd(), '.evn');
  if (fs.existsSync(evnPath)) {
    dotenv.config({ path: evnPath });
  }
}

let connectionString = process.env.DATABASE_URL || "";

// Strip redundant prefix if present
if (connectionString.startsWith("DATABASE_URL=")) {
  connectionString = connectionString.substring("DATABASE_URL=".length);
}

// Percent-encode the @ symbol in password if present unencoded
if (connectionString) {
  connectionString = connectionString.replace("postgres:Shouma@_3_7_3", "postgres:Shouma%40_3_7_3");
}

// Convert numeric types to float
types.setTypeParser(1700, (val) => parseFloat(val));

export const pool = new Pool(
  connectionString
    ? {
        connectionString,
        ssl: {
          rejectUnauthorized: false,
        },
        // Optimizing for connection poolers (e.g. PgBouncer, Neon/Supabase Poolers) under transaction mode
        max: 20, // Keep local container pool size balanced to not overwhelm the pooler
        idleTimeoutMillis: 30000, // Close idle clients quickly to free up pooler resources
        connectionTimeoutMillis: 5000, // Timeout active query attempts if the pool is fully saturated
        maxUses: 7500, // Periodically cycle connections to prevent memory leakage on long-lived channels
      }
    : {
        host: "localhost",
        port: 5432,
      }
);

// Register an error handler on the idle pool to prevent unhandled 'error' exceptions from crashing the server
pool.on('error', (err) => {
  const code = (err as any)?.code || '';
  const msg = (err as any)?.message || '';
  if (code === 'ENOTFOUND' || code === 'ECONNREFUSED' || msg.includes('ENOTFOUND')) {
    // Suppress noisy socket-level events when host is unreachable
    return;
  }
  console.error('Unexpected error on idle database client/pool:', err);
});

export const db = drizzle(pool, { schema });
