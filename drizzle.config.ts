import { defineConfig } from "drizzle-kit";

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL, ensure the database is provisioned");
}

let connectionString = process.env.DATABASE_URL;
if (connectionString.startsWith("DATABASE_URL=")) {
  connectionString = connectionString.substring("DATABASE_URL=".length);
}
if (connectionString.includes("postgres:Shouma@_3_7_3")) {
  connectionString = connectionString.replace("postgres:Shouma@_3_7_3", "postgres:Shouma%40_3_7_3");
}

export default defineConfig({
  out: "./migrations",
  schema: "./shared/schema.ts",
  dialect: "postgresql",
  dbCredentials: {
    url: connectionString,
  },
});
