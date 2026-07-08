'use client';

import { useState } from "react";
import { useAuth } from "@/store/useAuthStore";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { LogOut, Menu, X, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import AdminSidebar from "./AdminSidebar";

interface AdminLayoutProps {
  title: string;
  children: React.ReactNode;
  backTo?: string;
}

export function AdminLayout({ title, children, backTo }: AdminLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { customer, logout } = useAuth();
  const router = useRouter();

  const handleLogout = () => {
    logout();
    router.push("/admin/login");
  };

  return (
    <div className="flex h-screen overflow-hidden bg-muted/30">
      <AdminSidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <div className="flex flex-1 flex-col overflow-hidden">
        <header className="flex h-14 shrink-0 items-center gap-4 border-b bg-background px-4 lg:px-6">
          <Button
            variant="ghost"
            size="icon"
            className="lg:hidden"
            onClick={() => setSidebarOpen(true)}
          >
            <Menu className="h-5 w-5" />
          </Button>
          {backTo && (
            <Button variant="ghost" size="sm" onClick={() => router.push(backTo)}>
              <ArrowLeft className="h-4 w-4 mr-1" />
              Back
            </Button>
          )}
          <h1 className="font-heading text-xl font-semibold flex-1">{title}</h1>
          <div className="flex items-center gap-3">
            <span className="text-sm text-muted-foreground hidden sm:block">
              {customer?.displayName || "Admin"}
            </span>
            <Button variant="ghost" size="icon" onClick={handleLogout} title="Sign out">
              <LogOut className="h-4 w-4" />
            </Button>
          </div>
        </header>

        <main className="flex-1 min-h-0 overflow-y-auto px-4 pt-4 pb-0 lg:px-6 lg:pt-6 lg:pb-0">
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            {children}
          </motion.div>
        </main>
      </div>
    </div>
  );
}