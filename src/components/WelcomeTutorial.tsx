import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTutorial } from '../context/TutorialContext';
import { Button } from './ui/button';
import { X, ArrowLeft, ArrowRight, Home, Users, ShoppingCart, DollarSign, CheckSquare, Package } from 'lucide-react';

// Import the WelcomeSplash component that we know works
import { WelcomeSplash } from './tutorial/WelcomeSplash';

// Create simple fallback components for now to avoid import issues
const HouseholdSetupStep = () => (
  <div className="h-full flex flex-col items-center justify-center text-center">
    <div className="w-20 h-20 bg-blue-500 rounded-full flex items-center justify-center mb-6">
      <Users className="w-10 h-10 text-white" />
    </div>
    <h3 className="text-2xl font-semibold text-gray-900 mb-4">Build Your Household Team</h3>
    <p className="text-gray-600 max-w-2xl mb-8">
      Add household members to start collaborating on everything from shopping lists to expense splitting.
    </p>
    <div className="grid grid-cols-3 gap-4 max-w-xl">
      {['You (Admin)', 'Sarah', 'Mike'].map((name, i) => (
        <div key={name} className="bg-white p-4 rounded-lg border-2 border-gray-200 text-center">
          <div className="w-12 h-12 bg-gradient-to-br from-blue-400 to-purple-500 rounded-full flex items-center justify-center text-xl mx-auto mb-2">
            {['👨‍💼', '👩‍🏫', '👨‍🔧'][i]}
          </div>
          <div className="font-medium">{name}</div>
        </div>
      ))}
    </div>
  </div>
);

const ShoppingListsStep = () => (
  <div className="h-full flex flex-col items-center justify-center text-center">
    <div className="w-20 h-20 bg-green-500 rounded-full flex items-center justify-center mb-6">
      <ShoppingCart className="w-10 h-10 text-white" />
    </div>
    <h3 className="text-2xl font-semibold text-gray-900 mb-4">Smart Shopping Lists</h3>
    <p className="text-gray-600 max-w-2xl mb-8">
      Create shared shopping lists that update in real-time. See prices, who added what, and never miss an item.
    </p>
    <div className="bg-white rounded-lg border-2 border-gray-200 p-6 max-w-md w-full">
      <h4 className="font-semibold mb-4">Weekly Groceries</h4>
      {[
        { name: 'Milk', price: '$3.99', by: 'Sarah' },
        { name: 'Bread', price: '$2.49', by: 'Mike' },
        { name: 'Eggs', price: '$4.29', by: 'You' }
      ].map(item => (
        <div key={item.name} className="flex justify-between items-center py-2 border-b border-gray-100 last:border-b-0">
          <div>
            <div className="font-medium">{item.name}</div>
            <div className="text-sm text-gray-500">Added by {item.by}</div>
          </div>
          <div className="font-semibold text-green-600">{item.price}</div>
        </div>
      ))}
    </div>
  </div>
);

const ExpenseSplittingStep = () => (
  <div className="h-full flex flex-col items-center justify-center text-center">
    <div className="w-20 h-20 bg-yellow-500 rounded-full flex items-center justify-center mb-6">
      <DollarSign className="w-10 h-10 text-white" />
    </div>
    <h3 className="text-2xl font-semibold text-gray-900 mb-4">Automatic Expense Splitting</h3>
    <p className="text-gray-600 max-w-2xl mb-8">
      Upload receipts and automatically split expenses with your household members. No more awkward money conversations.
    </p>
    <div className="grid grid-cols-3 gap-6 items-center max-w-2xl">
      <div className="text-center">
        <div className="bg-white rounded-lg shadow-lg p-4 mb-2">
          <div className="text-2xl font-bold text-green-600">$63.69</div>
          <div className="text-sm text-gray-500">Grocery Receipt</div>
        </div>
        <div className="text-sm text-gray-600">1. Upload receipt</div>
      </div>
      <div className="text-center">
        <ArrowRight className="w-8 h-8 text-blue-500 mx-auto" />
      </div>
      <div className="text-center">
        <div className="bg-white rounded-lg shadow-lg p-4 mb-2">
          <div className="text-2xl font-bold text-blue-600">$21.23</div>
          <div className="text-sm text-gray-500">per person</div>
        </div>
        <div className="text-sm text-gray-600">2. Auto-split equally</div>
      </div>
    </div>
  </div>
);

