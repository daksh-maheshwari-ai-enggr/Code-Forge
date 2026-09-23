const express = require("express");

const {
  create,
  getByReport,
  getOne,
  updateDecision,
} = require("../controllers/appeal.controller");

const authMiddleware = require("../middleware/auth.middleware");
const roleMiddleware = require("../middleware/role.middleware");

const router = express.Router();

// Create an appeal
router.post(
  "/reports/:reportId/appeal",
  authMiddleware,
  create
);

// Get appeal for a report - Admin only
router.get(
  "/reports/:reportId/appeal",
  authMiddleware,
  roleMiddleware(["ADMIN"]),
  getByReport
);

// Get appeal by appeal ID - Admin only
router.get(
  "/appeals/:appealId",
  authMiddleware,
  roleMiddleware(["ADMIN"]),
  getOne
);

// Accept / Reject / Request More Information - Admin only
router.patch(
  "/appeals/:appealId/decision",
  authMiddleware,
  roleMiddleware(["ADMIN"]),
  updateDecision
);

module.exports = router;