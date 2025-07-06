import { useState, useEffect } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/ui/tabs";
import { 
  calculateUserBalances, 
  loadTransactions, 
  Transaction, 
  UserBalance,
  getPaymentRecommendations,
  createPaymentTransaction,
  confirmPayment,
  cancelPayment,
  TransactionCategory,
  getTransactionCategories,
  updateTransactionCategory,
  setCurrentUser
} from "../services/LedgerService";
import { useAuth } from "../context/AuthContext";
import { useHousehold } from "../context/HouseholdContext";
import { Button } from "../components/ui/button";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from "../components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "../components/ui/avatar";
import { Badge } from "../components/ui/badge";
import { 
  Check, 
  DollarSign, 
  FilterX,
  Home,
  Plus,
  Receipt,
  RefreshCw,
  Search,
  Send,
  ShoppingCart,
  Tag,
  User, 
  Utensils,
  Zap,
  Building,
  Car,
  Film,
  CircleDot,
  Stethoscope,
  MoreHorizontal,
  PieChart,
  ArrowDownUp,
  CheckSquare,
  ArrowRight,
  Clock,
  Download,
  Wallet,
  X,
  SlidersHorizontal,
  Calendar,
  FileText
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../components/ui/dialog";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { format, formatDistanceToNow } from "date-fns";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../components/ui/select";
import { Link, useNavigate } from "react-router-dom";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../components/ui/dropdown-menu";
import { Sidebar } from "../components/Sidebar";
import { motion } from "framer-motion";
import { AppLayout } from "../components/AppLayout";

// Get category label by ID
const getCategoryLabel = (categoryId?: TransactionCategory): string => {
  if (!categoryId) return "Uncategorized";
  
  const categories = getTransactionCategories();
  const category = categories.find(cat => cat.id === categoryId);
  return category ? category.label : "Uncategorized";
};

// CategoryIcon component for displaying category icons
const CategoryIcon = ({ category, className = "h-4 w-4" }: { category?: TransactionCategory, className?: string }) => {
  switch(category) {
    case 'food':
      return <Utensils className={className} />;
    case 'utilities':
      return <Zap className={className} />;
    case 'rent':
      return <Building className={className} />;
    case 'entertainment':
      return <Film className={className} />;
    case 'transportation':
      return <Car className={className} />;
    case 'groceries':
      return <ShoppingCart className={className} />;
    case 'household':
      return <Home className={className} />;
    case 'personal':
      return <User className={className} />;
    case 'medical':
      return <Stethoscope className={className} />;
    case 'other':
    default:
      return <CircleDot className={className} />;
  }
};

// CategoryBadge component for displaying category badges
const CategoryBadge = ({ category }: { category?: TransactionCategory }) => {
  if (!category) {
    return null;
  }

  // Different colors for different categories
  const getBgColor = () => {
    switch(category) {
      case 'food': return 'bg-orange-100 text-orange-800 dark:bg-orange-900/20 dark:text-orange-300';
      case 'utilities': return 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-300';
      case 'rent': return 'bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-300';
      case 'entertainment': return 'bg-pink-100 text-pink-800 dark:bg-pink-900/20 dark:text-pink-300';
      case 'transportation': return 'bg-cyan-100 text-cyan-800 dark:bg-cyan-900/20 dark:text-cyan-300';
      case 'groceries': return 'bg-lime-100 text-lime-800 dark:bg-lime-900/20 dark:text-lime-300';
      case 'household': return 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900/20 dark:text-indigo-300';
      case 'personal': return 'bg-amber-100 text-amber-800 dark:bg-amber-900/20 dark:text-amber-300';
      case 'medical': return 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-300';
      case 'other': return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-300';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-300';
    }
  };

  return (
    <div className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-semibold ${getBgColor()}`}>
      <CategoryIcon category={category} className="h-3 w-3 mr-1" />
      <span>{getCategoryLabel(category)}</span>
    </div>
  );
};

const LedgerPage = () => {
  const { user } = useAuth();
  const { members } = useHousehold();
  const [activeTab, setActiveTab] = useState("balances");
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [balances, setBalances] = useState<UserBalance[]>([]);
  const [recommendations, setRecommendations] = useState<{from: UserBalance, to: UserBalance, amount: number}[]>([]);
  const [showPaymentDialog, setShowPaymentDialog] = useState(false);
  const [paymentAmount, setPaymentAmount] = useState("");
  const [paymentDescription, setPaymentDescription] = useState("");
  const [selectedRecipientId, setSelectedRecipientId] = useState<string>("");
  const [searchQuery, setSearchQuery] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [typeFilter, setTypeFilter] = useState<string>("all");
  const [userFilter, setUserFilter] = useState<string>("all");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [selectedCategory, setSelectedCategory] = useState<TransactionCategory | undefined>(undefined);
  const [showCategoryMenu, setShowCategoryMenu] = useState<string | null>(null);
  
  // Set current user for ledger service
  useEffect(() => {
    setCurrentUser(user?.id || null);
  }, [user]);
  
  // Close category menu when clicking outside
  useEffect(() => {
    if (showCategoryMenu) {
      const handleClickOutside = (event: MouseEvent) => {
        const target = event.target as Element;
        if (!target.closest('.category-menu-container')) {
          setShowCategoryMenu(null);
        }
      };
      
      document.addEventListener('mousedown', handleClickOutside);
      return () => {
        document.removeEventListener('mousedown', handleClickOutside);
      };
    }
  }, [showCategoryMenu]);
  
  // Load data when component mounts
  useEffect(() => {
    loadData();
  }, []);
  
  // Reload all data
  const loadData = () => {
    const loadedTransactions = loadTransactions();
    setTransactions(loadedTransactions);
    
    const loadedBalances = calculateUserBalances();
    setBalances(loadedBalances);
    
    const payRecommendations = getPaymentRecommendations();
    setRecommendations(payRecommendations);
  };
  
  // Handle initiating a payment
  const handleInitiatePayment = (recommendation: {from: UserBalance, to: UserBalance, amount: number}) => {
    // Find the recipient in household members
    const recipient = members.find(member => member.name === recommendation.to.userName);
    if (recipient) {
      setSelectedRecipientId(recipient.id);
    }
    
    setPaymentAmount(recommendation.amount.toFixed(2));
    setPaymentDescription(`Payment from ${recommendation.from.userName} to ${recommendation.to.userName}`);
    setShowPaymentDialog(true);
  };
  
  // Handle confirming a payment
  const handleConfirmPayment = (transactionId: string) => {
    try {
      confirmPayment(transactionId);
      loadData(); // Reload data to reflect changes
      console.log("Payment confirmed");
    } catch (error) {
      console.error("Error confirming payment:", error);
    }
  };
  
  // Handle cancelling a payment
  const handleCancelPayment = (transactionId: string) => {
    try {
      cancelPayment(transactionId);
      loadData(); // Reload data to reflect changes
      console.log("Payment cancelled");
    } catch (error) {
      console.error("Error cancelling payment:", error);
    }
  };
  
  // Submit a new payment
  const handleSubmitPayment = () => {
    // Validation
    const amount = parseFloat(paymentAmount);
    if (isNaN(amount) || amount <= 0) {
      console.error("Invalid amount");
      return;
    }
    
    if (!paymentDescription.trim()) {
      console.error("Description required");
      return;
    }
    
    if (!selectedRecipientId) {
      console.error("Recipient required");
      return;
    }
    
    // Find the recipient from household members
    const recipient = members.find(member => member.id === selectedRecipientId);
    if (!recipient) {
      console.error("Recipient not found");
      return;
    }
    
    try {
      // Create the payment transaction
      createPaymentTransaction(
        user?.id || 'current-user',
        user?.name || 'You',
        selectedRecipientId,
        recipient.name,
        amount,
        paymentDescription,
        selectedCategory
      );
      
      // Reset form and close dialog
      setPaymentAmount("");
      setPaymentDescription("");
      setSelectedRecipientId("");
      setSelectedCategory(undefined);
      setShowPaymentDialog(false);
      
      // Reload data to reflect changes
      loadData();
      
      console.log("Payment recorded");
    } catch (error) {
      console.error("Error recording payment:", error);
    }
  };
  
  // Handle new payment dialog open
  const handleOpenNewPayment = () => {
    const availableRecipients = members.filter(member => member.id !== user?.id);
    
    if (availableRecipients.length === 0) {
      console.error("No household members - Invite someone to your household to send them payments.");
      return;
    }
    
    // Pre-select the first available recipient
    setSelectedRecipientId(availableRecipients[0].id);
    
    setPaymentAmount("");
    setPaymentDescription("");
    setShowPaymentDialog(true);
  };
  
  // Get the current user's balance
  const currentUserBalance = balances.find(b => b.userName === "You");
  const positiveBalance = currentUserBalance?.netBalance && currentUserBalance.netBalance > 0;
  const negativeBalance = currentUserBalance?.netBalance && currentUserBalance.netBalance < 0;
  
  // Filter recommendations for current user
  const userRecommendations = recommendations.filter(r => 
    r.from.userName === "You" || r.to.userName === "You"
  );
  
  // Filter transactions to show pending ones first
  const pendingTransactions = transactions.filter(t => t.status === 'pending');
  const completedTransactions = transactions.filter(t => t.status === 'completed');
  
  // Apply filters and search to transactions
  const filteredAndSearchedTransactions = transactions.filter(transaction => {
    // Apply status filter
    if (statusFilter !== "all" && transaction.status !== statusFilter) {
      return false;
    }
    
    // Apply type filter
    if (typeFilter !== "all" && transaction.type !== typeFilter) {
      return false;
    }
    
    // Apply category filter
    if (categoryFilter !== "all" && transaction.category !== categoryFilter) {
      return false;
    }
    
    // Apply user filter
    if (userFilter !== "all") {
      if (userFilter === "sent" && transaction.fromUserName !== "You") {
        return false;
      } else if (userFilter === "received" && transaction.toUserName !== "You") {
        return false;
      }
    }
    
    // Apply search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      return (
        transaction.description.toLowerCase().includes(query) ||
        transaction.fromUserName.toLowerCase().includes(query) ||
        transaction.toUserName.toLowerCase().includes(query) ||
        `$${transaction.amount.toFixed(2)}`.includes(query) ||
        (transaction.category && transaction.category.toLowerCase().includes(query))
      );
    }
    
    return true;
  });
  
  // Apply the same filters to pending transactions
  const filteredPendingTransactions = pendingTransactions.filter(transaction => {
    // If status filter is applied and not showing pending, hide these
    if (statusFilter !== "all" && statusFilter !== "pending") {
      return false;
    }
    
    // Apply type filter
    if (typeFilter !== "all" && transaction.type !== typeFilter) {
      return false;
    }
    
    // Apply category filter
    if (categoryFilter !== "all" && transaction.category !== categoryFilter) {
      return false;
    }
    
    // Apply user filter
    if (userFilter !== "all") {
      if (userFilter === "sent" && transaction.fromUserName !== "You") {
        return false;
      } else if (userFilter === "received" && transaction.toUserName !== "You") {
        return false;
      }
    }
    
    // Apply search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      return (
        transaction.description.toLowerCase().includes(query) ||
        transaction.fromUserName.toLowerCase().includes(query) ||
        transaction.toUserName.toLowerCase().includes(query) ||
        `$${transaction.amount.toFixed(2)}`.includes(query) ||
        (transaction.category && transaction.category.toLowerCase().includes(query))
      );
    }
    
    return true;
  });
  
  // Group filtered transactions by date
  const groupedTransactions = filteredAndSearchedTransactions.reduce((groups, transaction) => {
    const date = new Date(transaction.timestamp).toDateString();
    if (!groups[date]) {
      groups[date] = [];
    }
    groups[date].push(transaction);
    return groups;
  }, {} as Record<string, Transaction[]>);
  
  // Sort dates in reverse chronological order
  const sortedDates = Object.keys(groupedTransactions).sort(
    (a, b) => new Date(b).getTime() - new Date(a).getTime()
  );
  
  // Create a separate group for pending transactions for special display
  const pendingTransactionsGroup = filteredPendingTransactions.length > 0 
    ? { 'Pending Transactions': filteredPendingTransactions }
    : {} as Record<string, Transaction[]>;
  
  // Reset filters
  const resetFilters = () => {
    setSearchQuery("");
    setStatusFilter("all");
    setTypeFilter("all");
    setUserFilter("all");
    setCategoryFilter("all");
    setShowFilters(false);
  };
  
  // Export transactions to CSV
  const exportTransactions = () => {
    if (transactions.length === 0) {
      console.log("No transactions to export");
      return;
    }
    
    try {
      // Create CSV content
      const headers = ["Date", "Description", "From", "To", "Amount", "Status", "Category"];
      const csvRows = [
        headers.join(","),
        ...transactions.map(transaction => {
          return [
            format(new Date(transaction.timestamp), "yyyy-MM-dd"),
            `"${transaction.description.replace(/"/g, '""')}"`,
            transaction.fromUserName,
            transaction.toUserName,
            transaction.amount.toFixed(2),
            transaction.status,
            getCategoryLabel(transaction.category)
          ].join(",");
        })
      ];
      
      const csvContent = csvRows.join("\n");
      
      // Create blob and download link
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `ledger-transactions-${format(new Date(), 'yyyy-MM-dd')}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      console.log("Export successful - Your transactions have been exported to CSV.");
    } catch (error) {
      console.error("Export failed - There was a problem exporting your transactions.", error);
    }
  };
  
  // Get potential recipients (everyone except current user)
  const potentialRecipients = balances.filter(b => b.userName !== "You");
  
  // Handle updating a transaction's category
  const handleUpdateCategory = (transactionId: string, category: TransactionCategory) => {
    try {
      updateTransactionCategory(transactionId, category);
      setShowCategoryMenu(null);
      loadData(); // Reload data to reflect changes
      
      console.log("Category updated");
    } catch (error) {
      console.error("Error updating category", error);
    }
  };
  
  // Add function to handle filter changes
  const handleFilterChange = (type: string, value: string) => {
    switch (type) {
      case 'status':
        setStatusFilter(value);
        break;
      case 'type':
        setTypeFilter(value);
        break;
      case 'user':
        setUserFilter(value);
        break;
      case 'category':
        setCategoryFilter(value);
        break;
    }
  };
  
  return (
    <AppLayout>
      <div className="px-[5vw] md:px-[8vw] lg:px-[10vw] py-6 md:py-8 pb-20 md:pb-24">
        {/* Header section */}
        <header className="mb-6 md:mb-8">
          <h1 className="text-[clamp(1.875rem,4vw,2.5rem)] font-bold mb-2 bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-green-600 dark:from-blue-400 dark:to-green-400">Ledger</h1>
          <p className="text-gray-600 dark:text-gray-300">Track expenses and settle debts with your household</p>
        </header>
        
        {/* Summary Card */}
        <Card className="mb-6 border border-gray-200 dark:border-gray-700 shadow-sm overflow-hidden">
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
              <div>
                <h2 className="text-lg font-semibold mb-2">Your Balance</h2>
                {currentUserBalance?.netBalance === 0 ? (
                  <div className="relative">
                    <motion.div
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ duration: 0.5, type: "spring" }}
                      className="flex items-center gap-2"
                    >
                      <span className="text-2xl font-bold text-gray-800 dark:text-gray-200">
                        $0.00
                      </span>
                      <motion.div 
                        initial={{ opacity: 0, scale: 0, rotate: -45 }}
                        animate={{ opacity: 1, scale: 1, rotate: 0 }}
                        transition={{ delay: 0.3, duration: 0.5, type: "spring" }}
                        className="bg-green-500 dark:bg-green-600 text-white rounded-full p-1"
                      >
                        <Check className="h-4 w-4" />
                      </motion.div>
                    </motion.div>
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.5, duration: 0.3 }}
                      className="text-sm text-green-600 dark:text-green-400 mt-1"
                    >
                      All settled up! 🎉
                    </motion.div>
                  </div>
                ) : (
                  <div className="flex items-baseline">
                    <span className={`text-2xl font-bold ${
                      positiveBalance 
                        ? "text-green-600 dark:text-green-400" 
                        : negativeBalance 
                          ? "text-red-600 dark:text-red-400" 
                          : "text-gray-800 dark:text-gray-200"
                    }`}>
                      {currentUserBalance?.netBalance ? `$${Math.abs(currentUserBalance.netBalance).toFixed(2)}` : "$0.00"}
                    </span>
                    <span className="ml-2 text-sm text-gray-500">
                      {positiveBalance ? "owed to you" : negativeBalance ? "you owe" : ""}
                    </span>
                  </div>
                )}
              </div>
              
              <div className="flex gap-2">
                <Button 
                  onClick={handleOpenNewPayment}
                  className="bg-gradient-to-r from-blue-500 to-green-500 hover:from-blue-600 hover:to-green-600 text-white"
                >
                  <Send className="mr-2 h-4 w-4" />
                  Send Money
                </Button>
                <Button 
                  onClick={loadData} 
                  variant="outline"
                  className="border-gray-200 dark:border-gray-700"
                >
                  <RefreshCw className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
        
        {/* Recommendations */}
        {userRecommendations.length > 0 && (
          <div className="mb-6">
            <h2 className="text-xl font-semibold mb-3 bg-clip-text text-transparent bg-gradient-to-r from-blue-500 to-green-500">Recommended Payments</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-5">
              {userRecommendations.map((rec, index) => (
                <Card key={index} className="border border-gray-200 dark:border-gray-700 shadow-sm hover:shadow-md transition-shadow duration-200 flex flex-col overflow-hidden">
                  <div className={`h-2 w-full ${
                    rec.from.userName === "You" 
                      ? "bg-gradient-to-r from-amber-400 to-red-400" 
                      : "bg-gradient-to-r from-green-400 to-teal-400"
                  }`}></div>
                  <CardHeader className="p-4 pb-2">
                    <CardTitle className="text-lg font-semibold flex items-center justify-between">
                      {rec.from.userName === "You" ? "You should pay" : "Incoming payment"}
                      <Badge variant={rec.from.userName === "You" ? "destructive" : "secondary"} className="ml-2">
                        {rec.from.userName === "You" ? "Outgoing" : "Incoming"}
                      </Badge>
                    </CardTitle>
                    <CardDescription className="text-sm text-gray-500 dark:text-gray-400">
                      {rec.from.userName === "You" 
                        ? `You owe ${rec.to.userName} money` 
                        : `${rec.from.userName} owes you money`}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="p-4 pt-2 flex-grow">
                    <div className="flex justify-between items-center mb-3">
                      <div className="flex items-center gap-2">
                        <Avatar className="h-8 w-8">
                          <AvatarFallback className={`${
                            rec.from.userName === "You" 
                              ? "bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300" 
                              : "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300"
                          }`}>
                            {rec.from.userName === "You" 
                              ? "Y" 
                              : rec.from.userName.charAt(0)}
                          </AvatarFallback>
                        </Avatar>
                        <ArrowRight className="h-4 w-4 mx-1 text-gray-400" />
                        <Avatar className="h-8 w-8">
                          <AvatarFallback className={`${
                            rec.to.userName === "You" 
                              ? "bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300" 
                              : "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300"
                          }`}>
                            {rec.to.userName === "You" 
                              ? "Y" 
                              : rec.to.userName.charAt(0)}
                          </AvatarFallback>
                        </Avatar>
                      </div>
                      <div className="text-xl font-bold">
                        ${rec.amount.toFixed(2)}
                      </div>
                    </div>
                  </CardContent>
                  <CardFooter className="p-3 pt-0 flex gap-2 justify-end border-t border-gray-100 dark:border-gray-800">
                    {rec.from.userName === "You" ? (
                      <>
                        <Button 
                          variant="outline"
                          size="sm"
                          className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                          onClick={() => {
                            console.log("Reminder added");
                          }}
                        >
                          <Clock className="h-4 w-4 mr-1" />
                          Remind me
                        </Button>
                        <Button 
                          onClick={() => handleInitiatePayment(rec)}
                          size="sm"
                          className="bg-gradient-to-r from-blue-500 to-green-500 hover:from-blue-600 hover:to-green-600 text-white"
                        >
                          <Send className="h-4 w-4 mr-1" />
                          Pay now
                        </Button>
                      </>
                    ) : (
                      <Button 
                        variant="outline"
                        size="sm"
                        className="border-green-500 text-green-500 hover:bg-green-50 dark:hover:bg-green-900/20"
                        onClick={() => {
                          console.log("Payment request sent");
                        }}
                      >
                        <Send className="h-4 w-4 mr-1" />
                        Request payment
                      </Button>
                    )}
                  </CardFooter>
                </Card>
              ))}
            </div>
          </div>
        )}
        
        {/* Tabs */}
        <div className="flex justify-between items-center mb-2">
          <h2 className="text-xl font-semibold">Transaction History</h2>
          {transactions.length > 0 && (
            <Button 
              variant="outline" 
              size="sm" 
              className="h-8 text-xs border-gray-200 dark:border-gray-700"
              onClick={exportTransactions}
            >
              <Download className="h-4 w-4 mr-1.5" />
              Export Transactions
            </Button>
          )}
        </div>
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="bg-gray-100/50 dark:bg-gray-800/50 p-1 mb-4">
            <TabsTrigger value="balances" className="data-[state=active]:bg-white dark:data-[state=active]:bg-gray-700 data-[state=active]:shadow-sm">
              Balances
            </TabsTrigger>
            <TabsTrigger value="transactions" className="data-[state=active]:bg-white dark:data-[state=active]:bg-gray-700 data-[state=active]:shadow-sm relative">
              Transactions
              {filteredPendingTransactions.length > 0 && (
                <span className="absolute -top-1 -right-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-yellow-500 dark:bg-yellow-600 text-[10px] text-white px-1 font-semibold">
                  {filteredPendingTransactions.length}
                </span>
              )}
            </TabsTrigger>
          </TabsList>
          
          {/* Balances Tab */}
          <TabsContent value="balances" className="mt-0">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
              {balances.length > 0 ? (
                balances.map(balance => (
                  <Card key={balance.userId} className="border border-gray-200 dark:border-gray-700 shadow-sm flex flex-col">
                    <CardContent className="p-4 flex-grow">
                      <div className="flex justify-between items-center">
                        <div className="flex items-center gap-3">
                          <Avatar className="h-10 w-10">
                            <AvatarFallback className={`${
                              balance.userName === "You" 
                                ? "bg-gradient-to-br from-blue-500 to-green-500 text-white" 
                                : "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200"
                            }`}>
                              {balance.userName.charAt(0)}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <div className="font-medium">{balance.userName}</div>
                            <div className="text-sm text-gray-500 dark:text-gray-400">
                              {balance.userName === "You" 
                                ? positiveBalance 
                                  ? "Others owe you" 
                                  : negativeBalance 
                                    ? "You owe others" 
                                    : "All settled up"
                                : balance.netBalance > 0 
                                  ? `Owes you $${balance.netBalance.toFixed(2)}` 
                                  : balance.netBalance < 0 
                                    ? `You owe $${Math.abs(balance.netBalance).toFixed(2)}` 
                                    : "All settled up"}
                            </div>
                          </div>
                        </div>
                        
                        <div className={`text-lg font-semibold ${
                          balance.userName !== "You" && balance.netBalance > 0 
                            ? "text-green-600 dark:text-green-400" 
                            : balance.userName !== "You" && balance.netBalance < 0 
                              ? "text-red-600 dark:text-red-400" 
                              : "text-gray-600 dark:text-gray-300"
                        }`}>
                          {balance.userName !== "You" && balance.netBalance !== 0 && (
                            `${balance.netBalance > 0 ? "+" : ""}$${balance.netBalance.toFixed(2)}`
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))
              ) : (
                <Card className="border border-dashed border-gray-200 dark:border-gray-700">
                  <CardContent className="p-6 text-center">
                    <div className="w-12 h-12 bg-gradient-to-r from-blue-500/20 to-green-500/20 rounded-full flex items-center justify-center mx-auto mb-3">
                      <Wallet className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                    </div>
                    <h3 className="text-lg font-medium mb-2">No balance information</h3>
                    <p className="text-gray-500 dark:text-gray-400 text-sm mb-4">Start making transactions to track balances</p>
                  </CardContent>
                </Card>
              )}
            </div>
          </TabsContent>
          
          {/* Transactions Tab */}
          <TabsContent value="transactions" className="mt-0">
            {/* Search and Filters */}
            <div className="mb-6">
              <div className="relative">
                <div className="relative mb-3">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-500" />
                  <Input
                    placeholder="Search transactions..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-9 pr-12"
                  />
                  {searchQuery && (
                    <button 
                      className="absolute right-12 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                      onClick={() => setSearchQuery("")}
                    >
                      <X className="h-4 w-4" />
                    </button>
                  )}
                  <button 
                    className={`absolute right-3 top-1/2 transform -translate-y-1/2 ${showFilters ? 'text-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
                    onClick={() => setShowFilters(!showFilters)}
                  >
                    <SlidersHorizontal className="h-4 w-4" />
                  </button>
                </div>
                
                {showFilters && (
                  <Card className="mb-4 border border-gray-200 dark:border-gray-700 shadow-sm">
                    <CardContent className="p-4">
                      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-3">
                        <h3 className="text-sm font-medium">Filters</h3>
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="text-xs h-7 px-2 text-blue-600 dark:text-blue-400"
                          onClick={resetFilters}
                        >
                          <FilterX className="h-3.5 w-3.5 mr-1" />
                          Reset filters
                        </Button>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                        <div>
                          <Label htmlFor="status-filter" className="text-xs mb-1.5">Status</Label>
                          <Select
                            value={statusFilter}
                            onValueChange={setStatusFilter}
                          >
                            <SelectTrigger id="status-filter" className="h-8 text-xs">
                              <SelectValue placeholder="Filter by status" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="all">All Statuses</SelectItem>
                              <SelectItem value="pending">Pending</SelectItem>
                              <SelectItem value="completed">Completed</SelectItem>
                              <SelectItem value="cancelled">Cancelled</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div>
                          <Label htmlFor="type-filter" className="text-xs mb-1.5">Type</Label>
                          <Select
                            value={typeFilter}
                            onValueChange={setTypeFilter}
                          >
                            <SelectTrigger id="type-filter" className="h-8 text-xs">
                              <SelectValue placeholder="Filter by type" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="all">All Types</SelectItem>
                              <SelectItem value="payment">Payments</SelectItem>
                              <SelectItem value="expense">Expenses</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div>
                          <Label htmlFor="user-filter" className="text-xs mb-1.5">Direction</Label>
                          <Select
                            value={userFilter}
                            onValueChange={setUserFilter}
                          >
                            <SelectTrigger id="user-filter" className="h-8 text-xs">
                              <SelectValue placeholder="Filter by user" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="all">All Transactions</SelectItem>
                              <SelectItem value="sent">Sent by You</SelectItem>
                              <SelectItem value="received">Received by You</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div>
                          <Label htmlFor="category-filter" className="text-xs mb-1.5">Category</Label>
                          <Select
                            value={categoryFilter}
                            onValueChange={setCategoryFilter}
                          >
                            <SelectTrigger id="category-filter" className="h-8 text-xs">
                              <SelectValue placeholder="Filter by category" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="all">All Categories</SelectItem>
                              <SelectItem value="food" className="flex items-center">
                                <Utensils className="h-3.5 w-3.5 mr-2" />
                                <span>Food & Dining</span>
                              </SelectItem>
                              <SelectItem value="groceries" className="flex items-center">
                                <ShoppingCart className="h-3.5 w-3.5 mr-2" />
                                <span>Groceries</span>
                              </SelectItem>
                              <SelectItem value="household" className="flex items-center">
                                <Home className="h-3.5 w-3.5 mr-2" />
                                <span>Household</span>
                              </SelectItem>
                              <SelectItem value="utilities" className="flex items-center">
                                <Zap className="h-3.5 w-3.5 mr-2" />
                                <span>Utilities</span>
                              </SelectItem>
                              <SelectItem value="rent" className="flex items-center">
                                <Building className="h-3.5 w-3.5 mr-2" />
                                <span>Rent & Mortgage</span>
                              </SelectItem>
                              <SelectItem value="transportation" className="flex items-center">
                                <Car className="h-3.5 w-3.5 mr-2" />
                                <span>Transportation</span>
                              </SelectItem>
                              <SelectItem value="entertainment" className="flex items-center">
                                <Film className="h-3.5 w-3.5 mr-2" />
                                <span>Entertainment</span>
                              </SelectItem>
                              <SelectItem value="personal" className="flex items-center">
                                <User className="h-3.5 w-3.5 mr-2" />
                                <span>Personal</span>
                              </SelectItem>
                              <SelectItem value="medical" className="flex items-center">
                                <Stethoscope className="h-3.5 w-3.5 mr-2" />
                                <span>Medical</span>
                              </SelectItem>
                              <SelectItem value="other" className="flex items-center">
                                <CircleDot className="h-3.5 w-3.5 mr-2" />
                                <span>Other</span>
                              </SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )}
              </div>

                          {filteredPendingTransactions.length > 0 && (
                <div className="mb-6 rounded-lg border border-yellow-200 dark:border-yellow-800 bg-yellow-50 dark:bg-yellow-900/20 p-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-full bg-yellow-100 dark:bg-yellow-900/50">
                      <Clock className="h-5 w-5 text-yellow-600 dark:text-yellow-400" />
                    </div>
                    <div>
                      <h3 className="font-medium">Pending Payments</h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        You have {filteredPendingTransactions.length} pending payment{filteredPendingTransactions.length !== 1 ? 's' : ''} that {filteredPendingTransactions.length !== 1 ? 'need' : 'needs'} attention
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
            
            {(sortedDates.length > 0 || pendingTransactions.length > 0) ? (
              <div className="space-y-6">
                {/* Display Pending Transactions First */}
                {Object.entries(pendingTransactionsGroup).map(([group, transactions]) => (
                  <div key={group}>
                    <h3 className="text-lg font-semibold mb-3 sticky top-0 bg-opacity-80 backdrop-blur-sm py-2 px-1 -mx-1 z-10 bg-gradient-to-r from-yellow-500/10 via-yellow-500/20 to-yellow-500/10 dark:from-yellow-900/20 dark:via-yellow-900/30 dark:to-yellow-900/20 border-b border-yellow-200 dark:border-yellow-800/50">
                      {group} ({transactions.length})
                    </h3>
                    <div className="space-y-3">
                      {transactions.map((transaction) => (
                        <Card key={transaction.id} className={`border shadow-sm ${transaction.status === 'pending' ? 'border-yellow-500/50 dark:border-yellow-400/40 ring-1 ring-yellow-400/30 dark:ring-yellow-500/30' : 'border-gray-200 dark:border-gray-700'} flex flex-col`}>
                          {transaction.status === 'pending' && (
                            <div className="h-1 w-full bg-gradient-to-r from-yellow-400 to-yellow-500"></div>
                          )}
                          <CardContent className={`p-4 flex-grow ${transaction.status === 'pending' ? 'bg-yellow-50/50 dark:bg-yellow-900/10' : ''}`}>
                            <div className="flex justify-between items-start">
                              <div className="flex items-start gap-3">
                                <div className={`p-2 rounded-full ${
                                  transaction.type === "payment" 
                                    ? transaction.status === 'pending'
                                      ? "bg-yellow-100 dark:bg-yellow-900/30"
                                      : "bg-blue-100 dark:bg-blue-900/30" 
                                    : transaction.type === "expense" 
                                      ? "bg-amber-100 dark:bg-amber-900/30" 
                                      : "bg-green-100 dark:bg-green-900/30"
                                }`}>
                                  {transaction.status === 'pending' && transaction.type === 'payment' ? (
                                    <Clock className="h-5 w-5 text-yellow-600 dark:text-yellow-400" />
                                  ) : transaction.type === "payment" ? (
                                    <Send className={`h-5 w-5 ${
                                      transaction.fromUserName === "You" 
                                        ? "text-blue-600 dark:text-blue-400" 
                                        : "text-green-600 dark:text-green-400"
                                    }`} />
                                  ) : transaction.type === "expense" ? (
                                    <Receipt className="h-5 w-5 text-amber-600 dark:text-amber-400" />
                                  ) : (
                                    <DollarSign className="h-5 w-5 text-green-600 dark:text-green-400" />
                                  )}
                                </div>
                                <div>
                                  <div className="font-medium">{transaction.description}</div>
                                  <div className="flex items-center text-sm text-gray-500 dark:text-gray-400 mt-1">
                                    <Calendar className="h-3.5 w-3.5 mr-1" />
                                    <span>
                                      {format(new Date(transaction.timestamp), "MMM d, yyyy")}
                                      {" · "}
                                      {formatDistanceToNow(new Date(transaction.timestamp))} ago
                                    </span>
                                  </div>
                                  <div className="flex flex-wrap gap-2 mt-2">
                                    <div className="flex items-center text-sm">
                                      <span className="font-medium mr-1">From:</span>
                                      <Avatar className="h-5 w-5 mr-1">
                                        <AvatarFallback className="text-xs">
                                          {transaction.fromUserName.charAt(0)}
                                        </AvatarFallback>
                                      </Avatar>
                                      <span>{transaction.fromUserName}</span>
                                    </div>
                                    <div className="flex items-center text-sm">
                                      <span className="font-medium mr-1">To:</span>
                                      <Avatar className="h-5 w-5 mr-1">
                                        <AvatarFallback className="text-xs">
                                          {transaction.toUserName.charAt(0)}
                                        </AvatarFallback>
                                      </Avatar>
                                      <span>{transaction.toUserName}</span>
                                    </div>
                                  </div>
                                  
                                  {/* Category */}
                                  <div className="mt-2 flex items-center">
                                    <div className="relative inline-block category-menu-container">
                                      {transaction.category ? (
                                        <div 
                                          className="cursor-pointer" 
                                          onClick={(e) => {
                                            e.stopPropagation();
                                            setShowCategoryMenu(showCategoryMenu === transaction.id ? null : transaction.id);
                                          }}
                                        >
                                          <CategoryBadge category={transaction.category} />
                                        </div>
                                      ) : (
                                        <Button 
                                          variant="outline" 
                                          size="sm" 
                                          className="h-6 px-2 text-xs"
                                          onClick={(e) => {
                                            e.stopPropagation();
                                            setShowCategoryMenu(showCategoryMenu === transaction.id ? null : transaction.id);
                                          }}
                                        >
                                          <Tag className="h-3 w-3 mr-1" />
                                          Categorize
                                        </Button>
                                      )}
                                      
                                      {/* Category selection dropdown */}
                                      {showCategoryMenu === transaction.id && (
                                        <div className="absolute top-full left-0 mt-1 z-50 bg-white dark:bg-gray-800 shadow-lg rounded-md border border-gray-200 dark:border-gray-700 p-2 w-48 category-menu-container">
                                          <div className="flex justify-between items-center mb-2 px-2">
                                            <div className="text-xs font-medium text-gray-500 dark:text-gray-400">Select a category</div>
                                            <button 
                                              onClick={(e) => {
                                                e.stopPropagation();
                                                setShowCategoryMenu(null);
                                              }}
                                              className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
                                            >
                                              <X className="h-3 w-3" />
                                            </button>
                                          </div>
                                          {getTransactionCategories().map((category) => (
                                            <button
                                              key={category.id}
                                              className="flex items-center gap-2 w-full text-left px-2 py-1.5 text-sm rounded-md hover:bg-gray-100 dark:hover:bg-gray-700"
                                              onClick={(e) => {
                                                e.stopPropagation();
                                                handleUpdateCategory(transaction.id, category.id);
                                              }}
                                            >
                                              <CategoryIcon category={category.id} className="h-3.5 w-3.5" />
                                              <span>{category.label}</span>
                                            </button>
                                          ))}
                                        </div>
                                      )}
                                    </div>
                                  </div>
                                  {transaction.status === "pending" && transaction.type === "payment" && (
                                    <div className="flex gap-2 mt-3">
                                      {transaction.fromUserName === "You" ? (
                                        <Badge variant="outline" className="bg-yellow-50 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-300">
                                          <Clock className="h-3 w-3 mr-1" />
                                          Awaiting confirmation
                                        </Badge>
                                      ) : (
                                        <div className="flex gap-2">
                                          <Button 
                                            size="sm" 
                                            variant="outline" 
                                            className="h-7 px-2 border-red-200 hover:border-red-300 dark:border-red-900 dark:hover:border-red-800"
                                            onClick={() => handleCancelPayment(transaction.id)}
                                          >
                                            <X className="h-3 w-3 mr-1 text-red-600 dark:text-red-400" />
                                            <span className="text-xs text-red-600 dark:text-red-400">Decline</span>
                                          </Button>
                                          <Button 
                                            size="sm" 
                                            className="h-7 px-2 bg-gradient-to-r from-blue-500 to-green-500 hover:from-blue-600 hover:to-green-600 text-white"
                                            onClick={() => handleConfirmPayment(transaction.id)}
                                          >
                                            <Check className="h-3 w-3 mr-1" />
                                            <span className="text-xs">Confirm</span>
                                          </Button>
                                        </div>
                                      )}
                                    </div>
                                  )}
                                </div>
                              </div>
                              
                              <div className="flex flex-col items-end">
                                <span className={`font-semibold ${
                                  transaction.fromUserName === "You" 
                                    ? "text-red-600 dark:text-red-400" 
                                    : transaction.toUserName === "You" 
                                      ? "text-green-600 dark:text-green-400" 
                                      : "text-gray-800 dark:text-gray-200"
                                }`}>
                                  {transaction.fromUserName === "You" 
                                    ? `-$${transaction.amount.toFixed(2)}` 
                                    : transaction.toUserName === "You" 
                                      ? `+$${transaction.amount.toFixed(2)}` 
                                      : `$${transaction.amount.toFixed(2)}`}
                                </span>
                                <Badge className={`mt-1 ${
                                  transaction.status === "completed" 
                                    ? "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300" 
                                    : transaction.status === "pending" 
                                      ? "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-300" 
                                      : "bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-300"
                                }`}>
                                  {transaction.status.charAt(0).toUpperCase() + transaction.status.slice(1)}
                                </Badge>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </div>
                ))}
                
                {/* Display Normal Transactions Grouped by Date */}
                {sortedDates.map(date => (
                  <div key={date}>
                    <h3 className="text-lg font-semibold mb-3 sticky top-0 bg-opacity-80 backdrop-blur-sm py-2 px-1 -mx-1 z-10 bg-gradient-to-r from-blue-500/5 via-green-500/5 to-blue-500/5 dark:from-blue-900/20 dark:via-green-900/20 dark:to-blue-900/20">{format(new Date(date), "MMMM d, yyyy")}</h3>
                    <div className="space-y-3">
                      {/* Only show non-pending transactions in the normal date sections */}
                      {groupedTransactions[date]
                        .filter((transaction) => transaction.status !== 'pending')
                        .map((transaction) => (
                          <Card key={transaction.id} className="border shadow-sm border-gray-200 dark:border-gray-700 flex flex-col">
                            <CardContent className="p-4 flex-grow">
                              <div className="flex justify-between items-start">
                                <div className="flex items-start gap-3">
                                  <div className={`p-2 rounded-full ${
                                    transaction.type === "payment" 
                                      ? "bg-blue-100 dark:bg-blue-900/30" 
                                      : transaction.type === "expense" 
                                        ? "bg-amber-100 dark:bg-amber-900/30" 
                                        : "bg-green-100 dark:bg-green-900/30"
                                  }`}>
                                    {transaction.type === "payment" ? (
                                      <Send className={`h-5 w-5 ${
                                        transaction.fromUserName === "You" 
                                          ? "text-blue-600 dark:text-blue-400" 
                                          : "text-green-600 dark:text-green-400"
                                      }`} />
                                    ) : transaction.type === "expense" ? (
                                      <Receipt className="h-5 w-5 text-amber-600 dark:text-amber-400" />
                                    ) : (
                                      <DollarSign className="h-5 w-5 text-green-600 dark:text-green-400" />
                                    )}
                                  </div>
                                  <div>
                                    <div className="font-medium">{transaction.description}</div>
                                    <div className="flex items-center text-sm text-gray-500 dark:text-gray-400 mt-1">
                                      <Calendar className="h-3.5 w-3.5 mr-1" />
                                      <span>
                                        {format(new Date(transaction.timestamp), "MMM d, yyyy")}
                                        {" · "}
                                        {formatDistanceToNow(new Date(transaction.timestamp))} ago
                                      </span>
                                    </div>
                                    <div className="flex flex-wrap gap-2 mt-2">
                                      <div className="flex items-center text-sm">
                                        <span className="font-medium mr-1">From:</span>
                                        <Avatar className="h-5 w-5 mr-1">
                                          <AvatarFallback className="text-xs">
                                            {transaction.fromUserName.charAt(0)}
                                          </AvatarFallback>
                                        </Avatar>
                                        <span>{transaction.fromUserName}</span>
                                      </div>
                                      <div className="flex items-center text-sm">
                                        <span className="font-medium mr-1">To:</span>
                                        <Avatar className="h-5 w-5 mr-1">
                                          <AvatarFallback className="text-xs">
                                            {transaction.toUserName.charAt(0)}
                                          </AvatarFallback>
                                        </Avatar>
                                        <span>{transaction.toUserName}</span>
                                      </div>
                                    </div>
                                    
                                    {/* Category */}
                                    <div className="mt-2 flex items-center">
                                      <div className="relative inline-block category-menu-container">
                                        {transaction.category ? (
                                          <div 
                                            className="cursor-pointer" 
                                            onClick={(e) => {
                                              e.stopPropagation();
                                              setShowCategoryMenu(showCategoryMenu === transaction.id ? null : transaction.id);
                                            }}
                                          >
                                            <CategoryBadge category={transaction.category} />
                                          </div>
                                        ) : (
                                          <Button 
                                            variant="outline" 
                                            size="sm" 
                                            className="h-6 px-2 text-xs"
                                            onClick={(e) => {
                                              e.stopPropagation();
                                              setShowCategoryMenu(showCategoryMenu === transaction.id ? null : transaction.id);
                                            }}
                                          >
                                            <Tag className="h-3 w-3 mr-1" />
                                            Categorize
                                          </Button>
                                        )}
                                        
                                        {/* Category selection dropdown */}
                                        {showCategoryMenu === transaction.id && (
                                          <div className="absolute top-full left-0 mt-1 z-50 bg-white dark:bg-gray-800 shadow-lg rounded-md border border-gray-200 dark:border-gray-700 p-2 w-48 category-menu-container">
                                            <div className="flex justify-between items-center mb-2 px-2">
                                              <div className="text-xs font-medium text-gray-500 dark:text-gray-400">Select a category</div>
                                              <button 
                                                onClick={(e) => {
                                                  e.stopPropagation();
                                                  setShowCategoryMenu(null);
                                                }}
                                                className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
                                              >
                                                <X className="h-3 w-3" />
                                              </button>
                                            </div>
                                            {getTransactionCategories().map((category) => (
                                              <button
                                                key={category.id}
                                                className="flex items-center gap-2 w-full text-left px-2 py-1.5 text-sm rounded-md hover:bg-gray-100 dark:hover:bg-gray-700"
                                                onClick={(e) => {
                                                  e.stopPropagation();
                                                  handleUpdateCategory(transaction.id, category.id);
                                                }}
                                              >
                                                <CategoryIcon category={category.id} className="h-3.5 w-3.5" />
                                                <span>{category.label}</span>
                                              </button>
                                            ))}
                                          </div>
                                        )}
                                      </div>
                                    </div>
                                  </div>
                                </div>
                                
                                <div className="flex flex-col items-end">
                                  <span className={`font-semibold ${
                                    transaction.fromUserName === "You" 
                                      ? "text-red-600 dark:text-red-400" 
                                      : transaction.toUserName === "You" 
                                        ? "text-green-600 dark:text-green-400" 
                                        : "text-gray-800 dark:text-gray-200"
                                  }`}>
                                    {transaction.fromUserName === "You" 
                                      ? `-$${transaction.amount.toFixed(2)}` 
                                      : transaction.toUserName === "You" 
                                        ? `+$${transaction.amount.toFixed(2)}` 
                                        : `$${transaction.amount.toFixed(2)}`}
                                  </span>
                                  <Badge className={`mt-1 ${
                                    transaction.status === "completed" 
                                      ? "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300" 
                                      : transaction.status === "pending" 
                                        ? "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-300" 
                                        : "bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-300"
                                  }`}>
                                    {transaction.status.charAt(0).toUpperCase() + transaction.status.slice(1)}
                                  </Badge>
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                        ))}
                    </div>

                  </div>
                ))}
              </div>
            ) : (
              <Card className="border border-dashed border-gray-200 dark:border-gray-700">
                <CardContent className="p-6 text-center">
                  <div className="w-12 h-12 bg-gradient-to-r from-blue-500/20 to-green-500/20 rounded-full flex items-center justify-center mx-auto mb-3">
                    <FileText className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                  </div>
                  <h3 className="text-lg font-medium mb-2">No transactions yet</h3>
                  <p className="text-gray-500 dark:text-gray-400 text-sm mb-4">Start making payments or logging expenses</p>
                  <Button 
                    onClick={handleOpenNewPayment}
                    className="bg-gradient-to-r from-blue-500 to-green-500 hover:from-blue-600 hover:to-green-600 text-white"
                  >
                    <Send className="mr-2 h-4 w-4" />
                    Send Money
                  </Button>
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>
      </div>
      
      {/* Payment Dialog */}
      <Dialog open={showPaymentDialog} onOpenChange={setShowPaymentDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Send Payment</DialogTitle>
            <DialogDescription>
              Create a payment to settle your balance.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label htmlFor="recipient">Recipient</Label>
              <Select
                value={selectedRecipientId}
                onValueChange={setSelectedRecipientId}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select recipient" />
                </SelectTrigger>
                <SelectContent>
                  {members.filter(member => member.id !== user?.id).length > 0 ? (
                    members
                      .filter(member => member.id !== user?.id)
                      .map(member => (
                        <SelectItem key={member.id} value={member.id}>
                          {member.name}
                        </SelectItem>
                      ))
                  ) : (
                    <div className="p-2 text-center text-sm text-muted-foreground">
                      No household members found.
                      <Button 
                        variant="link" 
                        className="p-0 h-auto font-normal text-blue-600 dark:text-blue-400"
                        onClick={() => {
                          setShowPaymentDialog(false);
                          // Navigate to profile page where they can invite members
                          window.location.href = '#/profile';
                        }}
                      >
                        Invite someone to your household
                      </Button>
                    </div>
                  )}
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="amount">Amount</Label>
              <div className="relative">
                <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-500" />
                <Input
                  id="amount"
                  value={paymentAmount}
                  onChange={e => setPaymentAmount(e.target.value)}
                  className="pl-9"
                  placeholder="0.00"
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="description">Description (optional)</Label>
              <Input
                id="description"
                value={paymentDescription}
                onChange={e => setPaymentDescription(e.target.value)}
                placeholder="Payment for groceries, etc."
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="category">Category (optional)</Label>
              <Select
                value={selectedCategory}
                onValueChange={value => setSelectedCategory(value as TransactionCategory)}
              >
                <SelectTrigger id="category" className="w-full">
                  <SelectValue placeholder="Select a category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="food" className="flex items-center gap-2">
                    <Utensils className="h-4 w-4" />
                    <span>Food & Dining</span>
                  </SelectItem>
                  <SelectItem value="groceries" className="flex items-center gap-2">
                    <ShoppingCart className="h-4 w-4" />
                    <span>Groceries</span>
                  </SelectItem>
                  <SelectItem value="household" className="flex items-center gap-2">
                    <Home className="h-4 w-4" />
                    <span>Household</span>
                  </SelectItem>
                  <SelectItem value="utilities" className="flex items-center gap-2">
                    <Zap className="h-4 w-4" />
                    <span>Utilities</span>
                  </SelectItem>
                  <SelectItem value="rent" className="flex items-center gap-2">
                    <Building className="h-4 w-4" />
                    <span>Rent & Mortgage</span>
                  </SelectItem>
                  <SelectItem value="transportation" className="flex items-center gap-2">
                    <Car className="h-4 w-4" />
                    <span>Transportation</span>
                  </SelectItem>
                  <SelectItem value="entertainment" className="flex items-center gap-2">
                    <Film className="h-4 w-4" />
                    <span>Entertainment</span>
                  </SelectItem>
                  <SelectItem value="personal" className="flex items-center gap-2">
                    <User className="h-4 w-4" />
                    <span>Personal</span>
                  </SelectItem>
                  <SelectItem value="medical" className="flex items-center gap-2">
                    <Stethoscope className="h-4 w-4" />
                    <span>Medical</span>
                  </SelectItem>
                  <SelectItem value="other" className="flex items-center gap-2">
                    <CircleDot className="h-4 w-4" />
                    <span>Other</span>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <DialogFooter className="flex justify-between sm:justify-between gap-2">
            <Button 
              variant="outline" 
              onClick={() => setShowPaymentDialog(false)}
            >
              Cancel
            </Button>
            <Button 
              onClick={handleSubmitPayment}
              className="bg-gradient-to-r from-blue-500 to-green-500 hover:from-blue-600 hover:to-green-600 text-white"
            >
              <Send className="mr-2 h-4 w-4" />
              Send Payment
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AppLayout>
  );
};

export default LedgerPage; 