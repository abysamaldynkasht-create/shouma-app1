import { migrate } from "drizzle-orm/node-postgres/migrator";
import { db, pool } from "./db";

async function runMigrations() {
  console.log("⏳ Starting data migrations...");
  try {
    await migrate(db, { migrationsFolder: "./migrations" });
    console.log("✅ Database schema migrated successfully!");
  } catch (error) {
    console.error("❌ Error during database migraton:", error);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

runMigrations();
