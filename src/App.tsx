import { Toaster } from "./components/ui/toaster";
import { Toaster as Sonner } from "./components/ui/sonner";
import { TooltipProvider } from "./components/ui/tooltip";
import { HashRouter as Router, Routes, Route } from "react-router-dom";
import { useEffect } from "react";
import { TaskProvider } from "./context/TaskContext";
import { AuthProvider } from "./context/AuthContext";
import { TripProvider } from "./context/TripContext";

// Import pages
import Landing from "./pages/Landing";
import HomePage from "./pages/Index";
import TripsPage from "./pages/Trips";
import MapPage from "./pages/Map";
import PantryPage from "./pages/Pantry";
import ProfilePage from "./pages/Profile";
import SettingsPage from "./pages/SettingsPage";
import LedgerPage from "./pages/Ledger";
import NotFound from "./pages/NotFound";
import DashboardPage from "./pages/Dashboard";
import LoginPage from "./pages/LoginPage";
import ProtectedRoute from "./components/ProtectedRoute";

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
        <AuthProvider>
          <TripProvider>
            <Router>
              <div className="min-h-screen flex flex-col bg-gradient-radial from-blue-500/15 via-green-500/15 to-purple-500/20 dark:from-blue-900/40 dark:via-green-900/30 dark:to-purple-900/50 animate-gradient-slow relative">
                <div className="pattern-overlay"></div>
                <Routes>
                  <Route path="/" element={<Landing />} />
                  <Route path="/home" element={<HomePage />} />
                  <Route path="/dashboard" element={<DashboardPage />} />
                  <Route path="/map" element={<MapPage />} />
                  <Route path="/trips" element={<TripsPage />} />
                  <Route path="/ledger" element={<LedgerPage />} />
                  <Route path="/pantry" element={<PantryPage />} />
                  <Route path="/profile" element={<ProfilePage />} />
                  <Route path="/settings" element={<ProtectedRoute><SettingsPage /></ProtectedRoute>} />
                  <Route path="*" element={<NotFound />} />
                </Routes>
              </div>
            </Router>
          </TripProvider>
        </AuthProvider>
      </TooltipProvider>
    </TaskProvider>
  );
};

export default App;
