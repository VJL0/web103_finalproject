import { auth } from "express-oauth2-jwt-bearer";

if (!process.env.AUTH0_ISSUER_BASE_URL || !process.env.AUTH0_AUDIENCE) {
  throw new Error("Missing AUTH0_ISSUER_BASE_URL or AUTH0_AUDIENCE in server/.env");
}

export const requireAuth = auth({
  audience: process.env.AUTH0_AUDIENCE,
  issuerBaseURL: process.env.AUTH0_ISSUER_BASE_URL,
  tokenSigningAlg: "RS256",
});
