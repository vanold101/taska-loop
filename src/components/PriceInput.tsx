import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { 
  ArrowUp, 
  ArrowDown, 
  Info, 
  DollarSign,
  History
} from "lucide-react";
import { getLastPrice, isPriceHigher } from "@/services/PriceHistoryService";
import { Button } from "./ui/button";
import { formatDistanceToNow } from "date-fns";
import { cn } from "@/lib/utils";

interface PriceInputProps {
  id?: string;
  itemName?: string;
  value: number | undefined;
  onChange: (value: number) => void;
  className?: string;
  placeholder?: string;
}

const PriceInput = ({ 
  id,
  itemName, 
  value, 
  onChange, 
  className,
  placeholder = "0.00" 
}: PriceInputProps) => {
  const [priceInput, setPriceInput] = useState(value ? value.toString() : "");
  const [showTooltip, setShowTooltip] = useState(false);
  const [priceHistory, setPriceHistory] = useState<{ lastPrice: number | null, store: string | null, date: Date | null }>();
  const [priceComparison, setPriceComparison] = useState<{ isHigher: boolean, difference: number } | null>(null);

  // Format price for display
  const formatPrice = (price: number): string => {
    return `$${price.toFixed(2)}`;
  };

  // Load price history when component mounts or item name changes
  useEffect(() => {
    if (itemName) {
      const lastRecord = getLastPrice(itemName);
      
      if (lastRecord) {
        setPriceHistory({
          lastPrice: lastRecord.price,
          store: lastRecord.store,
          date: new Date(lastRecord.date)
        });
        
        // Only compare prices if we have a current price value
        if (value) {
          const comparison = isPriceHigher(itemName, value);
          setPriceComparison({
            isHigher: comparison.isHigher,
            difference: comparison.difference
          });
        }
      }
    }
  }, [itemName, value]);

  // Update the parent component when price changes
  const handlePriceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setPriceInput(newValue);
    
    // Convert to number and update parent
    const numValue = parseFloat(newValue);
    if (!isNaN(numValue)) {
      onChange(numValue);
      
      // Update price comparison
      if (itemName && priceHistory?.lastPrice) {
        const comparison = isPriceHigher(itemName, numValue);
        setPriceComparison({
          isHigher: comparison.isHigher,
          difference: comparison.difference
        });
      }
    }
  };

  // Simple view when itemName is not provided (used in new implementation)
  if (!itemName) {
    return (
      <div className={cn("relative", className)}>
        <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground">$</span>
        <Input
          id={id}
          type="number"
          step="0.01"
          min="0"
          placeholder={placeholder}
          value={priceInput}
          onChange={handlePriceChange}
          className="pl-7"
        />
      </div>
    );
  }

  // Full view with price history when itemName is provided
  return (
    <div className={cn("w-full", className)}>
      <div className="flex flex-col space-y-1">
        <Label htmlFor={id || "price"} className="text-xs flex items-center justify-between">
          <span>Price</span>
          
          {priceHistory?.lastPrice && (
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="h-5 w-5 p-0"
                    onClick={() => setShowTooltip(!showTooltip)}
                  >
                    <History className="h-3.5 w-3.5 text-muted-foreground" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent side="top">
                  <div className="text-xs p-1">
                    <p>Last price: {formatPrice(priceHistory.lastPrice)}</p>
                    <p>Store: {priceHistory.store}</p>
                    {priceHistory.date && (
                      <p className="text-[10px] text-muted-foreground">
                        {formatDistanceToNow(priceHistory.date, { addSuffix: true })}
                      </p>
                    )}
                  </div>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          )}
        </Label>
        
        <div className="relative">
          <DollarSign className="absolute left-2 top-1/2 transform -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
          <Input
            id={id || "price"}
            type="number"
            step="0.01"
            min="0"
            placeholder={placeholder}
            value={priceInput}
            onChange={handlePriceChange}
            className="pl-7"
          />
          
          {priceComparison && priceHistory?.lastPrice && (
            <div 
              className={`absolute right-2 top-1/2 transform -translate-y-1/2 flex items-center text-xs ${
                priceComparison.isHigher ? 'text-red-500' : 
                priceComparison.difference < 0 ? 'text-green-500' : 'text-muted-foreground'
              }`}
            >
              {priceComparison.isHigher && (
                <>
                  <ArrowUp className="h-3 w-3 mr-0.5" />
                  {Math.abs(priceComparison.difference).toFixed(1)}%
                </>
              )}
              {priceComparison.difference < 0 && (
                <>
                  <ArrowDown className="h-3 w-3 mr-0.5" />
                  {Math.abs(priceComparison.difference).toFixed(1)}%
                </>
              )}
            </div>
          )}
        </div>
        
        {priceHistory?.lastPrice && (
          <div className="text-xs text-muted-foreground pl-1 flex items-center">
            <Info className="h-3 w-3 mr-1" />
            Last: {formatPrice(priceHistory.lastPrice)} at {priceHistory.store}
          </div>
        )}
        
        {priceComparison?.isHigher && (
          <div className="text-xs text-red-500 pl-1 flex items-center">
            <ArrowUp className="h-3 w-3 mr-1" />
            Price increased by {Math.abs(priceComparison.difference).toFixed(1)}% from last purchase
          </div>
        )}
      </div>
    </div>
  );
};

export default PriceInput; 