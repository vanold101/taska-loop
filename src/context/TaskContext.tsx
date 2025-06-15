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

// Initial mock data for tasks
const mockTasks: Task[] = [
  {
    id: '1',
    title: 'Pick up dry cleaning',
    dueDate: '2025-05-05',
    location: 'Downtown Cleaners',
    coordinates: { lat: 39.9622, lng: -83.0007 },
    priority: 'high',
    completed: false,
    isRotating: false,
    assignees: [
      { id: '1', name: 'You', avatar: "" },
      { id: '2', name: 'Rachel', avatar: "" }
    ],
    notes: "Don't forget the receipt"
  },
  {
    id: '2',
    title: 'Return library books',
    dueDate: '2025-05-08',
    location: 'Columbus Public Library',
    coordinates: { lat: 39.9611, lng: -83.0101 },
    priority: 'medium',
    completed: false,
    isRotating: true,
    assignees: [
      { id: '1', name: 'You', avatar: "" }
    ],
    notes: "Books due by 8pm"
  },
  {
    id: '3',
    title: 'Get groceries from Trader Joe\'s',
    dueDate: '2025-05-02',
    location: 'Trader Joe\'s',
    coordinates: { lat: 39.9702, lng: -83.0150 },
    priority: 'high',
    completed: true,
    isRotating: false,
    assignees: [
      { id: '3', name: 'Brian', avatar: "" },
      { id: '4', name: 'Ella', avatar: "" }
    ],
    notes: "See shopping list in app"
  }
];

// Initial mock data for trips
const mockTrips: Trip[] = [
  {
    id: '1',
    store: "Trader Joe's",
    date: new Date().toISOString(),
    time: "10:00",
    status: 'pending',
    coordinates: { lat: 39.9702, lng: -83.0150 },
    items: [
      {
        id: '1-1',
        name: "Milk",
        quantity: 1,
        price: 3.99,
        unit: 'gal',
        addedBy: {
          name: "You",
          avatar: "https://example.com/you.jpg"
        },
        checked: false
      },
      {
        id: '1-2',
        name: "Eggs",
        quantity: 1,
        price: 4.49,
        unit: 'dozen',
        addedBy: {
          name: "You",
          avatar: "https://example.com/you.jpg"
        },
        checked: false
      }
    ],
    participants: [
      { id: '1', name: 'You', avatar: "https://example.com/you.jpg" },
      { id: '2', name: 'Rachel', avatar: "https://example.com/rachel.jpg" }
    ],
    shopper: { name: 'You', avatar: 'https://example.com/you.jpg' }
  },
  {
    id: '2',
    store: "Costco",
    date: new Date(Date.now() + 86400000).toISOString(),
    time: "14:00",
    status: 'shopping',
    coordinates: { lat: 39.9650, lng: -83.0200 },
    items: [
      {
        id: '2-1',
        name: "Paper Towels",
        quantity: 2,
        price: 19.99,
        unit: 'pack',
        addedBy: {
          name: "You",
          avatar: "https://example.com/you.jpg"
        },
        checked: true
      }
    ],
    participants: [
      { id: '1', name: 'You', avatar: "https://example.com/you.jpg" }
    ],
    shopper: { name: 'You', avatar: 'https://example.com/you.jpg' }
  },
  {
    id: '3',
    store: "Whole Foods",
    date: new Date(Date.now() - 86400000).toISOString(),
    time: "15:00",
    status: 'completed',
    coordinates: { lat: 39.9600, lng: -83.0180 },
    items: [
      {
        id: '3-1',
        name: "Organic Bananas",
        quantity: 1,
        price: 3.99,
        unit: 'bunch',
        addedBy: {
          name: "Alex",
          avatar: "https://example.com/alex.jpg"
        },
        checked: true
      }
    ],
    participants: [
      { id: '1', name: 'You', avatar: "https://example.com/you.jpg" },
      { id: '3', name: 'Alex', avatar: "https://example.com/alex.jpg" }
    ],
    shopper: { name: 'Alex', avatar: 'https://example.com/alex.jpg' }
  }
];

export interface TaskContextType {
  tasks: Task[];
  trips: Trip[];
  addTask: (task: Omit<Task, 'id'>) => void;
  updateTask: (id: string, task: Partial<Task>) => void;
  deleteTask: (id: string) => void;
  addTrip: (tripData: Omit<Trip, 'id' | 'status'> & { items?: Item[] }) => void;
  updateTrip: (tripId: string, updates: Partial<Trip>) => void;
  deleteTrip: (tripId: string) => void;
  syncTasksWithTrips: () => void;
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
  const { user } = useAuth();
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
        // Load tasks
        const storedTasks = localStorage.getItem(getStorageKey('tasks'));
        if (storedTasks) {
          setTasks(JSON.parse(storedTasks));
        } else {
          setTasks(mockTasks);
        }

        // Load trips
        const storedTrips = localStorage.getItem(getStorageKey('trips'));
        if (storedTrips) {
          setTrips(JSON.parse(storedTrips));
        } else {
          setTrips(mockTrips);
        }

        // Load budget
        const storedBudget = localStorage.getItem(getStorageKey('budget'));
        if (storedBudget) {
          setBudget(JSON.parse(storedBudget));
        }

        // Load recurring templates
        const templates = recurringItemsService.loadTemplates();
        setRecurringTemplates(templates);
      } catch (error) {
        console.error('Error loading data from localStorage:', error);
        setTasks(mockTasks);
        setTrips(mockTrips);
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
      }
    );

    return cleanup;
  }, [trips.length]); // Only re-run when trips are initially loaded

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
      }
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

  // Sync tasks with trips (existing function)
  const syncTasksWithTrips = () => {
    // Implementation remains the same
    console.log('Syncing tasks with trips...');
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
