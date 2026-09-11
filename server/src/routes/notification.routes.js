import express from "express";
import Notification from "../models/Notification.js";
import authMiddleware from "../middleware/auth.middleware.js";

const router = express.Router();

router.get("/", authMiddleware, async (req, res) => {
  try {
    const notifications = await Notification.find({ user: req.user.userId })
      .sort({ createdAt: -1 })
      .populate({ path: "article", select: "title author", populate: { path: "author", select: "name" } });

    const formatted = notifications.map((notification) => ({
      id: notification._id,
      articleId: notification.article?._id || null,
      type:
        notification.type === "APPROVED"
          ? "approved"
          : notification.type === "CHANGES_REQUESTED"
            ? "changes"
            : notification.type === "NEW_ARTICLE"
              ? "new_article"
              : "rejected",
      articleName: notification.article?.title || "Your article",
      authorName: notification.article?.author?.name || "",
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

router.patch("/:id/read", authMiddleware, async (req, res) => {
  try {
    await Notification.updateOne({ _id: req.params.id, user: req.user.userId }, { $set: { unread: false } });
    res.status(200).json({ success: true });
  } catch {
    res.status(500).json({ success: false, message: "Unable to update notification" });
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
