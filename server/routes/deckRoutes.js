import { Router } from "express";
import { requireAuth } from "../middleware/auth.js";
import {
  createDeckHandler,
  getMyDecksHandler,
  getPublicDecksHandler,
  getDeckDetailHandler,
  updateDeckHandler,
  deleteDeckHandler
} from "../controllers/deckController.js";

const router = Router();

// Public explore
router.get("/public", getPublicDecksHandler);

// My decks
router.get("/mine", requireAuth, getMyDecksHandler);

// Create deck
router.post("/", requireAuth, createDeckHandler);

// Single deck (detail)
router.get("/:id", getDeckDetailHandler);

// Update/delete
router.put("/:id", requireAuth, updateDeckHandler);
router.delete("/:id", requireAuth, deleteDeckHandler);

export default router;
