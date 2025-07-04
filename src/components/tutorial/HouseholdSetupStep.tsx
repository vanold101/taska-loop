import React from 'react';
import { motion } from 'framer-motion';
import { Plus, UserPlus, Crown, User } from 'lucide-react';

export const HouseholdSetupStep: React.FC = () => {
  const members = [
    { name: 'You', role: 'Admin', avatar: '👨‍💼' },
    { name: 'Sarah', role: 'Member', avatar: '👩‍🏫' },
    { name: 'Mike', role: 'Member', avatar: '👨‍🔧' },
  ];

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
            Build Your Household Team
          </h3>
          <p className="text-gray-600">
            Add household members to start collaborating on everything from shopping lists to expense splitting.
          </p>
        </motion.div>
      </div>

      {/* Household Members Animation */}
      <div className="flex-1 flex items-center justify-center">
        <div className="grid grid-cols-3 gap-6 max-w-2xl">
          {members.map((member, index) => (
            <motion.div
              key={member.name}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.3 + index * 0.2, duration: 0.6 }}
              className="flex flex-col items-center p-6 bg-white rounded-lg border-2 border-gray-200 shadow-sm"
            >
              <motion.div
                animate={{
                  scale: [1, 1.05, 1],
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  delay: index * 0.5,
                }}
                className="w-20 h-20 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center text-2xl mb-4"
              >
                {member.avatar}
              </motion.div>
              <h4 className="font-semibold text-gray-900 mb-1">{member.name}</h4>
              <div className="flex items-center space-x-1 text-sm text-gray-500">
                {member.role === 'Admin' ? (
                  <Crown className="w-4 h-4 text-yellow-500" />
                ) : (
                  <User className="w-4 h-4" />
                )}
                <span>{member.role}</span>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Add Member Button Animation */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.2, duration: 0.6 }}
        className="flex justify-center mt-8"
      >
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="flex items-center space-x-2 px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
        >
          <UserPlus className="w-5 h-5" />
          <span>Add Household Member</span>
        </motion.button>
      </motion.div>

      {/* Features List */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.5, duration: 0.6 }}
        className="mt-8 bg-gray-50 rounded-lg p-6"
      >
        <h4 className="font-semibold text-gray-900 mb-4">What you can do together:</h4>
        <div className="grid grid-cols-2 gap-4 text-sm text-gray-600">
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
            <span>Share shopping lists in real-time</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
            <span>Split expenses automatically</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
            <span>Assign and track tasks</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
            <span>Manage pantry together</span>
          </div>
        </div>
      </motion.div>
    </div>
  );
}; 