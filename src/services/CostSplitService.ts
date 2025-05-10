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
  // Safety check: ensure participants is an array
  if (!Array.isArray(participants) || participants.length === 0) {
    return {
      itemId,
      splitType: 'equal',
      details: []
    };
  }

  // Filter out undefined participants or participants without id or name
  const validParticipants = participants.filter(p => p && p.id && p.name);
  
  if (validParticipants.length === 0) {
    return {
      itemId,
      splitType: 'equal',
      details: []
    };
  }

  const equalShare = 100 / validParticipants.length;
  
  return {
    itemId,
    splitType: 'equal',
    details: validParticipants.map(p => ({
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
  // Safety check: ensure participants is an array with valid entries
  if (!Array.isArray(participants)) {
    return [];
  }
  
  // Filter valid participants (with id and name)
  const validParticipants = participants.filter(p => p && p.id && p.name);
  
  if (validParticipants.length === 0) {
    return [];
  }
  
  // Load split configuration
  const splits = loadSplitConfig(tripId);
  
  // Initialize result with zero amounts for each participant
  const result: TripSplitSummary[] = validParticipants.map(p => ({
    userId: p.id,
    userName: p.name,
    totalAmount: 0,
    itemCount: 0
  }));
  
  // Find the shopper (assuming shopper is "You" - can be updated to use actual shopper info)
  const shopper = validParticipants.find(p => p.name === "You");
  
  // Process each item
  items.forEach(item => {
    // Skip items without a price
    if (item.price === undefined) return;
    
    // Get split for this item
    const itemSplit = splits.find(s => s.itemId === item.id);
    const itemTotal = item.price * item.quantity;
    
    // If no split is defined, create a default equal split
    if (!itemSplit) {
      // Apply default equal split among all participants
      const equalShare = itemTotal / validParticipants.length;
      
      validParticipants.forEach(p => {
        const participant = result.find(r => r.userId === p.id);
        if (participant) {
          participant.totalAmount += equalShare;
          participant.itemCount += 1;
        }
      });
    } else {
      // Apply the defined split
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
  
  // Handle the case where the shopper paid for everything but is only responsible for their portion
  if (shopper) {
    // Calculate total trip cost
    const totalTripCost = items.reduce((sum, item) => sum + (item.price || 0) * item.quantity, 0);
    
    // Calculate what each participant will pay
    const shopperSummary = result.find(r => r.userId === shopper.id);
    
    // If shopper found, adjust the amounts so that participants owe the shopper
    if (shopperSummary) {
      // For the shopper, they've already paid the total cost, but are only responsible for their portion
      // Their balance in the result will be what they're responsible for, not what they paid
      
      // For all other participants, their balance is what they owe the shopper
      // No changes needed here as the amount in result represents what they owe
    }
  }
  
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