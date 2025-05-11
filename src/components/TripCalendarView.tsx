import React, { useState } from 'react';
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight, Store, Clock, User, MapPin } from 'lucide-react';
import { motion } from 'framer-motion';
import { TripData } from './TripDetailModal';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { cn } from '@/lib/utils';

interface TripCalendarViewProps {
  trips: TripData[];
  onTripClick: (trip: TripData) => void;
  onClose: () => void;
}

const TripCalendarView: React.FC<TripCalendarViewProps> = ({ trips, onTripClick, onClose }) => {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  
  // Generate calendar days for the current month
  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const firstDayOfMonth = new Date(year, month, 1).getDay();
    
    const days = [];
    
    // Add empty cells for days before the first day of the month
    for (let i = 0; i < firstDayOfMonth; i++) {
      days.push(null);
    }
    
    // Add days of the month
    for (let i = 1; i <= daysInMonth; i++) {
      days.push(new Date(year, month, i));
    }
    
    return days;
  };
  
  const days = getDaysInMonth(currentMonth);
  const weekdays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
  
  // Get trips for a specific day
  const getTripsForDay = (day: Date | null) => {
    if (!day) return [];
    
    return trips.filter(trip => {
      const tripDate = new Date(trip.date);
      return tripDate.getDate() === day.getDate() && 
             tripDate.getMonth() === day.getMonth() && 
             tripDate.getFullYear() === day.getFullYear();
    });
  };
  
  const handlePrevMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1));
    setSelectedDate(null);
  };
  
  const handleNextMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1));
    setSelectedDate(null);
  };

  const handleDayClick = (day: Date) => {
    setSelectedDate(day);
  };

  const getStatusColor = (status: string) => {
    switch(status) {
      case 'open':
        return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400';
      case 'shopping':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400';
      case 'completed':
        return 'bg-gray-100 text-gray-800 dark:bg-gray-800/50 dark:text-gray-400';
      case 'cancelled':
        return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-800/50 dark:text-gray-400';
    }
  };

  // Group trips by status for a given day
  const getTripsGroupedByStatus = (trips: TripData[]) => {
    const grouped = {
      open: trips.filter(t => t.status === 'open').length,
      shopping: trips.filter(t => t.status === 'shopping').length,
      completed: trips.filter(t => t.status === 'completed').length,
      cancelled: trips.filter(t => t.status === 'cancelled').length
    };
    return grouped;
  };
  
  return (
    <motion.div 
      className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <motion.div 
        className="bg-white dark:bg-gray-800 rounded-lg shadow-lg max-w-3xl w-full p-4 bg-gradient-to-br from-blue-500/5 via-green-500/5 to-blue-500/5 dark:from-blue-900/20 dark:via-green-900/20 dark:to-blue-900/20"
        initial={{ scale: 0.9, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.9, y: 20 }}
      >
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold flex items-center">
            <CalendarIcon className="mr-2 h-5 w-5 text-blue-600 dark:text-blue-400" />
            Trip Calendar
          </h2>
          <Button variant="ghost" size="sm" onClick={onClose}>
            Close
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Calendar */}
          <div>
            <div className="flex justify-between items-center mb-4">
              <Button variant="ghost" size="icon" onClick={handlePrevMonth}>
                <ChevronLeft className="h-5 w-5" />
              </Button>
              <h3 className="text-lg font-medium">
                {monthNames[currentMonth.getMonth()]} {currentMonth.getFullYear()}
              </h3>
              <Button variant="ghost" size="icon" onClick={handleNextMonth}>
                <ChevronRight className="h-5 w-5" />
              </Button>
            </div>
            
            <div className="grid grid-cols-7 gap-1 mb-2">
              {weekdays.map(day => (
                <div key={day} className="text-center text-sm font-medium text-gray-500 dark:text-gray-400">
                  {day}
                </div>
              ))}
            </div>
            
            <div className="grid grid-cols-7 gap-1">
              {days.map((day, index) => {
                const tripsForDay = day ? getTripsForDay(day) : [];
                const tripsByStatus = day ? getTripsGroupedByStatus(tripsForDay) : null;
                const isToday = day && 
                  day.getDate() === new Date().getDate() && 
                  day.getMonth() === new Date().getMonth() && 
                  day.getFullYear() === new Date().getFullYear();
                const isSelected = day && selectedDate && 
                  day.getDate() === selectedDate.getDate() && 
                  day.getMonth() === selectedDate.getMonth() && 
                  day.getFullYear() === selectedDate.getFullYear();
                
                return (
                  <div 
                    key={index} 
                    className={cn(
                      'aspect-square p-1 rounded-md relative',
                      day ? 'cursor-pointer hover:bg-blue-50 dark:hover:bg-blue-900/20' : '',
                      isToday ? 'bg-blue-100 dark:bg-blue-900/40' : '',
                      isSelected ? 'ring-2 ring-blue-500 dark:ring-blue-400' : ''
                    )}
                    onClick={() => day && handleDayClick(day)}
                  >
                    {day && (
                      <div className="h-full flex flex-col">
                        <div className="text-right text-sm">{day.getDate()}</div>
                        <div className="flex-1 overflow-hidden">
                          {tripsByStatus && (
                            <div className="mt-1 space-y-0.5">
                              {tripsByStatus.open > 0 && (
                                <div className="text-[10px] bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-400 rounded px-1 truncate">
                                  {tripsByStatus.open} open
                                </div>
                              )}
                              {tripsByStatus.shopping > 0 && (
                                <div className="text-[10px] bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-400 rounded px-1 truncate">
                                  {tripsByStatus.shopping} active
                                </div>
                              )}
                              {tripsByStatus.completed > 0 && (
                                <div className="text-[10px] bg-gray-100 dark:bg-gray-800/50 text-gray-800 dark:text-gray-400 rounded px-1 truncate">
                                  {tripsByStatus.completed} done
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Trip details for selected date */}
          <div className="border-t md:border-t-0 md:border-l border-gray-200 dark:border-gray-700 pt-4 md:pt-0 md:pl-4">
            <h3 className="text-lg font-medium mb-4">
              {selectedDate ? (
                `Trips on ${selectedDate.toLocaleDateString('en-US', { 
                  month: 'long', 
                  day: 'numeric',
                  year: 'numeric'
                })}`
              ) : (
                'Select a date to view trips'
              )}
            </h3>
            
            <div className="space-y-3 max-h-[calc(100vh-24rem)] overflow-y-auto">
              {selectedDate ? (
                getTripsForDay(selectedDate).map(trip => (
                  <motion.div 
                    key={trip.id}
                    className="p-3 bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50 cursor-pointer transition-colors"
                    onClick={() => onTripClick(trip)}
                    whileHover={{ scale: 1.02 }}
                    transition={{ type: "spring", stiffness: 400, damping: 30 }}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center">
                        <Store className="h-4 w-4 mr-2 text-blue-500" />
                        <h4 className="font-medium">{trip.store}</h4>
                      </div>
                      <Badge variant="outline" className={cn("text-xs", getStatusColor(trip.status))}>
                        {trip.status}
                      </Badge>
                    </div>
                    
                    <div className="flex items-center text-sm text-gray-500 dark:text-gray-400 mb-2">
                      <User className="h-3.5 w-3.5 mr-1" />
                      <span className="mr-3">{trip.shopper.name}</span>
                      <Clock className="h-3.5 w-3.5 mr-1" />
                      <span>{trip.eta}</span>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div className="text-sm">
                        {trip.items.length} item{trip.items.length !== 1 ? 's' : ''}
                        {trip.items.some(item => !item.checked) && (
                          <span className="text-amber-600 dark:text-amber-400"> • {trip.items.filter(item => !item.checked).length} pending</span>
                        )}
                      </div>
                      <div className="text-xs text-blue-600 dark:text-blue-400 hover:underline">
                        View Details →
                      </div>
                    </div>
                  </motion.div>
                ))
              ) : (
                <div className="text-center text-gray-500 dark:text-gray-400">
                  Click on a date to view trips scheduled for that day
                </div>
              )}
            </div>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default TripCalendarView;
