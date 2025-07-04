import { useState, useCallback, useRef } from 'react';
import { Calendar, dateFnsLocalizer, Views, View } from 'react-big-calendar';
import format from 'date-fns/format';
import parse from 'date-fns/parse';
import startOfWeek from 'date-fns/startOfWeek';
import getDay from 'date-fns/getDay';
import addHours from 'date-fns/addHours';
import parseISO from 'date-fns/parseISO';
import enUS from 'date-fns/locale/en-US';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useTaskContext } from '@/context/TaskContext';
import { Trip } from '@/context/TaskContext';
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, X, Plus, ShoppingCart, Clock, DollarSign, MapPin, CalendarDays } from "lucide-react";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription, SheetFooter } from "@/components/ui/sheet";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "@/components/ui/use-toast";
import { useAuth } from "@/context/AuthContext";

const locales = {
  'en-US': enUS
};

const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek,
  getDay,
  locales,
});

interface TripCalendarViewProps {
  isOpen: boolean;
  onClose: () => void;
}

interface Item {
  id: string;
  name: string;
  quantity: number;
  notes: string;
  checked: boolean;
  addedBy: {
    name: string;
    avatar: string;
    id: string;
  };
  addedAt: string;
}

// Custom event component to show more trip details
const EventComponent = ({ event, onClick }: { event: any; onClick: (event: any) => void }) => {
  const trip: Trip = event.resource;
  const itemCount = trip.items.length;
  const pendingItems = trip.items.filter(item => !item.checked).length;

  return (
    <div className="p-1 overflow-hidden cursor-pointer hover:opacity-90" onClick={() => onClick(event)}>
      <div className="font-medium truncate">{trip.store}</div>
      <div className="text-xs flex items-center gap-1 flex-wrap">
        <Badge 
          variant="outline" 
          className={
            trip.status === 'completed' ? 'bg-green-100 text-green-800' :
            trip.status === 'shopping' ? 'bg-blue-100 text-blue-800' :
            trip.status === 'cancelled' ? 'bg-red-100 text-red-800' :
            'bg-gray-100 text-gray-800'
          }
        >
          {trip.status}
        </Badge>
        <span>{itemCount} items</span>
        {pendingItems > 0 && (
          <span className="text-amber-600">({pendingItems} pending)</span>
        )}
      </div>
    </div>
  );
};

const getEventTime = (timeStr?: string): number => {
  if (typeof timeStr !== 'string' || !timeStr.includes(':')) {
    // Default to a reasonable time like noon if not specified or invalid format
    return 12 * 60;
  }
  const [hours, minutes] = timeStr.split(':').map(Number);
  return (hours || 0) * 60 + (minutes || 0);
};