const TaskCoordinationStep = () => (
  <div className="h-full flex flex-col items-center justify-center text-center">
    <div className="w-20 h-20 bg-purple-500 rounded-full flex items-center justify-center mb-6">
      <CheckSquare className="w-10 h-10 text-white" />
    </div>
    <h3 className="text-2xl font-semibold text-gray-900 mb-4">Task Coordination Made Simple</h3>
    <p className="text-gray-600 max-w-2xl mb-8">
      Assign tasks, set due dates, and get notifications. Everyone knows what needs to be done and when.
    </p>
    <div className="bg-white rounded-lg shadow-lg p-6 max-w-lg w-full">
      <h4 className="font-semibold mb-4">Household Tasks</h4>
      {[
        { task: 'Take out trash', person: 'Mike', due: 'Today', priority: 'high' },
        { task: 'Grocery shopping', person: 'Sarah', due: 'Tomorrow', priority: 'medium' },
        { task: 'Clean kitchen', person: 'You', due: 'Friday', priority: 'low' }
      ].map(item => (
        <div key={item.task} className="flex justify-between items-center py-3 border-b border-gray-100 last:border-b-0">
          <div>
            <div className="font-medium">{item.task}</div>
            <div className="text-sm text-gray-500">{item.person} • {item.due}</div>
          </div>
          <span className={`px-2 py-1 rounded text-xs font-medium ${
            item.priority === 'high' ? 'bg-red-100 text-red-800' :
            item.priority === 'medium' ? 'bg-yellow-100 text-yellow-800' :
            'bg-green-100 text-green-800'
          }`}>
            {item.priority}
          </span>
        </div>
      ))}
    </div>
  </div>
);

const PantryManagementStep = () => (
  <div className="h-full flex flex-col items-center justify-center text-center">
    <div className="w-20 h-20 bg-orange-500 rounded-full flex items-center justify-center mb-6">
      <Package className="w-10 h-10 text-white" />
    </div>
    <h3 className="text-2xl font-semibold text-gray-900 mb-4">Smart Pantry Management</h3>
    <p className="text-gray-600 max-w-2xl mb-8">
      Track expiry dates, scan barcodes, and automatically add items to your shopping list when they're running low.
    </p>
    <div className="grid grid-cols-2 gap-6 max-w-2xl">
      <div className="bg-white rounded-lg shadow-lg p-4">
        <h5 className="font-semibold mb-3">Current Pantry</h5>
        {[
          { name: 'Milk', expiry: 'Expires in 2 days', status: 'warning' },
          { name: 'Bread', expiry: 'Expires in 5 days', status: 'good' },
          { name: 'Eggs', expiry: 'Expired 1 day ago', status: 'expired' }
        ].map(item => (
          <div key={item.name} className="flex justify-between items-center py-2">
            <span className="font-medium">{item.name}</span>
            <span className={`px-2 py-1 rounded text-xs ${
              item.status === 'expired' ? 'bg-red-100 text-red-800' :
              item.status === 'warning' ? 'bg-yellow-100 text-yellow-800' :
              'bg-green-100 text-green-800'
            }`}>
              {item.expiry}
            </span>
          </div>
        ))}
      </div>
      <div className="space-y-4">
        <div className="bg-blue-50 rounded-lg p-4 text-center">
          <div className="text-2xl mb-2">📷</div>
          <div className="font-medium">Barcode Scanner</div>
          <div className="text-sm text-gray-600">Scan items to add instantly</div>
        </div>
        <div className="bg-orange-50 rounded-lg p-3">
          <div className="text-sm text-orange-800">⚠️ Milk expires in 2 days</div>
        </div>
      </div>
    </div>
  </div>
);

