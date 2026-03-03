import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { AppContent } from "./context/AppContent";
import { ThemeProvider } from "./components/theme-provider";
import "./index.css";

createRoot(document.getElementById("root")!).render(
  <BrowserRouter>
    <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
      <AppContent />
    </ThemeProvider>
  </BrowserRouter>,
);
