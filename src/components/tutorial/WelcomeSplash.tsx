import React from 'react';
import { motion } from 'framer-motion';
import { Home, Users, ShoppingCart, DollarSign, CheckSquare, Package } from 'lucide-react';

export const WelcomeSplash: React.FC = () => {
  const features = [
    { icon: Users, label: 'Household', color: 'text-blue-500' },
    { icon: ShoppingCart, label: 'Shopping', color: 'text-green-500' },
    { icon: DollarSign, label: 'Expenses', color: 'text-yellow-500' },
    { icon: CheckSquare, label: 'Tasks', color: 'text-purple-500' },
    { icon: Package, label: 'Pantry', color: 'text-orange-500' },
  ];

  return (
    <div className="flex flex-col items-center justify-center h-full text-center">
      {/* Logo Animation */}
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ duration: 0.6, type: 'spring' }}
        className="mb-8"
      >
        <div className="w-24 h-24 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
          <Home className="w-12 h-12 text-white" />
        </div>
      </motion.div>

      {/* Title */}
      <motion.h1
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3, duration: 0.6 }}
        className="text-4xl font-bold text-gray-900 mb-4"
      >
        Welcome to TaskaLoop
      </motion.h1>

      {/* Subtitle */}
      <motion.p
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5, duration: 0.6 }}
        className="text-xl text-gray-600 mb-12 max-w-2xl"
      >
        Your all-in-one household management platform. Let's take a quick tour of what makes TaskaLoop special.
      </motion.p>

      {/* Floating Feature Icons */}
      <div className="grid grid-cols-5 gap-8 mb-12">
        {features.map((feature, index) => (
          <motion.div
            key={feature.label}
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7 + index * 0.1, duration: 0.6 }}
            className="flex flex-col items-center"
          >
            <motion.div
              animate={{
                y: [0, -10, 0],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                delay: index * 0.2,
              }}
              className={`w-16 h-16 rounded-full border-2 border-gray-200 flex items-center justify-center ${feature.color} bg-white shadow-lg`}
            >
              <feature.icon className="w-6 h-6" />
            </motion.div>
            <span className="text-sm text-gray-600 mt-2">{feature.label}</span>
          </motion.div>
        ))}
      </div>

      {/* Bottom Message */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.5, duration: 0.6 }}
        className="text-gray-500 text-sm"
      >
        This quick tour will take about 60 seconds
      </motion.div>
    </div>
  );
}; 