import React from 'react';
import { motion } from 'framer-motion';
import { Package, Scan, AlertTriangle, ShoppingCart, Calendar } from 'lucide-react';

export const PantryManagementStep: React.FC = () => {
  const pantryItems = [
    { 
      name: 'Milk',
      quantity: '2L',
      expiry: 'Expires in 2 days',
      status: 'warning',
      category: 'Dairy'
    },
    { 
      name: 'Bread',
      quantity: '1 loaf',
      expiry: 'Expires in 5 days',
      status: 'good',
      category: 'Bakery'
    },
    { 
      name: 'Eggs',
      quantity: '12 count',
      expiry: 'Expired 1 day ago',
      status: 'expired',
      category: 'Dairy'
    },
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'expired': return 'bg-red-100 text-red-800 border-red-200';
      case 'warning': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'good': return 'bg-green-100 text-green-800 border-green-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
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
            Smart Pantry Management
          </h3>
          <p className="text-gray-600">
            Track expiry dates, scan barcodes, and automatically add items to your shopping list when they're running low.
          </p>
        </motion.div>
      </div>

      {/* Pantry Demo */}
      <div className="flex-1 flex items-center justify-center">
        <div className="max-w-3xl w-full">
          <div className="grid grid-cols-2 gap-8">
            {/* Pantry Items */}
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3, duration: 0.6 }}
              className="bg-white rounded-lg shadow-lg overflow-hidden"
            >
              <div className="bg-gradient-to-r from-green-600 to-blue-600 text-white p-4">
                <div className="flex items-center space-x-2">
                  <Package className="w-6 h-6" />
                  <h4 className="text-lg font-semibold">Current Pantry</h4>
                </div>
              </div>
              
              <div className="divide-y divide-gray-200">
                {pantryItems.map((item, index) => (
                  <motion.div
                    key={item.name}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.6 + index * 0.2, duration: 0.6 }}
                    className="p-4 hover:bg-gray-50"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <h5 className="font-medium text-gray-900">{item.name}</h5>
                        <div className="text-sm text-gray-500 mt-1">
                          {item.quantity} • {item.category}
                        </div>
                      </div>
                      <div className="text-right">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(item.status)}`}>
                          {item.expiry}
                        </span>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>

            {/* Smart Features */}
            <div className="space-y-6">
              {/* Barcode Scanner */}
              <motion.div
                initial={{ opacity: 0, x: 50 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.8, duration: 0.6 }}
                className="bg-white rounded-lg shadow-lg p-6"
              >
                <div className="flex items-center space-x-3 mb-4">
                  <Scan className="w-8 h-8 text-blue-500" />
                  <div>
                    <h4 className="font-semibold text-gray-900">Barcode Scanner</h4>
                    <p className="text-sm text-gray-600">Scan items to add instantly</p>
                  </div>
                </div>
                <motion.div
                  animate={{
                    scale: [1, 1.05, 1],
                  }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                  }}
                  className="bg-gradient-to-r from-blue-100 to-purple-100 rounded-lg p-4 text-center"
                >
                  <div className="text-2xl mb-2">📷</div>
                  <div className="text-sm text-gray-600">Point camera at barcode</div>
                </motion.div>
              </motion.div>

              {/* Expiry Alerts */}
              <motion.div
                initial={{ opacity: 0, x: 50 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 1.2, duration: 0.6 }}
                className="bg-white rounded-lg shadow-lg p-6"
              >
                <div className="flex items-center space-x-3 mb-4">
                  <AlertTriangle className="w-8 h-8 text-orange-500" />
                  <div>
                    <h4 className="font-semibold text-gray-900">Expiry Alerts</h4>
                    <p className="text-sm text-gray-600">Never waste food again</p>
                  </div>
                </div>
                <div className="bg-orange-50 border border-orange-200 rounded-lg p-3">
                  <div className="text-sm text-orange-800">
                    ⚠️ Milk expires in 2 days
                  </div>
                </div>
              </motion.div>

              {/* Auto Shopping List */}
              <motion.div
                initial={{ opacity: 0, x: 50 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 1.6, duration: 0.6 }}
                className="bg-white rounded-lg shadow-lg p-6"
              >
                <div className="flex items-center space-x-3 mb-4">
                  <ShoppingCart className="w-8 h-8 text-green-500" />
                  <div>
                    <h4 className="font-semibold text-gray-900">Auto Shopping List</h4>
                    <p className="text-sm text-gray-600">Items added automatically</p>
                  </div>
                </div>
                <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                  <div className="text-sm text-green-800">
                    ✅ Eggs added to shopping list
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}; 