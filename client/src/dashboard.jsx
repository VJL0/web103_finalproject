// client/src/Dashboard.jsx
import { NavLink, Routes, Route, Navigate, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { useAuth0 } from "@auth0/auth0-react";
import Profile from "./Profile";
import CreateQuizPage from "./CreateQuizPage";

function DashboardHome() {
  const { getAccessTokenSilently } = useAuth0();
  const [quizzes, setQuizzes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        setError("");

        const token = await getAccessTokenSilently({
          audience: import.meta.env.VITE_AUTH0_AUDIENCE,
        });

        const res = await fetch("http://localhost:3000/api/quizzies/mine", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!res.ok) {
          const errData = await res.json().catch(() => ({}));
          throw new Error(errData.error || `Failed to load quizzes (${res.status})`);
        }

        const data = await res.json();
        setQuizzes(data);
      } catch (e) {
        console.error(e);
        setError(e.message || "Failed to load your quizzes.");
      } finally {
        setLoading(false);
      }
    })();
  }, [getAccessTokenSilently]);

  const total = quizzes.length;
  const totalPublic = quizzes.filter((q) => q.visibility === "PUBLIC").length;
  const totalPrivate = quizzes.filter((q) => q.visibility === "PRIVATE").length;

  return (
    <div style={{ marginTop: "1.5rem", width: "100%" }}>
      <h2 style={{ fontSize: "1.8rem", marginBottom: "0.5rem" }}>Your Quizzes</h2>
      <p style={{ color: "#cbd5e0", marginBottom: "1rem" }}>
        Create, manage, and practice your flashcard-style quizzes.
      </p>

      {/* Stats row */}
      <div
        style={{
          display: "flex",
          gap: "1rem",
          marginBottom: "1.5rem",
          flexWrap: "wrap",
        }}
      >
        <div
          style={{
            flex: "1 1 160px",
            padding: "0.9rem 1rem",
            borderRadius: "12px",
            backgroundColor: "#2d313c",
            border: "1px solid rgba(255,255,255,0.05)",
          }}
        >
          <div style={{ fontSize: "0.9rem", color: "#a0aec0" }}>Total Quizzes</div>
          <div style={{ fontSize: "1.6rem", fontWeight: 700 }}>{total}</div>
        </div>
        <div
          style={{
            flex: "1 1 160px",
            padding: "0.9rem 1rem",
            borderRadius: "12px",
            backgroundColor: "#2d313c",
            border: "1px solid rgba(255,255,255,0.05)",
          }}
        >
          <div style={{ fontSize: "0.9rem", color: "#a0aec0" }}>Public</div>
          <div style={{ fontSize: "1.6rem", fontWeight: 700 }}>{totalPublic}</div>
        </div>
        <div
          style={{
            flex: "1 1 160px",
            padding: "0.9rem 1rem",
            borderRadius: "12px",
            backgroundColor: "#2d313c",
            border: "1px solid rgba(255,255,255,0.05)",
          }}
        >
          <div style={{ fontSize: "0.9rem", color: "#a0aec0" }}>Private</div>
          <div style={{ fontSize: "1.6rem", fontWeight: 700 }}>{totalPrivate}</div>
        </div>
      </div>

      {loading && (
        <div className="loading-state">
          <div className="loading-text">Loading your quizzes...</div>
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
            You don’t have any quizzes yet.
          </div>
          <button
            type="button"
            className="button login"
            style={{ padding: "0.5rem 1.2rem", fontSize: "0.95rem" }}
            onClick={() => navigate("/dashboard/create")}
          >
            + Create your first quiz
          </button>
        </div>
      )}

      {!loading && quizzes.length > 0 && (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
            gap: "1rem",
          }}
        >
          {quizzes.map((quiz) => (
            <div
              key={quiz.id}
              style={{
                padding: "1rem 1.1rem",
                borderRadius: "14px",
                backgroundColor: "#2d313c",
                border: "1px solid rgba(255,255,255,0.06)",
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
                    marginBottom: "0.15rem",
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
                  marginTop: "0.25rem",
                  fontSize: "0.85rem",
                  color: "#a0aec0",
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <span>{quiz.card_count} card(s)</span>
                <span
                  style={{
                    padding: "0.15rem 0.55rem",
                    borderRadius: "999px",
                    fontSize: "0.75rem",
                    backgroundColor:
                      quiz.visibility === "PUBLIC" ? "#276749" : "#4a5568",
                    color: "#f7fafc",
                    textTransform: "uppercase",
                    letterSpacing: "0.05em",
                  }}
                >
                  {quiz.visibility}
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
                  onClick={() => navigate(`/dashboard/play/${quiz.id}`)}
                >
                  Take quiz
                </button>

                <button
                  type="button"
                  style={{
                    flex: 1,
                    padding: "0.5rem 0.8rem",
                    fontSize: "0.9rem",
                    borderRadius: "10px",
                    border: "1px solid #4a5568",
                    backgroundColor: "transparent",
                    color: "#e2e8f0",
                    cursor: "pointer",
                  }}
                  onClick={() => navigate(`/dashboard/edit/${quiz.id}`)}
                >
                  Edit
                </button>

                <button
                  type="button"
                  style={{
                    padding: "0.5rem 0.8rem",
                    fontSize: "0.9rem",
                    borderRadius: "10px",
                    border: "1px solid #c53030",
                    backgroundColor: "transparent",
                    color: "#feb2b2",
                    cursor: "pointer",
                  }}
                  onClick={() => {
                    // we’ll implement delete in a later step
                    alert("Delete quiz coming soon 🙂");
                  }}
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function ProfilePage() {
  return (
    <div style={{ marginTop: "1.5rem" }}>
      <h2 style={{ fontSize: "1.8rem", marginBottom: "1rem" }}>Your Profile</h2>
      <div className="profile-card">
        <Profile />
      </div>
    </div>
  );
}

export default function Dashboard({ onLogout }) {
  return (
    <div className="app-container">
      <div className="main-card-wrapper" style={{ width: "100%", maxWidth: "900px" }}>
        <header
          style={{
            width: "100%",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: "1.5rem",
          }}
        >
          <div>
            <h1 className="main-title" style={{ marginBottom: "0.25rem" }}>
              QuizPath Dashboard
            </h1>
            <div style={{ color: "#a0aec0" }}>Create, manage and take quiz cards.</div>
          </div>

          <button className="button logout" onClick={onLogout}>
            Log Out
          </button>
        </header>

        <nav
          style={{
            display: "flex",
            gap: "1rem",
            marginBottom: "1rem",
            borderBottom: "1px solid rgba(255,255,255,0.1)",
            paddingBottom: "0.5rem",
          }}
        >
          <NavLink
            to="/dashboard"
            end
            style={({ isActive }) => ({
              padding: "0.5rem 1rem",
              borderRadius: "8px",
              textDecoration: "none",
              color: isActive ? "#1a1e27" : "#e2e8f0",
              backgroundColor: isActive ? "#63b3ed" : "transparent",
              fontWeight: 500,
            })}
          >
            Home
          </NavLink>

          <NavLink
            to="/dashboard/create"
            style={({ isActive }) => ({
              padding: "0.5rem 1rem",
              borderRadius: "8px",
              textDecoration: "none",
              color: isActive ? "#1a1e27" : "#e2e8f0",
              backgroundColor: isActive ? "#63b3ed" : "transparent",
              fontWeight: 500,
            })}
          >
            Create Quiz
          </NavLink>

          <NavLink
            to="/dashboard/profile"
            style={({ isActive }) => ({
              padding: "0.5rem 1rem",
              borderRadius: "8px",
              textDecoration: "none",
              color: isActive ? "#1a1e27" : "#e2e8f0",
              backgroundColor: isActive ? "#63b3ed" : "transparent",
              fontWeight: 500,
            })}
          >
            Profile
          </NavLink>
        </nav>

        <main style={{ width: "100%" }}>
          <Routes>
            <Route path="/" element={<DashboardHome />} />
            <Route path="/create" element={<CreateQuizPage />} />
            <Route path="/profile" element={<ProfilePage />} />
            {/* We’ll implement these later */}
            <Route path="/play/:id" element={<div style={{ marginTop: "1.5rem" }}>Quiz player coming soon…</div>} />
            <Route path="/edit/:id" element={<div style={{ marginTop: "1.5rem" }}>Edit quiz coming soon…</div>} />
            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </Routes>
        </main>
      </div>
    </div>
  );
}
