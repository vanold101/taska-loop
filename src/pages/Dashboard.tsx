import { DashboardShell } from "@/components/shell";
import { DashboardHeader } from "@/components/header";
import { Overview } from "@/components/overview";
import { RecentSales } from "@/components/recent-sales";
import SpendingTrends from "@/components/SpendingTrends";
import NavBar from "@/components/NavBar";

const DashboardPage = () => {
  return (
    <div className="container mx-auto px-4 pb-24 pt-4 max-w-md bg-gradient-to-br from-[#FFFDF6] to-[#F0FDEA] dark:bg-[#1B1E18] min-h-screen">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-bold text-[#112211] dark:text-[#F7F9F5]">
          Dashboard
        </h1>
      </div>

      <div className="space-y-6">
        {/* Overview Cards */}
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-white/35 backdrop-blur dark:bg-[#262A24] rounded-lg p-4">
            <h3 className="text-sm font-medium text-[#5B674F] dark:text-[#A9B9A2] mb-2">Total Spent</h3>
            <p className="text-2xl font-bold text-[#112211] dark:text-[#F7F9F5]">$1,234</p>
            <p className="text-xs text-[#3DBE7B] dark:text-[#46C688] mt-1">+12% from last month</p>
          </div>
          <div className="bg-white/35 backdrop-blur dark:bg-[#262A24] rounded-lg p-4">
            <h3 className="text-sm font-medium text-[#5B674F] dark:text-[#A9B9A2] mb-2">Active Trips</h3>
            <p className="text-2xl font-bold text-[#112211] dark:text-[#F7F9F5]">3</p>
            <p className="text-xs text-[#5B674F] dark:text-[#A9B9A2] mt-1">2 pending completion</p>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-white/35 backdrop-blur dark:bg-[#262A24] rounded-lg p-4">
          <h2 className="text-lg font-medium mb-4 text-[#112211] dark:text-[#F7F9F5]">Recent Activity</h2>
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-[#FF9F2F] dark:bg-[#FFA94A] flex items-center justify-center text-white">
                <span className="text-sm font-medium">JD</span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate text-[#112211] dark:text-[#F7F9F5]">John Doe completed a trip to Kroger</p>
                <p className="text-xs text-[#5B674F] dark:text-[#A9B9A2]">2 hours ago</p>
              </div>
              <span className="text-sm font-medium text-[#3DBE7B] dark:text-[#46C688]">$85.50</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-[#FF9F2F] dark:bg-[#FFA94A] flex items-center justify-center text-white">
                <span className="text-sm font-medium">AS</span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate text-[#112211] dark:text-[#F7F9F5]">Alice Smith added items to Walmart trip</p>
                <p className="text-xs text-[#5B674F] dark:text-[#A9B9A2]">4 hours ago</p>
              </div>
              <span className="text-sm font-medium text-[#3DBE7B] dark:text-[#46C688]">$42.75</span>
            </div>
          </div>
        </div>

        {/* Spending Trends */}
        <div className="bg-white/35 backdrop-blur dark:bg-[#262A24] rounded-lg p-4">
          <h2 className="text-lg font-medium mb-4 text-[#112211] dark:text-[#F7F9F5]">Spending Analysis</h2>
          <SpendingTrends />
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-2 gap-4">
          <button className="bg-white/35 backdrop-blur dark:bg-[#262A24] rounded-lg p-4 text-left hover:bg-[#FF9F2F]/10 dark:hover:bg-[#FFA94A]/10 transition-colors">
            <h3 className="text-sm font-medium mb-1 text-[#112211] dark:text-[#F7F9F5]">Start New Trip</h3>
            <p className="text-xs text-[#5B674F] dark:text-[#A9B9A2]">Create a shopping trip</p>
          </button>
          <button className="bg-white/35 backdrop-blur dark:bg-[#262A24] rounded-lg p-4 text-left hover:bg-[#FF9F2F]/10 dark:hover:bg-[#FFA94A]/10 transition-colors">
            <h3 className="text-sm font-medium mb-1 text-[#112211] dark:text-[#F7F9F5]">View Ledger</h3>
            <p className="text-xs text-[#5B674F] dark:text-[#A9B9A2]">Check balances</p>
          </button>
        </div>
      </div>

      <NavBar />
    </div>
  );
};

export default DashboardPage; 