import express from "express";

import {
  createArticle,
  getArticles,
  getArticleById,
} from "../controllers/article.controller.js";

import authMiddleware from "../middlewares/authMiddleware.js";

const router = express.Router();

router.post("/", authMiddleware, createArticle);

router.get("/", getArticles);

router.get("/:id", getArticleById);

export default router;