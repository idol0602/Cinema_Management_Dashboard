import { Routes, Route, Navigate } from "react-router-dom";
import LoginPage from "../pages/Auth/Login";
import { ProtectedRoute } from "@/routes/ProtectedRoute";
import DashboardLayout from "@/layouts/DashboardLayout";
import MovieList from "@/pages/Movies/MovieList";
import MovieTypesList from "@/pages/MovieTypes/MovieTypeList";
import SQLAgent from "@/pages/SQLAgent/SQLAgent";
import PostList from "@/pages/Posts/PostList";
import SlideList from "@/pages/Slides/SlideList";
import UserList from "@/pages/Users/UserList";
import RoomList from "@/pages/Rooms/RoomList";
import MenuItemList from "@/pages/MenuItems/MenuItemList";

export const AppRoutes = () => {
  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/login" element={<LoginPage />} />

      {/* ADMIN */}
      <Route
        element={
          <ProtectedRoute allowedRoles={["ADMIN"]} redirectTo="/login">
            <DashboardLayout />
          </ProtectedRoute>
        }
      >
        <Route path="/discounts" element={<>DISCOUNTS PAGE</>} />

        {/* Content Management */}
        <Route path="/posts" element={<PostList />} />
        <Route path="/slides" element={<SlideList />} />

        {/* User Management */}
        <Route path="/users" element={<UserList />} />
        <Route path="/agent" element={<SQLAgent></SQLAgent>} />
      </Route>

      {/* STAFF */}
      <Route
        element={
          <ProtectedRoute allowedRoles={["STAFF"]} redirectTo="/login">
            <DashboardLayout />
          </ProtectedRoute>
        }
      >
        <Route path="/ticket" element={<>BUY TICKET ONLY STAFF</>} />
      </Route>

      {/* ADMIN AND STAFF */}
      <Route
        element={
          <ProtectedRoute allowedRoles={["ADMIN", "STAFF"]} redirectTo="/login">
            <DashboardLayout />
          </ProtectedRoute>
        }
      >
        {/* Dashboard Home */}
        <Route path="/movies" element={<MovieList />} />
        {/* Movies Management */}
        <Route path="/movie-types" element={<MovieTypesList />} />
        {/* Show Times & Rooms */}
        <Route path="/show-times" element={<>SHOW TIMES PAGE</>} />
        <Route path="/rooms" element={<RoomList />} />

        {/* Services */}
        <Route path="/combos" element={<>COMBOS PAGE</>} />
        <Route path="/menu-items" element={<MenuItemList />} />
        <Route path="/events" element={<>EVENTS PAGE</>} />
        <Route path="/dashboard" element={<>DASHBOARD HOME</>} />
      </Route>

      {/* Redirects */}
      <Route path="/" element={<Navigate to="/dashboard" replace />} />
      <Route index element={<Navigate to="/dashboard" replace />} />

      {/* 404 - Redirect to Dashboard */}
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
};
