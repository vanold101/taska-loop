import React, { useMemo, useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { AppLayout } from "../components/AppLayout";
import { useTrips } from "../context/TripsContext";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
} from "recharts";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/ui/tabs";
import { ShoppingBag, Clock, DollarSign } from "lucide-react";
import { format } from 'date-fns';
import { Badge } from '../components/ui/badge';
import { ScrollArea } from '../components/ui/scroll-area';
import { cn } from '../lib/utils';

interface SpendingData {
  month: string;
  total: number;
  average: number;
  [key: string]: number | string; // For category spending
}

interface MonthlyStats {
  total: number;
  percentageChange: number;
}

interface CategoryBreakdown {
  category: string;
  amount: number;
  percentage: number;
}

const DashboardPage = () => {
  const { trips } = useTrips();
  const [spendingData, setSpendingData] = useState<SpendingData[]>([]);
  const [monthlyStats, setMonthlyStats] = useState<MonthlyStats>({
    total: 0,
    percentageChange: 0
  });

  // Calculate monthly spending data
  const monthlySpending = useMemo(() => {
    const monthData = new Map<string, { total: number; count: number; byCategory: Record<string, number> }>();
    
    trips.forEach(trip => {
      if (trip.status === 'completed') {
        const date = new Date(trip.createdAt);
        const monthKey = format(date, 'MMM yyyy');
        
        const tripTotal = trip.items.reduce((sum, item) => sum + (item.price || 0) * item.quantity, 0);
        
        if (!monthData.has(monthKey)) {
          monthData.set(monthKey, { total: 0, count: 0, byCategory: {} });
        }
        
        const monthInfo = monthData.get(monthKey)!;
        monthInfo.total += tripTotal;
        monthInfo.count += 1;
        
        // Aggregate by category
        trip.items.forEach((item: any) => {
          if (item.category) {
            monthInfo.byCategory[item.category] = (monthInfo.byCategory[item.category] || 0) + 
              (item.price || 0) * item.quantity;
          }
        });
      }
    });
    
    // Convert to array and sort by date
    return Array.from(monthData.entries())
      .map(([month, data]) => ({
        month,
        total: Number(data.total.toFixed(2)),
        average: Number((data.total / data.count).toFixed(2)),
        ...data.byCategory
      }))
      .sort((a, b) => {
        const dateA = new Date(a.month);
        const dateB = new Date(b.month);
        return dateA.getTime() - dateB.getTime();
      });
  }, [trips]);

  // Calculate current month stats
  const currentMonthStats = useMemo(() => {
    const currentMonth = format(new Date(), 'MMM yyyy');
    const currentStats = monthlySpending.find(m => m.month === currentMonth);
    const previousMonth = format(new Date(new Date().setMonth(new Date().getMonth() - 1)), 'MMM yyyy');
    const previousStats = monthlySpending.find(m => m.month === previousMonth);
    
    const percentageChange = previousStats && currentStats
      ? ((currentStats.total - previousStats.total) / previousStats.total * 100)
      : 0;
    
    return {
      total: currentStats?.total || 0,
      percentageChange: Number(percentageChange.toFixed(1))
    };
  }, [monthlySpending]);

  // Calculate category breakdown for current month
  const categoryBreakdown = useMemo(() => {
    const currentMonth = format(new Date(), 'MMM yyyy');
    const currentStats = monthlySpending.find(m => m.month === currentMonth);
    
    if (!currentStats) return [];
    
    return Object.entries(currentStats)
      .filter(([key]) => !['month', 'total', 'average'].includes(key))
      .map(([category, amount]) => ({
        category,
        amount: typeof amount === 'number' ? Number(amount.toFixed(2)) : 0,
        percentage: typeof amount === 'number' ? Number(((amount / currentStats.total) * 100).toFixed(1)) : 0
      }))
      .sort((a, b) => b.amount - a.amount);
  }, [monthlySpending]);

  // Calculate active trips
  const activeTrips = useMemo(() => {
    return trips.filter(trip => trip.status === 'open' || trip.status === 'shopping').length;
  }, [trips]);

  // Get recent activity
  const recentActivity = useMemo(() => {
    return trips
      .filter(trip => trip.status === 'completed')
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, 5);
  }, [trips]);

  useEffect(() => {
    setSpendingData(monthlySpending);
    setMonthlyStats(currentMonthStats);
  }, [monthlySpending, currentMonthStats]);

  return (
    <AppLayout>
      <div className="p-4 md:p-8 space-y-8">
        <h1 className="text-4xl font-bold text-blue-600">Dashboard</h1>

        <div className="grid gap-4 md:grid-cols-2">
          {/* Total Spent Card */}
          <Card className="bg-white">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Total Spent (This Month)
              </CardTitle>
              <Badge variant={monthlyStats.percentageChange >= 0 ? "default" : "destructive"}>
                {monthlyStats.percentageChange >= 0 ? "+" : ""}{monthlyStats.percentageChange}%
              </Badge>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">${monthlyStats.total.toFixed(2)}</div>
              <p className="text-xs text-muted-foreground">
                {monthlyStats.percentageChange >= 0 ? "Increase" : "Decrease"} from last month
              </p>
            </CardContent>
          </Card>

          {/* Active Trips Card */}
          <Card className="bg-white">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Trips</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{activeTrips}</div>
              <p className="text-xs text-muted-foreground">
                Open or in progress
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Recent Activity */}
        <Card className="bg-white">
          <CardContent className="p-6">
            <h2 className="text-lg font-medium text-gray-600 mb-4">Recent Activity</h2>
            <div className="space-y-4">
              {recentActivity.map((trip, i) => {
                const total = trip.items.reduce((sum, item) => 
                  sum + (item.price || 0) * item.quantity, 0
                );
                
                return (
                  <div key={trip.id} className="flex items-center justify-between py-2">
                    <div className="flex items-center gap-4">
                      <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
                        <ShoppingBag className="h-4 w-4 text-blue-600" />
                      </div>
                      <div>
                        <p className="font-medium">{trip.name}</p>
                        <p className="text-sm text-gray-500">
                          {new Date(trip.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-medium">
                        ${total.toFixed(2)}
                      </p>
                      <p className="text-sm text-gray-500">{trip.items.length} items</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Spending Analysis */}
        <div className="grid gap-4 md:grid-cols-2">
          <Card className="bg-white">
            <CardContent className="p-6">
              <h2 className="text-lg font-medium text-gray-600 mb-4">Spending Analysis</h2>
              <Tabs defaultValue="trend" className="w-full">
                <TabsList>
                  <TabsTrigger value="trend" className="flex-1">Trend</TabsTrigger>
                  <TabsTrigger value="categories" className="flex-1">Categories</TabsTrigger>
                </TabsList>
                <TabsContent value="trend">
                  <div className="h-[300px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={monthlySpending}>
                        <defs>
                          <linearGradient id="total" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#0ea5e9" stopOpacity={0.3}/>
                            <stop offset="95%" stopColor="#0ea5e9" stopOpacity={0}/>
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                        <XAxis dataKey="month" />
                        <YAxis />
                        <Tooltip 
                          content={({ active, payload }: any) => {
                            if (active && payload && payload.length) {
                              return (
                                <div className="rounded-lg border bg-background p-2 shadow-sm">
                                  <div className="grid grid-cols-2 gap-2">
                                    <div className="flex flex-col">
                                      <span className="text-[0.70rem] uppercase text-muted-foreground">
                                        Month
                                      </span>
                                      <span className="font-bold text-muted-foreground">
                                        {payload[0].payload.month}
                                      </span>
                                    </div>
                                    <div className="flex flex-col">
                                      <span className="text-[0.70rem] uppercase text-muted-foreground">
                                        Total
                                      </span>
                                      <span className="font-bold">
                                        ${payload[0].value}
                                      </span>
                                    </div>
                                  </div>
                                </div>
                              );
                            }
                            return null;
                          }}
                        />
                        <Area
                          type="monotone"
                          dataKey="total"
                          stroke="#0ea5e9"
                          fillOpacity={1}
                          fill="url(#total)"
                        />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </TabsContent>
                <TabsContent value="categories">
                  <div className="text-center text-gray-500 py-8">
                    Category breakdown coming soon
                  </div>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>

          {/* Shopping Insights */}
          <Card className="bg-white">
            <CardContent className="p-6">
              <div className="flex items-center gap-2 mb-4">
                <ShoppingBag className="h-5 w-5" />
                <h2 className="text-lg font-medium text-gray-600">Shopping Insights</h2>
              </div>
              <Tabs defaultValue="hotspots" className="w-full">
                <TabsList className="mb-4">
                  <TabsTrigger value="hotspots" className="flex-1">My List Hotspots</TabsTrigger>
                  <TabsTrigger value="overview" className="flex-1">Store Overview</TabsTrigger>
                  <TabsTrigger value="dive" className="flex-1">Item Deep Dive</TabsTrigger>
                  <TabsTrigger value="visits" className="flex-1">Recent Visits</TabsTrigger>
                </TabsList>
                <TabsContent value="hotspots">
                  <div className="space-y-4">
                    <div className="p-4 border rounded-lg">
                      <h3 className="font-medium mb-2">Milk</h3>
                      <div className="text-sm text-gray-500 flex items-center gap-2">
                        <Clock className="h-4 w-4" />
                        <span>No purchase frequency data yet.</span>
                      </div>
                      <div className="text-sm text-gray-500 flex items-center gap-2 mt-1">
                        <DollarSign className="h-4 w-4" />
                        <span>No pricing data to determine cheapest store.</span>
                      </div>
                    </div>
                    <div className="p-4 border rounded-lg">
                      <h3 className="font-medium mb-2">Eggs</h3>
                      <div className="text-sm text-gray-500 flex items-center gap-2">
                        <Clock className="h-4 w-4" />
                        <span>No purchase frequency data yet.</span>
                      </div>
                      <div className="text-sm text-gray-500 flex items-center gap-2 mt-1">
                        <DollarSign className="h-4 w-4" />
                        <span>No pricing data to determine cheapest store.</span>
                      </div>
                    </div>
                  </div>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </div>
      </div>
    </AppLayout>
  );
};

export default DashboardPage; 