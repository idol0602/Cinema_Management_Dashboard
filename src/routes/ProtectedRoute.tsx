import { Navigate } from "react-router-dom";
import type { ProtectedRouteProps } from "@/types/router.type";
import { useAuth } from "@/hooks/useAuth";

export const ProtectedRoute = ({
  children,
  allowedRoles,
  redirectTo = "/dashboard",
}: ProtectedRouteProps) => {
  // const { isLoading, user, isAuthenticated } = useAuth();

  // if (isLoading) {
  //   return (
  //     <div className="flex items-center justify-center h-screen">
  //       <div className="text-center">
  //         <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
  //         <p className="text-gray-600">Carregando...</p>
  //       </div>
  //     </div>
  //   );
  // }

  // if (!isAuthenticated) {
  //   return <Navigate to="/login" replace />;
  // }

  // if (!allowedRoles || allowedRoles.length === 0) {
  //   return <>{children}</>;
  // }

  // if (!user?.role || !allowedRoles.includes(user.role)) {
  //   return <Navigate to={redirectTo} replace />;
  // }

  return <>{children}</>;
};

export default ProtectedRoute;
