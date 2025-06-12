import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import {
  Calculator,
  CalendarDays,
  ListTodo,
  MapPin,
  Package,
  Search,
  Settings,
  ShoppingBag,
  ShoppingCart,
  User,
  Users,
  PieChart,
  Home,
  X,
  Menu,
} from "lucide-react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Avatar, AvatarFallback, AvatarImage } from "../components/ui/avatar";
import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { cn } from "../lib/utils";

// Define the sidebar context type
type SidebarContextType = {
  isOpen: boolean;
  toggleSidebar: () => void;
  closeSidebar: () => void;
};

// Create a React context for the sidebar
const SidebarContext = createContext<SidebarContextType | undefined>(undefined);

// Create a provider component
export function SidebarProvider({ children }: { children: ReactNode }) {
  const [isOpen, setIsOpen] = useState(true);
  const [isMobile, setIsMobile] = useState(false);

  // Check if we're on mobile
  useEffect(() => {
    const checkIfMobile = () => {
      setIsMobile(window.innerWidth < 768);
      if (window.innerWidth < 768) {
        setIsOpen(false);
      } else {
        setIsOpen(true);
      }
    };

    // Set initial value
    checkIfMobile();

    // Add event listener
    window.addEventListener('resize', checkIfMobile);

    // Clean up
    return () => window.removeEventListener('resize', checkIfMobile);
  }, []);

  const toggleSidebar = () => setIsOpen(!isOpen);
  const closeSidebar = () => setIsOpen(false);

  return (
    <SidebarContext.Provider value={{ isOpen, toggleSidebar, closeSidebar }}>
      {children}
    </SidebarContext.Provider>
  );
}

// Custom hook to use the sidebar context
export function useSidebar() {
  const context = useContext(SidebarContext);
  if (context === undefined) {
    throw new Error("useSidebar must be used within a SidebarProvider");
  }
  return context;
}

// The navigation items that will be consistent across all pages
const navigationItems = [
  { path: "/home", icon: <Home className="h-5 w-5" />, label: "Home" },
  { path: "/map", icon: <MapPin className="h-5 w-5" />, label: "Map" },
  { path: "/trips", icon: <Users className="h-5 w-5" />, label: "Trips" },
  { path: "/pantry", icon: <Package className="h-5 w-5" />, label: "Pantry" },
  { path: "/ledger", icon: <PieChart className="h-5 w-5" />, label: "Ledger" },
  { path: "/dashboard", icon: <ShoppingCart className="h-5 w-5" />, label: "Dashboard" },
  { path: "/profile", icon: <User className="h-5 w-5" />, label: "Profile" },
];

// Mobile navbar component for showing a toggle button on mobile
export function MobileNavbar() {
  const { toggleSidebar } = useSidebar();
  
  return (
    <div className="md:hidden fixed top-0 left-0 right-0 h-14 bg-white border-b border-slate-200 z-40 flex items-center px-4">
      <Button variant="ghost" size="icon" onClick={toggleSidebar}>
        <Menu className="h-5 w-5" />
      </Button>
      <div className="flex items-center gap-2 mx-auto">
        <ListTodo className="h-5 w-5 text-teal-600" />
        <span className="text-lg font-bold text-teal-600">TaskaLoop</span>
      </div>
    </div>
  );
}

// Sidebar component with consistent navigation items
export function Sidebar() {
  const location = useLocation();
  const navigate = useNavigate();
  const { isOpen, closeSidebar } = useSidebar();
  const path = location.pathname;

  // Close sidebar on navigation on mobile
  const handleNavigation = (targetPath: string) => {
    navigate(targetPath);
    if (window.innerWidth < 768) {
      closeSidebar();
    }
  };

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div 
          className="md:hidden fixed inset-0 bg-black/30 z-40"
          onClick={closeSidebar}
        ></div>
      )}

      {/* Sidebar */}
      <aside 
        className={cn(
          "fixed inset-y-0 left-0 w-64 bg-white border-r border-slate-200 z-50 transition-transform duration-300 ease-in-out",
          isOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
        )}
      >
        <div className="flex items-center justify-between p-4 border-b border-slate-200">
          <div className="flex items-center gap-2">
            <ListTodo className="h-6 w-6 text-teal-600" />
            <span className="text-xl font-bold text-teal-600">TaskaLoop</span>
          </div>
          <Button 
            variant="ghost" 
            size="icon" 
            className="md:hidden"
            onClick={closeSidebar}
          >
            <X className="h-5 w-5" />
          </Button>
        </div>

        <nav className="px-2 py-4">
          <div className="px-3 py-2">
            <h3 className="text-xs font-medium text-slate-500 uppercase tracking-wider">Main</h3>
          </div>
          <div className="space-y-1">
            {navigationItems.map(item => (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-md ${
                  path.startsWith(item.path) 
                    ? "bg-slate-100 text-teal-700" 
                    : "text-slate-700 hover:bg-slate-100"
                }`}
                onClick={() => handleNavigation(item.path)}
              >
                {item.icon}
                {item.label}
              </Link>
            ))}
          </div>
        </nav>

        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-slate-200">
          <div className="flex items-center gap-3">
            <div onClick={() => handleNavigation("/profile")} className="cursor-pointer">
              <Avatar>
                <AvatarImage src="/placeholder.svg?height=40&width=40" />
                <AvatarFallback className="bg-teal-100 text-teal-700">JD</AvatarFallback>
              </Avatar>
            </div>
            <div className="flex-1 min-w-0">
              <p 
                onClick={() => handleNavigation("/profile")} 
                className="text-sm font-medium text-slate-700 truncate cursor-pointer hover:underline"
              >
                Jane Doe
              </p>
              <p className="text-xs text-slate-500 truncate">jane.doe@example.com</p>
            </div>
            <Button 
              variant="ghost" 
              size="icon" 
              className="text-slate-500 hover:text-slate-700"
              onClick={() => handleNavigation("/settings")}
            >
              <Settings className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </aside>
    </>
  );
} 