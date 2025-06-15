import { Item, Trip } from '../context/TaskContext';
import { calculateNextDueDate, RecurrenceFrequency } from './RecurrenceService';
import { isAfter, isSameDay, parseISO } from 'date-fns';

export interface RecurringItemTemplate extends Item {
  isRecurringTemplate: true;
  isRecurring: true;
  recurrenceFrequency: RecurrenceFrequency;
  nextDueDate: string;
  preferredStores?: string[]; // Stores where this item is typically bought
  averagePrice?: number; // Historical average price
  lastPurchaseDate?: string;
}

export interface RecurringItemProcessingResult {
  itemsToAdd: Array<{
    item: Omit<Item, 'id'>;
    targetTripId?: string;
    suggestedStore?: string;
  }>;
  templatesUpdated: RecurringItemTemplate[];
  newTripsToCreate: Array<{
    store: string;
    items: Omit<Item, 'id'>[];
  }>;
}

/**
 * Service for managing recurring item templates and processing
 */
export class RecurringItemsService {
  private static instance: RecurringItemsService;
  private templates: RecurringItemTemplate[] = [];

  private constructor() {}

  static getInstance(): RecurringItemsService {
    if (!RecurringItemsService.instance) {
      RecurringItemsService.instance = new RecurringItemsService();
    }
    return RecurringItemsService.instance;
  }

  /**
   * Load recurring item templates from storage
   */
  loadTemplates(): RecurringItemTemplate[] {
    try {
      const stored = localStorage.getItem('recurringItemTemplates');
      if (stored) {
        this.templates = JSON.parse(stored);
      }
    } catch (error) {
      console.error('Error loading recurring item templates:', error);
      this.templates = [];
    }
    return this.templates;
  }

  /**
   * Save recurring item templates to storage
   */
  private saveTemplates(): void {
    try {
      localStorage.setItem('recurringItemTemplates', JSON.stringify(this.templates));
    } catch (error) {
      console.error('Error saving recurring item templates:', error);
    }
  }

  /**
   * Add or update a recurring item template
   */
  addOrUpdateTemplate(template: Omit<RecurringItemTemplate, 'id'>): RecurringItemTemplate {
    const newTemplate: RecurringItemTemplate = {
      ...template,
      id: template.baseItemId || Date.now().toString() + Math.random().toString(36).substring(2),
      isRecurringTemplate: true,
      isRecurring: true,
      checked: false, // Templates are never checked
    };

    // Check if template already exists
    const existingIndex = this.templates.findIndex(t => t.baseItemId === newTemplate.baseItemId);
    
    if (existingIndex >= 0) {
      this.templates[existingIndex] = newTemplate;
    } else {
      this.templates.push(newTemplate);
    }

    this.saveTemplates();
    return newTemplate;
  }

  /**
   * Remove a recurring item template
   */
  removeTemplate(templateId: string): boolean {
    const initialLength = this.templates.length;
    this.templates = this.templates.filter(t => t.id !== templateId);
    
    if (this.templates.length < initialLength) {
      this.saveTemplates();
      return true;
    }
    return false;
  }

  /**
   * Get all recurring item templates
   */
  getTemplates(): RecurringItemTemplate[] {
    return [...this.templates];
  }

  /**
   * Get templates that are due for processing
   */
  getDueTemplates(): RecurringItemTemplate[] {
    const now = new Date();
    return this.templates.filter(template => {
      if (!template.nextDueDate) return false;
      
      const dueDate = parseISO(template.nextDueDate);
      return isSameDay(dueDate, now) || isAfter(now, dueDate);
    });
  }

  /**
   * Process recurring items and determine what needs to be added to trips
   */
  processRecurringItems(existingTrips: Trip[]): RecurringItemProcessingResult {
    const dueTemplates = this.getDueTemplates();
    const result: RecurringItemProcessingResult = {
      itemsToAdd: [],
      templatesUpdated: [],
      newTripsToCreate: []
    };

    const today = new Date().toISOString();

    for (const template of dueTemplates) {
      // Create a new item instance from the template
      const newItem: Omit<Item, 'id'> = {
        name: template.name,
        quantity: template.quantity,
        unit: template.unit,
        price: template.averagePrice || template.price,
        category: template.category,
        notes: template.notes,
        checked: false,
        baseItemId: template.id, // Link back to the template
        isRecurring: false, // The instance itself is not recurring
        addedBy: template.addedBy || {
          name: "System",
          avatar: "https://example.com/system.jpg"
        }
      };

      // Try to find an appropriate existing trip
      const targetTrip = this.findBestTripForItem(template, existingTrips);

      if (targetTrip) {
        // Add to existing trip
        result.itemsToAdd.push({
          item: newItem,
          targetTripId: targetTrip.id
        });
      } else {
        // Need to create a new trip or suggest one
        const suggestedStore = this.getSuggestedStore(template);
        result.itemsToAdd.push({
          item: newItem,
          suggestedStore
        });

        // Group items by store for new trip creation
        const existingNewTrip = result.newTripsToCreate.find(nt => nt.store === suggestedStore);
        if (existingNewTrip) {
          existingNewTrip.items.push(newItem);
        } else {
          result.newTripsToCreate.push({
            store: suggestedStore,
            items: [newItem]
          });
        }
      }

      // Update the template with new due date
      const updatedTemplate: RecurringItemTemplate = {
        ...template,
        lastAddedToTripDate: today,
        nextDueDate: calculateNextDueDate(today, template.recurrenceFrequency),
        lastPurchaseDate: today
      };

      result.templatesUpdated.push(updatedTemplate);
    }

    // Update templates in storage
    for (const updatedTemplate of result.templatesUpdated) {
      const index = this.templates.findIndex(t => t.id === updatedTemplate.id);
      if (index >= 0) {
        this.templates[index] = updatedTemplate;
      }
    }
    this.saveTemplates();

    return result;
  }

