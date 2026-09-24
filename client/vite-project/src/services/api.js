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

const getLikeStatus = async (articleId, token) => request(`/articles/${articleId}/like`, { headers: { Authorization: `Bearer ${token}` } });
const toggleArticleLike = async (articleId, token) => request(`/articles/${articleId}/like`, { method: "POST", headers: { Authorization: `Bearer ${token}` } });

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

const getComments = async (articleId, context = "ARTICLE") => {
  const response = await api.get(`/articles/${articleId}/comments`, { params: { context } });
  return response.data;
};

const createComment = async (articleId, content, token, parentId = null, context = "ARTICLE") => {
  return request(`/articles/${articleId}/comments`, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}` },
    body: JSON.stringify({ content, parentId, context }),
  });
};

const getPublicProfile = async (userId) => {
  const response = await api.get(`/users/${userId}`);
  return response.data;
};

const getSubscriptionStatus = async (userId, token) => {
  return request(`/users/${userId}/subscription`, { headers: { Authorization: `Bearer ${token}` } });
};

const subscribeToUser = async (userId, token) => {
  return request(`/users/${userId}/subscribe`, { method: "POST", headers: { Authorization: `Bearer ${token}` } });
};

const unsubscribeFromUser = async (userId, token) => {
  return request(`/users/${userId}/subscribe`, { method: "DELETE", headers: { Authorization: `Bearer ${token}` } });
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

const markNotificationRead = async (notificationId, token) => request(`/notifications/${notificationId}/read`, { method: "PATCH", headers: { Authorization: `Bearer ${token}` } });

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

const getModerationQueue = async (token) => {
  return request("/moderation", {
    method: "GET",
    headers: { Authorization: `Bearer ${token}` }
  });
};

const getModerationRecord = async (id, token) => {
  return request(`/moderation/${id}`, {
    method: "GET",
    headers: { Authorization: `Bearer ${token}` }
  });
};

const reviewModerationRecord = async (id, finalDecision, token, notes = "") => {
  return request(`/moderation/${id}/review`, {
    method: "PATCH",
    headers: { Authorization: `Bearer ${token}` },
    body: JSON.stringify({ finalDecision, notes })
  });
};

const scanArticle = async (articleId, token) => {
  return request(`/moderation/scan`, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}` },
    body: JSON.stringify({ articleId })
  });
};

const getAuditLogs = async (token) => {
  return request("/audit", {
    method: "GET",
    headers: { Authorization: `Bearer ${token}` }
  });
};

export {
  api,
  registerUser,
  loginUser,
  getCurrentUser,
  getArticles,
  getArticleById,
  getLikeStatus,
  toggleArticleLike,
  getArticleQuiz,
  getComments,
  createComment,
  getPublicProfile,
  getSubscriptionStatus,
  subscribeToUser,
  unsubscribeFromUser,
  getMyArticles,
  getPendingArticles,
  reviewArticle,
  getNotifications,
  markNotificationsRead,
  markNotificationRead,
  createArticleQuiz,
  getModerationQueue,
  getModerationRecord,
  reviewModerationRecord,
  scanArticle,
  getAuditLogs,
};
