import { AppRoutes } from "@/routes/Routes";
import { Toaster } from "sonner";

export function AppContent() {
  return (
    <>
      <AppRoutes />
      <Toaster position="top-right" richColors closeButton />
    </>
  );
}
