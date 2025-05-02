
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { ShoppingCart, Users, Receipt, ArrowRight, CheckCircle } from "lucide-react";
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
    <div className="min-h-screen premium-bg">
      {/* Hero Section */}
      <section className="pt-12 pb-20 px-4 md:px-6">
        <motion.div 
          className="max-w-4xl mx-auto text-center"
          initial="hidden"
          animate="visible"
          variants={containerVariants}
        >
          <motion.h1 
            className="text-4xl md:text-5xl font-bold tracking-tight mb-4 bg-clip-text text-transparent bg-gradient-to-r from-gloop-premium-gradient-start to-gloop-premium-gradient-end"
            variants={itemVariants}
          >
            TaskaLoop
          </motion.h1>
          <motion.p 
            className="text-xl md:text-2xl mb-8 text-gloop-text-main"
            variants={itemVariants}
          >
            Share errands, split costs, save time
          </motion.p>
          <motion.div 
            className="flex justify-center mb-12"
            variants={itemVariants}
          >
            <div className="w-full max-w-md px-6 py-10 glass-effect rounded-2xl shadow-lg floating">
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <div className="mt-1 bg-gradient-to-r from-gloop-premium-gradient-start to-gloop-premium-gradient-end p-2 rounded-full">
                    <ShoppingCart className="h-4 w-4 text-white" />
                  </div>
                  <div className="flex-1">
                    <p className="font-medium">Rachel is heading to Trader Joe's</p>
                    <p className="text-sm text-gloop-text-muted">ETA: 20 minutes</p>
                  </div>
                </div>
                <div className="pl-11">
                  <div className="bg-white/50 backdrop-blur-sm rounded-lg p-3 border border-gloop-card-border">
                    <p className="text-sm font-medium">Need anything?</p>
                    <div className="flex mt-2">
                      <Button size="sm" className="text-xs mr-2 premium-gradient-btn">
                        Add item
                      </Button>
                      <Button size="sm" className="text-xs bg-white text-gray-700" variant="outline">
                        No thanks
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
              className="premium-gradient-btn"
            >
              Get Started
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </motion.div>
        </motion.div>
      </section>

      {/* Features Section */}
      <section className="py-16 bg-white">
        <div className="max-w-6xl mx-auto px-4 md:px-6">
          <h2 className="text-3xl font-bold text-center mb-12 bg-clip-text text-transparent bg-gradient-to-r from-gloop-premium-gradient-start to-gloop-premium-gradient-end">How It Works</h2>
          <div className="grid md:grid-cols-3 gap-8">
            <motion.div 
              className="premium-card p-6 rounded-xl text-center hover-lift"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              viewport={{ once: true }}
            >
              <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-r from-gloop-premium-gradient-start to-gloop-premium-gradient-end rounded-full flex items-center justify-center">
                <ShoppingCart className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Announce Trips</h3>
              <p className="text-gloop-text-muted">Let your circle know you're heading to a store and collect their requests</p>
              <div className="mt-4 text-left">
                <div className="flex items-center text-sm text-gloop-text-muted mb-2">
                  <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                  <span>Real-time notifications</span>
                </div>
                <div className="flex items-center text-sm text-gloop-text-muted">
                  <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                  <span>Location sharing</span>
                </div>
              </div>
            </motion.div>
            <motion.div 
              className="premium-card p-6 rounded-xl text-center hover-lift"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              viewport={{ once: true }}
            >
              <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-r from-gloop-premium-gradient-start to-gloop-premium-gradient-end rounded-full flex items-center justify-center">
                <Receipt className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Split Costs</h3>
              <p className="text-gloop-text-muted">Capture receipts and automatically split the bill based on who requested what</p>
              <div className="mt-4 text-left">
                <div className="flex items-center text-sm text-gloop-text-muted mb-2">
                  <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                  <span>Automatic calculations</span>
                </div>
                <div className="flex items-center text-sm text-gloop-text-muted">
                  <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                  <span>Payment tracking</span>
                </div>
              </div>
            </motion.div>
            <motion.div 
              className="premium-card p-6 rounded-xl text-center hover-lift"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              viewport={{ once: true }}
            >
              <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-r from-gloop-premium-gradient-start to-gloop-premium-gradient-end rounded-full flex items-center justify-center">
                <Users className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Trusted Circles</h3>
              <p className="text-gloop-text-muted">Create private groups for your household, dorm, or small office</p>
              <div className="mt-4 text-left">
                <div className="flex items-center text-sm text-gloop-text-muted mb-2">
                  <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                  <span>Private sharing</span>
                </div>
                <div className="flex items-center text-sm text-gloop-text-muted">
                  <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                  <span>Multiple groups</span>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-gradient-to-r from-gloop-premium-gradient-start to-gloop-premium-gradient-end text-white">
        <div className="max-w-4xl mx-auto text-center px-4">
          <h2 className="text-3xl font-bold mb-4">Ready to simplify your errands?</h2>
          <p className="text-lg mb-8 text-white/90">Join TaskaLoop today and start saving time, money, and effort.</p>
          <Button 
            onClick={() => navigate('/home')} 
            size="lg"
            className="bg-white text-gloop-premium-gradient-start hover:bg-white/90"
          >
            Get Started Now
            <ArrowRight className="ml-2 h-5 w-5" />
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 px-4 text-center">
        <p className="text-gloop-text-muted">&copy; 2025 TaskaLoop. All rights reserved.</p>
      </footer>
    </div>
  );
};

export default Landing;
