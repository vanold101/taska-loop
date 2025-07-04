import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';
import { initializeRecurringItemsProcessing, processRecurringItems } from '../services/RecurrenceService';
import { recurringItemsService, RecurringItemTemplate } from '../services/RecurringItemsService';

// Define the task type that will be shared across the app
export interface Task {
  id: string;
  title: string;
  dueDate: string;
  location: string;
  coordinates: { lat: number; lng: number };
  priority: 'low' | 'medium' | 'high';
  completed?: boolean;
  isRotating?: boolean;
  rotationFrequency?: 'daily' | 'weekly' | 'bi-weekly' | 'monthly' | null;
  nextRotationDate?: string;
  difficulty?: 'Easy' | 'Medium' | 'Hard' | string;
  assignees?: Array<{
    id: string;
    name: string;
    avatar: string;
  }>;
  notes?: string;
}

export interface Item {
  id: string;
  name: string;
  quantity: number;
  checked: boolean;
  category?: string;
  notes?: string;
  price?: number;
  unit?: string;
  addedBy?: {
    name: string;
    avatar: string;
  };
  // Recurring item fields
  isRecurring?: boolean;
  recurrenceFrequency?: 'daily' | 'weekly' | 'bi-weekly' | 'monthly' | null;
  nextDueDate?: string;
  baseItemId?: string; // Links to the original recurring template
  lastAddedToTripDate?: string;
  isRecurringTemplate?: boolean; // Marks this as a template, not an actual trip item
}

export interface Trip {
  id: string;
  store: string;
  date: string;
  time?: string;
  items: Item[];
  status: 'open' | 'pending' | 'shopping' | 'completed' | 'cancelled';
  notes?: string;
  eta?: string;
  budget?: number;
  actualSpent?: number;
  sharedWith?: string[];
  coordinates?: { lat: number; lng: number };
  location?: string;
  participants: Array<{ id: string; name: string; avatar: string }>;
  shopper: { name: string; avatar: string };
}

export interface TaskContextType {
  tasks: Task[];
  trips: Trip[];
  addTask: (task: Omit<Task, 'id'>) => void;
  updateTask: (id: string, task: Partial<Task>) => void;
  deleteTask: (id: string) => void;
  addTrip: (tripData: Omit<Trip, 'id' | 'status'> & { items?: Item[] }) => void;
  updateTrip: (tripId: string, updates: Partial<Trip>) => void;
  deleteTrip: (tripId: string) => void;
  syncTasksWithTrips: () => { tasksProcessed: number; tripsCreated: number; tripsUpdated: number; };
  budget: number;
  updateBudget: (newBudget: number) => void;
  // Recurring items functionality
  recurringTemplates: RecurringItemTemplate[];
  addRecurringTemplate: (template: Omit<RecurringItemTemplate, 'id'>) => void;
  updateRecurringTemplate: (templateId: string, updates: Partial<RecurringItemTemplate>) => void;
  removeRecurringTemplate: (templateId: string) => void;
  processRecurringItemsNow: () => {
    itemsProcessed: number;
    tripsUpdated: number;
    newTripsCreated: number;
    errors: string[];
  };
  createRecurringFromItem: (item: Item, frequency: 'daily' | 'weekly' | 'bi-weekly' | 'monthly', stores?: string[]) => void;
}

const TaskContext = createContext<TaskContextType | undefined>(undefined);