const CallToActionStep = () => (
  <div className="h-full flex flex-col items-center justify-center text-center">
    <div className="w-32 h-32 bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 rounded-full flex items-center justify-center mb-8">
      <Home className="w-16 h-16 text-white" />
    </div>
    <h3 className="text-4xl font-bold text-gray-900 mb-4">🎉 You're All Set!</h3>
    <p className="text-xl text-gray-600 max-w-2xl mb-8">
      Your household management platform is ready to go. Start organizing your life with your family and friends.
    </p>
    <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl p-6 max-w-lg">
      <h4 className="text-lg font-semibold mb-4">Quick Start Ideas</h4>
      <div className="grid grid-cols-2 gap-3 text-left text-sm">
        <div>• Invite Your Family</div>
        <div>• Create Shopping List</div>
        <div>• Assign Tasks</div>
        <div>• Upload Receipt</div>
      </div>
    </div>
  </div>
);

const WelcomeTutorial: React.FC = () => {
  const { isActive, currentStep, totalSteps, nextStep, prevStep, skipTutorial, progress } = useTutorial();

  if (!isActive) return null;

  const stepComponents = [
    <WelcomeSplash key="welcome" />,
    <HouseholdSetupStep key="household" />,
    <ShoppingListsStep key="shopping" />,
    <ExpenseSplittingStep key="expense" />,
    <TaskCoordinationStep key="task" />,
    <PantryManagementStep key="pantry" />,
    <CallToActionStep key="cta" />
  ];

  const stepTitles = [
    'Welcome to TaskaLoop',
    'Set Up Your Household',
    'Smart Shopping Lists',
    'Expense Splitting',
    'Task Coordination',
    'Pantry Management',
    'You\'re All Set!'
  ];

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-2 md:p-4"
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          className="relative w-full max-w-4xl h-[95vh] bg-white rounded-xl shadow-2xl flex flex-col overflow-hidden"
        >
          {/* Header - Fixed */}
          <div className="flex-shrink-0 bg-white border-b border-gray-200 p-4 md:p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4 flex-1">
                <div className="text-sm text-gray-600 whitespace-nowrap">
                  Step {currentStep + 1} of {totalSteps}
                </div>
                <div className="flex-1 max-w-md">
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <motion.div
                      className="bg-blue-600 h-2 rounded-full"
                      initial={{ width: 0 }}
                      animate={{ width: `${progress}%` }}
                      transition={{ duration: 0.5 }}
                    />
                  </div>
                </div>
              </div>
              <button
                onClick={skipTutorial}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors ml-4"
                aria-label="Close tutorial"
              >
                <X className="w-5 h-5 text-gray-600" />
              </button>
            </div>
            <h2 className="text-xl md:text-2xl font-bold text-gray-900 mt-4">
              {stepTitles[currentStep]}
            </h2>
          </div>

          {/* Content - Scrollable */}
          <div className="flex-1 overflow-y-auto overscroll-contain">
            <div className="p-4 md:p-6">
              <AnimatePresence mode="wait">
                <motion.div
                  key={currentStep}
                  initial={{ opacity: 0, x: 50 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -50 }}
                  transition={{ duration: 0.3 }}
                  className="min-h-[400px]"
                >
                  {stepComponents[currentStep]}
                </motion.div>
              </AnimatePresence>
            </div>
          </div>

          {/* Footer - Fixed */}
          <div className="flex-shrink-0 bg-white border-t border-gray-200 p-4 md:p-6">
            <div className="flex items-center justify-between gap-4">
              <Button
                variant="outline"
                onClick={prevStep}
                disabled={currentStep === 0}
                className="flex items-center space-x-2"
              >
                <ArrowLeft className="w-4 h-4" />
                <span className="hidden sm:inline">Previous</span>
              </Button>

              <div className="flex items-center space-x-2">
                <Button
                  variant="outline"
                  onClick={skipTutorial}
                  className="text-gray-600 hidden sm:flex"
                >
                  Skip Tutorial
                </Button>
                <Button
                  onClick={nextStep}
                  className="flex items-center space-x-2"
                >
                  <span>{currentStep === totalSteps - 1 ? 'Get Started' : 'Next'}</span>
                  <ArrowRight className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default WelcomeTutorial; 