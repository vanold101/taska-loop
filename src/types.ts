export interface TripItem {
  id: string;
  name: string;
  quantity: number;
  unit?: string;
  price?: number;
  checked: boolean;
  isRecurring?: boolean;
  recurrenceFrequency?: 'daily' | 'weekly' | 'bi-weekly' | 'monthly' | null;
  nextDueDate?: string;
  baseItemId?: string;
  lastAddedToTripDate?: string;
  addedBy: {
    name: string;
    avatar: string;
  };
}

export interface TripParticipant {
  id: string;
  name: string;
  avatar: string;
}

export interface TripShopper {
  name: string;
  avatar: string;
}

export interface TripData {
  id: string;
  store: string;
  date: string;
  eta: string;
  status: 'open' | 'shopping' | 'completed' | 'cancelled';
  items: TripItem[];
  participants: TripParticipant[];
  shopper: TripShopper;
  coordinates?: { lat: number; lng: number };
}

export interface PantryItem {
  id: string;
  name: string;
  quantity: number;
  expiry?: string;
  category: string;
  lowStock: boolean;
} 