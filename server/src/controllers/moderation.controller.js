import {
  scanArticleService,
  getModerationQueueService,
  getModerationRecordByIdService,
  reviewModerationRecordService,
} from "../services/moderation.service.js";

export const scanArticle = async (req, res, next) => {
  try {
    const { articleId } = req.body;
    if (!articleId) {
      return res.status(400).json({ success: false, message: "articleId is required" });
    }

    const record = await scanArticleService(articleId);
    return res.status(200).json({ success: true, data: record });
  } catch (error) {
    console.error("Scan Article Error:", error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const getModerationQueue = async (req, res, next) => {
  try {
    const queue = await getModerationQueueService();
    return res.status(200).json({ success: true, data: queue });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const getModerationRecord = async (req, res, next) => {
  try {
    const record = await getModerationRecordByIdService(req.params.id);
    if (!record) {
      return res.status(404).json({ success: false, message: "Record not found" });
    }
    return res.status(200).json({ success: true, data: record });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const reviewModerationRecord = async (req, res, next) => {
  try {
    const { finalDecision, adminNotes } = req.body;
    const adminId = req.user.userId;

    if (!finalDecision || !["APPROVED", "CHANGES_REQUESTED", "REJECTED"].includes(finalDecision)) {
      return res.status(400).json({ success: false, message: "Invalid finalDecision" });
    }

    const record = await reviewModerationRecordService(
      req.params.id,
      adminId,
      finalDecision,
      adminNotes
    );

    return res.status(200).json({ success: true, data: record });
  } catch (error) {
    console.error("Review Moderation Error:", error);
    return res.status(500).json({ success: false, message: error.message });
  }
};
