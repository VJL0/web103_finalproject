import {
  createCard,
  getCardsForDeck,
  updateCard,
  deleteCard,
} from "../models/cardModel.js";

export async function createCardHandler(req, res, next) {
  try {
    const { deckId } = req.params;
    const { frontText, backText, hintText, position } = req.body;

    const card = await createCard({
      deckId,
      frontText,
      backText,
      hintText,
      position,
    });

    res.status(201).json(card);
  } catch (err) {
    next(err);
  }
}

export async function getCardsForDeckHandler(req, res, next) {
  try {
    const { deckId } = req.params;
    const cards = await getCardsForDeck(deckId);
    res.json(cards);
  } catch (err) {
    next(err);
  }
}

export async function updateCardHandler(req, res, next) {
  try {
    const { id } = req.params;
    const card = await updateCard(id, req.body);
    if (!card) return res.status(404).json({ error: "Card not found" });

    res.json(card);
  } catch (err) {
    next(err);
  }
}

export async function deleteCardHandler(req, res, next) {
  try {
    const { id } = req.params;
    const ok = await deleteCard(id);
    if (!ok) return res.status(404).json({ error: "Card not found" });

    res.status(204).end();
  } catch (err) {
    next(err);
  }
}
