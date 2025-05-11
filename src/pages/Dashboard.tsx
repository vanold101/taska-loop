import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { DashboardShell } from "@/components/shell";
import { DashboardHeader } from "@/components/header";
import { Overview } from "@/components/overview";
import { RecentSales } from "@/components/recent-sales";
import SpendingTrends from "@/components/SpendingTrends";
import StoreAnalytics from "@/components/StoreAnalytics";
import NavBar from "@/components/NavBar";
import { loadTransactions, calculateUserBalances, Transaction } from "@/services/LedgerService";
import { useTaskContext, Trip, TripItem } from "@/context/TaskContext";
import CreateTripModal from "@/components/CreateTripModal";

interface RecentActivity {
  initials: string;
  name: string;
  action: string;
  time: string;
  amount: number;
}

const DashboardPage = () => {
  const navigate = useNavigate();
  const { trips, addTrip } = useTaskContext();
  const [totalSpent, setTotalSpent] = useState(0);
  const [monthlyChange, setMonthlyChange] = useState(0);
  const [activeTrips, setActiveTrips] = useState(0);
  const [pendingTrips, setPendingTrips] = useState(0);
  const [recentActivity, setRecentActivity] = useState<RecentActivity[]>([]);
  const [isTripModalOpen, setTripModalOpen] = useState(false);

  useEffect(() => {
    // Load real transaction data
    const transactions = loadTransactions();
    const balances = calculateUserBalances();
    
    // Calculate total spent
    const total = transactions.reduce((sum, t) => sum + t.amount, 0);
    setTotalSpent(total);
    
    // Calculate monthly change
    const now = new Date();
    const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1);
    
    const thisMonthTotal = transactions
      .filter(t => new Date(t.timestamp) >= lastMonth)
      .reduce((sum, t) => sum + t.amount, 0);
      
    const previousMonthTotal = transactions
      .filter(t => {
        const date = new Date(t.timestamp);
        return date >= new Date(lastMonth.getFullYear(), lastMonth.getMonth() - 1) &&
               date < lastMonth;
      })
      .reduce((sum, t) => sum + t.amount, 0);
    
    const change = ((thisMonthTotal - previousMonthTotal) / previousMonthTotal) * 100;
    setMonthlyChange(change);
    
    // Set recent activity
    setRecentActivity(
      transactions
        .sort((a, b) => b.timestamp - a.timestamp)
        .slice(0, 2)
        .map(t => ({
          initials: t.fromUserName.substring(0, 2).toUpperCase(),
          name: t.fromUserName,
          action: t.description,
          time: new Date(t.timestamp).toLocaleDateString(),
          amount: t.amount
        }))
    );
  }, []);

  // Update trip counts when trips change
  useEffect(() => {
    if (trips) {
      const active = trips.filter((trip: Trip) => trip.status !== 'completed').length;
      const pending = trips.filter((trip: Trip) => 
        trip.status !== 'completed' && trip.items.some((item: TripItem) => !item.checked)
      ).length;
      setActiveTrips(active);
      setPendingTrips(pending);
    }
  }, [trips]);

  const handleStartNewTrip = () => {
    setTripModalOpen(true);
  };

  const handleCreateTrip = (data: { store: string; eta: string }) => {
    // Create a new trip with default values
    const newTrip: Omit<Trip, 'id'> = {
      store: data.store,
      location: data.store,
      coordinates: { lat: 39.9650, lng: -83.0200 }, // Default coordinates
      eta: data.eta,
      status: 'open',
      items: [],
      participants: [
        { id: '1', name: 'You', avatar: "https://example.com/you.jpg" }
      ],
      shopper: {
        name: "You",
        avatar: "https://example.com/you.jpg"
      },
      date: new Date().toISOString() // Add current date as default
    };
    
    // Add trip to context
    addTrip(newTrip);
    
    setTripModalOpen(false);
    navigate('/trips');
  };

  const handleViewLedger = () => {
    navigate('/ledger');
  };

  return (
    <div className="flex flex-col min-h-screen">
      <NavBar />
      
      <main className="flex-grow w-full px-[5vw] md:px-[8vw] lg:px-[10vw] py-6 md:py-8 pb-20 md:pb-24">
        <header className="mb-6 md:mb-8">
          <h1 className="text-[clamp(1.875rem,4vw,2.5rem)] font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-green-600 dark:from-blue-400 dark:to-green-400">
            Dashboard
          </h1>
        </header>

        <div className="space-y-6">
          {/* Overview Cards */}
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm border border-gray-200 dark:border-gray-700">
              <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">Total Spent</h3>
              <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">${totalSpent.toFixed(2)}</p>
              <p className={`text-xs ${monthlyChange >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'} mt-1`}>
                {monthlyChange >= 0 ? '+' : ''}{monthlyChange.toFixed(1)}% from last month
              </p>
            </div>
            <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm border border-gray-200 dark:border-gray-700">
              <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">Active Trips</h3>
              <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">{activeTrips}</p>
              <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">{pendingTrips} pending completion</p>
            </div>
          </div>

          {/* Recent Activity */}
          <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm border border-gray-200 dark:border-gray-700">
            <h2 className="text-lg font-medium mb-4 text-gray-900 dark:text-gray-100">Recent Activity</h2>
            <div className="space-y-4">
              {recentActivity.map((activity, index) => (
                <div key={index} className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-r from-blue-500 to-green-500 flex items-center justify-center text-white">
                    <span className="text-sm font-medium">{activity.initials}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate text-gray-900 dark:text-gray-100">
                      {activity.name} {activity.action}
                    </p>
                    <p className="text-xs text-gray-600 dark:text-gray-400">{activity.time}</p>
                  </div>
                  <span className="text-sm font-medium text-green-600 dark:text-green-400">
                    ${activity.amount.toFixed(2)}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Analytics Section */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Spending Trends */}
            <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm border border-gray-200 dark:border-gray-700">
              <h2 className="text-lg font-medium mb-4 text-gray-900 dark:text-gray-100">Spending Analysis</h2>
              <SpendingTrends />
            </div>

            {/* Store Analytics */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
              <StoreAnalytics />
            </div>
          </div>

          {/* Quick Actions */}
          <div className="grid grid-cols-2 gap-4">
            <button 
              onClick={handleStartNewTrip}
              className="bg-white dark:bg-gray-800 rounded-lg p-4 text-left shadow-sm border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
            >
              <h3 className="text-sm font-medium mb-1 text-gray-900 dark:text-gray-100">Start New Trip</h3>
              <p className="text-xs text-gray-600 dark:text-gray-400">Create a shopping trip</p>
            </button>
            <button 
              onClick={handleViewLedger}
              className="bg-white dark:bg-gray-800 rounded-lg p-4 text-left shadow-sm border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
            >
              <h3 className="text-sm font-medium mb-1 text-gray-900 dark:text-gray-100">View Ledger</h3>
              <p className="text-xs text-gray-600 dark:text-gray-400">Check balances</p>
            </button>
          </div>
        </div>
      </main>

      <CreateTripModal 
        isOpen={isTripModalOpen} 
        onClose={() => setTripModalOpen(false)}
        onSubmit={handleCreateTrip}
      />
    </div>
  );
};

export default DashboardPage; 