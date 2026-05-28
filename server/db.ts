import { Pool, types } from 'pg';
import { drizzle } from 'drizzle-orm/node-postgres';
import * as schema from '../shared/schema';
import 'dotenv/config';

// تعريف موحد ونقي للمتغير بدون تكرار
const connectionString = process.env.DATABASE_URL as string;

if (!connectionString) {
  throw new Error("DATABASE_URL is not set inside the environment.");
}

types.setTypeParser(1700, (val) => parseFloat(val));

export const pool = new Pool({
  connectionString: connectionString,
  ssl: {
    rejectUnauthorized: false,
  },
});

export const db = drizzle(pool, { schema });
