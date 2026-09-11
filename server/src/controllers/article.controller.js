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
import Subscription from "../models/Subscription.js";
import Article from "../models/Article.js";
import ArticleLike from "../models/ArticleLike.js";

export const createArticle = async (req, res, next) => {
  try {
    const { title = "", category = "", tags, content = "", coverImage, status = "PENDING_REVIEW" } = req.body;

    if (status !== "DRAFT" && (!title || !category || !content)) {
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
      coverImage,
      status,
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
    const article = await Article.findOneAndUpdate(
      { _id: req.params.id, status: "PUBLISHED" },
      { $inc: { views: 1 } },
      { new: true },
    ).populate("author", "name");

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

export const getLikeStatus = async (req, res, next) => {
  try {
    const liked = await ArticleLike.exists({ article: req.params.id, user: req.user.userId });
    res.json({ success: true, data: { liked: Boolean(liked) } });
  } catch (error) { next(error); }
};

export const toggleLike = async (req, res, next) => {
  try {
    const existing = await ArticleLike.findOne({ article: req.params.id, user: req.user.userId });
    let liked;
    if (existing) {
      await existing.deleteOne();
      await Article.updateOne({ _id: req.params.id, likes: { $gt: 0 } }, { $inc: { likes: -1 } });
      liked = false;
    } else {
      const article = await Article.findOne({ _id: req.params.id, status: "PUBLISHED" });
      if (!article) return res.status(404).json({ success: false, message: "Article not found" });
      await ArticleLike.create({ article: article._id, user: req.user.userId });
      await Article.updateOne({ _id: article._id }, { $inc: { likes: 1 } });
      liked = true;
    }
    const article = await Article.findById(req.params.id).select("likes");
    res.json({ success: true, data: { liked, likes: article.likes } });
  } catch (error) { next(error); }
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

    const articleBeforeReview = await getArticleByIdService(req.params.id);
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

    if (action === "APPROVE" && articleBeforeReview?.status !== "PUBLISHED") {
      const subscriptions = await Subscription.find({ author: article.author }).select("subscriber");
      if (subscriptions.length) {
        await Notification.insertMany(
          subscriptions.map(({ subscriber }) => ({
            user: subscriber,
            article: article._id,
            type: "NEW_ARTICLE",
            message: `${article.title} was just published.`,
            unread: true,
          })),
        );
      }
    }

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
    const { title = "", category = "", tags, content = "", coverImage, status = "PENDING_REVIEW" } = req.body;

    if (status !== "DRAFT" && (!title || !category || !content)) {
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
      coverImage,
      status,
    });

    res.status(200).json({
      success: true,
      data: article,
    });
  } catch (error) {
    next(error);
  }
};
