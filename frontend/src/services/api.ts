import axios from 'axios';

const api = axios.create({ baseURL: '' });

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('sentinel_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export interface AnalyzeResult {
  spam_score: number;
  toxicity_score: number;
  hate_speech_score: number;
  inappropriate_score: number;
  suspicious_link_score: number;
  pii_score: number;
  overall_risk_score: number;
  risk_level: 'LOW' | 'MEDIUM' | 'HIGH';
  detected_categories: string[];
  flagged_snippets: Array<{ category: string; term: string; severity: string; reason: string }>;
  ai_decision: 'AUTO_APPROVE' | 'SEND_TO_REVIEW' | 'AUTO_BLOCK';
  explanation: string;
}

// Auth
export const login = (username: string, password: string) => api.post('/api/auth/login', { username, password });
export const getMe = () => api.get('/api/auth/me');

// AI Moderation Engine
export const analyzeText = (text: string) => api.post<AnalyzeResult>('/api/moderation/analyze', { text });
export const submitContent = (data: { user_id?: string; content_type?: string; title?: string; body: string }) => api.post('/api/moderation/submit', data);
export const getModerationQueue = (params?: object) => api.get('/api/moderation', { params });
export const getModerationItem = (id: string) => api.get(`/api/moderation/${id}`);
export const approveContent = (id: string, reason: string) => api.post(`/api/moderation/${id}/approve`, { action: 'Approve', reason });
export const blockContent = (id: string, reason: string) => api.post(`/api/moderation/${id}/block`, { action: 'Block', reason });

// Dashboard
export const getDashboardStats = () => api.get('/api/dashboard/stats');

// Reports
export const getReports = (params?: object) => api.get('/api/reports', { params });
export const resolveReport = (id: string, notes: string) => api.post(`/api/reports/${id}/resolve`, { action: 'Resolve', notes });
export const rejectReport = (id: string, notes: string) => api.post(`/api/reports/${id}/reject`, { action: 'Reject', notes });

// Appeals
export const getAppeals = (params?: object) => api.get('/api/appeals', { params });
export const approveAppeal = (id: string, response: string) => api.post(`/api/appeals/${id}/approve`, { action: 'Approve', response });
export const rejectAppeal = (id: string, response: string) => api.post(`/api/appeals/${id}/reject`, { action: 'Reject', response });

// Users
export const getUsers = (params?: object) => api.get('/api/users', { params });
export const getUser = (id: string) => api.get(`/api/users/${id}`);
export const adjustReputation = (id: string, delta: number, reason: string) => api.post(`/api/users/${id}/adjust-reputation`, { delta, reason });

// Audit Logs
export const getAuditLogs = (params?: object) => api.get('/api/audit-logs', { params });
export const exportAuditLogs = (format: string) => api.get(`/api/audit-logs/export?format=${format}`, { responseType: 'blob' });

// Notifications
export const getNotifications = () => api.get('/api/notifications');
export const markNotificationRead = (id: number) => api.post(`/api/notifications/${id}/read`);
export const markAllNotificationsRead = () => api.post('/api/notifications/read-all');

// System
export const resetDemoData = () => api.post('/api/system/reset-demo-data');

export default api;
