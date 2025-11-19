import pg from "pg";
import { DATABASE_URL, NODE_ENV } from "./env.js";

const { Pool } = pg;

export const pool = new Pool({
  connectionString: DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});

export async function query(text, params) {
  const start = Date.now();
  const res = await pool.query(text, params);
  const duration = Date.now() - start;
  if (NODE_ENV !== "test") {
    console.log("DB query", { text, duration, rows: res.rowCount });
  }
  return res;
}
