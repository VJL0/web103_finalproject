import dotenv from "dotenv";

dotenv.config();

export const PORT = process.env.PORT;
export const NODE_ENV = process.env.NODE_ENV;
export const CLIENT_URL = process.env.CLIENT_URL;

export const DATABASE_URL = process.env.DATABASE_URL;

export const GITHUB_CLIENT_ID = process.env.GITHUB_CLIENT_ID;
export const GITHUB_CLIENT_SECRET = process.env.GITHUB_CLIENT_SECRET;
export const GITHUB_CALLBACK_URL = process.env.GITHUB_CALLBACK_URL;

export const SESSION_SECRET = process.env.SESSION_SECRET;

if (!DATABASE_URL) {
  throw new Error("DATABASE_URL is required");
}
if (!SESSION_SECRET) {
  throw new Error("SESSION_SECRET is required");
}
if (!GITHUB_CLIENT_ID || !GITHUB_CLIENT_SECRET || !GITHUB_CALLBACK_URL) {
  console.warn("[warn] GitHub OAuth env vars missing. Auth will fail.");
}
