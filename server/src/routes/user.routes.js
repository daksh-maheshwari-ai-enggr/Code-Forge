import express from "express";
import authMiddleware from "../middleware/auth.middleware.js";
import { getPublicProfile, getSubscriptionStatus, subscribe, unsubscribe } from "../controllers/user.controller.js";

const router = express.Router();

router.get("/:id", getPublicProfile);
router.get("/:id/subscription", authMiddleware, getSubscriptionStatus);
router.post("/:id/subscribe", authMiddleware, subscribe);
router.delete("/:id/subscribe", authMiddleware, unsubscribe);

export default router;
