import { Router } from "express";
import authRoutes from "./authRoutes.js";
import deckRoutes from "./deckRoutes.js";
import cardRoutes from "./cardRoutes.js";
import tagRoutes from "./tagRoutes.js";

const router = Router();

router.use("/auth", authRoutes);
router.use("/decks", deckRoutes);
router.use("/cards", cardRoutes);
router.use("/tags", tagRoutes);

export default router;
