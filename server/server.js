import express from "express";
import session from "express-session";
import cors from "cors";
import passport from "passport";
import routes from "./routes/index.js";
import { configurePassport } from "./config/passport.js";
import { NODE_ENV, SESSION_SECRET, CLIENT_URL, PORT } from "./config/env.js";
import { notFoundHandler, errorHandler } from "./middleware/errorHandler.js";

const app = express();

app.use(
  cors({
    origin: CLIENT_URL,
    credentials: true,
  })
);

app.use(express.json());

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

app.use(notFoundHandler);
app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`Server listening on http://localhost:${PORT}`);
});
