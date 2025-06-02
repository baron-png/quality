"use client";

import { SidebarProvider } from "@/components/Layouts/sidebar/sidebar-context";
import { ThemeProvider } from "next-themes";
import { AuthProvider } from "@/context/auth-context"; // <-- import your AuthProvider

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider defaultTheme="light" attribute="class">
      <AuthProvider> {/* <-- wrap everything with AuthProvider */}
        <SidebarProvider>{children}</SidebarProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}