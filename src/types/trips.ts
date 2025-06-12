export interface TripItem {
  id: string;
  name: string;
  quantity: number;
  addedBy: string;
  addedAt: string;
  price?: number;
  checked?: boolean;
  unit?: string;
  brand?: string;
  notes?: string;
}

export interface Trip {
  id: string;
  name: string;
  store: string;
  status: 'open' | 'shopping' | 'completed' | 'cancelled';
  createdAt: string;
  updatedAt: string;
  items: TripItem[];
  members: string[];
  notes?: string;
  totalAmount?: number;
}

export type TripStatus = Trip['status']; 