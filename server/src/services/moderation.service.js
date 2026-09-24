import ModerationRecord from "../models/ModerationRecord.js";
import Article from "../models/Article.js";
import { scanContent } from "./ai.service.js";
import { logAuditEvent } from "./audit.service.js";

export const scanArticleService = async (articleId) => {
  const article = await Article.findById(articleId);
  if (!article) throw new Error("Article not found");

  // 1. Run AI Scan
  const aiResult = await scanContent(article.title, article.content);

  // 2. Create Moderation Record
  const record = new ModerationRecord({
    targetId: article._id,
    targetType: "Article",
    riskScore: aiResult.riskScore,
    severity: aiResult.severity,
    categories: aiResult.categories,
    aiReason: aiResult.aiReason,
    aiRecommendation: aiResult.aiRecommendation,
    aiConfidence: aiResult.aiConfidence,
    modelProvider: aiResult.modelProvider,
    status: "PENDING",
  });

  await record.save();

  // 3. Log Audit Event for AI scan
  await logAuditEvent({
    action: "AI_SCAN_COMPLETED",
    actorType: "SYSTEM_AI",
    targetId: article._id,
    targetType: "Article",
    details: {
      moderationRecordId: record._id,
      riskScore: aiResult.riskScore,
      aiRecommendation: aiResult.aiRecommendation,
    },
  });

  return record;
};

export const getModerationQueueService = async () => {
  // Fetch pending records sorted by riskScore descending
  return await ModerationRecord.find({ status: "PENDING" })
    .sort({ riskScore: -1 })
    .populate("targetId", "title author category createdAt status")
    .exec();
};

export const getModerationRecordByIdService = async (id) => {
  return await ModerationRecord.findById(id).populate("targetId").exec();
};

export const reviewModerationRecordService = async (recordId, adminId, finalDecision, adminNotes) => {
  const record = await ModerationRecord.findById(recordId);
  if (!record) throw new Error("Moderation record not found");
  if (record.status === "RESOLVED") throw new Error("Record already resolved");

  // Update Moderation Record
  record.finalDecision = finalDecision;
  record.adminNotes = adminNotes || "";
  record.status = "RESOLVED";
  record.reviewedBy = adminId;
  await record.save();

  // Update Authoritative Article Status
  const article = await Article.findById(record.targetId);
  if (article) {
    article.status = finalDecision;
    if (finalDecision === "CHANGES_REQUESTED" && adminNotes) {
      article.reviewReason = adminNotes;
    }
    await article.save();
  }

  // Log Audit Event for Admin Action
  await logAuditEvent({
    action: "ADMIN_MODERATION_DECISION",
    actorType: "ADMIN",
    actorId: adminId,
    targetId: record.targetId,
    targetType: "Article",
    details: {
      moderationRecordId: record._id,
      aiRecommendation: record.aiRecommendation,
      finalDecision,
      adminNotes,
    },
  });

  return record;
};
