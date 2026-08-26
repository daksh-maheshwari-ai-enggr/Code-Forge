import Article from "../models/Article.js";

export const createArticleService = async ({
  authorId,
  title,
  category,
  tags,
  content,
}) => {
  const article = await Article.create({
    author: authorId,
    title,
    category,
    tags: tags || [],
    content,
    status: "DRAFT",
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