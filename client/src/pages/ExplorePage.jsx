import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { API_BASE_URL } from "../api/http";
import { useAuth } from "../auth/AuthContext";

import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";

function DeckSkeleton() {
  return (
    <Card className="border-muted">
      <CardHeader>
        <Skeleton className="h-5 w-40 mb-2" />
        <Skeleton className="h-4 w-64" />
      </CardHeader>
      <CardContent className="flex items-center justify-between">
        <Skeleton className="h-4 w-24" />
        <Skeleton className="h-8 w-24" />
      </CardContent>
    </Card>
  );
}

export default function ExplorePage() {
  const { user } = useAuth();
  const [decks, setDecks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelled = false;

    async function loadDecks() {
      setLoading(true);
      setError(null);

      try {
        const res = await fetch(`${API_BASE_URL}/decks/public`, {
          credentials: "include",
        });

        if (!res.ok) {
          throw new Error("Failed to load decks");
        }

        const data = await res.json();
        if (!cancelled) {
          setDecks(data);
        }
      } catch (err) {
        if (!cancelled) {
          console.error(err);
          setError(err.message || "Something went wrong");
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    loadDecks();
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <div className="min-h-[calc(100vh-3.5rem)] bg-background">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-6 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">
              Explore decks
            </h1>
            <p className="text-sm text-muted-foreground">
              Browse public decks created by you and others.
            </p>
          </div>

          {user && (
            <Button asChild size="sm">
              <Link to="/dashboard/decks/new">Create a deck</Link>
            </Button>
          )}
        </div>

        {loading && (
          <div className="grid gap-4 md:grid-cols-2">
            <DeckSkeleton />
            <DeckSkeleton />
            <DeckSkeleton />
          </div>
        )}

        {!loading && error && (
          <div className="text-sm text-destructive">
            Failed to load decks: {error}
          </div>
        )}

        {!loading && !error && decks.length === 0 && (
          <p className="text-sm text-muted-foreground">
            No public decks yet.{" "}
            {user ? "Be the first to create one!" : "Sign in to add your own."}
          </p>
        )}

        {!loading && !error && decks.length > 0 && (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {decks.map((deck) => (
              <Card
                key={deck.id}
                className="border-muted hover:shadow-sm transition-shadow"
              >
                <CardHeader>
                  <CardTitle className="line-clamp-1 text-base">
                    {deck.title}
                  </CardTitle>
                  {deck.description && (
                    <CardDescription className="line-clamp-2 text-xs">
                      {deck.description}
                    </CardDescription>
                  )}
                </CardHeader>
                <CardContent className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="text-[11px]">
                      {deck.num_cards} {deck.num_cards === 1 ? "card" : "cards"}
                    </Badge>
                  </div>

                  {/* For now, link into the dashboard detail view.
                      RequireAuth will handle login if needed. */}
                  <Button asChild size="sm" variant="outline">
                    <Link to={`/dashboard/decks/${deck.id}`}>View</Link>
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
