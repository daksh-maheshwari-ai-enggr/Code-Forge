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

export { api, registerUser, loginUser, getCurrentUser,getArticles, getArticleById };
