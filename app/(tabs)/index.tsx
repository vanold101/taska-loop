import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, Modal, TextInput, Share } from 'react-native';
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
  

  const [selectedDate, setSelectedDate] = useState(new Date());
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [showTaskDetails, setShowTaskDetails] = useState(false);
  const [selectedDateTasks, setSelectedDateTasks] = useState<typeof tasks>([]);
  


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
        dueDate: newTaskDueDate || new Date().toISOString().split('T')[0],
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

  const goToPreviousMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1));
  };

  const goToNextMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1));
  };

  const handleCalendarDayClick = (day: any) => {
    if (day) {
      const dateString = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day.date).toISOString().split('T')[0];
      const dayTasks = tasks.filter(task => task.dueDate === dateString);
      setSelectedDateTasks(dayTasks);
      setSelectedDate(new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day.date));
      setShowTaskDetails(true);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Text style={styles.title}>Welcome to Taska Loop</Text>
          <Text style={styles.subtitle}>Your smart household management app</Text>
          

        </View>

        {/* Today's Tasks Card */}
        <TouchableOpacity 
          style={[styles.card, { backgroundColor: '#4CAF50' }]}
          onPress={() => {
            const today = new Date().toISOString().split('T')[0];
            const todayTasks = tasks.filter(task => task.dueDate === today);
            setSelectedDateTasks(todayTasks);
            setSelectedDate(new Date());
            setShowTaskDetails(true);
          }}
        >
          <View style={styles.cardHeader}>
            <Text style={styles.cardTitle}>Today's Tasks</Text>
            <Text style={styles.cardSubtitle}>
              You have {quickStats.pendingTasks} {quickStats.pendingTasks === 1 ? 'task' : 'tasks'} for today
            </Text>
          </View>
          <View style={styles.cardContent}>
            <View style={styles.progressContainer}>
              <View style={styles.progressBar}>
                <View 
                  style={[
                    styles.progressFill, 
                    { width: `${(quickStats.completedToday / (quickStats.pendingTasks + quickStats.completedToday)) * 100}%` }
                  ]} 
                />
              </View>
              <Text style={styles.progressText}>
                {quickStats.completedToday} of {quickStats.pendingTasks + quickStats.completedToday} completed
              </Text>
            </View>
          </View>
        </TouchableOpacity>

        {/* Active Trips Card */}
        <TouchableOpacity 
          style={[styles.card, { backgroundColor: '#FF9800' }]}
          onPress={() => router.push('/trips')}
        >
          <View style={styles.cardHeader}>
            <Text style={styles.cardTitle}>Active Trips</Text>
            <Text style={styles.cardSubtitle}>
              You have {quickStats.activeTrips} {quickStats.activeTrips === 1 ? 'trip' : 'trips'} planned
            </Text>
          </View>
          <View style={styles.cardContent}>
            <Text style={styles.cardText}>Manage your shopping trips and routes</Text>
          </View>
        </TouchableOpacity>

        {/* Pantry Overview Card */}
        <TouchableOpacity 
          style={[styles.card, { backgroundColor: '#2196F3' }]}
          onPress={() => router.push('/pantry')}
        >
          <View style={styles.cardHeader}>
            <Text style={styles.cardTitle}>Pantry Overview</Text>
            <Text style={styles.cardSubtitle}>
              {quickStats.pantryItems} items in your pantry
            </Text>
          </View>
          <View style={styles.cardContent}>
            <Text style={styles.cardText}>Track your household supplies</Text>
          </View>
        </TouchableOpacity>
        
                            <View style={styles.section}>
                      <Text style={styles.sectionTitle}>Quick Actions</Text>
                      <View style={styles.quickActions}>
                        <TouchableOpacity
                          style={[styles.actionCard, { backgroundColor: '#4CAF50' }]}
                          onPress={() => handleQuickAction('Add Item')}
                        >
                          <Ionicons name="add-circle" size={24} color="white" />
                          <Text style={[styles.actionTitle, { color: 'white' }]}>Add Item</Text>
                          <Text style={[styles.actionSubtitle, { color: 'rgba(255,255,255,0.8)' }]}>Scan barcode or add manually</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                          style={[styles.actionCard, { backgroundColor: '#FF9800' }]}
                          onPress={() => handleQuickAction('New Trip')}
                        >
                          <Ionicons name="map" size={24} color="white" />
                          <Text style={[styles.actionTitle, { color: 'white' }]}>New Trip</Text>
                          <Text style={[styles.actionSubtitle, { color: 'rgba(255,255,255,0.8)' }]}>Plan your shopping trip</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                          style={[styles.actionCard, { backgroundColor: '#F44336' }]}
                          onPress={() => handleQuickAction('New Task')}
                        >
                          <Ionicons name="add" size={24} color="white" />
                          <Text style={[styles.actionTitle, { color: 'white' }]}>New Task</Text>
                          <Text style={[styles.actionSubtitle, { color: 'rgba(255,255,255,0.8)' }]}>Create a new todo</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                          style={[styles.actionCard, { backgroundColor: '#9C27B0' }]}
                          onPress={() => router.push('/pantry')}
                        >
                          <Ionicons name="scan" size={24} color="white" />
                          <Text style={[styles.actionTitle, { color: 'white' }]}>Scan Barcode</Text>
                          <Text style={[styles.actionSubtitle, { color: 'rgba(255,255,255,0.8)' }]}>Go to pantry scanner</Text>
                        </TouchableOpacity>

                      </View>
                    </View>


        
        {/* Calendar View */}
        <View style={styles.section}>
          <View style={styles.calendarHeader}>
            <Text style={styles.sectionTitle}>Calendar</Text>
            <View style={styles.calendarNavigation}>
              <TouchableOpacity onPress={goToPreviousMonth} style={styles.calendarNavButton}>
                <Ionicons name="chevron-back" size={20} color="#007AFF" />
              </TouchableOpacity>
              <Text style={styles.calendarMonth}>
                {currentMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
              </Text>
              <TouchableOpacity onPress={goToNextMonth} style={styles.calendarNavButton}>
                <Ionicons name="chevron-forward" size={20} color="#007AFF" />
              </TouchableOpacity>
            </View>
          </View>
          
          <View style={styles.calendar}>
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
                        day.tasksCount > 0 && styles.calendarDayWithTasks
                      ]}
                      onPress={() => handleCalendarDayClick(day)}
                    >
                      <Text style={styles.calendarDayNumber}>{day.date}</Text>
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
          </View>
        </View>

        {/* Tasks List */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Today's Tasks ({tasks.filter(t => !t.completed).length})</Text>
          {tasks.filter(t => !t.completed).map(task => (
            <View key={task.id} style={styles.taskItem}>
              <TouchableOpacity 
                style={styles.taskCheckbox}
                onPress={() => toggleTask(task.id)}
              >
                <Ionicons 
                  name={task.completed ? "checkmark-circle" : "ellipse-outline"} 
                  size={24} 
                  color={task.completed ? "#4CAF50" : "#666"} 
                />
              </TouchableOpacity>
              
              <View style={styles.taskContent}>
                <Text style={styles.taskTitle}>{task.title}</Text>
                <Text style={styles.taskDate}>Due: {task.dueDate}</Text>
              </View>

              <View style={styles.taskActions}>
                <TouchableOpacity style={styles.priorityButton}>
                  <Ionicons 
                    name={getPriorityIcon(task.priority)} 
                    size={16} 
                    color={getPriorityColor(task.priority)} 
                  />
                </TouchableOpacity>
                
                <TouchableOpacity 
                  style={styles.deleteButton}
                  onPress={() => deleteTask(task.id)}
                >
                  <Ionicons name="trash-outline" size={16} color="#F44336" />
                </TouchableOpacity>
              </View>
            </View>
          ))}
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

      {/* Add Task Modal */}
      <Modal
        visible={isAddTaskModalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setIsAddTaskModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Add New Task</Text>
            
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

            <TextInput
              style={styles.taskInput}
              placeholder="Due date (optional) - YYYY-MM-DD..."
              value={newTaskDueDate}
              onChangeText={setNewTaskDueDate}
            />

            <LocationAutocomplete
              placeholder="Location (optional)..."
              onLocationSelect={(location) => setNewTaskLocation(location.description)}
              value={newTaskLocation}
              onChangeText={setNewTaskLocation}
            />

            <View style={styles.modalButtons}>
              <TouchableOpacity 
                style={styles.cancelButton}
                onPress={() => setIsAddTaskModalVisible(false)}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={styles.saveButton}
                onPress={addTask}
              >
                <Text style={styles.saveButtonText}>Add Task</Text>
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
    backgroundColor: '#F2F2F7',
  },
  header: {
    padding: 20,
    backgroundColor: '#FFFFFF',
    marginBottom: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#000000',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#8E8E93',
  },

  section: {
    padding: 20,
    backgroundColor: '#FFFFFF',
    marginBottom: 20,
    marginHorizontal: 20,
    borderRadius: 12,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#000000',
    marginBottom: 16,
  },
  quickActions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  actionCard: {
    width: '48%',
    backgroundColor: '#F2F2F7',
    padding: 16,
    borderRadius: 8,
    marginBottom: 10,
    alignItems: 'center',
  },
  actionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000000',
    marginBottom: 4,
  },
  actionSubtitle: {
    fontSize: 14,
    color: '#8E8E93',
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
    marginHorizontal: 20,
    marginBottom: 20,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  cardHeader: {
    padding: 20,
    paddingBottom: 10,
  },
  cardTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 5,
  },
  cardSubtitle: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.8)',
  },
  cardContent: {
    padding: 20,
    paddingTop: 0,
  },
  cardText: {
    fontSize: 16,
    color: 'rgba(255,255,255,0.9)',
  },
  progressContainer: {
    marginTop: 10,
  },
  progressBar: {
    height: 8,
    backgroundColor: 'rgba(255,255,255,0.3)',
    borderRadius: 4,
    marginBottom: 8,
  },
  progressFill: {
    height: '100%',
    backgroundColor: 'white',
    borderRadius: 4,
  },
  progressText: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.9)',
    textAlign: 'center',
  },
  // Calendar styles
  calendarHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  calendarNavigation: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  calendarNavButton: {
    padding: 8,
  },
  calendarMonth: {
    fontSize: 16,
    fontWeight: '600',
    color: '#007AFF',
    marginHorizontal: 16,
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
    color: '#8E8E93',
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
    backgroundColor: '#F2F2F7',
  },
  calendarDayWithTasks: {
    backgroundColor: '#E3F2FD',
  },
  calendarDayNumber: {
    fontSize: 14,
    fontWeight: '500',
    color: '#000000',
  },
  calendarDayTaskIndicator: {
    position: 'absolute',
    top: 2,
    right: 2,
    backgroundColor: '#007AFF',
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
  calendarDayEmpty: {
    flex: 1,
  },
  // Task styles
  taskItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F2F2F7',
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
    color: '#000000',
    marginBottom: 4,
  },
  taskDate: {
    fontSize: 12,
    color: '#8E8E93',
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
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 20,
    width: '90%',
    maxWidth: 400,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#000000',
    marginBottom: 20,
    textAlign: 'center',
  },
  taskInput: {
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    marginBottom: 16,
    backgroundColor: 'white',
    color: '#000000',
  },
  priorityContainer: {
    marginBottom: 16,
  },
  priorityLabel: {
    fontSize: 16,
    fontWeight: '500',
    color: '#000000',
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
    borderColor: '#E0E0E0',
    borderRadius: 8,
    marginHorizontal: 4,
    alignItems: 'center',
    backgroundColor: 'white',
  },
  prioritySelected: {
    backgroundColor: '#4CAF50',
    borderColor: '#4CAF50',
  },
  priorityText: {
    fontSize: 14,
    color: '#666',
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
    borderColor: '#E0E0E0',
    borderRadius: 8,
    marginRight: 8,
    alignItems: 'center',
    backgroundColor: 'white',
  },
  cancelButtonText: {
    fontSize: 16,
    color: '#666',
  },
  saveButton: {
    flex: 1,
    padding: 12,
    backgroundColor: '#4CAF50',
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
    backgroundColor: '#F2F2F7',
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
    color: '#000000',
    flex: 1,
  },
  taskDetailPriority: {
    marginLeft: 8,
  },
  taskDetailDate: {
    fontSize: 14,
    color: '#8E8E93',
    marginBottom: 8,
  },
  taskDetailLocation: {
    fontSize: 14,
    color: '#007AFF',
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
    backgroundColor: '#E3F2FD',
    flex: 1,
    marginHorizontal: 4,
    justifyContent: 'center',
  },
  taskDetailDeleteButton: {
    backgroundColor: '#FFEBEE',
  },
  taskDetailButtonText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#007AFF',
    marginLeft: 4,
  },
  noTasksText: {
    fontSize: 16,
    color: '#8E8E93',
    textAlign: 'center',
    fontStyle: 'italic',
    marginVertical: 20,
  },
  closeButton: {
    backgroundColor: '#007AFF',
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
});
