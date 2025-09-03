import React, { useState, useRef } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, Modal, TextInput, Share, PanResponder, Animated } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import LocationAutocomplete from '../../src/components/LocationAutocomplete';


export default function HomePage() {
  const router = useRouter();
  const [quickStats] = useState({
    pantryItems: 12,
    activeTrips: 2,
    pendingTasks: 5,
    completedToday: 3
  });

  // Task management state
  const [tasks, setTasks] = useState([
    { id: '1', title: 'Buy groceries', completed: false, priority: 'high', dueDate: '2025-01-15', location: 'Walmart Supercenter' },
    { id: '2', title: 'Clean kitchen', completed: true, priority: 'medium', dueDate: '2025-01-14', location: 'Home' },
    { id: '3', title: 'Pay bills', completed: false, priority: 'high', dueDate: '2025-01-16', location: 'Online' },
    { id: '4', title: 'Organize pantry', completed: false, priority: 'low', dueDate: '2025-01-17', location: 'Home' },
    { id: '5', title: 'Test today task', completed: false, priority: 'medium', dueDate: new Date().toISOString().split('T')[0], location: 'Home' },
  ]);
  
  const [isAddTaskModalVisible, setIsAddTaskModalVisible] = useState(false);
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [newTaskPriority, setNewTaskPriority] = useState('medium');
  const [newTaskDueDate, setNewTaskDueDate] = useState('');
  const [newTaskLocation, setNewTaskLocation] = useState('');
  
  // Add trip modal state
  const [isAddTripModalVisible, setIsAddTripModalVisible] = useState(false);
  const [newTripTitle, setNewTripTitle] = useState('');
  const [newTripLocation, setNewTripLocation] = useState('');
  const [newTripDate, setNewTripDate] = useState('');
  
  // Add pantry item modal state
  const [isAddPantryModalVisible, setIsAddPantryModalVisible] = useState(false);
  const [newPantryItemName, setNewPantryItemName] = useState('');
  const [newPantryItemQuantity, setNewPantryItemQuantity] = useState('');
  const [newPantryItemExpiry, setNewPantryItemExpiry] = useState('');
  

  const [selectedDate, setSelectedDate] = useState(new Date());
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [showTaskDetails, setShowTaskDetails] = useState(false);
  const [selectedDateTasks, setSelectedDateTasks] = useState<typeof tasks>([]);
  const [selectedDateTrips, setSelectedDateTrips] = useState<typeof mockTrips>([]);
  const [showFullCalendar, setShowFullCalendar] = useState(false);
  const [showYearView, setShowYearView] = useState(false);
  
  // Task toggle state
  const [activeTasksTab, setActiveTasksTab] = useState<'today' | 'all'>('today');
  
  // Trip toggle state
  const [activeTripsTab, setActiveTripsTab] = useState<'today' | 'all'>('today');
  
  // Swipe animation state
  const [swipedTaskId, setSwipedTaskId] = useState<string | null>(null);
  const [editingTask, setEditingTask] = useState<any>(null);
  
  // Date picker state
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTripDatePicker, setShowTripDatePicker] = useState(false);
  
  // Mock trips data state
  const [mockTrips, setMockTrips] = useState([
    { id: '1', title: 'Grocery Shopping', location: 'Walmart Supercenter', time: '10:00 AM', date: new Date().toISOString().split('T')[0] },
    { id: '2', title: 'Hardware Store', location: 'Home Depot', time: '2:00 PM', date: new Date().toISOString().split('T')[0] },
    { id: '3', title: 'Gas Station', location: 'Shell', time: '5:00 PM', date: new Date(Date.now() + 86400000).toISOString().split('T')[0] },
    { id: '4', title: 'Pharmacy', location: 'CVS', time: '3:00 PM', date: new Date(Date.now() + 172800000).toISOString().split('T')[0] }
  ]);
  


  const handleQuickAction = (action: string) => {
    switch (action) {
      case 'Add Item':
        router.push('/pantry');
        break;
      case 'New Trip':
        router.push('/trips');
        break;
      case 'New Task':
        setIsAddTaskModalVisible(true);
        break;

      default:
        Alert.alert('Quick Action', `You tapped: ${action}`);
    }
  };



  const exportData = () => {
    const data = {
      tasks: tasks,
      stats: quickStats,
      exportDate: new Date().toISOString(),
      app: 'Taska Loop'
    };
    
    const dataString = JSON.stringify(data, null, 2);
    
    Share.share({
      message: `Taska Loop Data Export:\n\n${dataString}`,
      title: 'Taska Loop Data'
    });
  };

  const shareApp = () => {
    Share.share({
      message: 'Check out Taska Loop - the smart household management app!',
      title: 'Taska Loop'
    });
  };

  const addTask = () => {
    if (newTaskTitle.trim()) {
      const newTask = {
        id: Date.now().toString(),
        title: newTaskTitle.trim(),
        completed: false,
        priority: newTaskPriority,
        dueDate: newTaskDueDate || selectedDate.toISOString().split('T')[0],
        location: newTaskLocation || 'No location'
      };
      setTasks([...tasks, newTask]);
      setNewTaskTitle('');
      setNewTaskPriority('medium');
      setNewTaskDueDate('');
      setNewTaskLocation('');
      setIsAddTaskModalVisible(false);
    }
  };

  const addTrip = () => {
    if (newTripTitle.trim()) {
      const newTrip = {
        id: Date.now().toString(),
        title: newTripTitle.trim(),
        location: newTripLocation || 'No location',
        time: '12:00 PM', // Default time
        date: newTripDate || selectedDate.toISOString().split('T')[0]
      };
      setMockTrips([...mockTrips, newTrip]);
      setNewTripTitle('');
      setNewTripLocation('');
      setNewTripDate('');
      setIsAddTripModalVisible(false);
    }
  };

  const addPantryItem = () => {
    if (newPantryItemName.trim()) {
      Alert.alert('Item Added', `${newPantryItemName} has been added to your pantry`);
      setNewPantryItemName('');
      setNewPantryItemQuantity('');
      setNewPantryItemExpiry('');
      setIsAddPantryModalVisible(false);
    }
  };

  // Calendar import handlers
  const handleGoogleCalendarImport = async () => {
    Alert.alert(
      'Google Calendar Integration',
      'To enable Google Calendar sync, you need to:\n\n1. Enable Google Calendar API in Google Cloud Console\n2. Add calendar scopes to your OAuth configuration\n3. Get calendar access permission from users\n\nWould you like to proceed with the setup?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Setup Guide', 
          onPress: () => Alert.alert(
            'Setup Instructions',
            'API Requirements:\n\n1. Go to Google Cloud Console\n2. Enable Google Calendar API\n3. Add these scopes to OAuth:\n   - https://www.googleapis.com/auth/calendar.readonly\n   - https://www.googleapis.com/auth/calendar.events\n\n4. Update your OAuth consent screen\n5. Test the integration'
          )
        }
      ]
    );
  };

  const handleAppleCalendarImport = async () => {
    Alert.alert(
      'Apple Calendar Integration',
      'Apple Calendar integration requires:\n\n1. EventKit framework integration\n2. Calendar access permissions\n3. iOS/macOS specific implementation\n\nThis feature requires native iOS development.',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Requirements', 
          onPress: () => Alert.alert(
            'Technical Requirements',
            'For Apple Calendar:\n\n1. Add EventKit framework\n2. Request calendar permissions in Info.plist\n3. Implement EventKit APIs\n4. Handle calendar data synchronization\n\nThis requires Expo bare workflow or React Native CLI.'
          )
        }
      ]
    );
  };

  const toggleTask = (taskId: string) => {
    setTasks(tasks.map(task => 
      task.id === taskId ? { ...task, completed: !task.completed } : task
    ));
  };

  const deleteTask = (taskId: string) => {
    Alert.alert(
      'Delete Task',
      'Are you sure you want to delete this task?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Delete', 
          style: 'destructive',
          onPress: () => setTasks(tasks.filter(task => task.id !== taskId))
        }
      ]
    );
  };

  const startEditTask = (task: any) => {
    setEditingTask(task);
    setNewTaskTitle(task.title);
    setNewTaskPriority(task.priority);
    setNewTaskDueDate(task.dueDate);
    setNewTaskLocation(task.location);
    setIsAddTaskModalVisible(true);
  };

  const updateTask = () => {
    if (newTaskTitle.trim() && editingTask) {
      const updatedTask = {
        ...editingTask,
        title: newTaskTitle.trim(),
        priority: newTaskPriority,
        dueDate: newTaskDueDate || selectedDate.toISOString().split('T')[0],
        location: newTaskLocation || 'No location'
      };
      
      const newTasks = tasks.map(task => 
        task.id === editingTask.id ? updatedTask : task
      );
      setTasks(newTasks);
      
      setNewTaskTitle('');
      setNewTaskPriority('medium');
      setNewTaskDueDate('');
      setNewTaskLocation('');
      setEditingTask(null);
      setIsAddTaskModalVisible(false);
      
      // Always refresh the filtered views based on current selected date
      const dateString = selectedDate.toISOString().split('T')[0];
      const dayTasks = newTasks.filter(task => task.dueDate === dateString);
      setSelectedDateTasks(dayTasks);
      
      // Also refresh trips for the selected date
      const dayTrips = mockTrips.filter(trip => trip.date === dateString);
      setSelectedDateTrips(dayTrips);
    }
  };

  const startEditTrip = (trip: any) => {
    setEditingTask(trip);
    setNewTripTitle(trip.title);
    setNewTripDate(trip.date);
    setNewTripLocation(trip.location);
    setIsAddTripModalVisible(true);
  };

  const updateTrip = () => {
    if (newTripTitle.trim() && editingTask) {
      const updatedTrip = {
        ...editingTask,
        title: newTripTitle.trim(),
        date: newTripDate || selectedDate.toISOString().split('T')[0],
        location: newTripLocation || 'No location'
      };
      
      // Update the mock trips data
      const tripIndex = mockTrips.findIndex(t => t.id === editingTask.id);
      if (tripIndex !== -1) {
        const newMockTrips = [...mockTrips];
        newMockTrips[tripIndex] = updatedTrip;
        setMockTrips(newMockTrips);
        
        // Force re-render of filtered views by updating the selected date trips
        if (selectedDate) {
          const dateString = selectedDate.toISOString().split('T')[0];
          const dayTrips = newMockTrips.filter(trip => trip.date === dateString);
          setSelectedDateTrips(dayTrips);
        }
      }
      
      setNewTripTitle('');
      setNewTripDate('');
      setNewTripLocation('');
      setEditingTask(null);
      setIsAddTripModalVisible(false);
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return '#F44336';
      case 'medium': return '#FF9800';
      case 'low': return '#4CAF50';
      default: return '#FF9800';
    }
  };

  const getPriorityIcon = (priority: string) => {
    switch (priority) {
      case 'high': return 'flag';
      case 'medium': return 'flag-outline';
      case 'low': return 'flag-outline';
      default: return 'flag-outline';
    }
  };

  // Calendar functions
  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();
    
    const days = [];
    
    // Add empty days for padding
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(null);
    }
    
    // Add days of the month
    for (let i = 1; i <= daysInMonth; i++) {
      const dayDate = new Date(year, month, i);
      const dayTasks = tasks.filter(task => task.dueDate === dayDate.toISOString().split('T')[0]);
      days.push({
        date: i,
        tasks: dayTasks,
        tasksCount: dayTasks.length
      });
    }
    
    return days;
  };

  const calendarDays = getDaysInMonth(currentMonth);

  const getStartOfWeek = (date: Date) => {
    const start = new Date(date);
    const day = start.getDay();
    start.setDate(start.getDate() - day);
    start.setHours(0, 0, 0, 0);
    return start;
  };

  const getWeekDays = (startDate: Date) => {
    const days: Date[] = [];
    for (let i = 0; i < 7; i++) {
      const d = new Date(startDate);
      d.setDate(startDate.getDate() + i);
      days.push(d);
    }
    return days;
  };

  const openTasksForDate = (date: Date) => {
    const dateString = new Date(date.getFullYear(), date.getMonth(), date.getDate()).toISOString().split('T')[0];
    const dayTasks = tasks.filter(task => task.dueDate === dateString);
    const dayTrips = mockTrips.filter(trip => trip.date === dateString);
    setSelectedDateTasks(dayTasks);
    setSelectedDateTrips(dayTrips);
    setSelectedDate(date);
    // Do not open modal automatically; the UI updates inline
  };

  const weekStart = getStartOfWeek(selectedDate);
  const weekDays = getWeekDays(weekStart);



  const goToPreviousMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1));
  };

  const goToNextMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1));
  };

  const goToPreviousYear = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear() - 1, currentMonth.getMonth(), 1));
  };

  const goToNextYear = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear() + 1, currentMonth.getMonth(), 1));
  };

  const selectMonth = (monthIndex: number) => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), monthIndex, 1));
    setShowYearView(false);
  };

  const handleCalendarDayClick = (day: any) => {
    if (day) {
      const newDate = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day.date);
      openTasksForDate(newDate);
      setShowFullCalendar(false);
    }
  };

  // Swipeable Task Item Component
  const SwipeableTaskItem = ({ task, onToggle, onEdit }: { 
    task: any; 
    onToggle: (id: string) => void; 
    onEdit: (task: any) => void; 
  }) => {
    const translateX = useRef(new Animated.Value(0)).current;
    const [isSwiped, setIsSwiped] = useState(false);

    const panResponder = PanResponder.create({
      onMoveShouldSetPanResponder: (_, gestureState) => {
        return Math.abs(gestureState.dx) > 10;
      },
      onPanResponderGrant: () => {
        translateX.setOffset(0);
      },
      onPanResponderMove: (_, gestureState) => {
        if (gestureState.dx < 0) { // Only allow left swipe
          translateX.setValue(gestureState.dx);
        }
      },
      onPanResponderRelease: (_, gestureState) => {
        translateX.flattenOffset();
        if (gestureState.dx < -50) { // Swipe left threshold
          Animated.spring(translateX, {
            toValue: -80,
            useNativeDriver: true,
          }).start();
          setIsSwiped(true);
        } else {
          Animated.spring(translateX, {
            toValue: 0,
            useNativeDriver: true,
          }).start();
          setIsSwiped(false);
        }
      },
    });

    const resetSwipe = () => {
      Animated.spring(translateX, {
        toValue: 0,
        useNativeDriver: true,
      }).start();
      setIsSwiped(false);
    };

    return (
      <View style={styles.swipeableContainer}>
        {/* Swipe Actions Background */}
        <View style={styles.swipeActionsBackground}>
          <TouchableOpacity 
            style={styles.editButton}
            onPress={() => {
              onEdit(task);
              resetSwipe();
            }}
          >
            <Ionicons name="create-outline" size={20} color="#FFFFFF" />
          </TouchableOpacity>
        </View>
        
        {/* Task Item */}
        <Animated.View
          style={[
            styles.taskListItem,
            { transform: [{ translateX }] }
          ]}
          {...panResponder.panHandlers}
        >
          <TouchableOpacity 
            style={styles.taskListItemContent}
            onPress={() => onToggle(task.id)}
          >
            <Ionicons 
              name={task.completed ? 'checkmark-circle' : 'ellipse-outline'} 
              size={20} 
              color={task.completed ? '#4CAF50' : '#2E8BFF'} 
            />
            <View style={styles.taskListContent}>
              <Text style={[styles.taskListTitle, task.completed && styles.taskListTitleCompleted]}>
                {task.title}
              </Text>
              <Text style={styles.taskListLocation}>{task.location}</Text>
              {task.dueDate && (
                <Text style={styles.taskListDueDate}>
                  Due: {new Date(task.dueDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                </Text>
              )}
            </View>
            <View style={styles.taskListActions}>
              <Ionicons 
                name={getPriorityIcon(task.priority)} 
                size={16} 
                color={getPriorityColor(task.priority)} 
              />
            </View>
          </TouchableOpacity>
        </Animated.View>
      </View>
    );
  };

  // Swipeable Trip Item Component
  const SwipeableTripItem = ({ trip, onEdit }: { 
    trip: any; 
    onEdit: (trip: any) => void; 
  }) => {
    const translateX = useRef(new Animated.Value(0)).current;
    const [isSwiped, setIsSwiped] = useState(false);

    const panResponder = PanResponder.create({
      onMoveShouldSetPanResponder: (_, gestureState) => {
        return Math.abs(gestureState.dx) > 10;
      },
      onPanResponderGrant: () => {
        translateX.setOffset(0);
      },
      onPanResponderMove: (_, gestureState) => {
        if (gestureState.dx < 0) { // Only allow left swipe
          translateX.setValue(gestureState.dx);
        }
      },
      onPanResponderRelease: (_, gestureState) => {
        translateX.flattenOffset();
        if (gestureState.dx < -50) { // Swipe left threshold
          Animated.spring(translateX, {
            toValue: -80,
            useNativeDriver: true,
          }).start();
          setIsSwiped(true);
        } else {
          Animated.spring(translateX, {
            toValue: 0,
            useNativeDriver: true,
          }).start();
          setIsSwiped(false);
        }
      },
    });

    const resetSwipe = () => {
      Animated.spring(translateX, {
        toValue: 0,
        useNativeDriver: true,
      }).start();
      setIsSwiped(false);
    };

    return (
      <View style={styles.swipeableContainer}>
        {/* Swipe Actions Background - Always present but positioned behind */}
        <View style={styles.swipeActionsBackground}>
          <TouchableOpacity 
            style={styles.editButton}
            onPress={() => {
              onEdit(trip);
              resetSwipe();
            }}
          >
            <Ionicons name="create-outline" size={20} color="#FFFFFF" />
          </TouchableOpacity>
        </View>
        
        {/* Trip Item */}
        <Animated.View
          style={[
            styles.taskListItem,
            { transform: [{ translateX }] }
          ]}
          {...panResponder.panHandlers}
        >
          <View style={styles.taskListItemContent}>
            <Ionicons name="car-outline" size={20} color="#2E8BFF" />
            <View style={styles.taskListContent}>
              <Text style={styles.taskListTitle}>{trip.title}</Text>
              <Text style={styles.taskListLocation}>{trip.location} • {trip.time}</Text>
            </View>
            <View style={styles.taskListActions}>
              <Ionicons name="chevron-forward" size={16} color="#757575" />
            </View>
          </View>
        </Animated.View>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView 
        showsVerticalScrollIndicator={false} 
        contentInsetAdjustmentBehavior="automatic"
        contentContainerStyle={{ paddingBottom: 100 }}
      >
        {/* Week strip with Today dropdown and circular buttons */}
        <View style={styles.weekStripCard}>
          <View style={styles.weekStripHeader}>
            <TouchableOpacity style={styles.todayDropdown} onPress={() => setShowFullCalendar(true)}>
              <Text style={styles.todayText}>
                {selectedDate.toDateString() === new Date().toDateString() 
                  ? 'Today' 
                  : selectedDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
                }
              </Text>
              <Ionicons name="chevron-down" size={16} color="#FFFFFF" />
            </TouchableOpacity>
            <TouchableOpacity style={styles.premiumButton}>
              <Text style={styles.premiumText}>Go Premium</Text>
            </TouchableOpacity>
          </View>
          
          <View style={styles.weekStripRow}>
            {weekDays.map((date, idx) => {
              const isSelected = selectedDate.toDateString() === date.toDateString();
              const isToday = new Date().toDateString() === date.toDateString();
              const label = date.toLocaleDateString('en-US', { weekday: 'short' });
              const dayNum = date.getDate();
              return (
                <TouchableOpacity
                  key={idx}
                  style={styles.weekDayContainer}
                  onPress={() => openTasksForDate(date)}
                >
                  <Text style={[styles.weekDayLabel, isSelected && styles.weekDayLabelSelected]}>{label}</Text>
                  <View style={[
                    styles.weekDayCircle, 
                    isSelected && styles.weekDayCircleSelected,
                    isToday && !isSelected && styles.weekDayCircleToday
                  ]}>
                    <Text style={[
                      styles.weekDayNumber, 
                      isSelected && styles.weekDayNumberSelected,
                      isToday && !isSelected && styles.weekDayNumberToday
                    ]}>{dayNum}</Text>
                  </View>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        <View style={styles.header}>
          <Text style={styles.title}>Dashboard</Text>
          <Text style={styles.subtitle}>Your household overview</Text>
          
          {/* Stats Overview */}
          <View style={styles.statsContainer}>
            <TouchableOpacity style={styles.statItem} onPress={() => router.push('/pantry')}>
              <View style={styles.statBubble}>
                <Text style={styles.statBubbleNumber}>{quickStats.pantryItems}</Text>
                <Text style={styles.statBubbleLabel}>Items in Pantry</Text>
              </View>
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.statItem} onPress={() => {
              const dateStr = new Date(selectedDate.getFullYear(), selectedDate.getMonth(), selectedDate.getDate()).toISOString().split('T')[0];
              router.push({ pathname: '/trips', params: { date: dateStr } });
            }}>
              <View style={styles.statBubble}>
                <Text style={styles.statBubbleNumber}>{quickStats.activeTrips}</Text>
                <Text style={styles.statBubbleLabel}>Active Trips</Text>
              </View>
            </TouchableOpacity>

            <TouchableOpacity style={styles.statItem} onPress={() => setShowTaskDetails(true)}>
              <View style={styles.statBubble}>
                <Text style={styles.statBubbleNumber}>{tasks.filter(t => t.dueDate === new Date(selectedDate.getFullYear(), selectedDate.getMonth(), selectedDate.getDate()).toISOString().split('T')[0]).length}</Text>
                <Text style={styles.statBubbleLabel}>Pending Tasks</Text>
              </View>
            </TouchableOpacity>
          </View>

        </View>

        

        {/* Tasks Toggle Section */}
        <View style={[styles.card, { backgroundColor: '#1E1E1E', minHeight: 150 }]}>
          <View style={styles.cardHeader}>
            <View style={styles.cardTitleSection}>
              <Text style={styles.cardTitle}>Tasks</Text>
              <View style={styles.toggleButtons}>
                <TouchableOpacity 
                  style={[styles.toggleButton, activeTasksTab === 'today' && styles.toggleButtonActive]}
                  onPress={() => setActiveTasksTab('today')}
                >
                  <Text style={[styles.toggleButtonText, activeTasksTab === 'today' && styles.toggleButtonTextActive]}>
                    {selectedDate.toDateString() === new Date().toDateString() ? 'Today\'s Tasks' : `${selectedDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} Tasks`}
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity 
                  style={[styles.toggleButton, activeTasksTab === 'all' && styles.toggleButtonActive]}
                  onPress={() => setActiveTasksTab('all')}
                >
                  <Text style={[styles.toggleButtonText, activeTasksTab === 'all' && styles.toggleButtonTextActive]}>
                    All Tasks
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
            <TouchableOpacity 
              onPress={() => {
                setEditingTask(null);
                setNewTaskTitle('');
                setNewTaskPriority('medium');
                setNewTaskDueDate('');
                setNewTaskLocation('');
                setIsAddTaskModalVisible(true);
              }}
            >
              <Ionicons name="add-circle-outline" size={24} color="#2E8BFF" />
            </TouchableOpacity>
          </View>
          <View style={styles.cardContent}>
            {activeTasksTab === 'today' ? (
              // Selected day's tasks (not necessarily "today")
              (() => {
                const selectedDayTasks = tasks.filter(t => t.dueDate === selectedDate.toISOString().split('T')[0]);
                
                if (selectedDayTasks.length === 0) {
                  return (
                    <View style={styles.emptyState}>
                      <Ionicons name="checkmark-done-outline" size={32} color="#757575" />
                      <Text style={styles.emptyStateText}>No tasks on {selectedDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</Text>
                    </View>
                  );
                }
                return selectedDayTasks.map(t => (
                  <SwipeableTaskItem
                    key={t.id}
                    task={t}
                    onToggle={toggleTask}
                    onEdit={startEditTask}
                  />
                ));
              })()
            ) : (
              // All tasks
              tasks.length === 0 ? (
                <View style={styles.emptyState}>
                  <Ionicons name="checkmark-done-outline" size={32} color="#757575" />
                  <Text style={styles.emptyStateText}>No tasks created yet</Text>
                </View>
              ) : (
                tasks.map(t => (
                  <SwipeableTaskItem
                    key={t.id}
                    task={t}
                    onToggle={toggleTask}
                    onEdit={startEditTask}
                  />
                ))
              )
            )}
          </View>
        </View>

        {/* Trips Toggle Section */}
        <View style={[styles.card, { backgroundColor: '#1E1E1E', minHeight: 150 }]}>
          <View style={styles.cardHeader}>
            <View style={styles.cardTitleSection}>
              <Text style={styles.cardTitle}>Trips</Text>
              <View style={styles.toggleButtons}>
                <TouchableOpacity 
                  style={[styles.toggleButton, activeTripsTab === 'today' && styles.toggleButtonActive]}
                  onPress={() => setActiveTripsTab('today')}
                >
                  <Text style={[styles.toggleButtonText, activeTripsTab === 'today' && styles.toggleButtonTextActive]}>
                    {selectedDate.toDateString() === new Date().toDateString() ? 'Today\'s Trips' : `${selectedDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} Trips`}
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity 
                  style={[styles.toggleButton, activeTripsTab === 'all' && styles.toggleButtonActive]}
                  onPress={() => setActiveTripsTab('all')}
                >
                  <Text style={[styles.toggleButtonText, activeTripsTab === 'all' && styles.toggleButtonTextActive]}>
                    All Trips
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
            <TouchableOpacity 
              onPress={() => {
                setEditingTask(null);
                setNewTripTitle('');
                setNewTripDate('');
                setNewTripLocation('');
                setIsAddTripModalVisible(true);
              }}
            >
              <Ionicons name="add-circle-outline" size={24} color="#2E8BFF" />
            </TouchableOpacity>
          </View>
          <View style={styles.cardContent}>
            {activeTripsTab === 'today' ? (
              // Selected day's trips (not necessarily "today")
              (() => {
                const selectedDayTrips = mockTrips.filter(trip => trip.date === selectedDate.toISOString().split('T')[0]);
                
                if (selectedDayTrips.length === 0) {
                  return (
                    <View style={styles.emptyState}>
                      <Ionicons name="car-outline" size={32} color="#757575" />
                      <Text style={styles.emptyStateText}>No trips on {selectedDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</Text>
                    </View>
                  );
                }
                return selectedDayTrips.map(trip => (
                  <SwipeableTripItem
                    key={trip.id}
                    trip={trip}
                    onEdit={startEditTrip}
                  />
                ));
              })()
            ) : (
              // All trips
              (() => {
                if (mockTrips.length === 0) {
                  return (
                    <View style={styles.emptyState}>
                      <Ionicons name="car-outline" size={32} color="#757575" />
                      <Text style={styles.emptyStateText}>No trips created yet</Text>
                    </View>
                  );
                }
                return mockTrips.map(trip => (
                  <SwipeableTripItem
                    key={trip.id}
                    trip={trip}
                    onEdit={startEditTrip}
                  />
                ));
              })()
            )}
          </View>
        </View>

        {/* Pantry Overview Card */}
        <View style={[styles.card, { backgroundColor: '#1E1E1E', minHeight: 150 }]}>
          <View style={styles.cardHeader}>
            <Text style={styles.cardTitle}>Pantry Overview</Text>
            <TouchableOpacity onPress={() => setIsAddPantryModalVisible(true)}>
              <Ionicons name="add-circle-outline" size={24} color="#2E8BFF" />
            </TouchableOpacity>
          </View>
          <View style={styles.cardContent}>
            {(() => {
              const mockPantryItems = [
                { id: '1', name: 'Milk', quantity: '2 cartons', expiry: 'Expires in 3 days' },
                { id: '2', name: 'Bread', quantity: '1 loaf', expiry: 'Expires in 2 days' },
                { id: '3', name: 'Eggs', quantity: '12 count', expiry: 'Expires in 1 week' }
              ];
              
              if (mockPantryItems.length === 0) {
                return (
                  <View style={styles.emptyState}>
                    <Ionicons name="cube-outline" size={32} color="#757575" />
                    <Text style={styles.emptyStateText}>Pantry is empty</Text>
                  </View>
                );
              }
              return mockPantryItems.slice(0, 3).map(item => (
                <View key={item.id} style={styles.taskListItem}>
                  <Ionicons name="cube-outline" size={20} color="#2E8BFF" />
                  <View style={styles.taskListContent}>
                    <Text style={styles.taskListTitle}>{item.name}</Text>
                    <Text style={styles.taskListLocation}>{item.quantity} • {item.expiry}</Text>
                  </View>
                  <View style={styles.taskListActions}>
                    <Ionicons name="chevron-forward" size={16} color="#757575" />
                  </View>
                </View>
              ));
            })()}
          </View>
        </View>

        {/* Calendar Import Card */}
        <View style={[styles.card, { backgroundColor: '#1E1E1E' }]}>
          <View style={styles.cardHeader}>
            <Text style={styles.cardTitle}>Calendar Integration</Text>
            <Ionicons name="calendar-outline" size={24} color="#2E8BFF" />
          </View>
          <View style={styles.cardContent}>
            <Text style={styles.cardSubtitle}>Sync with your existing calendars</Text>
            <View style={styles.calendarImportButtons}>
              <TouchableOpacity 
                style={styles.importButton}
                onPress={handleGoogleCalendarImport}
              >
                <Ionicons name="logo-google" size={20} color="#DB4437" />
                <Text style={styles.importButtonText}>Google Calendar</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={styles.importButton}
                onPress={handleAppleCalendarImport}
              >
                <Ionicons name="logo-apple" size={20} color="#FFFFFF" />
                <Text style={styles.importButtonText}>Apple Calendar</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
        
                            <View style={styles.section}>
                      <Text style={styles.sectionTitle}>Quick Actions</Text>
                      <View style={styles.quickActions}>
                        <TouchableOpacity
                          style={[styles.actionCard, { backgroundColor: '#28A745' }]}
                          onPress={() => handleQuickAction('Add Item')}
                        >
                          <Ionicons name="add-circle" size={24} color="white" />
                          <Text style={[styles.actionTitle, { color: 'white' }]}>Add Item</Text>
                          <Text style={[styles.actionSubtitle, { color: 'rgba(255,255,255,0.8)' }]}>Scan barcode or add manually</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                          style={[styles.actionCard, { backgroundColor: '#FF6B35' }]}
                          onPress={() => handleQuickAction('New Trip')}
                        >
                          <Ionicons name="map" size={24} color="white" />
                          <Text style={[styles.actionTitle, { color: 'white' }]}>New Trip</Text>
                          <Text style={[styles.actionSubtitle, { color: 'rgba(255,255,255,0.8)' }]}>Plan your shopping trip</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                          style={[styles.actionCard, { backgroundColor: '#0066CC' }]}
                          onPress={() => handleQuickAction('New Task')}
                        >
                          <Ionicons name="add" size={24} color="white" />
                          <Text style={[styles.actionTitle, { color: 'white' }]}>New Task</Text>
                          <Text style={[styles.actionSubtitle, { color: 'rgba(255,255,255,0.8)' }]}>Create a new todo</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                          style={[styles.actionCard, { backgroundColor: '#6F42C1' }]}
                          onPress={() => router.push('/pantry')}
                        >
                          <Ionicons name="scan" size={24} color="white" />
                          <Text style={[styles.actionTitle, { color: 'white' }]}>Scan Barcode</Text>
                          <Text style={[styles.actionSubtitle, { color: 'rgba(255,255,255,0.8)' }]}>Go to pantry scanner</Text>
                        </TouchableOpacity>

                      </View>
                    </View>


        
        


                  </ScrollView>

                  {/* Voice Command Button */}
                  <View style={styles.voiceCommandContainer}>
            
                  </View>

      {/* Task Details Modal */}
      <Modal
        visible={showTaskDetails}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowTaskDetails(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>
              Tasks for {selectedDate.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
            </Text>
            
            {selectedDateTasks.length > 0 ? (
              selectedDateTasks.map(task => (
                <View key={task.id} style={styles.taskDetailItem}>
                  <View style={styles.taskDetailHeader}>
                    <Text style={styles.taskDetailTitle}>{task.title}</Text>
                    <View style={styles.taskDetailPriority}>
                      <Ionicons 
                        name={getPriorityIcon(task.priority)} 
                        size={16} 
                        color={getPriorityColor(task.priority)} 
                      />
                    </View>
                  </View>
                  <Text style={styles.taskDetailDate}>Due: {task.dueDate}</Text>
                  {task.location && (
                    <Text style={styles.taskDetailLocation}>
                      📍 {task.location}
                    </Text>
                  )}
                  <View style={styles.taskDetailActions}>
                    <TouchableOpacity 
                      style={styles.taskDetailButton}
                      onPress={() => toggleTask(task.id)}
                    >
                      <Ionicons 
                        name={task.completed ? "checkmark-circle" : "ellipse-outline"} 
                        size={20} 
                        color={task.completed ? "#4CAF50" : "#666"} 
                      />
                      <Text style={styles.taskDetailButtonText}>
                        {task.completed ? 'Completed' : 'Mark Complete'}
                      </Text>
                    </TouchableOpacity>
                    
                    <TouchableOpacity 
                      style={[styles.taskDetailButton, styles.taskDetailDeleteButton]}
                      onPress={() => deleteTask(task.id)}
                    >
                      <Ionicons name="trash-outline" size={20} color="#F44336" />
                      <Text style={[styles.taskDetailButtonText, { color: '#F44336' }]}>Delete</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              ))
            ) : (
              <Text style={styles.noTasksText}>No tasks for this date</Text>
            )}

            <TouchableOpacity 
              style={styles.closeButton}
              onPress={() => setShowTaskDetails(false)}
            >
              <Text style={styles.closeButtonText}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Full Calendar Modal */}
      <Modal
        visible={showFullCalendar}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowFullCalendar(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Calendar</Text>
            <View style={styles.calendarHeader}>
              <Text style={styles.sectionTitle}>Select a date</Text>
              <View style={styles.calendarNavigation}>
                <TouchableOpacity 
                  onPress={showYearView ? goToPreviousYear : goToPreviousMonth} 
                  style={styles.calendarNavButton}
                >
                  <Ionicons name="chevron-back" size={20} color="#2E8BFF" />
                </TouchableOpacity>
                <TouchableOpacity onPress={() => setShowYearView(!showYearView)}>
                  <Text style={styles.calendarMonth}>
                    {showYearView 
                      ? currentMonth.getFullYear().toString()
                      : currentMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
                    }
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity 
                  onPress={showYearView ? goToNextYear : goToNextMonth} 
                  style={styles.calendarNavButton}
                >
                  <Ionicons name="chevron-forward" size={20} color="#2E8BFF" />
                </TouchableOpacity>
              </View>
            </View>

            <View style={styles.calendar}>
              {showYearView ? (
                <View style={styles.monthGrid}>
                  {[
                    'January', 'February', 'March', 'April', 'May', 'June',
                    'July', 'August', 'September', 'October', 'November', 'December'
                  ].map((monthName, index) => (
                    <TouchableOpacity 
                      key={index}
                      style={[
                        styles.monthButton,
                        currentMonth.getMonth() === index && styles.monthButtonSelected
                      ]}
                      onPress={() => selectMonth(index)}
                    >
                      <Text style={[
                        styles.monthButtonText,
                        currentMonth.getMonth() === index && styles.monthButtonTextSelected
                      ]}>
                        {monthName}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              ) : (
                <>
                  <View style={styles.calendarWeekdays}>
                    {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                      <Text key={day} style={styles.calendarWeekday}>{day}</Text>
                    ))}
                  </View>
                  <View style={styles.calendarDays}>
                    {calendarDays.map((day, index) => (
                      <View key={index} style={styles.calendarDay}>
                        {day ? (
                          <TouchableOpacity 
                            style={[
                              styles.calendarDayButton,
                              day.tasksCount > 0 && styles.calendarDayWithTasks,
                              selectedDate.toDateString() === new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day.date).toDateString() && styles.calendarDaySelected
                            ]}
                            onPress={() => handleCalendarDayClick(day)}
                          >
                            <Text style={[
                              styles.calendarDayNumber,
                              selectedDate.toDateString() === new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day.date).toDateString() && styles.calendarDayNumberSelected
                            ]}>{day.date}</Text>
                            {day.tasksCount > 0 && (
                              <View style={styles.calendarDayTaskIndicator}>
                                <Text style={styles.calendarDayTaskCount}>{day.tasksCount}</Text>
                              </View>
                            )}
                          </TouchableOpacity>
                        ) : (
                          <View style={styles.calendarDayEmpty} />
                        )}
                      </View>
                    ))}
                  </View>
                </>
              )}
            </View>

            <TouchableOpacity 
              style={styles.closeButton}
              onPress={() => {
                setShowFullCalendar(false);
                setShowYearView(false);
              }}
            >
              <Text style={styles.closeButtonText}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Add Task Modal */}
      <Modal
        visible={isAddTaskModalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setIsAddTaskModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>{editingTask ? 'Edit Task' : 'Add New Task'}</Text>
            
            <TextInput
              style={styles.taskInput}
              placeholder="Task title (required)..."
              value={newTaskTitle}
              onChangeText={setNewTaskTitle}
              autoFocus
            />

            <View style={styles.priorityContainer}>
              <Text style={styles.priorityLabel}>Priority (optional):</Text>
              <View style={styles.priorityButtons}>
                {['low', 'medium', 'high'].map(priority => (
                  <TouchableOpacity
                    key={priority}
                    style={[
                      styles.priorityOption,
                      newTaskPriority === priority && styles.prioritySelected
                    ]}
                    onPress={() => setNewTaskPriority(priority)}
                  >
                    <Text style={[
                      styles.priorityText,
                      newTaskPriority === priority && styles.priorityTextSelected
                    ]}>
                      {priority.charAt(0).toUpperCase() + priority.slice(1)}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            <View style={styles.datePickerContainer}>
              <TouchableOpacity
                style={styles.datePickerButton}
                onPress={() => setShowDatePicker(!showDatePicker)}
                activeOpacity={0.7}
              >
                <Text style={[styles.datePickerButtonText, newTaskDueDate && styles.datePickerButtonTextFilled]}>
                  {newTaskDueDate ? `Due: ${newTaskDueDate}` : 'Select due date (optional)'}
                </Text>
                <Ionicons 
                  name={showDatePicker ? "chevron-up" : "chevron-down"} 
                  size={20} 
                  color="#2E8BFF" 
                />
              </TouchableOpacity>
              
              {/* Inline Calendar */}
              {showDatePicker && (
                <View style={styles.inlineCalendar}>
                  <View style={styles.inlineCalendarHeader}>
                    <TouchableOpacity onPress={() => {
                      const newMonth = new Date(currentMonth);
                      newMonth.setMonth(newMonth.getMonth() - 1);
                      setCurrentMonth(newMonth);
                    }}>
                      <Ionicons name="chevron-back" size={20} color="#2E8BFF" />
                    </TouchableOpacity>
                    <Text style={styles.inlineCalendarMonth}>
                      {currentMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                    </Text>
                    <TouchableOpacity onPress={() => {
                      const newMonth = new Date(currentMonth);
                      newMonth.setMonth(newMonth.getMonth() + 1);
                      setCurrentMonth(newMonth);
                    }}>
                      <Ionicons name="chevron-forward" size={20} color="#2E8BFF" />
                    </TouchableOpacity>
                  </View>
                  
                  <View style={styles.inlineCalendarWeekdays}>
                    {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                      <Text key={day} style={styles.inlineCalendarWeekday}>{day}</Text>
                    ))}
                  </View>
                  
                  <View style={styles.inlineCalendarGrid}>
                    {(() => {
                      const days = getDaysInMonth(currentMonth);
                      const startDay = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1).getDay();
                      
                      // Add empty cells for padding
                      for (let i = 0; i < startDay; i++) {
                        days.unshift(null);
                      }
                      
                      // Fill remaining cells to complete the grid (6 rows x 7 columns = 42 total cells)
                      const totalCells = 42;
                      const remainingCells = totalCells - days.length;
                      for (let i = 0; i < remainingCells; i++) {
                        days.push(null);
                      }
                      
                      return days.map((day, index) => (
                        <View key={index} style={styles.inlineCalendarDay}>
                          {day ? (
                            <TouchableOpacity
                              style={[
                                styles.inlineCalendarDayButton,
                                day.tasksCount > 0 && styles.inlineCalendarDayWithTasks,
                                newTaskDueDate === new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day.date).toISOString().split('T')[0] && styles.inlineCalendarDaySelected
                              ]}
                              onPress={() => {
                                const selectedDate = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day.date);
                                setNewTaskDueDate(selectedDate.toISOString().split('T')[0]);
                                setShowDatePicker(false);
                              }}
                            >
                              <Text style={[
                                styles.inlineCalendarDayNumber,
                                newTaskDueDate === new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day.date).toISOString().split('T')[0] && styles.inlineCalendarDayNumberSelected
                              ]}>
                                {day.date}
                              </Text>
                              {day.tasksCount > 0 && (
                                <View style={styles.inlineCalendarDayTaskIndicator}>
                                  <Text style={styles.inlineCalendarDayTaskCount}>{day.tasksCount}</Text>
                                </View>
                              )}
                            </TouchableOpacity>
                          ) : (
                            <View style={styles.inlineCalendarDayEmpty} />
                          )}
                        </View>
                      ));
                    })()}
                  </View>
                </View>
              )}
            </View>

            <LocationAutocomplete
              placeholder="Location (optional)..."
              onLocationSelect={(location) => setNewTaskLocation(location.description)}
              value={newTaskLocation}
              onChangeText={setNewTaskLocation}
            />

            <View style={styles.modalButtons}>
              <TouchableOpacity 
                style={styles.cancelButton}
                onPress={() => {
                  setIsAddTaskModalVisible(false);
                  setEditingTask(null);
                  setNewTaskTitle('');
                  setNewTaskPriority('medium');
                  setNewTaskDueDate('');
                  setNewTaskLocation('');
                }}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={styles.saveButton}
                onPress={editingTask ? updateTask : addTask}
              >
                <Text style={styles.saveButtonText}>{editingTask ? 'Update Task' : 'Add Task'}</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Add Trip Modal */}
      <Modal
        visible={isAddTripModalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setIsAddTripModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>{editingTask ? 'Edit Trip' : 'Add New Trip'}</Text>
            
            <TextInput
              style={styles.taskInput}
              placeholder="Trip title (required)..."
              placeholderTextColor="#757575"
              value={newTripTitle}
              onChangeText={setNewTripTitle}
              autoFocus
            />

            <View style={styles.datePickerContainer}>
              <TouchableOpacity
                style={styles.datePickerButton}
                onPress={() => setShowTripDatePicker(!showTripDatePicker)}
                activeOpacity={0.7}
              >
                <Text style={[styles.datePickerButtonText, newTripDate && styles.datePickerButtonTextFilled]}>
                  {newTripDate ? `Date: ${newTripDate}` : 'Select date (optional)'}
                </Text>
                <Ionicons 
                  name={showTripDatePicker ? "chevron-up" : "chevron-down"} 
                  size={20} 
                  color="#2E8BFF" 
                />
              </TouchableOpacity>
              
              {/* Inline Calendar for Trip Date */}
              {showTripDatePicker && (
                <View style={styles.inlineCalendar}>
                  <View style={styles.inlineCalendarHeader}>
                    <TouchableOpacity onPress={() => {
                      const newMonth = new Date(currentMonth);
                      newMonth.setMonth(newMonth.getMonth() - 1);
                      setCurrentMonth(newMonth);
                    }}>
                      <Ionicons name="chevron-back" size={20} color="#2E8BFF" />
                    </TouchableOpacity>
                    <Text style={styles.inlineCalendarMonth}>
                      {currentMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                    </Text>
                    <TouchableOpacity onPress={() => {
                      const newMonth = new Date(currentMonth);
                      newMonth.setMonth(newMonth.getMonth() + 1);
                      setCurrentMonth(newMonth);
                    }}>
                      <Ionicons name="chevron-forward" size={20} color="#2E8BFF" />
                    </TouchableOpacity>
                  </View>
                  
                  <View style={styles.inlineCalendarWeekdays}>
                    {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                      <Text key={day} style={styles.inlineCalendarWeekday}>{day}</Text>
                    ))}
                  </View>
                  
                  <View style={styles.inlineCalendarGrid}>
                    {(() => {
                      const days = getDaysInMonth(currentMonth);
                      const startDay = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1).getDay();
                      
                      // Add empty cells for padding
                      for (let i = 0; i < startDay; i++) {
                        days.unshift(null);
                      }
                      
                      // Fill remaining cells to complete the grid (6 rows x 7 columns = 42 total cells)
                      const totalCells = 42;
                      const remainingCells = totalCells - days.length;
                      for (let i = 0; i < remainingCells; i++) {
                        days.push(null);
                      }
                      
                      return days.map((day, index) => (
                        <View key={index} style={styles.inlineCalendarDay}>
                          {day ? (
                            <TouchableOpacity
                              style={[
                                styles.inlineCalendarDayButton,
                                day.tasksCount > 0 && styles.inlineCalendarDayWithTasks,
                                newTripDate === new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day.date).toISOString().split('T')[0] && styles.inlineCalendarDaySelected
                              ]}
                              onPress={() => {
                                const selectedDate = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day.date);
                                setNewTripDate(selectedDate.toISOString().split('T')[0]);
                                setShowTripDatePicker(false);
                              }}
                            >
                              <Text style={[
                                styles.inlineCalendarDayNumber,
                                newTripDate === new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day.date).toISOString().split('T')[0] && styles.inlineCalendarDayNumberSelected
                              ]}>
                                {day.date}
                              </Text>
                              {day.tasksCount > 0 && (
                                <View style={styles.inlineCalendarDayTaskIndicator}>
                                  <Text style={styles.inlineCalendarDayTaskCount}>{day.tasksCount}</Text>
                                </View>
                              )}
                            </TouchableOpacity>
                          ) : (
                            <View style={styles.inlineCalendarDayEmpty} />
                          )}
                        </View>
                      ));
                    })()}
                  </View>
                </View>
              )}
            </View>

            <LocationAutocomplete
              placeholder="Location (optional)..."
              value={newTripLocation}
              onChangeText={setNewTripLocation}
              onLocationSelect={(location) => setNewTripLocation(location.description)}
            />

            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={styles.cancelButton}
                onPress={() => {
                  setIsAddTripModalVisible(false);
                  setEditingTask(null);
                  setNewTripTitle('');
                  setNewTripDate('');
                  setNewTripLocation('');
                }}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={styles.saveButton}
                onPress={editingTask ? updateTrip : addTrip}
              >
                <Text style={styles.saveButtonText}>{editingTask ? 'Update Trip' : 'Add Trip'}</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Add Pantry Item Modal */}
      <Modal
        visible={isAddPantryModalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setIsAddPantryModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Add Pantry Item</Text>
            
            <TextInput
              style={styles.taskInput}
              placeholder="Item name (required)..."
              placeholderTextColor="#757575"
              value={newPantryItemName}
              onChangeText={setNewPantryItemName}
              autoFocus
            />

            <TextInput
              style={styles.taskInput}
              placeholder="Quantity (e.g., 2 cartons, 1 loaf)..."
              placeholderTextColor="#757575"
              value={newPantryItemQuantity}
              onChangeText={setNewPantryItemQuantity}
            />

            <TextInput
              style={styles.taskInput}
              placeholder="Expiry date (optional) - YYYY-MM-DD..."
              placeholderTextColor="#757575"
              value={newPantryItemExpiry}
              onChangeText={setNewPantryItemExpiry}
            />

            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={styles.cancelButton}
                onPress={() => setIsAddPantryModalVisible(false)}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={styles.saveButton}
                onPress={addPantryItem}
              >
                <Text style={styles.saveButtonText}>Add Item</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#121212',
  },
  header: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 16,
    backgroundColor: 'transparent',
  },
  title: {
    fontSize: 32,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 16,
    color: '#B3B3B3',
    fontWeight: '400',
  },
  weekStripCard: {
    marginHorizontal: 0,
    marginBottom: 0,
    backgroundColor: '#1E1E1E',
    paddingHorizontal: 20,
    paddingVertical: 16,
    paddingTop: 12,
  },
  weekStripHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  todayDropdown: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: 'transparent',
    minHeight: 40,
  },
  todayText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFFFFF',
    marginRight: 6,
  },
  premiumButton: {
    backgroundColor: '#F59E0B',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 16,
    minHeight: 32,
    justifyContent: 'center',
    alignItems: 'center',
  },
  premiumText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#000000',
  },
  weekStripRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingHorizontal: 8,
  },
  weekDayContainer: {
    alignItems: 'center',
    minWidth: 44,
    paddingVertical: 8,
    paddingHorizontal: 4,
  },
  weekDayLabel: {
    fontSize: 11,
    fontWeight: '500',
    color: '#B3B3B3',
    marginBottom: 8,
    textTransform: 'uppercase',
  },
  weekDayLabelSelected: {
    color: '#FFFFFF',
  },
  weekDayCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'transparent',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'transparent',
  },
  weekDayCircleSelected: {
    backgroundColor: '#2E8BFF',
    borderColor: '#2E8BFF',
  },
  weekDayCircleToday: {
    backgroundColor: 'transparent',
    borderColor: '#2E8BFF',
    borderWidth: 2,
  },
  weekDayNumber: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  weekDayNumberSelected: {
    color: '#FFFFFF',
  },
  weekDayNumberToday: {
    color: '#2E8BFF',
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#2C2C2C',
  },
  statItem: {
    alignItems: 'center',
    flex: 1,
  },
  statBubble: {
    backgroundColor: '#1E1E1E',
    borderWidth: 1,
    borderColor: '#2C2C2C',
    paddingVertical: 14,
    paddingHorizontal: 12,
    borderRadius: 16,
    width: '95%',
  },
  statBubbleNumber: {
    fontSize: 24,
    fontWeight: '700',
    color: '#FFFFFF',
    textAlign: 'center',
  },
  statBubbleLabel: {
    fontSize: 12,
    color: '#B3B3B3',
    textAlign: 'center',
  },
  statNumber: { display: 'none' },
  statLabel: { display: 'none' },
  statDivider: { width: 0, height: 0 },

  section: {
    padding: 20,
    backgroundColor: '#1E1E1E',
    marginBottom: 16,
    marginHorizontal: 16,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#2C2C2C',
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 16,
  },
  quickActions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  actionCard: {
    width: '48%',
    backgroundColor: '#1E1E1E',
    borderWidth: 1,
    borderColor: '#2C2C2C',
    padding: 18,
    borderRadius: 12,
    marginBottom: 12,
    alignItems: 'center',
  },
  actionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 6,
    marginTop: 8,
  },
  actionSubtitle: {
    fontSize: 13,
    color: '#B3B3B3',
    fontWeight: '400',
    textAlign: 'center',
  },
  activityCard: {
    backgroundColor: '#F2F2F7',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  activityText: {
    fontSize: 16,
    color: '#8E8E93',
  },
  activityItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    padding: 15,
    borderRadius: 8,
    marginBottom: 10,
    width: '100%',
  },
  activityTime: {
    fontSize: 12,
    color: '#999',
  },
  // New card styles
  card: {
    marginHorizontal: 16,
    marginBottom: 16,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#2C2C2C',
  },
  cardHeader: {
    padding: 20,
    paddingBottom: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  cardTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 6,
  },
  cardSubtitle: {
    fontSize: 15,
    color: '#B3B3B3',
    fontWeight: '500',
  },
  cardContent: {
    padding: 20,
    paddingTop: 0,
  },
  cardText: {
    fontSize: 16,
    color: '#B3B3B3',
    fontWeight: '400',
  },
  progressContainer: {
    marginTop: 10,
  },
  progressBar: {
    height: 8,
    backgroundColor: '#E9ECEF',
    borderRadius: 4,
    marginBottom: 8,
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#0068F0',
    borderRadius: 4,
  },
  progressText: {
    fontSize: 14,
    color: '#6C757D',
    textAlign: 'center',
  },
  // Calendar styles
  calendarHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
    paddingHorizontal: 8,
  },
  calendarNavigation: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    justifyContent: 'space-between',
    maxWidth: 200,
  },
  calendarNavButton: {
    padding: 8,
    minWidth: 36,
    alignItems: 'center',
  },
  calendarMonth: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2E8BFF',
    textAlign: 'center',
    flex: 1,
    paddingHorizontal: 8,
  },
  calendar: {
    marginTop: 16,
  },
  calendarWeekdays: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  calendarWeekday: {
    flex: 1,
    textAlign: 'center',
    fontSize: 12,
    fontWeight: '600',
    color: '#B3B3B3',
  },
  calendarDays: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  calendarDay: {
    width: '14.28%',
    aspectRatio: 1,
    padding: 2,
  },
  calendarDayButton: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 8,
    backgroundColor: '#121212',
    borderWidth: 1,
    borderColor: '#2C2C2C',
  },
  calendarDayWithTasks: {
    backgroundColor: '#1E1E1E',
    borderColor: '#2E8BFF',
  },
  calendarDayNumber: {
    fontSize: 14,
    fontWeight: '500',
    color: '#FFFFFF',
  },
  calendarDayTaskIndicator: {
    position: 'absolute',
    top: 2,
    right: 2,
    backgroundColor: '#2E8BFF',
    borderRadius: 8,
    minWidth: 16,
    height: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  calendarDayTaskCount: {
    fontSize: 10,
    fontWeight: '600',
    color: 'white',
  },
  calendarDaySelected: {
    backgroundColor: '#2E8BFF',
    borderColor: '#2E8BFF',
  },
  calendarDayNumberSelected: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
  calendarDayEmpty: {
    flex: 1,
  },
  monthGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    padding: 16,
  },
  monthButton: {
    width: '30%',
    marginBottom: 16,
    paddingVertical: 12,
    paddingHorizontal: 8,
    borderRadius: 8,
    backgroundColor: '#121212',
    borderWidth: 1,
    borderColor: '#2C2C2C',
    alignItems: 'center',
  },
  monthButtonSelected: {
    backgroundColor: '#2E8BFF',
    borderColor: '#2E8BFF',
  },
  monthButtonText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#FFFFFF',
  },
  monthButtonTextSelected: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
  // Task styles
  taskItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#2C2C2C',
  },
  taskCheckbox: {
    marginRight: 12,
  },
  taskContent: {
    flex: 1,
  },
  taskTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  taskDate: {
    fontSize: 12,
    color: '#B3B3B3',
  },
  taskActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  priorityButton: {
    marginRight: 8,
  },
  deleteButton: {
    padding: 4,
  },
  // Modal styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#1E1E1E',
    borderRadius: 12,
    padding: 20,
    width: '95%',
    maxWidth: 450,
    borderWidth: 1,
    borderColor: '#2C2C2C',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 20,
    textAlign: 'center',
  },
  taskInput: {
    borderWidth: 1,
    borderColor: '#2C2C2C',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    marginBottom: 16,
    backgroundColor: '#121212',
    color: '#FFFFFF',
  },
  priorityContainer: {
    marginBottom: 16,
  },
  priorityLabel: {
    fontSize: 16,
    fontWeight: '500',
    color: '#FFFFFF',
    marginBottom: 10,
  },
  priorityButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  priorityOption: {
    flex: 1,
    padding: 10,
    borderWidth: 1,
    borderColor: '#2C2C2C',
    borderRadius: 8,
    marginHorizontal: 4,
    backgroundColor: '#121212',
  },
  prioritySelected: {
    backgroundColor: '#4CAF50',
    borderColor: '#4CAF50',
  },
  priorityText: {
    fontSize: 14,
    color: '#B3B3B3',
    textAlign: 'center',
  },
  priorityTextSelected: {
    color: 'white',
    fontWeight: '600',
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  cancelButton: {
    flex: 1,
    padding: 12,
    borderWidth: 1,
    borderColor: '#2C2C2C',
    borderRadius: 8,
    marginRight: 8,
    alignItems: 'center',
    backgroundColor: '#121212',
  },
  cancelButtonText: {
    fontSize: 16,
    color: '#B3B3B3',
  },
  saveButton: {
    flex: 1,
    padding: 12,
    backgroundColor: '#2E8BFF',
    borderRadius: 8,
    marginLeft: 8,
    alignItems: 'center',
  },
  saveButtonText: {
    fontSize: 16,
    color: 'white',
    fontWeight: '600',
  },
  // Task details modal styles
  taskDetailItem: {
    backgroundColor: '#121212',
    borderWidth: 1,
    borderColor: '#2C2C2C',
    padding: 16,
    borderRadius: 8,
    marginBottom: 12,
  },
  taskDetailHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  taskDetailTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFFFFF',
    flex: 1,
  },
  taskDetailPriority: {
    marginLeft: 8,
  },
  taskDetailDate: {
    fontSize: 14,
    color: '#B3B3B3',
    marginBottom: 8,
  },
  taskDetailLocation: {
    fontSize: 14,
    color: '#2E8BFF',
    marginBottom: 12,
    fontStyle: 'italic',
  },
  taskDetailActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  taskDetailButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 8,
    borderRadius: 6,
    backgroundColor: '#2E8BFF',
    flex: 1,
    marginHorizontal: 4,
    justifyContent: 'center',
  },
  taskDetailDeleteButton: {
    backgroundColor: '#F44336',
  },
  taskDetailButtonText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#FFFFFF',
    marginLeft: 4,
  },
  noTasksText: {
    fontSize: 16,
    color: '#B3B3B3',
    textAlign: 'center',
    fontStyle: 'italic',
    marginVertical: 20,
  },
  closeButton: {
    backgroundColor: '#2E8BFF',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 16,
  },
  closeButtonText: {
    fontSize: 16,
    color: 'white',
    fontWeight: '600',
  },
  voiceCommandContainer: {
    position: 'absolute',
    bottom: 100,
    right: 20,
    zIndex: 1000,
  },
  exportShareRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  exportShareButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderRadius: 8,
    marginHorizontal: 4,
  },
  exportShareButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  // New styles for enhanced cards
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 24,
  },
  emptyStateText: {
    fontSize: 14,
    color: '#757575',
    marginTop: 8,
    textAlign: 'center',
  },
  taskListItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#2C2C2C',
  },
  taskListContent: {
    flex: 1,
    marginLeft: 12,
  },
  taskListTitle: {
    fontSize: 16,
    color: '#FFFFFF',
    fontWeight: '500',
    marginBottom: 4,
  },
  taskListTitleCompleted: {
    textDecorationLine: 'line-through',
    color: '#757575',
  },
  taskListLocation: {
    fontSize: 14,
    color: '#B3B3B3',
  },
  taskListActions: {
    marginLeft: 8,
  },
  // Calendar import styles
  calendarImportButtons: {
    flexDirection: 'row',
    marginTop: 12,
    gap: 12,
  },
  importButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#121212',
    borderWidth: 1,
    borderColor: '#2C2C2C',
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  importButtonText: {
    fontSize: 14,
    color: '#FFFFFF',
    fontWeight: '500',
    marginLeft: 8,
  },
  // Swipe gesture styles
  swipeableContainer: {
    position: 'relative',
    marginBottom: 8,
    overflow: 'hidden',
  },
  swipeActionsBackground: {
    position: 'absolute',
    right: 0,
    top: 0,
    bottom: 0,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1E1E1E',
    paddingRight: 16,
  },
  editButton: {
    backgroundColor: '#2E8BFF',
    padding: 8,
    borderRadius: 6,
    marginRight: 4,
    justifyContent: 'center',
    alignItems: 'center',
    minWidth: 32,
    minHeight: 32,
  },
  taskListItemContent: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1E1E1E',
    padding: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#2C2C2C',
  },
  taskListDueDate: {
    fontSize: 12,
    color: '#757575',
    marginTop: 2,
  },
  // Toggle button styles
  cardTitleSection: {
    flex: 1,
  },
  toggleButtons: {
    flexDirection: 'row',
    marginTop: 8,
  },
  toggleButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    marginRight: 8,
    backgroundColor: '#121212',
    borderWidth: 1,
    borderColor: '#2C2C2C',
  },
  toggleButtonActive: {
    backgroundColor: '#2E8BFF',
    borderColor: '#2E8BFF',
  },
  toggleButtonText: {
    fontSize: 12,
    color: '#B3B3B3',
    fontWeight: '500',
  },
  toggleButtonTextActive: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
  // Inline calendar styles
  datePickerContainer: {
    marginBottom: 16,
  },
  datePickerButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: '#2C2C2C',
    borderRadius: 8,
    padding: 12,
    backgroundColor: '#121212',
  },
  datePickerButtonText: {
    fontSize: 16,
    color: '#B3B3B3',
  },
  datePickerButtonTextFilled: {
    color: '#FFFFFF',
    fontWeight: '500',
  },
  inlineCalendar: {
    backgroundColor: '#121212',
    borderRadius: 8,
    padding: 16,
    marginTop: 8,
    borderWidth: 1,
    borderColor: '#2C2C2C',
  },
  inlineCalendarHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  inlineCalendarMonth: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  inlineCalendarWeekdays: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  inlineCalendarWeekday: {
    flex: 1,
    textAlign: 'center',
    fontSize: 12,
    fontWeight: '600',
    color: '#B3B3B3',
    paddingVertical: 8,
  },
  inlineCalendarGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  inlineCalendarDay: {
    width: '14.28%',
    aspectRatio: 1,
    padding: 2,
  },
  inlineCalendarDayButton: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 8,
    backgroundColor: '#1E1E1E',
    borderWidth: 1,
    borderColor: '#2C2C2C',
  },
  inlineCalendarDayWithTasks: {
    backgroundColor: '#1E1E1E',
    borderColor: '#2E8BFF',
  },
  inlineCalendarDaySelected: {
    backgroundColor: '#2E8BFF',
    borderColor: '#2E8BFF',
  },
  inlineCalendarDayNumber: {
    fontSize: 14,
    fontWeight: '500',
    color: '#FFFFFF',
  },
  inlineCalendarDayNumberSelected: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
  inlineCalendarDayEmpty: {
    flex: 1,
    width: '100%',
    aspectRatio: 1,
  },
  inlineCalendarDayTaskIndicator: {
    position: 'absolute',
    top: 2,
    right: 2,
    backgroundColor: '#2E8BFF',
    borderRadius: 8,
    minWidth: 16,
    height: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  inlineCalendarDayTaskCount: {
    fontSize: 10,
    fontWeight: '600',
    color: 'white',
  },
});
