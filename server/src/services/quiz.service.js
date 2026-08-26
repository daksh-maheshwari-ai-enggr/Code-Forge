import Quiz from "../models/Quiz.js";
import Article from "../models/Article.js";

export const createArticleQuizService = async ({
  articleId,
  questions,
  userId,
}) => {
  const article = await Article.findById(articleId);

  if (!article) {
    throw new Error("Article not found");
  }

  if (article.author.toString() !== userId) {
    throw new Error("You can only add quiz to your own article");
  }

  if (questions.length === 0) {
    throw new Error("At least one question is required");
  }

  for (const question of questions) {
    if (!question.questionText) {
      throw new Error("Question text is required");
    }

    if (!Array.isArray(question.options)) {
      throw new Error("Options are required");
    }

    if (question.options.length !== 4) {
      throw new Error("Each question must have exactly 4 options");
    }

    if (
      question.correctOptionIndex < 0 ||
      question.correctOptionIndex > 3
    ) {
      throw new Error("Invalid correct option");
    }
  }

  const existingQuiz = await Quiz.findOne({
    article: articleId,
  });

  if (existingQuiz) {
    throw new Error("Quiz already exists for this article");
  }

  return await Quiz.create({
    article: articleId,
    questions,
  });
};

export const getArticleQuizService = async (articleId) => {
  return await Quiz.findOne({
    article: articleId,
  });
};