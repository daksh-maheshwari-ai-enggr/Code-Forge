import express from "express";
import authMiddleware from "../middleware/auth.middleware.js";
import {
  getUsers,
  getMessages,
  sendMessage,
} from "../controllers/chat.controller.js";

const router = express.Router();

router.use(authMiddleware);

router.get("/users", getUsers);
router.get("/messages/:userId", getMessages);
router.post("/messages", sendMessage);

export default router;