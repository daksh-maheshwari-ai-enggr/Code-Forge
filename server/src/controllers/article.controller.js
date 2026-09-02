import {
  createArticleService,
  getArticlesService,
  getArticleByIdService,
  getMyArticlesService,
  getPendingArticlesService,
  updateArticleStatusService,
  updateArticleService,
} from "../services/article.service.js";
import Notification from "../models/Notification.js";

export const createArticle = async (req, res, next) => {
  try {
    const { title, category, tags, content } = req.body;

    if (!title || !category || !content) {
      return res.status(400).json({
        success: false,
        message: "Title, category and content are required",
      });
    }

    const article = await createArticleService({
      authorId: req.user.userId,
      title,
      category,
      tags,
      content,
    });

    res.status(201).json({
      success: true,
      data: article,
    });
  } catch (error) {
    next(error);
  }
};

export const getArticles = async (req, res, next) => {
  try {
    const articles = await getArticlesService();

    res.status(200).json({
      success: true,
      data: articles,
    });
  } catch (error) {
    next(error);
  }
};

export const getArticleById = async (req, res, next) => {
  try {
    const article = await getArticleByIdService(req.params.id);

    if (!article) {
      return res.status(404).json({
        success: false,
        message: "Article not found",
      });
    }

    res.status(200).json({
      success: true,
      data: article,
    });
  } catch (error) {
    next(error);
  }
};

export const getMyArticles = async (req, res, next) => {
  try {
    const articles = await getMyArticlesService(req.user.userId);

    res.status(200).json({
      success: true,
      data: articles,
    });
  } catch (error) {
    next(error);
  }
};

export const getPendingArticles = async (req, res, next) => {
  try {
    if (req.user.role !== "ADMIN") {
      return res.status(403).json({
        success: false,
        message: "Only admins can view pending articles",
      });
    }

    const articles = await getPendingArticlesService();

    res.status(200).json({
      success: true,
      data: articles,
    });
  } catch (error) {
    next(error);
  }
};

export const reviewArticle = async (req, res, next) => {
  try {
    if (req.user.role !== "ADMIN") {
      return res.status(403).json({
        success: false,
        message: "Only admins can review articles",
      });
    }

    const { action, reason = "" } = req.body;
    const allowedActions = ["APPROVE", "REJECT", "REQUEST_CHANGES"];

    if (!allowedActions.includes(action)) {
      return res.status(400).json({
        success: false,
        message: "Action must be APPROVE, REJECT, or REQUEST_CHANGES",
      });
    }

    const finalStatus =
      action === "APPROVE"
        ? "PUBLISHED"
        : action === "REJECT"
          ? "REJECTED"
          : "CHANGES_REQUESTED";

    const article = await updateArticleStatusService({
      articleId: req.params.id,
      status: finalStatus,
      reviewReason: action === "REQUEST_CHANGES" ? reason : "",
    });

    const notificationType =
      action === "APPROVE"
        ? "APPROVED"
        : action === "REJECT"
          ? "REJECTED"
          : "CHANGES_REQUESTED";

    await Notification.create({
      user: article.author,
      article: article._id,
      type: notificationType,
      reason: action === "REQUEST_CHANGES" ? reason : "",
      message:
        action === "APPROVE"
          ? `Your article "${article.title}" has been approved and published.`
          : action === "REJECT"
            ? `Your article "${article.title}" was rejected by the admin team.`
            : `Changes were requested for "${article.title}".`,
      unread: true,
    });

    res.status(200).json({
      success: true,
      data: article,
    });
  } catch (error) {
    next(error);
  }
};

export const editArticle = async (req, res, next) => {
  try {
    const { title, category, tags, content } = req.body;

    if (!title || !category || !content) {
      return res.status(400).json({
        success: false,
        message: "Title, category and content are required",
      });
    }

    const article = await updateArticleService({
      articleId: req.params.id,
      authorId: req.user.userId,
      title,
      category,
      tags,
      content,
    });

    res.status(200).json({
      success: true,
      data: article,
    });
  } catch (error) {
    next(error);
  }
};