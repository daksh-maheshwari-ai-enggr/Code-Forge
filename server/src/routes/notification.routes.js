import express from "express";
import Notification from "../models/Notification.js";
import authMiddleware from "../middleware/auth.middleware.js";

const router = express.Router();

router.get("/", authMiddleware, async (req, res) => {
  try {
    const notifications = await Notification.find({ user: req.user.userId })
      .sort({ createdAt: -1 })
      .populate("article", "title");

    const formatted = notifications.map((notification) => ({
      id: notification._id,
      articleId: notification.article?._id || null,
      type:
        notification.type === "APPROVED"
          ? "approved"
          : notification.type === "CHANGES_REQUESTED"
            ? "changes"
            : "rejected",
      articleName: notification.article?.title || "Your article",
      reason: notification.reason || "",
      time: formatRelativeTime(notification.createdAt),
      unread: notification.unread,
    }));

    res.status(200).json({
      success: true,
      data: formatted,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Unable to fetch notifications",
    });
  }
});

router.patch("/read-all", authMiddleware, async (req, res) => {
  try {
    await Notification.updateMany(
      { user: req.user.userId, unread: true },
      { $set: { unread: false } }
    );

    res.status(200).json({
      success: true,
      message: "Notifications marked as read",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Unable to update notifications",
    });
  }
});

function formatRelativeTime(date) {
  const diffMs = Date.now() - new Date(date).getTime();
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffDays = Math.floor(diffHours / 24);

  if (diffDays > 0) return `${diffDays} day${diffDays > 1 ? "s" : ""} ago`;
  if (diffHours > 0) return `${diffHours} hour${diffHours > 1 ? "s" : ""} ago`;
  return "just now";
}

export default router;
