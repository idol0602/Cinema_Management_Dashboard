import { Navigate, useLocation } from "react-router-dom";
import type { ProtectedRouteProps } from "@/types/router.type";
import { useAuth } from "@/hooks/useAuth";

export const ProtectedRoute = ({
  children,
  allowedRoles,
  redirectTo = "/dashboard",
}: ProtectedRouteProps) => {
  const { isLoading, isAuthenticated, permissions } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // Define public/base routes everyone who is logged in can access
  const publicRoutes = ['/dashboard', '/profile', '/chat', '/unauthorized'];
  if (publicRoutes.includes(location.pathname)) {
    return <>{children}</>;
  }

  // Check if any permission starts with /api + location.pathname
  // e.g., if navigating to /movies, we need permission for /api/movies
  const hasPermission = Array.isArray(permissions) && permissions.some(
    p => p?.path && typeof p.path === 'string' && p.path.startsWith(`/api${location.pathname}`) && p.method === 'GET'
  );

  if (!hasPermission) {
    console.warn("Access denied for route:", location.pathname, "Permissions:", permissions);
    return <Navigate to={redirectTo} replace />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;
