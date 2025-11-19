import {
  getAllTags,
  createTag,
  attachTagToDeck,
  detachTagFromDeck,
  getTagsForDeck,
} from "../models/tagModel.js";

export async function getAllTagsHandler(req, res, next) {
  try {
    const tags = await getAllTags();
    res.json(tags);
  } catch (err) {
    next(err);
  }
}

export async function createTagHandler(req, res, next) {
  try {
    const { name, slug } = req.body;
    const tag = await createTag({ name, slug });
    res.status(201).json(tag);
  } catch (err) {
    next(err);
  }
}

export async function getDeckTagsHandler(req, res, next) {
  try {
    const { deckId } = req.params;
    const tags = await getTagsForDeck(deckId);
    res.json(tags);
  } catch (err) {
    next(err);
  }
}

export async function attachTagToDeckHandler(req, res, next) {
  try {
    const { deckId } = req.params;
    const { tagId } = req.body;

    await attachTagToDeck(deckId, tagId);
    res.status(204).end();
  } catch (err) {
    next(err);
  }
}

export async function detachTagFromDeckHandler(req, res, next) {
  try {
    const { deckId, tagId } = req.params;
    await detachTagFromDeck(deckId, tagId);
    res.status(204).end();
  } catch (err) {
    next(err);
  }
}
