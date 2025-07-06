import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { AppLayout } from '@/components/AppLayout';
import { useTaskContext } from '@/context/TaskContext';
import { usePantry } from '@/context/PantryContext';
import { useAuth } from '@/context/AuthContext';
import { TripData, TripItem, TripParticipant } from '../types';
import { useState, useMemo, useEffect } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Progress } from '@/components/ui/progress';
import { Checkbox } from '@/components/ui/checkbox';
import { Plus, Trash2, Users, ShoppingCart, Clock, UserPlus, CheckCircle, ArrowLeft, Mail } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { toast } from '@/components/ui/use-toast';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog';
import AutocompleteInput from '@/components/AutocompleteInput';
import { fruits } from '@/data/fruits';
import { vegetables } from '@/data/vegetables';
import CostSplitSummary from '@/components/CostSplitSummary';
import { inviteService } from '@/services/InviteService';

const TripDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { trips, updateTrip } = useTaskContext();
  const { pantryItems } = usePantry();
  const { user } = useAuth();
  const [trip, setTrip] = useState<TripData | null>(null);
  const [newItemName, setNewItemName] = useState('');
  const [inviteDialogOpen, setInviteDialogOpen] = useState(false);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteMessage, setInviteMessage] = useState('');

  useEffect(() => {
    const currentTrip = trips.find(t => t.id === id);
    if (currentTrip) {
      setTrip(currentTrip as unknown as TripData);
    }
  }, [id, trips]);

  // Set default invite message when dialog opens
  useEffect(() => {
    if (inviteDialogOpen && trip) {
      const defaultMessage = `Hi! I'm organizing a shopping trip to ${trip.store} and would love for you to join me.

We can coordinate our shopping list together and split any shared costs when we're done. TaskaLoop makes it easy!

Trip Details:
• Store: ${trip.store}
• Date: ${new Date(trip.date).toLocaleDateString()}

Download TaskaLoop to join the trip!`;
      
      setInviteMessage(defaultMessage);
    }
  }, [inviteDialogOpen, trip]);

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

  const handleBackToTrips = () => {
    navigate('/trips');
  };

  const handleAddFromPantry = (pantryItemName: string) => {
    if (!trip) return;
    
    const newItem: Omit<TripItem, 'id'> = {
      name: pantryItemName,
      quantity: 1,
      checked: false,
      addedBy: { name: 'You', avatar: '' },
    };

    const updatedTrip = { ...trip, items: [...trip.items, { ...newItem, id: Date.now().toString() }] };
    updateTrip(trip.id, updatedTrip);
    toast({ title: 'Item Added', description: `${pantryItemName} has been added from pantry.` });
  };

  const handleSendInvite = async () => {
    if (!trip || !user || !inviteEmail.trim()) {
      toast({
        title: "Error",
        description: "Please enter an email address",
        variant: "destructive"
      });
      return;
    }

    try {
      await inviteService.sendTripInvite({
        email: inviteEmail,
        message: inviteMessage || undefined,
        tripId: trip.id,
        tripName: trip.store,
        fromUser: {
          id: user.id || '',
          name: user.name || 'User',
          email: user.email || ''
        }
      });

      toast({
        title: "Invite Sent!",
        description: `Trip invitation sent to ${inviteEmail}`,
      });

      // Reset form and close dialog
      setInviteEmail('');
      setInviteMessage('');
      setInviteDialogOpen(false);
    } catch (error) {
      console.error('Error sending invite:', error);
      toast({
        title: "Error",
        description: "Failed to send invite. Please try again.",
        variant: "destructive"
      });
    }
  };

  if (!trip) {
    return (
      <AppLayout>
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 dark:from-gray-900 dark:via-gray-900 dark:to-gray-800">
          <div className="p-4 md:p-8">
            <p className="text-gray-900 dark:text-gray-100">Trip not found.</p>
          </div>
        </div>
      </AppLayout>
    );
  }

  const progress = trip.items.length > 0 ? (trip.items.filter((i: TripItem) => i.checked).length / trip.items.length) * 100 : 0;

  return (
    <AppLayout>
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 dark:from-gray-900 dark:via-gray-900 dark:to-gray-800">
        <div className="p-4 md:p-8 space-y-6">
          {/* Back Button */}
          <div className="flex justify-end">
            <Button
              variant="outline"
              onClick={handleBackToTrips}
              className="border-gray-200 hover:bg-gray-50 hover:border-gray-300 dark:border-gray-600 dark:hover:bg-gray-700 dark:text-gray-100"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Trips
            </Button>
          </div>

          {/* Header */}
          <Card className="border border-gray-200 dark:border-gray-700 bg-white/90 backdrop-blur-sm dark:bg-gray-800/90 shadow-lg">
            <CardHeader>
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="text-3xl font-semibold text-gray-900 dark:text-gray-100">{trip.store}</CardTitle>
                  <CardDescription className="flex items-center gap-2 text-gray-600 dark:text-gray-300">
                    <Clock className="h-4 w-4" />
                    {new Date(trip.date).toLocaleDateString()}
                  </CardDescription>
                </div>
                <Badge 
                  variant={trip.status === 'shopping' ? 'default' : 'outline'}
                  className={trip.status === 'shopping' 
                    ? 'bg-blue-500 text-white' 
                    : 'border-gray-300 text-gray-700 dark:border-gray-600 dark:text-gray-300'
                  }
                >
                  {trip.status}
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex items-center space-x-4">
                <div className="flex items-center text-sm text-gray-600 dark:text-gray-300">
                  <Users className="h-4 w-4 mr-2" />
                  <span>{trip.participants.length} participants</span>
                </div>
                <div className="flex -space-x-2">
                  {trip.participants.map((p: TripParticipant) => (
                    <Avatar key={p.id} className="h-8 w-8 border-2 border-white dark:border-gray-800">
                      <AvatarImage src={p.avatar} />
                      <AvatarFallback className="bg-blue-500 text-white text-xs">{p.name[0]}</AvatarFallback>
                    </Avatar>
                  ))}
                </div>
              </div>
              <div className="mt-4">
                <Label className="text-gray-700 dark:text-gray-300">Progress</Label>
                <Progress value={progress} className="mt-2 h-3" />
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                  {trip.items.filter((i: TripItem) => i.checked).length} of {trip.items.length} items completed
                </p>
              </div>
            </CardContent>
            <CardFooter className="flex gap-2">
              <Button className="bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white shadow-lg">
                <CheckCircle className="h-4 w-4 mr-2" />
                Complete Trip
              </Button>
              <Dialog open={inviteDialogOpen} onOpenChange={setInviteDialogOpen}>
                <DialogTrigger asChild>
                  <Button variant="outline" className="border-gray-200 hover:bg-gray-50 dark:border-gray-600 dark:hover:bg-gray-700">
                    <UserPlus className="h-4 w-4 mr-2" />
                    Invite
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[425px]">
                  <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                      <Mail className="h-5 w-5" />
                      Invite to Trip
                    </DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4 py-4">
                    <div className="space-y-2">
                      <Label htmlFor="invite-email">Email Address</Label>
                      <Input
                        id="invite-email"
                        type="email"
                        placeholder="Enter email address"
                        value={inviteEmail}
                        onChange={(e) => setInviteEmail(e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="invite-message">Custom Message (Optional)</Label>
                      <Textarea
                        id="invite-message"
                        placeholder="Add a personal message..."
                        value={inviteMessage}
                        onChange={(e) => setInviteMessage(e.target.value)}
                        className="min-h-[100px]"
                      />
                    </div>
                  </div>
                  <DialogFooter>
                    <Button variant="outline" onClick={() => setInviteDialogOpen(false)}>
                      Cancel
                    </Button>
                    <Button onClick={handleSendInvite} disabled={!inviteEmail.trim()}>
                      <Mail className="h-4 w-4 mr-2" />
                      Send Invite
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </CardFooter>
          </Card>

          <div className="grid md:grid-cols-3 gap-6">
            {/* Main content: Shopping List */}
            <div className="md:col-span-2 space-y-6">
              <Card className="border border-gray-200 dark:border-gray-700 bg-white/90 backdrop-blur-sm dark:bg-gray-800/90 shadow-lg">
                <CardHeader>
                  <CardTitle className="text-xl text-gray-900 dark:text-gray-100">Shopping List</CardTitle>
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
                    <Button 
                      onClick={handleAddItem}
                      className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white shadow-lg"
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Add
                    </Button>
                  </div>
                  {/* Item List */}
                  <ul className="space-y-3">
                    {trip.items.map((item: TripItem) => (
                      <li key={item.id} className="flex items-center justify-between p-4 border border-gray-200 dark:border-gray-700 rounded-xl bg-gray-50 dark:bg-gray-700/50 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
                        <div className="flex items-center gap-3">
                          <Checkbox
                            checked={item.checked}
                            onCheckedChange={() => handleToggleItem(item.id)}
                            className="data-[state=checked]:bg-blue-500 data-[state=checked]:border-blue-500"
                          />
                          <span className={`text-lg ${item.checked ? 'line-through text-gray-500 dark:text-gray-400' : 'text-gray-900 dark:text-gray-100'}`}>
                            {item.name}
                          </span>
                        </div>
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          onClick={() => handleRemoveItem(item.id)}
                          className="text-gray-500 hover:text-red-600 hover:bg-red-50 dark:text-gray-400 dark:hover:text-red-400 dark:hover:bg-red-900/20"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>

              <Card className="border border-gray-200 dark:border-gray-700 bg-white/90 backdrop-blur-sm dark:bg-gray-800/90 shadow-lg">
                <CardHeader>
                  <CardTitle className="text-xl text-gray-900 dark:text-gray-100">Cost Summary</CardTitle>
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
              <Card className="border border-gray-200 dark:border-gray-700 bg-white/90 backdrop-blur-sm dark:bg-gray-800/90 shadow-lg">
                <CardHeader>
                  <CardTitle className="text-xl text-gray-900 dark:text-gray-100">Add from Pantry</CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-3">
                    {pantryItems.map((item: any) => ( // Changed PantryItem to any as PantryItem type is removed
                      <li key={item.id} className="flex items-center justify-between p-3 rounded-lg bg-gray-50 dark:bg-gray-700/50 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
                        <span className="text-gray-900 dark:text-gray-100">{item.name}</span>
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() => handleAddFromPantry(item.name)}
                          className="border-blue-200 text-blue-600 hover:bg-blue-50 hover:border-blue-300 dark:border-blue-800 dark:text-blue-400 dark:hover:bg-blue-900/20"
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
      </div>
    </AppLayout>
  );
};

export default TripDetailPage; 