import { useEffect } from "react";
import { AppRoutes } from "@/routes/Routes";
import { Toaster } from "sonner";
import { useAuth } from "@/hooks/useAuth";
import { authorizeService } from "@/services/authorize.service";

export function AppContent() {
  const { user, isAuthenticated } = useAuth();

  useEffect(() => {
    // Tự động tải lại danh sách permissions mỗi khi F5 hoặc mở app
    if (isAuthenticated && user?.role) {
      authorizeService.getActionsByRoleId(user.role).then((res) => {
        if (res.success && res.data) {
          useAuth.setState({ permissions: res.data as any[] });
        }
      }).catch(err => console.error("Failed to auto-refresh permissions:", err));
    }
  }, [isAuthenticated, user?.role]);

  return (
    <>
      <AppRoutes />
      <Toaster position="top-right" richColors closeButton />
    </>
  );
}
