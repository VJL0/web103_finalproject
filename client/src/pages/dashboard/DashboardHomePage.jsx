// src/pages/dashboard/DashboardHomePage.jsx
import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../../auth/AuthContext";
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

function DeckSkeleton() {
  return (
    <Card>
      <CardHeader>
        <Skeleton className="h-5 w-40 mb-2" />
        <Skeleton className="h-4 w-64" />
      </CardHeader>
      <CardContent className="flex items-center justify-between">
        <Skeleton className="h-4 w-24" />
        <Skeleton className="h-8 w-16" />
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

export default function DashboardHomePage() {
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
        const res = await fetch(`${API_BASE_URL}/decks/mine`, {
          credentials: "include",
        });

        if (!res.ok) {
          const body = await res.json().catch(() => ({}));
          throw new Error(body.error || "Failed to load your decks");
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

  const recentDecks = decks.slice(0, 3);

  return (
    <div className="space-y-6">
      {/* Top greeting / CTA */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">
            Welcome{user?.github_username ? `, ${user.github_username}` : ""} 👋
          </h1>
          <p className="text-sm text-muted-foreground">
            Create a new deck or jump back into your recent sets.
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          <Button asChild>
            <Link to="/dashboard/decks/new">Create deck</Link>
          </Button>
          <Button asChild variant="outline">
            <Link to="/explore">Explore public decks</Link>
          </Button>
        </div>
      </div>

      {/* Error */}
      {error && (
        <Alert variant="destructive">
          <AlertTitle>Could not load your decks</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Recent decks */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-semibold">Recent decks</h2>
          <Button asChild variant="ghost" size="sm">
            <Link to="/dashboard/decks">View all</Link>
          </Button>
        </div>

        {loading && !error && (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            <DeckSkeleton />
            <DeckSkeleton />
            <DeckSkeleton />
          </div>
        )}

        {!loading && !error && recentDecks.length === 0 && (
          <Card>
            <CardContent className="py-6 text-sm text-muted-foreground text-center">
              You don’t have any decks yet.
              <Button asChild size="sm" className="mt-3">
                <Link to="/dashboard/decks/new">Create your first deck</Link>
              </Button>
            </CardContent>
          </Card>
        )}

        {!loading && !error && recentDecks.length > 0 && (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {recentDecks.map((deck) => (
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
                  <div className="flex flex-col gap-1">
                    <Badge variant="outline" className="w-fit text-[11px]">
                      {deck.num_cards} {deck.num_cards === 1 ? "card" : "cards"}
                    </Badge>
                    <span className="text-[11px] text-muted-foreground">
                      {visibilityLabel(deck.visibility)}
                    </span>
                  </div>

                  <Button
                    asChild
                    size="sm"
                    variant="outline"
                    className="h-7 text-xs"
                  >
                    <Link to={`/dashboard/decks/${deck.id}`}>Open</Link>
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
