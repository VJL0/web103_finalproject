import express from "express";
import session from "express-session";
import cors from "cors";
import passport from "passport";
import path from "path";
import { fileURLToPath } from "url";

import routes from "./routes/index.js";
import { configurePassport } from "./config/passport.js";
import { NODE_ENV, SESSION_SECRET, CLIENT_URL, PORT } from "./config/env.js";
import { notFoundHandler, errorHandler } from "./middleware/errorHandler.js";

const app = express();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

app.use(
  cors({
    origin: CLIENT_URL,
    credentials: true,
  })
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(
  session({
    secret: SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      secure: NODE_ENV === "production",
      sameSite: NODE_ENV === "production" ? "none" : "lax",
      maxAge: 1000 * 60 * 60 * 24 * 7, // 7 days
    },
  })
);

configurePassport();
app.use(passport.initialize());
app.use(passport.session());

app.use("/api", routes);

app.get("/health", (req, res) => {
  res.json({ ok: true });
});

const publicPath = path.join(__dirname, "public");
app.use(express.static(publicPath));

app.get("/*splat", (req, res, next) => {
  if (req.path.startsWith("/api")) {
    return next();
  }

  res.sendFile(path.join(publicPath, "index.html"));
});

app.use(notFoundHandler);
app.use(errorHandler);

app.listen(PORT, () => {
  console.log(
    `Server listening on http://localhost:${PORT} in ${NODE_ENV} mode`
  );
});
