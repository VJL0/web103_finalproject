// src/pages/dashboard/DeckDetailPage.jsx
import React, { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { api } from "@/api/http";

import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { Skeleton } from "@/components/ui/skeleton";

function DetailSkeleton() {
  return (
    <div className="max-w-3xl mx-auto space-y-4">
      <Skeleton className="h-7 w-48" />
      <Skeleton className="h-4 w-72" />
      <Skeleton className="h-20 w-full" />
    </div>
  );
}

function visibilityLabel(v) {
  if (v === "PUBLIC") return "Public";
  if (v === "UNLISTED") return "Unlisted";
  return "Private";
}

export default function DeckDetailPage() {
  const { deckId } = useParams();
  const navigate = useNavigate();

  const [deck, setDeck] = useState(null);
  const [cards, setCards] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setLoading(true);
      setError("");

      try {
        const res = await fetch(api(`/decks/${deckId}`), {
          credentials: "include",
        });
        if (!res.ok) {
          const body = await res.json().catch(() => ({}));
          throw new Error(body.error || "Failed to load deck");
        }
        const data = await res.json();
        if (cancelled) return;
        setDeck(data.deck);
        setCards(
          (data.cards || [])
            .slice()
            .sort((a, b) => (a.position ?? 0) - (b.position ?? 0))
        );
      } catch (err) {
        if (!cancelled) setError(err.message || "Something went wrong.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, [deckId]);

  if (loading) return <DetailSkeleton />;

  if (error || !deck) {
    return (
      <div className="max-w-3xl mx-auto space-y-3">
        <Alert variant="destructive">
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error || "Deck not found."}</AlertDescription>
        </Alert>
        <Button variant="ghost" size="sm" onClick={() => navigate(-1)}>
          Back
        </Button>
      </div>
    );
  }

  const cardCount = cards.length;

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Header + actions */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-1">
          <h1 className="text-2xl font-semibold tracking-tight">
            {deck.title}
          </h1>
          {deck.description && (
            <p className="text-sm text-muted-foreground">{deck.description}</p>
          )}
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Badge variant="outline" className="text-[11px]">
              {cardCount} {cardCount === 1 ? "card" : "cards"}
            </Badge>
            <span>• {visibilityLabel(deck.visibility)}</span>
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => navigate("/dashboard/decks")}
          >
            Back to my decks
          </Button>
          <Button asChild size="sm" variant="outline">
            <Link to={`/dashboard/decks/${deck.id}/edit`}>
              Edit deck & cards
            </Link>
          </Button>
          <Button asChild size="sm">
            <Link to={`/dashboard/decks/${deck.id}/flashcards`}>Study</Link>
          </Button>
        </div>
      </div>

      {/* Cards list */}
      <div className="space-y-3">
        <h2 className="text-sm font-semibold">Cards</h2>

        <div className="space-y-3">
          {cards.map((card, index) => (
            <Card key={card.id || index}>
              <CardHeader className="pb-2">
                <CardTitle className="text-xs text-muted-foreground">
                  Card #{index + 1}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm">
                <div>
                  <div className="font-medium mb-1">Front</div>
                  <p className="whitespace-pre-wrap">{card.front_text}</p>
                </div>
                <div>
                  <div className="font-medium mb-1">Back</div>
                  <p className="whitespace-pre-wrap">{card.back_text}</p>
                </div>
                {card.hint_text && (
                  <p className="text-xs text-muted-foreground">
                    Hint: {card.hint_text}
                  </p>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
