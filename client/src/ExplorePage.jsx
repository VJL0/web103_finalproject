import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth0 } from "@auth0/auth0-react";

export default function ExplorePage() {
  const navigate = useNavigate();
  const {
    isAuthenticated,
    loginWithRedirect,
    user,
    logout,
  } = useAuth0();

  const [quizzes, setQuizzes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

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
            Flashcards for smarter practice
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
        <section
          style={{
            marginBottom: "1.5rem",
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
              Explore Public Quizzes
            </h1>
            <p style={{ color: "#a0aec0", margin: 0, maxWidth: "520px" }}>
              Browse flashcard-style quizzes created by the community. Log in to
              build your own decks and track your progress.
            </p>
          </div>
        </section>

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
              Be the first to create a quiz! Log in and start building your own
              flashcard decks.
            </div>
          </div>
        )}

        {!loading && quizzes.length > 0 && (
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
              gap: "1rem",
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
      </main>
    </div>
  );
}
