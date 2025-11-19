import React from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";
import { Button } from "@/components/ui/button";

export default function LandingPage() {
  const { user, loginWithGitHub } = useAuth();

  return (
    <div className="min-h-[calc(100vh-3.5rem)] flex items-center justify-center bg-background">
      <div className="text-center max-w-lg px-6">
        <h1 className="text-3xl sm:text-4xl font-bold tracking-tight mb-4">
          Welcome to <span className="text-primary">quizlet2.O</span>
        </h1>

        <p className="text-muted-foreground text-sm sm:text-base mb-8">
          A clean and modern place to create, study, and explore flashcard
          decks.
        </p>

        {user ? (
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <Button asChild size="lg">
              <Link to="/dashboard">Go to Dashboard</Link>
            </Button>

            <Button asChild variant="outline" size="lg">
              <Link to="/explore">Explore Decks</Link>
            </Button>
          </div>
        ) : (
          <Button size="lg" className="mt-2" onClick={loginWithGitHub}>
            Sign in with GitHub
          </Button>
        )}
      </div>
    </div>
  );
}
