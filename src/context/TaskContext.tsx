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
}

export interface TripItem {
  id: string;
  name: string;
  quantity: number;
  price?: number;
  unit?: string; // Unit ID (e.g., 'kg', 'lb', 'ea')
  addedBy: {
    name: string;
    avatar: string;
  };
  checked: boolean;
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
      { id: '2', name: 'Brian', avatar: "https://example.com/brian.jpg" }
    ]
  },
  {
    id: '2',
    store: "Costco",
    location: "Costco",
    coordinates: { lat: 39.9650, lng: -83.0200 },
    shopper: {
      name: "Brian",
      avatar: "https://example.com/brian.jpg"
    },
    eta: "25 min",
    status: 'shopping',
    items: [
      {
        id: '2-1',
        name: "Paper Towels",
        quantity: 1,
        price: 19.99,
        unit: 'pkg',
        addedBy: {
          name: "You",
          avatar: "https://example.com/you.jpg"
        },
        checked: true
      },
      {
        id: '2-2',
        name: "Toilet Paper",
        quantity: 2,
        price: 21.99,
        unit: 'pkg',
        addedBy: {
          name: "Ella",
          avatar: "https://example.com/ella.jpg"
        },
        checked: false
      }
    ],
    participants: [
      { id: '1', name: 'You', avatar: "https://example.com/you.jpg" },
      { id: '3', name: 'Ella', avatar: "https://example.com/ella.jpg" }
    ]
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

  useEffect(() => {
    localStorage.setItem('trips', JSON.stringify(trips));
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
    };
    setTrips([...trips, newTrip]);
    
    // If the trip has coordinates, create a corresponding task
    if (trip.coordinates) {
      addTask({
        title: `Trip to ${trip.store}`,
        dueDate: new Date().toISOString().split('T')[0],
        location: trip.store,
        coordinates: trip.coordinates,
        priority: 'medium',
      });
    }
  };

  // Update an existing trip
  const updateTrip = (id: string, updatedTrip: Partial<Trip>) => {
    setTrips(trips.map(trip => 
      trip.id === id ? { ...trip, ...updatedTrip } : trip
    ));
    
    // Update corresponding task if coordinates or store name changed
    if (updatedTrip.coordinates || updatedTrip.store) {
      const trip = trips.find(t => t.id === id);
      if (trip) {
        const taskTitle = `Trip to ${trip.store}`;
        const existingTask = tasks.find(t => t.title === taskTitle);
        
        if (existingTask) {
          updateTask(existingTask.id, {
            title: updatedTrip.store ? `Trip to ${updatedTrip.store}` : existingTask.title,
            location: updatedTrip.store || existingTask.location,
            coordinates: updatedTrip.coordinates || existingTask.coordinates,
          });
        }
      }
    }
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
