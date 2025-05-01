
import { useState } from 'react';
import { Link, useLocation } from "react-router-dom";
import { ShoppingCart, Home, Map, Airplay, User } from "lucide-react";
import { cn } from "@/lib/utils";

const NavBar = () => {
  const location = useLocation();
  const [activeItem, setActiveItem] = useState(location.pathname);

  const navItems = [
    { name: 'Home', path: '/home', icon: <Home className="w-5 h-5" /> },
    { name: 'Map', path: '/map', icon: <Map className="w-5 h-5" /> },
    { name: 'Trips', path: '/trips', icon: <ShoppingCart className="w-5 h-5" /> },
    { name: 'Pantry', path: '/pantry', icon: <Airplay className="w-5 h-5" /> },
    { name: 'Profile', path: '/profile', icon: <User className="w-5 h-5" /> }
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 py-2 px-4 z-10">
      <nav className="flex justify-between items-center max-w-md mx-auto">
        {navItems.map((item) => (
          <Link 
            key={item.path} 
            to={item.path} 
            onClick={() => setActiveItem(item.path)}
            className={cn(
              "flex flex-col items-center px-4 py-2 rounded-lg transition-colors",
              activeItem === item.path 
                ? "text-gloop-primary" 
                : "text-gloop-text-muted hover:text-gloop-text-main"
            )}
          >
            {item.icon}
            <span className="text-xs mt-1">{item.name}</span>
          </Link>
        ))}
      </nav>
    </div>
  );
};

export default NavBar;
