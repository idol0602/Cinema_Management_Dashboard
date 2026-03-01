import { Routes, Route, Navigate } from "react-router-dom";
import LoginPage from "../pages/Auth/Login";
import { ForgotPasswordPage } from "../pages/Auth/ForgotPasswordPage";
import { ResetPasswordPage } from "../pages/Auth/ResetPasswordPage";
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
import SeatList from "@/pages/Seats/SeatList";
import TicketPriceList from "@/pages/TicketPrices/TicketPriceList";
import Profile from "@/pages/Profile/Profile";
import DiscountList from "@/pages/Discounts/DiscountList";
import EventList from "@/pages/Events/EventList";
import ShowTimeList from "@/pages/ShowTimes/ShowTimeList";
import NotFound from "@/pages/NotFound";
import ComboList from "@/pages/Combos/ComboList";
import Home from "@/pages/Home";
import SeatTypeList from "@/pages/SeatTypes/SeatTypeList";
import FormatList from "@/pages/Formats/FormatList";
import EventTypeList from "@/pages/EventTypes/EventTypeList";
import RoleList from "@/pages/Roles/RoleList";
import ActionList from "@/pages/Actions/ActionList";
import AuthorizeList from "@/pages/Authorizes/AuthorizeList";
import RefundList from "@/pages/Refunds/RefundList";
import OrderList from "@/pages/Orders/OrderList";
import StatisticalPage from "@/pages/Statisticals/StatisticalPage";
import ChatWithStaff from "@/pages/ChatWithStaff/ChatWithStaff";

export const AppRoutes = () => {
  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/login" element={<LoginPage />} />
      <Route path="/forgot-password" element={<ForgotPasswordPage />} />
      <Route path="/reset-password/:token" element={<ResetPasswordPage />} />

      {/* ADMIN */}
      <Route
        element={
          <ProtectedRoute allowedRoles={["ADMIN"]} redirectTo="/login">
            <DashboardLayout />
          </ProtectedRoute>
        }
      >
        <Route path="/discounts" element={<DiscountList />} />

        {/* Content Management */}
        <Route path="/posts" element={<PostList />} />
        <Route path="/slides" element={<SlideList />} />

        {/* User Management */}
        <Route path="/users" element={<UserList />} />
        <Route path="/agent" element={<SQLAgent></SQLAgent>} />

        {/* System Management - ADMIN ONLY */}
        <Route path="/roles" element={<RoleList />} />
        <Route path="/actions" element={<ActionList />} />
        <Route path="/authorizes" element={<AuthorizeList />} />
        <Route path="/refunds" element={<RefundList />} />
      </Route>

      {/* STAFF */}
      <Route
        element={
          <ProtectedRoute allowedRoles={["STAFF"]} redirectTo="/login">
            <DashboardLayout />
          </ProtectedRoute>
        }
      >
        <Route path="/statisticals" element={<StatisticalPage />} />
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
        <Route path="/show-times" element={<ShowTimeList />} />
        <Route path="/rooms" element={<RoomList />} />
        <Route path="/rooms/:id/seats" element={<SeatList />} />
        <Route path="/ticket-prices" element={<TicketPriceList />} />

        {/* Facilities Management */}
        <Route path="/seat-types" element={<SeatTypeList />} />
        <Route path="/formats" element={<FormatList />} />

        {/* Services */}
        <Route path="/combos" element={<ComboList />} />
        <Route path="/menu-items" element={<MenuItemList />} />
        <Route path="/events" element={<EventList />} />
        <Route path="/event-types" element={<EventTypeList />} />
        <Route path="/dashboard" element={<Home />} />
        <Route path="/orders" element={<OrderList />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/chat" element={<ChatWithStaff />} />
      </Route>

      {/* Redirects */}
      <Route path="/" element={<Navigate to="/dashboard" replace />} />
      <Route index element={<Navigate to="/dashboard" replace />} />

      {/* 404 - Redirect to Dashboard */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};
