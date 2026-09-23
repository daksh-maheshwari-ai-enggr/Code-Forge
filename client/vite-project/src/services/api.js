const API_BASE_URL = "http://localhost:5004/api/v1";

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

const getAllReports = async (token) => {
  return request("/reports", {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
};

const getReportById = async (reportId, token) => {
  return request(`/reports/${reportId}`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
};

const updateReportAction = async (reportId, adminAction, token) => {
  return request(`/reports/${reportId}/action`, {
    method: "PATCH",
    headers: {
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({
      adminAction,
    }),
  });
};

const getAppealByReport = async (reportId, token) => {
  return request(`/reports/${reportId}/appeal`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
};

const updateAppealDecision = async (
  appealId,
  status,
  adminNote,
  token
) => {
  return request(`/appeals/${appealId}/decision`, {
    method: "PATCH",
    headers: {
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({
      status,
      adminNote,
    }),
  });
};

export {
  registerUser,
  loginUser,
  getCurrentUser,
  updateReportAction,
  getAllReports,
  getReportById,
  getAppealByReport,
  updateAppealDecision
};
 
