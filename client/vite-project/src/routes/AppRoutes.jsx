import { BrowserRouter, Routes, Route } from "react-router-dom";

import Login from "../pages/auth/Login";
import Register from "../pages/auth/Register";

import HomePage from "../pages/reader/HomePage";
import BrowsePage from "../pages/reader/BrowsePage";

import Unauthorized from "../pages/Unauthorized";

import RoleRoute from "../components/auth/RoleRoute";

import AuthorDashboard from "../pages/author/dashboard";
import AdminDashboard from "../pages/admin/admin";

function AppRoutes() {
  return (
    <BrowserRouter>
      <Routes>

        {/* ================= PUBLIC ================= */}

        <Route path="/" element={<HomePage />} />

        <Route path="/browse" element={<BrowsePage />} />


        {/* ================= AUTH ================= */}

        <Route path="/login" element={<Login />} />

        <Route path="/register" element={<Register />} />


        {/* ================= UNAUTHORIZED ================= */}

        <Route
          path="/unauthorized"
          element={<Unauthorized />}
        />


        {/* ================= AUTHOR ================= */}

        <Route
          path="/author/dashboard"
          element={
            <RoleRoute allowedRoles={["AUTHOR"]}>
              <AuthorDashboard />
            </RoleRoute>
          }
        />


        {/* ================= ADMIN ================= */}

        <Route
          path="/admin/dashboard"
          element={
            <RoleRoute allowedRoles={["ADMIN"]}>
              <AdminDashboard />
            </RoleRoute>
          }
        />

      </Routes>
    </BrowserRouter>
  );
}

export default AppRoutes;