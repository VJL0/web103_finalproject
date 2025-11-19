import React, { useEffect, useState, useMemo } from "react";
import { Link } from "react-router-dom";
import { api } from "@/api/http";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";

function DeckSkeleton() {
  return (
    <Card className="flex flex-col justify-between">
      <CardHeader>
        <Skeleton className="h-5 w-40 mb-2" />
        <Skeleton className="h-4 w-56" />
      </CardHeader>
      <CardContent className="flex items-center justify-between">
        <Skeleton className="h-4 w-20" />
        <Skeleton className="h-8 w-32" />
      </CardContent>
    </Card>
  );
}

function visibilityLabel(v) {
  switch (v) {
    case "PUBLIC":
      return "Public";
    case "UNLISTED":
      return "Unlisted";
    case "PRIVATE":
    default:
      return "Private";
  }
}

export default function MyDecksPage() {
  const [decks, setDecks] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;

    async function loadDecks() {
      setLoading(true);
      setError("");

      try {
        const res = await fetch(api("/decks/mine"), {
          credentials: "include",
        });

        if (!res.ok) {
          const body = await res.json().catch(() => ({}));
          throw new Error(body.error || "Failed to load decks");
        }

        const data = await res.json();
        if (!cancelled) setDecks(data);
      } catch (err) {
        if (!cancelled) setError(err.message || "Something went wrong");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    loadDecks();
    return () => {
      cancelled = true;
    };
  }, []);

  const filteredDecks = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return decks;
    return decks.filter((d) => (d.title || "").toLowerCase().includes(q));
  }, [decks, search]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">My decks</h1>
          <p className="text-sm text-muted-foreground">
            Manage your study sets and jump into flashcards.
          </p>
        </div>

        <Button asChild>
          <Link to="/dashboard/decks/new">Create deck</Link>
        </Button>
      </div>

      {/* Search */}
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div className="w-full max-w-sm">
          <Input
            placeholder="Search decks by title..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <p className="text-xs text-muted-foreground">
          {decks.length} total deck{decks.length === 1 ? "" : "s"}
        </p>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertTitle>Could not load decks</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Content */}
      {loading && !error && (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          <DeckSkeleton />
          <DeckSkeleton />
          <DeckSkeleton />
        </div>
      )}

      {!loading && !error && filteredDecks.length === 0 && (
        <Card>
          <CardContent className="py-6 text-center text-sm text-muted-foreground">
            {decks.length === 0 ? (
              <>
                You don&apos;t have any decks yet.
                <br />
                <Button asChild size="sm" className="mt-3">
                  <Link to="/dashboard/decks/new">Create your first deck</Link>
                </Button>
              </>
            ) : (
              <>No decks match that search.</>
            )}
          </CardContent>
        </Card>
      )}

      {!loading && !error && filteredDecks.length > 0 && (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filteredDecks.map((deck) => (
            <Card
              key={deck.id}
              className="flex flex-col justify-between hover:shadow-sm transition-shadow"
            >
              <CardHeader>
                <CardTitle className="text-base line-clamp-1">
                  {deck.title}
                </CardTitle>
                {deck.description && (
                  <CardDescription className="text-xs line-clamp-2">
                    {deck.description}
                  </CardDescription>
                )}
              </CardHeader>
              <CardContent className="flex items-center justify-between text-xs">
                <div className="space-y-1">
                  <Badge variant="outline" className="text-[11px]">
                    {deck.num_cards} {deck.num_cards === 1 ? "card" : "cards"}
                  </Badge>
                  <div className="text-[11px] text-muted-foreground">
                    {visibilityLabel(deck.visibility)}
                  </div>
                </div>

                <div className="flex flex-col items-end gap-1">
                  <Button
                    asChild
                    size="sm"
                    variant="outline"
                    className="h-7 text-[11px]"
                  >
                    <Link to={`/dashboard/decks/${deck.id}`}>View</Link>
                  </Button>
                  <div className="flex gap-1">
                    <Button
                      asChild
                      size="sm"
                      variant="ghost"
                      className="h-7 text-[11px]"
                    >
                      <Link to={`/dashboard/decks/${deck.id}/flashcards`}>
                        Study
                      </Link>
                    </Button>
                    <Button
                      asChild
                      size="sm"
                      variant="ghost"
                      className="h-7 text-[11px]"
                    >
                      <Link to={`/dashboard/decks/${deck.id}/edit`}>Edit</Link>
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
