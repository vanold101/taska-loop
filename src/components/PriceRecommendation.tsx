import React, { useState, useEffect } from 'react';
import { AlertCircle, TrendingDown, Award, Store, DollarSign } from 'lucide-react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Progress } from "@/components/ui/progress";
import { formatUnitPrice } from "@/services/PriceTrackingService";
import { PriceRecommendation, getShoppingListRecommendations } from "@/services/PriceTrackingService";
import { TripItem } from "./TripDetailModal";
import { useToast } from "@/hooks/use-toast";

interface PriceRecommendationsProps {
  items: TripItem[];
  currentStore?: string;
}

const PriceRecommendationsPanel: React.FC<PriceRecommendationsProps> = ({ items, currentStore }) => {
  const [loading, setLoading] = useState(true);
  const [recommendations, setRecommendations] = useState<Record<string, PriceRecommendation>>({});
  const [bestStore, setBestStore] = useState<{ storeName: string; itemCount: number; potentialSavings: number } | null>(null);
  const [expanded, setExpanded] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    const fetchRecommendations = async () => {
      if (items.length === 0) {
        setLoading(false);
        return;
      }

      setLoading(true);
      try {
        const itemsForSearch = items.map(item => ({
          name: item.name,
          quantity: item.quantity,
          unit: item.unit
        }));

        const result = await getShoppingListRecommendations(itemsForSearch);
        setRecommendations(result.recommendations);
        setBestStore(result.bestStore);
      } catch (error) {
        console.error('Error fetching price recommendations:', error);
        toast({
          title: 'Error',
          description: 'Failed to fetch price recommendations',
          variant: 'destructive'
        });
      } finally {
        setLoading(false);
      }
    };

    fetchRecommendations();
  }, [items, toast]);

  if (loading) {
    return (
      <Card className="mb-4">
        <CardHeader className="pb-2">
          <CardTitle className="text-lg flex items-center">
            <DollarSign className="w-5 h-5 mr-2" />
            Price Recommendations
          </CardTitle>
          <CardDescription>Finding the best prices...</CardDescription>
        </CardHeader>
        <CardContent>
          <Skeleton className="w-full h-10 mb-3" />
          <Skeleton className="w-4/5 h-10 mb-3" />
          <Skeleton className="w-2/3 h-10" />
        </CardContent>
      </Card>
    );
  }

  if (Object.keys(recommendations).length === 0) {
    return (
      <Card className="mb-4 border-dashed">
        <CardHeader className="pb-2">
          <CardTitle className="text-lg flex items-center">
            <DollarSign className="w-5 h-5 mr-2" />
            Price Recommendations
          </CardTitle>
          <CardDescription>No price data available yet</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-4 text-muted-foreground">
            <AlertCircle className="w-5 h-5 mr-2" />
            <p>Add item prices to start seeing recommendations</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Count recommendations
  const itemsWithRecommendations = Object.keys(recommendations).length;

  return (
    <Card className="mb-4">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg flex items-center justify-between">
          <div className="flex items-center">
            <TrendingDown className="w-5 h-5 mr-2 text-green-500" />
            Price Recommendations
          </div>
          <Badge variant="outline" className="ml-2">
            {itemsWithRecommendations} item{itemsWithRecommendations !== 1 ? 's' : ''}
          </Badge>
        </CardTitle>
        <CardDescription>
          Find the best prices for your shopping list
        </CardDescription>
      </CardHeader>
      
      <CardContent className="pb-2">
        {bestStore && (
          <div className="mb-4 p-3 bg-muted rounded-lg">
            <div className="flex items-center mb-2">
              <Store className="w-5 h-5 mr-2 text-primary" />
              <h3 className="font-medium">Best Overall Store: <span className="font-bold">{bestStore.storeName}</span></h3>
            </div>
            <div className="text-sm text-muted-foreground mb-2">
              Has best prices for {bestStore.itemCount} item{bestStore.itemCount !== 1 ? 's' : ''} on your list
            </div>
            {bestStore.potentialSavings > 0 && (
              <div className="text-sm text-green-600 font-medium flex items-center">
                <Award className="w-4 h-4 mr-1" />
                Potential savings: ~{bestStore.potentialSavings.toFixed(1)}% on average
              </div>
            )}
          </div>
        )}

        {expanded ? (
          <div className="space-y-3 mb-2">
            {Object.values(recommendations)
              .sort((a, b) => b.potentialSavings - a.potentialSavings)
              .map(rec => (
                <div key={rec.itemName} className="p-2 border rounded-md">
                  <div className="flex justify-between items-center mb-1">
                    <div className="font-medium">{rec.itemName}</div>
                    <Badge
                      variant={rec.confidence === 'high' ? 'default' : rec.confidence === 'medium' ? 'outline' : 'secondary'}
                      className="text-xs"
                    >
                      {rec.confidence} confidence
                    </Badge>
                  </div>
                  <div className="flex justify-between text-sm mb-1">
                    <span>Best price at: <span className="font-medium">{rec.bestPrice.storeName}</span></span>
                    <span className="text-green-600 font-medium">
                      {formatUnitPrice(rec.bestPrice.price / rec.bestPrice.quantity, rec.bestPrice.unit)}
                    </span>
                  </div>
                  {rec.potentialSavings > 0 && (
                    <div className="mt-1">
                      <div className="flex justify-between text-xs mb-1">
                        <span>Potential savings</span>
                        <span className="text-green-600">{rec.potentialSavings.toFixed(1)}%</span>
                      </div>
                      <Progress value={Math.min(rec.potentialSavings, 50) * 2} className="h-1.5" />
                    </div>
                  )}
                </div>
              ))}
          </div>
        ) : (
          <div className="space-y-2 mb-2">
            {Object.values(recommendations)
              .sort((a, b) => b.potentialSavings - a.potentialSavings)
              .slice(0, 2)
              .map(rec => (
                <div key={rec.itemName} className="flex justify-between items-center text-sm py-1">
                  <div>
                    <span className="font-medium">{rec.itemName}</span>
                    <span className="text-muted-foreground ml-1">best at {rec.bestPrice.storeName}</span>
                  </div>
                  <div className="text-green-600">
                    {rec.potentialSavings > 0 && `Save ~${rec.potentialSavings.toFixed(0)}%`}
                  </div>
                </div>
              ))}
          </div>
        )}
      </CardContent>
      
      <CardFooter className="pt-0">
        <Button 
          variant="ghost" 
          size="sm" 
          className="w-full justify-center text-xs" 
          onClick={() => setExpanded(!expanded)}
        >
          {expanded ? 'Show Less' : `Show All (${Object.keys(recommendations).length})`}
        </Button>
      </CardFooter>
    </Card>
  );
};

export default PriceRecommendationsPanel; 