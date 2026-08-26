import express from "express";

import {
  createArticleQuiz,
  getArticleQuiz,
} from "../controllers/quiz.controller.js";

import authMiddleware from "../middlewares/authMiddleware.js";

const router = express.Router();

router.post(
  "/articles/:articleId/quiz",
  authMiddleware,
  createArticleQuiz
);

router.get(
  "/articles/:articleId/quiz",
  getArticleQuiz
);

export default router;