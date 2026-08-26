import {
  createArticleQuizService,
  getArticleQuizService,
} from "../services/quiz.service.js";

export const createArticleQuiz = async (req, res, next) => {
  try {
    const { questions } = req.body;

    if (!questions || !Array.isArray(questions)) {
      return res.status(400).json({
        success: false,
        message: "Questions are required",
      });
    }

    const quiz = await createArticleQuizService({
      articleId: req.params.articleId,
      questions,
      userId: req.user.userId,
    });

    res.status(201).json({
      success: true,
      data: quiz,
    });
  } catch (error) {
    next(error);
  }
};

export const getArticleQuiz = async (req, res, next) => {
  try {
    const quiz = await getArticleQuizService(
      req.params.articleId
    );

    if (!quiz) {
      return res.status(404).json({
        success: false,
        message: "Quiz not found",
      });
    }

    res.status(200).json({
      success: true,
      data: quiz,
    });
  } catch (error) {
    next(error);
  }
};