import express from "express";
import {
  scanArticle,
  getModerationQueue,
  getModerationRecord,
  reviewModerationRecord,
} from "../controllers/moderation.controller.js";
import authMiddleware from "../middleware/auth.middleware.js";
import adminMiddleware from "../middleware/admin.middleware.js";

const router = express.Router();

router.use(authMiddleware);
router.use(adminMiddleware);

router.post("/scan", scanArticle);
router.get("/queue", getModerationQueue);
router.get("/:id", getModerationRecord);
router.post("/:id/review", reviewModerationRecord);

export default router;
