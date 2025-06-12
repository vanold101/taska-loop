import { useParams } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { AppLayout } from '@/components/AppLayout';
import { useTaskContext } from '@/context/TaskContext';
import { TripData, TripItem, PantryItem, TripParticipant } from '../types';
import { useState, useMemo, useEffect } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Progress } from '@/components/ui/progress';
import { Checkbox } from '@/components/ui/checkbox';
import { Plus, Trash2, Users, ShoppingCart, Clock, UserPlus, CheckCircle } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from '@/components/ui/use-toast';
import AutocompleteInput from '@/components/AutocompleteInput';
import { fruits } from '@/data/fruits';
import { vegetables } from '@/data/vegetables';
import CostSplitSummary from '@/components/CostSplitSummary';

const TripDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const { trips, updateTrip } = useTaskContext();
  const [trip, setTrip] = useState<TripData | null>(null);
  const [pantryItems, setPantryItems] = useState<PantryItem[]>([]);
  const [newItemName, setNewItemName] = useState('');

  useEffect(() => {
    const currentTrip = trips.find(t => t.id === id);
    if (currentTrip) {
      setTrip(currentTrip as unknown as TripData);
    }
    // Placeholder for fetching pantry items
    const fetchedPantryItems: PantryItem[] = [
      { id: 'p1', name: 'Milk', quantity: 1, category: 'Dairy', lowStock: false },
      { id: 'p2', name: 'Bread', quantity: 2, category: 'Bakery', lowStock: true },
      { id: 'p3', name: 'Eggs', quantity: 12, category: 'Dairy', lowStock: false },
    ];
    setPantryItems(fetchedPantryItems);
  }, [id, trips]);

  const suggestions = useMemo(() => {
    const pantryNames = pantryItems.map(item => item.name);
    return Array.from(new Set([...fruits, ...vegetables, ...pantryNames]));
  }, [pantryItems]);

  const handleAddItem = () => {
    if (!trip || !newItemName.trim()) return;

    const newItem: Omit<TripItem, 'id'> = {
      name: newItemName,
      quantity: 1,
      checked: false,
      addedBy: { name: 'You', avatar: '' },
    };

    const updatedTrip = { ...trip, items: [...trip.items, { ...newItem, id: Date.now().toString() }] };
    updateTrip(trip.id, updatedTrip);
    setNewItemName('');
    toast({ title: 'Item Added', description: `${newItemName} has been added to the trip.` });
  };
  
  const handleToggleItem = (itemId: string) => {
    if (!trip) return;
    const updatedItems = trip.items.map((item: TripItem) =>
      item.id === itemId ? { ...item, checked: !item.checked } : item
    );
    updateTrip(trip.id, { ...trip, items: updatedItems });
  };

  const handleRemoveItem = (itemId: string) => {
    if (!trip) return;
    const updatedItems = trip.items.filter((item: TripItem) => item.id !== itemId);
    updateTrip(trip.id, { ...trip, items: updatedItems });
  }

  if (!trip) {
    return (
      <AppLayout>
        <div className="p-4 md:p-8">
          <p>Trip not found.</p>
        </div>
      </AppLayout>
    );
  }

  const progress = trip.items.length > 0 ? (trip.items.filter((i: TripItem) => i.checked).length / trip.items.length) * 100 : 0;

  return (
    <AppLayout>
      <div className="p-4 md:p-8 space-y-6">
        {/* Header */}
        <Card>
          <CardHeader>
            <div className="flex justify-between items-start">
              <div>
                <CardTitle className="text-2xl">{trip.store}</CardTitle>
                <CardDescription className="flex items-center gap-2">
                  <Clock className="h-4 w-4" />
                  {new Date(trip.date).toLocaleDateString()}
                </CardDescription>
              </div>
              <Badge variant={trip.status === 'shopping' ? 'default' : 'outline'}>{trip.status}</Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex items-center space-x-4">
              <div className="flex items-center text-sm text-muted-foreground">
                <Users className="h-4 w-4 mr-2" />
                <span>{trip.participants.length} participants</span>
              </div>
              <div className="flex -space-x-2">
                {trip.participants.map((p: TripParticipant) => (
                  <Avatar key={p.id} className="h-8 w-8 border-2 border-background">
                    <AvatarImage src={p.avatar} />
                    <AvatarFallback>{p.name[0]}</AvatarFallback>
                  </Avatar>
                ))}
              </div>
            </div>
            <div className="mt-4">
              <Label>Progress</Label>
              <Progress value={progress} className="mt-1" />
            </div>
          </CardContent>
          <CardFooter className="flex gap-2">
            <Button>
              <CheckCircle className="h-4 w-4 mr-2" />
              Complete Trip
            </Button>
            <Button variant="outline">
              <UserPlus className="h-4 w-4 mr-2" />
              Invite
            </Button>
          </CardFooter>
        </Card>

        <div className="grid md:grid-cols-3 gap-6">
          {/* Main content: Shopping List */}
          <div className="md:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Shopping List</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Add Item Input */}
                <div className="flex gap-2">
                  <AutocompleteInput
                    suggestions={suggestions}
                    value={newItemName}
                    onChange={setNewItemName}
                    onSelect={setNewItemName}
                    placeholder="Add an item..."
                  />
                  <Button onClick={handleAddItem}>
                    <Plus className="h-4 w-4 mr-2" />
                    Add
                  </Button>
                </div>
                {/* Item List */}
                <ul className="space-y-2">
                  {trip.items.map((item: TripItem) => (
                    <li key={item.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center gap-3">
                        <Checkbox
                          checked={item.checked}
                          onCheckedChange={() => handleToggleItem(item.id)}
                        />
                        <span className={item.checked ? 'line-through text-muted-foreground' : ''}>
                          {item.name}
                        </span>
                      </div>
                      <Button variant="ghost" size="icon" onClick={() => handleRemoveItem(item.id)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Cost Summary</CardTitle>
              </CardHeader>
              <CardContent>
                <CostSplitSummary
                  tripId={trip.id}
                  tripName={trip.store}
                  items={trip.items}
                  participants={trip.participants}
                />
              </CardContent>
            </Card>
          </div>

          {/* Sidebar: Pantry Items */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Add from Pantry</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {pantryItems.map((item: PantryItem) => (
                    <li key={item.id} className="flex items-center justify-between">
                      <span>{item.name}</span>
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => {
                          setNewItemName(item.name);
                          handleAddItem();
                        }}
                      >
                        <Plus className="h-4 w-4" />
                      </Button>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </AppLayout>
  );
};

export default TripDetailPage; 