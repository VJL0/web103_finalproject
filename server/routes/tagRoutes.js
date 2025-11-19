import { Router } from "express";
import { requireAuth } from "../middleware/auth.js";
import {
  getAllTagsHandler,
  createTagHandler,
  getDeckTagsHandler,
  attachTagToDeckHandler,
  detachTagFromDeckHandler,
} from "../controllers/tagController.js";

const router = Router();

router.get("/", getAllTagsHandler);
router.post("/", requireAuth, createTagHandler);

router.get("/deck/:deckId", getDeckTagsHandler);
router.post("/deck/:deckId", requireAuth, attachTagToDeckHandler);
router.delete("/deck/:deckId/:tagId", requireAuth, detachTagFromDeckHandler);

export default router;
