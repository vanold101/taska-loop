"use client";

import { useState, useEffect } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar
} from "recharts";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { loadTransactions, Transaction } from "@/services/LedgerService";

interface SpendingData {
  date: string;
  amount: number;
  category: string;
}

interface CategoryData {
  category: string;
  amount: number;
  percentage: number;
}

interface CategoryColors {
  [key: string]: string;
}

const SpendingTrends = () => {
  const [viewType, setViewType] = useState("trend");
  const [spendingData, setSpendingData] = useState<SpendingData[]>([]);
  const [categoryData, setCategoryData] = useState<CategoryData[]>([]);

  useEffect(() => {
    // Load real transaction data
    const transactions = loadTransactions();
    
    // Group transactions by month and calculate totals
    const monthlyData = transactions.reduce((acc: Record<string, number>, transaction) => {
      const date = new Date(transaction.timestamp);
      const monthKey = date.toLocaleDateString('en-US', { year: 'numeric', month: 'short' });
      acc[monthKey] = (acc[monthKey] || 0) + transaction.amount;
      return acc;
    }, {});

    // Convert to array format for chart
    const monthlySpendingData = Object.entries(monthlyData)
      .map(([date, amount]) => ({
        date,
        amount,
        category: 'All' // We'll implement category tracking in a future update
      }))
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

    setSpendingData(monthlySpendingData);

    // Calculate category totals from transactions
    const categories = transactions.reduce((acc: Record<string, number>, transaction) => {
      const category = transaction.tripId ? 'Shopping' : transaction.type;
      acc[category] = (acc[category] || 0) + transaction.amount;
      return acc;
    }, {});

    const total = Object.values(categories).reduce((sum, amount) => sum + amount, 0);

    const categoryBreakdown = Object.entries(categories).map(([category, amount]) => ({
      category,
      amount,
      percentage: (amount / total) * 100
    }));

    setCategoryData(categoryBreakdown);
  }, []);

  const categoryColors: CategoryColors = {
    Shopping: '#FF9F2F',
    expense: '#3DBE7B',
    payment: '#FFC940',
    Other: '#808080'
  };

  return (
    <div className="w-full">
      <Tabs value={viewType} onValueChange={setViewType} className="w-full">
        <TabsList className="w-full mb-4 bg-white/35 backdrop-blur dark:bg-[#262A24]">
          <TabsTrigger 
            value="trend" 
            className="flex-1 data-[state=active]:bg-[#FF9F2F] data-[state=active]:text-white"
          >
            Trend
          </TabsTrigger>
          <TabsTrigger 
            value="category" 
            className="flex-1 data-[state=active]:bg-[#FF9F2F] data-[state=active]:text-white"
          >
            Categories
          </TabsTrigger>
        </TabsList>
        <TabsContent value="trend">
          <div className="h-[180px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart 
                data={spendingData} 
                margin={{ top: 5, right: 5, bottom: 5, left: 5 }}
              >
                <CartesianGrid 
                  strokeDasharray="3 3" 
                  stroke="#5B674F" 
                  opacity={0.2}
                />
                <XAxis 
                  dataKey="date"
                  tick={{ fontSize: 12, fill: '#5B674F' }}
                  tickFormatter={(date: string) => new Date(date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                  stroke="#5B674F"
                />
                <YAxis 
                  tick={{ fontSize: 12, fill: '#5B674F' }}
                  tickFormatter={(value: number) => `$${value}`}
                  stroke="#5B674F"
                />
                <Tooltip 
                  formatter={(value: number) => [`$${value.toFixed(2)}`, 'Amount']}
                  contentStyle={{
                    backgroundColor: '#FFFFFF',
                    border: 'none',
                    borderRadius: '8px',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
                  }}
                  labelStyle={{ color: '#112211' }}
                  itemStyle={{ color: '#FF9F2F' }}
                />
                <Line 
                  type="monotone" 
                  dataKey="amount" 
                  stroke="#FF9F2F"
                  strokeWidth={2}
                  dot={false}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </TabsContent>
        <TabsContent value="category">
          <div className="h-[180px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart 
                data={categoryData} 
                margin={{ top: 5, right: 5, bottom: 5, left: 5 }}
              >
                <CartesianGrid 
                  strokeDasharray="3 3" 
                  stroke="#5B674F"
                  opacity={0.2}
                />
                <XAxis 
                  dataKey="category"
                  tick={{ fontSize: 12, fill: '#5B674F' }}
                  stroke="#5B674F"
                />
                <YAxis 
                  tick={{ fontSize: 12, fill: '#5B674F' }}
                  tickFormatter={(value: number) => `$${value}`}
                  stroke="#5B674F"
                />
                <Tooltip 
                  formatter={(value: number) => [`$${value.toFixed(2)}`, 'Amount']}
                  contentStyle={{
                    backgroundColor: '#FFFFFF',
                    border: 'none',
                    borderRadius: '8px',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
                  }}
                  labelStyle={{ color: '#112211' }}
                  itemStyle={{ color: '#5B674F' }}
                />
                <Bar 
                  dataKey="amount" 
                  fill="#FF9F2F"
                  radius={[4, 4, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default SpendingTrends; 