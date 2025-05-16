import React, { createContext, useContext, useState, useEffect } from 'react';

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

// Define the trip type that will be shared across the app
export interface Trip {
  id: string;
  store: string;
  location?: string;
  coordinates?: { lat: number; lng: number };
  eta: string;
  status: 'open' | 'shopping' | 'completed' | 'cancelled';
  items: TripItem[];
  participants: TripParticipant[];
  shopper?: {
    name: string;
    avatar: string;
  };
  date: string; // ISO string format
}

export interface TripItem {
  id: string;
  name: string;
  quantity: number;
  price?: number;
  unit?: string; // Unit ID (e.g., 'kg', 'lb', 'ea')
  category?: string; // Added category field
  addedBy: {
    name: string;
    avatar: string;
  };
  checked: boolean;

  // Fields for recurring items
  isRecurring?: boolean;
  recurrenceFrequency?: 'daily' | 'weekly' | 'bi-weekly' | 'monthly' | null;
  nextDueDate?: string; // ISO date string for when it should appear on a list next
  baseItemId?: string; // Optional: if this item is an instance of a recurring template
  lastAddedToTripDate?: string; // Optional: ISO date string for when this item was last automatically added to a trip
}

export interface TripParticipant {
  id: string;
  name: string;
  avatar: string;
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
    location: "Trader Joe's",
    coordinates: { lat: 39.9702, lng: -83.0150 },
    shopper: {
      name: "Rachel",
      avatar: "https://example.com/rachel.jpg"
    },
    eta: "10 min",
    status: 'open',
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
    date: new Date().toISOString() // Today
  },
  {
    id: '2',
    store: "Costco",
    location: "Costco",
    coordinates: { lat: 39.9650, lng: -83.0200 },
    shopper: {
      name: "You",
      avatar: "https://example.com/you.jpg"
    },
    eta: "15 min",
    status: 'shopping',
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
    date: new Date(Date.now() + 86400000).toISOString() // Tomorrow
  },
  {
    id: '3',
    store: "Whole Foods",
    location: "Whole Foods",
    coordinates: { lat: 39.9600, lng: -83.0180 },
    shopper: {
      name: "Alex",
      avatar: "https://example.com/alex.jpg"
    },
    eta: "Completed",
    status: 'completed',
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
    date: new Date(Date.now() - 86400000).toISOString() // Yesterday
  }
];

interface TaskContextType {
  tasks: Task[];
  trips: Trip[];
  addTask: (task: Omit<Task, 'id'>) => void;
  updateTask: (id: string, task: Partial<Task>) => void;
  deleteTask: (id: string) => void;
  addTrip: (trip: Omit<Trip, 'id'>) => void;
  updateTrip: (id: string, trip: Partial<Trip>) => void;
  deleteTrip: (id: string) => void;
  syncTasksWithTrips: () => void;
}

const TaskContext = createContext<TaskContextType | undefined>(undefined);

export const TaskProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [tasks, setTasks] = useState<Task[]>(mockTasks);
  const [trips, setTrips] = useState<Trip[]>(mockTrips);

  // Load tasks and trips from localStorage on initial render
  useEffect(() => {
    const storedTasks = localStorage.getItem('tasks');
    const storedTrips = localStorage.getItem('trips');
    
    if (storedTasks) {
      try {
        setTasks(JSON.parse(storedTasks));
      } catch (e) {
        console.error('Error parsing stored tasks:', e);
      }
    }
    
    if (storedTrips) {
      try {
        const parsedTrips = JSON.parse(storedTrips);
        setTrips(parsedTrips);
      } catch (e) {
        console.error('Error parsing stored trips:', e);
      }
    }
  }, []);

  // Save tasks and trips to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem('tasks', JSON.stringify(tasks));
  }, [tasks]);

  // Function to handle special values during JSON serialization
  const replacer = (key: string, value: any) => {
    // Handle special cases like Date objects
    if (value instanceof Date) {
      return value.toISOString();
    }
    return value;
  };

  useEffect(() => {
    try {
      localStorage.setItem('trips', JSON.stringify(trips, replacer));
    } catch (error) {
      console.error('Error saving trips to localStorage:', error);
    }
  }, [trips]);

  // Add a new task
  const addTask = (task: Omit<Task, 'id'>) => {
    const newTask: Task = {
      ...task,
      id: Date.now().toString(),
      completed: task.completed !== undefined ? task.completed : false,
    };
    setTasks([...tasks, newTask]);
  };

  // Update an existing task
  const updateTask = (id: string, updatedTask: Partial<Task>) => {
    setTasks(tasks.map(task => 
      task.id === id ? { ...task, ...updatedTask } : task
    ));
  };

  // Delete a task
  const deleteTask = (id: string) => {
    setTasks(tasks.filter(task => task.id !== id));
  };

  // Add a new trip
  const addTrip = (trip: Omit<Trip, 'id'>) => {
    const newTrip: Trip = {
      ...trip,
      id: Date.now().toString(),
      date: trip.date ? new Date(trip.date).toISOString() : new Date().toISOString() // Ensure date is in ISO format
    };
    
    setTrips(prevTrips => {
      const updatedTrips = [...prevTrips, newTrip];
      // Save to localStorage
      localStorage.setItem('trips', JSON.stringify(updatedTrips, replacer));
      return updatedTrips;
    });
  };

  // Update an existing trip
  const updateTrip = (id: string, updatedTrip: Partial<Trip>) => {
    setTrips(prevTrips => {
      const updatedTrips = prevTrips.map(trip => {
        if (trip.id === id) {
          // If date is being updated, ensure it's in ISO format
          const newDate = updatedTrip.date ? new Date(updatedTrip.date).toISOString() : trip.date;
          return { 
            ...trip, 
            ...updatedTrip,
            date: newDate
          };
        }
        return trip;
      });
      // Save to localStorage
      localStorage.setItem('trips', JSON.stringify(updatedTrips, replacer));
      return updatedTrips;
    });
  };

  // Delete a trip
  const deleteTrip = (id: string) => {
    const trip = trips.find(t => t.id === id);
    setTrips(trips.filter(trip => trip.id !== id));
    
    // Delete corresponding task
    if (trip) {
      const taskTitle = `Trip to ${trip.store}`;
      const existingTask = tasks.find(t => t.title === taskTitle);
      if (existingTask) {
        deleteTask(existingTask.id);
      }
    }
  };

  // Sync tasks with trips to ensure they match
  const syncTasksWithTrips = () => {
    // Create tasks for trips that don't have corresponding tasks
    trips.forEach(trip => {
      if (trip.coordinates) {
        const taskTitle = `Trip to ${trip.store}`;
        const existingTask = tasks.find(t => t.title === taskTitle);
        
        if (!existingTask) {
          addTask({
            title: taskTitle,
            dueDate: new Date().toISOString().split('T')[0],
            location: trip.store,
            coordinates: trip.coordinates,
            priority: 'medium',
          });
        }
      }
    });
    
    // Update tasks that correspond to trips to ensure data is in sync
    tasks.forEach(task => {
      if (task.title.startsWith('Trip to ')) {
        const storeName = task.title.replace('Trip to ', '');
        const trip = trips.find(t => t.store === storeName);
        
        if (trip && trip.coordinates) {
          updateTask(task.id, {
            location: trip.store,
            coordinates: trip.coordinates,
          });
        }
      }
    });
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
    }}>
      {children}
    </TaskContext.Provider>
  );
};

export const useTaskContext = () => {
  const context = useContext(TaskContext);
  if (context === undefined) {
    throw new Error('useTaskContext must be used within a TaskProvider');
  }
  return context;
};
