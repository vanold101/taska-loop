import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import {
  Store,
  ShoppingCart,
  Clock,
  TrendingUp,
  DollarSign,
  BarChart3,
  Calendar,
  ShoppingBag,
  Flame,
  Sparkles
} from "lucide-react";
import {
  getStoreFrequencyData,
  getItemFrequencyData,
  getRecentStoreVisits,
  StoreFrequencyData,
  ItemFrequencyData as GeneralItemFrequencyData,
  StoreVisit
} from "@/services/StoreAnalyticsService";
import { getPriceHistory, PriceRecord } from "@/services/PriceHistoryService";
import { useTaskContext } from "@/context/TaskContext";
import { format, formatDistanceToNow } from "date-fns";

interface ShoppingListItemInsight {
  itemName: string;
  mostFrequentAt?: { store: string; count: number };
  cheapestAt?: { store: string; price: number; unit?: string; date?: string };
}

const StoreAnalytics = () => {
  const { trips } = useTaskContext();
  const [activeTab, setActiveTab] = useState("insights");

  const [storeData, setStoreData] = useState<StoreFrequencyData[]>([]);
  const [itemData, setItemData] = useState<GeneralItemFrequencyData[]>([]);
  const [recentVisits, setRecentVisits] = useState<StoreVisit[]>([]);
  
  const [listInsights, setListInsights] = useState<ShoppingListItemInsight[]>([]);

  useEffect(() => {
    setStoreData(getStoreFrequencyData());
    const generalItemFrequency = getItemFrequencyData();
    setItemData(generalItemFrequency);
    setRecentVisits(getRecentStoreVisits(5));

    const activeItemsFromList = Array.from(
      new Set(
        trips
          .filter(trip => trip.status !== 'completed')
          .flatMap(trip => trip.items.map(item => item.name.toLowerCase().trim()))
      )
    );

    if (activeItemsFromList.length === 0) {
      setListInsights([]);
      return;
    }

    const insights = activeItemsFromList.map(itemName => {
      const insight: ShoppingListItemInsight = { itemName };

      const itemFreqData = generalItemFrequency.find(item => item.name.toLowerCase().trim() === itemName);
      if (itemFreqData && itemFreqData.stores.length > 0) {
        const sortedByFreq = [...itemFreqData.stores].sort((a, b) => b.purchaseCount - a.purchaseCount);
        insight.mostFrequentAt = { store: sortedByFreq[0].store, count: sortedByFreq[0].purchaseCount };
      }

      const historicalPrices: PriceRecord[] = getPriceHistory(itemName);
      if (historicalPrices.length > 0) {
        const sortedPrices = historicalPrices
          .map(p => ({ ...p, unitPrice: p.price / (p.quantity || 1) }))
          .filter(p => p.unitPrice > 0)
          .sort((a, b) => a.unitPrice - b.unitPrice);

        if (sortedPrices.length > 0) {
          const cheapest = sortedPrices[0];
          insight.cheapestAt = {
            store: cheapest.store,
            price: cheapest.unitPrice,
            unit: cheapest.unit,
            date: cheapest.date,
          };
        }
      }
      return insight;
    });
    
    setListInsights(insights);

  }, [trips]);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center">
            <ShoppingBag className="h-5 w-5 mr-2 text-blue-500" />
            Shopping Insights
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="w-full mb-4 bg-white/35 backdrop-blur dark:bg-[#262A24] flex overflow-x-auto no-scrollbar">
            <TabsTrigger
              value="insights"
              className="flex-shrink-0 data-[state=active]:bg-[#FF9F2F] data-[state=active]:text-white text-xs px-2 py-1.5"
            >
              My List Hotspots
            </TabsTrigger>
            <TabsTrigger
              value="stores"
              className="flex-shrink-0 data-[state=active]:bg-[#FF9F2F] data-[state=active]:text-white text-xs px-2 py-1.5"
            >
              Store Overview
            </TabsTrigger>
            <TabsTrigger
              value="items"
              className="flex-shrink-0 data-[state=active]:bg-[#FF9F2F] data-[state=active]:text-white text-xs px-2 py-1.5"
            >
              Item Deep Dive
            </TabsTrigger>
            <TabsTrigger
              value="recent"
              className="flex-shrink-0 data-[state=active]:bg-[#FF9F2F] data-[state=active]:text-white text-xs px-2 py-1.5"
            >
              Recent Visits
            </TabsTrigger>
          </TabsList>

          <TabsContent value="insights" className="space-y-3">
            {listInsights.length === 0 && (
              <div className="text-center py-4 text-gray-500 dark:text-gray-400">
                <Sparkles className="h-8 w-8 mx-auto mb-2 text-gray-400 dark:text-gray-500"/>
                <p>Add items to your active shopping lists to see insights here!</p>
              </div>
            )}
            {listInsights.map(insight => (
              <Card key={insight.itemName} className="overflow-hidden shadow-sm">
                <CardHeader className="p-3 bg-gray-50 dark:bg-gray-800/50">
                  <CardTitle className="text-md capitalize flex items-center">
                    <ShoppingBag className="h-4 w-4 mr-2 text-blue-500" /> 
                    {insight.itemName}
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-3 text-xs space-y-1.5">
                  {insight.mostFrequentAt ? (
                    <div className="flex items-center">
                      <Flame className="h-3.5 w-3.5 mr-1.5 text-orange-500 flex-shrink-0" />
                      <span>Often bought at: <strong className="font-semibold">{insight.mostFrequentAt.store}</strong> ({insight.mostFrequentAt.count} times)</span>
                    </div>
                  ) : (
                    <div className="flex items-center text-gray-500 dark:text-gray-400">
                      <Flame className="h-3.5 w-3.5 mr-1.5 flex-shrink-0" />
                      <span>No purchase frequency data yet.</span>
                    </div>
                  )}
                  {insight.cheapestAt ? (
                    <div className="flex items-center">
                       <DollarSign className="h-3.5 w-3.5 mr-1.5 text-green-500 flex-shrink-0" />
                      <span>Cheapest recorded: <strong className="font-semibold">{insight.cheapestAt.store}</strong> at <strong className="font-semibold">${insight.cheapestAt.price.toFixed(2)}{insight.cheapestAt.unit ? `/${insight.cheapestAt.unit}` : ''}</strong> 
                        {insight.cheapestAt.date && <span className="text-gray-500 dark:text-gray-400 text-[10px]"> (on {format(new Date(insight.cheapestAt.date), "MMM d, yy")})</span>}
                      </span>
                    </div>
                  ) : (
                    <div className="flex items-center text-gray-500 dark:text-gray-400">
                      <DollarSign className="h-3.5 w-3.5 mr-1.5 flex-shrink-0" />
                      <span>No pricing data to determine cheapest store.</span>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </TabsContent>

          <TabsContent value="stores" className="space-y-4">
            {storeData.length === 0 && <p className="text-center py-4 text-gray-500 dark:text-gray-400">No store visit data yet.</p>}
            {storeData.map(store => (
              <Card key={store.store} className="overflow-hidden">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="font-semibold flex items-center">
                        <Store className="h-4 w-4 mr-1.5 text-blue-500" />
                        {store.store}
                      </h3>
                      <div className="mt-2 space-y-1">
                        <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                          <ShoppingCart className="h-3.5 w-3.5 mr-1.5" />
                          {store.visitCount} visits
                        </div>
                        <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                          <DollarSign className="h-3.5 w-3.5 mr-1.5" />
                          Avg. ${store.averageSpent.toFixed(2)} per visit
                        </div>
                        {store.lastVisit && (
                          <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                            <Clock className="h-3.5 w-3.5 mr-1.5" />
                            Last visit: {formatDistanceToNow(new Date(store.lastVisit), { addSuffix: true })}
                          </div>
                        )}
                      </div>
                    </div>
                    <Badge className="bg-gradient-to-r from-blue-500 to-green-500 text-white">
                      ${store.totalSpent.toFixed(2)}
                    </Badge>
                  </div>
                  
                  {store.mostBoughtItems.length > 0 && (
                    <div className="mt-3 pt-3 border-t border-gray-100 dark:border-gray-800">
                      <h4 className="text-sm font-medium mb-2 flex items-center">
                        <TrendingUp className="h-3.5 w-3.5 mr-1.5" />
                        Top Items Here
                      </h4>
                      <div className="space-y-1">
                        {store.mostBoughtItems.map(item => (
                          <div key={item.name} className="flex items-center justify-between text-sm">
                            <span className="text-gray-600 dark:text-gray-400">{item.name}</span>
                            <div className="flex items-center">
                              <span className="text-gray-500 dark:text-gray-500 mr-2">
                                {item.count}x
                              </span>
                              <span className="text-gray-600 dark:text-gray-400">
                                ${item.averagePrice.toFixed(2)}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </TabsContent>

          <TabsContent value="items" className="space-y-4">
             {itemData.length === 0 && <p className="text-center py-4 text-gray-500 dark:text-gray-400">No item purchase data yet.</p>}
            {itemData.map(item => (
              <Card key={item.name} className="overflow-hidden">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="font-semibold capitalize">{item.name}</h3>
                      <div className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                        Total purchases: {item.totalPurchases}
                      </div>
                    </div>
                  </div>
                  
                  {item.stores.length > 0 && (
                    <div className="mt-3 space-y-2 pt-3 border-t border-gray-100 dark:border-gray-800">
                       <h4 className="text-xs font-medium mb-1.5 text-gray-500 dark:text-gray-400">Purchase Locations:</h4>
                      {item.stores.map(store => (
                        <div key={store.store} className="flex items-center justify-between text-sm">
                          <div className="flex items-center">
                            <Store className="h-3.5 w-3.5 mr-1.5 text-blue-500" />
                            <span>{store.store}</span>
                          </div>
                          <div className="flex items-center space-x-3">
                            <span className="text-gray-500 dark:text-gray-500">
                              {store.purchaseCount}x
                            </span>
                            <span className="text-gray-600 dark:text-gray-400">
                              Avg. ${store.averagePrice.toFixed(2)}
                            </span>
                             {store.lastPurchaseDate && (
                               <span className="text-gray-400 dark:text-gray-500 text-[10px]">
                                 ({format(new Date(store.lastPurchaseDate), "MMM d, yy")})
                               </span>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </TabsContent>

          <TabsContent value="recent" className="space-y-4">
            {recentVisits.length === 0 && <p className="text-center py-4 text-gray-500 dark:text-gray-400">No recent store visits recorded.</p>}
            {recentVisits.map(visit => (
              <Card key={visit.date + visit.store} className="overflow-hidden">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="font-semibold flex items-center">
                        <Store className="h-4 w-4 mr-1.5 text-blue-500" />
                        {visit.store}
                      </h3>
                      <div className="mt-1 text-sm text-gray-600 dark:text-gray-400 flex items-center">
                        <Calendar className="h-3.5 w-3.5 mr-1.5" />
                        {format(new Date(visit.date), "MMM d, yyyy, h:mm a")}
                      </div>
                    </div>
                    <Badge className="bg-gradient-to-r from-blue-500 to-green-500 text-white">
                      ${visit.total.toFixed(2)}
                    </Badge>
                  </div>
                  
                  {visit.items.length > 0 && (
                     <div className="mt-3 pt-3 border-t border-gray-100 dark:border-gray-800">
                      <h4 className="text-sm font-medium mb-2">Items Purchased ({visit.items.length})</h4>
                      <div className="space-y-1">
                        {visit.items.map(item => (
                          <div key={item.name} className="flex items-center justify-between text-sm">
                            <span className="text-gray-600 dark:text-gray-400 capitalize">
                              {item.name}
                            </span>
                            <div className="flex items-center space-x-3">
                              {item.quantity > 1 && (
                                <span className="text-gray-500 dark:text-gray-500">
                                  {item.quantity}x
                                </span>
                              )}
                              <span className="text-gray-600 dark:text-gray-400">
                                ${item.price.toFixed(2)}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default StoreAnalytics; 