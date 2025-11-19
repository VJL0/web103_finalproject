import React, { useEffect, useState, useMemo } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { API_BASE_URL } from "../../api/http";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";

function FlashcardsSkeleton() {
  return (
    <div className="max-w-xl mx-auto space-y-4">
      <Skeleton className="h-6 w-48" />
      <Skeleton className="h-4 w-64" />
      <Skeleton className="h-40 w-full" />
    </div>
  );
}

export default function DeckFlashcardsPage() {
  const { deckId } = useParams();
  const navigate = useNavigate();

  const [deck, setDeck] = useState(null);
  const [cards, setCards] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [index, setIndex] = useState(0);
  const [showBack, setShowBack] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setLoading(true);
      setError(null);

      try {
        const res = await fetch(`${API_BASE_URL}/decks/${deckId}`, {
          credentials: "include",
        });

        if (!res.ok) {
          const body = await res.json().catch(() => ({}));
          throw new Error(body.error || "Failed to load deck");
        }

        const data = await res.json();
        if (cancelled) return;

        const sortedCards = (data.cards || [])
          .slice()
          .sort((a, b) => a.position - b.position);

        setDeck(data.deck);
        setCards(sortedCards);
        setIndex(0);
        setShowBack(false);
      } catch (err) {
        if (!cancelled) {
          console.error(err);
          setError(err.message || "Something went wrong.");
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, [deckId]);

  const currentCard = useMemo(
    () => (cards.length > 0 ? cards[index] : null),
    [cards, index]
  );

  function handleFlip() {
    if (!currentCard) return;
    setShowBack((prev) => !prev);
  }

  function handleNext() {
    if (cards.length === 0) return;
    setIndex((prev) => (prev + 1) % cards.length);
    setShowBack(false);
  }

  function handlePrev() {
    if (cards.length === 0) return;
    setIndex((prev) => (prev - 1 + cards.length) % cards.length);
    setShowBack(false);
  }

  function handleRestart() {
    setIndex(0);
    setShowBack(false);
  }

  if (loading) {
    return <FlashcardsSkeleton />;
  }

  if (error) {
    return (
      <div className="max-w-xl mx-auto">
        <Alert variant="destructive">
          <AlertTitle>Could not load deck</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
        <Button
          variant="ghost"
          size="sm"
          className="mt-3"
          onClick={() => navigate(-1)}
        >
          ← Back
        </Button>
      </div>
    );
  }

  if (!deck) {
    return (
      <div className="max-w-xl mx-auto text-sm text-muted-foreground">
        Deck not found.
      </div>
    );
  }

  const hasCards = cards.length > 0;

  return (
    <div className="max-w-xl mx-auto space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between gap-2">
        <div>
          <h1 className="text-xl font-semibold tracking-tight">{deck.title}</h1>
          <p className="text-xs text-muted-foreground">
            Flashcards mode • {cards.length}{" "}
            {cards.length === 1 ? "card" : "cards"}
          </p>
        </div>

        <div className="flex gap-2">
          <Button variant="outline" size="sm" asChild>
            <Link to={`/dashboard/decks/${deck.id}`}>Back to deck</Link>
          </Button>
          <Button variant="ghost" size="sm" asChild>
            <Link to={`/dashboard/decks/${deck.id}/edit`}>Edit deck</Link>
          </Button>
        </div>
      </div>

      {!hasCards && (
        <Card>
          <CardContent className="py-6 text-sm text-muted-foreground text-center">
            This deck has no cards yet.
            <Button asChild size="sm" className="mt-3">
              <Link to={`/dashboard/decks/${deck.id}/edit`}>
                Add your first card
              </Link>
            </Button>
          </CardContent>
        </Card>
      )}

      {hasCards && (
        <>
          {/* Flashcard */}
          <Card className="cursor-pointer select-none" onClick={handleFlip}>
            <CardHeader>
              <div className="flex justify-between items-center">
                <Badge variant="outline" className="text-[11px]">
                  Card {index + 1} of {cards.length}
                </Badge>
                {currentCard?.hint_text && !showBack && (
                  <span className="text-[11px] text-muted-foreground italic">
                    Hint: {currentCard.hint_text}
                  </span>
                )}
              </div>
              <CardTitle className="text-base">
                {showBack ? "Answer" : "Question"}
              </CardTitle>
              {deck.description && (
                <CardDescription className="text-xs line-clamp-1">
                  {deck.description}
                </CardDescription>
              )}
            </CardHeader>
            <CardContent>
              <div className="min-h-[120px] flex items-center justify-center text-center">
                <p className="text-sm sm:text-base">
                  {showBack ? currentCard?.back_text : currentCard?.front_text}
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Controls */}
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handlePrev}
                disabled={!hasCards}
              >
                Previous
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handleNext}
                disabled={!hasCards}
              >
                Next
              </Button>
            </div>

            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleRestart}
                disabled={!hasCards}
              >
                Restart
              </Button>
              <Button size="sm" onClick={handleFlip} disabled={!hasCards}>
                {showBack ? "Show question" : "Show answer"}
              </Button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
