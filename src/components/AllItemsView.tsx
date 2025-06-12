import React, { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Search, Filter, ShoppingCart, Check, Store, Clock } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { TripData, TripItem } from '@/components/TripDetailModal';

interface AllItemsViewProps {
  trips: TripData[];
  onClose: () => void;
  onItemClick: (tripId: string, itemId: string) => void;
}

interface GroupedItems {
  [key: string]: {
    items: (TripItem & { tripId: string; tripStore: string })[];
    totalQuantity: number;
    checkedCount: number;
  };
}

export const AllItemsView: React.FC<AllItemsViewProps> = ({
  trips,
  onClose,
  onItemClick,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [showCompleted, setShowCompleted] = useState(false);

  // Group items by name across all trips
  const groupedItems = useMemo(() => {
    const groups: GroupedItems = {};
    
    trips.forEach(trip => {
      trip.items.forEach(item => {
        const key = item.name.toLowerCase();
        if (!groups[key]) {
          groups[key] = {
            items: [],
            totalQuantity: 0,
            checkedCount: 0
          };
        }
        groups[key].items.push({
          ...item,
          tripId: trip.id,
          tripStore: trip.store
        });
        groups[key].totalQuantity += item.quantity;
        if (item.checked) {
          groups[key].checkedCount += 1;
        }
      });
    });

    return groups;
  }, [trips]);

  // Filter items based on search query
  const filteredGroups = useMemo(() => {
    return Object.entries(groupedItems).filter(([name]) => 
      name.includes(searchQuery.toLowerCase())
    );
  }, [groupedItems, searchQuery]);

  return (
    <motion.div
      className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <motion.div
        className="bg-white dark:bg-gray-800 rounded-lg shadow-lg max-w-3xl w-full max-h-[90vh] overflow-hidden flex flex-col"
        initial={{ scale: 0.9, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.9, y: 20 }}
      >
        <div className="p-4 border-b dark:border-gray-700">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold flex items-center">
              <ShoppingCart className="mr-2 h-5 w-5 text-blue-600 dark:text-blue-400" />
              All Items
            </h2>
            <Button variant="ghost" size="sm" onClick={onClose}>
              Close
            </Button>
          </div>

          <div className="flex gap-2 mb-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-500" />
              <Input
                className="pl-9"
                placeholder="Search items..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <Button
              variant="outline"
              onClick={() => setShowCompleted(!showCompleted)}
            >
              {showCompleted ? 'Hide Completed' : 'Show Completed'}
            </Button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-4">
          {filteredGroups.length > 0 ? (
            <div className="space-y-4">
              {filteredGroups.map(([name, group]) => (
                <motion.div
                  key={name}
                  className="border rounded-lg p-4 dark:border-gray-700"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                >
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-lg font-medium">{name}</h3>
                    <Badge variant="outline">
                      {group.checkedCount}/{group.items.length} completed
                    </Badge>
                  </div>

                  <div className="space-y-2">
                    {group.items.map((item) => (
                      (!item.checked || showCompleted) && (
                        <motion.div
                          key={`${item.tripId}-${item.id}`}
                          className="flex items-center justify-between p-2 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700/50 cursor-pointer"
                          onClick={() => onItemClick(item.tripId, item.id)}
                          whileHover={{ scale: 1.01 }}
                          whileTap={{ scale: 0.99 }}
                        >
                          <div className="flex items-center gap-2">
                            {item.checked && (
                              <Check className="h-4 w-4 text-green-500" />
                            )}
                            <Store className="h-4 w-4 text-blue-500" />
                            <span>{item.tripStore}</span>
                          </div>
                          <div className="flex items-center gap-4">
                            <span className="text-sm text-gray-500">
                              {item.quantity} {item.unit || 'ea'}
                            </span>
                            <Clock className="h-4 w-4 text-gray-400" />
                          </div>
                        </motion.div>
                      )
                    ))}
                  </div>
                </motion.div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              No items found
            </div>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
}; 