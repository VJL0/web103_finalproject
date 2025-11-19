// In dev, this will default to http://localhost:3000
// In production, we'll set VITE_API_BASE_URL on Render.
export const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:3000";
