import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { 
  ShoppingCart, 
  Users, 
  Receipt, 
  ArrowRight, 
  CheckCircle, 
  MapPin, 
  Scan, 
  RotateCw,
  Wallet,
  Sparkles,
  ListChecks,
  Clock,
  PieChart,
  Moon
} from "lucide-react";
import { motion } from "framer-motion";

const Landing = () => {
  const navigate = useNavigate();

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.3
      }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        duration: 0.5
      }
    }
  };

  return (
    <div className="min-h-screen overflow-x-hidden w-full">
      {/* Hero Section */}
      <section className="w-full pt-12 md:pt-16 pb-16 md:pb-24 bg-gradient-to-b from-blue-500/10 via-green-500/10 to-blue-500/10 dark:from-blue-900/30 dark:via-green-900/30 dark:to-blue-900/30">
        <div className="w-full px-[5vw] md:px-[8vw] lg:px-[10vw]">
          <motion.div 
            className="max-w-xl md:max-w-3xl lg:max-w-4xl mx-auto text-center"
            initial="hidden"
            animate="visible"
            variants={containerVariants}
          >
            <motion.h1 
              className="text-4xl md:text-5xl font-bold tracking-tight mb-4 md:mb-6 bg-clip-text text-transparent bg-gradient-to-r from-blue-500 to-green-500"
              variants={itemVariants}
            >
              TaskaLoop
            </motion.h1>
            <motion.p 
              className="text-xl md:text-2xl mb-8 md:mb-10 text-gray-700 dark:text-gray-200"
              variants={itemVariants}
            >
              Simplify household tasks, shopping trips, and expense sharing
            </motion.p>
            
            {/* Demo card */}
            <motion.div 
              className="flex justify-center mb-10 md:mb-14"
              variants={itemVariants}
            >
              <div className="w-full max-w-sm md:max-w-md px-6 md:px-8 py-8 md:py-10 bg-white/80 dark:bg-gray-800/80 backdrop-blur-lg rounded-3xl shadow-xl border border-gray-100 dark:border-gray-700">
                <div className="space-y-5 md:space-y-6">
                  <div className="flex items-start gap-3 md:gap-4">
                    <div className="mt-1 bg-gradient-to-r from-blue-500 to-green-500 p-2.5 md:p-3 rounded-full shadow-md">
                      <ShoppingCart className="h-4 w-4 md:h-5 md:w-5 text-white" />
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-base md:text-lg">Rachel is heading to Trader Joe's</p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">ETA: 20 minutes</p>
                    </div>
                  </div>
                  <div className="pl-10 md:pl-14">
                    <div className="bg-white dark:bg-gray-700 rounded-lg p-3 md:p-4 border border-gray-200 dark:border-gray-600 shadow-sm">
                      <p className="font-medium mb-2">Need anything?</p>
                      <div className="flex justify-start space-x-2 md:space-x-3">
                        <Button size="sm" className="bg-gradient-to-r from-blue-500 to-green-500 hover:from-blue-600 hover:to-green-600 text-white border-0 text-xs md:text-sm px-2 md:px-3">
                          Add Items
                        </Button>
                        <Button size="sm" variant="outline" className="bg-white dark:bg-gray-800 text-xs md:text-sm px-2 md:px-3">
                          No Thanks
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
            
            <motion.div variants={itemVariants}>
              <Button 
                onClick={() => navigate('/home')} 
                size="lg"
                className="bg-gradient-to-r from-blue-500 to-green-500 hover:from-blue-600 hover:to-green-600 text-white text-base md:text-lg px-6 md:px-8 py-5 md:py-6 h-auto rounded-full shadow-lg"
              >
                Get Started
                <ArrowRight className="ml-2 h-4 w-4 md:h-5 md:w-5" />
              </Button>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Main Features Section */}
      <section className="w-full py-16 md:py-20 bg-gradient-to-br from-blue-500/20 via-green-500/20 to-blue-500/20 dark:from-blue-900/30 dark:via-green-900/30 dark:to-blue-900/30">
        <div className="w-full px-[5vw] md:px-[8vw] lg:px-[10vw]">
          <h2 className="text-center mb-12 md:mb-16 text-[clamp(1.875rem,4vw,3rem)] md:text-[clamp(2.25rem,5vw,3.75rem)] font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-green-600 dark:from-blue-400 dark:to-green-400">
            All Features in One Place
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 md:gap-10">
            {/* Feature 1: Shopping Trips */}
            <motion.div 
              className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-100 dark:border-gray-700 hover:shadow-xl transition-all duration-300 h-full overflow-hidden"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
              viewport={{ once: true }}
            >
              <div className="p-6 md:p-8">
                <div className="w-14 h-14 md:w-16 md:h-16 mb-6 bg-gradient-to-r from-blue-500 to-green-500 rounded-2xl flex items-center justify-center shadow-md">
                  <ShoppingCart className="h-7 w-7 md:h-8 md:w-8 text-white" />
                </div>
                <h3 className="text-xl md:text-2xl font-semibold mb-3">Shopping Trips</h3>
                <p className="text-gray-600 dark:text-gray-300 mb-6">Create, share and manage shopping trips with your household members.</p>
                <ul className="space-y-3">
                  <li className="flex items-start">
                    <CheckCircle className="h-5 w-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                    <span className="text-gray-600 dark:text-gray-300">Create shopping trips to specific stores</span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle className="h-5 w-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                    <span className="text-gray-600 dark:text-gray-300">Track item quantities, prices, and status</span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle className="h-5 w-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                    <span className="text-gray-600 dark:text-gray-300">Reactivate completed trips for repeat shopping</span>
                  </li>
                </ul>
              </div>
            </motion.div>
            
            {/* Feature 2: Cost Splitting */}
            <motion.div 
              className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-100 dark:border-gray-700 hover:shadow-xl transition-all duration-300 h-full overflow-hidden"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.1 }}
              viewport={{ once: true }}
            >
              <div className="p-6 md:p-8">
                <div className="w-14 h-14 md:w-16 md:h-16 mb-6 bg-gradient-to-r from-blue-500 to-green-500 rounded-2xl flex items-center justify-center shadow-md">
                  <Wallet className="h-7 w-7 md:h-8 md:w-8 text-white" />
                </div>
                <h3 className="text-xl md:text-2xl font-semibold mb-3">Cost Splitting</h3>
                <p className="text-gray-600 dark:text-gray-300 mb-6">Fair and transparent expense sharing with automatic ledger updates.</p>
                <ul className="space-y-3">
                  <li className="flex items-start">
                    <CheckCircle className="h-5 w-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                    <span className="text-gray-600 dark:text-gray-300">Split costs equally, by percentage, or custom amounts</span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle className="h-5 w-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                    <span className="text-gray-600 dark:text-gray-300">Track who paid for what and who owes whom</span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle className="h-5 w-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                    <span className="text-gray-600 dark:text-gray-300">Settlement transactions logged in shared ledger</span>
                  </li>
                </ul>
              </div>
            </motion.div>
            
            {/* Feature 3: Scan & Track */}
            <motion.div 
              className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-100 dark:border-gray-700 hover:shadow-xl transition-all duration-300 h-full overflow-hidden"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.2 }}
              viewport={{ once: true }}
            >
              <div className="p-6 md:p-8">
                <div className="w-14 h-14 md:w-16 md:h-16 mb-6 bg-gradient-to-r from-blue-500 to-green-500 rounded-2xl flex items-center justify-center shadow-md">
                  <Scan className="h-7 w-7 md:h-8 md:w-8 text-white" />
                </div>
                <h3 className="text-xl md:text-2xl font-semibold mb-3">Scan & Track</h3>
                <p className="text-gray-600 dark:text-gray-300 mb-6">Digitize your shopping with quick scanning tools.</p>
                <ul className="space-y-3">
                  <li className="flex items-start">
                    <CheckCircle className="h-5 w-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                    <span className="text-gray-600 dark:text-gray-300">Scan product barcodes to add items quickly</span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle className="h-5 w-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                    <span className="text-gray-600 dark:text-gray-300">Receipt scanning to capture all purchases</span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle className="h-5 w-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                    <span className="text-gray-600 dark:text-gray-300">Detect duplicate items and prevent double-buying</span>
                  </li>
                </ul>
              </div>
            </motion.div>
            
            {/* Feature 4: Map Integration */}
            <motion.div 
              className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-100 dark:border-gray-700 hover:shadow-xl transition-all duration-300 h-full overflow-hidden"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.3 }}
              viewport={{ once: true }}
            >
              <div className="p-6 md:p-8">
                <div className="w-14 h-14 md:w-16 md:h-16 mb-6 bg-gradient-to-r from-blue-500 to-green-500 rounded-2xl flex items-center justify-center shadow-md">
                  <MapPin className="h-7 w-7 md:h-8 md:w-8 text-white" />
                </div>
                <h3 className="text-xl md:text-2xl font-semibold mb-3">Map Integration</h3>
                <p className="text-gray-600 dark:text-gray-300 mb-6">Location-based features for better shopping planning.</p>
                <ul className="space-y-3">
                  <li className="flex items-start">
                    <CheckCircle className="h-5 w-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                    <span className="text-gray-600 dark:text-gray-300">Find nearby stores and view on an interactive map</span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle className="h-5 w-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                    <span className="text-gray-600 dark:text-gray-300">Optimize shopping routes for multiple stops</span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle className="h-5 w-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                    <span className="text-gray-600 dark:text-gray-300">Get precise distance and travel-time estimates</span>
                  </li>
                </ul>
              </div>
            </motion.div>
            
            {/* Feature 5: Price Tracking */}
            <motion.div 
              className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-100 dark:border-gray-700 hover:shadow-xl transition-all duration-300 h-full overflow-hidden"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.4 }}
              viewport={{ once: true }}
            >
              <div className="p-6 md:p-8">
                <div className="w-14 h-14 md:w-16 md:h-16 mb-6 bg-gradient-to-r from-blue-500 to-green-500 rounded-2xl flex items-center justify-center shadow-md">
                  <PieChart className="h-7 w-7 md:h-8 md:w-8 text-white" />
                </div>
                <h3 className="text-xl md:text-2xl font-semibold mb-3">Price Tracking</h3>
                <p className="text-gray-600 dark:text-gray-300 mb-6">Never overpay for household items again.</p>
                <ul className="space-y-3">
                  <li className="flex items-start">
                    <CheckCircle className="h-5 w-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                    <span className="text-gray-600 dark:text-gray-300">Track prices across different stores</span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle className="h-5 w-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                    <span className="text-gray-600 dark:text-gray-300">Compare prices to find the best deals</span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle className="h-5 w-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                    <span className="text-gray-600 dark:text-gray-300">View price history for common purchases</span>
                  </li>
                </ul>
              </div>
            </motion.div>
            
            {/* Feature 6: Task Management */}
            <motion.div 
              className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-100 dark:border-gray-700 hover:shadow-xl transition-all duration-300 h-full overflow-hidden"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.5 }}
              viewport={{ once: true }}
            >
              <div className="p-6 md:p-8">
                <div className="w-14 h-14 md:w-16 md:h-16 mb-6 bg-gradient-to-r from-blue-500 to-green-500 rounded-2xl flex items-center justify-center shadow-md">
                  <ListChecks className="h-7 w-7 md:h-8 md:w-8 text-white" />
                </div>
                <h3 className="text-xl md:text-2xl font-semibold mb-3">Task Management</h3>
                <p className="text-gray-600 dark:text-gray-300 mb-6">Coordinate household responsibilities seamlessly.</p>
                <ul className="space-y-3">
                  <li className="flex items-start">
                    <CheckCircle className="h-5 w-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                    <span className="text-gray-600 dark:text-gray-300">Create and assign tasks with priorities</span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle className="h-5 w-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                    <span className="text-gray-600 dark:text-gray-300">Set due dates and get reminders</span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle className="h-5 w-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                    <span className="text-gray-600 dark:text-gray-300">Track completion and rotation schedules</span>
                  </li>
                </ul>
              </div>
            </motion.div>
          </div>
        </div>
      </section>
      
      {/* Additional Features Section */}
      <section className="w-full py-12 md:py-16 bg-gradient-to-br from-green-500/20 via-blue-500/20 to-green-500/20 dark:from-green-800/30 dark:via-blue-800/30 dark:to-green-800/30">
        <div className="w-full px-[5vw] md:px-[8vw] lg:px-[10vw]">
          <h2 className="text-center mb-8 md:mb-12 text-2xl md:text-3xl font-bold">More Great Features</h2>
          
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
            <div className="text-center bg-white/90 dark:bg-gray-800/90 p-4 md:p-5 rounded-xl shadow-md hover:shadow-lg transition-all duration-300">
              <div className="w-12 h-12 md:w-14 md:h-14 mx-auto mb-3 md:mb-4 bg-gradient-to-r from-blue-500/20 to-green-500/20 dark:from-blue-900/30 dark:to-green-900/30 rounded-full flex items-center justify-center">
                <Moon className="h-6 w-6 md:h-7 md:w-7 text-blue-600 dark:text-blue-400" />
              </div>
              <p className="font-medium">Dark Mode</p>
            </div>
            
            <div className="text-center bg-white/90 dark:bg-gray-800/90 p-4 md:p-5 rounded-xl shadow-md hover:shadow-lg transition-all duration-300">
              <div className="w-12 h-12 md:w-14 md:h-14 mx-auto mb-3 md:mb-4 bg-gradient-to-r from-blue-500/20 to-green-500/20 dark:from-blue-900/30 dark:to-green-900/30 rounded-full flex items-center justify-center">
                <Users className="h-6 w-6 md:h-7 md:w-7 text-blue-600 dark:text-blue-400" />
              </div>
              <p className="font-medium">Multi-User Support</p>
            </div>
            
            <div className="text-center bg-white/90 dark:bg-gray-800/90 p-4 md:p-5 rounded-xl shadow-md hover:shadow-lg transition-all duration-300">
              <div className="w-12 h-12 md:w-14 md:h-14 mx-auto mb-3 md:mb-4 bg-gradient-to-r from-blue-500/20 to-green-500/20 dark:from-blue-900/30 dark:to-green-900/30 rounded-full flex items-center justify-center">
                <Receipt className="h-6 w-6 md:h-7 md:w-7 text-blue-600 dark:text-blue-400" />
              </div>
              <p className="font-medium">Shared Receipts</p>
            </div>
            
            <div className="text-center bg-white/90 dark:bg-gray-800/90 p-4 md:p-5 rounded-xl shadow-md hover:shadow-lg transition-all duration-300">
              <div className="w-12 h-12 md:w-14 md:h-14 mx-auto mb-3 md:mb-4 bg-gradient-to-r from-blue-500/20 to-green-500/20 dark:from-blue-900/30 dark:to-green-900/30 rounded-full flex items-center justify-center">
                <Clock className="h-6 w-6 md:h-7 md:w-7 text-blue-600 dark:text-blue-400" />
              </div>
              <p className="font-medium">Real-time Updates</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="w-full py-14 md:py-20 bg-gradient-to-r from-blue-600 to-green-500 text-white">
        <div className="w-full px-[5vw] md:px-[8vw] lg:px-[10vw] text-center">
          <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold mb-4 md:mb-6">Ready to simplify your household management?</h2>
          <p className="text-lg md:text-xl mb-8 md:mb-10 text-white/90 max-w-2xl mx-auto">Join TaskaLoop today and start saving time, money, and effort with our comprehensive household coordination platform.</p>
          <Button 
            onClick={() => navigate('/home')} 
            size="lg"
            className="bg-white text-blue-600 hover:bg-white/90 text-base md:text-lg px-6 md:px-8 py-5 md:py-6 h-auto rounded-full shadow-lg"
          >
            Start Using TaskaLoop Now
            <ArrowRight className="ml-2 h-4 w-4 md:h-5 md:w-5" />
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="w-full py-10 md:py-12 bg-gradient-to-r from-blue-500/10 to-green-500/10 dark:from-blue-900/30 dark:to-green-900/30">
        <div className="w-full px-[5vw] md:px-[8vw] lg:px-[10vw]">
          <div className="flex flex-col md:flex-row justify-between items-center mb-6 md:mb-8">
            <div className="mb-4 md:mb-0">
              <h3 className="text-lg md:text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-500 to-green-500">TaskaLoop</h3>
              <p className="text-xs md:text-sm text-gray-500 dark:text-gray-400 mt-1">Simplify your household management</p>
            </div>
            <div className="flex flex-wrap justify-center gap-4 md:gap-0 md:space-x-8">
              <button onClick={() => navigate('/home')} className="text-sm text-gray-600 dark:text-gray-300 hover:text-blue-500">Home</button>
              <button onClick={() => navigate('/trips')} className="text-sm text-gray-600 dark:text-gray-300 hover:text-blue-500">Trips</button>
              <button onClick={() => navigate('/map')} className="text-sm text-gray-600 dark:text-gray-300 hover:text-blue-500">Map</button>
              <button onClick={() => navigate('/ledger')} className="text-sm text-gray-600 dark:text-gray-300 hover:text-blue-500">Ledger</button>
            </div>
          </div>
          <div className="border-t border-gray-200 dark:border-gray-700 pt-6 md:pt-8 text-center">
            <p className="text-xs md:text-sm text-gray-500 dark:text-gray-400">&copy; 2025 TaskaLoop. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Landing;
