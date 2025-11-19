import React, { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { API_BASE_URL } from "../../api/http";

import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { Separator } from "@/components/ui/separator";

let nextTempId = 1;

export default function DeckEditorPage() {
  const { deckId } = useParams();
  const isEdit = Boolean(deckId);
  const navigate = useNavigate();

  // deck form
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [visibility, setVisibility] = useState("PRIVATE");

  // start with 2 blank cards
  const [cards, setCards] = useState([
    { _id: nextTempId++, front: "", back: "", hint: "" },
    { _id: nextTempId++, front: "", back: "", hint: "" },
  ]);

  const [removedCardIds, setRemovedCardIds] = useState([]);
  const [loading, setLoading] = useState(isEdit);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  // Load existing deck on edit
  useEffect(() => {
    if (!isEdit) return;

    async function load() {
      setLoading(true);
      try {
        const res = await fetch(`${API_BASE_URL}/decks/${deckId}`, {
          credentials: "include",
        });
        const data = await res.json();

        setTitle(data.deck.title);
        setDescription(data.deck.description || "");
        setVisibility(data.deck.visibility);

        if (data.cards.length > 0) {
          setCards(
            data.cards
              .sort((a, b) => a.position - b.position)
              .map((c) => ({
                id: c.id,
                _id: nextTempId++,
                front: c.front_text,
                back: c.back_text,
                hint: c.hint_text || "",
              }))
          );
        }
      } catch (err) {
        setError("Failed to load deck.");
      }
      setLoading(false);
    }

    load();
  }, [deckId, isEdit]);

  function addCard() {
    setCards((prev) => [
      ...prev,
      { _id: nextTempId++, front: "", back: "", hint: "" },
    ]);
  }

  function removeCard(localId) {
    setCards((prev) => {
      const c = prev.find((x) => x._id === localId);
      if (isEdit && c?.id) setRemovedCardIds((r) => [...r, c.id]);
      return prev.filter((x) => x._id !== localId);
    });
  }

  function updateCard(id, key, value) {
    setCards((prev) =>
      prev.map((c) => (c._id === id ? { ...c, [key]: value } : c))
    );
  }

  async function handleSubmit(e) {
    e.preventDefault();

    if (!title.trim()) return setError("Title is required.");

    const normalized = cards.map((c) => ({
      ...c,
      front: c.front.trim(),
      back: c.back.trim(),
      hint: c.hint.trim(),
    }));

    // must have front + back
    const validCards = normalized.filter((c) => c.front && c.back);

    if (validCards.length < 2) {
      return setError(
        "You need at least 2 cards with both front and back filled."
      );
    }

    // detect partially filled cards
    const partial = normalized.some(
      (c) => (c.front && !c.back) || (!c.front && c.back)
    );
    if (partial)
      return setError("Each card must have BOTH a front and a back.");

    setSubmitting(true);
    setError("");

    try {
      let currentDeckId = deckId;

      // CREATE
      if (!isEdit) {
        const res = await fetch(`${API_BASE_URL}/decks`, {
          method: "POST",
          credentials: "include",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ title, description, visibility }),
        });
        const deck = await res.json();
        currentDeckId = deck.id;
      }

      // UPDATE deck
      if (isEdit) {
        await fetch(`${API_BASE_URL}/decks/${deckId}`, {
          method: "PUT",
          credentials: "include",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ title, description, visibility }),
        });

        // delete removed cards
        for (const cardId of removedCardIds) {
          await fetch(`${API_BASE_URL}/cards/${cardId}`, {
            method: "DELETE",
            credentials: "include",
          });
        }
      }

      // reorder & save cards
      validCards.forEach((c, index) => (c.position = index + 1));

      for (const card of validCards) {
        if (card.id) {
          await fetch(`${API_BASE_URL}/cards/${card.id}`, {
            method: "PUT",
            credentials: "include",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              frontText: card.front,
              backText: card.back,
              hintText: card.hint,
              position: card.position,
            }),
          });
        } else {
          await fetch(`${API_BASE_URL}/cards/deck/${currentDeckId}`, {
            method: "POST",
            credentials: "include",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              frontText: card.front,
              backText: card.back,
              hintText: card.hint,
              position: card.position,
            }),
          });
        }
      }

      navigate(`/dashboard/decks/${currentDeckId}`);
    } catch (err) {
      setError("Failed to save.");
    }

    setSubmitting(false);
  }

  if (loading) return <p className="text-center text-sm">Loading…</p>;

  return (
    <div className="max-w-3xl mx-auto">
      <Card>
        <CardHeader>
          <CardTitle>{isEdit ? "Edit Deck" : "Create Deck"}</CardTitle>
        </CardHeader>

        <CardContent>
          {error && (
            <Alert variant="destructive" className="mb-4">
              <AlertTitle>Error</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Deck form */}
            <div className="space-y-3">
              <Label>
                Title <span className="text-red-500">*</span>
              </Label>
              <Input value={title} onChange={(e) => setTitle(e.target.value)} />

              <Label>Description</Label>
              <Textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />

              <Label>Visibility</Label>
              <Select value={visibility} onValueChange={setVisibility}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="PRIVATE">Private</SelectItem>
                  <SelectItem value="UNLISTED">Unlisted</SelectItem>
                  <SelectItem value="PUBLIC">Public</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <Separator />

            {/* Cards */}
            <div className="flex items-center justify-between">
              <Label className="font-semibold">
                Cards <span className="text-red-500">*</span>
              </Label>
              <Button
                type="button"
                variant="outline"
                onClick={addCard}
                size="sm"
              >
                Add Card
              </Button>
            </div>

            <div className="space-y-4">
              {cards.map((c, index) => {
                const partial =
                  (c.front.trim() && !c.back.trim()) ||
                  (!c.front.trim() && c.back.trim());
                return (
                  <div
                    key={c._id}
                    className={`border rounded-md p-3 space-y-3 ${
                      partial ? "border-red-300 bg-red-50" : "border-muted"
                    }`}
                  >
                    <div className="flex justify-between items-center">
                      <span className="text-xs text-muted-foreground">
                        Card #{index + 1}
                      </span>
                      <Button
                        type="button"
                        variant="ghost"
                        size="xs"
                        onClick={() => removeCard(c._id)}
                        className="text-red-500"
                      >
                        Remove
                      </Button>
                    </div>

                    <div className="space-y-1">
                      <Label>
                        Front <span className="text-red-500">*</span>
                      </Label>
                      <Textarea
                        rows={2}
                        value={c.front}
                        onChange={(e) =>
                          updateCard(c._id, "front", e.target.value)
                        }
                      />
                    </div>

                    <div className="space-y-1">
                      <Label>
                        Back <span className="text-red-500">*</span>
                      </Label>
                      <Textarea
                        rows={2}
                        value={c.back}
                        onChange={(e) =>
                          updateCard(c._id, "back", e.target.value)
                        }
                      />
                    </div>

                    <div className="space-y-1">
                      <Label>Hint</Label>
                      <Input
                        value={c.hint}
                        onChange={(e) =>
                          updateCard(c._id, "hint", e.target.value)
                        }
                      />
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Actions */}
            <div className="flex justify-between pt-2">
              <Button
                type="button"
                variant="ghost"
                onClick={() => navigate(-1)}
              >
                Back
              </Button>
              <Button disabled={submitting} type="submit">
                {submitting
                  ? "Saving..."
                  : isEdit
                  ? "Save Changes"
                  : "Create Deck"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
