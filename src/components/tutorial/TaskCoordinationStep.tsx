import React from 'react';
import { motion } from 'framer-motion';
import { CheckSquare, Clock, User, Bell, Calendar } from 'lucide-react';

export const TaskCoordinationStep: React.FC = () => {
  const tasks = [
    { 
      title: 'Take out trash',
      assignedTo: 'Mike',
      dueDate: 'Today',
      priority: 'high',
      completed: false,
      avatar: '👨‍🔧'
    },
    { 
      title: 'Grocery shopping',
      assignedTo: 'Sarah',
      dueDate: 'Tomorrow',
      priority: 'medium',
      completed: true,
      avatar: '👩‍🏫'
    },
    { 
      title: 'Clean kitchen',
      assignedTo: 'You',
      dueDate: 'Friday',
      priority: 'low',
      completed: false,
      avatar: '👨‍💼'
    },
  ];

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'low': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="text-center mb-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-4"
        >
          <h3 className="text-2xl font-semibold text-gray-900 mb-2">
            Task Coordination Made Simple
          </h3>
          <p className="text-gray-600">
            Assign tasks, set due dates, and get notifications. Everyone knows what needs to be done and when.
          </p>
        </motion.div>
      </div>

      {/* Task List Demo */}
      <div className="flex-1 flex items-center justify-center">
        <div className="max-w-2xl w-full">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.6 }}
            className="bg-white rounded-lg shadow-lg overflow-hidden"
          >
            {/* Header */}
            <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <CheckSquare className="w-6 h-6" />
                  <h4 className="text-xl font-semibold">Household Tasks</h4>
                </div>
                <div className="text-blue-100 text-sm">3 tasks</div>
              </div>
            </div>

            {/* Task Items */}
            <div className="divide-y divide-gray-200">
              {tasks.map((task, index) => (
                <motion.div
                  key={task.title}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.5 + index * 0.2, duration: 0.6 }}
                  className={`p-6 hover:bg-gray-50 transition-colors ${task.completed ? 'opacity-60' : ''}`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-start space-x-4">
                      <motion.div
                        whileHover={{ scale: 1.1 }}
                        className={`w-6 h-6 rounded border-2 flex items-center justify-center cursor-pointer ${
                          task.completed 
                            ? 'bg-green-500 border-green-500' 
                            : 'border-gray-300 hover:border-green-500'
                        }`}
                      >
                        {task.completed && (
                          <CheckSquare className="w-4 h-4 text-white" />
                        )}
                      </motion.div>
                      <div className="flex-1">
                        <h5 className={`font-medium ${task.completed ? 'line-through text-gray-500' : 'text-gray-900'}`}>
                          {task.title}
                        </h5>
                        <div className="flex items-center space-x-4 mt-2 text-sm text-gray-500">
                          <div className="flex items-center space-x-1">
                            <User className="w-4 h-4" />
                            <span>{task.assignedTo}</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <Calendar className="w-4 h-4" />
                            <span>{task.dueDate}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(task.priority)}`}>
                        {task.priority}
                      </span>
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center text-lg">
                        {task.avatar}
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Notification Demo */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.5, duration: 0.6 }}
            className="mt-8 bg-gradient-to-r from-orange-50 to-red-50 rounded-lg p-6"
          >
            <div className="flex items-center space-x-3">
              <Bell className="w-8 h-8 text-orange-500" />
              <div>
                <h4 className="font-semibold text-gray-900">Smart Notifications</h4>
                <p className="text-sm text-gray-600 mt-1">
                  Get reminded about due dates and celebrate completed tasks together
                </p>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}; 