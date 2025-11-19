// src/App.jsx
import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import LandingPage from "./pages/LandingPage";
import ExplorePage from "./pages/ExplorePage";
import LoginPage from "./pages/LoginPage";

import DashboardHomePage from "./pages/dashboard/DashboardHomePage";
import MyDecksPage from "./pages/dashboard/MyDecksPage";
import DeckDetailPage from "./pages/dashboard/DeckDetailPage";
import DeckEditorPage from "./pages/dashboard/DeckEditorPage";
import DeckFlashcardsPage from "./pages/dashboard/DeckFlashcardsPage";

import { RequireAuth } from "./auth/RequireAuth";
import DashboardLayout from "./layouts/DashboardLayout";
import PublicLayout from "./layouts/PublicLayout";

function App() {
  return (
    <Routes>
      {/* Public routes */}
      <Route element={<PublicLayout />}>
        <Route path="/" element={<LandingPage />} />
        <Route path="/explore" element={<ExplorePage />} />
        <Route path="/login" element={<LoginPage />} />
      </Route>

      {/* Protected routes */}
      <Route
        path="/dashboard"
        element={
          <RequireAuth>
            <DashboardLayout />
          </RequireAuth>
        }
      >
        <Route index element={<DashboardHomePage />} />

        <Route path="decks" element={<MyDecksPage />} />
        <Route path="decks/new" element={<DeckEditorPage />} />
        <Route path="decks/:deckId" element={<DeckDetailPage />} />
        <Route path="decks/:deckId/edit" element={<DeckEditorPage />} />

        <Route
          path="decks/:deckId/flashcards"
          element={<DeckFlashcardsPage />}
        />
      </Route>

      {/* Fallback */}
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
}

export default App;
