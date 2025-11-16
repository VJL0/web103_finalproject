// server/server.js
import express from "express";
import cors from "cors";
import session from "express-session";
import passport from "passport";
import { Strategy as GitHubStrategy } from "passport-github2";
import dotenv from "dotenv";
import pg from "pg";

const { Pool } = pg;

dotenv.config();

const {
  PORT = 3000,
  NODE_ENV,
  CLIENT_ORIGIN = "http://localhost:5173",
  DATABASE_URL,
  GITHUB_CLIENT_ID,
  GITHUB_CLIENT_SECRET,
  GITHUB_CALLBACK_URL,
  SESSION_SECRET,
} = process.env;

const isProd = NODE_ENV === "production";

// ----- PostgreSQL Pool -----
const pool = new Pool({
  connectionString: DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});

// ----- Helper: find or create user from GitHub profile -----
async function findOrCreateUserFromGitHub(profile) {
  const githubId = profile.id;
  const username = profile.username;
  const displayName = profile.displayName || username;
  const avatarUrl = profile.photos?.[0]?.value ?? null;
  const profileUrl = profile.profileUrl ?? null;
  const email = profile.emails?.[0]?.value ?? null;

  const client = await pool.connect();
  try {
    const existing = await client.query(
      `SELECT * FROM users WHERE github_id = $1`,
      [githubId]
    );

    if (existing.rows.length > 0) {
      const updated = await client.query(
        `
        UPDATE users
        SET
          username = $2,
          display_name = $3,
          avatar_url = $4,
          profile_url = $5,
          email = $6,
          last_login_at = now(),
          updated_at = now()
        WHERE github_id = $1
        RETURNING *
        `,
        [githubId, username, displayName, avatarUrl, profileUrl, email]
      );
      return updated.rows[0];
    }

    const insert = await client.query(
      `
      INSERT INTO users (
        github_id,
        username,
        display_name,
        avatar_url,
        profile_url,
        email,
        last_login_at
      )
      VALUES ($1, $2, $3, $4, $5, $6, now())
      RETURNING *
      `,
      [githubId, username, displayName, avatarUrl, profileUrl, email]
    );

    return insert.rows[0];
  } finally {
    client.release();
  }
}

// ----- Passport GitHub Strategy -----
passport.use(
  new GitHubStrategy(
    {
      clientID: GITHUB_CLIENT_ID,
      clientSecret: GITHUB_CLIENT_SECRET,
      callbackURL: GITHUB_CALLBACK_URL,
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        const user = await findOrCreateUserFromGitHub(profile);
        done(null, user);
      } catch (err) {
        done(err);
      }
    }
  )
);

// Only store internal user id in the session
passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
  try {
    const result = await pool.query(`SELECT * FROM users WHERE id = $1`, [id]);
    const user = result.rows[0] || null;
    done(null, user);
  } catch (err) {
    done(err);
  }
});

// ----- Express App -----
const app = express();

app.use(express.json());

app.use(
  cors({
    origin: CLIENT_ORIGIN,
    credentials: true,
  })
);

app.use(
  session({
    secret: SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      secure: isProd,
      sameSite: isProd ? "none" : "lax",
      maxAge: 60 * 60 * 1000, // 1 hour
    },
  })
);

app.use(passport.initialize());
app.use(passport.session());

// ----- Auth Routes -----

// Start GitHub login (basic profile only)
app.get("/auth/github", passport.authenticate("github"));

// GitHub callback
app.get(
  "/auth/github/callback",
  passport.authenticate("github", {
    failureRedirect: "/auth/failure",
    session: true,
  }),
  (req, res) => {
    res.redirect(`${CLIENT_ORIGIN}/dashboard`);
  }
);

// Login failure
app.get("/auth/failure", (req, res) => {
  res.status(401).json({ error: "GitHub authentication failed" });
});

// Logout
app.post("/auth/logout", (req, res, next) => {
  req.logout((err) => {
    if (err) return next(err);

    req.session.destroy(() => {
      res.clearCookie("connect.sid");
      res.status(200).json({ ok: true });
    });
  });
});

// ----- Protected + utility routes -----

function requireAuth(req, res, next) {
  if (!req.user) {
    return res.status(401).json({ error: "Not authenticated" });
  }
  next();
}

// Current user
app.get("/api/me", (req, res) => {
  if (!req.user) return res.status(200).json({ user: null });

  const { id, username, display_name, avatar_url, profile_url, email } =
    req.user;

  res.json({
    user: {
      id,
      username,
      displayName: display_name,
      avatarUrl: avatar_url,
      profileUrl: profile_url,
      email,
    },
  });
});

// Example protected route
app.get("/api/secret", requireAuth, (req, res) => {
  res.json({ message: `Hi ${req.user.username}, this is super secret 🚀` });
});

app.listen(PORT, () => {
  console.log(`Server listening on http://localhost:${PORT}`);
});