export function TaskProvider({ children }: { children: React.ReactNode }) {
  const { user, isAdmin } = useAuth();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [trips, setTrips] = useState<Trip[]>([]);
  const [budget, setBudget] = useState(500);
  const [recurringTemplates, setRecurringTemplates] = useState<RecurringItemTemplate[]>([]);

  // Get storage keys for current user
  const getStorageKey = (key: string) => user ? `${key}_${user.id}` : key;

  // Load data from localStorage on mount
  useEffect(() => {
    const loadData = () => {
      try {
        // Set current user for recurring items service
        recurringItemsService.setCurrentUser(user?.id || null);
        
        // Load tasks
        const storedTasks = localStorage.getItem(getStorageKey('tasks'));
        if (storedTasks) {
          setTasks(JSON.parse(storedTasks));
        } else {
          // All users start with empty tasks - no sample data
          setTasks([]);
        }

        // Load trips
        const storedTrips = localStorage.getItem(getStorageKey('trips'));
        if (storedTrips) {
          setTrips(JSON.parse(storedTrips));
        } else {
          // All users start with empty trips - no sample data
          setTrips([]);
        }

        // Load budget
        const storedBudget = localStorage.getItem(getStorageKey('budget'));
        if (storedBudget) {
          setBudget(parseFloat(storedBudget));
        } else {
          setBudget(500);
        }

        // Load recurring templates from service (now user-specific)
        const templates = recurringItemsService.loadTemplates();   
        setRecurringTemplates(templates);

      } catch (error) {
        console.error('Error loading data from localStorage:', error);
        // On error, ensure clean slate for all users
        setTasks([]);
        setTrips([]);
        setBudget(500);
        setRecurringTemplates([]);
      }
    };

    loadData();
  }, [user]);

  // Initialize recurring items processing
  useEffect(() => {
    if (trips.length === 0) return; // Wait for trips to load

    const cleanup = initializeRecurringItemsProcessing(
      () => trips,
      (tripId: string, item: Item) => {
        // Add item to existing trip
        updateTrip(tripId, {
          items: [...(trips.find(t => t.id === tripId)?.items || []), { ...item, id: Date.now().toString() + Math.random().toString(36).substring(2) }]
        });
      },
      (tripData: Omit<Trip, 'id' | 'status'> & { status: 'open' }) => {
        // Create new trip
        addTrip(tripData);
      },
      user ? { id: user.id, name: user.name, avatar: user.avatar } : undefined,
      isAdmin
    );

    return cleanup;
  }, [trips.length, user, isAdmin]); // Add user and isAdmin as dependencies

  // Save data to localStorage whenever state changes
  const replacer = (key: string, value: any) => {
    if (key === 'coordinates' && value && typeof value === 'object') {
      return { lat: value.lat, lng: value.lng };
    }
    return value;
  };

  useEffect(() => {
    try {
      localStorage.setItem(getStorageKey('tasks'), JSON.stringify(tasks, replacer));
    } catch (error) {
      console.error('Error saving tasks to localStorage:', error);
    }
  }, [tasks, user]);

  useEffect(() => {
    try {
      localStorage.setItem(getStorageKey('trips'), JSON.stringify(trips, replacer));
    } catch (error) {
      console.error('Error saving trips to localStorage:', error);
    }
  }, [trips, user]);

  useEffect(() => {
    try {
      localStorage.setItem(getStorageKey('budget'), JSON.stringify(budget));
    } catch (error) {
      console.error('Error saving budget to localStorage:', error);
    }
  }, [budget, user]);

  // Task management functions
  const addTask = (task: Omit<Task, 'id'>) => {
    const newTask = { ...task, id: Date.now().toString() };
    setTasks(prev => [...prev, newTask]);
  };

  const updateTask = (id: string, updatedTask: Partial<Task>) => {
    setTasks(prev => prev.map(task => task.id === id ? { ...task, ...updatedTask } : task));
  };

  const deleteTask = (id: string) => {
    setTasks(prev => prev.filter(task => task.id !== id));
  };

  // Trip management functions
  const addTrip = (tripData: Omit<Trip, 'id' | 'status'> & { items?: Item[] }) => {
    const newTrip: Trip = {
      ...tripData,
      id: Date.now().toString(),
      status: 'open',
      items: tripData.items || []
    };
    setTrips(prev => [...prev, newTrip]);
  };

  const updateTrip = (tripId: string, updates: Partial<Trip>) => {
    setTrips(prev => prev.map(trip => trip.id === tripId ? { ...trip, ...updates } : trip));
  };

  const deleteTrip = (tripId: string) => {
    setTrips(prev => prev.filter(trip => trip.id !== tripId));
  };

  // Recurring items management functions
  const addRecurringTemplate = (template: Omit<RecurringItemTemplate, 'id'>) => {
    const newTemplate = recurringItemsService.addOrUpdateTemplate(template);
    setRecurringTemplates(prev => {
      const existingIndex = prev.findIndex(t => t.baseItemId === newTemplate.baseItemId);
      if (existingIndex >= 0) {
        const updated = [...prev];
        updated[existingIndex] = newTemplate;
        return updated;
      } else {
        return [...prev, newTemplate];
      }
    });
  };

  const updateRecurringTemplate = (templateId: string, updates: Partial<RecurringItemTemplate>) => {
    const existingTemplate = recurringTemplates.find(t => t.id === templateId);
    if (existingTemplate) {
      const updatedTemplate = { ...existingTemplate, ...updates };
      recurringItemsService.addOrUpdateTemplate(updatedTemplate);
      setRecurringTemplates(prev => prev.map(t => t.id === templateId ? updatedTemplate : t));
    }
  };

  const removeRecurringTemplate = (templateId: string) => {
    const success = recurringItemsService.removeTemplate(templateId);
    if (success) {
      setRecurringTemplates(prev => prev.filter(t => t.id !== templateId));
    }
  };

  const processRecurringItemsNow = () => {
    const stats = processRecurringItems(
      trips,
      (tripId: string, item: Item) => {
        updateTrip(tripId, {
          items: [...(trips.find(t => t.id === tripId)?.items || []), { ...item, id: Date.now().toString() + Math.random().toString(36).substring(2) }]
        });
      },
      (tripData: Omit<Trip, 'id' | 'status'> & { status: 'open' }) => {
        addTrip(tripData);
      },
      user ? { id: user.id, name: user.name, avatar: user.avatar } : undefined,
      isAdmin
    );

    // Refresh templates after processing
    const updatedTemplates = recurringItemsService.loadTemplates();
    setRecurringTemplates(updatedTemplates);

    return stats;
  };

  const createRecurringFromItem = (
    item: Item, 
    frequency: 'daily' | 'weekly' | 'bi-weekly' | 'monthly', 
    stores?: string[]
  ) => {
    const template = recurringItemsService.createTemplateFromItem(item, frequency, stores);
    setRecurringTemplates(prev => [...prev, template]);
  };

  // Sync tasks with trips (enhanced function)
  const syncTasksWithTrips = () => {
    console.log('Syncing tasks with trips...');
    
    // Find tasks with locations that could become trips - only include tasks with BOTH location AND coordinates
    const locationTasks = tasks.filter(task => 
      task.location && 
      task.coordinates &&
      task.coordinates.lat !== 0 && // Exclude default coordinates that would put task in Atlantic Ocean
      task.coordinates.lng !== 0 &&
      !task.completed &&
      // Check if location looks like a store/shopping location
      (task.location.toLowerCase().includes('store') || 
       task.location.toLowerCase().includes('market') ||
       task.location.toLowerCase().includes('shop') ||
       task.location.toLowerCase().includes('mall') ||
       task.location.toLowerCase().includes('walmart') ||
       task.location.toLowerCase().includes('target') ||
       task.location.toLowerCase().includes('kroger') ||
       task.location.toLowerCase().includes('costco') ||
       task.location.toLowerCase().includes('trader') ||
       task.location.toLowerCase().includes('whole foods'))
    );

    // Group tasks by similar locations
    const locationGroups: { [key: string]: Task[] } = {};
    locationTasks.forEach(task => {
      const locationKey = task.location.toLowerCase().trim();
      if (!locationGroups[locationKey]) {
        locationGroups[locationKey] = [];
      }
      locationGroups[locationKey].push(task);
    });

    let syncStats = {
      tasksProcessed: 0,
      tripsCreated: 0,
      tripsUpdated: 0
    };

    // For each location group, either create a new trip or update existing one
    Object.entries(locationGroups).forEach(([location, groupTasks]) => {
      // Check if there's already an open trip for this location
      const existingTrip = trips.find(trip => 
        trip.status === 'open' && 
        trip.store.toLowerCase().includes(location.split(' ')[0]) // Match first word of location
      );

      if (existingTrip && groupTasks.length > 0) {
        // Add tasks as items to existing trip
        const newItems: Item[] = groupTasks.map(task => ({
          id: `task_${task.id}`,
          name: task.title,
          quantity: 1,
          checked: task.completed || false,
          category: 'Task',
          notes: `From task: ${task.notes || ''}`,
          addedBy: {
            name: user?.name || 'User',
            avatar: user?.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.name || 'User')}&background=random`
          }
        }));

        // Update existing trip with new items
        updateTrip(existingTrip.id, {
          items: [...existingTrip.items, ...newItems]
        });

        syncStats.tripsUpdated++;
        syncStats.tasksProcessed += groupTasks.length;

      } else if (groupTasks.length > 0) {
        // Create new trip for this location - only if we have valid coordinates
        const firstTask = groupTasks[0];
        if (firstTask.coordinates && firstTask.coordinates.lat !== 0 && firstTask.coordinates.lng !== 0) {
          const tripItems: Item[] = groupTasks.map(task => ({
            id: `task_${task.id}`,
            name: task.title,
            quantity: 1,
            checked: task.completed || false,
            category: 'Task',
            notes: `From task: ${task.notes || ''}`,
            addedBy: {
              name: user?.name || 'User',
              avatar: user?.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.name || 'User')}&background=random`
            }
          }));

          const newTrip = {
            store: firstTask.location,
            date: new Date().toISOString(),
            time: '12:00',
            items: tripItems,
            notes: `Auto-created from ${groupTasks.length} task(s)`,
            eta: '30 minutes',
            coordinates: firstTask.coordinates, // Only use coordinates if they're valid
            participants: [
              { 
                id: user?.id || '1', 
                name: user?.name || 'User', 
                avatar: user?.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.name || 'User')}&background=random`
              }
            ],
            shopper: {
              name: user?.name || 'User',
              avatar: user?.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.name || 'User')}&background=random`
            }
          };

          addTrip(newTrip);
          syncStats.tripsCreated++;
          syncStats.tasksProcessed += groupTasks.length;
        }
      }
    });

    return syncStats;
  };

  const updateBudget = (newBudget: number) => {
    setBudget(newBudget);
  };

  return (
    <TaskContext.Provider value={{
      tasks,
      trips,
      addTask,
      updateTask,
      deleteTask,
      addTrip,
      updateTrip,
      deleteTrip,
      syncTasksWithTrips,
      budget,
      updateBudget,
      // Recurring items functionality
      recurringTemplates,
      addRecurringTemplate,
      updateRecurringTemplate,
      removeRecurringTemplate,
      processRecurringItemsNow,
      createRecurringFromItem,
    }}>
      {children}
    </TaskContext.Provider>
  );
}

export function useTaskContext() {
  const context = useContext(TaskContext);
  if (context === undefined) {
    throw new Error('useTaskContext must be used within a TaskProvider');
  }
  return context;
}
