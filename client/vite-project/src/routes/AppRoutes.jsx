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
import Notifications from "../pages/author/Notifications";
import Reports from "../pages/admin/Reports";
import ReportDetails from "../pages/admin/ReportDetails";
import AppealDetails from "../pages/admin/AppealDetails";

function AppRoutes() {
  return (
    <BrowserRouter>
      <Routes>

        {/* Public */}
        <Route path="/" element={<HomePage />} />
        <Route path="/browse" element={<BrowsePage />} />

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

        <Route path="/author/write" element={<CreateArticle />} />
        <Route path="/notifications" element={<Notifications />} />
        <Route path="/admin/reports" element={<Reports />} />

        <Route
          path="/admin/reports/:reportId"
          element={<ReportDetails />}
        />
        <Route
          path="/admin/reports/:reportId/appeal"
          element={<AppealDetails />}
        />
      </Routes>
    </BrowserRouter>
  );
}

export default AppRoutes;
