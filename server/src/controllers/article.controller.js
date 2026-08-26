import {
  createArticleService,
  getArticlesService,
  getArticleByIdService,
} from "../services/article.service.js";

export const createArticle = async (req, res, next) => {
  try {
    const {
      title,
      category,
      tags,
      content,
    } = req.body;

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