  /**
   * Find the best existing trip to add a recurring item to
   */
  private findBestTripForItem(template: RecurringItemTemplate, trips: Trip[]): Trip | null {
    // Only consider open trips
    const openTrips = trips.filter(trip => trip.status === 'open' || trip.status === 'pending');
    
    if (openTrips.length === 0) return null;

    // Prefer trips to preferred stores
    if (template.preferredStores && template.preferredStores.length > 0) {
      const preferredTrip = openTrips.find(trip => 
        template.preferredStores!.includes(trip.store)
      );
      if (preferredTrip) return preferredTrip;
    }

    // Fallback to any open trip (could be improved with more logic)
    return openTrips[0];
  }

  /**
   * Get suggested store for a recurring item
   */
  private getSuggestedStore(template: RecurringItemTemplate): string {
    if (template.preferredStores && template.preferredStores.length > 0) {
      return template.preferredStores[0];
    }
    
    // Default fallback stores based on item category or name
    const itemName = template.name.toLowerCase();
    
    if (itemName.includes('organic') || template.category === 'Produce') {
      return "Whole Foods";
    } else if (itemName.includes('bulk') || template.quantity > 5) {
      return "Costco";
    } else {
      return "Trader Joe's"; // Default
    }
  }

  /**
   * Create a recurring item template from a regular item
   */
  createTemplateFromItem(
    item: Item, 
    recurrenceFrequency: RecurrenceFrequency,
    preferredStores?: string[]
  ): RecurringItemTemplate {
    const template: Omit<RecurringItemTemplate, 'id'> = {
      ...item,
      isRecurringTemplate: true,
      isRecurring: true,
      recurrenceFrequency,
      nextDueDate: calculateNextDueDate(new Date(), recurrenceFrequency),
      baseItemId: item.id, // Use the original item's ID as the base
      preferredStores,
      averagePrice: item.price,
      lastPurchaseDate: new Date().toISOString(),
      checked: false
    };

    return this.addOrUpdateTemplate(template);
  }

  /**
   * Update price history for a recurring item template
   */
  updateTemplatePrice(templateId: string, newPrice: number): void {
    const template = this.templates.find(t => t.id === templateId);
    if (template) {
      // Simple average calculation (could be improved with weighted average)
      if (template.averagePrice) {
        template.averagePrice = (template.averagePrice + newPrice) / 2;
      } else {
        template.averagePrice = newPrice;
      }
      template.price = newPrice;
      this.saveTemplates();
    }
  }

  /**
   * Get statistics about recurring items
   */
  getStatistics(): {
    totalTemplates: number;
    dueToday: number;
    averageSavings: number;
    mostFrequentItems: Array<{ name: string; frequency: RecurrenceFrequency; count: number }>;
  } {
    const dueToday = this.getDueTemplates().length;
    
    // Calculate frequency statistics
    const frequencyMap = new Map<string, { frequency: RecurrenceFrequency; count: number }>();
    
    this.templates.forEach(template => {
      const key = `${template.name}-${template.recurrenceFrequency}`;
      const existing = frequencyMap.get(key);
      if (existing) {
        existing.count++;
      } else {
        frequencyMap.set(key, {
          frequency: template.recurrenceFrequency,
          count: 1
        });
      }
    });

    const mostFrequentItems = Array.from(frequencyMap.entries())
      .map(([key, data]) => ({
        name: key.split('-')[0],
        frequency: data.frequency,
        count: data.count
      }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);

    return {
      totalTemplates: this.templates.length,
      dueToday,
      averageSavings: 0, // TODO: Calculate based on price tracking
      mostFrequentItems
    };
  }
}

// Export singleton instance
export const recurringItemsService = RecurringItemsService.getInstance(); 