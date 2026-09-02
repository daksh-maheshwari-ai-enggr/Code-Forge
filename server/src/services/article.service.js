import Article from "../models/Article.js";

export const createArticleService = async ({
  authorId,
  title,
  category,
  tags,
  content,
  coverImage,
}) => {
  const existingSubmission = await Article.findOne({
    author: authorId,
    title: title.trim(),
    status: { $in: ["PENDING_REVIEW", "CHANGES_REQUESTED"] },
  });

  if (existingSubmission) {
    const error = new Error("This article is already waiting for review");
    error.statusCode = 409;
    throw error;
  }

  const article = await Article.create({
    author: authorId,
    title,
    category,
    tags: tags || [],
    content,
    coverImage: coverImage || "",
    status: "PENDING_REVIEW",
  });

  return article;
};

export const getArticlesService = async () => {
  return await Article.find({
    status: "PUBLISHED",
  })
    .populate("author", "name")
    .sort({ createdAt: -1 });
};

export const getArticleByIdService = async (articleId) => {
  return await Article.findById(articleId)
    .populate("author", "name");
};

export const getMyArticlesService = async (authorId) => {
  return await Article.find({ author: authorId })
    .sort({ createdAt: -1 });
};

export const getPendingArticlesService = async () => {
  return await Article.find({
    status: { $in: ["PENDING_REVIEW", "CHANGES_REQUESTED"] },
  })
    .populate("author", "name")
    .sort({ createdAt: -1 });
};

export const updateArticleStatusService = async ({ articleId, status, reviewReason = "" }) => {
  const article = await Article.findById(articleId);

  if (!article) {
    const error = new Error("Article not found");
    error.statusCode = 404;
    throw error;
  }

  article.status = status;
  article.reviewReason = reviewReason;
  await article.save();

  return article;
};

export const updateArticleService = async ({ articleId, authorId, title, category, tags, content, coverImage }) => {
  const article = await Article.findOne({ _id: articleId, author: authorId });

  if (!article) {
    const error = new Error("Article not found or not owned by this user");
    error.statusCode = 404;
    throw error;
  }

  article.title = title;
  article.category = category;
  article.tags = tags || [];
  article.content = content;
  article.coverImage = coverImage || "";
  article.status = "PENDING_REVIEW";
  article.reviewReason = "";
  await article.save();

  return article;
};