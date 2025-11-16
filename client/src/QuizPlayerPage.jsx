import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth0 } from "@auth0/auth0-react";

export default function QuizPlayerPage() {
  const { id: quizId } = useParams();
  const navigate = useNavigate();
  const { getAccessTokenSilently } = useAuth0();

  const [quiz, setQuiz] = useState(null);
  const [cards, setCards] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [correctCount, setCorrectCount] = useState(0);
  const [wrongCount, setWrongCount] = useState(0);

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
          `http://localhost:3000/api/quizzies/${quizId}`,
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

        const quizData = await quizRes.json();
        setQuiz(quizData);

        // 2) Get cards
        const cardsRes = await fetch(
          `http://localhost:3000/api/cards/${quizId}`,
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
          setCards([]);
        } else {
          setCards(
            cardRows
              .sort((a, b) => (a.order || 0) - (b.order || 0))
              .map((c) => ({
                id: c.id,
                question: c.question,
                answer: c.answer,
                order: c.order,
              }))
          );
        }

        setCurrentIndex(0);
        setIsFlipped(false);
        setCorrectCount(0);
        setWrongCount(0);
      } catch (e) {
        console.error(e);
        setError(e.message || "Failed to load quiz.");
      } finally {
        setLoading(false);
      }
    })();
  }, [quizId, getAccessTokenSilently]);

  const totalCards = cards.length;
  const currentCard = totalCards > 0 ? cards[currentIndex] : null;
  const answered = correctCount + wrongCount;
  const progress =
    totalCards > 0 ? Math.round((answered / totalCards) * 100) : 0;

  const handleFlip = () => {
    setIsFlipped((prev) => !prev);
  };

  const handleNext = () => {
    if (totalCards === 0) return;
    setCurrentIndex((prev) => (prev + 1) % totalCards);
    setIsFlipped(false);
  };

  const handlePrev = () => {
    if (totalCards === 0) return;
    setCurrentIndex((prev) =>
      prev === 0 ? totalCards - 1 : prev - 1
    );
    setIsFlipped(false);
  };

  const handleMark = (isCorrect) => {
    if (isCorrect) {
      setCorrectCount((c) => c + 1);
    } else {
      setWrongCount((c) => c + 1);
    }
    // Move to next card automatically if not last answered
    if (currentIndex < totalCards - 1) {
      setCurrentIndex((prev) => prev + 1);
      setIsFlipped(false);
    }
  };

  if (loading) {
    return (
      <div className="loading-state" style={{ marginTop: "1.5rem" }}>
        <div className="loading-text">Loading quiz…</div>
      </div>
    );
  }

  if (error) {
    return (
      <div
        style={{
          marginTop: "1.5rem",
          padding: "1rem 1.2rem",
          borderRadius: "10px",
          backgroundColor: "#2d313c",
        }}
      >
        <div style={{ color: "#feb2b2", marginBottom: "0.75rem" }}>
          {error}
        </div>
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

  if (!currentCard || totalCards === 0) {
    return (
      <div
        style={{
          marginTop: "1.5rem",
          padding: "1rem 1.2rem",
          borderRadius: "10px",
          backgroundColor: "#2d313c",
        }}
      >
        <div style={{ marginBottom: "0.75rem" }}>
          This quiz has no cards yet.
        </div>
        <button
          type="button"
          className="button login"
          style={{ padding: "0.5rem 1.2rem", fontSize: "0.95rem" }}
          onClick={() => navigate(`/dashboard/edit/${quizId}`)}
        >
          Add cards to this quiz
        </button>
      </div>
    );
  }

  return (
    <div style={{ marginTop: "1.5rem", width: "100%" }}>
      <div
        style={{
          marginBottom: "1rem",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
          gap: "1rem",
          flexWrap: "wrap",
        }}
      >
        <div>
          <h2 style={{ fontSize: "1.8rem", marginBottom: "0.25rem" }}>
            {quiz?.title || "Quiz"}
          </h2>
          {quiz?.category && (
            <div style={{ fontSize: "0.9rem", color: "#a0aec0" }}>
              Category: {quiz.category}
            </div>
          )}
          {quiz?.description && (
            <div
              style={{
                marginTop: "0.4rem",
                fontSize: "0.9rem",
                color: "#cbd5e0",
              }}
            >
              {quiz.description}
            </div>
          )}
        </div>

        <div
          style={{
            minWidth: "180px",
            padding: "0.6rem 0.9rem",
            borderRadius: "10px",
            backgroundColor: "#2d313c",
            border: "1px solid rgba(255,255,255,0.08)",
            fontSize: "0.85rem",
          }}
        >
          <div style={{ marginBottom: "0.3rem" }}>
            Card {currentIndex + 1} of {totalCards}
          </div>
          <div>Correct: {correctCount}</div>
          <div>Incorrect: {wrongCount}</div>
          <div style={{ marginTop: "0.3rem" }}>
            <div
              style={{
                height: "6px",
                borderRadius: "999px",
                backgroundColor: "#1a202c",
                overflow: "hidden",
              }}
            >
              <div
                style={{
                  width: `${progress}%`,
                  height: "100%",
                  backgroundColor: "#63b3ed",
                  transition: "width 0.2s ease",
                }}
              />
            </div>
            <div
              style={{
                marginTop: "0.15rem",
                textAlign: "right",
                color: "#a0aec0",
              }}
            >
              {progress}% done
            </div>
          </div>
        </div>
      </div>

      {/* Flip card */}
      <div
        style={{
          perspective: "1000px",
          marginBottom: "1rem",
        }}
      >
        <div
          onClick={handleFlip}
          style={{
            position: "relative",
            width: "100%",
            minHeight: "180px",
            padding: "1.5rem",
            borderRadius: "16px",
            backgroundColor: "#2d313c",
            border: "1px solid rgba(255,255,255,0.12)",
            boxShadow: "0 15px 35px rgba(0,0,0,0.45)",
            cursor: "pointer",
            transformStyle: "preserve-3d",
            transition: "transform 0.5s ease",
            transform: isFlipped ? "rotateY(180deg)" : "rotateY(0deg)",
          }}
        >
          {/* Front = Question */}
          <div
            style={{
              position: "absolute",
              inset: 0,
              padding: "1.5rem",
              backfaceVisibility: "hidden",
              display: "flex",
              flexDirection: "column",
              justifyContent: "center",
            }}
          >
            <div
              style={{
                fontSize: "0.85rem",
                color: "#a0aec0",
                marginBottom: "0.5rem",
              }}
            >
              Question
            </div>
            <div style={{ fontSize: "1.3rem", lineHeight: 1.5 }}>
              {currentCard.question}
            </div>
            <div
              style={{
                marginTop: "1rem",
                fontSize: "0.8rem",
                color: "#718096",
              }}
            >
              Click the card to flip and see the answer.
            </div>
          </div>

          {/* Back = Answer */}
          <div
            style={{
              position: "absolute",
              inset: 0,
              padding: "1.5rem",
              backfaceVisibility: "hidden",
              transform: "rotateY(180deg)",
              display: "flex",
              flexDirection: "column",
              justifyContent: "center",
            }}
          >
            <div
              style={{
                fontSize: "0.85rem",
                color: "#a0aec0",
                marginBottom: "0.5rem",
              }}
            >
              Answer
            </div>
            <div style={{ fontSize: "1.2rem", lineHeight: 1.6 }}>
              {currentCard.answer}
            </div>
            <div
              style={{
                marginTop: "1rem",
                fontSize: "0.8rem",
                color: "#718096",
              }}
            >
              Click again to flip back.
            </div>
          </div>
        </div>
      </div>

      {/* Controls */}
      <div
        style={{
          display: "flex",
          gap: "0.75rem",
          flexWrap: "wrap",
          alignItems: "center",
        }}
      >
        <button
          type="button"
          className="button logout"
          style={{
            padding: "0.5rem 1.2rem",
            fontSize: "0.9rem",
            backgroundColor: "#4a5568",
            color: "#edf2f7",
          }}
          onClick={handlePrev}
        >
          Previous
        </button>

        <button
          type="button"
          className="button login"
          style={{ padding: "0.5rem 1.4rem", fontSize: "0.9rem" }}
          onClick={handleNext}
        >
          Next
        </button>

        <button
          type="button"
          className="button login"
          style={{
            padding: "0.5rem 1.3rem",
            fontSize: "0.9rem",
            backgroundColor: "#48bb78",
          }}
          onClick={() => handleMark(true)}
        >
          I got it right
        </button>

        <button
          type="button"
          className="button logout"
          style={{
            padding: "0.5rem 1.3rem",
            fontSize: "0.9rem",
            backgroundColor: "#e53e3e",
            color: "#1a202c",
          }}
          onClick={() => handleMark(false)}
        >
          I got it wrong
        </button>

        <button
          type="button"
          style={{
            marginLeft: "auto",
            padding: "0.4rem 1rem",
            fontSize: "0.85rem",
            borderRadius: "999px",
            border: "1px solid #4a5568",
            backgroundColor: "transparent",
            color: "#e2e8f0",
            cursor: "pointer",
          }}
          onClick={() => navigate("/dashboard")}
        >
          Back to dashboard
        </button>
      </div>
    </div>
  );
}
