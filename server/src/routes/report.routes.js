
const express = require("express");

const {
  create,
  getAll,
  getOne,
  updateAction,
} = require("../controllers/report.controller");

const authMiddleware = require("../middleware/auth.middleware");
const roleMiddleware = require("../middleware/role.middleware");

const router = express.Router();

// Create a report - Authenticated users
router.post(
  "/",
  authMiddleware,
  create
);

// Get all reports - Admin only
router.get(
  "/",
  authMiddleware,
  roleMiddleware(["ADMIN"]),
  getAll
);

// Get one report - Admin only
router.get(
  "/:reportId",
  authMiddleware,
  roleMiddleware(["ADMIN"]),
  getOne
);

// Update admin action - Admin only
router.patch(
  "/:reportId/action",
  authMiddleware,
  roleMiddleware(["ADMIN"]),
  updateAction
);

module.exports = router;

