import { Toaster } from "./components/ui/toaster";
import { Toaster as Sonner } from "./components/ui/sonner";
import { TooltipProvider } from "./components/ui/tooltip";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { useEffect } from "react";
import { TaskProvider } from "./context/TaskContext";

// Import pages
import Landing from "./pages/Landing";
import HomePage from "./pages/Index";
import TripsPage from "./pages/Trips";
import MapPage from "./pages/Map";
import PantryPage from "./pages/Pantry";
import ProfilePage from "./pages/Profile";
import SettingsPage from "./pages/Settings";
import LedgerPage from "./pages/Ledger";
import NotFound from "./pages/NotFound";
import DashboardPage from "./pages/Dashboard";

const App = () => {
  // Detect and apply user preferences for dark mode
  useEffect(() => {
    // Check for user's preference in localStorage or system preference
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    const storedTheme = localStorage.getItem('theme');
    
    if (storedTheme === 'dark' || (!storedTheme && prefersDark)) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, []);
  
  return (
    <TaskProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <div className="min-h-screen bg-gloop-bg dark:bg-gloop-dark-bg max-w-md mx-auto pb-20">
            <Routes>
              <Route path="/" element={<Landing />} />
              <Route path="/home" element={<HomePage />} />
              <Route path="/dashboard" element={<DashboardPage />} />
              <Route path="/map" element={<MapPage />} />
              <Route path="/trips" element={<TripsPage />} />
              <Route path="/ledger" element={<LedgerPage />} />
              <Route path="/pantry" element={<PantryPage />} />
              <Route path="/profile" element={<ProfilePage />} />
              <Route path="/settings" element={<SettingsPage />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </div>
        </BrowserRouter>
      </TooltipProvider>
    </TaskProvider>
  );
};

export default App;
