import { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { fetchTriviaQuestions } from "./triviaApi";
import { QUICK_TOPICS } from "./quickTopics";

// Small helper to decode HTML entities from Open Trivia DB
function decodeHtml(html) {
  const txt = document.createElement("textarea");
  txt.innerHTML = html;
  return txt.value;
}

function useQuery() {
  const { search } = useLocation();
  return useMemo(() => new URLSearchParams(search), [search]);
}

export default function QuickPlayPage() {
  const navigate = useNavigate();
  const query = useQuery();

  const topicKey = query.get("topic") || "mixed";
  const amountParam = parseInt(query.get("amount") || "10", 10);
  const difficultyParam = (query.get("difficulty") || "hard").toLowerCase();

  const amount = Number.isNaN(amountParam)
    ? 10
    : Math.min(50, Math.max(10, amountParam));

  const difficulty =
    difficultyParam === "easy" ||
    difficultyParam === "medium" ||
    difficultyParam === "hard"
      ? difficultyParam
      : "hard";

  const topic =
    QUICK_TOPICS.find((t) => t.key === topicKey) ||
    QUICK_TOPICS.find((t) => t.key === "mixed");

  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [showAnswer, setShowAnswer] = useState(false);
  const [score, setScore] = useState(0);

  // Pre-computed choices per question: shuffle correct + incorrect answers
  const [choicesList, setChoicesList] = useState([]);

  useEffect(() => {
    let cancelled = false;

    (async () => {
      try {
        setLoading(true);
        setError("");
        setQuestions([]);
        setChoicesList([]);
        setCurrentIndex(0);
        setSelectedAnswer(null);
        setShowAnswer(false);
        setScore(0);

        const results = await fetchTriviaQuestions({
          amount,
          categoryId: topic.categoryId,
          difficulty,
        });

        if (cancelled) return;

        setQuestions(results);

        // Build shuffled choices for each question
        const allChoices = results.map((q) => {
          const all = [...q.incorrect_answers, q.correct_answer];
          // Simple shuffle
          for (let i = all.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [all[i], all[j]] = [all[j], all[i]];
          }
          return all;
        });

        setChoicesList(allChoices);
      } catch (e) {
        console.error(e);
        if (!cancelled) {
          setError(e.message || "Failed to load trivia questions.");
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [amount, difficulty, topic.categoryId, topicKey]);

  if (loading) {
    return (
      <div
        style={{
          minHeight: "100vh",
          backgroundColor: "#1a1e27",
          color: "#e2e8f0",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <div className="loading-state">
          <div className="loading-text">Loading quiz…</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div
        style={{
          minHeight: "100vh",
          backgroundColor: "#1a1e27",
          color: "#e2e8f0",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          padding: "1rem",
        }}
      >
        <div
          style={{
            maxWidth: "500px",
            width: "100%",
            backgroundColor: "#2d313c",
            borderRadius: "16px",
            padding: "1.5rem",
          }}
        >
          <h2 style={{ marginTop: 0, marginBottom: "0.75rem" }}>Oops!</h2>
          <p style={{ marginBottom: "0.75rem" }}>{error}</p>
          <button
            type="button"
            className="button login"
            style={{ padding: "0.5rem 1.2rem", fontSize: "0.9rem" }}
            onClick={() => navigate("/")}
          >
            Back to topics
          </button>
        </div>
      </div>
    );
  }

  if (questions.length === 0) {
    return (
      <div
        style={{
          minHeight: "100vh",
          backgroundColor: "#1a1e27",
          color: "#e2e8f0",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          padding: "1rem",
        }}
      >
        <div
          style={{
            maxWidth: "500px",
            width: "100%",
            backgroundColor: "#2d313c",
            borderRadius: "16px",
            padding: "1.5rem",
          }}
        >
          <h2 style={{ marginTop: 0, marginBottom: "0.75rem" }}>
            No questions found
          </h2>
          <p style={{ marginBottom: "0.75rem" }}>
            Try reducing the number of questions or choosing a different topic.
          </p>
          <button
            type="button"
            className="button login"
            style={{ padding: "0.5rem 1.2rem", fontSize: "0.9rem" }}
            onClick={() => navigate("/")}
          >
            Back to topics
          </button>
        </div>
      </div>
    );
  }

  const current = questions[currentIndex];
  const choices = choicesList[currentIndex] || [];

  const total = questions.length;
  const isLast = currentIndex === total - 1;

  const handleSelect = (choice) => {
    if (showAnswer) return; // lock once answer is revealed
    setSelectedAnswer(choice);
  };

  const handleCheck = () => {
    if (showAnswer) return;

    setShowAnswer(true);
    if (selectedAnswer === current.correct_answer) {
      setScore((prev) => prev + 1);
    }
  };

  const handleNext = () => {
    if (!showAnswer) {
      // if they skip checking, just move on
      setShowAnswer(false);
    }
    if (!isLast) {
      setCurrentIndex((prev) => prev + 1);
      setSelectedAnswer(null);
      setShowAnswer(false);
    }
  };

  const handleRestart = () => {
    // Just reload with same query params
    window.location.reload();
  };

  const percent = Math.round((score / total) * 100);

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
      {/* Simple top bar */}
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
        <div>
          <div style={{ fontSize: "1.4rem", fontWeight: 700 }}>QuizPath</div>
          <div style={{ fontSize: "0.9rem", color: "#a0aec0" }}>
            Quick Trivia · {topic.label} · {difficulty.toUpperCase()}
          </div>
        </div>
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
          Back to topics
        </button>
      </header>

      <main
        style={{
          flex: 1,
          padding: "1.5rem 2rem 2rem",
          maxWidth: "900px",
          width: "100%",
          margin: "0 auto",
        }}
      >
        {/* Progress + score */}
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
            <div
              style={{
                fontSize: "0.95rem",
                color: "#a0aec0",
                marginBottom: "0.2rem",
              }}
            >
              Question
            </div>
            <div style={{ fontSize: "1.2rem", fontWeight: 600 }}>
              {currentIndex + 1} / {total}
            </div>
          </div>

          <div>
            <div
              style={{
                fontSize: "0.95rem",
                color: "#a0aec0",
                marginBottom: "0.2rem",
              }}
            >
              Score
            </div>
            <div style={{ fontSize: "1.2rem", fontWeight: 600 }}>
              {score} / {total} ({percent}%)
            </div>
          </div>
        </div>

        {/* Question card */}
        <div
          style={{
            backgroundColor: "#262a33",
            borderRadius: "16px",
            padding: "1.5rem",
            boxShadow: "0 20px 40px rgba(0,0,0,0.5)",
          }}
        >
          <div
            style={{
              fontSize: "0.85rem",
              color: "#a0aec0",
              marginBottom: "0.5rem",
            }}
          >
            Category: {decodeHtml(current.category)} · Difficulty:{" "}
            {current.difficulty.toUpperCase()}
          </div>

          <h2
            style={{
              fontSize: "1.4rem",
              marginTop: 0,
              marginBottom: "1rem",
              lineHeight: 1.4,
            }}
          >
            {decodeHtml(current.question)}
          </h2>

          {/* Choices */}
          <div style={{ display: "flex", flexDirection: "column", gap: "0.6rem" }}>
            {choices.map((choice) => {
              const isSelected = selectedAnswer === choice;
              const isCorrect = choice === current.correct_answer;

              let bg = "#2d3748";
              let border = "1px solid transparent";
              if (showAnswer) {
                if (isCorrect) {
                  bg = "#276749"; // green
                  border = "1px solid #48bb78";
                } else if (isSelected && !isCorrect) {
                  bg = "#742a2a"; // red-ish
                  border = "1px solid #f56565";
                }
              } else if (isSelected) {
                bg = "#3182ce"; // blue-ish
                border = "1px solid #63b3ed";
              }

              return (
                <button
                  key={choice}
                  type="button"
                  onClick={() => handleSelect(choice)}
                  style={{
                    textAlign: "left",
                    padding: "0.7rem 0.9rem",
                    borderRadius: "10px",
                    border,
                    backgroundColor: bg,
                    color: "#e2e8f0",
                    cursor: "pointer",
                    fontSize: "0.95rem",
                  }}
                >
                  {decodeHtml(choice)}
                </button>
              );
            })}
          </div>

          {/* Controls */}
          <div
            style={{
              display: "flex",
              gap: "0.75rem",
              marginTop: "1.5rem",
              flexWrap: "wrap",
            }}
          >
            {!showAnswer && (
              <button
                type="button"
                className="button login"
                style={{
                  padding: "0.6rem 1.4rem",
                  fontSize: "0.95rem",
                }}
                onClick={handleCheck}
                disabled={!selectedAnswer}
              >
                Check answer
              </button>
            )}

            {showAnswer && !isLast && (
              <button
                type="button"
                className="button login"
                style={{
                  padding: "0.6rem 1.4rem",
                  fontSize: "0.95rem",
                }}
                onClick={handleNext}
              >
                Next question
              </button>
            )}

            {showAnswer && isLast && (
              <button
                type="button"
                className="button login"
                style={{
                  padding: "0.6rem 1.4rem",
                  fontSize: "0.95rem",
                }}
                onClick={handleRestart}
              >
                Restart quiz
              </button>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