export default function TripCalendarView({ isOpen, onClose }: TripCalendarViewProps) {
  const { trips, addTrip, updateTrip } = useTaskContext();
  const { user } = useAuth();
  const [view, setView] = useState<View>('month');
  const [date, setDate] = useState(new Date());
  const [selectedTrip, setSelectedTrip] = useState<Trip | null>(null);
  const [isAddingItem, setIsAddingItem] = useState(false);
  const [newItem, setNewItem] = useState({ name: '', quantity: '1', notes: '' });

  const handleNavigate = useCallback((newDate: Date) => {
    setDate(newDate);
  }, []);

  const handleViewChange = useCallback((newView: View) => {
    setView(newView);
  }, []);

  const handleEventClick = useCallback((event: any) => {
    setSelectedTrip(event.resource);
  }, []);

  const handleAddItem = useCallback(() => {
    if (!selectedTrip || !newItem.name) return;

    const updatedTrip = {
      ...selectedTrip,
      items: [
        ...selectedTrip.items,
        {
          id: Date.now().toString(),
          name: newItem.name,
          quantity: parseInt(newItem.quantity) || 1,
          notes: newItem.notes,
          checked: false,
          addedBy: {
            name: user?.name || "User",
            id: "current-user",
            avatar: user?.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.name || 'User')}&background=random`
          },
          addedAt: new Date().toISOString()
        } as Item
      ]
    };

    updateTrip(selectedTrip.id, updatedTrip);
    setSelectedTrip(updatedTrip as Trip);
    setNewItem({ name: '', quantity: '1', notes: '' });
    setIsAddingItem(false);
    
    toast({
      title: "Item Added",
      description: `${newItem.name} has been added to your trip.`,
      variant: "default"
    });
  }, [selectedTrip, newItem, updateTrip, user]);

  // Convert trips to calendar events with proper time slots
  const events = trips.map(trip => {
    const tripDate = parseISO(trip.date);
    
    // Parse the time string to set proper hours and minutes
    const timeMinutes = getEventTime(trip.time);
    tripDate.setHours(Math.floor(timeMinutes / 60));
    tripDate.setMinutes(timeMinutes % 60);
    
    // Calculate duration from eta or default to 1 hour
    let duration = 1;
    if (trip.eta) {
      if (trip.eta.includes('min')) {
        duration = parseInt(trip.eta) / 60;
      } else if (trip.eta.includes('hour')) {
        duration = parseFloat(trip.eta);
      }
    }
    
    return {
      id: trip.id,
      title: `Shopping at ${trip.store}`,
      start: tripDate,
      end: addHours(tripDate, duration),
      resource: trip,
      allDay: false
    };
  });

  const CustomToolbar = ({ onNavigate, onView, date, view: currentView }: any) => (
    <div className="flex justify-between items-center mb-4 p-2">
      <div className="flex gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => onNavigate('PREV')}
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => onNavigate('TODAY')}
        >
          Today
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => onNavigate('NEXT')}
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>
      <h2 className="text-lg font-semibold">
        {format(date, 'MMMM yyyy')}
      </h2>
      <div className="flex gap-2">
        {['month', 'week', 'day'].map((viewName) => (
          <Button
            key={viewName}
            variant={currentView === viewName ? "default" : "outline"}
            size="sm"
            onClick={() => onView(viewName)}
          >
            {viewName.charAt(0).toUpperCase() + viewName.slice(1)}
          </Button>
        ))}
      </div>
    </div>
  );

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl h-[80vh]">
        <DialogHeader>
          <DialogTitle>Shopping Trip Calendar</DialogTitle>
        </DialogHeader>
        <div className="flex-1 mt-4">
          <Calendar
            localizer={localizer}
            events={events}
            startAccessor="start"
            endAccessor="end"
            style={{ height: 'calc(80vh - 100px)' }}
            views={{
              month: true,
              week: true,
              day: true
            }}
            view={view}
            date={date}
            onNavigate={handleNavigate}
            onView={handleViewChange}
            components={{
              event: (props) => <EventComponent {...props} onClick={handleEventClick} />,
              toolbar: CustomToolbar
            }}
            eventPropGetter={(event) => {
              const trip = event.resource as Trip;
              let backgroundColor = '#60A5FA'; // blue-400
              switch (trip.status) {
                case 'completed':
                  backgroundColor = '#34D399'; // green-400
                  break;
                case 'shopping':
                  backgroundColor = '#60A5FA'; // blue-400
                  break;
                case 'cancelled':
                  backgroundColor = '#F87171'; // red-400
                  break;
                default:
                  backgroundColor = '#9CA3AF'; // gray-400
              }
              return { 
                style: { 
                  backgroundColor,
                  border: 'none',
                  borderRadius: '4px'
                } 
              };
            }}
          />
        </div>
      </DialogContent>

      {/* Trip Details Sheet */}
      <Sheet open={selectedTrip !== null} onOpenChange={() => setSelectedTrip(null)}>
        <SheetContent className="w-[400px] sm:w-[540px]">
          <SheetHeader>
            <SheetTitle className="flex items-center justify-between">
              <span>{selectedTrip?.store}</span>
              <Button 
                variant="ghost" 
                size="icon"
                onClick={() => setSelectedTrip(null)}
              >
                <X className="h-4 w-4" />
              </Button>
            </SheetTitle>
            <SheetDescription>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <CalendarDays className="h-4 w-4" />
                {selectedTrip && format(parseISO(selectedTrip.date), 'PPP')} at {selectedTrip?.time}
              </div>
            </SheetDescription>
          </SheetHeader>

          <div className="mt-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-medium">Items</h3>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => setIsAddingItem(true)}
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Item
              </Button>
            </div>

            {isAddingItem ? (
              <div className="space-y-4 mb-4">
                <div className="space-y-2">
                  <Label htmlFor="itemName">Item Name</Label>
                  <Input
                    id="itemName"
                    value={newItem.name}
                    onChange={(e) => setNewItem(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="Enter item name"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="quantity">Quantity</Label>
                  <Input
                    id="quantity"
                    type="number"
                    min="1"
                    value={newItem.quantity}
                    onChange={(e) => setNewItem(prev => ({ ...prev, quantity: e.target.value }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="notes">Notes (optional)</Label>
                  <Input
                    id="notes"
                    value={newItem.notes}
                    onChange={(e) => setNewItem(prev => ({ ...prev, notes: e.target.value }))}
                    placeholder="Add any notes"
                  />
                </div>
                <div className="flex justify-end gap-2">
                  <Button
                    variant="outline"
                    onClick={() => {
                      setIsAddingItem(false);
                      setNewItem({ name: '', quantity: '1', notes: '' });
                    }}
                  >
                    Cancel
                  </Button>
                  <Button onClick={handleAddItem}>
                    Add Item
                  </Button>
                </div>
              </div>
            ) : (
              <ScrollArea className="h-[300px] pr-4">
                {selectedTrip?.items.map((item, index) => (
                  <div key={item.id} className="flex items-center justify-between py-2">
                    <div className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={item.checked}
                        onChange={() => {
                          if (!selectedTrip) return;
                          const updatedItems = [...selectedTrip.items];
                          updatedItems[index] = { ...item, checked: !item.checked };
                          const updatedTrip = { ...selectedTrip, items: updatedItems };
                          updateTrip(selectedTrip.id, updatedTrip);
                          setSelectedTrip(updatedTrip as Trip);
                        }}
                        className="rounded border-gray-300"
                      />
                      <span className={item.checked ? 'line-through text-gray-500' : ''}>
                        {item.name}
                      </span>
                    </div>
                    <span className="text-sm text-gray-500">
                      {item.quantity > 1 ? `×${item.quantity}` : ''}
                    </span>
                  </div>
                ))}
              </ScrollArea>
            )}

            <Separator className="my-4" />

            <div className="space-y-4">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Status</span>
                <Badge 
                  variant="outline" 
                  className={
                    selectedTrip?.status === 'completed' ? 'bg-green-100 text-green-800' :
                    selectedTrip?.status === 'shopping' ? 'bg-blue-100 text-blue-800' :
                    selectedTrip?.status === 'cancelled' ? 'bg-red-100 text-red-800' :
                    'bg-gray-100 text-gray-800'
                  }
                >
                  {selectedTrip?.status}
                </Badge>
              </div>
              {selectedTrip?.eta && (
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Duration</span>
                  <span>{selectedTrip.eta}</span>
                </div>
              )}
              {selectedTrip?.budget && (
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Budget</span>
                  <span>${selectedTrip.budget}</span>
                </div>
              )}
            </div>
          </div>
        </SheetContent>
      </Sheet>
    </Dialog>
  );
}
