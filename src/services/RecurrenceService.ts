import { addDays, addWeeks, addMonths } from 'date-fns';

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
 * Placeholder for logic that processes recurring items.
 * This would typically run on app start or at certain intervals.
 */
export function processRecurringItems() {
  // TODO:
  // 1. Get all trip items from context or storage.
  // 2. Filter for items where isRecurring is true.
  // 3. For each recurring item:
  //    a. Check if its nextDueDate is past or today.
  //    b. If yes, consider adding it to a relevant new or existing trip.
  //       - This might involve finding an open trip to the same store or creating a new one.
  //       - The item added to the trip would be a new instance (new ID, checked=false), 
  //         possibly linking back to the baseItemId of the recurring template.
  //    c. Update the original recurring item template:
  //       - Set its lastAddedToTripDate to today.
  //       - Calculate and set its new nextDueDate using calculateNextDueDate.
  console.log('Processing recurring items (placeholder)...');
} 