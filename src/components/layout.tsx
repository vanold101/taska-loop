import { ReactNode } from "react";
import MobileLayout from "./MobileLayout";
import MobileNav from "./MobileNav";
import { useMediaQuery } from "@/hooks/use-media-query";

interface LayoutProps {
  children: ReactNode;
}

const Layout = ({ children }: LayoutProps) => {
  const isMobile = useMediaQuery("(max-width: 768px)");

  return (
    <div className="min-h-screen bg-background">
      <MobileLayout>
        <main className="container mx-auto px-4 pb-20">
          {children}
        </main>
      </MobileLayout>
      <MobileNav />
    </div>
  );
};

export default Layout; 