// Types for cost splitting
export type SplitType = 'equal' | 'percentage' | 'person';

export type SplitDetail = {
  userId: string;
  userName: string;
  share: number; // Either a percentage (0-100) or absolute amount depending on split type
};

export type ItemSplit = {
  itemId: string;
  splitType: SplitType;
  details: SplitDetail[];
};

export type TripSplitSummary = {
  userId: string;
  userName: string;
  totalAmount: number;
  itemCount: number;
};

// Save split configuration to localStorage
export const saveSplitConfig = (tripId: string, splits: ItemSplit[]): void => {
  try {
    const key = `tripSplit_${tripId}`;
    localStorage.setItem(key, JSON.stringify(splits));
  } catch (error) {
    console.error('Failed to save split configuration:', error);
  }
};

// Load split configuration from localStorage
export const loadSplitConfig = (tripId: string): ItemSplit[] => {
  try {
    const key = `tripSplit_${tripId}`;
    const stored = localStorage.getItem(key);
    if (stored) {
      return JSON.parse(stored);
    }
  } catch (error) {
    console.error('Failed to load split configuration:', error);
  }
  return [];
};

// Create a default equal split for an item
export const createEqualSplit = (
  itemId: string,
  participants: { id: string; name: string }[]
): ItemSplit => {
  if (participants.length === 0) {
    return {
      itemId,
      splitType: 'equal',
      details: []
    };
  }

  const equalShare = 100 / participants.length;
  
  return {
    itemId,
    splitType: 'equal',
    details: participants.map(p => ({
      userId: p.id,
      userName: p.name,
      share: equalShare
    }))
  };
};

// Update an existing split
export const updateSplit = (
  splits: ItemSplit[],
  itemId: string,
  splitType: SplitType,
  details: SplitDetail[]
): ItemSplit[] => {
  const existingSplitIndex = splits.findIndex(s => s.itemId === itemId);
  
  if (existingSplitIndex >= 0) {
    const updatedSplits = [...splits];
    updatedSplits[existingSplitIndex] = {
      itemId,
      splitType,
      details
    };
    return updatedSplits;
  } else {
    return [
      ...splits,
      {
        itemId,
        splitType,
        details
      }
    ];
  }
};

// Calculate amounts owed by each participant
export const calculateSplitAmounts = (
  tripId: string,
  items: {
    id: string;
    name: string;
    price?: number;
    quantity: number;
  }[],
  participants: { id: string; name: string }[]
): TripSplitSummary[] => {
  // Load split configuration
  const splits = loadSplitConfig(tripId);
  
  // Initialize result with zero amounts for each participant
  const result: TripSplitSummary[] = participants.map(p => ({
    userId: p.id,
    userName: p.name,
    totalAmount: 0,
    itemCount: 0
  }));
  
  // Process each item
  items.forEach(item => {
    // Skip items without a price
    if (item.price === undefined) return;
    
    // Get split for this item
    const itemSplit = splits.find(s => s.itemId === item.id);
    
    // If no split is defined, create a default equal split
    if (!itemSplit) {
      // Apply default equal split
      const itemTotal = item.price * item.quantity;
      const equalShare = itemTotal / participants.length;
      
      participants.forEach(p => {
        const participant = result.find(r => r.userId === p.id);
        if (participant) {
          participant.totalAmount += equalShare;
          participant.itemCount += 1;
        }
      });
    } else {
      // Apply the defined split
      const itemTotal = item.price * item.quantity;
      
      if (itemSplit.splitType === 'equal') {
        // Equal split (may be a subset of participants)
        if (itemSplit.details.length === 0) return;
        
        const equalShare = itemTotal / itemSplit.details.length;
        
        itemSplit.details.forEach(detail => {
          const participant = result.find(r => r.userId === detail.userId);
          if (participant) {
            participant.totalAmount += equalShare;
            participant.itemCount += 1;
          }
        });
      } else if (itemSplit.splitType === 'percentage') {
        // Percentage split
        itemSplit.details.forEach(detail => {
          const participant = result.find(r => r.userId === detail.userId);
          if (participant) {
            participant.totalAmount += (itemTotal * detail.share / 100);
            participant.itemCount += 1;
          }
        });
      } else if (itemSplit.splitType === 'person') {
        // Person-specific amounts (fixed amounts)
        itemSplit.details.forEach(detail => {
          const participant = result.find(r => r.userId === detail.userId);
          if (participant) {
            participant.totalAmount += detail.share;
            participant.itemCount += 1;
          }
        });
      }
    }
  });
  
  // Round amounts to 2 decimal places
  result.forEach(r => {
    r.totalAmount = Math.round(r.totalAmount * 100) / 100;
  });
  
  return result;
};

// Get split for a specific item
export const getItemSplit = (
  splits: ItemSplit[],
  itemId: string
): ItemSplit | null => {
  return splits.find(s => s.itemId === itemId) || null;
}; 