import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { useNavigate } from "react-router-dom";
import { CheckCircle, ListTodo, ShoppingCart, Split, Users, ArrowRight } from "lucide-react";

const Landing = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-teal-50 dark:from-blue-900/30 dark:via-purple-900/20 dark:to-teal-900/30">
      {/* Navigation */}
      <header className="container mx-auto py-4">
        <nav className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ListTodo className="h-6 w-6 text-teal-600 dark:text-teal-400" />
            <span className="text-xl font-bold text-teal-600 dark:text-teal-400">TaskaLoop</span>
          </div>
          <div className="hidden md:flex items-center gap-4">
            <Button variant="ghost" className="text-teal-700 hover:text-teal-900 hover:bg-teal-50 dark:text-teal-400 dark:hover:text-teal-300 dark:hover:bg-teal-900/20">
              Home
            </Button>
            <Button variant="ghost" className="text-slate-600 hover:text-teal-900 hover:bg-teal-50 dark:text-slate-400 dark:hover:text-teal-300 dark:hover:bg-teal-900/20">
              Features
            </Button>
            <Button variant="ghost" className="text-slate-600 hover:text-teal-900 hover:bg-teal-50 dark:text-slate-400 dark:hover:text-teal-300 dark:hover:bg-teal-900/20">
              About
            </Button>
            <Button variant="ghost" className="text-slate-600 hover:text-teal-900 hover:bg-teal-50 dark:text-slate-400 dark:hover:text-teal-300 dark:hover:bg-teal-900/20">
              Contact
            </Button>
          </div>
          <div>
            <Button 
              className="bg-teal-600 hover:bg-teal-700 dark:bg-teal-500 dark:hover:bg-teal-600 text-white"
              onClick={() => navigate('/home')}
            >
              Get Started
            </Button>
          </div>
        </nav>
      </header>

      {/* Hero Section */}
      <section className="container mx-auto py-16 md:py-24">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
          <div className="space-y-6">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-slate-800 dark:text-slate-200 leading-tight">
              Simplify Your <span className="text-teal-600 dark:text-teal-400">Daily Tasks</span> With TaskaLoop
            </h1>
            <p className="text-lg text-slate-600 dark:text-slate-400 max-w-md">
              The all-in-one solution for managing shopping lists, splitting expenses, and organizing your daily tasks.
            </p>
            <div className="flex gap-4 pt-4">
              <Button 
                className="bg-teal-600 hover:bg-teal-700 dark:bg-teal-500 dark:hover:bg-teal-600 px-6 py-6 h-auto"
                onClick={() => navigate('/home')}
              >
                Try It Free
              </Button>
              <Button 
                variant="outline" 
                className="border-teal-600 text-teal-600 hover:bg-teal-50 dark:border-teal-400 dark:text-teal-400 dark:hover:bg-teal-900/20 px-6 py-6 h-auto"
              >
                Learn More
              </Button>
            </div>
          </div>
          <div className="flex justify-center">
            <div className="relative w-full max-w-md aspect-square bg-gradient-to-br from-teal-200 to-blue-200 dark:from-teal-600/50 dark:to-blue-600/50 rounded-full flex items-center justify-center">
              <div className="absolute inset-4 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-full flex items-center justify-center">
                <ListTodo className="h-24 w-24 text-teal-600 dark:text-teal-400" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="container mx-auto py-16">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-slate-800 dark:text-slate-200 mb-4">All Features in One Place</h2>
          <p className="text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
            TaskaLoop brings together everything you need to organize your shopping and daily activities.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Shopping Trips Card */}
          <Card className="border-none shadow-md hover:shadow-lg transition-shadow dark:bg-gray-800/60 backdrop-blur-sm">
            <CardHeader className="pb-2">
              <div className="w-12 h-12 rounded-full bg-blue-100 dark:bg-blue-900/50 flex items-center justify-center mb-2">
                <ShoppingCart className="h-6 w-6 text-blue-600 dark:text-blue-400" />
              </div>
              <CardTitle className="text-xl text-slate-800 dark:text-slate-200">Shopping Trips</CardTitle>
              <CardDescription className="dark:text-slate-400">Organize your shopping lists by store or trip</CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-teal-600 dark:text-teal-400" />
                  <span className="text-slate-600 dark:text-slate-400">Create multiple shopping lists</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-teal-600 dark:text-teal-400" />
                  <span className="text-slate-600 dark:text-slate-400">Categorize items automatically</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-teal-600 dark:text-teal-400" />
                  <span className="text-slate-600 dark:text-slate-400">Track prices and budgets</span>
                </li>
              </ul>
            </CardContent>
            <CardFooter>
              <Button variant="ghost" className="text-teal-600 hover:text-teal-700 hover:bg-teal-50 dark:text-teal-400 dark:hover:text-teal-300 dark:hover:bg-teal-900/20 px-0">
                Learn more →
              </Button>
            </CardFooter>
          </Card>

          {/* Cart Splitting Card */}
          <Card className="border-none shadow-md hover:shadow-lg transition-shadow dark:bg-gray-800/60 backdrop-blur-sm">
            <CardHeader className="pb-2">
              <div className="w-12 h-12 rounded-full bg-purple-100 dark:bg-purple-900/50 flex items-center justify-center mb-2">
                <Split className="h-6 w-6 text-purple-600 dark:text-purple-400" />
              </div>
              <CardTitle className="text-xl text-slate-800 dark:text-slate-200">Cart Splitting</CardTitle>
              <CardDescription className="dark:text-slate-400">Easily split expenses with roommates or friends</CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-teal-600 dark:text-teal-400" />
                  <span className="text-slate-600 dark:text-slate-400">Assign items to different people</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-teal-600 dark:text-teal-400" />
                  <span className="text-slate-600 dark:text-slate-400">Calculate individual totals</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-teal-600 dark:text-teal-400" />
                  <span className="text-slate-600 dark:text-slate-400">Share expense reports</span>
                </li>
              </ul>
            </CardContent>
            <CardFooter>
              <Button variant="ghost" className="text-teal-600 hover:text-teal-700 hover:bg-teal-50 dark:text-teal-400 dark:hover:text-teal-300 dark:hover:bg-teal-900/20 px-0">
                Learn more →
              </Button>
            </CardFooter>
          </Card>

          {/* Group Management Card */}
          <Card className="border-none shadow-md hover:shadow-lg transition-shadow dark:bg-gray-800/60 backdrop-blur-sm">
            <CardHeader className="pb-2">
              <div className="w-12 h-12 rounded-full bg-teal-100 dark:bg-teal-900/50 flex items-center justify-center mb-2">
                <Users className="h-6 w-6 text-teal-600 dark:text-teal-400" />
              </div>
              <CardTitle className="text-xl text-slate-800 dark:text-slate-200">Group Management</CardTitle>
              <CardDescription className="dark:text-slate-400">Collaborate with family and friends</CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-teal-600 dark:text-teal-400" />
                  <span className="text-slate-600 dark:text-slate-400">Create household groups</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-teal-600 dark:text-teal-400" />
                  <span className="text-slate-600 dark:text-slate-400">Share lists with specific people</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-teal-600 dark:text-teal-400" />
                  <span className="text-slate-600 dark:text-slate-400">Real-time updates for all members</span>
                </li>
              </ul>
            </CardContent>
            <CardFooter>
              <Button variant="ghost" className="text-teal-600 hover:text-teal-700 hover:bg-teal-50 dark:text-teal-400 dark:hover:text-teal-300 dark:hover:bg-teal-900/20 px-0">
                Learn more →
              </Button>
            </CardFooter>
          </Card>
        </div>
      </section>

      {/* CTA Section */}
      <section className="container mx-auto py-16 mb-8">
        <div className="bg-gradient-to-r from-teal-500 to-blue-500 dark:from-teal-600 dark:to-blue-600 rounded-2xl p-8 md:p-12 text-center text-white">
          <h2 className="text-3xl font-bold mb-4">Ready to Simplify Your Life?</h2>
          <p className="max-w-2xl mx-auto mb-8">
            Join thousands of users who are already enjoying the benefits of TaskaLoop.
          </p>
          <Button 
            className="bg-white text-teal-600 hover:bg-gray-100 dark:hover:bg-gray-200 px-8 py-6 h-auto text-lg"
            onClick={() => navigate('/home')}
          >
            Get Started for Free
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="container mx-auto py-8 border-t border-gray-200 dark:border-gray-700">
        <div className="flex flex-col md:flex-row justify-between items-center">
          <div className="flex items-center gap-2 mb-4 md:mb-0">
            <ListTodo className="h-5 w-5 text-teal-600 dark:text-teal-400" />
            <span className="text-lg font-semibold text-teal-600 dark:text-teal-400">TaskaLoop</span>
          </div>
          <div className="text-sm text-slate-500 dark:text-slate-400">© {new Date().getFullYear()} TaskaLoop. All rights reserved.</div>
        </div>
      </footer>
    </div>
  );
};

export default Landing;
