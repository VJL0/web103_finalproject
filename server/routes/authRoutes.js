import { Router } from "express";
import passport from "passport";
import { getMe, logout } from "../controllers/authController.js";
import { CLIENT_URL } from "../config/env.js";

const router = Router();

// Start GitHub OAuth
router.get("/github", passport.authenticate("github"));

// OAuth callback
router.get(
  "/github/callback",
  passport.authenticate("github", {
    failureRedirect: "/auth/failure",
  }),
  (req, res) => {
    res.redirect(CLIENT_URL); // frontend
  }
);

router.get("/failure", (req, res) => {
  res.status(401).json({ error: "GitHub authentication failed" });
});

router.get("/me", getMe);
router.post("/logout", logout);

export default router;
