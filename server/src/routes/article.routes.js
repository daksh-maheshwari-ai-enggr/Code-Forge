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
import { createComment, getComments } from "../controllers/comment.controller.js";

import authMiddleware from "../middleware/auth.middleware.js";

const router = express.Router();

router.post("/", authMiddleware, createArticle);
router.get("/pending", authMiddleware, getPendingArticles);
router.get("/mine", authMiddleware, getMyArticles);
router.get("/", getArticles);
router.get("/:id/comments", getComments);
router.post("/:id/comments", authMiddleware, createComment);
router.patch("/:id", authMiddleware, editArticle);
router.patch("/:id/review", authMiddleware, reviewArticle);
router.get("/:id", getArticleById);

export default router;
