"use client";

import { SidebarProvider } from "@/components/Layouts/sidebar/sidebar-context";
import { ThemeProvider } from "next-themes";
import { AuthProvider } from "@/context/auth-context";
import { AuditProgramProvider } from "@/context/audit-program-context";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider defaultTheme="light" attribute="class">
      <AuthProvider>
        <AuditProgramProvider>
          <SidebarProvider>
            {children}
          </SidebarProvider>
        </AuditProgramProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}