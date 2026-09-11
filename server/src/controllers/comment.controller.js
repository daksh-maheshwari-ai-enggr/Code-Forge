import Article from "../models/Article.js";
import Comment from "../models/Comment.js";

const validContext = (value) => (value === "QUIZ" ? "QUIZ" : "ARTICLE");

export const getComments = async (req, res, next) => {
  try {
    const context = validContext(req.query.context);
    const comments = await Comment.find({ article: req.params.id, context })
      .populate("author", "name avatarUrl")
      .sort({ createdAt: 1 })
      .lean();

    const byId = new Map();
    const roots = [];
    comments.forEach((comment) => byId.set(String(comment._id), { ...comment, replies: [] }));
    byId.forEach((comment) => {
      if (comment.parent && byId.has(String(comment.parent))) {
        byId.get(String(comment.parent)).replies.push(comment);
      } else {
        roots.push(comment);
      }
    });

    res.json({ success: true, data: roots });
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
      return res.status(400).json({ success: false, message: "Comment content is required" });
    }

    const article = await Article.findOne({ _id: req.params.id, status: "PUBLISHED" });
    if (!article) {
      return res.status(404).json({ success: false, message: "Article not found" });
    }

    if (parentId) {
      const parent = await Comment.findOne({ _id: parentId, article: article._id, context });
      if (!parent) {
        return res.status(400).json({ success: false, message: "Reply target was not found" });
      }
    }

    const comment = await Comment.create({
      article: article._id,
      author: req.user.userId,
      parent: parentId,
      context,
      content,
    });
    await comment.populate("author", "name avatarUrl");

    res.status(201).json({ success: true, data: comment });
  } catch (error) {
    next(error);
  }
};
