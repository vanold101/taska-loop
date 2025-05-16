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
    <div className="min-h-screen bg-transparent">
      <MobileLayout>
        <main className="max-w-screen-xl mx-auto px-4 md:px-6 lg:px-8 pb-20">
          {children}
        </main>
      </MobileLayout>
      <MobileNav />
    </div>
  );
};

export default Layout; 