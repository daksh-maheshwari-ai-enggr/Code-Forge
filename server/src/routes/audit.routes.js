import express from "express";
import { getAuditLogs } from "../controllers/audit.controller.js";
import authMiddleware from "../middleware/auth.middleware.js";
import adminMiddleware from "../middleware/admin.middleware.js";

const router = express.Router();

router.use(authMiddleware);
router.use(adminMiddleware);

router.get("/", getAuditLogs);

export default router;
