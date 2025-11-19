import { API_BASE_URL } from "./apiConfig";
import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth0 } from "@auth0/auth0-react";

export default function EditQuizPage() {
  const { id: quizId } = useParams();
  const navigate = useNavigate();
  const { getAccessTokenSilently } = useAuth0();

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("");
  const [visibility, setVisibility] = useState("PUBLIC");
  const [cards, setCards] = useState([{ question: "", answer: "" }]);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Load quiz + cards on mount
  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        setError("");

        const token = await getAccessTokenSilently({
          audience: import.meta.env.VITE_AUTH0_AUDIENCE,
        });

        // 1) Get quiz meta
        const quizRes = await fetch(
          `${API_BASE_URL}/api/quizzies/${quizId}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (!quizRes.ok) {
          const errData = await quizRes.json().catch(() => ({}));
          throw new Error(
            errData.error || `Failed to load quiz (${quizRes.status})`
          );
        }

        const quiz = await quizRes.json();

        setTitle(quiz.title || "");
        setDescription(quiz.description || "");
        setCategory(quiz.category || "");
        setVisibility(quiz.visibility || "PUBLIC");

        // 2) Get cards
        const cardsRes = await fetch(
          `${API_BASE_URL}/api/cards/${quizId}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (!cardsRes.ok) {
          const errData = await cardsRes.json().catch(() => ({}));
          throw new Error(
            errData.error || `Failed to load cards (${cardsRes.status})`
          );
        }

        const cardRows = await cardsRes.json();

        if (cardRows.length === 0) {
          setCards([{ question: "", answer: "" }]);
        } else {
          setCards(
            cardRows
              .sort((a, b) => (a.order || 0) - (b.order || 0))
              .map((c) => ({
                question: c.question || "",
                answer: c.answer || "",
                order: c.order ?? null,
              }))
          );
        }
      } catch (e) {
        console.error(e);
        setError(e.message || "Failed to load quiz for editing.");
      } finally {
        setLoading(false);
      }
    })();
  }, [quizId, getAccessTokenSilently]);

  const handleCardChange = (index, field, value) => {
    setCards((prev) => {
      const next = [...prev];
      next[index] = { ...next[index], [field]: value };
      return next;
    });
  };

  const addCard = () => {
    setCards((prev) => [...prev, { question: "", answer: "" }]);
  };

  const removeCard = (index) => {
    setCards((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setSuccess("");
    setError("");

    if (!title.trim()) {
      setError("Title is required.");
      setSaving(false);
      return;
    }

    const nonEmptyCards = cards.filter(
      (c) => c.question.trim() && c.answer.trim()
    );
    if (nonEmptyCards.length === 0) {
      setError("Please keep at least one card with a question and an answer.");
      setSaving(false);
      return;
    }

    try {
      const token = await getAccessTokenSilently({
        audience: import.meta.env.VITE_AUTH0_AUDIENCE,
      });

      // 1) Update quiz metadata
      const quizRes = await fetch(
        `${API_BASE_URL}/api/quizzies/${quizId}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            title: title.trim(),
            description: description.trim() || null,
            category: category.trim() || null,
            visibility,
          }),
        }
      );

      if (!quizRes.ok) {
        const errData = await quizRes.json().catch(() => ({}));
        throw new Error(
          errData.error || `Failed to update quiz (${quizRes.status})`
        );
      }

      // 2) Replace cards
      const cardsBody = {
        cards: nonEmptyCards.map((card, index) => ({
          question: card.question.trim(),
          answer: card.answer.trim(),
          order: index + 1,
        })),
      };

      const cardsRes = await fetch(
        `${API_BASE_URL}/api/quizzies/${quizId}/cards`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(cardsBody),
        }
      );

      if (!cardsRes.ok) {
        const errData = await cardsRes.json().catch(() => ({}));
        throw new Error(
          errData.error || `Failed to update cards (${cardsRes.status})`
        );
      }

      setSuccess("Quiz updated successfully ✅");
    } catch (e) {
      console.error(e);
      setError(e.message || "Something went wrong while updating your quiz.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="loading-state" style={{ marginTop: "1.5rem" }}>
        <div className="loading-text">Loading quiz...</div>
      </div>
    );
  }

  if (error && !title) {
    return (
      <div
        style={{
          marginTop: "1.5rem",
          padding: "1rem 1.2rem",
          borderRadius: "10px",
          backgroundColor: "#2d313c",
        }}
      >
        <div style={{ color: "#feb2b2", marginBottom: "0.75rem" }}>{error}</div>
        <button
          type="button"
          className="button login"
          style={{ padding: "0.5rem 1.2rem", fontSize: "0.95rem" }}
          onClick={() => navigate("/dashboard")}
        >
          Back to dashboard
        </button>
      </div>
    );
  }

  return (
    <div style={{ marginTop: "1.5rem", width: "100%" }}>
      <h2 style={{ fontSize: "1.8rem", marginBottom: "0.5rem" }}>
        Edit Quiz
      </h2>
      <p style={{ color: "#cbd5e0", marginBottom: "1rem" }}>
        Update the quiz details and flashcards, then save your changes.
      </p>

      <form
        onSubmit={handleSubmit}
        style={{ display: "flex", flexDirection: "column", gap: "1rem" }}
      >
        <div>
          <label style={{ display: "block", marginBottom: "0.25rem" }}>
            Title<span style={{ color: "#fc8181" }}> *</span>
          </label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            style={{
              width: "100%",
              padding: "0.6rem 0.8rem",
              borderRadius: "8px",
              border: "1px solid #4a5568",
              backgroundColor: "#1a1e27",
              color: "#e2e8f0",
            }}
            placeholder="e.g. JavaScript Basics"
          />
        </div>

        <div>
          <label style={{ display: "block", marginBottom: "0.25rem" }}>
            Description
          </label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={3}
            style={{
              width: "100%",
              padding: "0.6rem 0.8rem",
              borderRadius: "8px",
              border: "1px solid #4a5568",
              backgroundColor: "#1a1e27",
              color: "#e2e8f0",
              resize: "vertical",
            }}
            placeholder="Short description of this quiz..."
          />
        </div>

        <div style={{ display: "flex", gap: "1rem", flexWrap: "wrap" }}>
          <div style={{ flex: 1, minWidth: "180px" }}>
            <label style={{ display: "block", marginBottom: "0.25rem" }}>
              Category
            </label>
            <input
              type="text"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              style={{
                width: "100%",
                padding: "0.6rem 0.8rem",
                borderRadius: "8px",
                border: "1px solid #4a5568",
                backgroundColor: "#1a1e27",
                color: "#e2e8f0",
              }}
              placeholder="e.g. Math, JS, PE Exam..."
            />
          </div>

          <div style={{ minWidth: "160px" }}>
            <label style={{ display: "block", marginBottom: "0.25rem" }}>
              Visibility
            </label>
            <select
              value={visibility}
              onChange={(e) => setVisibility(e.target.value)}
              style={{
                width: "100%",
                padding: "0.6rem 0.8rem",
                borderRadius: "8px",
                border: "1px solid #4a5568",
                backgroundColor: "#1a1e27",
                color: "#e2e8f0",
              }}
            >
              <option value="PUBLIC">Public (shown on home)</option>
              <option value="PRIVATE">Private (only you)</option>
            </select>
          </div>
        </div>

        <div
          style={{
            marginTop: "1rem",
            padding: "1rem",
            borderRadius: "12px",
            backgroundColor: "#2d313c",
            border: "1px solid rgba(255,255,255,0.05)",
          }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: "0.5rem",
            }}
          >
            <h3 style={{ margin: 0, fontSize: "1.2rem" }}>Cards</h3>
            <button
              type="button"
              className="button login"
              style={{ padding: "0.4rem 1rem", fontSize: "0.9rem" }}
              onClick={addCard}
            >
              + Add Card
            </button>
          </div>

          {cards.map((card, index) => (
            <div
              key={index}
              style={{
                marginTop: "0.75rem",
                padding: "0.75rem",
                borderRadius: "10px",
                backgroundColor: "#1a1e27",
                border: "1px solid #4a5568",
              }}
            >
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  marginBottom: "0.5rem",
                }}
              >
                <span style={{ fontWeight: 500 }}>Card {index + 1}</span>
                {cards.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeCard(index)}
                    style={{
                      background: "transparent",
                      border: "none",
                      color: "#fc8181",
                      cursor: "pointer",
                      fontSize: "0.9rem",
                    }}
                  >
                    Remove
                  </button>
                )}
              </div>

              <div style={{ marginBottom: "0.5rem" }}>
                <label style={{ display: "block", marginBottom: "0.25rem" }}>
                  Question
                </label>
                <input
                  type="text"
                  value={card.question}
                  onChange={(e) =>
                    handleCardChange(index, "question", e.target.value)
                  }
                  style={{
                    width: "100%",
                    padding: "0.5rem 0.7rem",
                    borderRadius: "8px",
                    border: "1px solid #4a5568",
                    backgroundColor: "#111827",
                    color: "#e2e8f0",
                  }}
                  placeholder="Front of the card..."
                />
              </div>

              <div>
                <label style={{ display: "block", marginBottom: "0.25rem" }}>
                  Answer
                </label>
                <textarea
                  rows={2}
                  value={card.answer}
                  onChange={(e) =>
                    handleCardChange(index, "answer", e.target.value)
                  }
                  style={{
                    width: "100%",
                    padding: "0.5rem 0.7rem",
                    borderRadius: "8px",
                    border: "1px solid #4a5568",
                    backgroundColor: "#111827",
                    color: "#e2e8f0",
                    resize: "vertical",
                  }}
                  placeholder="Back of the card..."
                />
              </div>
            </div>
          ))}
        </div>

        {error && (
          <div
            style={{
              marginTop: "0.5rem",
              padding: "0.6rem 0.8rem",
              borderRadius: "8px",
              backgroundColor: "#c53030",
              color: "#fff",
            }}
          >
            {error}
          </div>
        )}

        {success && (
          <div
            style={{
              marginTop: "0.5rem",
              padding: "0.6rem 0.8rem",
              borderRadius: "8px",
              backgroundColor: "#38a169",
              color: "#1a202c",
            }}
          >
            {success}
          </div>
        )}

        <div
          style={{
            display: "flex",
            gap: "0.75rem",
            marginTop: "0.75rem",
            flexWrap: "wrap",
          }}
        >
          <button
            type="submit"
            className="button login"
            disabled={saving}
            style={{ padding: "0.6rem 1.4rem", fontSize: "0.95rem" }}
          >
            {saving ? "Saving..." : "Save Changes"}
          </button>

          <button
            type="button"
            className="button logout"
            style={{
              padding: "0.6rem 1.4rem",
              fontSize: "0.95rem",
              backgroundColor: "#4a5568",
              color: "#edf2f7",
            }}
            onClick={() => navigate("/dashboard")}
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}
