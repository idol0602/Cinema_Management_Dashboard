import { Routes, Route, Navigate } from "react-router-dom";
import LoginPage from "../pages/Auth/Login";
import { ProtectedRoute } from "@/routes/ProtectedRoute";
import DashboardLayout from "@/layouts/DashboardLayout";

export const AppRoutes = () => {
  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/login" element={<LoginPage />} />

      {/* Protected Routes with Dashboard Layout */}
      <Route
        element={
          <ProtectedRoute allowedRoles={["ADMIN", "STAFF"]} redirectTo="/login">
            <DashboardLayout />
          </ProtectedRoute>
        }
      >
        {/* Dashboard Home */}
        <Route path="/dashboard" element={<>DASHBOARD HOME</>} />

        {/* Movies Management */}
        <Route path="/movies" element={<>MOVIES PAGE</>} />
        <Route path="/movie-types" element={<>MOVIE TYPES PAGE</>} />

        {/* Show Times & Rooms */}
        <Route path="/show-times" element={<>SHOW TIMES PAGE</>} />
        <Route path="/rooms" element={<>ROOMS PAGE</>} />

        {/* Services */}
        <Route path="/combos" element={<>COMBOS PAGE</>} />
        <Route path="/menu-items" element={<>MENU ITEMS PAGE</>} />
        <Route path="/discounts" element={<>DISCOUNTS PAGE</>} />
        <Route path="/events" element={<>EVENTS PAGE</>} />

        {/* Content Management */}
        <Route path="/posts" element={<>POSTS PAGE</>} />
        <Route path="/slides" element={<>SLIDES PAGE</>} />

        {/* User Management */}
        <Route path="/users" element={<>USERS PAGE</>} />
      </Route>

      {/* Redirects */}
      <Route path="/" element={<Navigate to="/dashboard" replace />} />
      <Route index element={<Navigate to="/dashboard" replace />} />

      {/* 404 - Redirect to Dashboard */}
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
};
