
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { ShoppingCart, Users, Receipt, ArrowRight } from "lucide-react";

const Landing = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gloop-bg">
      {/* Hero Section */}
      <section className="pt-12 pb-20 px-4 md:px-6">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-4 bg-clip-text text-transparent bg-gradient-to-r from-gloop-primary to-gloop-primary-dark">
            Grab&Go Loop
          </h1>
          <p className="text-xl md:text-2xl mb-8 text-gloop-text-main">
            Share errands, split costs, save time
          </p>
          <div className="flex justify-center mb-12">
            <div className="w-full max-w-md px-6 py-10 bg-white rounded-2xl shadow-lg animate-float">
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <div className="mt-1 bg-blue-100 p-2 rounded-full">
                    <ShoppingCart className="h-4 w-4 text-gloop-primary" />
                  </div>
                  <div className="flex-1">
                    <p className="font-medium">Rachel is heading to Trader Joe's</p>
                    <p className="text-sm text-gloop-text-muted">ETA: 20 minutes</p>
                  </div>
                </div>
                <div className="pl-11">
                  <div className="bg-gray-50 rounded-lg p-3">
                    <p className="text-sm font-medium">Need anything?</p>
                    <div className="flex mt-2">
                      <Button size="sm" className="text-xs mr-2 bg-gloop-primary">
                        Add item
                      </Button>
                      <Button size="sm" className="text-xs bg-gray-200 text-gray-700" variant="outline">
                        No thanks
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <Button 
            onClick={() => navigate('/home')} 
            size="lg"
            className="bg-gloop-primary hover:bg-gloop-primary-dark"
          >
            Get Started
            <ArrowRight className="ml-2 h-5 w-5" />
          </Button>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 bg-white">
        <div className="max-w-6xl mx-auto px-4 md:px-6">
          <h2 className="text-3xl font-bold text-center mb-12">How It Works</h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-gloop-bg p-6 rounded-xl text-center">
              <div className="w-16 h-16 mx-auto mb-4 bg-gloop-primary/10 rounded-full flex items-center justify-center">
                <ShoppingCart className="h-8 w-8 text-gloop-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Announce Trips</h3>
              <p className="text-gloop-text-muted">Let your circle know you're heading to a store and collect their requests</p>
            </div>
            <div className="bg-gloop-bg p-6 rounded-xl text-center">
              <div className="w-16 h-16 mx-auto mb-4 bg-gloop-primary/10 rounded-full flex items-center justify-center">
                <Receipt className="h-8 w-8 text-gloop-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Split Costs</h3>
              <p className="text-gloop-text-muted">Capture receipts and automatically split the bill based on who requested what</p>
            </div>
            <div className="bg-gloop-bg p-6 rounded-xl text-center">
              <div className="w-16 h-16 mx-auto mb-4 bg-gloop-primary/10 rounded-full flex items-center justify-center">
                <Users className="h-8 w-8 text-gloop-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Trusted Circles</h3>
              <p className="text-gloop-text-muted">Create private groups for your household, dorm, or small office</p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 px-4 text-center">
        <p className="text-gloop-text-muted">&copy; 2025 Grab&Go Loop. All rights reserved.</p>
      </footer>
    </div>
  );
};

export default Landing;
