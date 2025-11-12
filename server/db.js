import "dotenv/config";
import pkg from "pg";
const { Pool } = pkg;

if (!process.env.DATABASE_URL) {
  throw new Error("Missing DATABASE_URL in server/.env");
}

export const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  // ssl: { rejectUnauthorized: false }, // <- enable if you ever use a cloud DB that requires SSL
});
