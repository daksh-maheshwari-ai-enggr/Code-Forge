import { BrowserRouter, Routes, Route } from "react-router-dom";

import Login from "../pages/auth/Login";
import Register from "../pages/auth/Register";

import HomePage from "../pages/reader/HomePage";
import BrowsePage from "../pages/reader/BrowsePage";

import Unauthorized from "../pages/Unauthorized";

import ProtectedRoute from "../components/auth/ProtectedRoute";
import RoleRoute from "../components/auth/RoleRoute";

import AuthorDashboard from "../pages/author/dashboard";
import AdminDashboard from "../pages/admin/admin";
import CreateArticle from "../pages/author/CreateArticle";
import Profile from "../pages/author/Profile";
import EditArticle from "../pages/author/EditArticle";

import ArticlePage from "../pages/reader/ArticlePage";
import QuizPage from "../pages/reader/QuizPage";
import QuizResultPage from "../pages/reader/QuizResultPage";
import Notifications from "../pages/Notifications";

function AppRoutes() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public */}
        <Route path="/" element={<HomePage />} />
        <Route path="/browse" element={<BrowsePage />} />
        <Route path="/read/:id" element={<ArticlePage />} />
        <Route path="/read/:id/quiz" element={<QuizPage />} />
        <Route path="/read/:id/result" element={<QuizResultPage />} />

        {/* Authentication */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* Unauthorized */}
        <Route path="/unauthorized" element={<Unauthorized />} />

        {/* Author */}
        <Route
          path="/author/dashboard"
          element={
            <RoleRoute allowedRoles={["AUTHOR"]}>
              <AuthorDashboard />
            </RoleRoute>
          }
        />

        {/* Admin */}
        <Route
          path="/admin/dashboard"
          element={
            <RoleRoute allowedRoles={["ADMIN"]}>
              <AdminDashboard />
            </RoleRoute>
          }
        />

        <Route
          path="/author/write"
          element={
            <RoleRoute allowedRoles={["AUTHOR"]}>
              <CreateArticle />
            </RoleRoute>
          }
        />

        <Route
          path="/profile"
          element={
            <RoleRoute allowedRoles={["AUTHOR"]}>
              <Profile />
            </RoleRoute>
          }
        />

        <Route
          path="/author/articles/:id/edit"
          element={
            <RoleRoute allowedRoles={["AUTHOR"]}>
              <EditArticle />
            </RoleRoute>
          }
        />

        <Route
          path="/notifications"
          element={
            <RoleRoute allowedRoles={["AUTHOR"]}>
              <Notifications />
            </RoleRoute>
          }
        />
      </Routes>
    </BrowserRouter>
  );
}

export default AppRoutes;
