import { Routes, Route, Navigate } from "react-router-dom";
import { ProtectedRoute } from "./ProtectedRoute";
import MovieListPage from "../pages/Movies/MovieList";
import LoginPage from "../pages/Auth/Login";

export const AppRoutes = () => {
  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/" element={<Navigate to="/dashboard" replace />} />
      <Route path="/login" element={<LoginPage />} />

      {/* Private Routes - Chỉ cần đăng nhập */}
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute allowedRoles={["ADMIN", "STAFF"]} redirectTo="/login">
            <div className="p-6">Dashboard</div>
          </ProtectedRoute>
        }
      />

      <Route
        path="/profile"
        element={
          <ProtectedRoute>
            <div className="p-6">Profile</div>
          </ProtectedRoute>
        }
      />

      {/* Admin Only Routes */}
      <Route
        path="/users"
        element={
          <ProtectedRoute allowedRoles={["ADMIN"]}>
            <div className="p-6">User Management (Admin Only)</div>
          </ProtectedRoute>
        }
      />

      {/* Admin + Staff Routes */}
      <Route
        path="/movies"
        element={
          <ProtectedRoute allowedRoles={["ADMIN", "STAFF"]}>
            <MovieListPage />
          </ProtectedRoute>
        }
      />

      <Route
        path="/rooms"
        element={
          <ProtectedRoute allowedRoles={["ADMIN", "STAFF"]}>
            <div className="p-6">Room Management</div>
          </ProtectedRoute>
        }
      />

      <Route
        path="/show-times"
        element={
          <ProtectedRoute allowedRoles={["ADMIN", "STAFF"]}>
            <div className="p-6">Show Times</div>
          </ProtectedRoute>
        }
      />

      <Route
        path="/combos"
        element={
          <ProtectedRoute allowedRoles={["ADMIN", "STAFF"]}>
            <div className="p-6">Combos</div>
          </ProtectedRoute>
        }
      />

      {/* Staff Only Routes (nếu cần) */}
      <Route
        path="/tickets"
        element={
          <ProtectedRoute allowedRoles={["STAFF", "ADMIN"]}>
            <div className="p-6">Tickets</div>
          </ProtectedRoute>
        }
      />

      {/* Fallback */}
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
};
