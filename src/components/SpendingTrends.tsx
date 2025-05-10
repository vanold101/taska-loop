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

  // Generate mock data
  useEffect(() => {
    // Generate mock spending data for the last 7 days
    const mockData: SpendingData[] = Array.from({ length: 7 }, (_, i) => ({
      date: new Date(Date.now() - (6 - i) * 24 * 60 * 60 * 1000).toLocaleDateString(),
      amount: Math.random() * 100 + 50,
      category: ['Groceries', 'Household', 'Utilities', 'Entertainment'][Math.floor(Math.random() * 4)]
    }));

    setSpendingData(mockData);

    // Calculate category totals
    const categories = mockData.reduce((acc, curr) => {
      acc[curr.category] = (acc[curr.category] || 0) + curr.amount;
      return acc;
    }, {} as Record<string, number>);

    const total = Object.values(categories).reduce((sum, amount) => sum + amount, 0);

    const categoryBreakdown = Object.entries(categories).map(([category, amount]) => ({
      category,
      amount,
      percentage: (amount / total) * 100
    }));

    setCategoryData(categoryBreakdown);
  }, []);

  const categoryColors: CategoryColors = {
    Groceries: '#FF9F2F',
    Household: '#3DBE7B',
    Utilities: '#FFC940',
    Entertainment: '#FF5757'
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