import { 
  collection, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  doc, 
  getDocs, 
  query, 
  where,
  onSnapshot,
  arrayUnion,
  arrayRemove,
  Timestamp,
  serverTimestamp
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { TripData, TripItem } from '@/components/TripDetailModal';

const TRIPS_COLLECTION = 'trips';

// Get all trips for a user
export const getUserTrips = (userId: string, callback: (trips: TripData[]) => void) => {
  const q = query(
    collection(db, TRIPS_COLLECTION),
    where('participants', 'array-contains', userId)
  );
  
  return onSnapshot(q, (querySnapshot) => {
    const trips: TripData[] = [];
    querySnapshot.forEach((doc) => {
      const data = doc.data();
      trips.push({
        id: doc.id,
        store: data.store,
        shopper: data.shopper,
        eta: data.eta,
        status: data.status,
        items: data.items || [],
        participants: data.participants || []
      });
    });
    callback(trips);
  });
};

// Create a new trip
export const createTrip = async (tripData: Omit<TripData, 'id'>) => {
  try {
    const docRef = await addDoc(collection(db, TRIPS_COLLECTION), {
      ...tripData,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    });
    return docRef.id;
  } catch (error) {
    console.error("Error creating trip: ", error);
    throw error;
  }
};

// Update a trip's status
export const updateTripStatus = async (tripId: string, status: TripData['status']) => {
  try {
    const tripRef = doc(db, TRIPS_COLLECTION, tripId);
    await updateDoc(tripRef, {
      status,
      updatedAt: serverTimestamp()
    });
    return true;
  } catch (error) {
    console.error("Error updating trip status: ", error);
    throw error;
  }
};

// Add an item to a trip
export const addItemToTrip = async (tripId: string, item: Omit<TripItem, 'id'>) => {
  try {
    const tripRef = doc(db, TRIPS_COLLECTION, tripId);
    const newItem = {
      ...item,
      id: Math.random().toString(36).substring(2, 15),
      addedAt: serverTimestamp()
    };
    
    await updateDoc(tripRef, {
      items: arrayUnion(newItem),
      updatedAt: serverTimestamp()
    });
    
    return newItem.id;
  } catch (error) {
    console.error("Error adding item to trip: ", error);
    throw error;
  }
};

// Remove an item from a trip
export const removeItemFromTrip = async (tripId: string, itemId: string) => {
  try {
    // First get the current items
    const tripRef = doc(db, TRIPS_COLLECTION, tripId);
    const tripDoc = await getDocs(query(collection(db, TRIPS_COLLECTION), where('__name__', '==', tripId)));
    
    if (tripDoc.empty) {
      throw new Error('Trip not found');
    }
    
    const tripData = tripDoc.docs[0].data();
    const items = tripData.items || [];
    const itemToRemove = items.find((item: TripItem) => item.id === itemId);
    
    if (!itemToRemove) {
      throw new Error('Item not found');
    }
    
    // Remove the item
    await updateDoc(tripRef, {
      items: arrayRemove(itemToRemove),
      updatedAt: serverTimestamp()
    });
    
    return true;
  } catch (error) {
    console.error("Error removing item from trip: ", error);
    throw error;
  }
};

// Toggle item checked status
export const toggleItemChecked = async (tripId: string, itemId: string) => {
  try {
    // First get the current items
    const tripRef = doc(db, TRIPS_COLLECTION, tripId);
    const tripDoc = await getDocs(query(collection(db, TRIPS_COLLECTION), where('__name__', '==', tripId)));
    
    if (tripDoc.empty) {
      throw new Error('Trip not found');
    }
    
    const tripData = tripDoc.docs[0].data();
    const items = tripData.items || [];
    const itemIndex = items.findIndex((item: TripItem) => item.id === itemId);
    
    if (itemIndex === -1) {
      throw new Error('Item not found');
    }
    
    // Create a new array with the updated item
    const updatedItems = [...items];
    updatedItems[itemIndex] = {
      ...updatedItems[itemIndex],
      checked: !updatedItems[itemIndex].checked
    };
    
    // Update the trip with the new items array
    await updateDoc(tripRef, {
      items: updatedItems,
      updatedAt: serverTimestamp()
    });
    
    return true;
  } catch (error) {
    console.error("Error toggling item checked status: ", error);
    throw error;
  }
};

// Add a participant to a trip
export const addParticipantToTrip = async (tripId: string, participant: { id: string, name: string, avatar?: string }) => {
  try {
    const tripRef = doc(db, TRIPS_COLLECTION, tripId);
    
    await updateDoc(tripRef, {
      participants: arrayUnion(participant),
      updatedAt: serverTimestamp()
    });
    
    return true;
  } catch (error) {
    console.error("Error adding participant to trip: ", error);
    throw error;
  }
};

// Delete a trip
export const deleteTrip = async (tripId: string) => {
  try {
    await deleteDoc(doc(db, TRIPS_COLLECTION, tripId));
    return true;
  } catch (error) {
    console.error("Error deleting trip: ", error);
    throw error;
  }
};
