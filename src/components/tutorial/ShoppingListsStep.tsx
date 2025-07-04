import React from 'react';
import { motion } from 'framer-motion';
import { Plus, Check, ShoppingCart, DollarSign, Clock } from 'lucide-react';

export const ShoppingListsStep: React.FC = () => {
  const items = [
    { name: 'Milk', price: '$3.99', addedBy: 'Sarah', time: '2 min ago' },
    { name: 'Bread', price: '$2.49', addedBy: 'Mike', time: '5 min ago' },
    { name: 'Eggs', price: '$4.29', addedBy: 'You', time: '8 min ago' },
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
            Smart Shopping Lists
          </h3>
          <p className="text-gray-600">
            Create shared shopping lists that update in real-time. See prices, who added what, and never miss an item.
          </p>
        </motion.div>
      </div>

      {/* Shopping List Demo */}
      <div className="flex-1 flex items-center justify-center">
        <div className="max-w-md w-full">
          {/* List Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.6 }}
            className="bg-white rounded-t-lg border-2 border-gray-200 p-4 flex items-center justify-between"
          >
            <div className="flex items-center space-x-2">
              <ShoppingCart className="w-5 h-5 text-green-600" />
              <h4 className="font-semibold text-gray-900">Weekly Groceries</h4>
            </div>
            <div className="text-sm text-gray-500">3 items</div>
          </motion.div>

          {/* List Items */}
          <div className="bg-white border-x-2 border-gray-200">
            {items.map((item, index) => (
              <motion.div
                key={item.name}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.5 + index * 0.2, duration: 0.6 }}
                className="flex items-center justify-between p-4 border-b border-gray-100 hover:bg-gray-50"
              >
                <div className="flex items-center space-x-3">
                  <motion.div
                    whileHover={{ scale: 1.1 }}
                    className="w-5 h-5 border-2 border-gray-300 rounded cursor-pointer hover:border-green-500"
                  />
                  <div>
                    <div className="font-medium text-gray-900">{item.name}</div>
                    <div className="text-sm text-gray-500 flex items-center space-x-2">
                      <span>Added by {item.addedBy}</span>
                      <Clock className="w-3 h-3" />
                      <span>{item.time}</span>
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-semibold text-green-600">{item.price}</div>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Add Item Animation */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 1.2, duration: 0.6 }}
            className="bg-white rounded-b-lg border-2 border-gray-200 p-4"
          >
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="w-full flex items-center justify-center space-x-2 py-3 border-2 border-dashed border-gray-300 rounded-lg text-gray-600 hover:border-blue-500 hover:text-blue-600 transition-colors"
            >
              <Plus className="w-5 h-5" />
              <span>Add Item</span>
            </motion.button>
          </motion.div>
        </div>
      </div>

      {/* Real-time Collaboration Indicator */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.5, duration: 0.6 }}
        className="mt-8 bg-gradient-to-r from-blue-50 to-green-50 rounded-lg p-6"
      >
        <div className="flex items-center justify-center space-x-4 mb-4">
          <div className="flex -space-x-2">
            <div className="w-8 h-8 bg-blue-500 rounded-full border-2 border-white flex items-center justify-center text-white text-sm">
              S
            </div>
            <div className="w-8 h-8 bg-green-500 rounded-full border-2 border-white flex items-center justify-center text-white text-sm">
              M
            </div>
            <div className="w-8 h-8 bg-purple-500 rounded-full border-2 border-white flex items-center justify-center text-white text-sm">
              Y
            </div>
          </div>
          <div className="text-center">
            <div className="font-semibold text-gray-900">Real-time Collaboration</div>
            <div className="text-sm text-gray-600">Everyone sees updates instantly</div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}; 