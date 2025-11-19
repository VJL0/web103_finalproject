import {
  createDeck,
  getDeckById,
  getMyDecks,
  getPublicDecks,
  updateDeck,
  deleteDeck,
} from "../models/deckModel.js";
import { getCardsForDeck } from "../models/cardModel.js";
import { getTagsForDeck } from "../models/tagModel.js";

export async function createDeckHandler(req, res, next) {
  try {
    const { title, description, visibility } = req.body;
    const ownerId = req.user.id;

    const deck = await createDeck({ ownerId, title, description, visibility });
    res.status(201).json(deck);
  } catch (err) {
    next(err);
  }
}

export async function getMyDecksHandler(req, res, next) {
  try {
    const decks = await getMyDecks(req.user.id);
    res.json(decks);
  } catch (err) {
    next(err);
  }
}

export async function getPublicDecksHandler(req, res, next) {
  try {
    const limit = Number(req.query.limit ?? 20);
    const offset = Number(req.query.offset ?? 0);
    const decks = await getPublicDecks({ limit, offset });
    res.json(decks);
  } catch (err) {
    next(err);
  }
}

export async function getDeckDetailHandler(req, res, next) {
  try {
    const { id } = req.params;
    const deck = await getDeckById(id);
    if (!deck) return res.status(404).json({ error: "Deck not found" });

    const cards = await getCardsForDeck(id);
    const tags = await getTagsForDeck(id);

    res.json({ deck, cards, tags });
  } catch (err) {
    next(err);
  }
}

export async function updateDeckHandler(req, res, next) {
  try {
    const { id } = req.params;
    const updated = await updateDeck(id, req.user.id, req.body);
    if (!updated) return res.status(404).json({ error: "Deck not found" });

    res.json(updated);
  } catch (err) {
    next(err);
  }
}

export async function deleteDeckHandler(req, res, next) {
  try {
    const { id } = req.params;
    const ok = await deleteDeck(id, req.user.id);
    if (!ok) return res.status(404).json({ error: "Deck not found" });

    res.status(204).end();
  } catch (err) {
    next(err);
  }
}
