import { Outlet } from "react-router-dom";
import Header from "@/components/Common/Header";
import Navbar from "@/components/Common/Navbar";
import Footer from "@/components/Common/Footer";

export default function DashboardLayout() {
  return (
    <div className="flex min-h-screen flex-col">
      {/* Header */}
      <Header />

      {/* Navigation */}
      <Navbar />

      {/* Main Content */}
      <main className="flex-1 container mx-auto px-4 py-6">
        <Outlet />
      </main>

      {/* Footer */}
      <Footer />
    </div>
  );
}
