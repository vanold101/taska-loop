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
  TrendingDown
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { GroceryStore, ItemPriceResult, findBestPrices, getShoppingPlan } from "@/services/priceService";

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

  const handleFindBestPrices = () => {
    setIsLoading(true);
    setError(null);
    
    // This would typically be an API call, but we're using our mock data
    setTimeout(() => {
      try {
        // Validate inputs
        if (!items || items.length === 0) {
          throw new Error("No items to compare prices for");
        }
        
        if (!userLocation || typeof userLocation.lat !== 'number' || typeof userLocation.lng !== 'number') {
          throw new Error("Invalid user location");
        }
        
        const results = findBestPrices(items, userLocation);
        setPriceResults(results);
        
        // Calculate shopping plan
        const plan = getShoppingPlan(results);
        setShoppingPlan(plan);
        
        // Default expand all stores
        const storeIds = new Set(plan.storeVisits.map(visit => visit.store.id));
        setExpandedStores(storeIds);
      } catch (error) {
        console.error("Error finding prices:", error);
        setError(error instanceof Error ? error.message : "An unknown error occurred");
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
      
      <Button
        variant="default"
        size="sm"
        onClick={handleFindBestPrices}
        disabled={isLoading || !items || items.length === 0}
        className="w-full premium-gradient-btn"
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
                                  
                                  const highestPrice = itemResult?.otherStores.reduce(
                                    (max, store) => Math.max(max, store.price),
                                    itemResult.bestPrice.price
                                  ) || item.price;
                                  
                                  const savingsPercent = itemResult?.bestPrice?.savings.percentage || 0;
                                  
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
                    <div key={result.item} className="border-b border-gloop-border pb-4 last:border-0">
                      <div className="flex justify-between items-center mb-2">
                        <h3 className="font-medium">{result.item}</h3>
                        {result.bestPrice && (
                          <Badge className="bg-gradient-to-r from-amber-400 to-amber-600 text-white border-0">
                            Best: {formatPrice(result.bestPrice.price)}/{result.bestPrice.unit}
                          </Badge>
                        )}
                      </div>
                      
                      {result.bestPrice ? (
                        <>
                          <div className="flex items-center gap-2 mb-2">
                            <Store className="h-3 w-3 text-gloop-text-muted" />
                            <p className="text-sm text-gloop-primary">
                              {result.bestPrice.store.name}
                            </p>
                            <span className="text-xs text-gloop-text-muted">
                              (Save up to {formatSavings(result.bestPrice.savings.amount)})
                            </span>
                          </div>
                          
                          {result.otherStores.length > 0 && (
                            <div className="mt-2 text-sm text-gloop-text-muted">
                              <p className="mb-1">Other stores:</p>
                              <div className="space-y-1">
                                {result.otherStores.map((store, idx) => (
                                  <div key={idx} className="flex justify-between items-center">
                                    <span>{store.store.name}</span>
                                    <span>{formatPrice(store.price)}/{store.unit}</span>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                        </>
                      ) : (
                        <p className="text-sm text-gloop-text-muted">Not available at nearby stores</p>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
} 