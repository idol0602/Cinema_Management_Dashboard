import { Outlet } from "react-router-dom";
import Header from "@/components/Common/Header";
import Footer from "@/components/Common/Footer";
import ChatBotDialog from "@/components/chatbots/ChatBotDialog";
import { AppSidebar } from "@/components/Common/AppSidebar";
import { SidebarProvider, SidebarInset, SidebarTrigger } from "@/components/ui/sidebar";

export default function DashboardLayout() {
  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <div className="flex min-h-screen flex-col">
          {/* Header with Sidebar Trigger */}
          <header className="flex items-center gap-2 border-b px-4">
            <SidebarTrigger className="-ml-1" />
            <div className="flex-1">
              <Header />
            </div>
          </header>

          {/* Main Content */}
          <main className="flex-1 container mx-auto px-4 py-6">
            <Outlet />
          </main>

          {/* Footer */}
          <Footer />

          {/* Chatbot */}
          <ChatBotDialog />
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
