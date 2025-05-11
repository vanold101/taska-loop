
import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { 
  ChevronRight, 
  ChevronDown, 
  FolderOpen, 
  Folder, 
  Home,
  ShoppingCart,
  Map,
  Wallet,
  User, 
  Settings,
  LayoutDashboard,
  Package
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';
import { useToast } from '@/hooks/use-toast';

interface NavItem {
  name: string;
  path: string;
  icon: React.ReactNode;
  children?: NavItem[];
  isExpanded?: boolean;
}

interface FileSystemNavigationProps {
  className?: string;
}

const FileSystemNavigation = ({ className }: FileSystemNavigationProps) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();
  
  // Navigation structure
  const [navItems, setNavItems] = useState<NavItem[]>([
    {
      name: 'Home',
      path: '/home',
      icon: <Home className="h-4 w-4" />,
    },
    {
      name: 'Dashboard',
      path: '/dashboard',
      icon: <LayoutDashboard className="h-4 w-4" />,
    },
    {
      name: 'Map',
      path: '/map',
      icon: <Map className="h-4 w-4" />,
    },
    {
      name: 'Shopping',
      path: '/trips',
      icon: <ShoppingCart className="h-4 w-4" />,
      isExpanded: true,
      children: [
        {
          name: 'Active Trips',
          path: '/trips',
          icon: <ShoppingCart className="h-3 w-3" />,
        },
        {
          name: 'Pantry',
          path: '/pantry',
          icon: <Package className="h-3 w-3" />
        }
      ]
    },
    {
      name: 'Ledger',
      path: '/ledger',
      icon: <Wallet className="h-4 w-4" />,
    },
    {
      name: 'Profile',
      path: '/profile',
      icon: <User className="h-4 w-4" />,
    },
    {
      name: 'Settings',
      path: '/settings',
      icon: <Settings className="h-4 w-4" />,
    }
  ]);
  
  // Toggle folder expansion
  const toggleExpand = (index: number) => {
    const updatedItems = [...navItems];
    updatedItems[index].isExpanded = !updatedItems[index].isExpanded;
    setNavItems(updatedItems);
  };
  
  // Navigate to page
  const navigateTo = (path: string, name: string) => {
    navigate(path);
    toast({
      title: `Navigating to ${name}`,
      duration: 1500
    });
  };
  
  // Check if a route is active
  const isActive = (path: string) => {
    return location.pathname === path;
  };

  return (
    <div className={cn('p-2 bg-white/80 dark:bg-gray-800/80 rounded-lg shadow-md backdrop-blur-sm', className)}>
      <div className="text-sm font-medium text-gray-900 dark:text-gray-100 pb-2 mb-2 border-b">
        Navigation
      </div>
      <div className="space-y-1">
        {navItems.map((item, index) => (
          <div key={item.name} className="text-sm">
            {item.children ? (
              <div className="space-y-1">
                <button
                  className={cn(
                    'flex items-center w-full px-2 py-1.5 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700/50 transition-colors',
                    isActive(item.path) && 'bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400'
                  )}
                  onClick={() => toggleExpand(index)}
                >
                  {item.isExpanded ? (
                    <ChevronDown className="h-3.5 w-3.5 mr-1.5 text-gray-500 dark:text-gray-400" />
                  ) : (
                    <ChevronRight className="h-3.5 w-3.5 mr-1.5 text-gray-500 dark:text-gray-400" />
                  )}
                  {item.isExpanded ? (
                    <FolderOpen className="h-4 w-4 mr-2 text-blue-500" />
                  ) : (
                    <Folder className="h-4 w-4 mr-2 text-yellow-500" />
                  )}
                  <span>{item.name}</span>
                </button>
                
                {item.isExpanded && item.children && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.2 }}
                    className="ml-6 pl-2 border-l border-gray-200 dark:border-gray-700 space-y-1"
                  >
                    {item.children.map((child) => (
                      <button
                        key={child.name}
                        className={cn(
                          'flex items-center w-full px-2 py-1.5 rounded-md text-sm hover:bg-gray-100 dark:hover:bg-gray-700/50 transition-colors',
                          isActive(child.path) && 'bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400'
                        )}
                        onClick={() => navigateTo(child.path, child.name)}
                      >
                        {child.icon}
                        <span className="ml-2">{child.name}</span>
                      </button>
                    ))}
                  </motion.div>
                )}
              </div>
            ) : (
              <button
                className={cn(
                  'flex items-center w-full px-2 py-1.5 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700/50 transition-colors',
                  isActive(item.path) && 'bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400'
                )}
                onClick={() => navigateTo(item.path, item.name)}
              >
                <span className="w-5 mr-2 flex items-center">{item.icon}</span>
                <span>{item.name}</span>
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default FileSystemNavigation;
