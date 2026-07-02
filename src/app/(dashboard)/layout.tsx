import { AuthGuard } from "@/components/auth-guard";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { ChatbotWidget } from "@/components/chatbot/ChatbotWidget";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AuthGuard>
      <Navbar />
      <main className="min-h-screen pt-16">{children}</main>
      <Footer />
      <ChatbotWidget />
    </AuthGuard>
  );
}
