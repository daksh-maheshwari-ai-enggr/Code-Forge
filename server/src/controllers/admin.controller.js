const Article = require("../models/Article");

const getDashboardStats = async (req, res) => {
  try {
    const [pending, changes, published, rejected] = await Promise.all([
      Article.countDocuments({ status: "PENDING_REVIEW" }),
      Article.countDocuments({ status: "CHANGES_REQUESTED" }),
      Article.countDocuments({ status: "PUBLISHED" }),
      Article.countDocuments({ status: "REJECTED" }),
    ]);

    return res.status(200).json({
      success: true,
      data: {
        pending,
        changes,
        published,
        rejected,
      },
    });
  } catch (error) {
    console.error("Get dashboard stats error:", error.message);
    return res.status(500).json({
      success: false,
      error: {
        code: "DASHBOARD_STATS_ERROR",
        message: "Failed to get dashboard statistics",
      },
    });
  }
};

const getPendingArticles = async (req, res) => {
  try {
    const articles = await Article.find({
      status: { $in: ["PENDING_REVIEW", "CHANGES_REQUESTED"] },
    })
      .populate("author", "name email avatarUrl bio")
      .populate("category", "name slug")
      .sort({ updatedAt: -1 });

    return res.status(200).json({
      success: true,
      data: articles,
    });
  } catch (error) {
    console.error("Get pending articles error:", error.message);
    return res.status(500).json({
      success: false,
      error: {
        code: "PENDING_ARTICLES_ERROR",
        message: "Failed to get pending articles",
      },
    });
  }
};

const approveArticle = async (req, res) => {
  try {
    const { articleId } = req.params;

    const article = await Article.findById(articleId);

    if (!article) {
      return res.status(404).json({
        success: false,
        error: {
          code: "ARTICLE_NOT_FOUND",
          message: "Article not found",
        },
      });
    }

    article.status = "PUBLISHED";
    article.publishedAt = new Date();
    article.feedback = ""; // clear feedback on approval
    await article.save();

    return res.status(200).json({
      success: true,
      data: article,
    });
  } catch (error) {
    console.error("Approve article error:", error.message);
    return res.status(500).json({
      success: false,
      error: {
        code: "APPROVE_ARTICLE_ERROR",
        message: "Failed to approve article",
      },
    });
  }
};

const rejectArticle = async (req, res) => {
  try {
    const { articleId } = req.params;
    const { feedback } = req.body;

    const article = await Article.findById(articleId);

    if (!article) {
      return res.status(404).json({
        success: false,
        error: {
          code: "ARTICLE_NOT_FOUND",
          message: "Article not found",
        },
      });
    }

    article.status = "REJECTED";
    article.feedback = feedback || "";
    await article.save();

    return res.status(200).json({
      success: true,
      data: article,
    });
  } catch (error) {
    console.error("Reject article error:", error.message);
    return res.status(500).json({
      success: false,
      error: {
        code: "REJECT_ARTICLE_ERROR",
        message: "Failed to reject article",
      },
    });
  }
};

const requestChanges = async (req, res) => {
  try {
    const { articleId } = req.params;
    const { feedback } = req.body;

    if (!feedback || !feedback.trim()) {
      return res.status(400).json({
        success: false,
        error: {
          code: "FEEDBACK_REQUIRED",
          message: "Feedback is required when requesting changes",
        },
      });
    }

    const article = await Article.findById(articleId);

    if (!article) {
      return res.status(404).json({
        success: false,
        error: {
          code: "ARTICLE_NOT_FOUND",
          message: "Article not found",
        },
      });
    }

    article.status = "CHANGES_REQUESTED";
    article.feedback = feedback;
    await article.save();

    return res.status(200).json({
      success: true,
      data: article,
    });
  } catch (error) {
    console.error("Request changes error:", error.message);
    return res.status(500).json({
      success: false,
      error: {
        code: "REQUEST_CHANGES_ERROR",
        message: "Failed to request changes",
      },
    });
  }
};

module.exports = {
  getDashboardStats,
  getPendingArticles,
  approveArticle,
  rejectArticle,
  requestChanges,
};
