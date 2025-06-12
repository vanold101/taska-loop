import { ReactNode } from "react";
import { Sidebar, SidebarProvider, MobileNavbar } from "./Sidebar";

interface AppLayoutProps {
  children: ReactNode;
}

export function AppLayout({ children }: AppLayoutProps) {
  return (
    <SidebarProvider>
      <div className="flex min-h-screen bg-slate-50">
        {/* Sidebar */}
        <Sidebar />
        
        {/* Mobile navigation bar */}
        <MobileNavbar />
        
        {/* Main content */}
        <main className="flex-1 md:pl-64 pb-16 md:pb-0 pt-14 md:pt-0">
          {children}
        </main>
      </div>
    </SidebarProvider>
  );
} 