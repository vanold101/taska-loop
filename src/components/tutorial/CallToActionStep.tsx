import React from 'react';
import { motion } from 'framer-motion';
import { Sparkles, Home, Users, ShoppingCart, DollarSign, CheckSquare, Package } from 'lucide-react';

export const CallToActionStep: React.FC = () => {
  const features = [
    { icon: Users, label: 'Household', color: 'text-blue-500' },
    { icon: ShoppingCart, label: 'Shopping', color: 'text-green-500' },
    { icon: DollarSign, label: 'Expenses', color: 'text-yellow-500' },
    { icon: CheckSquare, label: 'Tasks', color: 'text-purple-500' },
    { icon: Package, label: 'Pantry', color: 'text-orange-500' },
  ];

  return (
    <div className="h-full flex flex-col items-center justify-center text-center">
      {/* Celebration Animation */}
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ duration: 0.8, type: 'spring' }}
        className="mb-8"
      >
        <motion.div
          animate={{
            rotate: [0, 10, -10, 0],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: "easeInOut"
          }}
          className="w-32 h-32 bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 rounded-full flex items-center justify-center"
        >
          <Home className="w-16 h-16 text-white" />
        </motion.div>
      </motion.div>

      {/* Success Message */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3, duration: 0.6 }}
        className="mb-8"
      >
        <h3 className="text-4xl font-bold text-gray-900 mb-4">
          🎉 You're All Set!
        </h3>
        <p className="text-xl text-gray-600 max-w-2xl">
          Your household management platform is ready to go. Start organizing your life with your family and friends.
        </p>
      </motion.div>

      {/* Feature Convergence Animation */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.8, duration: 0.6 }}
        className="mb-12"
      >
        <div className="flex items-center justify-center space-x-6">
          {features.map((feature, index) => (
            <motion.div
              key={feature.label}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 1 + index * 0.1, duration: 0.6 }}
              className="text-center"
            >
              <motion.div
                animate={{
                  y: [0, -8, 0],
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  delay: index * 0.2,
                }}
                className={`w-16 h-16 rounded-full border-2 border-gray-200 flex items-center justify-center ${feature.color} bg-white shadow-lg mb-2`}
              >
                <feature.icon className="w-6 h-6" />
              </motion.div>
              <span className="text-sm text-gray-600 font-medium">{feature.label}</span>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* Quick Start Options */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.8, duration: 0.6 }}
        className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl p-8 max-w-2xl"
      >
        <h4 className="text-xl font-semibold text-gray-900 mb-6 flex items-center justify-center">
          <Sparkles className="w-5 h-5 mr-2 text-yellow-500" />
          Quick Start Ideas
        </h4>
        <div className="grid grid-cols-2 gap-4 text-left">
          <div className="flex items-start space-x-3">
            <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
            <div>
              <div className="font-medium text-gray-900">Invite Your Family</div>
              <div className="text-sm text-gray-600">Add household members to get started</div>
            </div>
          </div>
          <div className="flex items-start space-x-3">
            <div className="w-2 h-2 bg-green-500 rounded-full mt-2"></div>
            <div>
              <div className="font-medium text-gray-900">Create Shopping List</div>
              <div className="text-sm text-gray-600">Start your first collaborative list</div>
            </div>
          </div>
          <div className="flex items-start space-x-3">
            <div className="w-2 h-2 bg-purple-500 rounded-full mt-2"></div>
            <div>
              <div className="font-medium text-gray-900">Assign Tasks</div>
              <div className="text-sm text-gray-600">Organize household responsibilities</div>
            </div>
          </div>
          <div className="flex items-start space-x-3">
            <div className="w-2 h-2 bg-orange-500 rounded-full mt-2"></div>
            <div>
              <div className="font-medium text-gray-900">Upload Receipt</div>
              <div className="text-sm text-gray-600">Try the expense splitting feature</div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Confetti Effect */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 2.5, duration: 0.6 }}
        className="fixed inset-0 pointer-events-none"
      >
        {[...Array(20)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-2 h-2 bg-yellow-400 rounded-full"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
            }}
            animate={{
              y: [0, -30, 0],
              x: [0, Math.random() * 40 - 20, 0],
              rotate: [0, 360],
              opacity: [1, 0.5, 1],
            }}
            transition={{
              duration: 3,
              repeat: Infinity,
              delay: i * 0.1,
            }}
          />
        ))}
      </motion.div>
    </div>
  );
}; 