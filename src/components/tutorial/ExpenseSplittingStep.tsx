import React from 'react';
import { motion } from 'framer-motion';
import { Receipt, DollarSign, Users, ArrowRight } from 'lucide-react';

export const ExpenseSplittingStep: React.FC = () => {
  const splitData = [
    { name: 'You', amount: '$21.23', paid: true, avatar: '👨‍💼' },
    { name: 'Sarah', amount: '$21.23', paid: false, avatar: '👩‍🏫' },
    { name: 'Mike', amount: '$21.23', paid: false, avatar: '👨‍🔧' },
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
            Automatic Expense Splitting
          </h3>
          <p className="text-gray-600">
            Upload receipts and automatically split expenses with your household members. No more awkward money conversations.
          </p>
        </motion.div>
      </div>

      {/* Expense Splitting Demo */}
      <div className="flex-1 flex items-center justify-center">
        <div className="max-w-2xl w-full">
          <div className="grid grid-cols-3 gap-8 items-center">
            {/* Receipt */}
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3, duration: 0.6 }}
              className="text-center"
            >
              <div className="bg-white rounded-lg shadow-lg p-6 mb-4">
                <Receipt className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h4 className="font-semibold text-gray-900 mb-2">Grocery Receipt</h4>
                <div className="text-2xl font-bold text-green-600">$63.69</div>
                <div className="text-sm text-gray-500 mt-1">Whole Foods</div>
              </div>
              <div className="text-sm text-gray-600">1. Upload receipt</div>
            </motion.div>

            {/* Arrow */}
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.8, duration: 0.6 }}
              className="flex justify-center"
            >
              <ArrowRight className="w-8 h-8 text-blue-500" />
            </motion.div>

            {/* Split Result */}
            <motion.div
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 1.2, duration: 0.6 }}
              className="text-center"
            >
              <div className="bg-white rounded-lg shadow-lg p-6 mb-4">
                <Users className="w-12 h-12 text-blue-500 mx-auto mb-4" />
                <h4 className="font-semibold text-gray-900 mb-2">Split 3 Ways</h4>
                <div className="text-2xl font-bold text-blue-600">$21.23</div>
                <div className="text-sm text-gray-500 mt-1">per person</div>
              </div>
              <div className="text-sm text-gray-600">2. Auto-split equally</div>
            </motion.div>
          </div>

          {/* Payment Status */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.8, duration: 0.6 }}
            className="mt-12 bg-white rounded-lg shadow-lg p-6"
          >
            <h4 className="font-semibold text-gray-900 mb-4 flex items-center">
              <DollarSign className="w-5 h-5 mr-2 text-green-500" />
              Payment Status
            </h4>
            <div className="space-y-3">
              {splitData.map((person, index) => (
                <motion.div
                  key={person.name}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 2 + index * 0.2, duration: 0.6 }}
                  className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                >
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center text-lg">
                      {person.avatar}
                    </div>
                    <div>
                      <div className="font-medium text-gray-900">{person.name}</div>
                      <div className="text-sm text-gray-500">{person.amount}</div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    {person.paid ? (
                      <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-medium">
                        Paid
                      </span>
                    ) : (
                      <button className="px-3 py-1 bg-blue-600 text-white rounded-full text-sm font-medium hover:bg-blue-700">
                        Request
                      </button>
                    )}
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}; 