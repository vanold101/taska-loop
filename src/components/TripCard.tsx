
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ShoppingCart } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

type TripCardProps = {
  store: string;
  shopper: {
    name: string;
    avatar?: string;
  };
  eta: string;
  itemCount: number;
  status: 'open' | 'shopping' | 'completed' | 'cancelled';
  onAddItem?: () => void;
  onClick?: () => void;
};

const TripCard = ({ 
  store, 
  shopper, 
  eta, 
  itemCount, 
  status,
  onAddItem,
  onClick
}: TripCardProps) => {
  const getStatusColor = () => {
    switch(status) {
      case 'open':
        return 'bg-green-100 text-green-800';
      case 'shopping':
        return 'bg-blue-100 text-blue-800';
      case 'completed':
        return 'bg-gray-100 text-gray-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <Card 
      className="mb-4 overflow-hidden border shadow-md hover:shadow-lg transition-shadow" 
      onClick={onClick}
    >
      <CardHeader className="pb-2 flex flex-row justify-between items-center">
        <div className="flex items-center space-x-2">
          <ShoppingCart className="h-5 w-5 text-gloop-primary" />
          <h3 className="text-lg font-semibold">{store}</h3>
        </div>
        <Badge className={`${getStatusColor()} capitalize`}>{status}</Badge>
      </CardHeader>

      <CardContent className="pb-2">
        <div className="flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <Avatar className="h-8 w-8">
              <AvatarImage src={shopper.avatar} />
              <AvatarFallback className="bg-gloop-primary text-white">
                {shopper.name.charAt(0)}
              </AvatarFallback>
            </Avatar>
            <div>
              <p className="text-sm font-medium">{shopper.name}</p>
              <p className="text-xs text-gloop-text-muted">ETA: {eta}</p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-sm font-medium">{itemCount} item{itemCount !== 1 ? 's' : ''}</p>
          </div>
        </div>
      </CardContent>

      {status === 'open' && onAddItem && (
        <CardFooter className="pt-0">
          <Button 
            onClick={(e) => {
              e.stopPropagation();
              onAddItem();
            }} 
            variant="secondary" 
            className="w-full"
          >
            Add Item
          </Button>
        </CardFooter>
      )}
    </Card>
  );
};

export default TripCard;
