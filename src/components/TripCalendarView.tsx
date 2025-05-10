import React, { useState } from 'react';
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight } from 'lucide-react';
import { motion } from 'framer-motion';
import { TripData } from './TripDetailModal';
import { Button } from './ui/button';
import { Badge } from './ui/badge';

interface TripCalendarViewProps {
  trips: TripData[];
  onTripClick: (trip: TripData) => void;
  onClose: () => void;
}

const TripCalendarView: React.FC<TripCalendarViewProps> = ({ trips, onTripClick, onClose }) => {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  
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
    
    // In a real app, we'd parse the ETA to get the actual date
    // For now, we'll just randomly assign trips to days for demonstration
    return trips.filter(trip => {
      try {
        const tripDate = new Date();
        tripDate.setDate(tripDate.getDate() + (trip.id.charCodeAt(0) % 30)); // Random distribution based on ID
        return tripDate.getDate() === day.getDate() && 
               tripDate.getMonth() === day.getMonth() && 
               tripDate.getFullYear() === day.getFullYear();
      } catch (error) {
        console.warn("Invalid date for trip", trip.id);
        return false;
      }
    });
  };
  
  const handlePrevMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1));
  };
  
  const handleNextMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1));
  };
  
  return (
    <motion.div 
      className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <motion.div 
        className="bg-white dark:bg-gray-800 rounded-lg shadow-lg max-w-md w-full p-4 bg-gradient-to-br from-blue-500/5 via-green-500/5 to-blue-500/5 dark:from-blue-900/20 dark:via-green-900/20 dark:to-blue-900/20"
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
            const isToday = day && 
              day.getDate() === new Date().getDate() && 
              day.getMonth() === new Date().getMonth() && 
              day.getFullYear() === new Date().getFullYear();
            
            return (
              <div 
                key={index} 
                className={`aspect-square p-1 rounded-md ${day ? 'cursor-pointer hover:bg-blue-50 dark:hover:bg-blue-900/20' : ''} ${isToday ? 'bg-blue-100 dark:bg-blue-900/40' : ''}`}
              >
                {day && (
                  <div className="h-full flex flex-col">
                    <div className="text-right text-sm">{day.getDate()}</div>
                    <div className="flex-1 overflow-hidden">
                      {tripsForDay.length > 0 && (
                        <div 
                          className="mt-1 text-xs bg-gradient-to-r from-blue-500 to-green-500 text-white rounded px-1 truncate"
                          onClick={() => tripsForDay.forEach(trip => onTripClick(trip))}
                        >
                          {tripsForDay.length} trip{tripsForDay.length > 1 ? 's' : ''}
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
        
        <div className="mt-4">
          <h4 className="text-sm font-medium mb-2">Upcoming Trips</h4>
          <div className="space-y-2 max-h-40 overflow-y-auto">
            {trips.slice(0, 3).map(trip => (
              <div 
                key={trip.id} 
                className="p-2 bg-blue-50 dark:bg-blue-900/20 rounded-md cursor-pointer hover:bg-blue-100 dark:hover:bg-blue-900/40"
                onClick={() => onTripClick(trip)}
              >
                <div className="flex justify-between items-center">
                  <div>
                    <div className="font-medium">{trip.store}</div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">
                      {trip.shopper.name} • {trip.eta}
                    </div>
                  </div>
                  <Badge variant="outline" className={`text-xs ${trip.status === 'open' ? 'bg-green-50 text-green-800 dark:bg-green-900/20 dark:text-green-300' : 'bg-blue-50 text-blue-800 dark:bg-blue-900/20 dark:text-blue-300'}`}>
                    {trip.status}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default TripCalendarView;
