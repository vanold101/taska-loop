import { Toaster } from "./components/ui/toaster";
import { Toaster as Sonner } from "./components/ui/sonner";
import { TooltipProvider } from "./components/ui/tooltip";
import { HashRouter, Routes, Route, Navigate } from "react-router-dom";
import { useEffect } from "react";
import { TaskProvider } from "./context/TaskContext";
import { AuthProvider } from "./context/AuthContext";
import { SubscriptionProvider } from "./context/SubscriptionContext";
import { TutorialProvider } from "./context/TutorialContext";
import { TripsProvider } from "./context/TripsContext";
import { HouseholdProvider } from "./context/HouseholdContext";
import NotificationProvider from "./context/NotificationContext";
import { PantryProvider } from "./context/PantryContext";
import UserSwitcher from "./components/UserSwitcher";
import WelcomeTutorial from "./components/WelcomeTutorial";

// Import pages
import Landing from "./pages/Landing";
import HomePage from "./pages/Home";
import TripsPage from "./pages/TripsPage";
import MapPage from "./pages/Map";
import PantryPage from "./pages/PantryPage";
import RecurringItemsPage from "./pages/RecurringItemsPage";
import ProfilePage from "./pages/ProfilePage";
import SettingsPage from "./pages/SettingsPage";
import LedgerPage from "./pages/Ledger";
import NotFound from "./pages/NotFound";
import DashboardPage from "./pages/DashboardPage";
import LoginPage from "./pages/LoginPage";
import CalendarPage from "./pages/CalendarPage";
import AdminLoginPage from "./pages/AdminLoginPage";
import AdminDashboardPage from "./pages/AdminDashboardPage";
import InviteHouseholdPage from "./pages/InviteHouseholdPage";
import ProtectedRoute from "./components/ProtectedRoute";
import AdminRoute from "./components/AdminRoute";
import TripDetailPage from "./pages/TripDetailPage";

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
    <TooltipProvider>
      <AuthProvider>
        <SubscriptionProvider>
          <TutorialProvider>
            <TaskProvider>
              <TripsProvider>
                <HouseholdProvider>
                  <NotificationProvider>
                    <PantryProvider>
                      <HashRouter>
                        <div className="min-h-screen flex flex-col bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
                          <div className="pattern-overlay"></div>
                          <UserSwitcher />
                          <Routes>
                            {/* Public routes */}
                            <Route path="/" element={<Landing />} />
                            <Route path="/login" element={<LoginPage />} />
                            
                            {/* Admin routes */}
                            <Route path="/admin/login" element={<AdminLoginPage />} />
                            <Route path="/admin/dashboard" element={
                              <AdminRoute>
                                <AdminDashboardPage />
                              </AdminRoute>
                            } />
                            
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
                            <Route path="/trip/:id" element={
                              <ProtectedRoute>
                                <TripDetailPage />
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
                            <Route path="/calendar" element={
                              <ProtectedRoute>
                                <CalendarPage />
                              </ProtectedRoute>
                            } />
                            <Route path="/profile" element={
                              <ProtectedRoute>
                                <ProfilePage />
                              </ProtectedRoute>
                            } />
                            <Route path="/invite-household" element={
                              <ProtectedRoute>
                                <InviteHouseholdPage />
                              </ProtectedRoute>
                            } />
                            <Route path="/household" element={
                              <ProtectedRoute>
                                <ProfilePage />
                              </ProtectedRoute>
                            } />
                            <Route path="/roommates" element={
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
                            <Route path="/recurring-items" element={
                              <ProtectedRoute>
                                <RecurringItemsPage />
                              </ProtectedRoute>
                            } />
                            
                            {/* Catch all route */}
                            <Route path="*" element={<NotFound />} />
                          </Routes>
                          
                          {/* Tutorial overlay */}
                          <WelcomeTutorial />
                        </div>
                        <Toaster />
                        <Sonner />
                      </HashRouter>
                    </PantryProvider>
                  </NotificationProvider>
                </HouseholdProvider>
              </TripsProvider>
            </TaskProvider>
          </TutorialProvider>
        </SubscriptionProvider>
      </AuthProvider>
    </TooltipProvider>
  );
};

export default App;
