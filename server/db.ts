import { Pool, types } from 'pg';
import { drizzle } from 'drizzle-orm/node-postgres';
import * as schema from '../shared/schema';
import 'dotenv/config';

let connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  throw new Error("DATABASE_URL is not set inside the environment.");
}

// Strip redundant prefix if present
if (connectionString.startsWith("DATABASE_URL=")) {
  connectionString = connectionString.substring("DATABASE_URL=".length);
}

// Convert numeric types to float
types.setTypeParser(1700, (val) => parseFloat(val));

export const pool = new Pool({
  connectionString,
  ssl: {
    rejectUnauthorized: false,
  },
});

export const db = drizzle(pool, { schema });

