import { useAuth } from "@/hooks/useAuth";
import { useOnline } from "@/hooks/useOnline";
import { AppRoutes } from "@/routes/Routes";
import { Toaster } from "sonner";

export function AppContent() {
  const { user } = useAuth();

  useOnline(!!user);

  return (
    <>
      <AppRoutes />
      <Toaster position="top-right" richColors closeButton />
    </>
  );
}
