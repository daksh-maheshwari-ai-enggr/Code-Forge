import axios from "axios";

const API_BASE_URL = "http://localhost:5004/api";
const api = axios.create({
  baseURL: "http://localhost:5004/api",
});

const getArticles = async () => {
  const response = await api.get("/articles");
  return response.data;
};

const getArticleById = async (id) => {
  const response = await api.get(`/articles/${id}`);
  return response.data;
};

const request = async (endpoint, options = {}) => {
  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(options.headers || {}),
    },
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error?.message || "Something went wrong");
  }

  return data;
};

const registerUser = async (userData) => {
  return request("/auth/register", {
    method: "POST",
    body: JSON.stringify(userData),
  });
};

const loginUser = async (credentials) => {
  return request("/auth/login", {
    method: "POST",
    body: JSON.stringify(credentials),
  });
};

const getCurrentUser = async (token) => {
  return request("/auth/me", {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
};

const getArticleQuiz = async (articleId) => {
  const response = await api.get(`/articles/${articleId}/quiz`);
  return response.data;
};

const getMyArticles = async (token) => {
  const response = await api.get("/articles/mine", {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return response.data;
};

const getPendingArticles = async (token) => {
  const response = await api.get("/articles/pending", {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return response.data;
};

const reviewArticle = async (articleId, action, token, reason = "") => {
  const response = await api.patch(
    `/articles/${articleId}/review`,
    {
      action,
      ...(reason ? { reason } : {}),
    },
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );
  return response.data;
};

const getNotifications = async (token) => {
  const response = await api.get("/notifications", {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return response.data;
};

const markNotificationsRead = async (token) => {
  const response = await api.patch(
    "/notifications/read-all",
    {},
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );
  return response.data;
};

const createArticleQuiz = async (articleId, quizData, token) => {
  const response = await api.post(
    `/articles/${articleId}/quiz`,
    quizData,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  return response.data;
};

export {
  api,
  registerUser,
  loginUser,
  getCurrentUser,
  getArticles,
  getArticleById,
  getArticleQuiz,
  getMyArticles,
  getPendingArticles,
  reviewArticle,
  getNotifications,
  markNotificationsRead,
  createArticleQuiz,
};
