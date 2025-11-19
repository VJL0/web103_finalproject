import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth0 } from "@auth0/auth0-react";
import { QUICK_TOPICS } from "./quickTopics";

export default function ExplorePage() {
  const navigate = useNavigate();
  const { isAuthenticated, loginWithRedirect, user, logout } = useAuth0();

  const [quizzes, setQuizzes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Per-topic settings: { [topicKey]: { amount, difficulty } }
  const [topicSettings, setTopicSettings] = useState(() => {
    const initial = {};
    QUICK_TOPICS.forEach((t) => {
      initial[t.key] = {
        amount: 10,
        difficulty: "hard",
      };
    });
    return initial;
  });

  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        setError("");

        const res = await fetch("http://localhost:3000/api/quizzies/public");

        if (!res.ok) {
          const errData = await res.json().catch(() => ({}));
          throw new Error(
            errData.error || `Failed to load public quizzes (${res.status})`
          );
        }

        const data = await res.json();
        setQuizzes(data);
      } catch (e) {
        console.error(e);
        setError(e.message || "Failed to load public quizzes.");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const handleAmountChange = (topicKey, value) => {
    const amount = Math.min(50, Math.max(10, Number(value) || 10));
    setTopicSettings((prev) => ({
      ...prev,
      [topicKey]: {
        ...prev[topicKey],
        amount,
      },
    }));
  };

  const handleDifficultyChange = (topicKey, value) => {
    const v = value.toLowerCase();
    const allowed = ["easy", "medium", "hard"];
    const difficulty = allowed.includes(v) ? v : "hard";
    setTopicSettings((prev) => ({
      ...prev,
      [topicKey]: {
        ...prev[topicKey],
        difficulty,
      },
    }));
  };

  const handlePlayNow = (topicKey) => {
    const settings = topicSettings[topicKey] || { amount: 10, difficulty: "hard" };
    const params = new URLSearchParams();
    params.set("topic", topicKey);
    params.set("amount", String(settings.amount));
    params.set("difficulty", settings.difficulty);
    navigate(`/quick-play?${params.toString()}`);
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        backgroundColor: "#1a1e27",
        color: "#e2e8f0",
        display: "flex",
        flexDirection: "column",
      }}
    >
      {/* Top nav */}
      <header
        style={{
          padding: "0.9rem 2rem",
          borderBottom: "1px solid rgba(255,255,255,0.08)",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: "1rem",
        }}
      >
        <div
          style={{ display: "flex", alignItems: "baseline", gap: "0.5rem" }}
        >
          <div style={{ fontSize: "1.4rem", fontWeight: 700 }}>QuizPath</div>
          <div style={{ fontSize: "0.9rem", color: "#a0aec0" }}>
            Flashcards & Quick Trivia
          </div>
        </div>

        <div
          style={{
            display: "flex",
            gap: "0.75rem",
            alignItems: "center",
            flexWrap: "wrap",
            justifyContent: "flex-end",
          }}
        >
          <button
            type="button"
            style={{
              background: "transparent",
              border: "none",
              color: "#e2e8f0",
              cursor: "pointer",
              fontSize: "0.9rem",
            }}
            onClick={() => navigate("/")}
          >
            Explore
          </button>

          {isAuthenticated && (
            <button
              type="button"
              style={{
                background: "transparent",
                border: "none",
                color: "#e2e8f0",
                cursor: "pointer",
                fontSize: "0.9rem",
              }}
              onClick={() => navigate("/dashboard")}
            >
              Dashboard
            </button>
          )}

          {isAuthenticated && (
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "0.5rem",
                padding: "0.2rem 0.6rem",
                borderRadius: "999px",
                backgroundColor: "#2d313c",
              }}
            >
              {user?.picture && (
                <img
                  src={user.picture}
                  alt={user.name || "User"}
                  style={{
                    width: "28px",
                    height: "28px",
                    borderRadius: "50%",
                    border: "2px solid #63b3ed",
                    objectFit: "cover",
                  }}
                />
              )}
              <span
                style={{ fontSize: "0.85rem", color: "#cbd5e0", whiteSpace: "nowrap" }}
              >
                Signed in as{" "}
                <span style={{ fontWeight: 600 }}>
                  {user?.name || user?.email || "User"}
                </span>
              </span>
            </div>
          )}

          {!isAuthenticated ? (
            <button
              className="button login"
              style={{ padding: "0.45rem 1.2rem", fontSize: "0.9rem" }}
              onClick={() => loginWithRedirect()}
            >
              Log in / Sign up
            </button>
          ) : (
            <button
              className="button logout"
              style={{
                padding: "0.4rem 1rem",
                fontSize: "0.85rem",
                backgroundColor: "#fc8181",
                color: "#1a202c",
              }}
              onClick={() =>
                logout({
                  logoutParams: { returnTo: window.location.origin },
                })
              }
            >
              Log out
            </button>
          )}
        </div>
      </header>

      {/* Main content */}
      <main
        style={{
          flex: 1,
          padding: "1.5rem 2rem 2rem",
          maxWidth: "1200px",
          width: "100%",
          margin: "0 auto",
        }}
      >

                {/* Existing public quizzes section */}
        <section>
          <h2 style={{ fontSize: "1.6rem", marginBottom: "0.4rem" }}>
            Community Quizzes
          </h2>
          <p style={{ color: "#a0aec0", marginBottom: "1rem" }}>
            Public flashcard quizzes created by users. Log in to create your own
            decks.
          </p>

          {loading && (
            <div className="loading-state">
              <div className="loading-text">Loading public quizzes…</div>
            </div>
          )}

          {error && !loading && (
            <div
              style={{
                marginBottom: "1rem",
                padding: "0.7rem 1rem",
                borderRadius: "8px",
                backgroundColor: "#c53030",
                color: "#fff",
              }}
            >
              {error}
            </div>
          )}

          {!loading && !error && quizzes.length === 0 && (
            <div
              style={{
                padding: "1rem 1.2rem",
                borderRadius: "10px",
                backgroundColor: "#2d313c",
                border: "1px dashed rgba(255,255,255,0.2)",
              }}
            >
              <div style={{ marginBottom: "0.5rem", fontWeight: 500 }}>
                No public quizzes yet.
              </div>
              <div style={{ color: "#a0aec0", fontSize: "0.9rem" }}>
                Log in to create and share your own flashcard quizzes with the
                community.
              </div>
            </div>
          )}

          {!loading && quizzes.length > 0 && (
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
                gap: "1rem",
                marginTop: "0.5rem",
              }}
            >
              {quizzes.map((quiz) => (
                <div
                  key={quiz.id}
                  style={{
                    padding: "1rem 1.1rem",
                    borderRadius: "14px",
                    backgroundColor: "#262a33",
                    border: "1px solid rgba(255,255,255,0.08)",
                    display: "flex",
                    flexDirection: "column",
                    gap: "0.5rem",
                  }}
                >
                  <div>
                    <div
                      style={{
                        fontSize: "1.1rem",
                        fontWeight: 600,
                        marginBottom: "0.2rem",
                      }}
                    >
                      {quiz.title}
                    </div>
                    {quiz.category && (
                      <div style={{ fontSize: "0.85rem", color: "#a0aec0" }}>
                        Category: {quiz.category}
                      </div>
                    )}
                  </div>

                  {quiz.description && (
                    <div
                      style={{
                        fontSize: "0.9rem",
                        color: "#cbd5e0",
                        marginTop: "0.25rem",
                      }}
                    >
                      {quiz.description}
                    </div>
                  )}

                  <div
                    style={{
                      fontSize: "0.85rem",
                      color: "#a0aec0",
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      marginTop: "0.3rem",
                    }}
                  >
                    <span>{quiz.card_count} card(s)</span>
                    <span
                      style={{
                        fontSize: "0.8rem",
                        color: "#a0aec0",
                      }}
                    >
                      By {quiz.author_name || "Anonymous"}
                    </span>
                  </div>

                  <div
                    style={{
                      display: "flex",
                      gap: "0.5rem",
                      marginTop: "0.75rem",
                    }}
                  >
                    <button
                      type="button"
                      className="button login"
                      style={{
                        flex: 1,
                        padding: "0.5rem 0.8rem",
                        fontSize: "0.9rem",
                      }}
                      onClick={() => {
                        if (isAuthenticated) {
                          navigate(`/dashboard/play/${quiz.id}`);
                        } else {
                          loginWithRedirect();
                        }
                      }}
                    >
                      Take quiz
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
        {/* Quick trivia topics */}
        <section style={{ marginBottom: "2rem" }}>
          <div
            style={{
              marginBottom: "1rem",
              display: "flex",
              justifyContent: "space-between",
              gap: "1rem",
              flexWrap: "wrap",
            }}
          >
            <div>
              <h1
                style={{
                  fontSize: "2rem",
                  margin: 0,
                  marginBottom: "0.4rem",
                }}
              >
                Quick Trivia Topics
              </h1>
              <p style={{ color: "#a0aec0", margin: 0, maxWidth: "520px" }}>
                Pick a topic, select how many questions you want, choose a difficulty level, and start playing instantly.
              </p>
            </div>
          </div>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
              gap: "1rem",
            }}
          >
            {QUICK_TOPICS.map((topic) => {
              const settings = topicSettings[topic.key] || {
                amount: 10,
                difficulty: "hard",
              };

              return (
                <div
                  key={topic.key}
                  style={{
                    padding: "1rem 1.1rem",
                    borderRadius: "14px",
                    backgroundColor: "#262a33",
                    border: "1px solid rgba(255,255,255,0.08)",
                    display: "flex",
                    flexDirection: "column",
                    gap: "0.6rem",
                  }}
                >
                  <div
                    style={{
                      fontSize: "1.05rem",
                      fontWeight: 600,
                      marginBottom: "0.2rem",
                    }}
                  >
                    {topic.label}
                  </div>

                  <div
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      gap: "0.4rem",
                      fontSize: "0.85rem",
                    }}
                  >
                    <label style={{ color: "#a0aec0" }}>
                      Number of questions
                    </label>
                    <select
                      value={settings.amount}
                      onChange={(e) =>
                        handleAmountChange(topic.key, e.target.value)
                      }
                      style={{
                        padding: "0.35rem 0.5rem",
                        borderRadius: "8px",
                        border: "1px solid #4a5568",
                        backgroundColor: "#1a202c",
                        color: "#e2e8f0",
                        fontSize: "0.9rem",
                      }}
                    >
                      {[10, 15, 20, 25, 30, 40, 50].map((n) => (
                        <option key={n} value={n}>
                          {n}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      gap: "0.4rem",
                      fontSize: "0.85rem",
                    }}
                  >
                    <label style={{ color: "#a0aec0" }}>Difficulty</label>
                    <select
                      value={settings.difficulty}
                      onChange={(e) =>
                        handleDifficultyChange(topic.key, e.target.value)
                      }
                      style={{
                        padding: "0.35rem 0.5rem",
                        borderRadius: "8px",
                        border: "1px solid #4a5568",
                        backgroundColor: "#1a202c",
                        color: "#e2e8f0",
                        fontSize: "0.9rem",
                      }}
                    >
                      <option value="easy">Easy</option>
                      <option value="medium">Medium</option>
                      <option value="hard">Hard</option>
                    </select>
                  </div>

                  <button
                    type="button"
                    className="button login"
                    style={{
                      marginTop: "0.4rem",
                      padding: "0.5rem 0.8rem",
                      fontSize: "0.9rem",
                    }}
                    onClick={() => handlePlayNow(topic.key)}
                  >
                    Play now
                  </button>
                </div>
              );
            })}
          </div>
        </section>

      </main>
    </div>
  );
}
