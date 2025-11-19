import { Router } from "express";
import { requireAuth } from "../middleware/auth.js";
import {
  createCardHandler,
  getCardsForDeckHandler,
  updateCardHandler,
  deleteCardHandler
} from "../controllers/cardController.js";

const router = Router();

// Deck cards
router.get("/deck/:deckId", getCardsForDeckHandler);

// Create card in deck
router.post("/deck/:deckId", requireAuth, createCardHandler);

// Update/delete single card
router.put("/:id", requireAuth, updateCardHandler);
router.delete("/:id", requireAuth, deleteCardHandler);

export default router;
