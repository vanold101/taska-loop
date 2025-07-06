import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  CalendarDays,
  Check,
  ChevronRight,
  ListTodo,
  MapPin,
  MoreHorizontal,
  Plus,
  Search,
  Settings,
  ShoppingBag,
  ShoppingCart,
  Store,
  Users,
  Calculator,
} from "lucide-react"
import { Link, useNavigate } from "react-router-dom"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Checkbox } from "@/components/ui/checkbox"
import { useState, useEffect, useMemo } from "react"
import { AppLayout } from "@/components/AppLayout"
import TripCalendarView from "@/components/TripCalendarView"
import BudgetAdjustmentDialog from "@/components/BudgetAdjustmentDialog"
import { useTaskContext } from "@/context/TaskContext"
import NewTripDialog from "@/components/NewTripDialog"
import { AddTripDialog } from "@/components/AddTripDialog"
import TripDetailModal, { TripData } from "@/components/TripDetailModal"
import { usePantry, PantryItem } from "@/context/PantryContext"

export default function TripsPage() {
  const navigate = useNavigate();
  const { trips: contextTrips } = useTaskContext();
  const [activeTab, setActiveTab] = useState("active");
  const [searchQuery, setSearchQuery] = useState("");
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);
  const [isBudgetDialogOpen, setIsBudgetDialogOpen] = useState(false);
  const [monthlyBudget, setMonthlyBudget] = useState(500);
  const { updateBudget } = useTaskContext();
  const [isAddTripDialogOpen, setIsAddTripDialogOpen] = useState(false);
  const [selectedTrip, setSelectedTrip] = useState<TripData | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [showAdvancedOptions, setShowAdvancedOptions] = useState(false);

  // Filter trips based on status and search query
  const activeTrips = useMemo(() => 
    contextTrips.filter(trip => 
      trip.status !== 'completed' && trip.status !== 'cancelled' &&
      (searchQuery ? trip.store.toLowerCase().includes(searchQuery.toLowerCase()) : true)
    ),
    [contextTrips, searchQuery]
  );

  const completedTrips = contextTrips.filter(trip => 
    (trip.status === 'completed' || trip.status === 'cancelled') &&
    (searchQuery ? trip.store.toLowerCase().includes(searchQuery.toLowerCase()) : true)
  );

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };

  const handleSaveBudget = (newBudget: number) => {
    setMonthlyBudget(newBudget);
    updateBudget(newBudget);
    setIsBudgetDialogOpen(false);
  };

  const handleStartTrip = (tripId: string) => {
    navigate(`/trip/${tripId}`);
  };

  // Format date to be more human readable
  const formatTripDate = (dateStr: string) => {
    const date = new Date(dateStr);
    const today = new Date();
    const tomorrow = new Date();
    tomorrow.setDate(today.getDate() + 1);

    if (date.toDateString() === today.toDateString()) {
      return 'Today';
    } else if (date.toDateString() === tomorrow.toDateString()) {
      return 'Tomorrow';
    } else {
      return date.toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' });
    }
  };

  return (
    <AppLayout>
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 dark:from-gray-900 dark:via-gray-900 dark:to-gray-800">
        <div className="max-w-2xl mx-auto p-4 space-y-6">
          
          {/* Header - Clean and minimal with better colors */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-semibold text-gray-900 dark:text-gray-100">Trips</h1>
              <p className="text-sm text-gray-600 dark:text-gray-300">
                {activeTrips.length} active {activeTrips.length === 1 ? 'trip' : 'trips'}
              </p>
            </div>
            <div className="flex items-center space-x-2">
              {/* Advanced options toggle */}
              <Button 
                variant="ghost" 
                size="sm"
                onClick={() => setShowAdvancedOptions(!showAdvancedOptions)}
                className="text-gray-500 hover:text-gray-700 hover:bg-gray-100 dark:text-gray-400 dark:hover:text-gray-200 dark:hover:bg-gray-800"
              >
                <Settings className="h-4 w-4" />
              </Button>
              <Button 
                onClick={() => setIsAddTripDialogOpen(true)}
                className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white shadow-lg shadow-blue-500/25 border-0"
              >
                <Plus className="h-4 w-4 mr-2" />
                New Trip
              </Button>
            </div>
          </div>

          {/* Advanced options panel - Hidden by default with better styling */}
          {showAdvancedOptions && (
            <Card className="border border-gray-200 dark:border-gray-700 bg-white/80 backdrop-blur-sm dark:bg-gray-800/80 shadow-lg">
              <CardContent className="p-4">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => setIsCalendarOpen(true)}
                    className="flex items-center justify-center border-gray-200 hover:bg-blue-50 hover:border-blue-300 dark:border-gray-600 dark:hover:bg-gray-700"
                  >
                    <CalendarDays className="h-4 w-4 mr-2" />
                    Calendar
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => setIsBudgetDialogOpen(true)}
                    className="flex items-center justify-center border-gray-200 hover:bg-green-50 hover:border-green-300 dark:border-gray-600 dark:hover:bg-gray-700"
                  >
                    <Calculator className="h-4 w-4 mr-2" />
                    Budget
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => navigate('/map')}
                    className="flex items-center justify-center border-gray-200 hover:bg-purple-50 hover:border-purple-300 dark:border-gray-600 dark:hover:bg-gray-700"
                  >
                    <MapPin className="h-4 w-4 mr-2" />
                    Map View
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Quick Add Trip Input - Google Tasks style with better colors */}
          <div className="relative">
            <Input 
              type="text" 
              placeholder="Add a trip to..." 
              className="w-full py-3 text-base border-gray-200 dark:border-gray-600 focus:border-blue-500 dark:focus:border-blue-400 rounded-xl shadow-sm bg-white dark:bg-gray-800 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500"
              onKeyDown={(e) => {
                if (e.key === 'Enter' && e.currentTarget.value.trim()) {
                  setIsAddTripDialogOpen(true);
                  e.currentTarget.value = '';
                }
              }}
              onClick={() => setIsAddTripDialogOpen(true)}
            />
          </div>

          {/* Search with better styling */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 dark:text-gray-500" />
            <Input 
              type="search" 
              placeholder="Search trips..." 
              className="pl-10 py-2 border-gray-200 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-800 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500" 
              value={searchQuery}
              onChange={handleSearchChange}
            />
          </div>

          {/* Simple Tabs with better colors */}
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-2 mb-6 bg-gray-100 dark:bg-gray-800 p-1">
              <TabsTrigger value="active" className="data-[state=active]:bg-white data-[state=active]:text-gray-900 dark:data-[state=active]:bg-gray-700 dark:data-[state=active]:text-gray-100">Active</TabsTrigger>
              <TabsTrigger value="completed" className="data-[state=active]:bg-white data-[state=active]:text-gray-900 dark:data-[state=active]:bg-gray-700 dark:data-[state=active]:text-gray-100">Completed</TabsTrigger>
            </TabsList>

            {/* Active Trips - Google Tasks style list with better colors */}
            <TabsContent value="active" className="space-y-2">
              {activeTrips.length > 0 ? (
                <div className="space-y-3">
                  {activeTrips.map((trip) => (
                    <div
                      key={trip.id}
                      className="group flex items-center p-4 rounded-xl bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-750 transition-all duration-200 border border-gray-100 dark:border-gray-700 shadow-sm hover:shadow-md"
                    >
                      {/* Large circular checkbox/status indicator with better colors */}
                      <div className="flex-shrink-0 mr-4">
                        <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${
                          trip.status === 'completed' 
                            ? 'bg-emerald-500 border-emerald-500 shadow-sm' 
                            : trip.status === 'shopping'
                            ? 'bg-blue-500 border-blue-500 shadow-sm'
                            : 'border-gray-300 dark:border-gray-600 hover:border-blue-400 dark:hover:border-blue-500'
                        }`}>
                          {trip.status === 'completed' && (
                            <Check className="h-4 w-4 text-white" />
                          )}
                          {trip.status === 'shopping' && (
                            <ShoppingBag className="h-4 w-4 text-white" />
                          )}
                        </div>
                      </div>

                      {/* Trip content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 truncate">
                            {trip.store}
                          </h3>
                        </div>
                        
                        <div className="flex items-center mt-1 text-sm text-gray-500 dark:text-gray-400 space-x-4">
                          <span className="font-medium">{formatTripDate(trip.date)}</span>
                          {trip.time && <span>{trip.time}</span>}
                          <span className="bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded-full text-xs">
                            {trip.items.filter(i => i.checked).length}/{trip.items.length} items
                          </span>
                        </div>

                        {/* Simple progress indicator with better colors */}
                        {trip.items.length > 0 && (
                          <div className="mt-3 w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                            <div 
                              className="bg-gradient-to-r from-blue-500 to-blue-600 h-2 rounded-full transition-all duration-300" 
                              style={{ 
                                width: `${(trip.items.filter(i => i.checked).length / trip.items.length) * 100}%` 
                              }}
                            />
                          </div>
                        )}
                      </div>

                      {/* Quick action button - always visible now with better styling */}
                      <Button
                        variant="outline"
                        size="sm"
                        className="ml-4 border-blue-200 text-blue-600 hover:bg-blue-50 hover:border-blue-300 dark:border-blue-800 dark:text-blue-400 dark:hover:bg-blue-900/20"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleStartTrip(trip.id);
                        }}
                      >
                        Open
                      </Button>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-16 bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700">
                  <ShoppingCart className="h-16 w-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
                  <p className="text-gray-500 dark:text-gray-400 mb-6 text-lg">No active trips</p>
                  <Button 
                    onClick={() => setIsAddTripDialogOpen(true)}
                    className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white shadow-lg"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Create your first trip
                  </Button>
                </div>
              )}
            </TabsContent>

            {/* Completed Trips - Simplified version with better colors */}
            <TabsContent value="completed" className="space-y-2">
              {completedTrips.length > 0 ? (
                <div className="space-y-3">
                  {completedTrips.map((trip) => (
                    <div
                      key={trip.id}
                      className="group flex items-center p-4 rounded-xl bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-750 transition-all duration-200 border border-gray-100 dark:border-gray-700 shadow-sm opacity-75"
                    >
                      {/* Completed checkmark with better colors */}
                      <div className="flex-shrink-0 mr-4">
                        <div className="w-6 h-6 rounded-full bg-emerald-500 border-2 border-emerald-500 flex items-center justify-center shadow-sm">
                          <Check className="h-4 w-4 text-white" />
                        </div>
                      </div>

                      {/* Trip content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 truncate line-through">
                            {trip.store}
                          </h3>
                        </div>
                        
                        <div className="flex items-center mt-1 text-sm text-gray-500 dark:text-gray-400 space-x-4">
                          <span className="font-medium">{formatTripDate(trip.date)}</span>
                          {trip.actualSpent && <span className="text-emerald-600 dark:text-emerald-400 font-medium">${trip.actualSpent.toFixed(2)} spent</span>}
                          <span className="bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded-full text-xs">
                            {trip.items.filter(i => i.checked).length}/{trip.items.length} items
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-16 bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700">
                  <Check className="h-16 w-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
                  <p className="text-gray-500 dark:text-gray-400 text-lg">No completed trips</p>
                </div>
              )}
            </TabsContent>
          </Tabs>
        </div>

        {/* Modals */}
        <TripCalendarView 
          isOpen={isCalendarOpen}
          onClose={() => setIsCalendarOpen(false)}
        />
        
        <BudgetAdjustmentDialog
          isOpen={isBudgetDialogOpen}
          onClose={() => setIsBudgetDialogOpen(false)}
          currentBudget={monthlyBudget}
          onSave={handleSaveBudget}
        />

        <AddTripDialog
          open={isAddTripDialogOpen}
          onOpenChange={setIsAddTripDialogOpen}
        />

        {selectedTrip && (
          <TripDetailModal
            isOpen={isDetailModalOpen}
            onClose={() => setIsDetailModalOpen(false)}
            trip={selectedTrip}
            onAddItem={() => {}}
            onRemoveItem={() => {}}
            onToggleItemCheck={() => {}}
            onInviteParticipant={() => {}}
            onCompleteTrip={() => {}}
          />
        )}
      </div>
    </AppLayout>
  );
} 