const express = require("express");
const {
  getDashboardStats,
  getPendingArticles,
  approveArticle,
  rejectArticle,
  requestChanges,
} = require("../controllers/admin.controller");
const authMiddleware = require("../middleware/auth.middleware");

const router = express.Router();

// Enforce role authorization (Must be ADMIN)
const requireAdmin = (req, res, next) => {
  if (!req.user || req.user.role !== "ADMIN") {
    return res.status(403).json({
      success: false,
      error: {
        code: "FORBIDDEN",
        message: "Access restricted to administrators",
      },
    });
  }
  next();
};

// All routes under this router require authentication and ADMIN role
router.use(authMiddleware);
router.use(requireAdmin);

router.get("/dashboard", getDashboardStats);
router.get("/articles/pending", getPendingArticles);
router.patch("/articles/:articleId/approve", approveArticle);
router.patch("/articles/:articleId/reject", rejectArticle);
router.patch("/articles/:articleId/request-changes", requestChanges);

module.exports = router;
