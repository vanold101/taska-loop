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
      const monthKey = `${new Date(date).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}`;
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
      .sort((a, b) => {
        const dateA = new Date(a.date);
        const dateB = new Date(b.date);
        return dateA.getTime() - dateB.getTime();
      });

    setSpendingData(monthlySpendingData);

    // Calculate category totals from transactions
    const categories = transactions.reduce((acc: Record<string, number>, transaction) => {
      const category = transaction.tripId ? 'Shopping' : transaction.type;
      acc[category] = (acc[category] || 0) + transaction.amount;
      return acc;
    }, {});

    const total = Object.values(categories).reduce((sum, amount) => sum + amount, 0);

    // Fix NaN% by handling division by zero and ensuring valid percentages
    const categoryBreakdown = Object.entries(categories).map(([category, amount]) => ({
      category,
      amount,
      percentage: total > 0 ? (amount / total) * 100 : 0
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
          <div className="p-2 rounded-lg bg-white/80 dark:bg-gray-800/70 backdrop-blur-sm shadow-sm">
            <h3 className="text-lg font-bold text-gray-800 dark:text-gray-100 mb-2 ml-2">Monthly Spending</h3>
            <div className="h-[200px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart 
                  data={spendingData} 
                  margin={{ top: 10, right: 10, bottom: 10, left: 10 }}
                >
                  <CartesianGrid 
                    strokeDasharray="3 3" 
                    stroke="#5B674F" 
                    opacity={0.2}
                  />
                  <XAxis 
                    dataKey="date"
                    tick={{ fontSize: 13, fill: '#112211', fontWeight: 500 }}
                    tickFormatter={(date: string) => {
                      if (date.includes(' ')) {
                        const parts = date.split(' ');
                        return parts[0]; // Return just the month abbreviation
                      }
                      
                      // Otherwise convert from date string
                      return new Date(date).toLocaleDateString('en-US', { month: 'short' });
                    }}
                    stroke="#112211"
                    axisLine={{ strokeWidth: 1.5 }}
                  />
                  <YAxis 
                    tick={{ fontSize: 13, fill: '#112211', fontWeight: 500 }}
                    tickFormatter={(value: number) => `$${value}`}
                    stroke="#112211"
                    axisLine={{ strokeWidth: 1.5 }}
                  />
                  <Tooltip 
                    formatter={(value: number) => [`$${value.toFixed(2)}`, 'Amount']}
                    contentStyle={{
                      backgroundColor: '#FFFFFF',
                      border: 'none',
                      borderRadius: '8px',
                      boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                      padding: '8px 12px',
                      fontSize: '14px',
                      fontWeight: 'bold'
                    }}
                    labelStyle={{ color: '#112211', fontWeight: 'bold', marginBottom: '4px' }}
                    itemStyle={{ color: '#FF9F2F', fontWeight: 'bold' }}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="amount" 
                    stroke="#FF9F2F"
                    strokeWidth={3}
                    dot={{ r: 4, fill: '#FF9F2F', strokeWidth: 2, stroke: '#FFFFFF' }}
                    activeDot={{ r: 6, fill: '#FF9F2F', strokeWidth: 2, stroke: '#FFFFFF' }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
            {spendingData.length === 0 && (
              <div className="flex justify-center items-center h-24 text-gray-500 dark:text-gray-400">
                No spending data available
              </div>
            )}
          </div>
        </TabsContent>
        <TabsContent value="category">
          <div className="p-2 rounded-lg bg-white/80 dark:bg-gray-800/70 backdrop-blur-sm shadow-sm">
            <h3 className="text-lg font-bold text-gray-800 dark:text-gray-100 mb-2 ml-2">Spending by Category</h3>
            <div className="h-[200px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart 
                  data={categoryData} 
                  margin={{ top: 10, right: 10, bottom: 10, left: 10 }}
                >
                  <CartesianGrid 
                    strokeDasharray="3 3" 
                    stroke="#5B674F"
                    opacity={0.2}
                  />
                  <XAxis 
                    dataKey="category"
                    tick={{ fontSize: 13, fill: '#112211', fontWeight: 500 }}
                    stroke="#112211"
                    axisLine={{ strokeWidth: 1.5 }}
                  />
                  <YAxis 
                    tick={{ fontSize: 13, fill: '#112211', fontWeight: 500 }}
                    tickFormatter={(value: number) => `$${value}`}
                    stroke="#112211"
                    axisLine={{ strokeWidth: 1.5 }}
                  />
                  <Tooltip 
                    formatter={(value: number) => [`$${value.toFixed(2)}`, 'Amount']}
                    contentStyle={{
                      backgroundColor: '#FFFFFF',
                      border: 'none',
                      borderRadius: '8px',
                      boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                      padding: '8px 12px',
                      fontSize: '14px',
                      fontWeight: 'bold'
                    }}
                    labelStyle={{ color: '#112211', fontWeight: 'bold', marginBottom: '4px' }}
                    itemStyle={{ color: '#FF9F2F', fontWeight: 'bold' }}
                  />
                  <Bar 
                    dataKey="amount" 
                    fill="#FF9F2F"
                    radius={[6, 6, 0, 0]}
                    barSize={24}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
            {categoryData.length === 0 && (
              <div className="flex justify-center items-center h-24 text-gray-500 dark:text-gray-400">
                No category data available
              </div>
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default SpendingTrends; 