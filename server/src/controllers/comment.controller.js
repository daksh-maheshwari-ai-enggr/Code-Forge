import Article from "../models/Article.js";
import Comment from "../models/Comment.js";
import { detectSpam } from "../ai/spamDetection.js";
import {
  checkRepeatedSpam,
  detectSuspiciousLink,
  restrictUserIfNeeded,
} from "../services/spamAbuse.service.js";

const validContext = (value) => (value === "QUIZ" ? "QUIZ" : "ARTICLE");

export const getComments = async (req, res, next) => {
  try {
    const context = validContext(req.query.context);

    const comments = await Comment.find({
      article: req.params.id,
      context,
    })
      .populate("author", "name avatarUrl")
      .sort({ createdAt: 1 })
      .lean();

    const byId = new Map();
    const roots = [];

    comments.forEach((comment) =>
      byId.set(String(comment._id), {
        ...comment,
        replies: [],
      }),
    );

    byId.forEach((comment) => {
      if (comment.parent && byId.has(String(comment.parent))) {
        byId.get(String(comment.parent)).replies.push(comment);
      } else {
        roots.push(comment);
      }
    });

    res.json({
      success: true,
      data: roots,
    });
  } catch (error) {
    next(error);
  }
};

export const createComment = async (req, res, next) => {
  try {
    const content = req.body.content?.trim();
    const context = validContext(req.body.context);
    const parentId = req.body.parentId || null;

    if (!content) {
      return res.status(400).json({
        success: false,
        message: "Comment content is required",
      });
    }

    const article = await Article.findOne({
      _id: req.params.id,
      status: "PUBLISHED",
    });

    if (!article) {
      return res.status(404).json({
        success: false,
        message: "Article not found",
      });
    }

    if (parentId) {
      const parent = await Comment.findOne({
        _id: parentId,
        article: article._id,
        context,
      });

      if (!parent) {
        return res.status(400).json({
          success: false,
          message: "Reply target was not found",
        });
      }
    }

    const comment = await Comment.create({
      article: article._id,
      author: req.user.userId,
      parent: parentId,
      context,
      content,
    });

    let spamDetection = {
      label: "UNKNOWN",
      riskScore: null,
      reason: "Spam detection was not completed",
      checkedAt: null,
    };

    try {
      const aiResult = await detectSpam(comment.content);

      try {
        const parsedResult = JSON.parse(aiResult);

        spamDetection = {
          label: parsedResult.label || "UNKNOWN",
          riskScore:
            typeof parsedResult.riskScore === "number"
              ? parsedResult.riskScore
              : null,
          reason: parsedResult.reason || "",
          checkedAt: new Date(),
        };
      } catch {
        spamDetection = {
          label: "UNKNOWN",
          riskScore: null,
          reason: aiResult,
          checkedAt: new Date(),
        };
      }

      comment.moderation = spamDetection;
      await comment.save();
    } catch (aiError) {
      console.error("Spam detection failed:", aiError.message);

      comment.moderation = spamDetection;
      await comment.save();
    }

    const repeatedSpam = await checkRepeatedSpam(req.user.userId);
    const suspiciousLink = detectSuspiciousLink(comment.content);

    const accountRestriction = await restrictUserIfNeeded(
      req.user.userId,
      repeatedSpam.spamCount,
    );

    await comment.populate("author", "name avatarUrl");

    res.status(201).json({
      success: true,
      data: comment,
      spamDetection,
      repeatedSpam,
      suspiciousLink,
      accountRestriction,
    });
  } catch (error) {
    next(error);
  }
};