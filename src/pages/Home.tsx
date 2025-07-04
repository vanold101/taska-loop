import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  CalendarDays,
  CheckCircle,
  Clock,
  ListTodo,
  MoreHorizontal,
  Plus,
  Search,
  Settings,
  ShoppingCart,
  Split,
  Star,
  Trash2,
  Users,
  Home,
  Map,
  Package,
  Wallet,
  LayoutDashboard,
  User,
  ChevronLeft,
  ChevronRight,
  Edit,
  Calendar,
  Crown,
  Zap
} from "lucide-react"
import { Link, useNavigate } from "react-router-dom"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Progress } from "@/components/ui/progress"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useState, useMemo } from "react"
import { useAuth } from "@/context/AuthContext"
import { useTaskContext } from "@/context/TaskContext"
import { AppLayout } from "@/components/AppLayout"
import { addDays, format, startOfMonth, endOfMonth, startOfWeek, endOfWeek, isSameMonth, isSameDay, parseISO, addMonths, subMonths } from 'date-fns'
import { CreateTaskModal } from "@/components/CreateTaskModal"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useSubscription } from "@/context/SubscriptionContext"
import SubscriptionManager from "@/components/SubscriptionManager"

export default function HomePage() {
  const navigate = useNavigate();
  const { user, isAdmin } = useAuth();
  const { tasks: contextTasks, trips: contextTrips, updateTask, deleteTask, addTask } = useTaskContext();
  const [activeTab, setActiveTab] = useState("all");
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [isCreateTaskModalOpen, setIsCreateTaskModalOpen] = useState(false);
  const [taskToEdit, setTaskToEdit] = useState<any>(null);
  const [selectedTask, setSelectedTask] = useState<any>(null);
  const [isTaskDetailModalOpen, setIsTaskDetailModalOpen] = useState(false);
  const { currentTier, limits } = useSubscription();
  const [showSubscriptionManager, setShowSubscriptionManager] = useState(false);
  
  // Count today's tasks
  const todayTasks = contextTasks.filter(task => {
    const today = new Date().toISOString().split('T')[0];
    return task.dueDate === today;
  });
  
  const completedTodayTasks = todayTasks.filter(task => task.completed);
  const todayTasksCount = todayTasks.length;
  const completedTodayTasksCount = completedTodayTasks.length;
  const completionPercentage = todayTasksCount > 0 ? (completedTodayTasksCount / todayTasksCount) * 100 : 0;

  // Count active trips
  const activeTrips = contextTrips.filter(trip => trip.status !== 'completed' && trip.status !== 'cancelled');

  // Create calendar data structure
  const calendarWeeks = useMemo(() => {
    const monthStart = startOfMonth(currentMonth);
    const monthEnd = endOfMonth(monthStart);
    const startDate = startOfWeek(monthStart);
    const endDate = endOfWeek(monthEnd);

    const dateFormat = "d";
    const rows = [];
    let days = [];
    let day = startDate;
    let formattedDate = "";

    while (day <= endDate) {
      for (let i = 0; i < 7; i++) {
        formattedDate = format(day, dateFormat);
        const dayStr = format(day, 'yyyy-MM-dd');
        
        // Count tasks for this day
        const tasksForDay = contextTasks.filter(task => task.dueDate === dayStr);
        const tasksCount = tasksForDay.length;
        const completedCount = tasksForDay.filter(task => task.completed).length;
        
        days.push({
          date: day,
          dayOfMonth: formattedDate,
          isCurrentMonth: isSameMonth(day, monthStart),
          isToday: isSameDay(day, new Date()),
          tasksCount,
          completedCount,
          tasks: tasksForDay
        });
        day = addDays(day, 1);
      }
      rows.push(days);
      days = [];
    }
    return rows;
  }, [currentMonth, contextTasks]);

  // Handler functions for buttons
  const handleNewTask = () => {
    setTaskToEdit(null);
    setIsCreateTaskModalOpen(true);
  };

  const handleViewAllTasks = () => {
    navigate('/dashboard');
  };

  const handleOpenSettings = () => {
    navigate('/settings');
  };

  const handleCheckTask = (taskId: string) => {
    const task = contextTasks.find(t => t.id === taskId);
    if (task) {
      updateTask(taskId, { completed: !task.completed });
    }
  };

  const handleStarTask = (taskId: string) => {
    const task = contextTasks.find(t => t.id === taskId);
    if (task) {
      // Here we'll use high priority as equivalent to "starred"
      const newPriority = task.priority === 'high' ? 'medium' : 'high';
      updateTask(taskId, { priority: newPriority });
    }
  };

  const handleDeleteTask = (taskId: string) => {
    const task = contextTasks.find(t => t.id === taskId);
    if (task) {
      deleteTask(taskId);
    }
  };

  const handleEditTask = (taskId: string) => {
    const task = contextTasks.find(t => t.id === taskId);
    if (task) {
      setTaskToEdit(task);
      setIsCreateTaskModalOpen(true);
    }
  };

  const handleViewTaskDetails = (taskId: string) => {
    const task = contextTasks.find(t => t.id === taskId);
    if (task) {
      setSelectedTask(task);
      setIsTaskDetailModalOpen(true);
    }
  };

  const handleRescheduleTask = (taskId: string) => {
    const task = contextTasks.find(t => t.id === taskId);
    if (task) {
      setTaskToEdit(task);
      setIsCreateTaskModalOpen(true);
    }
  };

  const handleFilterTasks = () => {
    // Implement filtering functionality
  };

  const handlePrevMonth = () => {
    setCurrentMonth(subMonths(currentMonth, 1));
  };

  const handleNextMonth = () => {
    setCurrentMonth(addMonths(currentMonth, 1));
  };

  const handleCalendarDayClick = (day: any) => {
    if (day.tasksCount > 0) {
      // Show the first task's details or switch to "all" tab to show all tasks for the day
      if (day.tasks.length === 1) {
        handleViewTaskDetails(day.tasks[0].id);
      } else {
        setActiveTab("all");
      }
    }
  };

  const handleTaskClick = (e: React.MouseEvent, task: any) => {
    e.stopPropagation();
    handleViewTaskDetails(task.id);
  };

  const getTierDisplayInfo = () => {
    switch (currentTier) {
      case 'free':
        return {
          name: 'Basic',
          icon: <Users className="h-4 w-4" />,
          color: 'bg-gray-100 text-gray-800',
          upgradeColor: 'bg-blue-600 hover:bg-blue-700'
        };
      case 'plus':
        return {
          name: 'Plus',
          icon: <Star className="h-4 w-4" />,
          color: 'bg-blue-100 text-blue-800',
          upgradeColor: 'bg-purple-600 hover:bg-purple-700'
        };
      case 'family':
        return {
          name: 'Family',
          icon: <Crown className="h-4 w-4" />,
          color: 'bg-purple-100 text-purple-800',
          upgradeColor: ''
        };
    }
  };

  const tierInfo = getTierDisplayInfo();

  return (
    <AppLayout>
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
        <div className="p-4 md:p-8 animate-fade-in">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8 animate-slide-down">
            <div>
              <h1 className="text-2xl font-bold text-slate-800 dark:text-slate-200">Home</h1>
              <p className="text-slate-500 dark:text-slate-400">Welcome back, {user?.name?.split(' ')[0] || "User"}! Here's what's happening today.</p>
            </div>
            <div className="flex gap-2">
              <Button 
                variant="outline" 
                className="border-slate-200 dark:border-slate-600 dark:text-slate-300 hover:scale-105 transition-transform duration-200"
                onClick={() => setActiveTab("today")}
              >
                <Clock className="h-4 w-4 mr-2" />
                Recent
              </Button>
              <Button 
                className="bg-teal-600 hover:bg-teal-700 dark:bg-teal-600 dark:hover:bg-teal-700 hover:scale-105 transition-transform duration-200"
                onClick={handleNewTask}
              >
                <Plus className="h-4 w-4 mr-2" />
                New Task
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8 animate-slide-up">
            <Card className="bg-gradient-to-br from-teal-500 to-teal-600 text-white border-none shadow-md hover:shadow-lg transition-all duration-300 hover:scale-105">
              <CardHeader className="pb-2">
                <CardTitle className="text-white">Today's Tasks</CardTitle>
                <CardDescription className="text-teal-100">
                  You have {todayTasksCount} {todayTasksCount === 1 ? 'task' : 'tasks'} for today
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span>Completed</span>
                    <span>{completedTodayTasksCount}/{todayTasksCount}</span>
                  </div>
                  <Progress value={completionPercentage} className="h-2 bg-teal-400" />
                </div>
              </CardContent>
              <CardFooter>
                <Button 
                  variant="secondary" 
                  className="w-full bg-white/20 hover:bg-white/30 text-white border-none transition-all duration-200"
                  onClick={() => setActiveTab("today")}
                >
                  View All Tasks
                </Button>
              </CardFooter>
            </Card>

            <Card className="border-none shadow-md dark:bg-slate-800 hover:shadow-lg transition-all duration-300 hover:scale-105">
              <CardHeader className="pb-2">
                <CardTitle className="dark:text-slate-200">Shopping Lists</CardTitle>
                <CardDescription className="dark:text-slate-400">
                  You have {activeTrips.length} active {activeTrips.length === 1 ? 'list' : 'lists'}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {activeTrips.length > 0 ? (
                    activeTrips.slice(0, 2).map((trip, index) => (
                      <div key={trip.id} className="space-y-1 animate-fade-in" style={{animationDelay: `${index * 100}ms`}}>
                        <div className="flex justify-between items-center">
                          <span className="text-slate-700 dark:text-slate-300">{trip.store || 'Shopping Trip'}</span>
                          <span className="text-sm text-slate-500 dark:text-slate-400">
                            {trip.items?.length || 0} {(trip.items?.length || 0) === 1 ? 'item' : 'items'}
                          </span>
                        </div>
                        <Progress 
                          value={trip.items?.filter(i => i.checked).length / (trip.items?.length || 1) * 100} 
                          className="h-2 dark:bg-slate-700" 
                        />
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-2 text-slate-500 dark:text-slate-400">
                      No active shopping lists
                    </div>
                  )}
                </div>
              </CardContent>
              <CardFooter>
                <Button 
                  variant="outline" 
                  className="w-full border-slate-200 dark:border-slate-700 dark:text-slate-300 hover:scale-105 transition-transform duration-200" 
                  onClick={() => navigate('/trips')}
                >
                  <ShoppingCart className="h-4 w-4 mr-2" />
                  View Shopping Lists
                </Button>
              </CardFooter>
            </Card>

            <Card className="border-none shadow-md dark:bg-slate-800 hover:shadow-lg transition-all duration-300 hover:scale-105">
              <CardHeader className="pb-2">
                <CardTitle className="dark:text-slate-200">Expense Splitting</CardTitle>
                <CardDescription className="dark:text-slate-400">
                  {isAdmin ? "May expenses with roommates" : "Track shared expenses"}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between items-center animate-fade-in">
                    <div className="flex items-center gap-2">
                      <Avatar className="h-6 w-6">
                        <AvatarFallback className="text-xs bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300">
                          {user?.name?.substring(0, 2) || "U"}
                        </AvatarFallback>
                      </Avatar>
                      <span className="text-slate-700 dark:text-slate-300">You</span>
                    </div>
                    <span className="font-medium text-slate-700 dark:text-slate-300">
                      {isAdmin ? "$63.69" : "$0.00"}
                    </span>
                  </div>
                  
                  {isAdmin ? (
                    // Admin accounts get example participants
                    <>
                      <div className="flex justify-between items-center animate-fade-in" style={{animationDelay: '100ms'}}>
                        <div className="flex items-center gap-2">
                          <Avatar className="h-6 w-6">
                            <AvatarFallback className="text-xs bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-300">SM</AvatarFallback>
                          </Avatar>
                          <span className="text-slate-700 dark:text-slate-300">Sam</span>
                        </div>
                        <span className="font-medium text-green-600 dark:text-green-400">+$12.45</span>
                      </div>
                      <div className="flex justify-between items-center animate-fade-in" style={{animationDelay: '200ms'}}>
                        <div className="flex items-center gap-2">
                          <Avatar className="h-6 w-6">
                            <AvatarFallback className="text-xs bg-amber-100 text-amber-700 dark:bg-amber-900 dark:text-amber-300">AL</AvatarFallback>
                          </Avatar>
                          <span className="text-slate-700 dark:text-slate-300">Alex</span>
                        </div>
                        <span className="font-medium text-red-600 dark:text-red-400">-$8.75</span>
                      </div>
                    </>
                  ) : (
                    // Regular users see a prompt to add household members
                    <div className="text-center py-4 animate-fade-in">
                      <div className="flex items-center justify-center w-12 h-12 bg-slate-100 dark:bg-slate-700 rounded-full mx-auto mb-2">
                        <Users className="h-6 w-6 text-slate-400" />
                      </div>
                      <p className="text-sm text-slate-500 dark:text-slate-400 mb-2">
                        No household members yet
                      </p>
                      <p className="text-xs text-slate-400 dark:text-slate-500">
                        Add roommates to start tracking shared expenses
                      </p>
                    </div>
                  )}
                </div>
              </CardContent>
              <CardFooter>
                <Button 
                  variant="outline" 
                  className="w-full border-slate-200 dark:border-slate-700 dark:text-slate-300 hover:scale-105 transition-transform duration-200" 
                  onClick={() => navigate(isAdmin ? '/ledger' : '/invite-household')}
                >
                  <Split className="h-4 w-4 mr-2" />
                  {isAdmin ? "Manage Expenses" : "Add Household Members"}
                </Button>
              </CardFooter>
            </Card>
          </div>

          <Tabs className="w-full animate-fade-in" value={activeTab} onValueChange={setActiveTab}>
            <div className="flex justify-between items-center mb-4">
              <TabsList className="grid w-full md:w-auto grid-cols-4 md:inline-flex dark:bg-slate-800">
                <TabsTrigger value="all">All Tasks</TabsTrigger>
                <TabsTrigger value="today">Today</TabsTrigger>
                <TabsTrigger value="upcoming">Upcoming</TabsTrigger>
                <TabsTrigger value="calendar">Calendar</TabsTrigger>
              </TabsList>
              <Button 
                variant="ghost" 
                size="sm" 
                className="hidden md:flex dark:text-slate-300 hover:scale-105 transition-transform duration-200"
                onClick={handleFilterTasks}
              >
                <MoreHorizontal className="h-4 w-4 mr-2" />
                Filter
              </Button>
            </div>

            <TabsContent value="all" className="space-y-4">
              <Card className="border-none shadow-sm dark:bg-slate-800 hover:shadow-md transition-shadow duration-300">
                <CardContent className="p-0">
                  <div className="divide-y divide-slate-100 dark:divide-slate-700">
                    {contextTasks.length > 0 ? (
                      contextTasks.slice(0, 5).map((task, index) => (
                        <div key={task.id} className={`flex items-center p-4 hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-all duration-200 animate-slide-in ${task.completed ? 'bg-slate-50/50 dark:bg-slate-700/30' : ''}`} style={{animationDelay: `${index * 50}ms`}}>
                          <div className="flex items-center flex-1 min-w-0 gap-3">
                            <div className="flex-shrink-0">
                              <div 
                                className={`h-5 w-5 rounded-full transition-all duration-200 hover:scale-110 ${task.completed 
                                  ? 'bg-teal-500 flex items-center justify-center cursor-pointer text-white' 
                                  : 'border-2 border-teal-500 flex items-center justify-center cursor-pointer hover:bg-teal-50 dark:hover:bg-teal-900/30'}`}
                                onClick={() => handleCheckTask(task.id)}
                              >
                                {task.completed && <CheckCircle className="h-3 w-3" />}
                              </div>
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className={`text-sm font-medium ${task.completed 
                                ? 'text-slate-500 dark:text-slate-400 line-through' 
                                : 'text-slate-800 dark:text-slate-200'} truncate`}
                              >
                                {task.title}
                              </p>
                              <div className="flex items-center gap-2 mt-1">
                                <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-300">
                                  {task.priority === 'high' ? 'High' : task.priority === 'medium' ? 'Medium' : 'Low'}
                                </span>
                                <span className="text-xs text-slate-500 dark:text-slate-400 flex items-center">
                                  <Clock className="h-3 w-3 mr-1" />
                                  {task.dueDate}
                                </span>
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center gap-2 ml-4">
                            <Button 
                              variant="ghost" 
                              size="icon" 
                              className={`h-8 w-8 transition-all duration-200 hover:scale-110 ${task.priority === 'high' 
                                ? 'text-yellow-500 hover:text-yellow-600 dark:text-yellow-400 dark:hover:text-yellow-300' 
                                : 'text-slate-400 hover:text-slate-600 dark:text-slate-500 dark:hover:text-slate-300'}`}
                              onClick={() => handleStarTask(task.id)}
                            >
                              <Star className="h-4 w-4" fill={task.priority === 'high' ? 'currentColor' : 'none'} />
                            </Button>
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-400 hover:text-slate-600 dark:text-slate-500 dark:hover:text-slate-300 hover:scale-110 transition-transform duration-200">
                                  <MoreHorizontal className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem onClick={() => handleEditTask(task.id)}>Edit</DropdownMenuItem>
                                <DropdownMenuItem onClick={() => handleRescheduleTask(task.id)}>Reschedule</DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem 
                                  className="text-red-600"
                                  onClick={() => handleDeleteTask(task.id)}
                                >
                                  Delete
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="py-8 text-center animate-fade-in">
                        <p className="text-slate-500 dark:text-slate-400">No tasks found. Create a new task to get started.</p>
                        <Button 
                          className="mt-4 bg-teal-600 hover:bg-teal-700 hover:scale-105 transition-transform duration-200"
                          onClick={handleNewTask}
                        >
                          <Plus className="h-4 w-4 mr-2" />
                          Create Task
                        </Button>
                      </div>
                    )}
                  </div>
                </CardContent>
                <CardFooter className="flex justify-center border-t border-slate-100 dark:border-slate-700 p-4">
                  <Button 
                    variant="ghost" 
                    className="text-teal-600 hover:text-teal-700 hover:bg-teal-50 dark:text-teal-400 dark:hover:text-teal-300 dark:hover:bg-teal-900/20 hover:scale-105 transition-transform duration-200"
                    onClick={handleViewAllTasks}
                  >
                    View All Tasks
                  </Button>
                </CardFooter>
              </Card>
            </TabsContent>

            <TabsContent value="today" className="space-y-4">
              <Card className="border-none shadow-sm dark:bg-slate-800 hover:shadow-md transition-shadow duration-300">
                <CardContent className="p-6">
                  {todayTasks.length > 0 ? (
                    <div className="divide-y divide-slate-100 dark:divide-slate-700">
                      {todayTasks.map((task, index) => (
                        <div key={task.id} className={`flex items-center p-4 hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-all duration-200 animate-slide-in ${task.completed ? 'bg-slate-50/50 dark:bg-slate-700/30' : ''}`} style={{animationDelay: `${index * 50}ms`}}>
                          <div className="flex items-center flex-1 min-w-0 gap-3">
                            <div className="flex-shrink-0">
                              <div 
                                className={`h-5 w-5 rounded-full ${task.completed 
                                  ? 'bg-teal-500 flex items-center justify-center cursor-pointer text-white' 
                                  : 'border-2 border-teal-500 flex items-center justify-center cursor-pointer hover:bg-teal-50 dark:hover:bg-teal-900/30'}`}
                                onClick={() => handleCheckTask(task.id)}
                              >
                                {task.completed && <CheckCircle className="h-3 w-3" />}
                              </div>
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className={`text-sm font-medium ${task.completed 
                                ? 'text-slate-500 dark:text-slate-400 line-through' 
                                : 'text-slate-800 dark:text-slate-200'} truncate`}
                              >
                                {task.title}
                              </p>
                              <div className="flex items-center gap-2 mt-1">
                                <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-300">
                                  {task.priority === 'high' ? 'High' : task.priority === 'medium' ? 'Medium' : 'Low'}
                                </span>
                                <span className="text-xs text-slate-500 dark:text-slate-400 flex items-center">
                                  <Clock className="h-3 w-3 mr-1" />
                                  Today
                                </span>
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center gap-2 ml-4">
                            <Button 
                              variant="ghost" 
                              size="icon" 
                              className={`h-8 w-8 ${task.priority === 'high' 
                                ? 'text-yellow-500 hover:text-yellow-600 dark:text-yellow-400 dark:hover:text-yellow-300' 
                                : 'text-slate-400 hover:text-slate-600 dark:text-slate-500 dark:hover:text-slate-300'}`}
                              onClick={() => handleStarTask(task.id)}
                            >
                              <Star className="h-4 w-4" fill={task.priority === 'high' ? 'currentColor' : 'none'} />
                            </Button>
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-400 hover:text-slate-600 dark:text-slate-500 dark:hover:text-slate-300">
                                  <MoreHorizontal className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem onClick={() => handleEditTask(task.id)}>Edit</DropdownMenuItem>
                                <DropdownMenuItem onClick={() => handleRescheduleTask(task.id)}>Reschedule</DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem 
                                  className="text-red-600"
                                  onClick={() => handleDeleteTask(task.id)}
                                >
                                  Delete
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center py-8 animate-fade-in">
                      <div className="w-16 h-16 rounded-full bg-teal-100 dark:bg-teal-900/50 flex items-center justify-center mb-4">
                        <CalendarDays className="h-8 w-8 text-teal-600 dark:text-teal-400" />
                      </div>
                      <h3 className="text-lg font-medium text-slate-800 dark:text-slate-200 mb-2">No Tasks Today</h3>
                      <p className="text-slate-500 dark:text-slate-400 text-center max-w-md mb-6">
                        You don't have any tasks scheduled for today.
                      </p>
                      <Button 
                        className="bg-teal-600 hover:bg-teal-700 hover:scale-105 transition-transform duration-200"
                        onClick={handleNewTask}
                      >
                        <Plus className="h-4 w-4 mr-2" />
                        Create Task
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="upcoming" className="space-y-4">
              <Card className="border-none shadow-sm dark:bg-slate-800 hover:shadow-md transition-shadow duration-300">
                <CardContent className="p-6">
                  <div className="flex flex-col items-center justify-center py-8 animate-fade-in">
                    <div className="w-16 h-16 rounded-full bg-purple-100 dark:bg-purple-900/50 flex items-center justify-center mb-4">
                      <CalendarDays className="h-8 w-8 text-purple-600 dark:text-purple-400" />
                    </div>
                    <h3 className="text-lg font-medium text-slate-800 dark:text-slate-200 mb-2">Upcoming Tasks</h3>
                    <p className="text-slate-500 dark:text-slate-400 text-center max-w-md mb-6">
                      You have {contextTasks.filter(t => !t.completed && t.dueDate > new Date().toISOString().split('T')[0]).length} tasks coming up in the next 7 days. Plan ahead to stay organized!
                    </p>
                    <Button 
                      className="bg-purple-600 hover:bg-purple-700 hover:scale-105 transition-transform duration-200"
                      onClick={handleViewAllTasks}
                    >
                      View Upcoming Tasks
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="calendar" className="space-y-4">
              <Card className="border-none shadow-sm dark:bg-slate-800 hover:shadow-md transition-shadow duration-300">
                <CardContent className="p-6">
                  <div className="flex justify-between items-center mb-6">
                    <h3 className="text-lg font-medium text-slate-800 dark:text-slate-200">
                      {format(currentMonth, 'MMMM yyyy')}
                    </h3>
                    <div className="flex items-center gap-2">
                      <Button 
                        variant="outline" 
                        size="icon" 
                        onClick={handlePrevMonth}
                        className="h-8 w-8 p-0 text-slate-600 dark:text-slate-300 hover:scale-105 transition-transform duration-200"
                      >
                        <ChevronLeft className="h-4 w-4" />
                      </Button>
                      <Button 
                        variant="outline" 
                        size="icon" 
                        onClick={handleNextMonth}
                        className="h-8 w-8 p-0 text-slate-600 dark:text-slate-300 hover:scale-105 transition-transform duration-200"
                      >
                        <ChevronRight className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>

                  <div className="grid grid-cols-7 gap-1 mb-2 text-center">
                    {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                      <div key={day} className="text-xs font-medium text-slate-500 dark:text-slate-400 py-2">
                        {day}
                      </div>
                    ))}
                  </div>

                  <div className="grid grid-cols-7 gap-1">
                    {calendarWeeks.map((week, weekIndex) => (
                      week.map((day, dayIndex) => (
                        <div 
                          key={`${weekIndex}-${dayIndex}`}
                          className={`
                            relative p-1 min-h-[80px] border 
                            ${day.isToday 
                              ? 'border-teal-500 bg-teal-50 dark:bg-teal-900/20' 
                              : day.isCurrentMonth 
                                ? 'border-slate-200 dark:border-slate-700' 
                                : 'border-slate-100 bg-slate-50 dark:border-slate-800 dark:bg-slate-800/30'
                            }
                            ${day.isCurrentMonth 
                              ? 'text-slate-800 dark:text-slate-200' 
                              : 'text-slate-400 dark:text-slate-600'
                            }
                            hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors
                          `}
                          onClick={() => handleCalendarDayClick(day)}
                        >
                          <div className="flex flex-col h-full">
                            <div className="flex justify-between items-start">
                              <span className={`
                                text-sm font-medium p-1 rounded-full w-6 h-6 flex items-center justify-center
                                ${day.isToday ? 'bg-teal-500 text-white' : ''}
                              `}>
                                {day.dayOfMonth}
                              </span>
                              {day.tasksCount > 0 && (
                                <span className="text-xs bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-300 px-1.5 py-0.5 rounded-full">
                                  {day.tasksCount}
                                </span>
                              )}
                            </div>
                            <div className="flex-1 mt-1 overflow-hidden">
                              {day.tasks.slice(0, 2).map((task, i) => (
                                <div 
                                  key={task.id}
                                  className={`text-xs truncate p-1 mb-0.5 rounded cursor-pointer hover:opacity-80
                                    ${task.completed 
                                      ? 'line-through text-slate-400 dark:text-slate-500 bg-slate-100 dark:bg-slate-700/30' 
                                      : task.priority === 'high'
                                        ? 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'
                                        : task.priority === 'medium'
                                          ? 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400'
                                          : 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
                                    }
                                  `}
                                  onClick={(e) => handleTaskClick(e, task)}
                                >
                                  {task.title}
                                </div>
                              ))}
                              {day.tasksCount > 2 && (
                                <div className="text-xs text-slate-500 dark:text-slate-400 pl-1">
                                  +{day.tasksCount - 2} more
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      ))
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
        {isCreateTaskModalOpen && (
          <CreateTaskModal
            isOpen={isCreateTaskModalOpen}
            onClose={() => {
              setIsCreateTaskModalOpen(false);
              setTaskToEdit(null);
            }}
            onSubmit={(newTask: any) => {
              if (taskToEdit) {
                updateTask(taskToEdit.id, newTask);
              } else {
                addTask(newTask);
              }
              setIsCreateTaskModalOpen(false);
              setTaskToEdit(null);
            }}
            taskToEdit={taskToEdit}
          />
        )}
        {isTaskDetailModalOpen && (
          <Dialog open={isTaskDetailModalOpen} onOpenChange={setIsTaskDetailModalOpen}>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <ListTodo className="h-5 w-5" />
                  Task Details
                </DialogTitle>
              </DialogHeader>
              {selectedTask && (
                <div className="space-y-4">
                  <div>
                    <Label className="text-sm font-medium text-muted-foreground">Title</Label>
                    <p className="text-lg font-semibold">{selectedTask.title}</p>
                  </div>
                  
                  {selectedTask.description && (
                    <div>
                      <Label className="text-sm font-medium text-muted-foreground">Description</Label>
                      <p className="text-sm text-slate-600 dark:text-slate-300">{selectedTask.description}</p>
                    </div>
                  )}
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label className="text-sm font-medium text-muted-foreground">Priority</Label>
                      <Badge variant={selectedTask.priority === 'high' ? 'destructive' : selectedTask.priority === 'medium' ? 'default' : 'secondary'}>
                        {selectedTask.priority}
                      </Badge>
                    </div>
                    <div>
                      <Label className="text-sm font-medium text-muted-foreground">Status</Label>
                      <Badge variant={selectedTask.completed ? 'success' : 'outline'}>
                        {selectedTask.completed ? 'Completed' : 'Pending'}
                      </Badge>
                    </div>
                  </div>
                  
                  <div>
                    <Label className="text-sm font-medium text-muted-foreground">Due Date</Label>
                    <p className="text-sm flex items-center gap-2">
                      <Calendar className="h-4 w-4" />
                      {format(new Date(selectedTask.dueDate), 'PPP')}
                    </p>
                  </div>
                  
                  <div className="flex gap-2 pt-4">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        handleCheckTask(selectedTask.id);
                        setIsTaskDetailModalOpen(false);
                      }}
                      className="flex-1"
                    >
                      <CheckCircle className="h-4 w-4 mr-2" />
                      {selectedTask.completed ? 'Mark Incomplete' : 'Mark Complete'}
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setIsTaskDetailModalOpen(false);
                        handleEditTask(selectedTask.id);
                      }}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        handleStarTask(selectedTask.id);
                        setIsTaskDetailModalOpen(false);
                      }}
                    >
                      <Star className={`h-4 w-4 ${selectedTask.priority === 'high' ? 'fill-current text-yellow-500' : ''}`} />
                    </Button>
                  </div>
                </div>
              )}
            </DialogContent>
          </Dialog>
        )}
        {!isAdmin && (
          <SubscriptionManager
            isOpen={showSubscriptionManager}
            onClose={() => setShowSubscriptionManager(false)}
            showUpgradeOnly={currentTier !== 'free'}
          />
        )}
      </div>
    </AppLayout>
  )
} 