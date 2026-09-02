import express from "express";

import {
  createArticle,
  getArticles,
  getArticleById,
  getMyArticles,
  getPendingArticles,
  reviewArticle,
  editArticle,
} from "../controllers/article.controller.js";

import authMiddleware from "../middleware/auth.middleware.js";

const router = express.Router();

router.post("/", authMiddleware, createArticle);
router.get("/pending", authMiddleware, getPendingArticles);
router.get("/mine", authMiddleware, getMyArticles);
router.get("/", getArticles);
router.patch("/:id", authMiddleware, editArticle);
router.patch("/:id/review", authMiddleware, reviewArticle);
router.get("/:id", getArticleById);

export default router;