import { Toaster } from "./components/ui/toaster";
import { Toaster as Sonner } from "./components/ui/sonner";
import { TooltipProvider } from "./components/ui/tooltip";
import { HashRouter as Router, Routes, Route, Navigate } from "react-router-dom";
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
  // Apply theme preferences with light mode as default
  useEffect(() => {
    // Only check for theme in localStorage, default to light mode
    const storedTheme = localStorage.getItem('theme');
    
    // If theme is explicitly set to dark, use dark mode
    // Otherwise, always default to light mode
    if (storedTheme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      // Set default theme to light in localStorage if not already set
      if (!storedTheme) {
        localStorage.setItem('theme', 'light');
      }
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
                  {/* Public routes */}
                  <Route path="/" element={<Landing />} />
                  <Route path="/login" element={<LoginPage />} />
                  
                  {/* Protected routes */}
                  <Route path="/home" element={
                    <ProtectedRoute>
                      <HomePage />
                    </ProtectedRoute>
                  } />
                  <Route path="/dashboard" element={
                    <ProtectedRoute>
                      <DashboardPage />
                    </ProtectedRoute>
                  } />
                  <Route path="/map" element={
                    <ProtectedRoute>
                      <MapPage />
                    </ProtectedRoute>
                  } />
                  <Route path="/trips" element={
                    <ProtectedRoute>
                      <TripsPage />
                    </ProtectedRoute>
                  } />
                  <Route path="/ledger" element={
                    <ProtectedRoute>
                      <LedgerPage />
                    </ProtectedRoute>
                  } />
                  <Route path="/pantry" element={
                    <ProtectedRoute>
                      <PantryPage />
                    </ProtectedRoute>
                  } />
                  <Route path="/profile" element={
                    <ProtectedRoute>
                      <ProfilePage />
                    </ProtectedRoute>
                  } />
                  <Route path="/settings" element={
                    <ProtectedRoute>
                      <SettingsPage />
                    </ProtectedRoute>
                  } />
                  <Route path="/history" element={
                    <Navigate to="/trips?view=past" replace />
                  } />
                  
                  {/* Catch all route */}
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
