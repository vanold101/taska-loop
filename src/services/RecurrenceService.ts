import { addDays, addWeeks, addMonths } from 'date-fns';
import { recurringItemsService } from './RecurringItemsService';
import { Trip } from '../context/TaskContext';

export type RecurrenceFrequency = 'daily' | 'weekly' | 'bi-weekly' | 'monthly';

/**
 * Calculates the next due date for a recurring item.
 * @param lastDueDate The date from which to calculate the next occurrence (e.g., last completion date or last time it was added to a list).
 * @param frequency The recurrence frequency.
 * @returns The new due date as an ISO string.
 */
export function calculateNextDueDate(lastDueDate: string | Date, frequency: RecurrenceFrequency): string {
  const startDate = typeof lastDueDate === 'string' ? new Date(lastDueDate) : lastDueDate;
  let nextDate: Date;

  switch (frequency) {
    case 'daily':
      nextDate = addDays(startDate, 1);
      break;
    case 'weekly':
      nextDate = addWeeks(startDate, 1);
      break;
    case 'bi-weekly':
      nextDate = addWeeks(startDate, 2);
      break;
    case 'monthly':
      nextDate = addMonths(startDate, 1);
      break;
    default:
      // Should not happen with type safety, but as a fallback:
      console.warn('Invalid recurrence frequency:', frequency);
      nextDate = addDays(startDate, 7); // Default to weekly if frequency is unknown
      break;
  }
  return nextDate.toISOString();
}

/**
 * Process recurring items and add them to appropriate trips.
 * This function should be called on app start or at regular intervals.
 * 
 * @param existingTrips Current trips from the context
 * @param onAddItemToTrip Callback to add item to existing trip
 * @param onCreateTrip Callback to create new trip with items
 * @param user Current authenticated user
 * @param isAdmin Whether the current user is an admin
 * @returns Processing results with statistics
 */
export function processRecurringItems(
  existingTrips: Trip[],
  onAddItemToTrip: (tripId: string, item: any) => void,
  onCreateTrip: (tripData: any) => void,
  user?: { id: string; name: string; avatar?: string },
  isAdmin: boolean = false
): {
  itemsProcessed: number;
  tripsUpdated: number;
  newTripsCreated: number;
  errors: string[];
} {
  console.log('Processing recurring items...');
  
  try {
    // Load templates and process them
    recurringItemsService.loadTemplates();
    const result = recurringItemsService.processRecurringItems(existingTrips);
    
    const stats = {
      itemsProcessed: 0,
      tripsUpdated: 0,
      newTripsCreated: 0,
      errors: [] as string[]
    };

    // Add items to existing trips
    for (const itemToAdd of result.itemsToAdd) {
      if (itemToAdd.targetTripId) {
        try {
          onAddItemToTrip(itemToAdd.targetTripId, {
            ...itemToAdd.item,
            id: Date.now().toString() + Math.random().toString(36).substring(2)
          });
          stats.itemsProcessed++;
          stats.tripsUpdated++;
        } catch (error) {
          stats.errors.push(`Failed to add ${itemToAdd.item.name} to trip: ${error}`);
        }
      }
    }

    // Create participants array based on admin status
    let participants;
    let shopper;

    if (isAdmin) {
      // Admin accounts get example participants for testing
      participants = [
        { 
          id: user?.id || '1', 
          name: user?.name || 'You', 
          avatar: user?.avatar || 'https://ui-avatars.com/api/?name=' + encodeURIComponent(user?.name || 'You') + '&background=random'
        },
        { 
          id: '2', 
          name: 'Rachel', 
          avatar: 'https://ui-avatars.com/api/?name=Rachel&background=ff6b6b'
        },
        { 
          id: '3', 
          name: 'Dev', 
          avatar: 'https://ui-avatars.com/api/?name=Dev&background=4ecdc4'
        }
      ];
      shopper = { 
        name: user?.name || 'You', 
        avatar: user?.avatar || 'https://ui-avatars.com/api/?name=' + encodeURIComponent(user?.name || 'You') + '&background=random'
      };
    } else {
      // Regular users only get themselves - no sample participants
      participants = [{ 
        id: user?.id || '1', 
        name: user?.name || 'User', 
        avatar: user?.avatar || 'https://ui-avatars.com/api/?name=' + encodeURIComponent(user?.name || 'User') + '&background=random'
      }];
      shopper = { 
        name: user?.name || 'User', 
        avatar: user?.avatar || 'https://ui-avatars.com/api/?name=' + encodeURIComponent(user?.name || 'User') + '&background=random'
      };
    }

    // Create new trips for items that don't have a target trip
    for (const newTrip of result.newTripsToCreate) {
      try {
        const tripData = {
          store: newTrip.store,
          date: new Date().toISOString(),
          time: "10:00",
          status: 'open' as const,
          items: newTrip.items.map((item: any) => ({
            ...item,
            id: Date.now().toString() + Math.random().toString(36).substring(2)
          })),
          participants,
          shopper,
          notes: 'Auto-created for recurring items'
        };
        
        onCreateTrip(tripData);
        stats.itemsProcessed += newTrip.items.length;
        stats.newTripsCreated++;
      } catch (error) {
        stats.errors.push(`Failed to create trip for ${newTrip.store}: ${error}`);
      }
    }

    console.log('Recurring items processing completed:', stats);
    return stats;
    
  } catch (error) {
    console.error('Error processing recurring items:', error);
    return {
      itemsProcessed: 0,
      tripsUpdated: 0,
      newTripsCreated: 0,
      errors: [`Processing failed: ${error}`]
    };
  }
}

/**
 * Initialize recurring items processing with automatic scheduling
 * This sets up the system to automatically process recurring items
 */
export function initializeRecurringItemsProcessing(
  getTrips: () => Trip[],
  onAddItemToTrip: (tripId: string, item: any) => void,
  onCreateTrip: (tripData: any) => void,
  user?: { id: string; name: string; avatar?: string },
  isAdmin: boolean = false
): () => void {
  console.log('Initializing recurring items processing...');
  
  // Process immediately on initialization
  const initialTrips = getTrips();
  processRecurringItems(initialTrips, onAddItemToTrip, onCreateTrip, user, isAdmin);
  
  // Set up daily processing at 8 AM
  const scheduleNextProcessing = () => {
    const now = new Date();
    const tomorrow8AM = new Date();
    tomorrow8AM.setDate(now.getDate() + 1);
    tomorrow8AM.setHours(8, 0, 0, 0);
    
    const timeUntilNext = tomorrow8AM.getTime() - now.getTime();
    
    return setTimeout(() => {
      const currentTrips = getTrips();
      processRecurringItems(currentTrips, onAddItemToTrip, onCreateTrip, user, isAdmin);
      
      // Schedule the next processing
      scheduleNextProcessing();
    }, timeUntilNext);
  };
  
  const timeoutId = scheduleNextProcessing();
  
  // Return cleanup function
  return () => {
    clearTimeout(timeoutId);
  };
} 