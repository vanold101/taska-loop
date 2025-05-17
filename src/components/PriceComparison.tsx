import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { 
  DollarSign, 
  ShoppingCart,
  Store, 
  Map,
  ChevronDown,
  ChevronUp,
  Sparkles,
  TrendingDown,
  Info
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { GroceryStore, ItemPriceResult, findBestPrices, getShoppingPlan } from "@/services/priceService";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { EmptyState } from "@/components/ui/empty-state";

interface PriceComparisonProps {
  items: string[];
  userLocation: { lat: number; lng: number };
  onStoreDirections: (store: GroceryStore) => void;
}

export default function PriceComparison({ items, userLocation, onStoreDirections }: PriceComparisonProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [priceResults, setPriceResults] = useState<ItemPriceResult[]>([]);
  const [shoppingPlan, setShoppingPlan] = useState<{
    storeVisits: Array<{
      store: GroceryStore;
      items: Array<{ item: string; price: number; unit: string }>;
      totalCost: number;
    }>;
    totalSavings: number;
  } | null>(null);
  const [expandedStores, setExpandedStores] = useState<Set<string>>(new Set());
  const [error, setError] = useState<string | null>(null);
  const hasItems = items && items.length > 0;

  const handleFindBestPrices = () => {
    setIsLoading(true);
    setError(null);
    
    // This would typically be an API call, but we're using our mock data
    setTimeout(() => {
      try {
        // Validate inputs
        if (!hasItems) {
          throw new Error("No items to compare prices for");
        }
        
        if (!userLocation || typeof userLocation.lat !== 'number' || typeof userLocation.lng !== 'number') {
          throw new Error("Invalid user location");
        }
        
        const results = findBestPrices(items, userLocation);
        setPriceResults(results);
        
        // Filter out items with no best price before calculating shopping plan
        const validResults = results.filter(result => result.bestPrice !== null);
        
        // Only calculate shopping plan if there are valid results
        if (validResults.length > 0) {
          // Calculate shopping plan
          const plan = getShoppingPlan(validResults);
          setShoppingPlan(plan);
          
          // Default expand all stores
          const storeIds = new Set(plan.storeVisits.map(visit => visit.store.id));
          setExpandedStores(storeIds);
        } else {
          // No valid results with prices found
          setError("No price information found for any of your items");
          setShoppingPlan(null);
        }
      } catch (error) {
        console.error("Error finding prices:", error);
        setError(error instanceof Error ? error.message : "An unknown error occurred");
        setShoppingPlan(null);
      } finally {
        setIsLoading(false);
      }
    }, 1500); // Simulate API delay
  };
  
  const toggleStoreExpanded = (storeId: string) => {
    const newExpanded = new Set(expandedStores);
    if (newExpanded.has(storeId)) {
      newExpanded.delete(storeId);
    } else {
      newExpanded.add(storeId);
    }
    setExpandedStores(newExpanded);
  };
  
  const formatPrice = (price: number) => {
    return `$${price.toFixed(2)}`;
  };
  
  const formatSavings = (savings: number) => {
    return savings > 0 ? `$${savings.toFixed(2)}` : "$0.00";
  };
  
  return (
    <div className="space-y-4">
      {error && (
        <div className="px-3 py-2 bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-200 rounded-md mb-2 text-sm">
          Error: {error}
        </div>
      )}
      
      <TooltipProvider>
        <Tooltip delayDuration={300}>
          <TooltipTrigger asChild>
            <div className="w-full">
              <Button
                variant="default"
                size="sm"
                onClick={handleFindBestPrices}
                disabled={isLoading || !hasItems}
                className={`w-full ${hasItems ? 'premium-gradient-btn' : 'opacity-70 cursor-not-allowed'}`}
              >
                {isLoading ? (
                  <div className="flex items-center gap-2">
                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
                    <span>Finding best prices...</span>
                  </div>
                ) : (
                  <>
                    <DollarSign className="h-4 w-4 mr-2" />
                    <span>Find Best Prices</span>
                  </>
                )}
              </Button>
            </div>
          </TooltipTrigger>
          {!hasItems && (
            <TooltipContent className="bg-slate-800 text-white border-0 shadow-md max-w-[200px] text-xs">
              <div className="flex items-center gap-1">
                <Info className="h-3 w-3 text-amber-400" />
                <span>Add at least one item to your pantry first</span>
              </div>
            </TooltipContent>
          )}
        </Tooltip>
      </TooltipProvider>
      
      <AnimatePresence>
        {shoppingPlan && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            <Card className="premium-card mb-4">
              <CardHeader className="px-4 py-3 flex flex-row items-center justify-between space-y-0">
                <CardTitle className="text-md font-medium flex items-center gap-2">
                  <Sparkles className="h-4 w-4 text-amber-500" />
                  <span>Shopping Plan</span>
                </CardTitle>
                <div>
                  <Badge className="bg-gradient-to-r from-green-400 to-emerald-600 text-white border-0">
                    <TrendingDown className="h-3 w-3 mr-1" />
                    <span>Save {formatSavings(shoppingPlan.totalSavings)}</span>
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="px-4 py-2">
                <p className="text-sm text-gloop-text-muted mb-4">
                  Shop at these {shoppingPlan.storeVisits.length} stores to get the best prices on your items:
                </p>
                
                <div className="space-y-3">
                  {shoppingPlan.storeVisits.map((visit) => (
                    <Card key={visit.store.id} className="overflow-hidden shadow-sm border">
                      <div 
                        className="p-3 bg-gradient-to-r from-gloop-primary/10 to-gloop-primary/5 flex justify-between items-center cursor-pointer"
                        onClick={() => toggleStoreExpanded(visit.store.id)}
                      >
                        <div className="flex items-center gap-2">
                          <Store className="h-4 w-4 text-gloop-primary" />
                          <span className="font-medium">{visit.store.name}</span>
                          <Badge variant="outline" className="ml-1">
                            {visit.items.length} {visit.items.length === 1 ? 'item' : 'items'}
                          </Badge>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium">{formatPrice(visit.totalCost)}</span>
                          {expandedStores.has(visit.store.id) ? (
                            <ChevronUp className="h-4 w-4" />
                          ) : (
                            <ChevronDown className="h-4 w-4" />
                          )}
                        </div>
                      </div>
                      
                      <AnimatePresence>
                        {expandedStores.has(visit.store.id) && (
                          <motion.div
                            initial={{ height: 0 }}
                            animate={{ height: "auto" }}
                            exit={{ height: 0 }}
                            className="overflow-hidden"
                          >
                            <div className="p-3 pt-0">
                              <div className="mt-3 space-y-2">
                                {visit.items.map((item) => {
                                  const itemResult = priceResults.find(
                                    (result) => result.item.toLowerCase() === item.item.toLowerCase()
                                  );
                                  
                                  // Default to item price if itemResult or bestPrice is null
                                  const bestPrice = itemResult?.bestPrice?.price || item.price;
                                  
                                  const highestPrice = itemResult?.otherStores.reduce(
                                    (max, store) => Math.max(max, store.price),
                                    bestPrice
                                  ) || item.price;
                                  
                                  const savingsPercent = itemResult?.bestPrice?.savings?.percentage || 0;
                                  
                                  return (
                                    <div 
                                      key={item.item} 
                                      className="flex justify-between items-center py-2 border-b border-gloop-border last:border-0"
                                    >
                                      <div>
                                        <p className="text-sm font-medium">{item.item}</p>
                                        <div className="flex items-center gap-1 mt-1">
                                          <Badge variant="outline" className="text-xs py-0 h-5">
                                            {formatPrice(item.price)}/{item.unit}
                                          </Badge>
                                          
                                          {savingsPercent > 5 && (
                                            <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200 text-xs py-0 h-5 border-0">
                                              Save {savingsPercent.toFixed(0)}%
                                            </Badge>
                                          )}
                                        </div>
                                      </div>
                                      
                                      <div className="w-24">
                                        {typeof item.price === 'number' && typeof highestPrice === 'number' ? (
                                          <Progress 
                                            value={100 - (item.price / highestPrice * 100)} 
                                            className="h-2" 
                                          />
                                        ) : (
                                          <div className="h-2 w-full bg-gray-200 rounded-full"></div>
                                        )}
                                      </div>
                                    </div>
                                  );
                                })}
                              </div>
                              
                              <Button
                                variant="outline"
                                size="sm"
                                className="mt-3 w-full"
                                onClick={() => onStoreDirections(visit.store)}
                              >
                                <Map className="h-3 w-3 mr-1" />
                                <span>Get Directions</span>
                              </Button>
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>
            
            <Card className="premium-card">
              <CardHeader className="px-4 py-3">
                <CardTitle className="text-md font-medium flex items-center gap-2">
                  <ShoppingCart className="h-4 w-4 text-gloop-primary" />
                  <span>Item Price Comparison</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="px-4 py-2">
                <div className="space-y-4">
                  {priceResults.map((result) => (
                    <div key={result.item} className="border-b border-gloop-border pb-3 last:border-0 last:pb-0">
                      <h4 className="font-medium text-sm mb-2">{result.item}</h4>
                      
                      {result.bestPrice ? (
                        <div className="space-y-2">
                          <div className="flex justify-between text-xs">
                            <span className="text-green-600 dark:text-green-400 font-medium">Best Price</span>
                            <span>Other Stores</span>
                          </div>
                          
                          <div className="flex items-center gap-3">
                            <Badge className="flex items-center gap-1 bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-300 border-0">
                              <Store className="h-3 w-3" />
                              <span>{result.bestPrice.store.name}</span>
                            </Badge>
                            
                            <div className="h-px flex-1 bg-gloop-outline/30"></div>
                            
                            <div className="flex flex-wrap gap-1">
                              {result.otherStores.slice(0, 3).map((store) => (
                                <Badge 
                                  key={store.store.id} 
                                  variant="outline" 
                                  className="text-slate-600 dark:text-slate-300"
                                >
                                  {store.store.name}
                                </Badge>
                              ))}
                              
                              {result.otherStores.length > 3 && (
                                <Badge variant="outline" className="text-slate-500">
                                  +{result.otherStores.length - 3} more
                                </Badge>
                              )}
                            </div>
                          </div>
                          
                          <div className="flex items-center justify-between">
                            <div>
                              <div className="text-lg font-semibold">
                                {formatPrice(result.bestPrice.price)}
                                <span className="text-xs text-gloop-text-muted ml-1">/{result.bestPrice.unit}</span>
                              </div>
                              
                              {result.bestPrice.savings.amount > 0 && (
                                <div className="text-xs text-green-600 dark:text-green-400 mt-1">
                                  Save up to {formatSavings(result.bestPrice.savings.amount)} ({result.bestPrice.savings.percentage.toFixed(0)}%)
                                </div>
                              )}
                            </div>
                            
                            <div className="text-right">
                              <div className="text-sm text-gloop-text-muted">
                                {formatPrice(
                                  result.otherStores.reduce((sum, store) => sum + store.price, result.bestPrice.price) / 
                                  (result.otherStores.length + 1)
                                )}
                                <span className="text-xs ml-1">avg</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      ) : (
                        <div className="text-sm text-gloop-text-muted py-2">
                          No price data available for this item.
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
      
      {!shoppingPlan && !isLoading && !hasItems && (
        <EmptyState
          title="Your pantry is empty"
          description="Add some items to your pantry before comparing prices."
          icon={<ShoppingCart className="h-8 w-8" />}
          className="bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700"
        />
      )}
    </div>
  );
} 